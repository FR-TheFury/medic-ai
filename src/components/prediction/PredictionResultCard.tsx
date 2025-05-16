
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PredictionResultProps {
  pays: string;
  tauxMortalite: number;
  isLoading?: boolean;
  error?: string;
}

const PredictionResultCard = ({ pays, tauxMortalite, isLoading = false, error }: PredictionResultProps) => {
  // Helper function to determine severity level color
  const getSeverityColor = (rate: number) => {
    if (rate < 1) return "bg-green-500";
    if (rate < 3) return "bg-yellow-500";
    if (rate < 5) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSeverityText = (rate: number) => {
    if (rate < 1) return "Faible";
    if (rate < 3) return "Modéré";
    if (rate < 5) return "Élevé";
    return "Très élevé";
  };

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
              <span className={`px-2 py-1 rounded text-white text-sm font-medium ${getSeverityColor(tauxMortalite)}`}>
                {getSeverityText(tauxMortalite)}
              </span>
            </div>
            
            <div>
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taux de mortalité prédit</span>
                <span className="font-bold text-xl">{tauxMortalite.toFixed(2)}%</span>
              </div>
              <Progress 
                value={tauxMortalite * 5} // Scale to make the progress more visible
                className={`h-2 ${getSeverityColor(tauxMortalite)}`} 
              />
            </div>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <h4 className="font-medium mb-2">Interprétation</h4>
              <p className="text-sm text-muted-foreground">
                {tauxMortalite < 1 ? (
                  "Le modèle prédit un taux de mortalité faible. La propagation de la maladie semble être bien contrôlée avec les mesures en place."
                ) : tauxMortalite < 3 ? (
                  "Le modèle prédit un taux de mortalité modéré. Des mesures de santé publique supplémentaires pourraient être recommandées."
                ) : tauxMortalite < 5 ? (
                  "Le modèle prédit un taux de mortalité élevé. Une intervention urgente des autorités sanitaires est fortement recommandée."
                ) : (
                  "Le modèle prédit un taux de mortalité très élevé. Une situation critique nécessitant des mesures d'urgence et une mobilisation maximale du système de santé."
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
