from fastapi import FastAPI, Depends, HTTPException, Query, Body, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import date
from decimal import Decimal
import pandas as pd
import pickle
from fastapi import HTTPException
from functools import lru_cache
from pathlib import Path
import os

# Importer Base depuis le module database
from .database import Base, engine, SessionLocal
from . import models, crud  # S'assurer que les modèles et fonctions CRUD sont importés


Base.metadata.create_all(bind=engine)


tags_metadata = [
    {
        "name": "Maladies",
        "description": "Opérations sur les maladies infectieuses",
    },
    {
        "name": "Continents",
        "description": "Gestion des continents",
    },
    {
        "name": "Symptomes",
        "description": "Gestion des symptomes associés aux maladies",
    },
    {
        "name": "Variants",
        "description": "Gestion des variants des maladies",
    },
    {
        "name": "Traitements",
        "description": "Gestion des traitements médicaux",
    },
    {
        "name": "Pays",
        "description": "Gestion des pays et leurs informations géographiques",
    },
    {
        "name": "Regions",
        "description": "Gestion des régions/états au sein des pays",
    },
    {
        "name": "Releves",
        "description": "Gestion des relevés épidémiologiques",
    },
    {
        "name": "Prediction",
        "description": "Opérations de prédictions",
    }
]

API = FastAPI(
    title="Pandemic API",
    description="📊 API pour la gestion et le suivi des maladies, variants, releves epidemiologiques, etc.",
    version="1.0.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "Rose Jérôme",
        "email": "jerome.rose@ecoles-epsi.net",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configuration du middleware CORS
API.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", 
        "http://localhost:5173", 
        "http://127.0.0.1:8080", 
        "http://127.0.0.1:5173",
        "http://localhost:8081",  # Ajout du port 8081
        "http://127.0.0.1:8081",   # Ajout du port 8081 avec IP
        "*"  # Autoriser toutes les origines pour les tests (à utiliser avec précaution en production)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Autoriser toutes les méthodes
    allow_headers=["*"],  # Autoriser tous les en-têtes
    expose_headers=["*"],  # Exposer tous les en-têtes
)

# ------------------ Dépendance DB ------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ... keep existing code (définitions des modèles Pydantic, routes génériques et autres endpoints API) ...

# Ajouter une route racine pour faciliter la vérification de l'API
@API.get("/")
def read_root():
    return {"status": "online", "message": "L'API fonctionne correctement"}

# ------------------ Pydantic Schemas ------------------
class MaladieBase(BaseModel):
    nomMaladie: Optional[str] = Field(max_length=50)

class Maladie(MaladieBase):
    idMaladie: int
    class Config:
        from_attributes = True

class ContinentBase(BaseModel):
    nomContinent: Optional[str] = Field(max_length=50)

class Continent(ContinentBase):
    idContinent: int
    class Config:
        from_attributes = True

class SymptomeBase(BaseModel):
    nomSymptome: Optional[str] = Field(max_length=50)

class Symptome(SymptomeBase):
    idSymptome: int
    class Config:
        from_attributes = True

class VariantBase(BaseModel):
    nomVariant: Optional[str] = Field(max_length=50)
    idMaladie: int

class Variant(VariantBase):
    idVariant: int
    class Config:
        from_attributes = True

class TraitementBase(BaseModel):
    natureTraitement: Optional[str] = Field(max_length=100)

class Traitement(TraitementBase):
    idTraitement: int
    class Config:
        from_attributes = True

class PaysBase(BaseModel):
    isoPays: Optional[str] = Field(max_length=3)
    nomPays: Optional[str] = Field(max_length=50)
    populationTotale: Optional[int]
    latitudePays: Optional[Decimal] = Field(decimal_places=2)
    longitudePays: Optional[Decimal] = Field(decimal_places=2)
    Superficie: Optional[Decimal] = Field(decimal_places=2)
    densitePopulation: Optional[Decimal] = Field(decimal_places=1)
    idContinent: Optional[int]

class Pays(PaysBase):
    idPays: int
    class Config:
        from_attributes = True

class RegionBase(BaseModel):
    nomEtat: Optional[str] = Field(max_length=50)
    codeEtat: Optional[str] = Field(max_length=50)
    lattitudeRegion: Optional[Decimal] = Field(decimal_places=2)
    longitudeRegion: Optional[Decimal] = Field(decimal_places=2)
    idPays: int

class Region(RegionBase):
    idRegion: int
    class Config:
        from_attributes = True

class ReleveBase(BaseModel):
    dateReleve: date
    nbNouveauCas: Optional[int]
    nbDeces: Optional[int]
    nbGueri: Optional[int]
    nbHospitalisation: Optional[int]
    nbHospiSoinsIntensif: Optional[int]
    nbVaccineTotalement: Optional[int]
    nbSousRespirateur: Optional[int]
    nbVaccine: Optional[int]
    nbTeste: Optional[int]
    idRegion: int
    idMaladie: int

class Releve(ReleveBase):
    idReleve: int
    class Config:
        from_attributes = True

class MortalityPredictionInput(BaseModel):
    nbNouveauCas: int
    nbDeces: int
    densitePopulation: float
    PIB: float
    populationTotale: int
    nbVaccineTotalement: int
    nbHospiSoinsIntensif: int
    pays: str  # nom du fichier modèle (ex: "france", sans extension)

class MortalityPredictionOutput(BaseModel):
    pays: str
    taux_mortalite: float = Field(..., description="Taux de mortalité exprimé en pourcentage (%)")


# ------------------ Routes Génériques ------------------
def generate_routes(model_name: str, schema_in, schema_out, crud_create, crud_get_all, crud_get_one, crud_update, crud_delete, tag: str):
    @API.post(f"/{model_name}/", response_model=schema_out, tags=[tag])
    def create(item: schema_in, db: Session = Depends(get_db)):
        """
        Créer un nouvel élément.
        """
        # Conversion de l'objet Pydantic en dictionnaire pour être compatible avec les fonctions CRUD
        return crud_create(db, **item.model_dump())

    @API.get(f"/{model_name}/", response_model=List[schema_out], tags=[tag])
    def read_all(skip: int = 0, limit: int = 2000, db: Session = Depends(get_db)):
        """
        Récupérer tous les éléments.
        """
        return crud_get_all(db, skip, limit)

    @API.get(f"/{model_name}/{{item_id}}", response_model=schema_out, tags=[tag])
    def read_one(item_id: int, db: Session = Depends(get_db)):
        """
        Récupérer un élément par son ID.
        """
        item = crud_get_one(db, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Non trouvé")
        return item

    @API.put(f"/{model_name}/{{item_id}}", response_model=schema_out, tags=[tag])
    def update(item_id: int, item: schema_in, db: Session = Depends(get_db)):
        """
        Mettre à jour un élément.
        """
        # Conversion de l'objet Pydantic en dictionnaire
        updated = crud_update(db, item_id, item.model_dump())
        if not updated:
            raise HTTPException(status_code=404, detail="Non trouvé")
        return updated

    @API.delete(f"/{model_name}/{{item_id}}", tags=[tag])
    def delete(item_id: int, db: Session = Depends(get_db)):
        """
        Supprimer un élément.
        """
        deleted = crud_delete(db, item_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Non trouvé")
        return {"message": "Supprimé avec succès"}

#-----------Routes pour Releve------------------
@API.get("/releves/date/{date}", response_model=List[Releve], tags=["Releves"])
def read_releves_by_date(date: date, skip: int = 0, limit: int = 2000, db: Session = Depends(get_db)):
    """
    Récupérer les relevés à une date spécifique.
    """
    return crud.get_releves_by_date(db, date=date, skip=skip, limit=limit)

@API.get("/releves/range/", response_model=List[Releve], tags=["Releves"])
def read_releves_by_date_range(
    start_date: date = Query(..., description="Date de début (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Date de fin (YYYY-MM-DD)"),
    skip: int = 0, 
    limit: int = 2000, 
    db: Session = Depends(get_db)
):
    """
    Récupérer les relevés entre deux dates.
    """
    return crud.get_releves_by_date_range(db, start_date=start_date, end_date=end_date, skip=skip, limit=limit)

@API.get("/releves/available-dates/", response_model=List[str], tags=["Releves"])
def read_available_dates(db: Session = Depends(get_db)):
    """
    Récupérer la liste des dates pour lesquelles des relevés existent.
    """
    dates = crud.get_available_dates(db)
    return dates

@API.delete("/releves/range/", tags=["Releves"])
def delete_releves_by_date_range(
    start_date: date = Query(..., description="Date de début (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Date de fin (YYYY-MM-DD)"),
    confirm: bool = Query(False, description="Confirmation requise"),
    db: Session = Depends(get_db)
):
    """Supprimer tous les relevés dans une plage de dates"""
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Ajoutez '?confirm=true' pour confirmer la suppression"
        )
    return crud.delete_releves_by_date_range(db, start_date=start_date, end_date=end_date)

@API.put("/releves/range/", response_model=dict, tags=["Releves"])
def update_releves_by_date_range(
    start_date: date = Query(..., description="Date de début (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Date de fin (YYYY-MM-DD)"),
    update_data: ReleveBase = Body(...),
    db: Session = Depends(get_db)
):
    """Mettre à jour tous les relevés dans une plage de dates"""
    return crud.update_releves_by_date_range(db, start_date=start_date, end_date=end_date, update_data=update_data.dict())

#----------------Routes pour région----------------
@API.get("/regions/nom/{nomEtat}", response_model=List[Region], tags=["Regions"])
def read_regions_by_nom(nomEtat: str, skip: int = 0, limit: int = 2000, db: Session = Depends(get_db)):
    """
    Récupérer les régions par nom (recherche insensible à la casse et partielle).
    """
    return crud.get_regions_by_nomEtat(db, nomEtat=nomEtat, skip=skip, limit=limit)

@API.delete("/regions/nom/{nomEtat}", tags=["Regions"])
def delete_regions_by_nom(
    nomEtat: str,
    db: Session = Depends(get_db)
):
    """Supprimer les régions par nom (insensible à la casse)"""
    return crud.delete_regions_by_nomEtat(db, nomEtat=nomEtat)

@API.put("/regions/nom/{nomEtat}", response_model=dict, tags=["Regions"])
def update_regions_by_nom(
    nomEtat: str,
    update_data: RegionBase = Body(...),
    db: Session = Depends(get_db)
):
    """Mettre à jour les régions par nom"""
    # Utiliser dict() pour les versions de Pydantic < 2.0 ou model_dump() pour >= 2.0
    try:
        data = update_data.model_dump()
    except AttributeError:
        data = update_data.dict()  # Fallback pour les anciennes versions de Pydantic
    
    return crud.update_regions_by_nomEtat(db, nomEtat=nomEtat, update_data=data)

@API.get("/regions/by_pays/{idPays}", response_model=List[Region], tags=["Regions"])
def read_regions_by_pays(idPays: int, db: Session = Depends(get_db)):
    """Récupérer les régions par pays"""
    return crud.get_regions_by_pays(db, idPays=idPays)

#--------------Routes pour pays--------------------
@API.get("/pays/nom/{nomPays}", response_model=List[Pays], tags=["Pays"])
def read_pays_by_nom(nomPays: str, skip: int = 0, limit: int = 150, db: Session = Depends(get_db)):
    """
    Récupérer les pays par nom (recherche insensible à la casse et partielle).
    """
    return crud.get_pays_by_nom(db, nomPays=nomPays, skip=skip, limit=limit)

@API.get("/pays/iso/{isoPays}", response_model=List[Pays], tags=["Pays"])
def read_pays_by_iso(isoPays: str, skip: int = 0, limit: int = 150, db: Session = Depends(get_db)):
    """
    Récupérer les pays par code ISO (recherche insensible à la casse et partielle).
    """
    return crud.get_pays_by_iso(db, isoPays=isoPays, skip=skip, limit=limit)

@API.get("/pays/superficie/", response_model=List[Pays], tags=["Pays"])
def read_pays_by_superficie_range(
    min_superficie: Decimal = Query(..., description="Superficie minimale"),
    max_superficie: Decimal = Query(..., description="Superficie maximale"),
    skip: int = 0,
    limit: int = 150,
    db: Session = Depends(get_db)
):
    """
    Récupérer les pays par plage de superficie.
    """
    return crud.get_pays_by_superficie_range(db, min_superficie=min_superficie, max_superficie=max_superficie, skip=skip, limit=limit)

@API.get("/pays/population/", response_model=List[Pays], tags=["Pays"])
def read_pays_by_population_range(
    min_population: int = Query(..., description="Population minimale"),
    max_population: int = Query(..., description="Population maximale"),
    skip: int = 0,
    limit: int = 150,
    db: Session = Depends(get_db)
):
    """
    Récupérer les pays par plage de population.
    """
    return crud.get_pays_by_population_range(db, min_population=min_population, max_population=max_population, skip=skip, limit=limit)

@API.get("/releves/region/{idRegion}/range/", response_model=List[Releve], tags=["Releves"])
def read_releves_by_region_and_date_range(
    idRegion: int,
    start_date: str,
    end_date: str,
    skip: int = 0,
    limit: int = 2000,
    db: Session = Depends(get_db)
):
    releves = crud.get_releves_by_region_and_date_range(db, idRegion, start_date, end_date, skip, limit)
    if not releves:
        raise HTTPException(status_code=404, detail="Aucun relevé trouvé pour cette région et cette période")
    """Récupérer les relevés par région et intervalle de dates"""
    return releves

#----------------Routes pour prédiction----------------
BASE_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = BASE_DIR / "models" / "classique" / "tauxMortalite"

@lru_cache()
def load_mortality_model(pays: str):
    pays = pays.lower() 
    
    # Format exact du fichier selon votre convention de nommage
    pattern = f"model_tauxMortalite_{pays}_*_opt.pkl"
    
    # Afficher tous les fichiers disponibles
    all_files = list(MODEL_DIR.glob("*.pkl"))
    
    # Recherche des fichiers pour ce pays
    files_found = list(MODEL_DIR.glob(pattern))
    print(f"Fichiers trouvés pour '{pays}': {files_found}")
    
    if files_found:
        model_path = files_found[0]
        print(f"Chargement du modèle: {model_path}")
        try:
            with open(model_path, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            print(f"Erreur lors du chargement du modèle: {e}")
            raise HTTPException(status_code=500, detail=f"Impossible de charger le modèle: {str(e)}")
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Aucun modèle de taux de mortalité trouvé pour le pays '{pays}'."
        )


@API.post("/prediction/mortalite/", response_model=MortalityPredictionOutput, tags=["Prediction"])
def predict_mortality(data: MortalityPredictionInput):
    model = load_mortality_model(data.pays)
    input_df = pd.DataFrame([data.model_dump(exclude={"pays"})])
    prediction = model.predict(input_df)[0]
    percentage = round(float(prediction) * 100, 2)
    """Prédire le taux de mortalité pour un pays donné"""
    return {
        "pays": data.pays,
        "taux_mortalite": percentage
    }
    
# ------------------ Appliquer routes ------------------
# Pour les maladies
generate_routes(
    "maladies", 
    MaladieBase, 
    Maladie, 
    lambda db, **kwargs: crud.create_maladie(db, kwargs.get("nomMaladie")),
    crud.get_maladies, 
    crud.get_maladie, 
    lambda db, id, data: crud.update_maladie(db, id, data.get("nomMaladie")),
    crud.delete_maladie, 
    "Maladies"
)

# Pour les continents
generate_routes(
    "continents", 
    ContinentBase, 
    Continent, 
    lambda db, **kwargs: crud.create_continent(db, kwargs.get("nomContinent")),
    crud.get_continents, 
    crud.get_continent, 
    lambda db, id, data: crud.update_continent(db, id, data.get("nomContinent")),
    crud.delete_continent, 
    "Continents"
)

# Pour les symptômes
generate_routes(
    "symptomes", 
    SymptomeBase, 
    Symptome, 
    lambda db, **kwargs: crud.create_symptome(db, kwargs.get("nomSymptome")),
    crud.get_symptomes, 
    crud.get_symptome, 
    lambda db, id, data: crud.update_symptome(db, id, data.get("nomSymptome")),
    crud.delete_symptome, 
    "Symptomes"
)

# Pour les variants
generate_routes(
    "variants", 
    VariantBase, 
    Variant, 
    lambda db, **kwargs: crud.create_variant(db, kwargs.get("nomVariant"), kwargs.get("idMaladie")),
    crud.get_variants, 
    crud.get_variant, 
    crud.update_variant,
    crud.delete_variant, 
    "Variants"
)

# Pour les traitements
generate_routes(
    "traitements", 
    TraitementBase, 
    Traitement, 
    lambda db, **kwargs: crud.create_traitement(db, kwargs.get("natureTraitement")),
    crud.get_traitements, 
    crud.get_traitement, 
    lambda db, id, data: crud.update_traitement(db, id, data.get("natureTraitement")),
    crud.delete_traitement, 
    "Traitements"
)

# Pour les pays
generate_routes(
    "pays", 
    PaysBase, 
    Pays, 
    lambda db, **kwargs: crud.create_pays(
        db, 
        kwargs.get("isoPays"), 
        kwargs.get("nomPays"), 
        kwargs.get("populationTotale"), 
        kwargs.get("idContinent")
    ),
    crud.get_pays, 
    crud.get_pays_by_id, 
    crud.update_pays,
    crud.delete_pays, 
    "Pays"
)

# Pour les regions
generate_routes(
    "regions", 
    RegionBase, 
    Region, 
    lambda db, **kwargs: crud.create_region(
        db, 
        kwargs.get("nomEtat"), 
        kwargs.get("codeEtat"), 
        kwargs.get("idPays")
    ),
    crud.get_regions, 
    crud.get_region, 
    crud.update_region,
    crud.delete_region, 
    "Regions"
)

# Pour les relevés
generate_routes(
    "releves", 
    ReleveBase, 
    Releve, 
    lambda db, **kwargs: crud.create_releve(
        db, 
        str(kwargs.get("dateReleve")), 
        kwargs.get("idRegion"), 
        kwargs.get("idMaladie"),
        **{k: v for k, v in kwargs.items() if k not in ["dateReleve", "idRegion", "idMaladie"]}
    ),
    crud.get_releves, 
    crud.get_releve, 
    crud.update_releve,
    crud.delete_releve, 
    "Releves"
)

# Nouvelle route pour récupérer les variants par maladie
@API.get("/variants/by-maladie/{maladie_id}", response_model=List[Variant], tags=["Variants"])
def read_variants_by_maladie(maladie_id: int, db: Session = Depends(get_db)):
    """Récupérer les variants par maladie"""
    return crud.get_variants_by_maladie(db, maladie_id)
