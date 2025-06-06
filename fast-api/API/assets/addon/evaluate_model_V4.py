import os
import glob
import yaml
import pickle
import json
import torch
import random
import numpy as np
import matplotlib.pyplot as plt
import torch.nn as nn
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from torch.utils.data import TensorDataset, DataLoader

# 1. Config
script_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(script_dir, "config_V4.yaml"), "r") as f:
    cfg = yaml.safe_load(f)

paths       = cfg['paths']
os.makedirs(paths['figures_dir'], exist_ok=True)
feat        = cfg['features']['target']
rc          = cfg['data_selection']
train_size  = cfg['split']['train_size']
output_w    = cfg['forecasting']['output_window']
input_window     = cfg['forecasting']['input_window']
output_window    = cfg['forecasting']['output_window']
# 2. Seeds
seed = cfg.get('random_seed', 42)
random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 3. Charger le .pkl préparé
prep_dir = paths['prepared_data_dir']
pattern  = (f"{rc['single_country'].lower()}_prepared_*.pkl"
            if rc.get('single_country') else "prepared_data_*.pkl")
pkls = sorted(glob.glob(os.path.join(prep_dir, pattern)), key=os.path.getmtime, reverse=True)
if not pkls:
    raise FileNotFoundError(f"Aucun .pkl avec pattern {pattern}")
with open(pkls[0], "rb") as f:
    data_all = pickle.load(f)

# 4. Définitions des modèles
class TSModel(nn.Module):
    def __init__(self, typ, in_sz, hid, nl, do, out_w):
        super().__init__()
        if typ.upper() == "LSTM":
            R = nn.LSTM
        elif typ.upper() == "GRU":
            R = nn.GRU
        else:
            R = nn.RNN
        self.rnn  = R(in_sz, hid, nl, dropout=do, batch_first=True)
        self.proj = nn.Linear(hid, out_w)
    def forward(self, x):
        out, _ = self.rnn(x)
        return self.proj(out[:, -1, :])

class TCNNModel(nn.Module):
    def __init__(self, in_sz, out_w):
        super().__init__()
        self.conv1 = nn.Conv1d(in_sz, 64, kernel_size=3, padding=1)
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
        x = self.input_proj(x)
        y = self.transformer(x)
        return self.output_proj(y[:, -1, :])

# SMAPE pour l’évaluation
def smape(y_true, y_pred):
    denom = (np.abs(y_true) + np.abs(y_pred))
    diff  = np.abs(y_true - y_pred)
    return np.mean(2 * diff / np.where(denom==0, 1, denom)) * 100

# 5. Évaluation
eval_metrics = {}

for country, dat in data_all.items():
    X       = dat['X']
    y       = dat['y']
    dates   = dat['dates']  # array of np.datetime64
    tgt_sc  = dat['target_scaler']

    # split validation
    split_idx = dat.get('split_idx', int(len(X) * train_size))
    X_val     = X[split_idx:]
    y_val     = y[split_idx:]
    dates_val = dates[split_idx:]

    # inversion SCALER -> expm1 ; reshape en matrix [n_samples, output_w]
    y_scaled = y_val.reshape(-1,1)
    y_unscaled = tgt_sc.inverse_transform(y_scaled)
    y_true_all = np.expm1(y_unscaled).reshape(-1, output_w)

    for m_cfg in cfg['models']:
        if not m_cfg.get('use', False):
            continue
        name = m_cfg['name']

        # charger best_params
        mets = sorted(glob.glob(os.path.join(paths['metrics_dir'],
                                             f"{country}_{name}_metrics_*.json")),
                      key=os.path.getmtime, reverse=True)
        if not mets:
            raise FileNotFoundError(f"Aucun metrics pour {country}_{name}")
        with open(mets[0], 'r') as f:
            meta = json.load(f)

        # charger modèle
        pths = sorted(glob.glob(os.path.join(paths['models_dir'],
                                             f"{country}_{name}_*.pth")),
                      key=os.path.getmtime, reverse=True)
        if not pths:
            raise FileNotFoundError(f"Aucun .pth pour {country}_{name}")
        state_file = pths[0]

        # instanciation
        if name == "TCNN":
            model = TCNNModel(X.shape[2], output_w)
        elif name == "NBEATS":
            bp = meta['best_params']
            model = NBEATSModel(input_window, output_w,
                                bp['stack_types'],
                                int(bp['nb_blocks_per_stack']),
                                int(bp['layer_width']))
        elif name == "TransformerTS":
            bp = meta['best_params']
            model = TransformerTSModel(
                input_window,
                X.shape[2],
                d_model=int(bp['d_model']),
                n_heads=int(bp['n_heads']),
                num_layers=int(bp['num_layers']),
                dim_feedforward=int(bp['dim_feedforward']),
                dropout=float(bp['dropout']),
                output_window=y.shape[1]
            )
        else:
            bp = meta['best_params']
            model = TSModel(name,
                            X.shape[2],
                            int(bp.get('hidden_size', 0)),
                            int(bp.get('num_layers', 1)),
                            float(bp.get('dropout', 0.0)),
                            output_w)
        model.load_state_dict(torch.load(state_file, map_location=device))
        model.to(device).eval()

        # prédiction
        with torch.no_grad():
            pred_scaled = model(torch.tensor(X_val, dtype=torch.float32).to(device)).cpu().numpy()
        y_pred_unscaled = tgt_sc.inverse_transform(pred_scaled.reshape(-1,1))
        y_pred_all = np.expm1(y_pred_unscaled).reshape(-1, output_w)

        # calcul GLOBAL (flatten)
        y_true_flat = y_true_all.flatten()
        y_pred_flat = y_pred_all.flatten()

        mse_g  = mean_squared_error(y_true_flat, y_pred_flat)
        mae_g  = mean_absolute_error(y_true_flat, y_pred_flat)
        r2_g   = r2_score(y_true_flat, y_pred_flat)
        rmse_g = np.sqrt(mse_g)
        smap_g = smape(y_true_flat, y_pred_flat)
        err_g  = y_pred_flat - y_true_flat
        std_g  = np.std(err_g)  # incertitude globale

        # métriques par horizon
        per_horiz = {}
        for h in range(output_w):
            yt = y_true_all[:, h]
            yp = y_pred_all[:, h]
            err = yp - yt
            per_horiz[f"t+{h+1}"] = {
                'MSE': mean_squared_error(yt, yp),
                'MAE': mean_absolute_error(yt, yp),
                'RMSE': np.sqrt(mean_squared_error(yt, yp)),
                'R2': r2_score(yt, yp),
                'SMAPE': smape(yt, yp),
                'STD_ERR': float(np.std(err))
            }

        # tracés pour t+1 et t+7
        for h in [0, output_w-1]:
            y_t = y_true_all[:, h]
            y_p = y_pred_all[:, h]
            # dates alignées ; décalage pour t+7
            if h == output_w-1:
                dates_h = dates_val + np.timedelta64(h, 'D')
                label_h = f"t+{h+1}"
            else:
                dates_h = dates_val
                label_h = "t+1"

            plt.figure(figsize=(10,4))
            plt.plot(dates_h, y_t, '-o', label="Réel")
            plt.plot(dates_h, y_p, '--x', label="Prédit")
            plt.title(f"{country} | {name} {label_h}")
            plt.xlabel("Date"); plt.ylabel(feat)
            plt.legend(); plt.tight_layout()
            fname = f"{country}_{name}_ts_{label_h}.png"
            plt.savefig(os.path.join(paths['figures_dir'], fname))
            plt.close()
            
            if h == 0:
            # calcul des résidus t+1
                resid = y_p - y_t

            # 2) Scatter réel vs prédit (t+1)
                plt.figure(figsize=(6,6))
                plt.scatter(y_t, y_p, alpha=0.5)
                m = max(y_t.max(), y_p.max())
                plt.plot([0, m], [0, m], '--k')
                plt.title(f"{country} | {name} scatter t+1")
                plt.xlabel("Réel"); plt.ylabel("Prédit"); plt.tight_layout()
                plt.savefig(os.path.join(paths['figures_dir'], f"{country}_{name}_scatter_t1.png"))
                plt.close()

            # 3) Histogramme des résidus
                plt.figure(figsize=(6,4))
                plt.hist(resid, bins=30, edgecolor='black')
                plt.title(f"{country} | {name} hist résidus t+1")
                plt.xlabel("Erreur (prédit - réel)"); plt.ylabel("Fréquence")
                plt.tight_layout()
                plt.savefig(os.path.join(paths['figures_dir'], f"{country}_{name}_hist_resid_t1.png"))
                plt.close()

            # 4) Boxplot des résidus
                plt.figure(figsize=(4,6))
                plt.boxplot(resid, vert=True)
                plt.title(f"{country} | {name} boxplot résidus t+1")
                plt.ylabel("Erreur")
                plt.tight_layout()
                plt.savefig(os.path.join(paths['figures_dir'], f"{country}_{name}_box_resid_t1.png"))
                plt.close()

            # 5) Erreur en fonction du temps
                plt.figure(figsize=(10,4))
                plt.plot(dates_h, resid, '-o', alpha=0.6)
                plt.axhline(0, color='k', linestyle='--')
                plt.title(f"{country} | {name} résidus dans le temps t+1")
                plt.xlabel("Date"); plt.ylabel("Erreur"); plt.tight_layout()
                plt.savefig(os.path.join(paths['figures_dir'], f"{country}_{name}_resid_time_t1.png"))
                plt.close()

        # stockage des résultats
        eval_metrics[f"{country}_{name}"] = {
            'global': {
                'MSE': mse_g, 'MAE': mae_g, 'RMSE': rmse_g,
                'R2': r2_g, 'SMAPE': smap_g, 'STD_ERR': float(std_g)
            },
            'by_horizon': per_horiz
        }

# 6. Sauvegarde JSON des métriques d’évaluation
out_file = os.path.join(paths['metrics_dir'],
                        f"{rc.get('single_country','all')}_evaluation_summary.json")
with open(out_file, 'w') as f:
    json.dump(eval_metrics, f, indent=2)
print(f"[evaluate] Métriques d'évaluation enregistrées dans : {out_file}")
