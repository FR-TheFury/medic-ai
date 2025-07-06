
# 🔌 MSPR3 API - Référence Complète des Endpoints

## Table des Matières
- [Vue d'ensemble](#vue-densemble)
- [Authentification](#authentification)
- [Endpoints Core](#endpoints-core)
- [Endpoints Prédiction](#endpoints-prédiction)
- [Endpoints Données](#endpoints-données)
- [Endpoints Administration](#endpoints-administration)
- [Codes d'erreur](#codes-derreur)

## Vue d'ensemble

L'API MSPR3 suit les standards REST avec support JSON. Base URL : `http://localhost:8000/api/v1/`

### Caractéristiques Générales
- **Format** : JSON uniquement
- **Authentification** : JWT Bearer Token
- **Rate limiting** : Varie par pays (US: 10000/h, FR: 5000/h, CH: 3000/h)
- **Versioning** : v1 (actuelle)
- **CORS** : Configuré par pays

### Headers Requis
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
Accept: application/json
X-Country-Code: us|fr|ch
```

## Authentification

### 🔐 Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "country": "us"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "country": "us"
  }
}
```

### 🔄 Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 🚪 Logout
```http
POST /api/v1/auth/logout
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

## Endpoints Core

### 🏥 Health Check
```http
GET /api/v1/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "3.0.0",
  "country": "us",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_models": "loaded"
  }
}
```

### 📊 Métriques Système
```http
GET /api/v1/metrics
```

**Requires:** Admin role

**Response (200):**
```json
{
  "cpu_usage": 45.2,
  "memory_usage": 68.7,
  "disk_usage": 23.4,
  "active_connections": 127,
  "requests_per_minute": 450,
  "response_time_avg": 120
}
```

## Endpoints Prédiction

### 🔮 Prédiction Hospitalisation
```http
POST /api/v1/prediction/hospitalisation
```

**Request Body:**
```json
{
  "population": 67000000,
  "nouveaux_cas": 15000,
  "cas_total": 2500000,
  "taux_positivite": 0.12,
  "hospitalisations_actuelles": 8500,
  "deces_total": 45000,
  "vaccinations_completes": 55000000,
  "pays": "france"
}
```

**Response (200):**
```json
{
  "prediction": {
    "hospitalisations_prevues": 9200,
    "intervalle_confiance": {
      "min": 8800,
      "max": 9600
    },
    "precision_modele": 0.87,
    "facteurs_influents": [
      {
        "facteur": "nouveaux_cas",
        "importance": 0.34
      },
      {
        "facteur": "taux_positivite", 
        "importance": 0.28
      }
    ]
  },
  "modele_utilise": "xgb_france_opt",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 📁 Prédiction par Fichier CSV
```http
POST /api/v1/prediction/hospitalisation/csv
Content-Type: multipart/form-data
```

**Request (Form Data):**
```
file: <csv_file>
pays: france
```

**CSV Format Example:**
```csv
population,nouveaux_cas,cas_total,taux_positivite,hospitalisations_actuelles,deces_total,vaccinations_completes
67000000,15000,2500000,0.12,8500,45000,55000000
65000000,12000,2300000,0.10,7800,42000,54000000
```

**Response (200):**
```json
{
  "predictions": [
    {
      "ligne": 1,
      "hospitalisations_prevues": 9200,
      "intervalle_confiance": {"min": 8800, "max": 9600}
    },
    {
      "ligne": 2,
      "hospitalisations_prevues": 8500,
      "intervalle_confiance": {"min": 8100, "max": 8900}
    }
  ],
  "statistiques": {
    "total_lignes": 2,
    "predictions_reussies": 2,
    "erreurs": 0
  }
}
```

### 🧬 Prédiction Nouveaux Cas
```http
POST /api/v1/prediction/nouveaux-cas
```

**Request Body:**
```json
{
  "population": 67000000,
  "cas_actuels": 2500000,
  "taux_transmission": 1.2,
  "mesures_sanitaires": 0.7,
  "saison": "hiver",
  "pays": "france"
}
```

### 💀 Prédiction Taux Mortalité
```http
POST /api/v1/prediction/mortalite
```

**Request Body:**
```json
{
  "population": 67000000,
  "cas_total": 2500000,
  "hospitalisations": 8500,
  "age_median": 41.2,
  "comorbidites": 0.23,
  "systeme_sante": 0.89,
  "pays": "france"
}
```

### ⏰ Prédiction Temporelle
```http
POST /api/v1/prediction/temporel
```

**Request Body:**
```json
{
  "historique_30_jours": [
    {"date": "2024-01-01", "cas": 12000, "hospitalisations": 800},
    {"date": "2024-01-02", "cas": 13500, "hospitalisations": 850},
    // ... 28 autres jours
  ],
  "pays": "suisse",
  "type_prediction": "hospitalisations"
}
```

**Response (200):**
```json
{
  "predictions_7_jours": [
    {"date": "2024-02-01", "valeur_predite": 920, "confiance": 0.85},
    {"date": "2024-02-02", "valeur_predite": 945, "confiance": 0.83},
    // ... 5 autres jours
  ],
  "modele_lstm": "suisse_GRU_optimized",
  "metriques": {
    "mse": 0.012,
    "mae": 0.089
  }
}
```

## Endpoints Données

### 🦠 Catalogue Maladies
```http
GET /api/v1/maladies
```

**Query Parameters:**
- `limit`: Nombre max de résultats (défaut: 50)
- `offset`: Décalage pour pagination (défaut: 0)
- `search`: Recherche par nom
- `category`: Filtrage par catégorie

**Response (200):**
```json
{
  "maladies": [
    {
      "id": 1,
      "nom": "COVID-19",
      "nom_scientifique": "SARS-CoV-2",
      "categorie": "Virus respiratoire",
      "contagiosite": 0.85,
      "letalite": 0.02,
      "periode_incubation": 5.1,
      "symptomes": ["fièvre", "toux", "fatigue"],
      "pays_actif": ["us", "fr", "ch"]
    }
  ],
  "total": 156,
  "page": 1,
  "pages_total": 4
}
```

### 🌍 Données Pays
```http
GET /api/v1/pays
```

**Response (200):**
```json
{
  "pays": [
    {
      "code": "fr",
      "nom": "France",
      "population": 67000000,
      "superficie": 643801,
      "capitale": "Paris",
      "langues": ["français"],
      "devise": "EUR",
      "systeme_sante": {
        "score": 0.89,
        "lits_hopital": 388000,
        "medecins_pour_1000": 3.17
      },
      "epidemiologie": {
        "maladies_endemiques": ["grippe", "gastro-enterite"],
        "vaccination_obligatoire": ["diphterie", "tetanos", "polio"]
      }
    }
  ]
}
```

### 📈 Relevés Épidémiologiques
```http
GET /api/v1/releves
```

**Query Parameters:**
- `pays`: Code pays (us, fr, ch)
- `maladie_id`: ID de la maladie
- `date_debut`: Date début (YYYY-MM-DD)
- `date_fin`: Date fin (YYYY-MM-DD)
- `limit`: Limite résultats
- `offset`: Décalage pagination

**Response (200):**
```json
{
  "releves": [
    {
      "id": 1001,
      "date": "2024-01-15",
      "pays": "fr",
      "maladie_id": 1,
      "nouveaux_cas": 15000,
      "cas_total": 2500000,
      "nouveaux_deces": 45,
      "deces_total": 45000,
      "hospitalisations": 8500,
      "guerisons": 2400000,
      "tests_effectues": 125000,
      "taux_positivite": 0.12,
      "source": "Santé Publique France"
    }
  ],
  "total": 2547,
  "statistiques": {
    "moyenne_cas_7j": 14250,
    "tendance": "stable",
    "pic_maximum": 25000
  }
}
```

### 📊 Statistiques Avancées
```http
GET /api/v1/statistiques/avancees
```

**Query Parameters:**
- `pays`: Code pays
- `periode`: Période (7j, 30j, 90j, 1an)
- `groupby`: Groupement (jour, semaine, mois)

**Response (200):**
```json
{
  "periode": "30j",
  "pays": "fr",
  "donnees": {
    "evolution_cas": [
      {"date": "2024-01-01", "valeur": 12000},
      {"date": "2024-01-02", "valeur": 13500}
    ],
    "evolution_hospitalisations": [
      {"date": "2024-01-01", "valeur": 800},
      {"date": "2024-01-02", "valeur": 850}
    ],
    "metriques": {
      "r_effectif": 1.12,
      "temps_doublement": 28.5,
      "taux_hospitalisation": 0.067,
      "taux_guerison": 0.96
    }
  }
}
```

## Endpoints Administration

### 👤 Gestion Utilisateurs
```http
GET /api/v1/admin/users
POST /api/v1/admin/users
PUT /api/v1/admin/users/{user_id}
DELETE /api/v1/admin/users/{user_id}
```

**Requires:** Admin role

### 🔧 Configuration Système
```http
GET /api/v1/admin/config
PUT /api/v1/admin/config
```

### 📝 Logs Système
```http
GET /api/v1/admin/logs
```

**Query Parameters:**
- `level`: Level de log (debug, info, warning, error)
- `service`: Service spécifique
- `date_debut`: Date début
- `date_fin`: Date fin

### 🧹 Maintenance
```http
POST /api/v1/admin/maintenance/cache-clear
POST /api/v1/admin/maintenance/db-optimize
POST /api/v1/admin/maintenance/logs-cleanup
```

## Endpoints Spécialisés par Pays

### 🇺🇸 API Technique (États-Unis uniquement)
```http
GET /api/v1/us/technique/integrations
POST /api/v1/us/technique/webhook
GET /api/v1/us/technique/performance-metrics
```

### 🇫🇷 Endpoints RGPD (France uniquement)
```http
GET /api/v1/fr/rgpd/consentement
POST /api/v1/fr/rgpd/consentement
GET /api/v1/fr/rgpd/donnees-personnelles
DELETE /api/v1/fr/rgpd/suppression-donnees
POST /api/v1/fr/rgpd/export-donnees
```

### 🇨🇭 Endpoints Multilingues (Suisse uniquement)
```http
GET /api/v1/ch/i18n/traductions
PUT /api/v1/ch/i18n/traductions
GET /api/v1/ch/langues-supportees
```

## Codes d'erreur

### Codes HTTP Standards
- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non autorisé
- `403` - Accès interdit
- `404` - Non trouvé
- `429` - Trop de requêtes
- `500` - Erreur serveur

### Format des Erreurs
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies ne sont pas valides",
    "details": {
      "field": "population",
      "issue": "Doit être un nombre positif"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

### Codes d'erreur Métier

| Code | Description |
|------|-------------|
| `MODEL_NOT_FOUND` | Modèle IA non disponible pour ce pays |
| `INSUFFICIENT_DATA` | Données insuffisantes pour prédiction |
| `COUNTRY_NOT_SUPPORTED` | Pays non supporté |
| `PREDICTION_FAILED` | Échec de la prédiction |
| `CSV_FORMAT_ERROR` | Format CSV invalide |
| `RATE_LIMIT_EXCEEDED` | Limite de requêtes dépassée |
| `RGPD_VIOLATION` | Violation des règles RGPD |

## Exemples d'utilisation

### JavaScript/Axios
```javascript
// Configuration client
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'X-Country-Code': 'fr'
  }
});

// Authentification
const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
    country: 'fr'
  });
  
  // Stocker le token
  localStorage.setItem('token', response.data.access_token);
  
  // Configurer header authorization
  apiClient.defaults.headers['Authorization'] = `Bearer ${response.data.access_token}`;
};

// Prédiction hospitalisation
const predictHospitalization = async (data) => {
  const response = await apiClient.post('/prediction/hospitalisation', data);
  return response.data;
};
```

### Python/Requests
```python
import requests

class MSPR3Client:
    def __init__(self, base_url="http://localhost:8000/api/v1", country="fr"):
        self.base_url = base_url
        self.country = country
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'X-Country-Code': country
        })
    
    def login(self, email, password):
        response = self.session.post(f"{self.base_url}/auth/login", json={
            "email": email,
            "password": password,
            "country": self.country
        })
        
        if response.status_code == 200:
            token = response.json()['access_token']
            self.session.headers['Authorization'] = f'Bearer {token}'
            return True
        return False
    
    def predict_hospitalization(self, data):
        response = self.session.post(f"{self.base_url}/prediction/hospitalisation", json=data)
        return response.json()

# Utilisation
client = MSPR3Client(country="fr")
client.login("user@example.com", "password")

prediction = client.predict_hospitalization({
    "population": 67000000,
    "nouveaux_cas": 15000,
    # ... autres données
})
```

---

Cette documentation couvre l'ensemble des endpoints disponibles dans l'API MSPR3. Pour des questions spécifiques ou des exemples d'intégration, consultez la [documentation développeur](../developer/) ou contactez l'équipe technique.
