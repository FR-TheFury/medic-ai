
import MainLayout from '@/components/layouts/MainLayout';
import PredictionResultCard from '@/components/prediction/PredictionResultCard';
import PredictionChart from '@/components/prediction/PredictionChart';
import HospitalizationForm from '@/components/prediction/HospitalizationForm';
import CSVUploadForm from '@/components/prediction/CSVUploadForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';

interface PredictionResult {
  pays: string;
  nombre_hospitalisations?: number;
  taux_mortalite?: number;
}

export default function Prediction() {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("hospitalisation");
  const [inputMethod, setInputMethod] = useState("form");

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
            Cette page vous permet d'utiliser notre modèle d'IA pour prédire le nombre d'hospitalisations
            en fonction des données que vous saisissez. Vous pouvez entrer les données manuellement
            ou télécharger un fichier CSV.
          </AlertDescription>
        </Alert>
        
        <Tabs 
          defaultValue="hospitalisation"
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="hospitalisation">Hospitalisations</TabsTrigger>
            <TabsTrigger value="mortality" disabled>Taux de mortalité (Bientôt disponible)</TabsTrigger>
            <TabsTrigger value="variants" disabled>Variants (Bientôt disponible)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hospitalisation" className="mt-4">
            <Tabs defaultValue="form" value={inputMethod} onValueChange={setInputMethod}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="form" className="flex-1">Saisie manuelle</TabsTrigger>
                <TabsTrigger value="csv" className="flex-1">Import CSV</TabsTrigger>
              </TabsList>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <TabsContent value="form" className="mt-0">
                    <HospitalizationForm 
                      onPredictionResult={handlePredictionResult}
                      onPredictionError={handlePredictionError}
                      onPredictionStart={handlePredictionStart}
                      onPredictionEnd={handlePredictionEnd}
                    />
                  </TabsContent>

                  <TabsContent value="csv" className="mt-0">
                    <CSVUploadForm 
                      onPredictionResult={handlePredictionResult}
                      onPredictionError={handlePredictionError}
                      onPredictionStart={handlePredictionStart}
                      onPredictionEnd={handlePredictionEnd}
                    />
                  </TabsContent>
                </div>
                
                <div className="flex flex-col gap-6">
                  {(predictionResult || isLoading || error) ? (
                    <>
                      <PredictionResultCard 
                        pays={predictionResult?.pays || ''}
                        valeurPrediction={predictionResult?.nombre_hospitalisations || 0}
                        typePrediction="hospitalisation"
                        isLoading={isLoading}
                        error={error || undefined}
                      />
                      
                      {predictionResult && !isLoading && !error && (
                        <PredictionChart 
                          title="Évolution des hospitalisations"
                          description={`Tendance des hospitalisations pour ${predictionResult.pays}`}
                          data={[{ name: "Prédiction", value: predictionResult.nombre_hospitalisations || 0 }]}
                          isLoading={isLoading}
                          error={error || undefined}
                        />
                      )}
                    </>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>À propos du modèle de prédiction</CardTitle>
                        <CardDescription>
                          Comprendre comment fonctionne notre modèle de prédiction des hospitalisations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>
                          Notre modèle d'intelligence artificielle a été entraîné sur des données historiques
                          de plusieurs pays pour prédire le nombre d'hospitalisations en fonction de
                          différents facteurs.
                        </p>
                        
                        <h3 className="font-semibold text-lg mt-2">Facteurs pris en compte :</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Nombre de nouveaux cas</li>
                          <li>Nombre de décès</li>
                          <li>Nombre de guérisons</li>
                          <li>Population totale</li>
                        </ul>
                        
                        <h3 className="font-semibold text-lg mt-2">Précision du modèle :</h3>
                        <p>
                          Le modèle a une précision moyenne de 80% basée sur les données de validation.
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
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
