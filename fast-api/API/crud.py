from sqlalchemy.orm import Session
from .models import Maladie, Continent, Symptome, Variant, Traitement, Pays, Regions, Releve
from sqlalchemy import or_

# --- CRUD pour Maladie ---
def create_maladie(db: Session, nomMaladie: str):
    db_maladie = Maladie(nomMaladie=nomMaladie)
    db.add(db_maladie)
    db.commit()
    db.refresh(db_maladie)
    return db_maladie

def get_maladies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Maladie).offset(skip).limit(limit).all()

def get_maladie(db: Session, maladie_id: int):
    return db.query(Maladie).filter(Maladie.idMaladie == maladie_id).first()

def update_maladie(db: Session, maladie_id: int, nomMaladie: str):
    db_maladie = db.query(Maladie).filter(Maladie.idMaladie == maladie_id).first()
    if db_maladie:
        db_maladie.nomMaladie = nomMaladie
        db.commit()
        db.refresh(db_maladie)
    return db_maladie

def delete_maladie(db: Session, maladie_id: int):
    db_maladie = db.query(Maladie).filter(Maladie.idMaladie == maladie_id).first()
    if db_maladie:
        db.delete(db_maladie)
        db.commit()
    return db_maladie

# Nouvelle fonction pour récupérer les variants par maladie
def get_variants_by_maladie(db: Session, maladie_id: int):
    return db.query(Variant).filter(Variant.idMaladie == maladie_id).all()

# --- CRUD pour Continent ---
def create_continent(db: Session, nomContinent: str):
    db_continent = Continent(nomContinent=nomContinent)
    db.add(db_continent)
    db.commit()
    db.refresh(db_continent)
    return db_continent

def get_continents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Continent).offset(skip).limit(limit).all()

def get_continent(db: Session, continent_id: int):
    return db.query(Continent).filter(Continent.idContinent == continent_id).first()

def update_continent(db: Session, continent_id: int, nomContinent: str):
    db_continent = db.query(Continent).filter(Continent.idContinent == continent_id).first()
    if db_continent:
        db_continent.nomContinent = nomContinent
        db.commit()
        db.refresh(db_continent)
    return db_continent

def delete_continent(db: Session, continent_id: int):
    db_continent = db.query(Continent).filter(Continent.idContinent == continent_id).first()
    if db_continent:
        db.delete(db_continent)
        db.commit()
    return db_continent

# --- CRUD pour Symptome ---
def create_symptome(db: Session, nomSymptome: str):
    db_symptome = Symptome(nomSymptome=nomSymptome)
    db.add(db_symptome)
    db.commit()
    db.refresh(db_symptome)
    return db_symptome

def get_symptomes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Symptome).offset(skip).limit(limit).all()

def get_symptome(db: Session, symptome_id: int):
    return db.query(Symptome).filter(Symptome.idSymptome == symptome_id).first()

def update_symptome(db: Session, symptome_id: int, nomSymptome: str):
    db_symptome = db.query(Symptome).filter(Symptome.idSymptome == symptome_id).first()
    if db_symptome:
        db_symptome.nomSymptome = nomSymptome
        db.commit()
        db.refresh(db_symptome)
    return db_symptome

def delete_symptome(db: Session, symptome_id: int):
    db_symptome = db.query(Symptome).filter(Symptome.idSymptome == symptome_id).first()
    if db_symptome:
        db.delete(db_symptome)
        db.commit()
    return db_symptome

# --- CRUD pour Variant ---
def create_variant(db: Session, nomVariant: str, idMaladie: int):
    db_variant = Variant(nomVariant=nomVariant, idMaladie=idMaladie)
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    return db_variant

def get_variants(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Variant).offset(skip).limit(limit).all()

def get_variant(db: Session, variant_id: int):
    return db.query(Variant).filter(Variant.idVariant == variant_id).first()

def update_variant(db: Session, variant_id: int, variant_data: dict):
    db_variant = db.query(Variant).filter(Variant.idVariant == variant_id).first()
    if db_variant:
        for key, value in variant_data.items():
            setattr(db_variant, key, value)
        db.commit()
        db.refresh(db_variant)
    return db_variant

def delete_variant(db: Session, variant_id: int):
    db_variant = db.query(Variant).filter(Variant.idVariant == variant_id).first()
    if db_variant:
        db.delete(db_variant)
        db.commit()
    return db_variant

# --- CRUD pour Traitement ---
def create_traitement(db: Session, natureTraitement: str):
    db_traitement = Traitement(natureTraitement=natureTraitement)
    db.add(db_traitement)
    db.commit()
    db.refresh(db_traitement)
    return db_traitement

def get_traitements(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Traitement).offset(skip).limit(limit).all()

def get_traitement(db: Session, traitement_id: int):
    return db.query(Traitement).filter(Traitement.idTraitement == traitement_id).first()

def update_traitement(db: Session, traitement_id: int, natureTraitement: str):
    db_traitement = db.query(Traitement).filter(Traitement.idTraitement == traitement_id).first()
    if db_traitement:
        db_traitement.natureTraitement = natureTraitement
        db.commit()
        db.refresh(db_traitement)
    return db_traitement

def delete_traitement(db: Session, traitement_id: int):
    db_traitement = db.query(Traitement).filter(Traitement.idTraitement == traitement_id).first()
    if db_traitement:
        db.delete(db_traitement)
        db.commit()
    return db_traitement

# --- CRUD pour Pays ---
def create_pays(db: Session, isoPays: str, nomPays: str, populationTotale: int, idContinent: int, **kwargs):
    """
    Crée un nouveau pays avec les paramètres obligatoires et optionnels.
    
    Args:
        db: Session de base de données
        isoPays: Code ISO du pays
        nomPays: Nom du pays
        populationTotale: Population totale du pays
        idContinent: ID du continent auquel appartient le pays
        **kwargs: Paramètres optionnels (latitudePays, longitudePays, etc.)
    """
    db_pays = Pays(
        isoPays=isoPays,
        nomPays=nomPays,
        populationTotale=populationTotale,
        idContinent=idContinent,
        **kwargs
    )
    db.add(db_pays)
    db.commit()
    db.refresh(db_pays)
    return db_pays

def get_pays(db: Session, skip: int = 0, limit: int = 150):
    return db.query(Pays).offset(skip).limit(limit).all()

def get_pays_by_id(db: Session, pays_id: int):
    return db.query(Pays).filter(Pays.idPays == pays_id).first()

def get_pays_by_nom(db: Session, nomPays: str, skip: int = 0, limit: int = 150):
    return db.query(Pays).filter(Pays.nomPays.ilike(f"%{nomPays}%")).offset(skip).limit(limit).all()

def get_pays_by_iso(db: Session, isoPays: str, skip: int = 0, limit: int = 150):
    return db.query(Pays).filter(Pays.isoPays.ilike(f"%{isoPays}%")).offset(skip).limit(limit).all()

def get_pays_by_superficie_range(db: Session, min_superficie: int, max_superficie: int, skip: int = 0, limit: int = 150):
    return db.query(Pays).filter(
        Pays.Superficie >= min_superficie,
        Pays.Superficie <= max_superficie
    ).offset(skip).limit(limit).all()

def get_pays_by_population_range(db: Session, min_population: int, max_population: int, skip: int = 0, limit: int = 150):
    return db.query(Pays).filter(
        Pays.populationTotale >= min_population,
        Pays.populationTotale <= max_population
    ).offset(skip).limit(limit).all()

def update_pays(db: Session, pays_id: int, pays_data: dict):
    db_pays = db.query(Pays).filter(Pays.idPays == pays_id).first()
    if db_pays:
        for key, value in pays_data.items():
            setattr(db_pays, key, value)
        db.commit()
        db.refresh(db_pays)
    return db_pays

def delete_pays(db: Session, pays_id: int):
    db_pays = db.query(Pays).filter(Pays.idPays == pays_id).first()
    if db_pays:
        db.delete(db_pays)
        db.commit()
    return db_pays

def delete_pays_by_nomPays(db: Session, nomPays: str):
    pays = db.query(Pays).filter(Pays.nomPays.ilike(f"%{nomPays}%")).all()
    for pays in pays:
        db.delete(pays)
    db.commit()
    return {"deleted_count": len(pays)}

def update_pays_by_nomPays(db: Session, nomPays: str, update_data: dict):
    # Correction: utiliser nomPays au lieu de nomEtat
    pays = db.query(Pays).filter(Pays.nomPays.ilike(f"%{nomPays}%")).all()
    for p in pays:
        for key, value in update_data.items():
            setattr(p, key, value)
    db.commit()
    return {"updated_count": len(pays)}

# --- CRUD pour Region ---
def create_region(db: Session, nomEtat: str, codeEtat: str, idPays: int):
    db_region = Regions(nomEtat=nomEtat, codeEtat=codeEtat, idPays=idPays)
    db.add(db_region)
    db.commit()
    db.refresh(db_region)
    return db_region

def get_regions(db: Session, skip: int = 0, limit: int = 2000):
    return db.query(Regions).offset(skip).limit(limit).all()

def get_region(db: Session, region_id: int):
    return db.query(Regions).filter(Regions.idRegion == region_id).first()

def get_regions_by_nomEtat(db: Session, nomEtat: str, skip: int = 0, limit: int = 2000):
    return db.query(Regions).filter(Regions.nomEtat.ilike(f"%{nomEtat}%")).offset(skip).limit(limit).all()

def get_regions_by_pays(db: Session, idPays: int):
    return db.query(Regions).filter(Regions.idPays == idPays).all()


def update_region(db: Session, region_id: int, region_data: dict):
    db_region = db.query(Regions).filter(Regions.idRegion == region_id).first()
    if db_region:
        for key, value in region_data.items():
            setattr(db_region, key, value)
        db.commit()
        db.refresh(db_region)
    return db_region

def delete_region(db: Session, region_id: int):
    db_region = db.query(Regions).filter(Regions.idRegion == region_id).first()
    if db_region:
        db.delete(db_region)
        db.commit()
    return db_region

def delete_regions_by_nomEtat(db: Session, nomEtat: str):
    regions = db.query(Regions).filter(Regions.nomEtat.ilike(f"%{nomEtat}%")).all()
    for region in regions:
        db.delete(region)
    db.commit()
    return {"deleted_count": len(regions)}

def update_regions_by_nomEtat(db: Session, nomEtat: str, update_data: dict):
    regions = db.query(Regions).filter(Regions.nomEtat.ilike(f"%{nomEtat}%")).all()
    for region in regions:
        for key, value in update_data.items():
            setattr(region, key, value)
    db.commit()
    return {"updated_count": len(regions)}

# --- CRUD pour Releve ---
def create_releve(db: Session, dateReleve: str, idRegion: int, idMaladie: int, **kwargs):
    db_releve = Releve(
        dateReleve=dateReleve,
        idRegion=idRegion,
        idMaladie=idMaladie,
        **kwargs
    )
    db.add(db_releve)
    db.commit()
    db.refresh(db_releve)
    return db_releve

def get_releves(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(Releve).offset(skip).limit(limit).all()

def get_releve(db: Session, releve_id: int):
    return db.query(Releve).filter(Releve.idReleve == releve_id).first()

def get_releves_by_date_range(db: Session, start_date: str, end_date: str, skip: int = 0, limit: int = 100):
    return db.query(Releve).filter(
        Releve.dateReleve >= start_date,
        Releve.dateReleve <= end_date
    ).offset(skip).limit(limit).all()

def get_releves_by_date(db: Session, date: str, skip: int = 0, limit: int = 1000):
    return db.query(Releve).filter(Releve.dateReleve == date).offset(skip).limit(limit).all()

def update_releve(db: Session, releve_id: int, releve_data: dict):
    db_releve = db.query(Releve).filter(Releve.idReleve == releve_id).first()
    if db_releve:
        for key, value in releve_data.items():
            setattr(db_releve, key, value)
        db.commit()
        db.refresh(db_releve)
    return db_releve

def delete_releve(db: Session, releve_id: int):
    db_releve = db.query(Releve).filter(Releve.idReleve == releve_id).first()
    if db_releve:
        db.delete(db_releve)
        db.commit()
    return db_releve

def delete_releves_by_date_range(db: Session, start_date: str, end_date: str):
    releves = db.query(Releve).filter(
        Releve.dateReleve >= start_date,
        Releve.dateReleve <= end_date
    ).all()
    for releve in releves:
        db.delete(releve)
    db.commit()
    return {"deleted_count": len(releves)}

def update_releves_by_date_range(db: Session, start_date: str, end_date: str, update_data: dict):
    releves = db.query(Releve).filter(
        Releve.dateReleve >= start_date,
        Releve.dateReleve <= end_date
    ).all()
    for releve in releves:
        for key, value in update_data.items():
            setattr(releve, key, value)
    db.commit()
    return {"updated_count": len(releves)}

def get_releves_by_region_and_date_range(db: Session, idRegion: int, start_date: str, end_date: str, skip: int = 0, limit: int = 100):
    return db.query(Releve).filter(
        Releve.idRegion == idRegion,
        Releve.dateReleve >= start_date,
        Releve.dateReleve <= end_date
    ).offset(skip).limit(limit).all()
