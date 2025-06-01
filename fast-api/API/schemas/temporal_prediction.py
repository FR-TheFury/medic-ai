
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import date

class HistoricalData(BaseModel):
    """Données historiques pour la prédiction temporelle"""
    nbNouveauCas: List[int] = Field(..., description="30 jours de nouveaux cas")
    nbDeces: List[int] = Field(..., description="30 jours de décès")
    nbHospitalisation: List[int] = Field(..., description="30 jours d'hospitalisations")
    nbHospiSoinsIntensif: List[int] = Field(..., description="30 jours de soins intensifs")
    nbTeste: List[int] = Field(..., description="30 jours de tests")
    dates: List[str] = Field(..., description="30 dates correspondantes")

class TemporalPredictionInput(BaseModel):
    """Données d'entrée pour la prédiction temporelle"""
    country: str = Field(..., description="Nom du pays (ex: suisse)")
    model_type: str = Field(default="GRU", description="Type de modèle (GRU/LSTM)")
    historical_data: HistoricalData = Field(..., description="30 jours de données historiques")
    prediction_horizon: int = Field(default=7, description="Nombre de jours à prédire")

class TemporalPredictionOutput(BaseModel):
    """Résultat de la prédiction temporelle"""
    country: str
    model_type: str
    predictions: List[int] = Field(..., description="Prédictions pour les 7 prochains jours")
    prediction_dates: List[str] = Field(..., description="Dates des prédictions")
    confidence_interval: Optional[Dict[str, List[float]]] = Field(None, description="Intervalles de confiance")
    metrics: Optional[Dict[str, float]] = Field(None, description="Métriques du modèle")
