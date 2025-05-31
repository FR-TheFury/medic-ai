
import MainLayout from '@/components/layouts/MainLayout';
import PredictionResultCard from '@/components/prediction/PredictionResultCard';
import PredictionChart from '@/components/prediction/PredictionChart';
import HospitalizationForm from '@/components/prediction/HospitalizationForm';
import CSVUploadForm from '@/components/prediction/CSVUploadForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Info, Brain, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';

interface PredictionResult {
  pays: string;
  nombre_hospitalisations?: number;
  taux_mortalite?: number;
  nombre_nouveaux_cas?: number;
}

export default function Prediction() {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("hospitalisation");
  const [inputMethod, setInputMethod] = useState("form");
  const [modelType, setModelType] = useState("classique");

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
            Cette page vous permet d'utiliser nos modèles d'IA pour prédire différentes métriques
            en fonction des données que vous saisissez. Choisissez entre les modèles classiques
            et temporels selon vos besoins.
          </AlertDescription>
        </Alert>

        {/* Sélection du type de modèle */}
        <Tabs 
          defaultValue="classique"
          value={modelType} 
          onValueChange={setModelType}
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger value="classique" className="flex-1">
              <Brain className="w-4 h-4 mr-2" />
              Modèles Classiques
            </TabsTrigger>
            <TabsTrigger value="temporel" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              Modèles Temporels
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="classique">
            <Tabs 
              defaultValue="hospitalisation"
              value={activeTab} 
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="hospitalisation">Hospitalisations</TabsTrigger>
                <TabsTrigger value="nouveaux_cas">Nouveaux cas</TabsTrigger>
                <TabsTrigger value="mortalite">Taux de mortalité</TabsTrigger>
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
                            <CardTitle>Prédiction des hospitalisations</CardTitle>
                            <CardDescription>
                              Modèle classique pour prédire le nombre d'hospitalisations
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>
                              Ce modèle utilise des algorithmes d'apprentissage automatique traditionnels
                              pour prédire le nombre d'hospitalisations basé sur les nouvelles infections,
                              décès, guérisons et la population totale.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </Tabs>
              </TabsContent>

              <TabsContent value="nouveaux_cas" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Prédiction des nouveaux cas</CardTitle>
                    <CardDescription>
                      Modèle pour prédire l'évolution des nouveaux cas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fonctionnalité en développement</AlertTitle>
                      <AlertDescription>
                        Le formulaire de prédiction des nouveaux cas sera bientôt disponible.
                        Les modèles sont prêts et disponibles dans l'API.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mortalite" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Prédiction du taux de mortalité</CardTitle>
                    <CardDescription>
                      Modèle pour prédire l'évolution du taux de mortalité
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fonctionnalité en développement</AlertTitle>
                      <AlertDescription>
                        Le formulaire de prédiction du taux de mortalité sera bientôt disponible.
                        Les modèles sont prêts et disponibles dans l'API.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="temporel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Modèles Temporels
                </CardTitle>
                <CardDescription>
                  Prédictions basées sur l'analyse de séries temporelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Les modèles temporels utilisent des réseaux de neurones récurrents (GRU/LSTM)
                  pour analyser les tendances temporelles et faire des prédictions sur l'évolution
                  future des pandémies.
                </p>
                
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Modèles temporels disponibles</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>Modèle GRU pour la Suisse (préparé et entraîné)</li>
                      <li>Analyse de séries temporelles avancée</li>
                      <li>Prédictions à court et moyen terme</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Interface en développement</AlertTitle>
                  <AlertDescription>
                    L'interface pour les modèles temporels sera bientôt disponible.
                    Ces modèles nécessitent des données séquentielles et un préprocessing spécifique.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
