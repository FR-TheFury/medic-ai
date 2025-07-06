
#!/bin/bash

# Script de sauvegarde automatisé MySQL pour MSPR3
# Supporte les trois pays avec configuration spécifique

set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/mysql"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/mysql-backup.log"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fonction de nettoyage des anciennes sauvegardes
cleanup_old_backups() {
    local country=$1
    log "Nettoyage des sauvegardes anciennes pour $country (> $RETENTION_DAYS jours)"
    find "$BACKUP_DIR/$country" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR/$country" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
}

# Fonction de sauvegarde par pays
backup_country() {
    local country=$1
    local compose_file="docker-compose.$country.yml"
    local backup_file="$BACKUP_DIR/$country/mysql_backup_${country}_${DATE}.sql"
    
    log "Début de la sauvegarde MySQL pour $country"
    
    # Créer le répertoire de sauvegarde
    mkdir -p "$BACKUP_DIR/$country"
    
    # Sauvegarde de la base de données
    if docker-compose -f "$compose_file" exec -T mysql mysqldump \
        --single-transaction \
        --routines \
        --triggers \
        --all-databases \
        -u root > "$backup_file"; then
        
        # Compression de la sauvegarde
        gzip "$backup_file"
        log "Sauvegarde MySQL réussie pour $country: ${backup_file}.gz"
        
        # Sauvegarde des volumes Docker
        log "Sauvegarde des volumes Docker pour $country"
        docker run --rm \
            -v "${country}_mysql_data":/data:ro \
            -v "$BACKUP_DIR/$country":/backup \
            alpine tar czf "/backup/mysql_volumes_${country}_${DATE}.tar.gz" -C /data .
            
        # Vérification de l'intégrité
        if gzip -t "${backup_file}.gz"; then
            log "Vérification d'intégrité réussie pour $country"
            
            # Nettoyage des anciennes sauvegardes
            cleanup_old_backups "$country"
            
            # Mise à jour des métriques
            echo "mysql_backup_success{country=\"$country\"} 1" > /tmp/metrics/mysql_backup_${country}.prom
            echo "mysql_backup_timestamp{country=\"$country\"} $(date +%s)" >> /tmp/metrics/mysql_backup_${country}.prom
            
            return 0
        else
            log "ERREUR: Vérification d'intégrité échouée pour $country"
            return 1
        fi
    else
        log "ERREUR: Sauvegarde MySQL échouée pour $country"
        echo "mysql_backup_success{country=\"$country\"} 0" > /tmp/metrics/mysql_backup_${country}.prom
        return 1
    fi
}

# Fonction de sauvegarde complète
backup_all_countries() {
    log "=== Début de la sauvegarde complète MSPR3 ==="
    
    local success_count=0
    local countries=("us" "fr" "ch")
    
    for country in "${countries[@]}"; do
        if backup_country "$country"; then
            ((success_count++))
        fi
    done
    
    log "=== Sauvegarde terminée: $success_count/${#countries[@]} pays sauvegardés ==="
    
    # Rapport de sauvegarde
    cat > "$BACKUP_DIR/backup_report_${DATE}.md" << EOF
# Rapport de Sauvegarde MSPR3

**Date**: $(date)
**Succès**: $success_count/${#countries[@]} pays

## Détails par pays:

$(for country in "${countries[@]}"; do
    if [ -f "/tmp/metrics/mysql_backup_${country}.prom" ]; then
        echo "- **$country**: ✅ Réussie"
    else
        echo "- **$country**: ❌ Échec"
    fi
done)

## Taille des sauvegardes:

$(du -sh "$BACKUP_DIR"/* 2>/dev/null || echo "Aucune sauvegarde trouvée")

## Prochaine sauvegarde prévue:
$(date -d '+1 day' '+%Y-%m-%d %H:%M:%S')
EOF

    # Notification (si configuré)
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"Sauvegarde MSPR3 terminée: $success_count/${#countries[@]} pays\"}"
    fi
}

# Fonction principale
main() {
    case "${1:-all}" in
        "us"|"fr"|"ch")
            backup_country "$1"
            ;;
        "all")
            backup_all_countries
            ;;
        "cleanup")
            for country in "us" "fr" "ch"; do
                cleanup_old_backups "$country"
            done
            ;;
        *)
            echo "Usage: $0 [us|fr|ch|all|cleanup]"
            exit 1
            ;;
    esac
}

# Création des répertoires nécessaires
mkdir -p "$BACKUP_DIR"/{us,fr,ch}
mkdir -p /tmp/metrics
mkdir -p "$(dirname "$LOG_FILE")"

# Exécution
main "$@"
