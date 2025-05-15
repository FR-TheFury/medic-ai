from sqlalchemy import Column, Integer, String, DECIMAL, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

# Table d'association Many-to-Many : Genere
genere = Table(
    "Genere",
    Base.metadata,
    Column("idSymptome", Integer, ForeignKey("Symptome.idSymptome"), primary_key=True),
    Column("idVariant", Integer, ForeignKey("Variant.idVariant"), primary_key=True)
)

# Table d'association Many-to-Many : Possede
possede = Table(
    "Possede",
    Base.metadata,
    Column("idMaladie", Integer, ForeignKey("Maladie.idMaladie"), primary_key=True),
    Column("idTraitement", Integer, ForeignKey("Traitement.idTraitement"), primary_key=True)
)

class Maladie(Base):
    __tablename__ = "Maladie"
    idMaladie = Column(Integer, primary_key=True, autoincrement=True)
    nomMaladie = Column(String(50))

    variants = relationship("Variant", back_populates="maladie")
    traitements = relationship("Traitement", secondary=possede, back_populates="maladies")
    releves = relationship("Releve", back_populates="maladie")

class Continent(Base):
    __tablename__ = "Continent"
    idContinent = Column(Integer, primary_key=True, autoincrement=True)
    nomContinent = Column(String(50))

    pays = relationship("Pays", back_populates="continent")

class Symptome(Base):
    __tablename__ = "Symptome"
    idSymptome = Column(Integer, primary_key=True, autoincrement=True)
    nomSymptome = Column(String(50))

    variants = relationship("Variant", secondary=genere, back_populates="symptomes")

class Variant(Base):
    __tablename__ = "Variant"
    idVariant = Column(Integer, primary_key=True, autoincrement=True)
    nomVariant = Column(String(50))
    idMaladie = Column(Integer, ForeignKey("Maladie.idMaladie"), nullable=False)

    maladie = relationship("Maladie", back_populates="variants")
    symptomes = relationship("Symptome", secondary=genere, back_populates="variants")

class Traitement(Base):
    __tablename__ = "Traitement"
    idTraitement = Column(Integer, primary_key=True, autoincrement=True)
    natureTraitement = Column(String(100))

    maladies = relationship("Maladie", secondary=possede, back_populates="traitements")

class Pays(Base):
    __tablename__ = "Pays"
    idPays = Column(Integer, primary_key=True, autoincrement=True)
    isoPays = Column(String(3))
    nomPays = Column(String(50))
    populationTotale = Column(Integer)
    latitudePays = Column(DECIMAL(15, 2))
    longitudePays = Column(DECIMAL(15, 2))
    Superficie = Column(DECIMAL(15, 2))
    densitePopulation = Column(DECIMAL(15, 1))
    idContinent = Column(Integer, ForeignKey("Continent.idContinent"), nullable=False)

    continent = relationship("Continent", back_populates="pays")
    regions = relationship("Regions", back_populates="pays")

class Regions(Base):
    __tablename__ = "Regions"
    idRegion = Column(Integer, primary_key=True, autoincrement=True)
    nomEtat = Column(String(50))
    codeEtat = Column(String(50))
    lattitudeRegion = Column(DECIMAL(15, 2))
    longitudeRegion = Column(DECIMAL(15, 2))
    idPays = Column(Integer, ForeignKey("Pays.idPays"), nullable=False)

    pays = relationship("Pays", back_populates="regions")
    releves = relationship("Releve", back_populates="region")

class Releve(Base):
    __tablename__ = "Releve"
    idReleve = Column(Integer, primary_key=True, autoincrement=True)
    dateReleve = Column(Date, nullable=False)
    nbNouveauCas = Column(Integer)
    nbDeces = Column(Integer)
    nbGueri = Column(Integer)
    nbHospitalisation = Column(Integer)
    nbHospiSoinsIntensif = Column(Integer)
    nbVaccineTotalement = Column(Integer)
    nbSousRespirateur = Column(Integer)
    nbVaccine = Column(Integer)
    nbTeste = Column(Integer)
    idRegion = Column(Integer, ForeignKey("Regions.idRegion"), nullable=False)
    idMaladie = Column(Integer, ForeignKey("Maladie.idMaladie"), nullable=False)

    region = relationship("Regions", back_populates="releves")
    maladie = relationship("Maladie", back_populates="releves")
