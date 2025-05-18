
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PredictionResultProps {
  pays: string;
  valeurPrediction: number;
  isLoading?: boolean;
  error?: string;
  typePrediction: "hospitalisation" | "mortalite";
}

const PredictionResultCard = ({ 
  pays, 
  valeurPrediction, 
  isLoading = false, 
  error,
  typePrediction = "hospitalisation" 
}: PredictionResultProps) => {
  
  // Helper function to determine severity level color
  const getSeverityColor = (value: number, type: "hospitalisation" | "mortalite") => {
    if (type === "mortalite") {
      if (value < 1) return "bg-green-500";
      if (value < 3) return "bg-yellow-500";
      if (value < 5) return "bg-orange-500";
      return "bg-red-500";
    } else {
      // Pour les hospitalisations (nombres plus élevés)
      if (value < 500) return "bg-green-500";
      if (value < 1000) return "bg-yellow-500";
      if (value < 2000) return "bg-orange-500";
      return "bg-red-500";
    }
  };

  const getSeverityText = (value: number, type: "hospitalisation" | "mortalite") => {
    if (type === "mortalite") {
      if (value < 1) return "Faible";
      if (value < 3) return "Modéré";
      if (value < 5) return "Élevé";
      return "Très élevé";
    } else {
      // Pour les hospitalisations
      if (value < 500) return "Faible";
      if (value < 1000) return "Modéré";
      if (value < 2000) return "Élevé";
      return "Très élevé";
    }
  };

  // Fonction pour déterminer le titre et l'unité
  const getPredictionInfo = (type: "hospitalisation" | "mortalite") => {
    if (type === "mortalite") {
      return {
        title: "Taux de mortalité prédit",
        unit: "%",
        progressMax: 5
      };
    } else {
      return {
        title: "Nombre d'hospitalisations prédit",
        unit: "",
        progressMax: 2000
      };
    }
  };

  const info = getPredictionInfo(typePrediction);

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de prédiction</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Résultat de la prédiction</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">{pays}</h3>
              <span className={`px-2 py-1 rounded text-white text-sm font-medium ${getSeverityColor(valeurPrediction, typePrediction)}`}>
                {getSeverityText(valeurPrediction, typePrediction)}
              </span>
            </div>
            
            <div>
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{info.title}</span>
                <span className="font-bold text-xl">
                  {typePrediction === "mortalite" 
                    ? `${valeurPrediction.toFixed(2)}${info.unit}`
                    : `${Math.round(valeurPrediction)} patients`}
                </span>
              </div>
              <Progress 
                value={(valeurPrediction / info.progressMax) * 100} 
                className={`h-2 ${getSeverityColor(valeurPrediction, typePrediction)}`} 
              />
            </div>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <h4 className="font-medium mb-2">Interprétation</h4>
              <p className="text-sm text-muted-foreground">
                {typePrediction === "mortalite" ? (
                  valeurPrediction < 1 ? (
                    "Le modèle prédit un taux de mortalité faible. La propagation de la maladie semble être bien contrôlée avec les mesures en place."
                  ) : valeurPrediction < 3 ? (
                    "Le modèle prédit un taux de mortalité modéré. Des mesures de santé publique supplémentaires pourraient être recommandées."
                  ) : valeurPrediction < 5 ? (
                    "Le modèle prédit un taux de mortalité élevé. Une intervention urgente des autorités sanitaires est fortement recommandée."
                  ) : (
                    "Le modèle prédit un taux de mortalité très élevé. Une situation critique nécessitant des mesures d'urgence et une mobilisation maximale du système de santé."
                  )
                ) : (
                  // Interprétation pour les hospitalisations
                  valeurPrediction < 500 ? (
                    "Le modèle prédit un nombre d'hospitalisations faible. Les capacités hospitalières actuelles devraient être suffisantes."
                  ) : valeurPrediction < 1000 ? (
                    "Le modèle prédit un nombre d'hospitalisations modéré. Une vigilance accrue et une préparation des services hospitaliers sont recommandées."
                  ) : valeurPrediction < 2000 ? (
                    "Le modèle prédit un nombre d'hospitalisations élevé. Une mobilisation des ressources hospitalières et un renforcement des capacités sont fortement conseillés."
                  ) : (
                    "Le modèle prédit un nombre d'hospitalisations très élevé. Une situation critique nécessitant des mesures d'urgence, l'ouverture de lits supplémentaires et une coordination entre établissements."
                  )
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionResultCard;
