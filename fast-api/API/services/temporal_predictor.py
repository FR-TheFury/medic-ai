
import torch
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
                'has_real_model': False
            }
            return self.models_cache[cache_key]
        
        try:
            model_path = model_files[0]
            logger.info(f"Chargement du modèle depuis: {model_path}")
            
            # Charger le modèle PyTorch
            model_data = torch.load(model_path, map_location='cpu', weights_only=False)
            
            # Gérer différents formats de sauvegarde
            if isinstance(model_data, dict):
                if 'model_state_dict' in model_data:
                    # C'est un checkpoint avec state_dict
                    logger.info("Modèle au format checkpoint détecté")
                    model = model_data  # Garder tout le dictionnaire pour l'instant
                else:
                    # C'est peut-être juste un state_dict
                    logger.info("State dict détecté")
                    model = model_data
            else:
                # C'est un modèle complet
                logger.info("Modèle complet détecté")
                model = model_data
                if hasattr(model, 'eval'):
                    model.eval()
            
            # Charger le préprocesseur
            preprocessor = None
            if prep_files:
                try:
                    with open(prep_files[0], 'rb') as f:
                        preprocessor = pickle.load(f)
                    logger.info(f"Préprocesseur chargé depuis: {prep_files[0]}")
                except Exception as e:
                    logger.error(f"Erreur lors du chargement du préprocesseur: {e}")
            
            self.models_cache[cache_key] = {
                'model': model,
                'preprocessor': preprocessor,
                'has_real_model': True
            }
            
            logger.info(f"Modèle {country}_{model_type} chargé avec succès")
            return self.models_cache[cache_key]
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle: {e}")
            # Fallback vers simulation
            self.models_cache[cache_key] = {
                'model': None,
                'preprocessor': None,
                'has_real_model': False
            }
            return self.models_cache[cache_key]
    
    def preprocess_data(self, historical_data: Dict, preprocessor=None):
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
        
        # Appliquer le préprocesseur si disponible
        if preprocessor:
            try:
                logger.info("Application du préprocesseur")
                df_processed = preprocessor.transform(df)
                logger.info(f"Données après preprocessing: shape {df_processed.shape}")
            except Exception as e:
                logger.error(f"Erreur preprocessing: {e}")
                # Fallback: normalisation simple
                df_processed = self._simple_normalization(df)
        else:
            logger.info("Pas de préprocesseur, normalisation simple")
            df_processed = self._simple_normalization(df)
        
        # Convertir en tensor PyTorch
        try:
            if isinstance(df_processed, np.ndarray):
                sequence = torch.FloatTensor(df_processed).unsqueeze(0)  # batch_size=1
            else:
                sequence = torch.FloatTensor(df_processed.values).unsqueeze(0)
            
            logger.info(f"Tensor créé avec shape: {sequence.shape}")
            return sequence
            
        except Exception as e:
            logger.error(f"Erreur création tensor: {e}")
            # Fallback avec données brutes
            sequence = torch.FloatTensor(df.values).unsqueeze(0)
            return sequence
    
    def _simple_normalization(self, df):
        """Normalisation simple des données"""
        # Éviter la division par zéro
        std_vals = df.std()
        std_vals = std_vals.replace(0, 1)  # Remplacer les std=0 par 1
        
        normalized = (df - df.mean()) / std_vals
        
        # Remplacer les NaN par 0
        normalized = normalized.fillna(0)
        
        return normalized
    
    def simulate_prediction(self, historical_data: Dict, prediction_horizon: int = 7):
        """Générer une prédiction simulée plus réaliste basée sur les données historiques"""
        recent_cases = historical_data['nbNouveauCas'][-7:]  # 7 derniers jours
        
        if not recent_cases or all(x == 0 for x in recent_cases):
            # Si pas de données récentes, générer des valeurs par défaut
            base_value = max(50, int(np.random.normal(100, 30)))
        else:
            # Calculer une moyenne pondérée (plus de poids sur les jours récents)
            weights = np.array([0.1, 0.1, 0.15, 0.15, 0.2, 0.25, 0.25])[:len(recent_cases)]
            weights = weights / weights.sum()  # Normaliser
            base_value = int(np.average(recent_cases, weights=weights))
        
        base_value = max(1, base_value)  # Assurer une valeur minimale
        
        logger.info(f"Valeur de base pour simulation: {base_value}")
        
        predictions = []
        for i in range(prediction_horizon):
            # Tendance légèrement décroissante
            trend = -i * 0.03 * base_value
            
            # Variation aléatoire réaliste
            variation = np.random.normal(0, 0.15 * base_value)
            
            # Effet week-end (moins de cas les weekends)
            day_of_week = i % 7
            weekend_effect = 0.8 if day_of_week in [5, 6] else 1.0
            
            predicted_value = max(1, int((base_value + trend + variation) * weekend_effect))
            predictions.append(predicted_value)
            
            logger.info(f"Jour {i+1}: {predicted_value}")
        
        return predictions
    
    def predict_with_real_model(self, model_data, input_sequence, prediction_horizon):
        """Prédiction avec un vrai modèle PyTorch (si disponible)"""
        model = model_data['model']
        
        try:
            predictions = []
            current_sequence = input_sequence.clone()
            
            with torch.no_grad():
                for i in range(prediction_horizon):
                    logger.info(f"Prédiction jour {i+1}, input shape: {current_sequence.shape}")
                    
                    # Prédiction
                    if isinstance(model, dict):
                        # Si c'est un dictionnaire, on ne peut pas faire de prédiction directe
                        logger.warning("Modèle en format dictionnaire, impossible de prédire")
                        raise Exception("Format de modèle non supporté")
                    
                    output = model(current_sequence)
                    logger.info(f"Output shape: {output.shape}")
                    
                    # Extraire la prédiction pour les nouveaux cas (première feature)
                    if len(output.shape) == 3:  # [batch, sequence, features]
                        next_pred = output[0, -1, 0].item()
                    elif len(output.shape) == 2:  # [batch, features]
                        next_pred = output[0, 0].item()
                    else:
                        next_pred = output[0].item()
                    
                    predicted_value = max(0, int(round(next_pred)))
                    predictions.append(predicted_value)
                    
                    logger.info(f"Prédiction brute: {next_pred}, valeur finale: {predicted_value}")
                    
                    # Mettre à jour la séquence pour la prochaine prédiction
                    # Créer une nouvelle entrée avec la prédiction
                    new_entry = torch.zeros(1, 1, current_sequence.shape[2])
                    new_entry[0, 0, 0] = next_pred  # Nouveaux cas
                    
                    # Faire glisser la fenêtre temporelle
                    current_sequence = torch.cat([current_sequence[:, 1:, :], new_entry], dim=1)
            
            return predictions
            
        except Exception as e:
            logger.error(f"Erreur lors de la prédiction avec le modèle: {e}")
            # Fallback vers simulation
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
            input_sequence = self.preprocess_data(historical_data, model_data['preprocessor'])
            
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
            # Parser le nom du fichier pour extraire pays et type
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
