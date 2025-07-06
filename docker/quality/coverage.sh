
#!/bin/bash

# Script d'analyse de couverture de code pour MSPR3
# Génère des rapports de qualité et de couverture

set -euo pipefail

REPORT_DIR="./reports"
DATE=$(date +%Y%m%d_%H%M%S)

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"
}

# Création des répertoires
mkdir -p "$REPORT_DIR"/{coverage,quality,security}

log "=== Analyse de Qualité MSPR3 ==="

# 1. Tests de couverture Frontend (JavaScript/TypeScript)
log "Analyse de couverture Frontend..."
cd ../..
if npm test -- --coverage --watchAll=false --coverageDirectory="docker/quality/reports/coverage/frontend" 2>/dev/null; then
    log "✅ Couverture Frontend générée"
else
    warn "❌ Échec de la couverture Frontend"
fi

# 2. Tests de couverture Backend (Python)
log "Analyse de couverture Backend..."
cd fast-api
if command -v pytest &> /dev/null; then
    if pytest --cov=API --cov-report=html --cov-report=xml --cov-report=term 2>/dev/null; then
        mv htmlcov ../docker/quality/reports/coverage/backend/ 2>/dev/null || true
        mv coverage.xml ../docker/quality/reports/coverage/backend/ 2>/dev/null || true
        log "✅ Couverture Backend générée"
    else
        warn "❌ Échec de la couverture Backend"
    fi
else
    warn "pytest non installé, installation en cours..."
    pip install pytest pytest-cov 2>/dev/null || warn "Échec de l'installation de pytest"
fi

cd ../docker/quality

# 3. Analyse de qualité du code JavaScript/TypeScript
log "Analyse ESLint..."
cd ../..
if npx eslint src/ --format html --output-file "docker/quality/reports/quality/eslint-report.html" 2>/dev/null; then
    log "✅ Rapport ESLint généré"
else
    warn "❌ Échec de l'analyse ESLint"
fi

# 4. Analyse de qualité Python
log "Analyse Flake8..."
cd fast-api
if command -v flake8 &> /dev/null; then
    flake8 API/ --format=html --htmldir=../docker/quality/reports/quality/flake8/ || warn "Erreurs Flake8 détectées"
    log "✅ Rapport Flake8 généré"
else
    warn "Flake8 non installé"
fi

cd ../docker/quality

# 5. Analyse de sécurité avec Bandit (Python)
log "Analyse de sécurité Bandit..."
cd ../../fast-api
if command -v bandit &> /dev/null; then
    bandit -r API/ -f html -o ../docker/quality/reports/security/bandit-report.html || warn "Problèmes de sécurité détectés"
    log "✅ Rapport Bandit généré"
else
    warn "Bandit non installé"
fi

cd ../docker/quality

# 6. Analyse des dépendances avec Safety
log "Analyse des dépendances Python..."
cd ../../fast-api
if command -v safety &> /dev/null; then
    safety check --json --output ../docker/quality/reports/security/safety-report.json || warn "Vulnérabilités détectées"
    log "✅ Rapport Safety généré"
else
    warn "Safety non installé"
fi

cd ../docker/quality

# 7. Audit des dépendances npm
log "Audit des dépendances npm..."
cd ../..
npm audit --json > docker/quality/reports/security/npm-audit.json 2>/dev/null || warn "Vulnérabilités npm détectées"
log "✅ Audit npm terminé"

cd docker/quality

# 8. Analyse de la complexité cyclomatique
log "Analyse de complexité..."
cd ../..
if command -v radon &> /dev/null; then
    cd fast-api
    radon cc API/ --json > ../docker/quality/reports/quality/complexity.json
    radon mi API/ --json > ../docker/quality/reports/quality/maintainability.json
    log "✅ Analyse de complexité terminée"
    cd ..
else
    warn "Radon non installé pour l'analyse de complexité"
fi

cd docker/quality

# 9. Génération du rapport consolidé
log "Génération du rapport consolidé..."

cat > "reports/quality_report_${DATE}.md" << EOF
# Rapport de Qualité MSPR3

**Date**: $(date)
**Version**: MSPR3-$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

## Résumé Exécutif

$(if [ -f "reports/coverage/frontend/lcov-report/index.html" ]; then
    echo "✅ **Frontend**: Couverture de tests générée"
else
    echo "❌ **Frontend**: Couverture non disponible"
fi)

$(if [ -f "reports/coverage/backend/index.html" ]; then
    echo "✅ **Backend**: Couverture de tests générée"
else
    echo "❌ **Backend**: Couverture non disponible"
fi)

$(if [ -f "reports/quality/eslint-report.html" ]; then
    echo "✅ **ESLint**: Analyse qualité terminée"
else
    echo "❌ **ESLint**: Analyse non disponible"
fi)

$(if [ -f "reports/security/bandit-report.html" ]; then
    echo "✅ **Sécurité**: Analyse Bandit terminée"
else
    echo "❌ **Sécurité**: Analyse non disponible"
fi)

## Métriques de Qualité

### Couverture de Code
- **Frontend**: Voir reports/coverage/frontend/
- **Backend**: Voir reports/coverage/backend/

### Qualité du Code
- **ESLint**: reports/quality/eslint-report.html
- **Flake8**: reports/quality/flake8/
- **Complexité**: reports/quality/complexity.json

### Sécurité
- **Bandit (Python)**: reports/security/bandit-report.html
- **Safety (Dépendances)**: reports/security/safety-report.json
- **npm audit**: reports/security/npm-audit.json

## Recommandations

### Critiques
- Corriger les vulnérabilités de sécurité critiques
- Atteindre un minimum de 80% de couverture de tests

### Améliorations
- Réduire la complexité cyclomatique > 10
- Corriger les warnings ESLint/Flake8
- Mettre à jour les dépendances vulnérables

### Bonnes Pratiques
- Maintenir la couverture de tests
- Effectuer des revues de code régulières
- Surveiller les nouvelles vulnérabilités

## Actions Suivantes

1. **Immédiat**: Correction des vulnérabilités critiques
2. **Court terme**: Amélioration de la couverture de tests
3. **Moyen terme**: Refactoring du code complexe
4. **Long terme**: Mise en place de l'analyse continue

---
*Rapport généré automatiquement le $(date)*
EOF

log "✅ Rapport consolidé généré: reports/quality_report_${DATE}.md"

# 10. Génération des métriques pour Prometheus
log "Génération des métriques Prometheus..."

mkdir -p /tmp/metrics

# Métriques de qualité
cat > "/tmp/metrics/code_quality.prom" << EOF
# HELP code_coverage_percentage Pourcentage de couverture de code
# TYPE code_coverage_percentage gauge
code_coverage_frontend{type="lines"} $(grep -o '"lines":[0-9.]*' reports/coverage/frontend/coverage-final.json 2>/dev/null | cut -d: -f2 | head -1 || echo "0")
code_coverage_backend{type="lines"} $(grep -o 'totals.*pc_cov.*' reports/coverage/backend/coverage.xml 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")

# HELP code_quality_issues Nombre de problèmes de qualité détectés
# TYPE code_quality_issues gauge
code_quality_eslint_errors $(grep -c "error" reports/quality/eslint-report.html 2>/dev/null || echo "0")
code_quality_eslint_warnings $(grep -c "warning" reports/quality/eslint-report.html 2>/dev/null || echo "0")
code_quality_flake8_issues $(find reports/quality/flake8/ -name "*.html" -exec grep -c "violation" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

# HELP security_vulnerabilities Nombre de vulnérabilités de sécurité
# TYPE security_vulnerabilities gauge
security_python_high $(jq '.results | map(select(.issue_severity=="HIGH")) | length' reports/security/bandit-report.json 2>/dev/null || echo "0")
security_python_medium $(jq '.results | map(select(.issue_severity=="MEDIUM")) | length' reports/security/bandit-report.json 2>/dev/null || echo "0")
security_npm_critical $(jq '.metadata.vulnerabilities.critical // 0' reports/security/npm-audit.json 2>/dev/null || echo "0")
security_npm_high $(jq '.metadata.vulnerabilities.high // 0' reports/security/npm-audit.json 2>/dev/null || echo "0")
EOF

log "✅ Métriques Prometheus générées"

# 11. Nettoyage et archivage
log "Archivage des anciens rapports..."
find reports/ -name "quality_report_*.md" -mtime +7 -delete 2>/dev/null || true
find reports/ -type d -name "*_20*" -mtime +30 -exec rm -rf {} \; 2>/dev/null || true

log "=== Analyse de qualité terminée ==="
log "📊 Rapport principal: reports/quality_report_${DATE}.md"
log "📈 Métriques: /tmp/metrics/code_quality.prom"
log "🔍 Détails: reports/"

# Retour du code d'erreur si des problèmes critiques
if [ -f "reports/security/bandit-report.json" ]; then
    HIGH_SECURITY=$(jq '.results | map(select(.issue_severity=="HIGH")) | length' reports/security/bandit-report.json 2>/dev/null || echo "0")
    if [ "$HIGH_SECURITY" -gt 0 ]; then
        error "⚠️  $HIGH_SECURITY vulnérabilités de sécurité critiques détectées!"
        exit 1
    fi
fi

log "✅ Analyse terminée avec succès"
