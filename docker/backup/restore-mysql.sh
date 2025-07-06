
#!/bin/bash

# Script de restauration MySQL pour MSPR3
# Permet la restauration sélective par pays

set -euo pipefail

BACKUP_DIR="/var/backups/mysql"
LOG_FILE="/var/log/mysql-restore.log"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fonction de restauration par pays
restore_country() {
    local country=$1
    local backup_file=$2
    local compose_file="docker-compose.$country.yml"
    
    log "Début de la restauration MySQL pour $country"
    log "Fichier de sauvegarde: $backup_file"
    
    # Vérification du fichier de sauvegarde
    if [ ! -f "$backup_file" ]; then
        log "ERREUR: Fichier de sauvegarde introuvable: $backup_file"
        return 1
    fi
    
    # Arrêt des services dépendants
    log "Arrêt des services pour $country"
    docker-compose -f "$compose_file" stop backend etl dataviz
    
    # Sauvegarde de sécurité avant restauration
    local safety_backup="$BACKUP_DIR/$country/pre_restore_$(date +%Y%m%d_%H%M%S).sql"
    log "Création d'une sauvegarde de sécurité: $safety_backup"
    docker-compose -f "$compose_file" exec -T mysql mysqldump \
        --single-transaction --all-databases -u root > "$safety_backup"
    gzip "$safety_backup"
    
    # Restauration
    log "Restauration en cours..."
    if [[ "$backup_file" == *.gz ]]; then
        if zcat "$backup_file" | docker-compose -f "$compose_file" exec -T mysql mysql -u root; then
            log "Restauration réussie pour $country"
            
            # Redémarrage des services
            log "Redémarrage des services pour $country"
            docker-compose -f "$compose_file" start backend etl dataviz
            
            # Vérification de la santé des services
            sleep 30
            if curl -f "http://localhost:8000/health" > /dev/null 2>&1; then
                log "Services redémarrés avec succès pour $country"
                return 0
            else
                log "AVERTISSEMENT: Les services ne répondent pas correctement"
                return 1
            fi
        else
            log "ERREUR: Échec de la restauration pour $country"
            return 1
        fi
    else
        if docker-compose -f "$compose_file" exec -T mysql mysql -u root < "$backup_file"; then
            log "Restauration réussie pour $country"
            docker-compose -f "$compose_file" start backend etl dataviz
            return 0
        else
            log "ERREUR: Échec de la restauration pour $country"
            return 1
        fi
    fi
}

# Fonction de listage des sauvegardes
list_backups() {
    local country=$1
    
    echo "=== Sauvegardes disponibles pour $country ==="
    if [ -d "$BACKUP_DIR/$country" ]; then
        ls -la "$BACKUP_DIR/$country"/*.sql.gz 2>/dev/null || echo "Aucune sauvegarde trouvée"
    else
        echo "Répertoire de sauvegarde introuvable pour $country"
    fi
}

# Fonction de restauration interactive
interactive_restore() {
    local country=$1
    
    echo "=== Restauration Interactive pour $country ==="
    list_backups "$country"
    
    echo
    read -p "Entrez le nom du fichier de sauvegarde à restaurer: " backup_file
    
    if [ -f "$BACKUP_DIR/$country/$backup_file" ]; then
        read -p "Êtes-vous sûr de vouloir restaurer $backup_file pour $country? (oui/non): " confirm
        if [ "$confirm" = "oui" ]; then
            restore_country "$country" "$BACKUP_DIR/$country/$backup_file"
        else
            echo "Restauration annulée"
        fi
    else
        echo "ERREUR: Fichier introuvable"
    fi
}

# Fonction de restauration automatique (dernière sauvegarde)
restore_latest() {
    local country=$1
    
    local latest_backup=$(find "$BACKUP_DIR/$country" -name "mysql_backup_${country}_*.sql.gz" | sort | tail -1)
    
    if [ -n "$latest_backup" ]; then
        log "Restauration de la dernière sauvegarde pour $country: $latest_backup"
        restore_country "$country" "$latest_backup"
    else
        log "ERREUR: Aucune sauvegarde trouvée pour $country"
        return 1
    fi
}

# Fonction principale
main() {
    case "${1:-help}" in
        "us"|"fr"|"ch")
            case "${2:-interactive}" in
                "interactive")
                    interactive_restore "$1"
                    ;;
                "latest")
                    restore_latest "$1"
                    ;;
                "list")
                    list_backups "$1"
                    ;;
                *)
                    restore_country "$1" "$2"
                    ;;
            esac
            ;;
        "help"|*)
            cat << EOF
Usage: $0 <country> [option|backup_file]

Countries: us, fr, ch

Options:
  interactive  - Mode interactif pour choisir la sauvegarde
  latest       - Restaure la dernière sauvegarde automatiquement
  list         - Liste les sauvegardes disponibles
  <file>       - Restaure un fichier de sauvegarde spécifique

Exemples:
  $0 us interactive
  $0 fr latest
  $0 ch list
  $0 us /var/backups/mysql/us/mysql_backup_us_20240101_120000.sql.gz
EOF
            ;;
    esac
}

# Création des répertoires nécessaires
mkdir -p "$(dirname "$LOG_FILE")"

# Exécution
main "$@"
