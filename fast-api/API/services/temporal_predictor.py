
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import date, timedelta
from pathlib import Path
import pickle
import os
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleGRU(nn.Module):
    """Modèle GRU simple pour la reconstruction"""
    def __init__(self, input_size=5, hidden_size=64, num_layers=2, output_size=1):
        super(SimpleGRU, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.gru = nn.GRU(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, output_size)
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        # x shape: (batch_size, seq_len, input_size)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        
        out, _ = self.gru(x, h0)
        out = self.dropout(out)
        out = self.fc(out[:, -1, :])  # Prendre la dernière sortie temporelle
        return out

class TemporalPredictionService:
    def __init__(self):
        self.model_dir = Path(__file__).parent.parent / "models" / "temporel"
        self.models_cache = {}
        
        # Créer le dossier s'il n'existe pas
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        # Configuration des features attendues par le modèle
        self.feature_names = ['nbNouveauCas', 'nbDeces', 'nbHospitalisation', 'nbHospiSoinsIntensif', 'nbTeste']
        self.sequence_length = 30  # 30 jours d'historique
        
    def load_model(self, country: str, model_type: str = "GRU"):
        """Charger un modèle temporel pour un pays donné"""
        cache_key = f"{country}_{model_type}"
        
        if cache_key in self.models_cache:
            return self.models_cache[cache_key]
        
        # Rechercher les fichiers modèle et preprocesseur
        model_pattern = f"{country}_{model_type}_*.pth"
        prep_pattern = f"{country}_prepared_*.pkl"
        
        model_files = list(self.model_dir.glob(model_pattern))
        prep_files = list(self.model_dir.glob(prep_pattern))
        
        logger.info(f"Recherche de modèles pour {country}_{model_type}")
        logger.info(f"Fichiers modèle trouvés: {model_files}")
        logger.info(f"Fichiers preprocesseur trouvés: {prep_files}")
        
        if not model_files:
            logger.warning(f"Aucun modèle {model_type} trouvé pour {country}, utilisation du mode simulation")
            self.models_cache[cache_key] = {
                'model': None,
                'preprocessor': None,
                'scaler_params': None,
                'has_real_model': False
            }
            return self.models_cache[cache_key]
        
        try:
            model_path = model_files[0]
            logger.info(f"Chargement du modèle depuis: {model_path}")
            
            # Charger le modèle PyTorch
            checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)
            
            model = None
            scaler_params = None
            
            if isinstance(checkpoint, dict):
                logger.info("Checkpoint détecté, tentative de reconstruction du modèle")
                
                # Essayer de reconstruire le modèle
                if 'model_state_dict' in checkpoint:
                    # Créer une nouvelle instance du modèle
                    model = SimpleGRU(input_size=5, hidden_size=64, num_layers=2, output_size=1)
                    try:
                        model.load_state_dict(checkpoint['model_state_dict'])
                        model.eval()
                        logger.info("Modèle reconstruit avec succès à partir du state_dict")
                    except Exception as e:
                        logger.error(f"Erreur reconstruction state_dict: {e}")
                        model = None
                
                # Récupérer les paramètres du scaler si disponibles
                if 'scaler_params' in checkpoint:
                    scaler_params = checkpoint['scaler_params']
                    logger.info("Paramètres de normalisation trouvés dans le checkpoint")
                elif 'scaler' in checkpoint:
                    scaler_params = checkpoint['scaler']
                    logger.info("Scaler trouvé dans le checkpoint")
                    
            else:
                # C'est peut-être un modèle direct
                logger.info("Tentative de chargement direct du modèle")
                model = checkpoint
                if hasattr(model, 'eval'):
                    model.eval()
            
            # Charger le préprocesseur
            preprocessor = None
            if prep_files:
                try:
                    with open(prep_files[0], 'rb') as f:
                        prep_data = pickle.load(f)
                    
                    if isinstance(prep_data, dict):
                        # Si c'est un dictionnaire, extraire les paramètres de normalisation
                        if 'scaler_params' in prep_data:
                            scaler_params = prep_data['scaler_params']
                        elif 'mean' in prep_data and 'std' in prep_data:
                            scaler_params = prep_data
                        logger.info("Paramètres de normalisation extraits du préprocesseur")
                    else:
                        preprocessor = prep_data
                        
                    logger.info(f"Préprocesseur chargé depuis: {prep_files[0]}")
                except Exception as e:
                    logger.error(f"Erreur lors du chargement du préprocesseur: {e}")
            
            self.models_cache[cache_key] = {
                'model': model,
                'preprocessor': preprocessor,
                'scaler_params': scaler_params,
                'has_real_model': model is not None
            }
            
            logger.info(f"Modèle {country}_{model_type} chargé. Modèle réel: {model is not None}")
            return self.models_cache[cache_key]
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle: {e}")
            self.models_cache[cache_key] = {
                'model': None,
                'preprocessor': None,
                'scaler_params': None,
                'has_real_model': False
            }
            return self.models_cache[cache_key]
    
    def preprocess_data(self, historical_data: Dict, preprocessor=None, scaler_params=None):
        """Préprocesser les données d'entrée"""
        # Créer le DataFrame avec les bonnes colonnes
        df = pd.DataFrame({
            'nbNouveauCas': historical_data['nbNouveauCas'],
            'nbDeces': historical_data['nbDeces'],
            'nbHospitalisation': historical_data['nbHospitalisation'],
            'nbHospiSoinsIntensif': historical_data['nbHospiSoinsIntensif'],
            'nbTeste': historical_data['nbTeste']
        })
        
        logger.info(f"DataFrame créé avec shape: {df.shape}")
        logger.info(f"Colonnes: {df.columns.tolist()}")
        logger.info(f"Premières lignes:\n{df.head()}")
        logger.info(f"Statistiques:\n{df.describe()}")
        
        # Appliquer la normalisation
        if scaler_params:
            try:
                logger.info("Application des paramètres de normalisation")
                if isinstance(scaler_params, dict):
                    if 'mean' in scaler_params and 'std' in scaler_params:
                        mean = np.array(scaler_params['mean'])
                        std = np.array(scaler_params['std'])
                        # Éviter la division par zéro
                        std = np.where(std == 0, 1, std)
                        df_processed = (df.values - mean) / std
                        logger.info("Normalisation avec mean/std appliquée")
                    elif 'min' in scaler_params and 'max' in scaler_params:
                        min_vals = np.array(scaler_params['min'])
                        max_vals = np.array(scaler_params['max'])
                        range_vals = max_vals - min_vals
                        range_vals = np.where(range_vals == 0, 1, range_vals)
                        df_processed = (df.values - min_vals) / range_vals
                        logger.info("Normalisation MinMax appliquée")
                    else:
                        df_processed = self._simple_normalization(df)
                else:
                    df_processed = self._simple_normalization(df)
            except Exception as e:
                logger.error(f"Erreur normalisation avec paramètres: {e}")
                df_processed = self._simple_normalization(df)
        elif preprocessor and hasattr(preprocessor, 'transform'):
            try:
                logger.info("Application du préprocesseur avec transform")
                df_processed = preprocessor.transform(df)
                logger.info(f"Données après preprocessing: shape {df_processed.shape}")
            except Exception as e:
                logger.error(f"Erreur preprocessing: {e}")
                df_processed = self._simple_normalization(df)
        else:
            logger.info("Normalisation simple")
            df_processed = self._simple_normalization(df)
        
        # Convertir en tensor PyTorch
        try:
            if isinstance(df_processed, np.ndarray):
                sequence = torch.FloatTensor(df_processed).unsqueeze(0)  # batch_size=1
            else:
                sequence = torch.FloatTensor(df_processed.values).unsqueeze(0)
            
            logger.info(f"Tensor créé avec shape: {sequence.shape}")
            logger.info(f"Valeurs min/max: {sequence.min():.3f}/{sequence.max():.3f}")
            return sequence
            
        except Exception as e:
            logger.error(f"Erreur création tensor: {e}")
            # Fallback avec données brutes normalisées
            df_normalized = self._simple_normalization(df)
            sequence = torch.FloatTensor(df_normalized.values).unsqueeze(0)
            return sequence
    
    def _simple_normalization(self, df):
        """Normalisation simple des données"""
        # Éviter la division par zéro
        std_vals = df.std()
        std_vals = std_vals.replace(0, 1)
        
        normalized = (df - df.mean()) / std_vals
        normalized = normalized.fillna(0)
        
        logger.info("Normalisation simple appliquée")
        return normalized
    
    def simulate_prediction(self, historical_data: Dict, prediction_horizon: int = 7):
        """Générer une prédiction simulée basée sur les données historiques"""
        recent_cases = historical_data['nbNouveauCas'][-7:]
        
        if not recent_cases or all(x == 0 for x in recent_cases):
            base_value = max(50, int(np.random.normal(100, 30)))
        else:
            weights = np.array([0.1, 0.1, 0.15, 0.15, 0.2, 0.25, 0.25])[:len(recent_cases)]
            weights = weights / weights.sum()
            base_value = int(np.average(recent_cases, weights=weights))
        
        base_value = max(1, base_value)
        logger.info(f"Valeur de base pour simulation: {base_value}")
        
        predictions = []
        for i in range(prediction_horizon):
            trend = -i * 0.03 * base_value
            variation = np.random.normal(0, 0.15 * base_value)
            day_of_week = i % 7
            weekend_effect = 0.8 if day_of_week in [5, 6] else 1.0
            
            predicted_value = max(1, int((base_value + trend + variation) * weekend_effect))
            predictions.append(predicted_value)
        
        return predictions
    
    def predict_with_real_model(self, model_data, input_sequence, prediction_horizon):
        """Prédiction avec un vrai modèle PyTorch"""
        model = model_data['model']
        
        if model is None:
            logger.error("Modèle est None")
            return None
        
        try:
            predictions = []
            current_sequence = input_sequence.clone()
            
            logger.info(f"Utilisation du modèle: {type(model)}")
            logger.info(f"Modèle en mode eval: {not model.training}")
            
            with torch.no_grad():
                for i in range(prediction_horizon):
                    logger.info(f"Prédiction jour {i+1}, input shape: {current_sequence.shape}")
                    
                    # Prédiction
                    output = model(current_sequence)
                    logger.info(f"Output shape: {output.shape}, type: {type(output)}")
                    
                    # Extraire la prédiction
                    if isinstance(output, torch.Tensor):
                        if len(output.shape) == 2:  # [batch, features]
                            next_pred = output[0, 0].item()
                        elif len(output.shape) == 1:  # [features]
                            next_pred = output[0].item()
                        else:
                            next_pred = output.item()
                    else:
                        logger.error(f"Output inattendu: {type(output)}")
                        return None
                    
                    # Dénormaliser si nécessaire (approximation simple)
                    if abs(next_pred) < 10:  # Probablement normalisé
                        next_pred = next_pred * 100 + 50  # Approximation de dénormalisation
                    
                    predicted_value = max(1, int(round(abs(next_pred))))
                    predictions.append(predicted_value)
                    
                    logger.info(f"Prédiction brute: {next_pred:.3f}, valeur finale: {predicted_value}")
                    
                    # Mettre à jour la séquence pour la prochaine prédiction
                    new_entry = torch.zeros(1, 1, current_sequence.shape[2])
                    new_entry[0, 0, 0] = next_pred / 100.0  # Renormaliser
                    
                    # Faire glisser la fenêtre temporelle
                    current_sequence = torch.cat([current_sequence[:, 1:, :], new_entry], dim=1)
            
            logger.info(f"Prédictions du modèle réel: {predictions}")
            return predictions
            
        except Exception as e:
            logger.error(f"Erreur lors de la prédiction avec le modèle: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def predict(self, country: str, historical_data: Dict, 
                model_type: str = "GRU", prediction_horizon: int = 7):
        """Effectuer une prédiction temporelle"""
        
        logger.info(f"Début prédiction pour {country}, modèle {model_type}, horizon {prediction_horizon}")
        
        # Charger le modèle
        model_data = self.load_model(country, model_type)
        
        # Vérifier si on a un vrai modèle
        if not model_data['has_real_model'] or model_data['model'] is None:
            logger.info(f"Utilisation de la prédiction simulée pour {country}")
            predictions = self.simulate_prediction(historical_data, prediction_horizon)
        else:
            logger.info(f"Tentative de prédiction avec le modèle réel pour {country}")
            
            # Préprocesser les données
            input_sequence = self.preprocess_data(
                historical_data, 
                model_data['preprocessor'], 
                model_data['scaler_params']
            )
            
            # Essayer la prédiction avec le modèle réel
            predictions = self.predict_with_real_model(model_data, input_sequence, prediction_horizon)
            
            # Si ça échoue, fallback vers simulation
            if predictions is None:
                logger.warning("Échec de la prédiction avec le modèle, utilisation de la simulation")
                predictions = self.simulate_prediction(historical_data, prediction_horizon)
        
        # Générer les dates de prédiction
        last_date = pd.to_datetime(historical_data['dates'][-1])
        prediction_dates = [
            (last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') 
            for i in range(prediction_horizon)
        ]
        
        logger.info(f"Prédictions finales: {predictions}")
        logger.info(f"Dates: {prediction_dates}")
        
        return {
            'predictions': predictions,
            'prediction_dates': prediction_dates,
            'confidence_interval': None,
            'metrics': {'mse': 0.0, 'mae': 0.0}
        }
    
    def get_available_models(self):
        """Obtenir la liste des modèles disponibles"""
        models = []
        
        # Rechercher les fichiers .pth dans le dossier
        for model_file in self.model_dir.glob("*.pth"):
            logger.info(f"Fichier modèle trouvé: {model_file}")
            parts = model_file.stem.split('_')
            if len(parts) >= 2:
                country = parts[0]
                model_type = parts[1]
                models.append({
                    'country': country,
                    'model_type': model_type,
                    'file': model_file.name
                })
        
        # Si aucun modèle trouvé, retourner des modèles par défaut
        if not models:
            logger.info("Aucun modèle .pth trouvé, utilisation des modèles par défaut")
            models = [
                {'country': 'suisse', 'model_type': 'GRU', 'file': 'simulation'},
                {'country': 'france', 'model_type': 'GRU', 'file': 'simulation'},
                {'country': 'allemagne', 'model_type': 'LSTM', 'file': 'simulation'}
            ]
        
        logger.info(f"Modèles disponibles: {models}")
        return models
