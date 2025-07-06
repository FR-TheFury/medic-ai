
# Configuration Scrum pour MSPR3 Multi-Country Platform

## Vue d'Ensemble du Projet

### Informations Générales
- **Nom du Projet**: MSPR3 Multi-Country Health Platform
- **Date de Début**: 2024-01-15
- **Date de Fin Prévue**: 2024-04-30
- **Équipe**: 6 développeurs + 1 Scrum Master + 1 Product Owner
- **Méthodologie**: Scrum avec éléments Kanban

### Objectifs du Projet
1. **Déploiement Multi-Pays**: États-Unis, France, Suisse
2. **Containerisation**: Docker/Podman avec orchestration
3. **CI/CD**: Pipeline automatisé complet
4. **Conformité**: RGPD (France), Performance (US), Multilinguisme (CH)
5. **Monitoring**: Surveillance et alertes temps réel

## Structure de l'Équipe Scrum

### Rôles et Responsabilités

#### Product Owner
- **Nom**: Marie Dubois
- **Responsabilités**:
  - Définir les User Stories et les critères d'acceptation
  - Prioriser le Product Backlog
  - Valider les livrables avec les parties prenantes
  - Assurer la liaison avec les autorités sanitaires de chaque pays

#### Scrum Master
- **Nom**: Jean Martin
- **Responsabilités**:
  - Faciliter les cérémonies Scrum
  - Supprimer les obstacles (impediments)
  - Coaching de l'équipe sur les pratiques agiles
  - Reporting et métriques de vélocité

#### Équipe de Développement (6 personnes)

1. **Tech Lead Frontend** - Sophie Laurent
   - React/TypeScript, UI/UX
   - Internationalisation (i18n)
   - Tests frontend automatisés

2. **Tech Lead Backend** - Pierre Rousseau
   - FastAPI, Python, Architecture API
   - Modèles IA et prédictions
   - Performance et scalabilité

3. **DevOps Engineer** - Ahmed Ben Ali
   - Docker/Kubernetes
   - CI/CD Pipelines
   - Infrastructure as Code

4. **Data Engineer** - Lisa Chen
   - ETL Processes
   - Base de données MySQL
   - Services de données

5. **Security Engineer** - Thomas Weber
   - Conformité RGPD
   - Sécurité des APIs
   - Audit et logs

6. **QA Engineer** - Elena Rodriguez
   - Tests automatisés
   - Tests d'intégration
   - Qualité de code

## Configuration des Sprints

### Durée et Planning
- **Durée du Sprint**: 2 semaines (10 jours ouvrés)
- **Nombre total de Sprints**: 8 sprints
- **Capacité de l'équipe**: 240 story points par sprint (40 SP par développeur)

### Sprint 1 (2024-01-15 → 2024-01-26)
**Objectif**: Infrastructure de base et architecture multi-pays

#### User Stories Priorisées:
1. **US-001**: En tant qu'admin, je veux configurer l'infrastructure Docker pour chaque pays
   - **Story Points**: 21
   - **Critères d'acceptation**:
     - Dockerfiles créés pour tous les services
     - docker-compose.yml fonctionnels pour US/FR/CH
     - Services démarrables individuellement

2. **US-002**: En tant qu'utilisateur, je veux accéder au frontend dans ma langue
   - **Story Points**: 13
   - **Critères d'acceptation**:
     - Support FR/EN pour tous les pays
     - Support DE/IT pour la Suisse
     - Changement de langue persistant

3. **US-003**: En tant que développeur, je veux un pipeline CI/CD de base
   - **Story Points**: 34
   - **Critères d'acceptation**:
     - Pipeline GitHub Actions fonctionnel
     - Build automatique des images Docker
     - Tests de base intégrés

### Sprint 2 (2024-01-29 → 2024-02-09)
**Objectif**: API Backend et services de données

#### User Stories Priorisées:
1. **US-004**: En tant qu'API, je veux gérer les données sanitaires par pays
   - **Story Points**: 21
   - **Critères d'acceptation**:
     - CRUD complet pour maladies/pays/régions
     - Endpoints spécifiques par pays
     - Validation des données

2. **US-005**: En tant que service ETL, je veux importer les données de l'OMS
   - **Story Points**: 34
   - **Critères d'acceptation**:
     - Connecteur OMS fonctionnel
     - Transformation des données automatique
     - Logs et monitoring

### Sprint 3 (2024-02-12 → 2024-02-23)
**Objectif**: Sécurité et conformité RGPD

#### User Stories Priorisées:
1. **US-006**: En tant qu'utilisateur français, je veux que mes données soient conformes RGPD
   - **Story Points**: 55
   - **Critères d'acceptation**:
     - Chiffrement des données personnelles
     - Logs d'audit complets
     - Mécanisme de consentement

2. **US-007**: En tant qu'admin, je veux surveiller la sécurité des APIs
   - **Story Points**: 21
   - **Critères d'acceptation**:
     - Authentification JWT
     - Rate limiting
     - Monitoring des accès

## Cérémonies Scrum

### 1. Sprint Planning (Début de chaque sprint)
- **Durée**: 4 heures (2h partie 1 + 2h partie 2)
- **Participants**: Toute l'équipe Scrum
- **Agenda**:
  - Partie 1 (2h): Sélection des User Stories du Sprint Backlog
  - Partie 2 (2h): Décomposition en tâches techniques

**Template Sprint Planning**:
```markdown
# Sprint Planning - Sprint X

## Objectif du Sprint
[Objectif défini par le Product Owner]

## Vélocité Cible
- Vélocité moyenne équipe: 240 SP
- Vélocité ajustée: [selon contexte]

## User Stories Sélectionnées
| ID | User Story | Story Points | Assigné à |
|----|------------|-------------|-----------|
| US-XXX | [Description] | XX | [Nom] |

## Risques Identifiés
- [Risque 1 + plan de mitigation]
- [Risque 2 + plan de mitigation]

## Définition of Done Rappel
- [ ] Code développé et testé
- [ ] Tests automatisés passants
- [ ] Code review effectuée
- [ ] Documentation mise à jour
- [ ] Déployé en environnement de test
- [ ] Validation Product Owner
```

### 2. Daily Stand-up (Tous les jours)
- **Durée**: 15 minutes maximum
- **Heure**: 9h00 chaque matin
- **Format**: Physique + Visio pour équipe distribuée
- **Questions**:
  1. Qu'ai-je fait hier ?
  2. Que vais-je faire aujourd'hui ?
  3. Ai-je des obstacles ?

**Template Daily**:
```markdown
# Daily Stand-up - [Date]

## Tour de table (5 min max par personne)

### [Prénom Nom]
- **Hier**: [Tâches accomplies]
- **Aujourd'hui**: [Tâches prévues]
- **Obstacles**: [Blocages ou besoins d'aide]

## Obstacles à traiter
- [Obstacle 1] → Action: [Qui fait quoi]
- [Obstacle 2] → Action: [Qui fait quoi]

## Rappels
- [Événements importants du jour]
```

### 3. Sprint Review (Fin de sprint)
- **Durée**: 2 heures
- **Participants**: Équipe Scrum + Stakeholders
- **Agenda**:
  - Démonstration des fonctionnalités terminées
  - Feedback des stakeholders
  - Mise à jour du Product Backlog

**Template Sprint Review**:
```markdown
# Sprint Review - Sprint X

## Objectif du Sprint
[Rappel de l'objectif initial]

## Fonctionnalités Démontrées

### US-XXX: [Titre User Story]
- **Démo par**: [Nom]
- **Status**: ✅ Terminé / ⚠️ Partiellement / ❌ Non terminé
- **Feedback**:
  - [Commentaire stakeholder 1]
  - [Commentaire stakeholder 2]

## Métriques du Sprint
- **Story Points Planifiés**: XXX
- **Story Points Livrés**: XXX
- **Vélocité**: XXX
- **Burndown**: [Lien vers graphique]

## Product Backlog Updates
- [Nouvelles user stories ajoutées]
- [User stories modifiées]
- [Repriorisations]

## Actions Suivantes
- [Action 1] → [Responsable]
- [Action 2] → [Responsable]
```

### 4. Sprint Retrospective (Fin de sprint)
- **Durée**: 1.5 heures
- **Participants**: Équipe de développement + Scrum Master
- **Format**: What Went Well / What Could Be Improved / Actions

**Template Retrospective**:
```markdown
# Sprint Retrospective - Sprint X

## What Went Well ✅
- [Point positif 1]
- [Point positif 2]
- [Point positif 3]

## What Could Be Improved ⚠️
- [Point d'amélioration 1]
- [Point d'amélioration 2]
- [Point d'amélioration 3]

## Actions Concrètes 🎯
| Action | Responsable | Date limite | Priorité |
|--------|-------------|-------------|----------|
| [Action 1] | [Nom] | [Date] | Haute/Moyenne/Basse |
| [Action 2] | [Nom] | [Date] | Haute/Moyenne/Basse |

## Métriques d'Équipe
- **Bonheur de l'équipe** (1-5): X.X/5
- **Confiance dans l'objectif** (1-5): X.X/5
- **Collaboration** (1-5): X.X/5

## Impediments Résolus
- [Impediment 1] → [Solution appliquée]
- [Impediment 2] → [Solution appliquée]

## Prochaines Actions Scrum Master
- [Action SM 1]
- [Action SM 2]
```

## Outils et Workflow

### Outils Utilisés
1. **Jira**: Gestion du Product Backlog et Sprint Backlog
2. **Confluence**: Documentation et knowledge base
3. **Slack**: Communication quotidienne
4. **GitHub**: Code source et intégration Jira
5. **Grafana**: Métriques techniques et business

### Workflow Git
```
main ← develop ← feature/US-XXX-description
           ↑
      release/sprint-X
```

### Définition of Ready (User Stories)
- [ ] User story écrite selon le format "En tant que... Je veux... Afin de..."
- [ ] Critères d'acceptation définis et testables
- [ ] Story points estimés par l'équipe
- [ ] Dépendances identifiées
- [ ] Maquettes/wireframes disponibles si nécessaire
- [ ] Contraintes techniques documentées

### Définition of Done
- [ ] Code développé conforme aux standards
- [ ] Tests unitaires écrits et passants (>80% couverture)
- [ ] Tests d'intégration passants
- [ ] Code review effectuée et approuvée
- [ ] Documentation technique mise à jour
- [ ] Sécurité vérifiée (scan de vulnérabilités)
- [ ] Déployé en environnement de test
- [ ] Tests d'acceptation validés par le PO
- [ ] Conformité pays vérifiée (US/FR/CH)

## Métriques et Reporting

### Métriques Suivies
1. **Vélocité de l'équipe** (story points par sprint)
2. **Burndown Chart** (progression sprint)
3. **Lead Time** (temps de développement)
4. **Cycle Time** (temps en développement)
5. **Défaut Rate** (bugs par fonctionnalité)
6. **Team Happiness** (satisfaction équipe)

### Reporting Cycle
- **Daily**: Mise à jour Jira + Stand-up
- **Hebdomadaire**: Rapport d'avancement stakeholders
- **Sprint**: Sprint Review + Retrospective
- **Mensuel**: Rapport exécutif + ROI

---

Cette configuration Scrum est adaptée aux spécificités du projet MSPR3 avec ses contraintes multi-pays et ses exigences techniques élevées. Elle sera ajustée au fur et à mesure des apprentissages de l'équipe.
