import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MSPR() {
  const teamMembers = [
    { name: "Téo Debay", role: "Développeur de l'application complète" },
    { name: "Jérome Rose", role: "Développeur des modèles IA" },
    { name: "Hodari Bigwi", role: "Tests et documentation" },
    { name: "Martin Beaucheron", role: "Documentation accessibilité" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Présentation du MSPR</h1>
          <p className="text-muted-foreground mt-1">
            Suivi et prédiction de pandémies mondiales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>À propos du projet</CardTitle>
              <CardDescription>
                Une présentation du contexte et des objectifs du MSPR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Contexte</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dans un contexte mondial marqué par des pandémies récentes, il devient crucial de disposer d'outils 
                  permettant de suivre l'évolution des maladies infectieuses et de prédire leur propagation. Notre 
                  MSPR s'inscrit dans cette démarche en proposant une solution innovante basée sur l'intelligence 
                  artificielle.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Objectifs</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                  <li>Créer une interface utilisateur intuitive pour visualiser les données épidémiologiques</li>
                  <li>Développer un modèle d'IA capable de prédire l'évolution des pandémies</li>
                  <li>Mettre en place une API REST pour la gestion des données</li>
                  <li>Assurer la sécurité et la confidentialité des données sensibles</li>
                  <li>Offrir des outils d'aide à la décision pour les autorités sanitaires</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Technologies utilisées</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge>React.js</Badge>
                  <Badge>TypeScript</Badge>
                  <Badge>Tailwind CSS</Badge>
                  <Badge>FastAPI</Badge>
                  <Badge>SQLAlchemy</Badge>
                  <Badge>MySQL</Badge>
                  <Badge>scikit-learn</Badge>
                  <Badge>pandas</Badge>
                  <Badge>joblib</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notre équipe</CardTitle>
              <CardDescription>
                Les membres de l'équipe projet et leurs rôles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge variant="outline">{index === 0 ? "Lead Dev" : "Member"}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Architecture du système</CardTitle>
            <CardDescription>
              Vue d'ensemble de l'architecture technique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-lg mb-2">Frontend</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Interface utilisateur React</li>
                  <li>Visualisation de données</li>
                  <li>Tableaux de bord interactifs</li>
                  <li>Formulaires de saisie</li>
                  <li>Authentification des utilisateurs</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-lg mb-2">Backend</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>API REST FastAPI</li>
                  <li>Gestion des données</li>
                  <li>Sécurité et autorisations</li>
                  <li>Validation des entrées</li>
                  <li>Journalisation des événements</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-lg mb-2">Intelligence Artificielle</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Modèles de prédiction</li>
                  <li>Analyse des tendances</li>
                  <li>Apprentissage automatique</li>
                  <li>Traitement des données</li>
                  <li>Évaluation des modèles</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Flux de données</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Le système collecte des données épidémiologiques provenant de diverses sources, les stocke dans une base de données MySQL, 
                les traite à l'aide de modèles d'IA, puis les présente aux utilisateurs via l'interface frontend. Les utilisateurs peuvent 
                également saisir de nouvelles données et lancer des prédictions.
              </p>

              <div className="border rounded-lg p-4 bg-muted/10">
                <h4 className="font-semibold mb-2">Exemple de flux de prédiction</h4>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>L'utilisateur saisit les paramètres de prédiction via l'interface</li>
                  <li>Le frontend envoie une requête à l'API</li>
                  <li>L'API valide les données et les transmet au modèle d'IA</li>
                  <li>Le modèle effectue la prédiction et renvoie le résultat</li>
                  <li>L'API formate la réponse et la renvoie au frontend</li>
                  <li>Le frontend affiche le résultat à l'utilisateur</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
