import os
import pickle
from pathlib import Path

# Base du chemin absolu
BASE_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = BASE_DIR / "models" / "classique" / "tauxMortalite"

print(f"Chemin de vérification : {MODEL_DIR}")

# Vérifie l'existence du dossier
if not MODEL_DIR.exists():
    print("❌ Dossier introuvable.")
else:
    model_files = list(MODEL_DIR.glob("*.pkl"))
    if not model_files:
        print("❌ Aucun fichier .pkl trouvé dans le dossier.")
    for model_path in model_files:
        print(f"⏳ Vérification de : {model_path.name}")
        try:
            with open(model_path, "rb") as f:
                obj = pickle.load(f)
            print(f"   ✅ Chargé avec succès : type = {type(obj)}")
            if hasattr(obj, "predict"):
                print("   ✔️  L'objet a une méthode 'predict'")
            else:
                print("   ❌ L'objet n’a PAS de méthode 'predict'")
        except Exception as e:
            print(f"   ❌ Erreur de chargement : {e}")
