
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
