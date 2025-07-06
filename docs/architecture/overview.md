
# 🏗️ Architecture MSPR3 - Vue d'ensemble Technique

## Table des Matières
- [Architecture Générale](#architecture-générale)
- [Microservices](#microservices)
- [Flux de Données](#flux-de-données)
- [Technologies](#technologies)
- [Sécurité](#sécurité)
- [Performance](#performance)

## Architecture Générale

MSPR3 suit une **architecture microservices containerisée** conçue pour la scalabilité internationale et la maintenance simplifiée.

### Diagramme d'Architecture Global

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        LB[Nginx Load Balancer]
    end
    
    subgraph "Frontend Layer"
        subgraph "US Frontend"
            FE_US[React App US]
        end
        subgraph "FR Frontend" 
            FE_FR[React App FR]
        end
        subgraph "CH Frontend"
            FE_CH[React App CH]
        end
    end
    
    subgraph "API Gateway Layer"
        GATEWAY[API Gateway]
    end
    
    subgraph "Microservices Layer"
        subgraph "Core Services"
            API[FastAPI Backend]
            ETL[ETL Service]
        end
        subgraph "Specialized Services"
            TECH[API Technique - US Only]
            AI[AI Prediction Service]
        end
    end
    
    subgraph "Data Layer"
        subgraph "Databases"
            DB_US[(MySQL US)]
            DB_FR[(MySQL FR)]
            DB_CH[(MySQL CH)]
        end
        subgraph "Cache Layer"
            REDIS_US[(Redis US)]
            REDIS_FR[(Redis FR)]
            REDIS_CH[(Redis CH)]
        end
    end
    
    subgraph "Monitoring Layer"
        GRAF[Grafana]
        PROM[Prometheus]
        ALERT[AlertManager]
    end
    
    subgraph "External APIs"
        WHO[WHO API]
        ECDC[ECDC API]
        CDC[CDC API]
    end
    
    LB --> FE_US
    LB --> FE_FR  
    LB --> FE_CH
    
    FE_US --> GATEWAY
    FE_FR --> GATEWAY
    FE_CH --> GATEWAY
    
    GATEWAY --> API
    GATEWAY --> ETL
    GATEWAY --> TECH
    GATEWAY --> AI
    
    API --> DB_US
    API --> DB_FR
    API --> DB_CH
    
    ETL --> DB_US
    ETL --> DB_FR
    ETL --> DB_CH
    
    API --> REDIS_US
    API --> REDIS_FR
    API --> REDIS_CH
    
    ETL --> WHO
    ETL --> ECDC
    ETL --> CDC
    
    PROM --> API
    PROM --> ETL
    PROM --> TECH
    GRAF --> PROM
    ALERT --> PROM
```

## Microservices

### 1. Frontend Service (React)
**Rôle** : Interface utilisateur responsive et accessible

**Technologies** :
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts pour visualisation
- React Router pour navigation

**Spécificités par pays** :
- **US** : Thème haute performance, API technique intégrée
- **FR** : Interface RGPD-compliant, cookies management
- **CH** : Support multilingue (FR/DE/IT), adaptation culturelle

### 2. Backend API Service (FastAPI)
**Rôle** : API REST principale avec logique métier

**Endpoints principaux** :
```
/api/v1/
├── auth/           # Authentification
├── predictions/    # Prédictions IA
├── maladies/      # Catalogue des maladies
├── pays/          # Données géographiques
├── releves/       # Relevés épidémiologiques
└── health/        # Health checks
```

**Fonctionnalités** :
- Authentification JWT
- Validation Pydantic
- ORM SQLAlchemy
- Cache Redis intégré
- Rate limiting par pays

### 3. ETL Service (Extract, Transform, Load)
**Rôle** : Collecte et traitement des données externes

**Sources de données** :
- **WHO** : Données mondiales OMS
- **ECDC** : Centre européen de prévention
- **CDC** : Centers for Disease Control (US)
- **API nationales** : Sources locales par pays

**Pipeline ETL** :
```mermaid
graph LR
    A[Extract] --> B[Transform]
    B --> C[Validate]
    C --> D[Load]
    D --> E[Cache]
    E --> F[Notify]
```

### 4. API Technique Service (US uniquement)
**Rôle** : API spécialisée pour intégrations tierces

**Fonctionnalités** :
- Endpoints B2B
- Rate limiting élevé
- Documentation OpenAPI
- Monitoring avancé
- Support technique dédié

### 5. DataViz Service (US/FR uniquement)
**Rôle** : Visualisation avancée avec Grafana

**Dashboards** :
- **Executive Dashboard** : KPIs généraux
- **Operational Dashboard** : Monitoring temps réel
- **Prediction Dashboard** : Résultats IA
- **Country-specific** : Métriques par pays

### 6. AI Prediction Service
**Rôle** : Modèles d'intelligence artificielle

**Modèles disponibles** :
- **Hospitalisation** : Prédiction des admissions
- **Nouveaux cas** : Évolution épidémique
- **Taux mortalité** : Risk assessment
- **Temporels** : Prédictions LSTM

## Flux de Données

### 1. Flux Utilisateur Standard
```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant G as Gateway
    participant A as API Backend
    participant D as Database
    participant C as Cache
    
    U->>F: Accès application
    F->>G: Requête API
    G->>A: Route vers service
    A->>C: Check cache
    alt Cache Hit
        C-->>A: Données cached
    else Cache Miss
        A->>D: Query database
        D-->>A: Résultats
        A->>C: Store in cache
    end
    A-->>G: Réponse
    G-->>F: Données
    F-->>U: Interface mise à jour
```

### 2. Flux Prédiction IA
```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant A as API Backend
    participant AI as AI Service
    participant M as Modèles ML
    
    U->>F: Demande prédiction
    F->>A: POST /predictions/
    A->>AI: Prépare données
    AI->>M: Charge modèle pays
    M-->>AI: Prédiction
    AI-->>A: Résultat formaté
    A-->>F: Réponse JSON
    F-->>U: Affichage graphique
```

### 3. Flux ETL
```mermaid
sequenceDiagram
    participant S as Scheduler
    participant E as ETL Service
    participant EXT as APIs Externes
    participant D as Database
    participant N as Notifications
    
    S->>E: Déclenchement ETL
    E->>EXT: Collecte données
    EXT-->>E: Raw data
    E->>E: Transform & Validate
    E->>D: Load data
    E->>N: Notification succès
    N-->>S: Confirmation
```

## Technologies

### Stack Technique Détaillé

#### Frontend
```yaml
Base:
  - React: 18.3.1
  - TypeScript: 5.0+
  - Vite: 5.0+

UI/UX:
  - Tailwind CSS: 3.4+
  - shadcn/ui: Latest
  - Lucide Icons: 0.400+
  - Recharts: 2.12+

State Management:
  - React Query: 5.0+
  - Context API: Built-in
  - Local Storage: Web API

Routing:
  - React Router: 6.26+
  - Protected Routes: Custom
  - Lazy Loading: React.lazy
```

#### Backend
```yaml
Core:
  - Python: 3.11+
  - FastAPI: 0.100+
  - Uvicorn: 0.23+

Database:
  - MySQL: 8.0+
  - SQLAlchemy: 2.0+
  - Alembic: 1.12+

Cache:
  - Redis: 7.0+
  - Redis-py: 5.0+

AI/ML:
  - scikit-learn: 1.3+
  - pandas: 2.0+
  - numpy: 1.24+
  - joblib: 1.3+
```

#### Infrastructure
```yaml
Containerization:
  - Docker: 20.10+
  - Docker Compose: 2.0+
  - Multi-stage builds: Yes

Orchestration:
  - Kubernetes: 1.28+ (bonus)
  - Helm: 3.12+ (bonus)

CI/CD:
  - GitHub Actions: Latest
  - Docker Registry: Docker Hub
  - Automated testing: pytest

Monitoring:
  - Grafana: 10.0+
  - Prometheus: 2.40+
  - AlertManager: 0.25+
```

## Sécurité

### Architecture de Sécurité

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            FW[Firewall]
            SSL[SSL/TLS]
            VPN[VPN Access]
        end
        
        subgraph "Application Security"
            AUTH[JWT Authentication]
            AUTHZ[Authorization]
            VALID[Input Validation]
        end
        
        subgraph "Data Security"
            ENCRYPT[Encryption at Rest]
            TRANSIT[Encryption in Transit]
            BACKUP[Secure Backups]
        end
        
        subgraph "Compliance"
            GDPR[RGPD Compliance]
            AUDIT[Audit Logs]
            PRIVACY[Data Privacy]
        end
    end
```

### Mesures Implémentées

#### 1. Authentification & Autorisation
- **JWT Tokens** : Expiration 24h, refresh tokens
- **Multi-factor Authentication** : TOTP support
- **Role-based Access Control** : Admin, User, Read-only
- **Session Management** : Secure cookies, CSRF protection

#### 2. Chiffrement
- **HTTPS obligatoire** : TLS 1.3 minimum
- **Base de données** : Encryption at rest (MySQL 8.0)
- **Communications** : TLS inter-services
- **Secrets** : HashiCorp Vault ou Docker Secrets

#### 3. Conformité RGPD (France)
- **Consentement** : Gestion explicite des cookies
- **Droit à l'oubli** : API de suppression
- **Portabilité** : Export données utilisateur
- **Audit trails** : Logs conformes CNIL

#### 4. Monitoring Sécurité
- **Intrusion Detection** : Fail2ban
- **Vulnerability Scanning** : Trivy dans CI/CD
- **Log Analysis** : ELK Stack (bonus)
- **Incident Response** : Procédures documentées

## Performance

### Optimisations par Couche

#### 1. Frontend
- **Code splitting** : Routes et composants lazy
- **Tree shaking** : Bundle optimization Vite
- **Caching** : Service Worker, API cache
- **CDN** : Assets statiques
- **Image optimization** : WebP, lazy loading

#### 2. Backend
- **Connection pooling** : SQLAlchemy optimisé
- **Query optimization** : Index database, N+1 prevention
- **Caching strategy** : Redis multi-layer
- **Async processing** : FastAPI async/await
- **Rate limiting** : Protection DDoS

#### 3. Base de Données
- **Indexing strategy** : Colonnes frequently queried
- **Partitioning** : Tables par pays/date
- **Read replicas** : Load balancing lectures
- **Query optimization** : EXPLAIN plans
- **Connection management** : Pool size adaptatif

#### 4. Infrastructure
- **Load balancing** : Nginx upstream
- **Auto-scaling** : Kubernetes HPA (bonus)
- **Resource limits** : CPU/Memory constraints
- **Health checks** : Liveness/Readiness probes
- **Metrics collection** : Prometheus exporters

### Benchmarks de Performance

| Métrique | US (Haute Perf) | FR (Standard) | CH (Optimisé) |
|----------|-----------------|---------------|---------------|
| **Response Time** | < 100ms | < 200ms | < 150ms |
| **Throughput** | 1000 req/s | 500 req/s | 300 req/s |
| **Availability** | 99.9% | 99.5% | 99.7% |
| **Concurrent Users** | 10,000 | 5,000 | 2,000 |

---

Cette architecture garantit une **scalabilité internationale**, une **sécurité renforcée** et des **performances optimales** pour chaque contexte pays.
