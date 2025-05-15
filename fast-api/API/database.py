from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Remplace ces infos par les tiennes si besoin
USER = "root"
PASSWORD = ""  # Si tu n'as pas mis de mot de passe
HOST = "localhost"
PORT = 3306
DB_NAME = "dwh"

DATABASE_URL = f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

if __name__ == "__main__":
    try:
        with engine.connect() as conn:
            print("✅ Connexion à la base MySQL réussie !")
    except Exception as e:
        print("❌ Erreur de connexion :", e)
