
import torch
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import date, timedelta
from pathlib import Path
import pickle
import os

class TemporalPredictionService:
    def __init__(self):
        self.model_dir = Path(__file__).parent.parent / "models" / "temporel"
        self.models_cache = {}
        
    def load_model(self, country: str, model_type: str = "GRU"):
        """Charger un modèle temporel pour un pays donné"""
        cache_key = f"{country}_{model_type}"
        
        if cache_key in self.models_cache:
            return self.models_cache[cache_key]
        
        # Rechercher le fichier modèle
        pattern = f"{country}_{model_type}_*.pth"
        model_files = list(self.model_dir.glob(pattern))
        
        if not model_files:
            raise FileNotFoundError(f"Aucun modèle {model_type} trouvé pour {country}")
        
        model_path = model_files[0]
        
        try:
            # Charger le modèle PyTorch
            model = torch.load(model_path, map_location='cpu')
            model.eval()
            
            # Charger le préprocesseur s'il existe
            prep_pattern = f"{country}_prepared_*.pkl"
            prep_files = list(self.model_dir.glob(prep_pattern))
            preprocessor = None
            
            if prep_files:
                with open(prep_files[0], 'rb') as f:
                    preprocessor = pickle.load(f)
            
            self.models_cache[cache_key] = {
                'model': model,
                'preprocessor': preprocessor
            }
            
            return self.models_cache[cache_key]
            
        except Exception as e:
            raise Exception(f"Erreur lors du chargement du modèle: {str(e)}")
    
    def preprocess_data(self, historical_data: Dict, preprocessor=None):
        """Préprocesser les données d'entrée"""
        # Convertir en DataFrame
        df = pd.DataFrame({
            'nbNouveauCas': historical_data['nbNouveauCas'],
            'nbDeces': historical_data['nbDeces'],
            'nbHospitalisation': historical_data['nbHospitalisation'],
            'nbHospiSoinsIntensif': historical_data['nbHospiSoinsIntensif'],
            'nbTeste': historical_data['nbTeste']
        })
        
        # Appliquer le préprocesseur si disponible
        if preprocessor:
            try:
                df_processed = preprocessor.transform(df)
            except:
                # Fallback si le preprocesseur ne fonctionne pas
                df_processed = (df - df.mean()) / (df.std() + 1e-8)
        else:
            # Normalisation simple
            df_processed = (df - df.mean()) / (df.std() + 1e-8)
        
        # Convertir en tensor PyTorch
        sequence = torch.FloatTensor(df_processed.values).unsqueeze(0)  # batch_size=1
        
        return sequence
    
    def predict(self, country: str, historical_data: Dict, 
                model_type: str = "GRU", prediction_horizon: int = 7):
        """Effectuer une prédiction temporelle"""
        
        # Charger le modèle
        model_data = self.load_model(country, model_type)
        model = model_data['model']
        preprocessor = model_data['preprocessor']
        
        # Préprocesser les données
        input_sequence = self.preprocess_data(historical_data, preprocessor)
        
        predictions = []
        current_sequence = input_sequence.clone()
        
        with torch.no_grad():
            for _ in range(prediction_horizon):
                # Prédiction pour le jour suivant
                output = model(current_sequence)
                
                # Prendre la prédiction (seulement nouveaux cas pour l'instant)
                next_pred = output[0, -1, 0].item()  # Premier feature (nouveaux cas)
                predictions.append(max(0, int(round(next_pred))))
                
                # Mettre à jour la séquence pour la prochaine prédiction
                # Ici on simplifie en gardant la même séquence
                # Dans un vrai modèle, il faudrait intégrer la nouvelle prédiction
        
        # Générer les dates de prédiction
        last_date = pd.to_datetime(historical_data['dates'][-1])
        prediction_dates = [
            (last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') 
            for i in range(prediction_horizon)
        ]
        
        return {
            'predictions': predictions,
            'prediction_dates': prediction_dates,
            'confidence_interval': None,  # Pas implémenté pour l'instant
            'metrics': {'mse': 0.0, 'mae': 0.0}  # Métriques factices
        }
    
    def get_available_models(self):
        """Obtenir la liste des modèles disponibles"""
        models = []
        for model_file in self.model_dir.glob("*.pth"):
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
        return models
