
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Releve, Pays, Regions
import logging

logger = logging.getLogger(__name__)

class TechnicalAPIService:
    def __init__(self):
        self.router = APIRouter(prefix="/technical", tags=["Technical API"])
        self.setup_routes()
    
    def setup_routes(self):
        @self.router.get("/health")
        async def health_check():
            """Vérification de l'état du service technique"""
            return {
                "status": "healthy",
                "service": "technical-api",
                "timestamp": datetime.now().isoformat()
            }
        
        @self.router.post("/analytics/trends")
        async def analyze_trends(
            country: str,
            start_date: str,
            end_date: str,
            db: Session = Depends(get_db)
        ):
            """Analyser les tendances épidémiologiques avancées"""
            try:
                # Récupérer les données du pays
                pays = db.query(Pays).filter(Pays.nomPays.ilike(f"%{country}%")).first()
                if not pays:
                    raise HTTPException(status_code=404, detail="Pays non trouvé")
                
                # Récupérer les régions du pays
                regions = db.query(Regions).filter(Regions.idPays == pays.idPays).all()
                region_ids = [r.idRegion for r in regions]
                
                # Récupérer les données de relevés
                releves = db.query(Releve).filter(
                    Releve.idRegion.in_(region_ids),
                    Releve.dateReleve >= start_date,
                    Releve.dateReleve <= end_date
                ).all()
                
                # Analyse des tendances
                data = []
                for releve in releves:
                    data.append({
                        'date': releve.dateReleve,
                        'nouveaux_cas': releve.nbNouveauCas or 0,
                        'deces': releve.nbDeces or 0,
                        'hospitalisations': releve.nbHospitalisation or 0
                    })
                
                df = pd.DataFrame(data)
                df['date'] = pd.to_datetime(df['date'])
                df_daily = df.groupby('date').sum().reset_index()
                
                # Calcul de tendances
                df_daily['ma_7'] = df_daily['nouveaux_cas'].rolling(window=7).mean()
                df_daily['ma_14'] = df_daily['nouveaux_cas'].rolling(window=14).mean()
                
                # Détection de pics
                df_daily['peak'] = (df_daily['nouveaux_cas'] > df_daily['ma_14'] * 1.5)
                
                # Calcul du taux de croissance
                df_daily['growth_rate'] = df_daily['nouveaux_cas'].pct_change(periods=7) * 100
                
                return {
                    "country": country,
                    "analysis_period": {
                        "start": start_date,
                        "end": end_date
                    },
                    "summary": {
                        "total_cases": int(df_daily['nouveaux_cas'].sum()),
                        "total_deaths": int(df_daily['deces'].sum()),
                        "total_hospitalizations": int(df_daily['hospitalisations'].sum()),
                        "peak_days": int(df_daily['peak'].sum()),
                        "avg_growth_rate": float(df_daily['growth_rate'].mean())
                    },
                    "trends": df_daily.fillna(0).to_dict('records')
                }
                
            except Exception as e:
                logger.error(f"Erreur analyse technique: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.post("/models/comparison")
        async def compare_models(
            country: str,
            models: List[str],
            test_data: Dict[str, Any]
        ):
            """Comparer les performances de différents modèles"""
            try:
                # Simulation de comparaison de modèles
                # Dans un vrai cas, vous chargeriez et testeriez les modèles
                
                results = {}
                for model in models:
                    # Simulation de métriques
                    results[model] = {
                        "mae": np.random.uniform(50, 200),
                        "rmse": np.random.uniform(100, 300),
                        "r2": np.random.uniform(0.7, 0.95),
                        "execution_time": np.random.uniform(0.1, 2.0)
                    }
                
                # Trouver le meilleur modèle
                best_model = min(results.keys(), key=lambda x: results[x]['rmse'])
                
                return {
                    "country": country,
                    "models_compared": models,
                    "best_model": best_model,
                    "results": results,
                    "recommendation": f"Le modèle {best_model} est recommandé pour {country}"
                }
                
            except Exception as e:
                logger.error(f"Erreur comparaison modèles: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.post("/alerts/anomalies")
        async def detect_anomalies(
            country: str,
            threshold: float = 2.0,
            db: Session = Depends(get_db)
        ):
            """Détecter les anomalies dans les données"""
            try:
                # Récupérer les données récentes
                end_date = datetime.now().date()
                start_date = end_date - timedelta(days=30)
                
                pays = db.query(Pays).filter(Pays.nomPays.ilike(f"%{country}%")).first()
                if not pays:
                    raise HTTPException(status_code=404, detail="Pays non trouvé")
                
                regions = db.query(Regions).filter(Regions.idPays == pays.idPays).all()
                region_ids = [r.idRegion for r in regions]
                
                releves = db.query(Releve).filter(
                    Releve.idRegion.in_(region_ids),
                    Releve.dateReleve >= start_date,
                    Releve.dateReleve <= end_date
                ).all()
                
                # Analyse des anomalies
                cases = [r.nbNouveauCas or 0 for r in releves]
                if len(cases) < 7:
                    return {"anomalies": [], "message": "Pas assez de données"}
                
                mean_cases = np.mean(cases)
                std_cases = np.std(cases)
                
                anomalies = []
                for releve in releves:
                    if releve.nbNouveauCas:
                        z_score = abs((releve.nbNouveauCas - mean_cases) / std_cases)
                        if z_score > threshold:
                            anomalies.append({
                                "date": releve.dateReleve.isoformat(),
                                "value": releve.nbNouveauCas,
                                "z_score": float(z_score),
                                "severity": "high" if z_score > 3 else "medium"
                            })
                
                return {
                    "country": country,
                    "detection_period": {
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat()
                    },
                    "threshold": threshold,
                    "anomalies_detected": len(anomalies),
                    "anomalies": anomalies
                }
                
            except Exception as e:
                logger.error(f"Erreur détection anomalies: {e}")
                raise HTTPException(status_code=500, detail=str(e))

# Instance du service technique
technical_api_service = TechnicalAPIService()
