import os
import yaml
import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import RobustScaler
from datetime import datetime
import random, torch

# 0. Fixer le seed (reproductibilité)
seed = 42
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)

# 1. Chargement de la configuration
script_dir   = os.path.dirname(os.path.abspath(__file__))
config_path  = os.path.join(script_dir, "config_V4.yaml")
with open(config_path, "r") as f:
    cfg = yaml.safe_load(f)

raw_path         = cfg['paths']['raw_data']
prepared_dir     = cfg['paths']['prepared_data_dir']
selected_country = cfg['data_selection'].get('single_country', None)
countries        = cfg['data_selection']['countries']
date_start       = pd.to_datetime(cfg['data_selection']['date_range']['start'])
date_end         = pd.to_datetime(cfg['data_selection']['date_range']['end'])
input_window     = cfg['forecasting']['input_window']
output_window    = cfg['forecasting']['output_window']
feat_cols        = cfg['features']['input']
target_col       = cfg['features']['target']

# utilitaire pour ne pas écraser
def unique_path(path: str) -> str:
    base, ext = os.path.splitext(path)
    c = 1
    while os.path.exists(path):
        path = f"{base}_{c}{ext}"
        c += 1
    return path

# 2. Lecture et filtrage
df = pd.read_csv(raw_path, parse_dates=['dateReleve'])
df = df[(df.dateReleve >= date_start) & (df.dateReleve <= date_end)].copy()
df = df.sort_values(['nomPays', 'dateReleve']).reset_index(drop=True)

# 2.1. Création des features temporelles
df['dayofweek'] = df['dateReleve'].dt.dayofweek
df['month']     = df['dateReleve'].dt.month
df['dow_sin']   = np.sin(2 * np.pi * df['dayofweek'] / 7)
df['dow_cos']   = np.cos(2 * np.pi * df['dayofweek'] / 7)
df['mon_sin']   = np.sin(2 * np.pi * df['month'] / 12)
df['mon_cos']   = np.cos(2 * np.pi * df['month'] / 12)

# 2.2. Lags sur la cible (t-1, t-7)
lag_cols = []
for lag in cfg['features']['lags']:
    col = f'lag{lag}'
    df[col] = df.groupby('nomPays')[target_col].shift(lag)
    lag_cols.append(col)

# suppression des premiers jours où lag1/lag7 = NaN
df = df.dropna(subset=lag_cols).reset_index(drop=True)

if selected_country:
    sc = selected_country.lower()
    if sc not in [c.lower() for c in countries]:
        raise ValueError(f"Pays '{selected_country}' inconnu.")
    countries = [sc]

# 3. Préparation par pays
data_dict = {}
for country in countries:
    sub = df[df.nomPays.str.lower() == country.lower()].copy()
    if sub.empty:
        continue

    # log1p sur la target
    sub[target_col] = np.log1p(sub[target_col].values)

    train_size = cfg.get('split', {}).get('train_size', 0.8)
    split_idx = int(len(sub) * train_size)
    
    # Séparation des données pour l'entraînement uniquement
    train_data = sub.iloc[:split_idx]
    
    # Initialiser et ajuster les scalers UNIQUEMENT sur les données d'entraînement
    input_scaler = RobustScaler(quantile_range=(1, 99))
    target_scaler = RobustScaler(quantile_range=(1, 99))
    
    input_scaler.fit(train_data[feat_cols + lag_cols].values)
    target_scaler.fit(train_data[[target_col]].values)
    
    # Maintenant transformer TOUTES les données avec les scalers ajustés sur train
    inputs_scaled = input_scaler.transform(sub[feat_cols + lag_cols].values)
    target_scaled = target_scaler.transform(sub[[target_col]].values)

    arr = np.hstack([inputs_scaled, target_scaled])

    # découpage glissant
    X, y = [], []
    for i in range(len(arr) - input_window - output_window + 1):
        X.append(arr[i : i + input_window, :-1])
        y.append(arr[i + input_window : i + input_window + output_window, -1])
    X = np.array(X)
    y = np.array(y)

    # dates alignées aux échantillons
    dates_all    = sub['dateReleve'].values
    sample_dates = dates_all[input_window : len(dates_all) - output_window + 1]
    
    train_samples = split_idx - input_window - output_window + 1
    if train_samples <= 0:
        print(f"ATTENTION: Pas assez de données pour {country} avec la fenêtre choisie")
        train_samples = max(1, len(X) // 2)  

    data_dict[country] = {
        'X': X,
        'y': y,
        'input_scaler': input_scaler,
        'target_scaler': target_scaler,
        'dates': sample_dates
    }

# 4. Sauvegarde
os.makedirs(prepared_dir, exist_ok=True)
ts = datetime.now().strftime("%Y%m%d_%H%M%S")

if not selected_country:
    p_all = unique_path(os.path.join(prepared_dir, f"prepared_data_{ts}.pkl"))
    with open(p_all, 'wb') as f:
        pickle.dump(data_dict, f)
    print(f"[prepare_data] global → {p_all}")

for country, ds in data_dict.items():
    p_c = unique_path(os.path.join(prepared_dir, f"{country}_prepared_{ts}.pkl"))
    with open(p_c, 'wb') as f:
        pickle.dump({country: ds}, f)
    print(f"[prepare_data] {country} → {p_c}")
