
# Containerisation Docker Multi-Pays

Cette documentation décrit la containerisation de l'application pour trois environnements différents : États-Unis, France et Suisse.

## 🏗️ Architecture

### Services Communs
- **Frontend** : React/Vite avec Nginx
- **Backend** : FastAPI avec modèles IA
- **Base de données** : MySQL
- **ETL** : Service d'extraction, transformation et chargement
- **Redis** : Cache en mémoire

### Services Spécifiques par Pays

#### 🇺🇸 États-Unis (Configuration Complète)
- Frontend + Backend + MySQL + ETL + **API Technique** + **DataViz** + Redis

#### 🇫🇷 France (Sans API Technique)
- Frontend + Backend + MySQL + ETL + **DataViz** + Redis

#### 🇨🇭 Suisse (Configuration Minimale)
- Frontend + Backend + MySQL + ETL + Redis

## 🚀 Déploiement

### Prérequis
- Docker >= 20.10
- Docker Compose >= 2.0
- Au moins 4GB de RAM libre
- 10GB d'espace disque libre

### Déploiement Rapide

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# États-Unis (configuration complète)
./deploy.sh us

# France (sans API technique)
./deploy.sh fr

# Suisse (configuration minimale)
./deploy.sh ch
```

### Options Avancées

```bash
# Reconstruction forcée des images
./deploy.sh us --build

# Nettoyage avant déploiement
./deploy.sh fr --clean

# Affichage des logs
./deploy.sh ch --logs

# Arrêt des services
./deploy.sh us --stop
```

## 📋 Services et Ports

### États-Unis
| Service | Port | URL |
|---------|------|-----|
| Frontend | 80 | http://localhost/ |
| Backend API | 8000 | http://localhost:8000/ |
| ETL Service | 8001 | http://localhost:8001/ |
| API Technique | 8002 | http://localhost:8002/ |
| Grafana | 3000 | http://localhost:3000/ |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |

### France
| Service | Port | URL |
|---------|------|-----|
| Frontend | 80 | http://localhost/ |
| Backend API | 8000 | http://localhost:8000/ |
| ETL Service | 8001 | http://localhost:8001/ |
| Grafana | 3000 | http://localhost:3000/ |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |

### Suisse
| Service | Port | URL |
|---------|------|-----|
| Frontend | 80 | http://localhost/ |
| Backend API | 8000 | http://localhost:8000/ |
| ETL Service | 8001 | http://localhost:8001/ |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |

## 🔧 Configuration

### Variables d'Environnement

Chaque pays utilise des variables d'environnement spécifiques définies dans les fichiers `docker-compose.*.yml`.

### Volumes Persistants

- **mysql_data** : Données de la base MySQL
- **grafana_data** : Configuration et dashboards Grafana
- **redis_data** : Cache Redis

### Réseaux Docker

Chaque pays utilise un réseau isolé :
- **us-network** : 172.20.0.0/16
- **fr-network** : 172.21.0.0/16
- **ch-network** : 172.22.0.0/16

## 🛠️ Maintenance

### Sauvegarde des Données

```bash
# Sauvegarde MySQL
docker-compose -f docker-compose.us.yml exec mysql mysqldump -u root dwh > backup.sql

# Sauvegarde Grafana
docker-compose -f docker-compose.us.yml exec dataviz tar -czf - /var/lib/grafana > grafana-backup.tar.gz
```

### Restauration

```bash
# Restauration MySQL
docker-compose -f docker-compose.us.yml exec -T mysql mysql -u root dwh < backup.sql

# Restauration Grafana
docker-compose -f docker-compose.us.yml exec dataviz tar -xzf - -C / < grafana-backup.tar.gz
```

### Monitoring

```bash
# État des services
docker-compose -f docker-compose.us.yml ps

# Logs en temps réel
docker-compose -f docker-compose.us.yml logs -f

# Utilisation des ressources
docker stats
```

### Mise à Jour

```bash
# Arrêt des services
./deploy.sh us --stop

# Mise à jour du code
git pull origin mspr3

# Redéploiement avec reconstruction
./deploy.sh us --build
```

## 🔒 Sécurité

### Recommandations de Production

1. **Changer les mots de passe par défaut**
2. **Utiliser des certificats SSL/TLS**
3. **Configurer des firewalls**
4. **Mettre en place des sauvegardes automatiques**
5. **Surveiller les logs de sécurité**

### Secrets Management

Utiliser Docker Secrets pour les informations sensibles :

```bash
echo "mot_de_passe_secret" | docker secret create mysql_password -
```

## 📊 Monitoring et Alertes

### Grafana Dashboards

Des dashboards préconfigurés sont disponibles pour :
- Métriques système
- Performance des API
- Statistiques des bases de données
- Alertes automatiques

### Health Checks

Tous les services incluent des health checks automatiques :
- Vérification toutes les 30 secondes
- Timeout de 10 secondes
- 3 tentatives avant échec

## 🆘 Dépannage

### Problèmes Courants

1. **Ports occupés** : Vérifier les ports utilisés avec `netstat -tuln`
2. **Espace disque insuffisant** : Nettoyer avec `docker system prune`
3. **Mémoire insuffisante** : Ajuster les limites dans docker-compose
4. **Erreurs de connexion** : Vérifier les réseaux Docker

### Logs de Debug

```bash
# Logs détaillés
docker-compose -f docker-compose.us.yml logs --details

# Logs d'un service spécifique
docker-compose -f docker-compose.us.yml logs backend
```

## 📝 Contribution

Pour contribuer à cette infrastructure :

1. Créer une nouvelle branche depuis `mspr3`
2. Tester localement avec `./deploy.sh [pays]`
3. Documenter les changements
4. Créer une pull request

## 📞 Support

Pour obtenir de l'aide :
1. Consulter les logs : `./deploy.sh [pays] --logs`
2. Vérifier la documentation
3. Contacter l'équipe de développement
