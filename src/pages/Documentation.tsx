import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Documentation() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Documentation complète de l'application de prédiction pandémique
          </p>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="frontend" className="flex-1">Frontend</TabsTrigger>
            <TabsTrigger value="backend" className="flex-1">Backend</TabsTrigger>
            <TabsTrigger value="models" className="flex-1">Modèles IA</TabsTrigger>
            <TabsTrigger value="accessibility" className="flex-1">Accessibilité</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Présentation du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Cette application web permet de visualiser et de prédire l'évolution de maladies 
                  infectieuses à l'aide de modèles d'intelligence artificielle. Elle facilite l'analyse 
                  des données épidémiologiques et offre des outils de prévision pour aider à la prise de décision.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Fonctionnalités principales</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tableau de bord avec visualisation des données</li>
                  <li>Catalogue de maladies infectieuses</li>
                  <li>Informations géographiques par pays</li>
                  <li>Relevés épidémiologiques détaillés</li>
                  <li>Prédiction par IA du nombre d'hospitalisations</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Architecture générale</h3>
                <p>
                  L'application est construite selon une architecture client-serveur moderne:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Frontend:</strong> Application React avec TypeScript, utilisant les librairies 
                    Tailwind CSS et shadcn/ui pour l'interface utilisateur
                  </li>
                  <li>
                    <strong>Backend:</strong> API FastAPI (Python) connectée à une base de données SQL
                  </li>
                  <li>
                    <strong>Modèles IA:</strong> Modèles préentraînés stockés dans le backend
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="frontend" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Architecture Frontend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Le frontend est développé avec React 18 et TypeScript, offrant une base solide et typée pour 
                  l'application. L'architecture est organisée autour de composants réutilisables et d'une 
                  séparation claire des responsabilités.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Technologies utilisées</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>React 18:</strong> Bibliothèque UI pour la construction d'interfaces utilisateur</li>
                  <li><strong>TypeScript:</strong> Superset de JavaScript ajoutant le typage statique</li>
                  <li><strong>React Router v6:</strong> Gestion du routage dans l'application</li>
                  <li><strong>Tailwind CSS:</strong> Framework CSS utilitaire pour le styling</li>
                  <li><strong>shadcn/ui:</strong> Bibliothèque de composants UI modernes et accessibles</li>
                  <li><strong>Axios:</strong> Client HTTP pour les requêtes API</li>
                  <li><strong>Lucide React:</strong> Bibliothèque d'icônes SVG</li>
                  <li><strong>Recharts:</strong> Bibliothèque de visualisation de données</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Structure des dossiers</h3>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`src/
├── components/           # Composants réutilisables
│   ├── ui/               # Composants UI de base (shadcn)
│   ├── layouts/          # Layouts réutilisables
│   ├── auth/             # Composants d'authentification
│   ├── prediction/       # Composants de prédiction
│   ├── dashboard/        # Composants du tableau de bord
│   └── maladies/         # Composants liés aux maladies
├── pages/                # Pages de l'application
├── lib/                  # Utilitaires et services
├── hooks/                # Hooks personnalisés
└── contexts/             # Contextes React`}
                </pre>
                
                <h3 className="text-lg font-medium mt-4">Flux de données</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Les composants React utilisent des hooks personnalisés pour accéder aux données</li>
                  <li>Les hooks appellent les services API dans le dossier lib/api.ts</li>
                  <li>Les données sont stockées dans l'état local des composants ou contextes globaux</li>
                  <li>Les formulaires utilisent React Hook Form pour la validation et la soumission</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Composants principaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">Page de prédiction</h3>
                <p>
                  La page de prédiction (src/pages/Prediction.tsx) est le cœur de l'application. Elle permet 
                  aux utilisateurs de prédire le nombre d'hospitalisations en utilisant nos modèles d'IA.
                </p>
                
                <h4 className="text-md font-medium mt-3">Composants principaux:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>HospitalizationForm:</strong> Formulaire de saisie des données pour la prédiction.
                    Permet à l'utilisateur d'entrer les données épidémiologiques manuellement.
                  </li>
                  <li>
                    <strong>CSVUploadForm:</strong> Permet d'uploader un fichier CSV contenant les données.
                    Inclut une validation et une prévisualisation des données.
                  </li>
                  <li>
                    <strong>PredictionResultCard:</strong> Affiche les résultats de la prédiction avec 
                    indicateurs visuels et interprétation.
                  </li>
                </ul>
                
                <h4 className="text-md font-medium mt-3">Flux utilisateur:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>L'utilisateur sélectionne la méthode d'entrée (saisie manuelle ou import CSV)</li>
                  <li>L'utilisateur entre les données ou télécharge un fichier</li>
                  <li>L'application valide les données et les envoie à l'API</li>
                  <li>Le résultat de la prédiction s'affiche avec une interprétation</li>
                </ol>
                
                <h3 className="text-lg font-medium mt-4">Client API</h3>
                <p>
                  Le client API (src/lib/api.ts) est un module central qui gère toutes les communications 
                  avec le backend. Il utilise Axios pour les requêtes HTTP et implémente des mécanismes de 
                  gestion d'erreurs et de vérification de disponibilité.
                </p>
                
                <h4 className="text-md font-medium mt-3">Caractéristiques:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Vérification périodique de la disponibilité de l'API</li>
                  <li>Gestion des erreurs CORS</li>
                  <li>Intercepteurs pour le traitement des requêtes et des réponses</li>
                  <li>Organisation des endpoints par domaine fonctionnel</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backend" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Architecture Backend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Le backend est construit avec FastAPI, un framework Python moderne pour la création d'APIs 
                  web rapides. Il suit une architecture RESTful et utilise SQLAlchemy comme ORM.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Technologies utilisées</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>FastAPI:</strong> Framework web Python rapide pour les APIs</li>
                  <li><strong>SQLAlchemy:</strong> ORM Python pour l'interaction avec la base de données</li>
                  <li><strong>Pydantic:</strong> Validation des données et serialization</li>
                  <li><strong>Scikit-learn:</strong> Bibliothèque pour le machine learning</li>
                  <li><strong>Pandas:</strong> Manipulation et analyse de données</li>
                  <li><strong>Pickle:</strong> Sérialisation des modèles ML</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Structure des dossiers</h3>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`fast-api/
├── API/
│   ├── __init__.py
│   ├── main.py           # Point d'entrée de l'application
│   ├── models.py         # Définition des modèles de données
│   ├── database.py       # Configuration de la base de données
│   ├── crud.py           # Opérations CRUD
│   ├── models/           # Modèles ML préentraînés
│   │   ├── classique/
│   │   │   ├── nbHospitalisation/  # Modèles de prédiction d'hospitalisations
│   │   │   ├── nbNouveauCas/       # Modèles de prédiction de nouveaux cas
│   │   │   └── tauxMortalite/      # Modèles de prédiction de taux de mortalité
│   │   └── temporel/      # Modèles temporels (LSTM)
└── requirements.txt      # Dépendances du projet`}
                </pre>
                
                <h3 className="text-lg font-medium mt-4">API Endpoints principaux</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Endpoint</th>
                      <th className="border p-2 text-left">Méthode</th>
                      <th className="border p-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2"><code>/prediction/hospitalisation/</code></td>
                      <td className="border p-2">POST</td>
                      <td className="border p-2">Prédiction du nombre d'hospitalisations</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code>/prediction/hospitalisation/csv/</code></td>
                      <td className="border p-2">POST</td>
                      <td className="border p-2">Prédiction à partir d'un fichier CSV</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code>/prediction/mortalite/</code></td>
                      <td className="border p-2">POST</td>
                      <td className="border p-2">Prédiction du taux de mortalité</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code>/maladies/</code></td>
                      <td className="border p-2">GET</td>
                      <td className="border p-2">Liste des maladies</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code>/releves/</code></td>
                      <td className="border p-2">GET</td>
                      <td className="border p-2">Liste des relevés épidémiologiques</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code>/pays/</code></td>
                      <td className="border p-2">GET</td>
                      <td className="border p-2">Liste des pays</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="models" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Modèles d'IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Notre application utilise plusieurs modèles d'intelligence artificielle préentraînés 
                  pour effectuer des prédictions. Ces modèles sont stockés dans le dossier 
                  <code> fast-api/API/models/</code> et sont chargés dynamiquement à l'exécution.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Types de modèles</h3>
                <h4 className="text-md font-medium mt-3">Modèles classiques</h4>
                <p>
                  Ces modèles utilisent des techniques de machine learning classiques comme les arbres de décision, 
                  les forêts aléatoires et les algorithmes de gradient boosting.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Modèles d'hospitalisation (nbHospitalisation):</strong> Prédisent le nombre 
                    de patients qui nécessiteront une hospitalisation
                  </li>
                  <li>
                    <strong>Modèles de nouveaux cas (nbNouveauCas):</strong> Prédisent le nombre de 
                    nouveaux cas d'infection
                  </li>
                  <li>
                    <strong>Modèles de taux de mortalité (tauxMortalite):</strong> Prédisent le taux 
                    de mortalité d'une maladie
                  </li>
                </ul>
                
                <h4 className="text-md font-medium mt-3">Modèles temporels</h4>
                <p>
                  Ces modèles utilisent des réseaux de neurones récurrents (LSTM) pour capturer les 
                  dépendances temporelles dans les données épidémiologiques.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Format des modèles</h3>
                <p>
                  Les modèles sont stockés au format pickle (.pkl) pour les modèles classiques et au 
                  format .h5 pour les modèles de deep learning. Chaque modèle est spécifique à un pays 
                  et à un type de prédiction.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Convention de nommage</h3>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`model_[type]_[pays]_[algo]_opt.pkl

Où:
- [type]: type de prédiction (hosp, newCas, tauxMortalite)
- [pays]: pays concerné (france, italie, etc.)
- [algo]: algorithme utilisé (cat, xgb, lightgbm, rf, etc.)
- opt: indique que le modèle a été optimisé`}
                </pre>
                
                <h3 className="text-lg font-medium mt-4">Exemples de modèles disponibles</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Nom du modèle</th>
                      <th className="border p-2 text-left">Pays</th>
                      <th className="border p-2 text-left">Type</th>
                      <th className="border p-2 text-left">Algorithme</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2"><code>model_hosp_france_xgb_opt.pkl</code></td>
                      <td className="border p-2">France</td>
                      <td className="border p-2">Hospitalisations</td>
                      <td className="border p-2">XGBoost</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code>model_hosp_italie_lightgbm_opt.pkl</code></td>
                      <td className="border p-2">Italie</td>
                      <td className="border p-2">Hospitalisations</td>
                      <td className="border p-2">LightGBM</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code>model_hosp_japon_cat_opt.pkl</code></td>
                      <td className="border p-2">Japon</td>
                      <td className="border p-2">Hospitalisations</td>
                      <td className="border p-2">CatBoost</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accessibility" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités d'accessibilité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  L'application PandemicTracker est conçue pour être accessible à tous les utilisateurs, 
                  y compris ceux ayant des besoins spécifiques. Nous avons implémenté un ensemble complet 
                  de fonctionnalités d'accessibilité conformes aux directives WCAG 2.1.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Barre d'outils d'accessibilité</h3>
                <p>
                  Une barre d'outils dédiée est disponible en permanence via le bouton en bas à droite 
                  de l'écran. Elle peut être ouverte avec <kbd>Alt + A</kbd> et offre les fonctionnalités suivantes :
                </p>
                
                <h4 className="text-md font-medium mt-3">Mode contraste élevé</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Activation/désactivation via <kbd>Alt + H</kbd></li>
                  <li>Améliore la visibilité des textes et des éléments interactifs</li>
                  <li>Augmente le contraste des couleurs (200%), la luminosité (120%) et la saturation (150%)</li>
                  <li>Adaptation spéciale pour le mode sombre</li>
                  <li>Bordures renforcées pour tous les éléments interactifs</li>
                </ul>
                
                <h4 className="text-md font-medium mt-3">Ajustement de la taille de police</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Trois tailles disponibles : Petite (A), Moyenne (A), Grande (A)</li>
                  <li>Raccourcis clavier : <kbd>Alt + 1</kbd> (petite), <kbd>Alt + 2</kbd> (moyenne), <kbd>Alt + 3</kbd> (grande)</li>
                  <li>Hiérarchie correcte maintenue entre tous les éléments typographiques</li>
                  <li>Adaptation responsive pour mobile et desktop</li>
                </ul>
                
                <h4 className="text-md font-medium mt-3">Lecture audio native</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Utilise l'API Web Speech Synthesis du navigateur</li>
                  <li>Lecture en français (fr-FR) avec paramètres optimisés</li>
                  <li>Bouton de test intégré dans la barre d'outils</li>
                  <li>Arrêt de la lecture avec <kbd>Alt + S</kbd> ou <kbd>Échap</kbd></li>
                  <li>Indicateur visuel pendant la lecture</li>
                  <li>Compatible avec les lecteurs d'écran externes</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Navigation et raccourcis clavier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">Navigation au clavier</h3>
                <p>
                  L'application est entièrement navigable au clavier pour les utilisateurs qui ne peuvent 
                  pas utiliser une souris ou préfèrent la navigation clavier.
                </p>
                
                <h4 className="text-md font-medium mt-3">Raccourcis principaux</h4>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Raccourci</th>
                      <th className="border p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2"><kbd>Alt + M</kbd></td>
                      <td className="border p-2">Aller au menu principal</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Alt + C</kbd></td>
                      <td className="border p-2">Aller au contenu principal</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Alt + A</kbd></td>
                      <td className="border p-2">Ouvrir les options d'accessibilité</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Alt + H</kbd></td>
                      <td className="border p-2">Basculer le contraste élevé</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Alt + 1/2/3</kbd></td>
                      <td className="border p-2">Changer la taille de police</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Alt + S</kbd></td>
                      <td className="border p-2">Arrêter la lecture audio</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Tab</kbd></td>
                      <td className="border p-2">Naviguer vers l'élément suivant</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Shift + Tab</kbd></td>
                      <td className="border p-2">Naviguer vers l'élément précédent</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Entrée / Espace</kbd></td>
                      <td className="border p-2">Activer l'élément focalisé</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><kbd>Échap</kbd></td>
                      <td className="border p-2">Fermer les dialogues / Arrêter la lecture</td>
                    </tr>
                  </tbody>
                </table>
                
                <h3 className="text-lg font-medium mt-4">Liens d'évitement (Skip Links)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Lien "Aller au contenu principal" en haut de chaque page</li>
                  <li>Visible uniquement lors de la navigation au clavier</li>
                  <li>Permet de contourner la navigation pour accéder directement au contenu</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Indicateurs de focus</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Contour visible de 3px autour des éléments focalisés</li>
                  <li>Couleur primaire pour une bonne visibilité</li>
                  <li>Décalage de 2px pour éviter la superposition</li>
                  <li>Focus renforcé en mode contraste élevé (4px jaune)</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compatibilité avec les lecteurs d'écran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">Support des lecteurs d'écran</h3>
                <p>
                  L'application est optimisée pour fonctionner avec les principaux lecteurs d'écran :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>NVDA</strong> (Windows) - Support complet</li>
                  <li><strong>JAWS</strong> (Windows) - Support complet</li>
                  <li><strong>VoiceOver</strong> (macOS/iOS) - Support complet</li>
                  <li><strong>TalkBack</strong> (Android) - Support de base</li>
                  <li><strong>Lecteur d'écran Windows</strong> - Support de base</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Zones live ARIA</h3>
                <p>
                  Deux zones live sont présentes dans l'application pour communiquer avec les lecteurs d'écran :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Zone d'annonces (aria-live="polite") :</strong> Pour les notifications non urgentes</li>
                  <li><strong>Zone d'alertes (aria-live="assertive") :</strong> Pour les messages urgents</li>
                  <li>Messages automatiquement effacés après 1 seconde pour permettre de nouvelles annonces</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Attributs ARIA</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>aria-label :</strong> Libellés descriptifs pour tous les éléments interactifs</li>
                  <li><strong>aria-describedby :</strong> Descriptions détaillées des fonctionnalités</li>
                  <li><strong>aria-expanded :</strong> État des éléments pliables/dépliables</li>
                  <li><strong>aria-pressed :</strong> État des boutons toggle</li>
                  <li><strong>aria-current :</strong> Page actuelle dans la navigation</li>
                  <li><strong>role :</strong> Rôles sémantiques appropriés (navigation, main, dialog, etc.)</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Structure sémantique</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Utilisation correcte des balises HTML5 sémantiques</li>
                  <li>Hiérarchie des titres respectée (h1, h2, h3...)</li>
                  <li>Balises <code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;header&gt;</code> appropriées</li>
                  <li>Formulaires avec labels associés</li>
                  <li>Tableaux avec en-têtes appropriés</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités avancées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">Réduction des animations</h3>
                <p>
                  Respect de la préférence utilisateur <code>prefers-reduced-motion</code> :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Animations réduites à 0.01ms pour les utilisateurs sensibles au mouvement</li>
                  <li>Transitions désactivées automatiquement</li>
                  <li>Défilement fluide désactivé</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Validation des formulaires</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Bordures colorées pour les champs valides/invalides</li>
                  <li>Messages d'erreur associés aux champs</li>
                  <li>Support complet du clavier pour la navigation</li>
                  <li>Labels obligatoires avec curseur pointer</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Amélioration des contrastes</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Respect des ratios de contraste WCAG AA (4.5:1)</li>
                  <li>Mode contraste élevé pour les utilisateurs malvoyants</li>
                  <li>Adaptation automatique des couleurs en mode sombre</li>
                  <li>Indicateurs visuels renforcés pour les états (hover, focus, active)</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Classes utilitaires</h3>
                <p>
                  Classes CSS spéciales pour l'accessibilité :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><code>.sr-only</code> : Contenu visible uniquement par les lecteurs d'écran</li>
                  <li><code>.skip-link</code> : Liens d'évitement stylisés</li>
                  <li><code>.speak-text</code> : Éléments avec indicateur de lecture audio</li>
                  <li><code>.high-contrast</code> : Styles pour le mode contraste élevé</li>
                  <li><code>.font-small/medium/large</code> : Gestion des tailles de police</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Tests et compatibilité</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tests avec NVDA et VoiceOver</li>
                  <li>Navigation complète au clavier testée</li>
                  <li>Validation W3C des balises ARIA</li>
                  <li>Tests de contraste avec des outils automatisés</li>
                  <li>Support multi-navigateurs (Chrome, Firefox, Safari, Edge)</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Utilisation recommandée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">Pour les utilisateurs malvoyants</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Activer le mode contraste élevé avec <kbd>Alt + H</kbd></li>
                  <li>Ajuster la taille de police avec <kbd>Alt + 1/2/3</kbd></li>
                  <li>Utiliser un lecteur d'écran compatible (NVDA recommandé)</li>
                  <li>Naviguer avec <kbd>Tab</kbd> et <kbd>Shift + Tab</kbd></li>
                </ol>
                
                <h3 className="text-lg font-medium mt-4">Pour les utilisateurs sourds ou malentendants</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Toutes les informations audio ont des équivalents visuels</li>
                  <li>Les notifications importantes utilisent des toasts visuels</li>
                  <li>Pas de contenu uniquement audio</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Pour les utilisateurs avec difficultés motrices</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Navigation complète au clavier</li>
                  <li>Zones de clic suffisamment grandes (44px minimum)</li>
                  <li>Pas de contraintes de temps</li>
                  <li>Raccourcis clavier pour les actions fréquentes</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-4">Support technique</h3>
                <p>
                  En cas de problème d'accessibilité, les fonctionnalités de debug sont disponibles :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Console logs pour suivre les annonces aux lecteurs d'écran</li>
                  <li>Indicateurs visuels pour les états de focus</li>
                  <li>Messages de confirmation pour toutes les actions d'accessibilité</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
