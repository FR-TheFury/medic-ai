
# MSPR3 - Plateforme de Santé Multi-Pays
## Suivi et Prédiction de Pandémies Mondiales

---

## Slide 1: Page de Titre

### 🌍 MSPR3 - Plateforme de Santé Multi-Pays
**Suivi et Prédiction de Pandémies Mondiales**

**Équipe Projet :**
- **Téo Debay** - Lead Developer & Architecture complète
- **Jérome Rose** - AI Specialist & Modèles de prédiction  
- **Hodari Bigwi** - QA Engineer & Tests/Documentation
- **Martin Beaucheron** - Accessibility Expert & Conformité WCAG

**Technologies :** React 18 | FastAPI | MySQL | Docker | IA/ML | Multi-Country

**Version :** 3.0.0 | **Date :** 2025

---

## Slide 2: Introduction & Vision

### 🎯 Vision du Projet
**Créer une plateforme internationale de surveillance épidémiologique avec prédictions IA**

**Objectifs Principaux :**
- ✅ Surveillance temps réel des pandémies mondiales
- ✅ Prédictions IA pour hospitalisation, mortalité, nouveaux cas
- ✅ Support multi-pays (US, France, Suisse)
- ✅ Interface intuitive pour autorités sanitaires
- ✅ Architecture containerisée et scalable

**Impact Attendu :**
- 📊 Aide à la décision pour les autorités sanitaires
- 🔮 Anticipation des vagues épidémiques
- 🌍 Coordination internationale des réponses sanitaires
- 📈 Optimisation des ressources hospitalières

---

## Slide 3: Contexte & Problématique

### 📈 Enjeux de Santé Publique

**Problématiques Identifiées :**
- **Manque de visibilité** sur l'évolution des pandémies
- **Données fragmentées** entre pays et organismes
- **Réaction tardive** aux pics épidémiques
- **Ressources hospitalières** sous-optimisées
- **Coordination internationale** insuffisante

**Besoins Exprimés :**
- 🔍 **Surveillance centralisée** des données épidémiologiques
- 🤖 **Prédictions fiables** basées sur l'IA
- 🌐 **Vision globale** avec spécificités locales
- ⚡ **Alertes précoces** pour les autorités
- 📱 **Interface accessible** aux non-techniciens

**Solution MSPR3 :**
Plateforme unifiée combinant collecte de données, IA prédictive et visualisation multi-pays

---

## Slide 4: Stack Technique & Justifications

### 🛠️ Technologies Choisies

**Frontend - React 18 + TypeScript**
```
✅ Interface moderne et responsive
✅ Écosystème riche (shadcn/ui, Recharts)
✅ TypeScript pour la sécurité des types
✅ Performance optimisée avec Vite
```

**Backend - FastAPI + Python**
```
✅ API REST haute performance
✅ Documentation automatique (OpenAPI)
✅ Écosystème IA/ML intégré
✅ Validation automatique des données
```

**Base de Données - MySQL 8.0**
```
✅ Robustesse pour données critiques
✅ Support natif du JSON
✅ Réplication master/slave
✅ Chiffrement natif
```

**IA/ML - scikit-learn + pandas**
```
✅ Modèles prédictifs optimisés
✅ 36 modèles pré-entraînés
✅ Support des modèles temporels (LSTM/GRU)
✅ Pipeline ETL automatisé
```

---

## Slide 5: Architecture Base de Données & ETL

### 💾 Modèle de Données Relationnel

```
CONTINENT ←→ PAYS ←→ REGIONS ←→ RELEVE ←→ MALADIE
    ↓           ↓         ↓         ↓        ↓
POPULATION  DEVISE   LATITUDE  TENDANCES  SYMPTOMES
  STATS     LANGUE   LONGITUDE   PICS     PREVENTION
```

**Tables Principales :**
- **PAYS** : 3 pays supportés (US, FR, CH)
- **MALADIE** : Catalogue des pathologies
- **RELEVE** : Données épidémiologiques quotidiennes
- **PREDICTIONS** : Résultats des modèles IA
- **USERS** : Gestion des utilisateurs
- **AUDIT_LOGS** : Traçabilité complète

**Service ETL :**
- 🔄 Collecte automatique (WHO, ECDC, CDC)
- 🔍 Validation et nettoyage des données
- 📊 Enrichissement avec données contextuelles
- ⚡ Mise à jour temps réel

---

## Slide 6: API IA, Frontend & DataViz

### 🚀 Couches Applicatives

**API Backend (FastAPI)**
```
/api/v1/
├── auth/           # JWT + Multi-factor
├── predictions/    # 4 types de prédictions
├── maladies/      # Catalogue pathologies
├── pays/          # Données géographiques
├── releves/       # Données épidémio
└── admin/         # Interface d'administration
```

**Frontend React**
- 📱 **Responsive Design** - Mobile-first
- ♿ **Accessibilité WCAG** - Support complet
- 🎨 **UI/UX Moderne** - shadcn/ui + Tailwind
- 📊 **Visualisations** - Recharts intégré
- 🔒 **Authentification** - JWT sécurisé

**DataViz (US/FR uniquement)**
- 📈 **Grafana Dashboards** - Temps réel
- 🔍 **Monitoring Avancé** - Prometheus
- 🚨 **Alertes Automatiques** - Seuils configurables
- 📊 **KPIs Exécutifs** - Vue d'ensemble

---

## Slide 7: Objectifs Techniques & KPIs

### 🎯 Performances & Métriques

**Objectifs de Performance :**

| Métrique | US (Haute Perf) | FR (Standard) | CH (Optimisé) |
|----------|-----------------|---------------|---------------|
| **Response Time** | < 100ms | < 200ms | < 150ms |
| **Throughput** | 1000 req/s | 500 req/s | 300 req/s |
| **Availability** | 99.9% | 99.5% | 99.7% |
| **Concurrent Users** | 10,000 | 5,000 | 2,000 |

**KPIs Techniques :**
- ✅ **Couverture Tests** : 95%+
- ✅ **Lignes de Code** : 50,000+
- ✅ **Services** : 6 microservices
- ✅ **Modèles IA** : 36 modèles pré-entraînés
- ✅ **Sécurité** : Conformité RGPD (FR)

**Objectifs Métier :**
- 🎯 Réduction 30% temps de réaction aux épidémies
- 🎯 Amélioration 25% allocation ressources hospitalières
- 🎯 Coordination 3 pays en temps réel

---

## Slide 8: Architecture Logique

### 🏗️ Vue d'Ensemble Conceptuelle

```
┌─────────────────────────────────────────────────────────┐
│                LOAD BALANCER (US)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────────────────┐
    │             │             │                         │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐                     │
│ FE-US │    │ FE-FR │    │ FE-CH │                     │
│React  │    │React  │    │React  │                     │
│+i18n  │    │+RGPD  │    │+Multi │                     │
└───┬───┘    └───┬───┘    └───┬───┘                     │
    │            │            │                         │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐                     │
│API-US │    │API-FR │    │API-CH │                     │
│+Tech  │    │       │    │       │                     │
└───┬───┘    └───┬───┘    └───┬───┘                     │
    │            │            │                         │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐                     │
│ DB-US │    │ DB-FR │    │ DB-CH │                     │
│+Redis │    │+Redis │    │+Cache │                     │
└───────┘    └───────┘    └───────┘                     │
```

**Principe de Séparation :**
- 🌐 **Réseau isolé** par pays
- 🔒 **Données localisées** (RGPD FR)
- ⚡ **Performance adaptée** aux besoins
- 🛠️ **Services spécialisés** (API Tech US)

---

## Slide 9: Architecture Technique Détaillée

### ⚙️ Diagramme Technique Complet

```
External APIs          Application Layer              Data Layer
─────────────         ─────────────────────         ───────────
┌─────────┐           ┌─────────────────────┐       ┌─────────┐
│   WHO   │────────→  │    ETL SERVICE      │────→  │  MySQL  │
│   API   │           │  Data Processing    │       │ Master  │
└─────────┘           └─────────────────────┘       └────┬────┘
                                                          │
┌─────────┐           ┌─────────────────────┐            │
│  ECDC   │────────→  │   BACKEND API       │←───────────┘
│   API   │           │   FastAPI + IA      │
└─────────┘           └─────────────────────┘       ┌─────────┐
                               │                    │  Redis  │
┌─────────┐           ┌─────────────────────┐       │  Cache  │
│   CDC   │           │   FRONTEND REACT    │←──────┴─────────┘
│   API   │           │   UI/UX + Charts    │
└─────────┘           └─────────────────────┘       ┌─────────┐
                               │                    │ Grafana │
                      ┌─────────────────────┐       │DataViz  │
                      │   TECHNICAL API     │←──────┴─────────┘
                      │   (US Only)         │
                      └─────────────────────┘
```

**Flux de Données :**
1. **Collecte** → APIs externes vers ETL
2. **Traitement** → ETL vers Base de données
3. **Prédiction** → IA via Backend API
4. **Visualisation** → Frontend + Grafana
5. **Monitoring** → Logs + Métriques

---

## Slide 10: Conteneurisation Docker

### 🐳 Architecture Containerisée

**Conteneurs par Pays :**

```
États-Unis (7 services)    France (6 services)      Suisse (5 services)
─────────────────────      ─────────────────────    ─────────────────────
┌─────────────────────┐    ┌─────────────────────┐  ┌─────────────────────┐
│  Nginx Load Balancer│    │                     │  │                     │
└─────────────────────┘    │                     │  │                     │
┌─────────────────────┐    ┌─────────────────────┐  ┌─────────────────────┐
│   React Frontend    │    │   React Frontend    │  │   React Frontend    │
│   + High Perf       │    │   + RGPD            │  │   + Multilingual    │
└─────────────────────┘    └─────────────────────┘  └─────────────────────┘
┌─────────────────────┐    ┌─────────────────────┐  ┌─────────────────────┐
│   FastAPI Backend   │    │   FastAPI Backend   │  │   FastAPI Backend   │
└─────────────────────┘    └─────────────────────┘  └─────────────────────┘
┌─────────────────────┐    ┌─────────────────────┐  ┌─────────────────────┐
│   ETL Service       │    │   ETL Service       │  │   ETL Service       │
└─────────────────────┘    └─────────────────────┘  └─────────────────────┘
┌─────────────────────┐    ┌─────────────────────┐  ┌─────────────────────┐
│  Technical API      │    │   Grafana DataViz   │  │   MySQL Database    │
└─────────────────────┘    └─────────────────────┘  └─────────────────────┘
┌─────────────────────┐    ┌─────────────────────┐  ┌─────────────────────┐
│   Grafana DataViz   │    │   MySQL Database    │  │   Redis Cache       │
└─────────────────────┘    └─────────────────────┘  └─────────────────────┘
┌─────────────────────┐    ┌─────────────────────┐
│   MySQL Database    │    │   Redis Cache       │
└─────────────────────┘    └─────────────────────┘
┌─────────────────────┐
│    Redis Cache      │
└─────────────────────┘
```

**Réseaux Isolés :**
- US: `172.20.0.0/16`
- FR: `172.21.0.0/16`  
- CH: `172.22.0.0/16`

---

## Slide 11: Docker Compose & Configuration

### 📋 Orchestration Multi-Environnements

**Fichiers de Configuration :**
```
docker/
├── docker-compose.us.yml    # Configuration complète
├── docker-compose.fr.yml    # Sans API technique
├── docker-compose.ch.yml    # Configuration minimale
├── deploy.sh               # Script principal
└── scripts/
    ├── deploy-us.sh        # Déploiement US
    ├── deploy-fr.sh        # Déploiement FR
    └── deploy-ch.sh        # Déploiement CH
```

**Variables d'Environnement par Pays :**

| Variable | US | FR | CH |
|----------|----|----|----| 
| `COUNTRY_CODE` | us | fr | ch |
| `DATABASE_NAME` | dwh_us | dwh_fr | dwh_ch |
| `REDIS_DB` | 0 | 1 | 2 |
| `API_RATE_LIMIT` | 10000/h | 5000/h | 3000/h |
| `GDPR_COMPLIANCE` | false | true | false |
| `LANGUAGES` | en | fr | fr,de,it |

**Volumes Persistants :**
- `mysql_data` : Données de base
- `grafana_data` : Dashboards
- `redis_data` : Cache

---

## Slide 12: Scripts de Déploiement

### 🚀 Automatisation du Déploiement

**Script Principal (`deploy.sh`) :**
```bash
#!/bin/bash
# Déploiement multi-pays simplifié

./deploy.sh us     # États-Unis (complet)
./deploy.sh fr     # France (sans API technique)  
./deploy.sh ch     # Suisse (minimal)

# Options avancées
./deploy.sh us --build    # Reconstruction
./deploy.sh fr --clean    # Nettoyage
./deploy.sh ch --logs     # Affichage logs
./deploy.sh us --stop     # Arrêt services
```

**Fonctionnalités Automatisées :**
- ✅ **Validation** des prérequis (Docker, mémoire)
- ✅ **Nettoyage** automatique des ressources
- ✅ **Health checks** des services
- ✅ **Configuration** dynamique par pays
- ✅ **Logs** centralisés et monitoring
- ✅ **Rollback** en cas d'échec

**Temps de Déploiement :**
- **US (complet)** : ~5 minutes
- **FR (standard)** : ~4 minutes
- **CH (minimal)** : ~3 minutes

---

## Slide 13: Internationalisation Multi-Pays

### 🌍 Support Multi-Country

**Spécificités par Pays :**

**🇺🇸 États-Unis - Configuration Haute Performance**
```
✅ API Technique pour intégrations B2B
✅ Load Balancer Nginx
✅ Performance optimisée (< 100ms)
✅ Grafana + Prometheus monitoring
✅ Support 10,000 utilisateurs concurrent
```

**🇫🇷 France - Conformité RGPD**
```
✅ Chiffrement des données personnelles
✅ Gestion des consentements cookies
✅ Droit à l'oubli implémenté
✅ Audit trails conformes CNIL
✅ Interface française
```

**🇨🇭 Suisse - Support Multilingue**
```
✅ Interface FR/DE/IT automatique
✅ Configuration minimale optimisée
✅ Adaptation culturelle locale
✅ Performance 300 req/s
✅ Gestion données sensibles
```

**Localisation :**
- 🗣️ **Langues** : EN, FR, DE, IT
- 💱 **Devises** : USD, EUR, CHF
- 📅 **Formats** : Dates, nombres localisés
- 🏥 **Données** : Sources nationales intégrées

---

## Slide 14: GitHub Actions CI/CD

### ⚙️ Pipeline Automatisé

**Workflow CI/CD :**
```yaml
Triggers: Push sur main/mspr3/develop + Pull Requests

Pipeline Stages:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   TEST   │───▶│  BUILD   │───▶│  DEPLOY  │───▶│ SECURITY │
│          │    │          │    │          │    │   SCAN   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Tests Automatisés :**
- ✅ **Tests Unitaires** - Python + JavaScript
- ✅ **Tests Intégration** - API endpoints
- ✅ **Tests E2E** - Cypress frontend
- ✅ **Coverage** - Minimum 95%
- ✅ **Code Quality** - ESLint + Black
- ✅ **Security Scan** - Trivy vulnerabilities

**Déploiement Multi-Pays :**
- 🇺🇸 **US Branch** → Production US
- 🇫🇷 **FR Branch** → Production FR  
- 🇨🇭 **CH Branch** → Production CH
- 🔄 **Auto-rollback** en cas d'échec
- 📊 **Health checks** post-déploiement

**Registre Docker :**
- 📦 Images taggées par pays et version
- 🏷️ `mspr3-frontend-us:latest`
- 🏷️ `mspr3-backend-fr:v3.0.0`

---

## Slide 15: Sécurité & Conformité

### 🔒 Architecture Sécurisée

**Authentification & Autorisation :**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     JWT     │───▶│    RBAC     │───▶│   AUDIT     │
│   Tokens    │    │Role-Based   │    │    LOGS     │
│  24h TTL    │    │Access Ctrl  │    │   CNIL      │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Chiffrement Multi-Niveaux :**
- 🔐 **TLS 1.3** - Communications chiffrées
- 🔐 **AES-256** - Données au repos (MySQL)
- 🔐 **JWT RS256** - Tokens signés
- 🔐 **Secrets** - Docker Secrets/Vault

**Conformité RGPD (France) :**
- ✅ **Consentement explicite** - Cookies management
- ✅ **Droit à l'oubli** - API de suppression
- ✅ **Portabilité** - Export JSON/CSV
- ✅ **Audit complet** - Logs 7 ans
- ✅ **DPO Ready** - Documentation complète

**Monitoring Sécurité :**
- 🚨 **Intrusion Detection** - Fail2ban
- 🔍 **Vulnerability Scan** - Trivy CI/CD
- 📊 **SIEM Ready** - Logs structurés
- 🚦 **Rate Limiting** - Protection DDoS

---

## Slide 16: Conclusion & Livrables

### 🎯 Réalisations & Perspectives

**✅ Livrables Finalisés :**
- 🌐 **Application Web Complète** - 3 environnements pays
- 🤖 **36 Modèles IA** - Prédictions optimisées
- 🐳 **Infrastructure Docker** - Déploiement automatisé
- 📚 **Documentation Complète** - 600+ pages
- 🔒 **Sécurité Avancée** - Conformité RGPD
- ⚙️ **CI/CD Pipeline** - GitHub Actions
- 📊 **Monitoring** - Grafana + Prometheus

**📊 Métriques de Succès :**
- **50,000+** lignes de code
- **95%** couverture de tests
- **6** microservices
- **3** pays supportés
- **99.5%+** disponibilité cible

**🚀 Perspectives d'Évolution :**
- 🌍 **Extension géographique** - Nouveaux pays
- 🧠 **IA Avancée** - Deep Learning, LSTM optimisés
- ☁️ **Cloud Native** - Kubernetes, Auto-scaling
- 📱 **Mobile App** - React Native
- 🔗 **API Publique** - Partenariats institutionnels

**🎓 Impact Pédagogique :**
- ✅ Maîtrise architecture microservices
- ✅ Expertise IA/ML appliquée
- ✅ Conformité réglementaire (RGPD)
- ✅ DevOps et containerisation
- ✅ Gestion projet Agile/Scrum

---

### 🙏 Questions & Démonstration

**Démonstration en Direct :**
- Interface utilisateur multi-pays
- Prédictions IA en temps réel
- Monitoring Grafana
- Déploiement automatisé

**Contact Équipe :**
- 📧 **Email** : support@mspr3-health.org
- 💬 **GitHub** : [Lien vers repository]
- 📖 **Documentation** : docs.mspr3-health.org

**Merci pour votre attention !** 🎉
