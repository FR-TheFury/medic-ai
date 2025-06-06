import os
import glob
import yaml
import pickle
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import optuna
from optuna import TrialPruned
from sklearn.model_selection import TimeSeriesSplit
import random
import numpy as np
from datetime import datetime
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
# 0. Seeds & déterminisme
seed = 42
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(seed)
torch.use_deterministic_algorithms(True)
torch.backends.cudnn.benchmark = False
torch.backends.cudnn.deterministic = True

# utilitaire versionnage
def unique_path(path: str) -> str:
    base, ext = os.path.splitext(path)
    c = 1
    while os.path.exists(path):
        path = f"{base}_{c}{ext}"
        c += 1
    return path

# 1. Chargement config
script_dir      = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(script_dir, "config_V4.yaml"), "r") as f:
    cfg = yaml.safe_load(f)

prep_dir        = cfg['paths']['prepared_data_dir']
models_dir      = cfg['paths']['models_dir']
metrics_dir     = cfg['paths']['metrics_dir']
n_trials        = cfg['optuna']['n_trials']
direction       = cfg['optuna']['direction']
models_cfg      = [m for m in cfg['models'] if m.get('use', False)]
selected_country= cfg['data_selection'].get('single_country', None)
cv_splits       = cfg.get('cv_splits', 3)
input_window    = cfg['forecasting']['input_window']
train_size      = cfg['split']['train_size']
device          = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
input_window     = cfg['forecasting']['input_window']
output_window    = cfg['forecasting']['output_window']

# 2. Charger dernier .pkl
pkls = sorted(glob.glob(os.path.join(prep_dir, "*.pkl")),
              key=os.path.getmtime, reverse=True)
if not pkls:
    raise FileNotFoundError(f"Aucun .pkl dans {prep_dir}")
with open(pkls[0], 'rb') as f:
    data_dict = pickle.load(f)
if selected_country:
    key = selected_country.lower()
    data_dict = {key: data_dict[key]}

os.makedirs(models_dir, exist_ok=True)
os.makedirs(metrics_dir, exist_ok=True)

# 3. Modèles
class TimeSeriesModel(nn.Module):
    def __init__(self, rnn_type, inp_sz, hid, nl, do, out_w):
        super().__init__()
        if rnn_type.upper() == "LSTM":
            R = nn.LSTM
        elif rnn_type.upper() == "GRU":
            R = nn.GRU
        else:
            R = nn.RNN
        self.rnn  = R(inp_sz, hid, nl, dropout=do, batch_first=True)
        self.proj = nn.Linear(hid, out_w)
    def forward(self, x):
        out, _ = self.rnn(x)
        return self.proj(out[:, -1, :])

class TCNNModel(nn.Module):
    def __init__(self, inp_sz, out_w):
        super().__init__()
        self.conv1 = nn.Conv1d(inp_sz, 64, kernel_size=3, padding=1)
        self.relu  = nn.ReLU()
        self.pool  = nn.AdaptiveAvgPool1d(1)
        self.fc    = nn.Linear(64, out_w)
    def forward(self, x):
        x = x.transpose(1, 2)
        x = self.relu(self.conv1(x))
        x = self.pool(x).squeeze(-1)
        return self.fc(x)
    
class NBEATSBlock(nn.Module):
    def __init__(self, input_size, theta_size, hidden_size, n_layers):
        super().__init__()
        layers = []
        for _ in range(n_layers):
            layers += [nn.Linear(input_size, hidden_size), nn.ReLU()]
            input_size = hidden_size
        layers += [nn.Linear(hidden_size, theta_size)]
        self.net = nn.Sequential(*layers)
    def forward(self, x):
        return self.net(x)

class NBEATSModel(nn.Module):
    def __init__(self, input_window, output_window, 
                 stack_types, nb_blocks, layer_width):
        super().__init__()
        self.input_window = input_window
        self.output_window = output_window
        self.blocks = nn.ModuleList()
        for _ in range(nb_blocks):
            # ici on ignore stack_types pour simplifier
            self.blocks.append(
                NBEATSBlock(input_window, output_window, layer_width, n_layers=2)
            )
    def forward(self, x):
        # x: (B, T, F) → on aplatie temporellement
        inp = x[:, :, -1]  # on prend la target feature
        y = 0
        for b in self.blocks:
            y = y + b(inp)
        return y  # (B, output_window)

class TransformerTSModel(nn.Module):
    def __init__(self, input_window, num_features, d_model, n_heads,
                 num_layers, dim_feedforward, dropout, output_window):
        super().__init__()
        self.input_window = input_window
        self.src_mask = None
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=dim_feedforward,
            dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.input_proj  = nn.Linear(num_features, d_model)
        self.output_proj = nn.Linear(d_model, output_window)

    def forward(self, x):
        # x: (B, T, F) → projet en (B, T, d_model)
        x = self.input_proj(x)
        # transformer expects (B, T, d_model) when batch_first=True
        y = self.transformer(x, mask=self.src_mask)
        # on prend la dernière position temporelle
        return self.output_proj(y[:, -1, :])

# 4. SMAPE
def smape(y_true, y_pred):
    denom = (np.abs(y_true) + np.abs(y_pred))
    diff  = np.abs(y_true - y_pred)
    return np.mean(2 * diff / np.where(denom==0, 1, denom)) * 100

# 5. Objective avec CV temps et gap
def get_objective(m_cfg, X_tr, y_tr):
    tscv = TimeSeriesSplit(n_splits=cv_splits)
    def objective(trial):
        # 5.1. suggestion hyperparams
        params = {}
        for hp, space in m_cfg['hyperparameters'].items():
            if 'values' in space:
                params[hp] = trial.suggest_categorical(hp, space['values'])
            else:
                lo, hi = space['low'], space['high']
                if isinstance(lo, int):
                    params[hp] = trial.suggest_int(hp, lo, hi)
                else:
                    params[hp] = trial.suggest_float(hp, lo, hi, log=space.get('log', False))
        if m_cfg['name']=="TransformerTS":
            d_model = int(params['d_model']); n_heads=int(params['n_heads'])
            if d_model % n_heads != 0:
                raise TrialPruned()       
                    
        lr = params.get('learning_rate', 1e-3)
        bs = int(params.get('batch_size', 32))
        hid= int(params.get('hidden_size', 16))
        nl = int(params.get('num_layers', 1))
        do = float(params.get('dropout', 0.0))
        epochs = int(params.get('epochs', 20))

        fold_losses = []
        for fold_id, (train_idx, val_idx) in enumerate(tscv.split(X_tr)):
            # 5.2. purge gap pour éviter fuite
            val_start = val_idx.min()
            train_idx = train_idx[train_idx < val_start - input_window]

            X_train, X_val = X_tr[train_idx], X_tr[val_idx]
            y_train, y_val = y_tr[train_idx], y_tr[val_idx]

            loader = DataLoader(
                TensorDataset(
                    torch.tensor(X_train, dtype=torch.float32),
                    torch.tensor(y_train, dtype=torch.float32)
                ),
                batch_size=bs, shuffle=False
            )

            # 5.3. instanciation modèle
            if m_cfg['name'] == "TCNN":
                model = TCNNModel(X_tr.shape[2], y_tr.shape[1])
            elif m_cfg['name'] == "NBEATS":
    # récupérer params spécifiques
                stack = params['stack_types']
                nblk  = int(params['nb_blocks_per_stack'])
                width = int(params['layer_width'])
                model = NBEATSModel(input_window, output_window, stack, nblk, width)
            elif m_cfg['name'] == "TransformerTS":
                model = TransformerTSModel(
                    input_window,
                    X_tr.shape[2],
                    d_model=int(params['d_model']),
                    n_heads=int(params['n_heads']),
                    num_layers=int(params['num_layers']),
                    dim_feedforward=int(params['dim_feedforward']),
                    dropout=float(params['dropout']),
                    output_window=y_tr.shape[1]
                )
            else:
                model = TimeSeriesModel(m_cfg['name'],
                                        X_tr.shape[2], hid, nl, do, y_tr.shape[1])
            model.to(device)
            optimizer = torch.optim.Adam(model.parameters(), lr=lr)
            loss_fn   = nn.MSELoss()

            # 5.4. entraînement
            model.train()
            best_val_loss = float('inf')
            patience_counter = 0
            patience = 10  # Nombre d'époques sans amélioration avant arrêt
            best_model_state = None

# Préparer données de validation pour early stopping
            val_loader_es = DataLoader(
                TensorDataset(
                    torch.tensor(X_val, dtype=torch.float32),
                    torch.tensor(y_val, dtype=torch.float32)
                ),
                batch_size=bs, shuffle=False
            )

            for epoch in range(epochs):
            # Phase d'entraînement
                model.train()
                train_loss = 0
                for xb, yb in loader:
                    xb, yb = xb.to(device), yb.to(device)
                    optimizer.zero_grad()
                    loss = loss_fn(model(xb), yb)
                    loss.backward()
                    optimizer.step()
                    train_loss += loss.item()
    
            # Phase de validation pour early stopping
                model.eval()
                val_loss_es = 0
                with torch.no_grad():
                    for xb_val, yb_val in val_loader_es:
                        xb_val, yb_val = xb_val.to(device), yb_val.to(device)
                        pred_val = model(xb_val)
                        val_loss_es += loss_fn(pred_val, yb_val).item()
    
                val_loss_es /= len(val_loader_es)
    
                # Logique early stopping
                if val_loss_es < best_val_loss:
                    best_val_loss = val_loss_es
                    patience_counter = 0
                    best_model_state = model.state_dict().copy()
                else:
                    patience_counter += 1
    
            # Arrêt si pas d'amélioration
                if patience_counter >= patience:
                    print(f"Early stopping à l'époque {epoch+1}/{epochs}")
                    break

    # Restaurer les meilleurs poids
                if best_model_state is not None:
                    model.load_state_dict(best_model_state)


            # 5.5. évaluation fold (même loss_fn)
            model.eval()
            with torch.no_grad():
                pred = model(torch.tensor(X_val, dtype=torch.float32).to(device))
                val_loss = loss_fn(pred, torch.tensor(y_val, dtype=torch.float32).to(device)).item()

            # 5.6. pruning
            trial.report(val_loss, fold_id)
            if trial.should_prune():
                raise TrialPruned()

            fold_losses.append(val_loss)

        return float(np.mean(fold_losses))
    return objective

# 6. Boucle entraînement + Optuna + évaluation sur test set
for country, dat in data_dict.items():
    X, y = dat['X'], dat['y']
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    # 6.1. split train / test pour éval finale
    split_idx   = int(len(X) * train_size)
    X_tr_full   = X[:split_idx]
    y_tr_full   = y[:split_idx]
    X_test      = X[split_idx:]
    y_test      = y[split_idx:]

    for m_cfg in models_cfg:
        # 6.2. création de l’étude avec pruning
        study = optuna.create_study(
            direction=direction,
            sampler=optuna.samplers.TPESampler(seed=seed),
            pruner=optuna.pruners.MedianPruner(
                n_startup_trials=5,
                n_warmup_steps=0,
                interval_steps=1
            )
        )
        objective = get_objective(m_cfg, X_tr_full, y_tr_full)
        study.optimize(objective, n_trials=n_trials, catch=(TrialPruned, AssertionError))

        best = study.best_params

        # 6.3. ré-entraînement final sur X_tr_full
        bs = int(best.get('batch_size', 32))
        hid= int(best.get('hidden_size', 16))
        nl = int(best.get('num_layers', 1))
        do = float(best.get('dropout', 0.0))
        lr = best.get('learning_rate', 1e-3)
        epochs = int(best.get('epochs', 20))

        loader = DataLoader(
            TensorDataset(
                torch.tensor(X_tr_full, dtype=torch.float32),
                torch.tensor(y_tr_full, dtype=torch.float32)
            ),
            batch_size=bs, shuffle=False
        )
        if m_cfg['name'] == "TCNN":
            model = TCNNModel(X.shape[2], y.shape[1])
        elif m_cfg['name'] == "NBEATS":
            model = NBEATSModel(input_window, output_window,
                                best.get('stack_types'),
                                int(best.get('nb_blocks_per_stack')),
                                int(best.get('layer_width')))
        elif m_cfg['name'] == "TransformerTS":
            model = TransformerTSModel(
                input_window,
                X.shape[2],
                d_model=int(best['d_model']),
                n_heads=int(best['n_heads']),
                num_layers=int(best['num_layers']),
                dim_feedforward=int(best['dim_feedforward']),
                dropout=float(best['dropout']),
                output_window=y.shape[1]
            )
        else:
            model = TimeSeriesModel(m_cfg['name'], X.shape[2], hid, nl, do, y.shape[1])
        model.to(device)
        optimizer = torch.optim.Adam(model.parameters(), lr=lr)
        loss_fn   = nn.MSELoss()

        val_split = 0.1
        val_size = int(len(X_tr_full) * val_split)
        X_train_es = X_tr_full[:-val_size] if val_size > 0 else X_tr_full
        y_train_es = y_tr_full[:-val_size] if val_size > 0 else y_tr_full
        X_val_es = X_tr_full[-val_size:] if val_size > 0 else X_tr_full[-10:]  # Au moins 10 échantillons
        y_val_es = y_tr_full[-val_size:] if val_size > 0 else y_tr_full[-10:]

        # Loaders pour entraînement final
        train_loader_final = DataLoader(
            TensorDataset(
                torch.tensor(X_train_es, dtype=torch.float32),
                torch.tensor(y_train_es, dtype=torch.float32)
            ),
            batch_size=bs, shuffle=False
        )

        val_loader_final = DataLoader(
            TensorDataset(
                torch.tensor(X_val_es, dtype=torch.float32),
                torch.tensor(y_val_es, dtype=torch.float32)
            ),
            batch_size=bs, shuffle=False
        )

        # Entraînement final avec early stopping
        model.train()
        best_val_loss_final = float('inf')
        patience_counter_final = 0
        patience_final = 15  # Plus de patience pour l'entraînement final
        best_model_state_final = None

        for epoch in range(epochs):
            # Phase d'entraînement
            model.train()
            for xb, yb in train_loader_final:
                xb, yb = xb.to(device), yb.to(device)
                optimizer.zero_grad()
                loss_fn(model(xb), yb).backward()
                optimizer.step()
    
            # Phase de validation
            model.eval()
            val_loss_final = 0
            with torch.no_grad():
                for xb_val, yb_val in val_loader_final:
                    xb_val, yb_val = xb_val.to(device), yb_val.to(device)
                    pred_val = model(xb_val)
                    val_loss_final += loss_fn(pred_val, yb_val).item()
    
            val_loss_final /= len(val_loader_final)
    
            # Logique early stopping
            if val_loss_final < best_val_loss_final:
                best_val_loss_final = val_loss_final
                patience_counter_final = 0
                best_model_state_final = model.state_dict().copy()
            else:
                patience_counter_final += 1
    
            if patience_counter_final >= patience_final:
                print(f"Early stopping final à l'époque {epoch+1}/{epochs}")
                break

        # Restaurer les meilleurs poids pour l'entraînement final
        if best_model_state_final is not None:
            model.load_state_dict(best_model_state_final)
                
        # --- sauvegarde du modèle entraîné ---
        mpath = unique_path(os.path.join(models_dir, f"{country}_{m_cfg['name']}_{ts}.pth"))
        torch.save(model.state_dict(), mpath)
        print(f"[train_model] Modèle sauvegardé → {mpath}")
        # --- fin sauvegarde modèle ---

        # 6.4. évaluation finale sur X_test
        model.eval()
        with torch.no_grad():
            pred_test = model(torch.tensor(X_test, dtype=torch.float32).to(device)).cpu().numpy()

        mse   = mean_squared_error(y_test.flatten(), pred_test.flatten())
        mae   = mean_absolute_error(y_test.flatten(), pred_test.flatten())
        r2    = r2_score(y_test.flatten(), pred_test.flatten())
        rmse  = np.sqrt(mse)
        smap  = smape(y_test.flatten(), pred_test.flatten())

        metrics = {
            'MSE': mse, 'RMSE': rmse, 'MAE': mae, 'R2': r2, 'SMAPE': smap,
            'best_params': best
        }
        jpath = unique_path(os.path.join(metrics_dir,
                                          f"{country}_{m_cfg['name']}_metrics_{ts}.json"))
        with open(jpath, 'w') as f:
            json.dump(metrics, f, indent=2)

        print(f"[train_model] {country}|{m_cfg['name']} → modèle : {mpath}, métriques : {jpath}")