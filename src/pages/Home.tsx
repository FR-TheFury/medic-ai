
import { Activity, Users, Target, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const teamMembers = [
    { name: "Téo Debay", role: "Développeur de l'application complète" },
    { name: "Jérome Rose", role: "Développeur des modèles IA" },
    { name: "Hodari Bigwi", role: "Tests et documentation" },
    { name: "Martin Beaucheron", role: "Documentation accessibilité" },
  ];

  const features = [
    {
      icon: Activity,
      title: "Suivi en temps réel",
      description: "Monitoring des données épidémiologiques en continu"
    },
    {
      icon: Target,
      title: "Prédictions IA",
      description: "Modèles d'intelligence artificielle pour anticiper l'évolution"
    },
    {
      icon: Shield,
      title: "Sécurité des données",
      description: "Protection et confidentialité des informations sensibles"
    },
    {
      icon: Users,
      title: "Interface intuitive",
      description: "Tableaux de bord clairs pour les professionnels de santé"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header avec logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Activity className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Bienvenue sur
            <span className="text-primary block mt-2">PandemicTracker</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Projet MSPR - Suivi et prédiction de pandémies mondiales
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg">
                  <Link to="/dashboard">
                    Accéder au Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/prediction">
                    Faire une Prédiction
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/login">
                    Se connecter
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">
                    S'inscrire
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notre équipe */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Notre équipe MSPR</CardTitle>
            <CardDescription>
              Les membres de l'équipe projet et leurs spécialités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {index === 0 ? "Lead Dev" : "Membre"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>© 2024 PandemicTracker - Projet MSPR</p>
        </div>
      </div>
    </div>
  );
}
