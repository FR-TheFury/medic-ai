
# Guide Utilisateur MSPR3 - Plateforme de Santé Multi-Pays

## Table des Matières

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Installation et Déploiement](#installation-et-déploiement)
4. [Configuration par Pays](#configuration-par-pays)
5. [Utilisation de l'Interface](#utilisation-de-linterface)
6. [Fonctionnalités Avancées](#fonctionnalités-avancées)
7. [Maintenance et Monitoring](#maintenance-et-monitoring)
8. [Dépannage](#dépannage)
9. [Support](#support)

---

## Introduction

La plateforme MSPR3 est une solution de surveillance sanitaire déployée dans trois pays avec des configurations adaptées à leurs besoins spécifiques :

- **🇺🇸 États-Unis** : Configuration complète avec haute performance
- **🇫🇷 France** : Conformité RGPD stricte sans API technique
- **🇨🇭 Suisse** : Configuration minimale multilingue (FR/DE/IT)

### Architecture Générale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Base MySQL    │
│   React/Vite    │◄──►│   FastAPI       │◄──►│   Données       │
│   Port 80       │    │   Port 8000     │    │   Port 3306     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service ETL   │    │   Redis Cache   │    │   Monitoring    │
│   Port 8001     │    │   Port 6379     │    │   Grafana/Prom  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Prérequis

### Système d'Exploitation
- **Linux** : Ubuntu 20.04+, CentOS 7+, RHEL 8+
- **macOS** : 10.15+
- **Windows** : Windows 10 Pro+ avec WSL2

### Logiciels Requis
- **Docker** : Version 20.10 ou supérieure
- **Docker Compose** : Version 2.0 ou supérieure
- **Git** : Pour cloner le repository
- **Curl** : Pour les tests de santé

### Ressources Système Minimales

| Pays | CPU | RAM | Stockage | Réseau |
|------|-----|-----|----------|--------|
| 🇺🇸 États-Unis | 8 cœurs | 16 GB | 100 GB SSD | 1 Gbps |
| 🇫🇷 France | 4 cœurs | 8 GB | 50 GB SSD | 500 Mbps |
| 🇨🇭 Suisse | 2 cœurs | 4 GB | 25 GB SSD | 100 Mbps |

### Ports Réseau

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | Interface utilisateur |
| Backend API | 8000 | API principale |
| ETL Service | 8001 | Service de données |
| Technical API | 8002 | API technique (US uniquement) |
| Grafana | 3000 | Monitoring (US/FR) |
| MySQL | 3306 | Base de données |
| Redis | 6379 | Cache |
| Nginx LB | 443 | Load balancer (US) |

---

## Installation et Déploiement

### Étape 1 : Préparation de l'Environnement

```bash
# Cloner le repository
git clone https://github.com/votre-org/mspr3-health-platform.git
cd mspr3-health-platform

# Vérifier les prérequis
docker --version
docker-compose --version

# Créer les répertoires nécessaires
mkdir -p docker/{grafana,mysql-init,ssl}
```

### Étape 2 : Configuration Initiale

```bash
# Copier le fichier d'environnement
cp docker/.env.example docker/.env

# Éditer les variables selon votre pays
nano docker/.env
```

### Étape 3 : Déploiement par Pays

#### 🇺🇸 États-Unis (Configuration Complète)

```bash
# Se placer dans le dossier docker
cd docker

# Rendre le script exécutable
chmod +x deploy.sh

# Déployer pour les États-Unis
./deploy.sh us

# Vérifier le déploiement
./deploy.sh us --logs
```

**Services déployés** :
- ✅ Frontend React
- ✅ Backend API avec IA
- ✅ Service ETL
- ✅ API Technique
- ✅ DataViz (Grafana)
- ✅ Base MySQL
- ✅ Cache Redis
- ✅ Load Balancer Nginx

#### 🇫🇷 France (Conformité RGPD)

```bash
# Déployer pour la France
./deploy.sh fr

# Configuration RGPD automatique
# - Chiffrement des données
# - Logs d'audit
# - Consentement utilisateur
```

**Services déployés** :
- ✅ Frontend React
- ✅ Backend API avec RGPD
- ✅ Service ETL
- ❌ API Technique (non requis)
- ✅ DataViz (Grafana)
- ✅ Base MySQL chiffrée
- ✅ Cache Redis

#### 🇨🇭 Suisse (Configuration Minimale)

```bash
# Déployer pour la Suisse
./deploy.sh ch

# Configuration multilingue automatique
# - Support FR/DE/IT
# - Détection automatique de langue
```

**Services déployés** :
- ✅ Frontend React multilingue
- ✅ Backend API
- ✅ Service ETL
- ❌ API Technique (non requis)
- ❌ DataViz (non requis)
- ✅ Base MySQL
- ✅ Cache Redis

### Étape 4 : Vérification du Déploiement

```bash
# Vérifier l'état des services
docker-compose -f docker-compose.[pays].yml ps

# Tester les endpoints
curl -f http://localhost/                    # Frontend
curl -f http://localhost:8000/health         # Backend
curl -f http://localhost:8001/etl/health     # ETL

# Vérifier les logs
docker-compose -f docker-compose.[pays].yml logs -f
```

---

## Configuration par Pays

### 🇺🇸 États-Unis - Configuration Haute Performance

#### Optimisations Spécifiques

```yaml
# Configuration MySQL haute performance
mysql:
  environment:
    MYSQL_INNODB_BUFFER_POOL_SIZE: "2G"
    MYSQL_MAX_CONNECTIONS: "500"
    MYSQL_QUERY_CACHE_SIZE: "256M"

# Configuration API scalable
backend:
  environment:
    UVICORN_WORKERS: "8"
    UVICORN_MAX_REQUESTS: "10000"
    DB_POOL_SIZE: "20"
```

#### Load Balancer Configuration

```nginx
# /docker/nginx/us.conf
upstream backend {
    server backend:8000 weight=3;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    
    # Configuration SSL
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Optimisations performance
    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain application/json;
}
```

#### Monitoring Avancé

```bash
# Accéder à Grafana
http://localhost:3000
# Login: admin / admin

# Dashboards disponibles :
# - US Performance Dashboard
# - API Metrics Dashboard  
# - Database Performance Dashboard
```

### 🇫🇷 France - Configuration RGPD

#### Conformité Automatique

La configuration France active automatiquement :

1. **Chiffrement des Données**
   ```yaml
   mysql:
     environment:
       MYSQL_ENCRYPT: "FORCE"
       MYSQL_INNODB_ENCRYPT_TABLES: "ON"
   ```

2. **Audit et Logs**
   ```yaml
   backend:
     environment:
       AUDIT_LOGGING: "true"
       AUDIT_RETENTION_DAYS: "2555"  # 7 ans
   ```

3. **Gestion du Consentement**
   ```javascript
   // Automatiquement intégré dans le frontend
   {
     "consent_management": true,
     "gdpr_compliance": "strict"
   }
   ```

#### Droits des Utilisateurs

L'API RGPD est automatiquement disponible :

```bash
# Demande d'accès aux données
POST /api/gdpr/access-request

# Demande de rectification
POST /api/gdpr/rectification-request

# Demande d'effacement (droit à l'oubli)
POST /api/gdpr/erasure-request

# Demande de portabilité
POST /api/gdpr/portability-request
```

#### Contact DPO

- **Email** : dpo@mspr3-health.fr
- **Téléphone** : +33 1 23 45 67 89
- **Adresse** : 123 Rue de la Santé, 75014 Paris

### 🇨🇭 Suisse - Configuration Multilingue

#### Langues Supportées

- **Français** (par défaut)
- **Allemand** (Deutsch)
- **Italien** (Italiano)

#### Détection Automatique

```javascript
// La langue est détectée automatiquement via :
{
  "browser_language": true,     // Langue du navigateur
  "geolocation": true,         // Géolocalisation
  "user_preference": true,     // Préférence sauvée
  "url_parameter": true        // ?lang=de
}
```

#### Changement de Langue

```bash
# Via URL
http://localhost/?lang=de
http://localhost/?lang=it

# Via API
POST /api/user/language
{
  "language": "de"
}
```

#### Traductions Disponibles

- Interface utilisateur complète
- Messages d'erreur
- Terminologie médicale
- Documentation d'aide

---

## Utilisation de l'Interface

### Connexion et Authentification

1. **Accéder à l'application**
   ```
   http://localhost/
   ```

2. **Créer un compte**
   - Cliquer sur "S'inscrire"
   - Remplir le formulaire
   - Confirmer par email

3. **Se connecter**
   - Email et mot de passe
   - Authentification à deux facteurs (France)

### Navigation Principale

#### Dashboard Principal
- **Vue d'ensemble** des données sanitaires
- **Graphiques** interactifs par région
- **Alertes** en temps réel
- **Métriques** clés

#### Gestion des Maladies
- **Consulter** la liste des maladies
- **Ajouter** de nouvelles maladies
- **Modifier** les informations
- **Supprimer** (avec confirmation)

#### Gestion des Pays et Régions
- **Visualiser** la hiérarchie géographique
- **Ajouter** de nouvelles régions
- **Modifier** les informations géographiques
- **Statistiques** par région

#### Prédictions IA
- **Modèles classiques** pour les prédictions à court terme
- **Modèles temporels** pour les tendances
- **Upload CSV** pour les données personnalisées
- **Export** des résultats

### Fonctionnalités par Pays

#### 🇺🇸 États-Unis
- **API Technique** pour les développeurs
- **Analytics** avancés
- **Performance** monitoring
- **Scalabilité** automatique

#### 🇫🇷 France
- **Consentement** RGPD obligatoire
- **Gestion des données** personnelles
- **Export** sécurisé des données
- **Audit** de toutes les actions

#### 🇨🇭 Suisse
- **Sélecteur de langue** en haut de page
- **Interface** adaptée culturellement
- **Formats** locaux (dates, nombres)
- **Support** multilingue complet

---

## Fonctionnalités Avancées

### Service ETL

Le service ETL (Extract, Transform, Load) gère l'importation automatique des données :

```bash
# Déclencher une synchronisation manuelle
curl -X POST http://localhost:8001/etl/sync

# Vérifier le statut
curl http://localhost:8001/etl/status

# Voir les logs ETL
docker-compose logs etl
```

### API de Prédiction

Utilisation des modèles IA pour les prédictions :

```javascript
// Prédiction de nouveaux cas
POST /api/predict/new-cases
{
  "country": "France",
  "disease": "COVID-19",
  "features": {
    "population": 67000000,
    "density": 122,
    "vaccination_rate": 0.85
  }
}

// Prédiction de mortalité
POST /api/predict/mortality-rate
{
  "country": "Switzerland",
  "disease": "Grippe",
  "features": {
    "age_median": 42,
    "healthcare_index": 0.92
  }
}
```

### Monitoring et Alertes

#### Métriques Disponibles
- **Performance** : Temps de réponse, throughput
- **Santé** : Status des services, erreurs
- **Business** : Nombre d'utilisateurs, prédictions
- **Sécurité** : Tentatives d'intrusion, conformité

#### Configuration d'Alertes

```yaml
# Exemple d'alerte
alerts:
  - name: "API Response Time"
    condition: "api_response_time_95th > 2000ms"
    severity: "warning"
    notification: "slack-channel"
```

### Sauvegardes Automatiques

```bash
# Sauvegarde manuelle
./backup/backup-mysql.sh us

# Restauration
./backup/restore-mysql.sh us interactive

# Vérifier les sauvegardes
ls -la /var/backups/mysql/us/
```

---

## Maintenance et Monitoring

### Maintenance Préventive

#### Quotidienne
```bash
# Vérifier l'état des services
./deploy.sh [pays] --logs | grep ERROR

# Vérifier l'espace disque
df -h

# Nettoyer les logs anciens
docker system prune -f
```

#### Hebdomadaire
```bash
# Mettre à jour les images Docker
./deploy.sh [pays] --build

# Sauvegarder les données
./backup/backup-mysql.sh [pays]

# Analyser les métriques
# Accéder à Grafana pour les tendances
```

#### Mensuelle
```bash
# Audit de sécurité
./quality/security-scan.sh

# Optimisation base de données
docker-compose exec mysql mysql -e "OPTIMIZE TABLE dwh.*"

# Rapport de performance
./quality/coverage.sh
```

### Monitoring en Temps Réel

#### États-Unis
```bash
# Dashboard principal
http://localhost:3000/d/us-overview

# Métriques API
http://localhost:3000/d/api-metrics

# Performance base de données
http://localhost:3000/d/db-performance
```

#### France
```bash
# Conformité RGPD
http://localhost:3000/d/gdpr-compliance

# Audit et sécurité
http://localhost:3000/d/security-audit
```

#### Surveillance Commune
```bash
# Métriques système
docker stats

# Logs en temps réel
docker-compose logs -f --tail=100

# Health checks
curl http://localhost:8000/health
curl http://localhost:8001/etl/health
```

---

## Dépannage

### Problèmes Courants

#### Services ne Démarrent Pas

**Symptôme** : `docker-compose up` échoue

**Solutions** :
```bash
# Vérifier les ports occupés
netstat -tuln | grep :8000

# Arrêter les services conflictuels
sudo systemctl stop apache2
sudo systemctl stop nginx

# Nettoyer Docker
docker system prune -a

# Redémarrer
./deploy.sh [pays] --clean
```

#### Base de Données Inaccessible

**Symptôme** : Erreurs de connexion MySQL

**Solutions** :
```bash
# Vérifier le statut MySQL
docker-compose exec mysql mysqladmin ping

# Recréer le conteneur MySQL
docker-compose stop mysql
docker-compose rm mysql
docker volume rm [pays]_mysql_data  # ATTENTION: efface les données
docker-compose up -d mysql

# Restaurer depuis une sauvegarde
./backup/restore-mysql.sh [pays] latest
```

#### Performance Dégradée

**Symptôme** : Réponses lentes

**Solutions États-Unis** :
```bash
# Vérifier la charge CPU/RAM
docker stats

# Scaler horizontalement
docker-compose up -d --scale backend=3

# Optimiser MySQL
docker-compose exec mysql mysql -e "ANALYZE TABLE dwh.*"
```

**Solutions France** :
```bash
# Vérifier les logs d'audit (peuvent être volumineux)
du -sh /var/log/mysql/audit.log

# Nettoyer les anciens audits
./backup/cleanup-audit-logs.sh

# Optimiser le chiffrement
# (Vérifier la configuration RGPD)
```

**Solutions Suisse** :
```bash
# Vérifier les traductions (cache)
curl http://localhost:8000/api/i18n/health

# Recharger les traductions
docker-compose restart backend
```

#### Erreurs RGPD (France)

**Symptôme** : Violations de conformité

**Solutions** :
```bash
# Vérifier la configuration RGPD
docker-compose exec backend python -c "
from config import GDPR_CONFIG
print(GDPR_CONFIG)
"

# Réactiver le chiffrement
docker-compose down
docker-compose up -d

# Contacter le DPO
echo "Incident RGPD détecté" | mail -s "URGENT" dpo@mspr3-health.fr
```

### Logs et Diagnostics

#### Localisation des Logs

```bash
# Logs application
docker-compose logs [service]

# Logs système
journalctl -u docker.service

# Logs personnalisés
tail -f /var/log/mspr3/*.log
```

#### Analyse des Performances

```bash
# Top des requêtes MySQL lentes
docker-compose exec mysql mysql -e "
SELECT * FROM information_schema.processlist 
WHERE time > 10 ORDER BY time DESC;
"

# Statistiques Redis
docker-compose exec redis redis-cli info stats

# Métriques HTTP
curl http://localhost:8000/metrics
```

---

## Support

### Documentation Technique

- **Architecture** : `docker/docs/architecture-diagrams.md`
- **API Reference** : `http://localhost:8000/docs`
- **Configuration** : `docker/docs/technical-specs.md`

### Contact Support

#### Support Technique
- **Email** : support-tech@mspr3-health.org
- **Tickets** : https://support.mspr3-health.org
- **Chat** : Slack #mspr3-support

#### Support par Pays

**🇺🇸 États-Unis**
- **Responsable** : John Smith
- **Email** : support-us@mspr3-health.org
- **Téléphone** : +1-555-0123
- **Heures** : 24/7 (EST)

**🇫🇷 France**
- **Responsable** : Marie Dubois
- **Email** : support-fr@mspr3-health.org
- **Téléphone** : +33 1 23 45 67 89
- **Heures** : 8h-18h (CET)
- **DPO** : dpo@mspr3-health.fr

**🇨🇭 Suisse**
- **Responsable** : Hans Mueller
- **Email** : support-ch@mspr3-health.org
- **Téléphone** : +41 44 123 45 67
- **Heures** : 9h-17h (CET)
- **Langues** : FR/DE/IT

### Escalation

#### Niveau 1 : Support Standard
- Problèmes d'utilisation
- Questions sur les fonctionnalités
- Bugs mineurs

#### Niveau 2 : Support Technique
- Problèmes de configuration
- Erreurs système
- Performance dégradée

#### Niveau 3 : Support Critique
- Panne générale
- Faille de sécurité
- Violation RGPD (France)

### Communauté

- **Forum** : https://community.mspr3-health.org
- **GitHub** : https://github.com/mspr3-health/platform
- **Discord** : https://discord.gg/mspr3-health

---

## Annexes

### Checklist de Déploiement

#### Avant le Déploiement
- [ ] Vérifier les prérequis système
- [ ] Configurer les variables d'environnement
- [ ] Tester la connectivité réseau
- [ ] Préparer les certificats SSL (production)

#### Pendant le Déploiement
- [ ] Exécuter le script de déploiement
- [ ] Vérifier le statut des services
- [ ] Tester les endpoints principaux
- [ ] Configurer les alertes

#### Après le Déploiement
- [ ] Formation des utilisateurs
- [ ] Configuration des sauvegardes
- [ ] Tests de charge (États-Unis)
- [ ] Audit RGPD (France)
- [ ] Tests multilingues (Suisse)

### Glossaire

- **ETL** : Extract, Transform, Load - Processus d'intégration de données
- **RGPD** : Règlement Général sur la Protection des Données
- **IA** : Intelligence Artificielle pour les prédictions
- **DPO** : Délégué à la Protection des Données
- **i18n** : Internationalization (multilingue)
- **SLA** : Service Level Agreement
- **API** : Application Programming Interface

---

*Guide utilisateur MSPR3 - Version 3.0 - Mis à jour le {{DATE}}*

*Pour les mises à jour de ce guide, consultez : https://docs.mspr3-health.org*
