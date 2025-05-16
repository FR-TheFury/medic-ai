
import MainLayout from '@/components/layouts/MainLayout';
import PredictionForm from '@/components/prediction/PredictionForm';
import PredictionResultCard from '@/components/prediction/PredictionResultCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';

interface PredictionResult {
  pays: string;
  taux_mortalite: number;
}

export default function Prediction() {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredictionResult = (result: PredictionResult) => {
    setPredictionResult(result);
    setError(null);
  };

  const handlePredictionError = (errorMessage: string) => {
    setError(errorMessage);
    setPredictionResult(null);
  };

  const handlePredictionStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handlePredictionEnd = () => {
    setIsLoading(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prédiction</h1>
          <p className="text-muted-foreground mt-1">
            Utilisez notre modèle d'IA pour prédire les tendances pandémiques
          </p>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Cette page vous permet d'utiliser notre modèle d'IA pour prédire le taux de mortalité
            en fonction des données que vous saisissez. Assurez-vous de fournir des données précises
            pour obtenir les meilleures prédictions.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="mortality">
          <TabsList>
            <TabsTrigger value="mortality">Taux de mortalité</TabsTrigger>
            <TabsTrigger value="spread" disabled>Propagation (Bientôt disponible)</TabsTrigger>
            <TabsTrigger value="variants" disabled>Variants (Bientôt disponible)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mortality" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <PredictionForm 
                  onPredictionResult={handlePredictionResult}
                  onPredictionError={handlePredictionError}
                  onPredictionStart={handlePredictionStart}
                  onPredictionEnd={handlePredictionEnd}
                />
              </div>
              
              <div>
                {(predictionResult || isLoading || error) ? (
                  <PredictionResultCard 
                    pays={predictionResult?.pays || ''}
                    tauxMortalite={predictionResult?.taux_mortalite || 0}
                    isLoading={isLoading}
                    error={error || undefined}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>À propos du modèle de prédiction</CardTitle>
                      <CardDescription>
                        Comprendre comment fonctionne notre modèle de prédiction du taux de mortalité
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        Notre modèle d'intelligence artificielle a été entraîné sur des données historiques
                        de plusieurs pays pour prédire le taux de mortalité d'une maladie en fonction de
                        différents facteurs.
                      </p>
                      
                      <h3 className="font-semibold text-lg mt-2">Facteurs pris en compte :</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Nombre de nouveaux cas</li>
                        <li>Nombre de décès</li>
                        <li>Densité de population</li>
                        <li>Produit intérieur brut (PIB)</li>
                        <li>Population totale</li>
                        <li>Nombre de personnes vaccinées</li>
                        <li>Nombre d'hospitalisations en soins intensifs</li>
                      </ul>
                      
                      <h3 className="font-semibold text-lg mt-2">Précision du modèle :</h3>
                      <p>
                        Le modèle a une précision moyenne de 85% basée sur les données de validation.
                        La précision peut varier en fonction de la qualité et de la quantité des données
                        fournies.
                      </p>
                      
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Avertissement</AlertTitle>
                        <AlertDescription>
                          Ce modèle est fourni à titre informatif uniquement et ne doit pas être utilisé
                          comme seule source pour la prise de décisions médicales ou politiques. 
                          Consultez toujours des experts en santé publique.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
