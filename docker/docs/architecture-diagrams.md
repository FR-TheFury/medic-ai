
# Documentation UML - Architecture MSPR3 Multi-Country Platform

## Vue d'Ensemble de l'Architecture

### Diagramme d'Architecture Générale

```mermaid
graph TB
    subgraph "Load Balancer (US Only)"
        LB[Nginx Load Balancer]
    end
    
    subgraph "Frontend Layer"
        FE_US[Frontend US]
        FE_FR[Frontend FR] 
        FE_CH[Frontend CH]
    end
    
    subgraph "API Gateway Layer"
        API_US[Backend API US]
        API_FR[Backend API FR]
        API_CH[Backend API CH]
        
        ETL_US[ETL Service US]
        ETL_FR[ETL Service FR]
        ETL_CH[ETL Service CH]
        
        TECH_US[Technical API US]
    end
    
    subgraph "Data Processing Layer"
        DV_US[DataViz US - Grafana]
        DV_FR[DataViz FR - Grafana]
    end
    
    subgraph "Data Layer"
        DB_US[(MySQL US)]
        DB_FR[(MySQL FR)]
        DB_CH[(MySQL CH)]
        
        CACHE_US[(Redis US)]
        CACHE_FR[(Redis FR)]
        CACHE_CH[(Redis CH)]
    end
    
    subgraph "External Systems"
        WHO[WHO Data Sources]
        HEALTH[Health Authorities]
    end
    
    %% Connexions États-Unis
    LB --> FE_US
    FE_US --> API_US
    API_US --> DB_US
    API_US --> CACHE_US
    ETL_US --> DB_US
    ETL_US --> WHO
    TECH_US --> DB_US
    DV_US --> DB_US
    
    %% Connexions France
    FE_FR --> API_FR
    API_FR --> DB_FR
    API_FR --> CACHE_FR
    ETL_FR --> DB_FR
    ETL_FR --> HEALTH
    DV_FR --> DB_FR
    
    %% Connexions Suisse
    FE_CH --> API_CH
    API_CH --> DB_CH
    API_CH --> CACHE_CH
    ETL_CH --> DB_CH
    ETL_CH --> HEALTH
    
    classDef usStyle fill:#e1f5fe
    classDef frStyle fill:#f3e5f5
    classDef chStyle fill:#e8f5e8
    
    class FE_US,API_US,ETL_US,TECH_US,DV_US,DB_US,CACHE_US usStyle
    class FE_FR,API_FR,ETL_FR,DV_FR,DB_FR,CACHE_FR frStyle
    class FE_CH,API_CH,ETL_CH,DB_CH,CACHE_CH chStyle
```

## Diagrammes par Couche

### 1. Couche de Présentation

```mermaid
graph TD
    subgraph "Frontend Architecture"
        U[Users] --> R[React Router]
        R --> C[Components]
        C --> H[Hooks]
        H --> A[API Layer]
        A --> BE[Backend Services]
        
        subgraph "Components"
            DC[Dashboard Components]
            MC[Maladie Components]
            PC[Prediction Components]
            AC[Auth Components]
        end
        
        subgraph "State Management"
            RC[React Context]
            TQ[TanStack Query]
            LS[Local Storage]
        end
        
        C --> RC
        C --> TQ
        C --> LS
    end
    
    classDef primary fill:#2196f3,color:#fff
    classDef secondary fill:#ff9800
    
    class R,A primary
    class C,H secondary
```

### 2. Couche API et Services

```mermaid
graph TB
    subgraph "API Layer Architecture"
        FE[Frontend] --> GW[API Gateway]
        
        subgraph "Core Services"
            MAIN[Main API - FastAPI]
            ETL[ETL Service]
            TECH[Technical API - US Only]
        end
        
        subgraph "Data Services"
            PRED[Prediction Service]
            CRUD[CRUD Operations]
            AUTH[Authentication]
        end
        
        subgraph "External Integration"
            WHO_API[WHO API Integration]
            HEALTH_API[Health Authority APIs]
        end
        
        GW --> MAIN
        GW --> ETL
        GW --> TECH
        
        MAIN --> PRED
        MAIN --> CRUD
        MAIN --> AUTH
        
        ETL --> WHO_API
        ETL --> HEALTH_API
        
        MAIN --> DB[(Database)]
        ETL --> DB
        TECH --> DB
        
        MAIN --> CACHE[(Redis Cache)]
    end
    
    classDef service fill:#4caf50
    classDef data fill:#ff5722
    classDef external fill:#9c27b0
    
    class MAIN,ETL,TECH service
    class DB,CACHE data
    class WHO_API,HEALTH_API external
```

### 3. Couche de Données

```mermaid
erDiagram
    CONTINENT {
        int idContinent PK
        string nomContinent
        datetime createdAt
        datetime updatedAt
    }
    
    PAYS {
        int idPays PK
        int idContinent FK
        string nomPays
        string codePays
        int populationTotale
        string devise
        string langueOfficielle
        datetime createdAt
        datetime updatedAt
    }
    
    REGIONS {
        int idRegion PK
        int idPays FK
        string nomRegion
        string codeRegion
        int populationRegionale
        float latitude
        float longitude
        datetime createdAt
        datetime updatedAt
    }
    
    MALADIE {
        int idMaladie PK
        string nomMaladie
        string codeMaladie
        string description
        string symptomes
        string prevention
        datetime createdAt
        datetime updatedAt
    }
    
    RELEVE {
        int idReleve PK
        int idRegion FK
        int idMaladie FK
        date dateReleve
        int nbNouveauCas
        int nbDeces
        int nbHospitalisation
        int nbGuerisons
        float tauxMortalite
        float tauxIncidence
        datetime createdAt
        datetime updatedAt
    }
    
    PREDICTIONS {
        int idPrediction PK
        int idPays FK
        int idMaladie FK
        string modelType
        date datePrediction
        float valeurPredite
        float intervalleConfiance
        string parametres
        datetime createdAt
    }
    
    USERS {
        int idUser PK
        string email
        string passwordHash
        string firstName
        string lastName
        string role
        string country
        boolean isActive
        datetime lastLogin
        datetime createdAt
        datetime updatedAt
    }
    
    AUDIT_LOGS {
        int idLog PK
        int idUser FK
        string action
        string tableName
        string recordId
        json oldValues
        json newValues
        string ipAddress
        string userAgent
        datetime timestamp
    }
    
    %% Relations
    CONTINENT ||--o{ PAYS : "contient"
    PAYS ||--o{ REGIONS : "comprend"
    PAYS ||--o{ PREDICTIONS : "concerne"
    REGIONS ||--o{ RELEVE : "génère"
    MALADIE ||--o{ RELEVE : "concerne"
    MALADIE ||--o{ PREDICTIONS : "prédit"
    USERS ||--o{ AUDIT_LOGS : "effectue"
```

## Diagrammes de Déploiement

### 1. Architecture Container - États-Unis (Configuration Complète)

```mermaid
graph TB
    subgraph "Docker Network - US (172.20.0.0/16)"
        subgraph "Load Balancer"
            NGINX[Nginx Container<br/>Port 443]
        end
        
        subgraph "Application Layer"
            FE[Frontend Container<br/>React + Nginx<br/>Port 80]
            BE[Backend Container<br/>FastAPI<br/>Port 8000]
            ETL[ETL Container<br/>FastAPI<br/>Port 8001]
            TECH[Technical API<br/>FastAPI<br/>Port 8002]
        end
        
        subgraph "Visualization Layer"
            GF[Grafana Container<br/>Port 3000]
        end
        
        subgraph "Data Layer"
            MYSQL[MySQL Container<br/>Port 3306]
            REDIS[Redis Container<br/>Port 6379]
        end
        
        subgraph "Volumes"
            V_MYSQL[mysql_data]
            V_GRAFANA[grafana_data]
            V_REDIS[redis_data]
        end
    end
    
    NGINX --> FE
    FE --> BE
    BE --> MYSQL
    BE --> REDIS
    ETL --> MYSQL
    TECH --> MYSQL
    GF --> MYSQL
    
    MYSQL --> V_MYSQL
    GF --> V_GRAFANA
    REDIS --> V_REDIS
    
    classDef container fill:#e3f2fd
    classDef volume fill:#fff3e0
    
    class FE,BE,ETL,TECH,GF,MYSQL,REDIS,NGINX container
    class V_MYSQL,V_GRAFANA,V_REDIS volume
```

### 2. Architecture Container - France (Sans Technical API)

```mermaid
graph TB
    subgraph "Docker Network - FR (172.21.0.0/16)"
        subgraph "Application Layer"
            FE_FR[Frontend Container<br/>React + Nginx<br/>Port 80]
            BE_FR[Backend Container<br/>FastAPI + RGPD<br/>Port 8000]
            ETL_FR[ETL Container<br/>FastAPI<br/>Port 8001]
        end
        
        subgraph "Visualization Layer"
            GF_FR[Grafana Container<br/>Port 3000]
        end
        
        subgraph "Data Layer"
            MYSQL_FR[MySQL Container<br/>RGPD Compliant<br/>Port 3306]
            REDIS_FR[Redis Container<br/>Port 6379]
        end
        
        subgraph "Security Layer"
            SSL[SSL/TLS Certificates]
            ENC[Data Encryption]
        end
    end
    
    FE_FR --> BE_FR
    BE_FR --> MYSQL_FR
    BE_FR --> REDIS_FR
    ETL_FR --> MYSQL_FR
    GF_FR --> MYSQL_FR
    
    BE_FR -.-> SSL
    MYSQL_FR -.-> ENC
    
    classDef container fill:#f3e5f5
    classDef security fill:#ffebee
    
    class FE_FR,BE_FR,ETL_FR,GF_FR,MYSQL_FR,REDIS_FR container
    class SSL,ENC security
```

### 3. Architecture Container - Suisse (Configuration Minimale)

```mermaid
graph TB
    subgraph "Docker Network - CH (172.22.0.0/16)"
        subgraph "Application Layer"
            FE_CH[Frontend Container<br/>React + i18n<br/>Port 80]
            BE_CH[Backend Container<br/>FastAPI<br/>Port 8000]
            ETL_CH[ETL Container<br/>FastAPI<br/>Port 8001]
        end
        
        subgraph "Data Layer"
            MYSQL_CH[MySQL Container<br/>Port 3306]
            REDIS_CH[Redis Container<br/>Port 6379]
        end
        
        subgraph "Localization"
            I18N[i18n Files<br/>FR/DE/IT]
        end
    end
    
    FE_CH --> BE_CH
    BE_CH --> MYSQL_CH
    BE_CH --> REDIS_CH
    ETL_CH --> MYSQL_CH
    
    FE_CH -.-> I18N
    
    classDef container fill:#e8f5e8
    classDef locale fill:#fff8e1
    
    class FE_CH,BE_CH,ETL_CH,MYSQL_CH,REDIS_CH container
    class I18N locale
```

## Diagrammes de Sécurité

### 1. Architecture de Sécurité - France (RGPD)

```mermaid
graph TB
    subgraph "RGPD Security Architecture"
        subgraph "Authentication Layer"
            JWT[JWT Tokens]
            OAUTH[OAuth 2.0]
            MFA[Multi-Factor Auth]
        end
        
        subgraph "Authorization Layer"
            RBAC[Role-Based Access Control]
            PERM[Permissions Matrix]
            AUDIT[Audit Trail]
        end
        
        subgraph "Data Protection"
            ENC_REST[Encryption at Rest]
            ENC_TRANSIT[Encryption in Transit]
            ANON[Data Anonymization]
            BACKUP[Secure Backups]
        end
        
        subgraph "Compliance"
            GDPR[GDPR Compliance]
            DPO[Data Protection Officer]
            CONSENT[Consent Management]
            RIGHT[Right to be Forgotten]
        end
        
        subgraph "Monitoring"
            SIEM[Security Monitoring]
            ALERT[Alert System]
            LOG[Security Logs]
        end
    end
    
    JWT --> RBAC
    OAUTH --> PERM
    MFA --> AUDIT
    
    RBAC --> ENC_REST
    PERM --> ENC_TRANSIT
    AUDIT --> ANON
    
    ENC_REST --> GDPR
    ANON --> CONSENT
    BACKUP --> RIGHT
    
    AUDIT --> SIEM
    SIEM --> ALERT
    ALERT --> LOG
    
    classDef auth fill:#2196f3,color:#fff
    classDef protect fill:#4caf50,color:#fff
    classDef comply fill:#ff9800,color:#fff
    classDef monitor fill:#9c27b0,color:#fff
    
    class JWT,OAUTH,MFA auth
    class ENC_REST,ENC_TRANSIT,ANON,BACKUP protect
    class GDPR,DPO,CONSENT,RIGHT comply
    class SIEM,ALERT,LOG monitor
```

## Diagrammes de Performance

### 1. Architecture Haute Performance - États-Unis

```mermaid
graph TB
    subgraph "High Performance Architecture"
        subgraph "Load Balancing"
            LB[Nginx Load Balancer]
            HM[Health Monitoring]
        end
        
        subgraph "Application Scaling"
            API1[Backend Instance 1]
            API2[Backend Instance 2]
            API3[Backend Instance 3]
        end
        
        subgraph "Database Optimization"
            MYSQL_M[MySQL Master]
            MYSQL_S[MySQL Slave]
            IDX[Database Indexes]
        end
        
        subgraph "Caching Strategy"
            REDIS_1[Redis Cluster 1]
            REDIS_2[Redis Cluster 2]
            CDN[Content Delivery Network]
        end
        
        subgraph "Monitoring"
            PROM[Prometheus]
            GRAF[Grafana]
            ALERT_M[Alert Manager]
        end
    end
    
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> MYSQL_M
    API2 --> MYSQL_M
    API3 --> MYSQL_M
    
    MYSQL_M --> MYSQL_S
    
    API1 --> REDIS_1
    API2 --> REDIS_2
    
    LB --> CDN
    
    HM --> PROM
    PROM --> GRAF
    PROM --> ALERT_M
    
    classDef lb fill:#ff5722,color:#fff
    classDef app fill:#2196f3,color:#fff
    classDef data fill:#4caf50,color:#fff
    classDef cache fill:#ff9800,color:#fff
    classDef monitor fill:#9c27b0,color:#fff
    
    class LB,HM lb
    class API1,API2,API3 app
    class MYSQL_M,MYSQL_S,IDX data
    class REDIS_1,REDIS_2,CDN cache
    class PROM,GRAF,ALERT_M monitor
```

## Conclusion

Cette documentation UML fournit une vue complète de l'architecture MSPR3 Multi-Country Platform, incluant :

- **Architecture générale** avec les différentes couches
- **Modèle de données** avec les relations entre entités
- **Architecture de déploiement** spécifique à chaque pays
- **Sécurité et conformité** notamment pour la France (RGPD)
- **Performance et scalabilité** pour les États-Unis

L'architecture est conçue pour être :
- **Scalable** : Peut gérer de grandes volumes de données
- **Sécurisée** : Conforme aux réglementations locales
- **Flexible** : Adaptable aux besoins spécifiques de chaque pays
- **Maintenant** : Architecture modulaire et bien documentée

---
*Documentation générée pour MSPR3 - Architecture Multi-Country Platform*
