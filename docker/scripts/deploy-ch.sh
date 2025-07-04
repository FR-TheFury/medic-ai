
#!/bin/bash

# Script de déploiement pour la Suisse
echo "🇨🇭 Déploiement de l'infrastructure Suisse..."

# Vérifier si Docker et Docker Compose sont installés
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Créer les répertoires nécessaires
mkdir -p ../mysql-init

# Arrêter les services existants
echo "⏹️ Arrêt des services existants..."
docker-compose -f docker-compose.ch.yml down

# Construire et démarrer les services
echo "🚀 Construction et démarrage des services..."
docker-compose -f docker-compose.ch.yml up --build -d

# Vérifier l'état des services
echo "🔍 Vérification de l'état des services..."
sleep 30
docker-compose -f docker-compose.ch.yml ps

# Tester les endpoints
echo "🧪 Test des endpoints..."
curl -f http://localhost/ || echo "❌ Frontend non accessible"
curl -f http://localhost:8000/ || echo "❌ Backend non accessible"
curl -f http://localhost:8001/etl/health || echo "❌ ETL non accessible"

echo "✅ Déploiement Suisse terminé!"
echo "📊 Accès aux services:"
echo "   - Frontend: http://localhost/"
echo "   - Backend API: http://localhost:8000/"
echo "   - ETL Service: http://localhost:8001/"
