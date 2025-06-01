
import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, Brain, Activity, Building2 } from 'lucide-react';
import NewCasesForm from '@/components/prediction/NewCasesForm';
import MortalityRateForm from '@/components/prediction/MortalityRateForm';
import TemporalModelsForm from '@/components/prediction/TemporalModelsForm';
import HospitalizationForm from '@/components/prediction/HospitalizationForm';
import PredictionResultCard from '@/components/prediction/PredictionResultCard';
import PredictionChart from '@/components/prediction/PredictionChart';

export default function Prediction() {
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('new-cases');

  const handlePredictionResult = (result: any) => {
    console.log('Résultat de prédiction reçu:', result);
    setPredictionResult(result);
  };

  const clearResults = () => {
    setPredictionResult(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Prédictions</h1>
            <p className="text-muted-foreground mt-1">
              Modèles d'intelligence artificielle pour anticiper l'évolution épidémiologique
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="new-cases" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Nouveaux cas</span>
                </TabsTrigger>
                <TabsTrigger value="mortality" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Mortalité</span>
                </TabsTrigger>
                <TabsTrigger value="hospitalization" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Hospitalisation</span>
                </TabsTrigger>
                <TabsTrigger value="temporal" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Temporel</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new-cases" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Prédiction de nouveaux cas</h2>
                    <p className="text-sm text-muted-foreground">
                      12 modèles disponibles pour différents pays
                    </p>
                  </div>
                  <Badge variant="secondary">Classique</Badge>
                </div>
                <NewCasesForm onPredictionResult={handlePredictionResult} />
              </TabsContent>

              <TabsContent value="mortality" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Prédiction du taux de mortalité</h2>
                    <p className="text-sm text-muted-foreground">
                      12 modèles disponibles pour différents pays
                    </p>
                  </div>
                  <Badge variant="secondary">Classique</Badge>
                </div>
                <MortalityRateForm onPredictionResult={handlePredictionResult} />
              </TabsContent>

              <TabsContent value="hospitalization" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Prédiction d'hospitalisation</h2>
                    <p className="text-sm text-muted-foreground">
                      7 modèles disponibles pour différents pays
                    </p>
                  </div>
                  <Badge variant="secondary">Classique</Badge>
                </div>
                <HospitalizationForm 
                  onPredictionResult={handlePredictionResult}
                  onPredictionError={(error) => console.error(error)}
                  onPredictionStart={() => {}}
                  onPredictionEnd={() => {}}
                />
              </TabsContent>

              <TabsContent value="temporal" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Modèles temporels</h2>
                    <p className="text-sm text-muted-foreground">
                      Réseaux de neurones récurrents (GRU/LSTM)
                    </p>
                  </div>
                  <Badge variant="default">Temporel</Badge>
                </div>
                <TemporalModelsForm onPredictionResult={handlePredictionResult} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {/* Informations sur les modèles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Modèles disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nouveaux cas</span>
                  <Badge variant="outline">12 pays</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taux de mortalité</span>
                  <Badge variant="outline">12 pays</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hospitalisations</span>
                  <Badge variant="outline">7 pays</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Modèles temporels</span>
                  <Badge variant="outline">1 GRU</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Résultats de prédiction */}
            {predictionResult && (
              <>
                {activeTab === 'temporal' && predictionResult.predictions ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Prédiction Temporelle
                      </CardTitle>
                      <CardDescription>
                        {predictionResult.country} - {predictionResult.type} - {predictionResult.predictionHorizon} jours
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Modèle:</span> {predictionResult.model}
                        </div>
                        <div>
                          <span className="font-medium">Horizon:</span> {predictionResult.predictionHorizon} jours
                        </div>
                        {predictionResult.inputSummary && (
                          <>
                            <div>
                              <span className="font-medium">Moyenne historique:</span> {predictionResult.inputSummary.avgCases} cas/jour
                            </div>
                            <div>
                              <span className="font-medium">Dernière semaine:</span> {predictionResult.inputSummary.lastWeekAvg} cas/jour
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Prédictions par jour:</h4>
                        <div className="space-y-1 text-sm">
                          {predictionResult.predictions.map((pred: number, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>Jour {index + 1} ({predictionResult.prediction_dates[index]}):</span>
                              <Badge variant="outline">{pred} nouveaux cas</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total prédit:</span>
                          <Badge variant="default">
                            {predictionResult.predictions.reduce((sum: number, val: number) => sum + val, 0)} cas
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <PredictionResultCard 
                    pays={predictionResult.country || predictionResult.pays}
                    valeurPrediction={predictionResult.predictedCases || predictionResult.predictedRate || predictionResult.nombre_hospitalisations || 0}
                    typePrediction={activeTab === 'mortality' ? 'mortalite' : 'hospitalisation'}
                  />
                )}
                
                {(activeTab !== 'temporal' || !predictionResult.predictions) && (
                  <PredictionChart 
                    title="Graphique des prédictions"
                    description="Évolution prédite basée sur les données actuelles"
                    data={[{
                      name: predictionResult.country || predictionResult.pays || 'Inconnu',
                      value: predictionResult.predictedCases || predictionResult.predictedRate || predictionResult.nombre_hospitalisations || 0
                    }]}
                  />
                )}
              </>
            )}

            {/* Aide contextuelle */}
            <Card>
              <CardHeader>
                <CardTitle>Aide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Modèles classiques :</strong> Utilisent des algorithmes de machine learning 
                  traditionnels (XGBoost, LightGBM, CatBoost, Random Forest).
                </p>
                <p>
                  <strong>Modèles temporels :</strong> Analysent les séquences temporelles 
                  avec des réseaux de neurones récurrents (GRU/LSTM).
                </p>
                <p>
                  <strong>Confiance :</strong> Indique la fiabilité de la prédiction 
                  basée sur la validation croisée.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
