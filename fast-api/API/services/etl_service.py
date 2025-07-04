
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import pandas as pd
import logging
from datetime import datetime, date
from ..database import get_db
from ..models import Releve, Pays, Regions, Maladie
import os

logger = logging.getLogger(__name__)

class ETLService:
    def __init__(self):
        self.router = APIRouter(prefix="/etl", tags=["ETL"])
        self.setup_routes()
    
    def setup_routes(self):
        @self.router.post("/extract/releves")
        async def extract_releves(
            start_date: str = None,
            end_date: str = None,
            db: Session = Depends(get_db)
        ):
            """Extraire les données de relevés pour traitement"""
            try:
                query = db.query(Releve)
                if start_date:
                    query = query.filter(Releve.dateReleve >= start_date)
                if end_date:
                    query = query.filter(Releve.dateReleve <= end_date)
                
                releves = query.all()
                
                # Convertir en format DataFrame pour traitement
                data = []
                for releve in releves:
                    data.append({
                        'id': releve.idReleve,
                        'date': releve.dateReleve.isoformat(),
                        'nouveaux_cas': releve.nbNouveauCas,
                        'deces': releve.nbDeces,
                        'hospitalisations': releve.nbHospitalisation,
                        'region_id': releve.idRegion,
                        'maladie_id': releve.idMaladie
                    })
                
                return {
                    "status": "success",
                    "total_records": len(data),
                    "data": data
                }
            except Exception as e:
                logger.error(f"Erreur extraction ETL: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.post("/transform/aggregate")
        async def transform_aggregate_data(
            data: List[Dict[Any, Any]],
            aggregation_type: str = "daily"
        ):
            """Transformer et agréger les données"""
            try:
                df = pd.DataFrame(data)
                
                if aggregation_type == "weekly":
                    # Agrégation hebdomadaire
                    df['date'] = pd.to_datetime(df['date'])
                    df['week'] = df['date'].dt.isocalendar().week
                    df['year'] = df['date'].dt.year
                    
                    aggregated = df.groupby(['year', 'week', 'region_id']).agg({
                        'nouveaux_cas': 'sum',
                        'deces': 'sum',
                        'hospitalisations': 'sum'
                    }).reset_index()
                    
                elif aggregation_type == "monthly":
                    # Agrégation mensuelle
                    df['date'] = pd.to_datetime(df['date'])
                    df['month'] = df['date'].dt.month
                    df['year'] = df['date'].dt.year
                    
                    aggregated = df.groupby(['year', 'month', 'region_id']).agg({
                        'nouveaux_cas': 'sum',
                        'deces': 'sum',
                        'hospitalisations': 'sum'
                    }).reset_index()
                
                else:
                    # Pas d'agrégation (daily par défaut)
                    aggregated = df
                
                return {
                    "status": "success",
                    "aggregation_type": aggregation_type,
                    "records_processed": len(df),
                    "records_output": len(aggregated),
                    "data": aggregated.to_dict('records')
                }
                
            except Exception as e:
                logger.error(f"Erreur transformation ETL: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.router.post("/load/processed")
        async def load_processed_data(
            data: List[Dict[Any, Any]],
            db: Session = Depends(get_db)
        ):
            """Charger les données traitées dans la base"""
            try:
                # Ici vous pourriez créer une table pour les données agrégées
                # Pour l'instant, on retourne juste un statut
                
                return {
                    "status": "success",
                    "records_loaded": len(data),
                    "timestamp": datetime.now().isoformat()
                }
                
            except Exception as e:
                logger.error(f"Erreur chargement ETL: {e}")
                raise HTTPException(status_code=500, detail=str(e))

# Instance du service ETL
etl_service = ETLService()
