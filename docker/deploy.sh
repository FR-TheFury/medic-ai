
#!/bin/bash

# Script principal de déploiement multi-pays
echo "🌍 Déploiement Multi-Pays - Containerisation Docker"
echo "=================================================="

# Fonction d'aide
show_help() {
    echo "Usage: $0 [COUNTRY] [OPTIONS]"
    echo ""
    echo "COUNTRY:"
    echo "  us, usa, états-unis    Déploiement États-Unis (configuration complète)"
    echo "  fr, france            Déploiement France (sans API technique)"
    echo "  ch, suisse            Déploiement Suisse (configuration minimale)"
    echo ""
    echo "OPTIONS:"
    echo "  --build               Force la reconstruction des images"
    echo "  --clean               Nettoie les volumes et images orphelines"
    echo "  --logs                Affiche les logs des services"
    echo "  --stop                Arrête les services"
    echo "  --help                Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 us                 Déploie pour les États-Unis"
    echo "  $0 fr --build         Déploie pour la France avec reconstruction"
    echo "  $0 ch --clean         Déploie pour la Suisse après nettoyage"
}

# Fonction de nettoyage
clean_docker() {
    echo "🧹 Nettoyage des ressources Docker..."
    docker system prune -f
    docker volume prune -f
    docker image prune -f
}

# Fonction d'affichage des logs
show_logs() {
    case $1 in
        us|usa|états-unis)
            docker-compose -f docker-compose.us.yml logs -f
            ;;
        fr|france)
            docker-compose -f docker-compose.fr.yml logs -f
            ;;
        ch|suisse)
            docker-compose -f docker-compose.ch.yml logs -f
            ;;
        *)
            echo "❌ Pays non reconnu: $1"
            exit 1
            ;;
    esac
}

# Fonction d'arrêt des services
stop_services() {
    case $1 in
        us|usa|états-unis)
            docker-compose -f docker-compose.us.yml down
            ;;
        fr|france)
            docker-compose -f docker-compose.fr.yml down
            ;;
        ch|suisse)
            docker-compose -f docker-compose.ch.yml down
            ;;
        *)
            echo "❌ Pays non reconnu: $1"
            exit 1
            ;;
    esac
}

# Vérifier les arguments
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

COUNTRY=$1
shift

# Traiter les options
BUILD_FLAG=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--build"
            shift
            ;;
        --clean)
            clean_docker
            shift
            ;;
        --logs)
            show_logs $COUNTRY
            exit 0
            ;;
        --stop)
            stop_services $COUNTRY
            exit 0
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Déploiement selon le pays
case $COUNTRY in
    us|usa|états-unis)
        echo "🇺🇸 Déploiement États-Unis (Configuration complète)"
        ./scripts/deploy-us.sh
        ;;
    fr|france)
        echo "🇫🇷 Déploiement France (Sans API technique)"
        ./scripts/deploy-fr.sh
        ;;
    ch|suisse)
        echo "🇨🇭 Déploiement Suisse (Configuration minimale)"
        ./scripts/deploy-ch.sh
        ;;
    *)
        echo "❌ Pays non reconnu: $COUNTRY"
        echo "Pays supportés: us, fr, ch"
        exit 1
        ;;
esac

echo ""
echo "✅ Déploiement terminé pour $COUNTRY"
echo "📚 Consultez les logs avec: $0 $COUNTRY --logs"
echo "⏹️ Arrêtez les services avec: $0 $COUNTRY --stop"
