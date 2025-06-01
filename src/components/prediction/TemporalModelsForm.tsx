
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Brain, Loader, Upload, Download, Edit } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { predictions } from '@/lib/api';
import ManualTemporalInput from './ManualTemporalInput';

interface TemporalModelsFormProps {
  onPredictionResult?: (result: any) => void;
}

interface TemporalModel {
  country: string;
  model_type: string;
  file: string;
}

interface TemporalFormData {
  country: string;
  model_type: string;
  historical_data: {
    nbNouveauCas: number[];
    nbDeces: number[];
    nbHospitalisation: number[];
    nbHospiSoinsIntensif: number[];
    nbTeste: number[];
    dates: string[];
  };
  prediction_horizon: number;
}

export default function TemporalModelsForm({ onPredictionResult }: TemporalModelsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<TemporalModel[]>([]);
  const [inputMethod, setInputMethod] = useState<'manual' | 'csv'>('manual');
  const [formData, setFormData] = useState<TemporalFormData>({
    country: '',
    model_type: 'GRU',
    historical_data: {
      nbNouveauCas: [],
      nbDeces: [],
      nbHospitalisation: [],
      nbHospiSoinsIntensif: [],
      nbTeste: [],
      dates: []
    },
    prediction_horizon: 7
  });

  // Charger les modèles disponibles
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await predictions.getTemporalModels();
        setAvailableModels(response.data.models || []);
      } catch (error) {
        console.error('Erreur lors du chargement des modèles:', error);
        // Fallback avec les modèles statiques
        setAvailableModels([
          { country: 'suisse', model_type: 'GRU', file: 'simulation' },
          { country: 'france', model_type: 'GRU', file: 'simulation' },
          { country: 'allemagne', model_type: 'LSTM', file: 'simulation' }
        ]);
      }
    };

    loadModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country) {
      toast.error("Veuillez sélectionner un pays");
      return;
    }

    // Vérifier que nous avons 30 valeurs pour chaque série
    const requiredLength = 30;
    const series = ['nbNouveauCas', 'nbDeces', 'nbHospitalisation', 'nbHospiSoinsIntensif', 'nbTeste', 'dates'];
    
    for (const seriesName of series) {
      const data = formData.historical_data[seriesName as keyof typeof formData.historical_data];
      if (data.length !== requiredLength) {
        toast.error(`La série ${seriesName} doit contenir exactement ${requiredLength} valeurs`);
        return;
      }
    }

    // Vérifier que les données ne sont pas toutes à zéro
    const totalCases = formData.historical_data.nbNouveauCas.reduce((sum, val) => sum + val, 0);
    if (totalCases === 0) {
      toast.error("Les données de nouveaux cas ne peuvent pas être toutes nulles");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Envoi de la prédiction temporelle:', {
        country: formData.country,
        model_type: formData.model_type,
        prediction_horizon: formData.prediction_horizon,
        sample_data: {
          nbNouveauCas: formData.historical_data.nbNouveauCas.slice(0, 5),
          total_cases: totalCases
        }
      });
      
      const response = await predictions.predictTemporal(formData);
      
      console.log('Réponse API:', response.data);
      
      const result = {
        model: `${formData.country} - ${formData.model_type}`,
        type: formData.model_type,
        country: formData.country,
        predictions: response.data.predictions,
        prediction_dates: response.data.prediction_dates,
        predictionHorizon: formData.prediction_horizon,
        confidence_interval: response.data.confidence_interval,
        metrics: response.data.metrics,
        // Ajouter des métadonnées pour le debug
        inputSummary: {
          totalCases: totalCases,
          avgCases: Math.round(totalCases / 30),
          lastWeekAvg: Math.round(formData.historical_data.nbNouveauCas.slice(-7).reduce((sum, val) => sum + val, 0) / 7)
        }
      };
      
      console.log('Résultat final:', result);
      
      onPredictionResult?.(result);
      toast.success(`Prédiction temporelle calculée: ${response.data.predictions.join(', ')} nouveaux cas`);
      
    } catch (error: any) {
      console.error('Erreur lors de la prédiction temporelle:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la prédiction temporelle';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.trim().split('\n');
        
        if (lines.length < 31) { // Header + 30 data lines
          toast.error("Le fichier CSV doit contenir au moins 30 lignes de données");
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredColumns = ['dateReleve', 'nbNouveauCas', 'nbDeces', 'nbHospitalisation', 'nbHospiSoinsIntensif', 'nbTeste'];
        
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
          toast.error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
          return;
        }

        const data = {
          nbNouveauCas: [] as number[],
          nbDeces: [] as number[],
          nbHospitalisation: [] as number[],
          nbHospiSoinsIntensif: [] as number[],
          nbTeste: [] as number[],
          dates: [] as string[]
        };

        // Prendre les 30 dernières lignes
        const dataLines = lines.slice(-30);
        
        dataLines.forEach(line => {
          const values = line.split(',');
          const row: { [key: string]: string } = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });

          data.dates.push(row.dateReleve);
          data.nbNouveauCas.push(parseInt(row.nbNouveauCas) || 0);
          data.nbDeces.push(parseInt(row.nbDeces) || 0);
          data.nbHospitalisation.push(parseInt(row.nbHospitalisation) || 0);
          data.nbHospiSoinsIntensif.push(parseInt(row.nbHospiSoinsIntensif) || 0);
          data.nbTeste.push(parseInt(row.nbTeste) || 0);
        });

        setFormData(prev => ({
          ...prev,
          historical_data: data
        }));

        toast.success(`Données chargées: ${data.dates.length} jours`);
        
      } catch (error) {
        console.error('Erreur lors du parsing CSV:', error);
        toast.error("Erreur lors de l'analyse du fichier CSV");
      }
    };

    reader.readAsText(file);
  };

  const generateSampleData = () => {
    const data = {
      nbNouveauCas: [] as number[],
      nbDeces: [] as number[],
      nbHospitalisation: [] as number[],
      nbHospiSoinsIntensif: [] as number[],
      nbTeste: [] as number[],
      dates: [] as string[]
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      data.dates.push(currentDate.toISOString().split('T')[0]);
      data.nbNouveauCas.push(Math.floor(Math.random() * 200) + 50);
      data.nbDeces.push(Math.floor(Math.random() * 10) + 1);
      data.nbHospitalisation.push(Math.floor(Math.random() * 150) + 30);
      data.nbHospiSoinsIntensif.push(Math.floor(Math.random() * 30) + 5);
      data.nbTeste.push(Math.floor(Math.random() * 2000) + 500);
    }

    setFormData(prev => ({
      ...prev,
      historical_data: data
    }));

    toast.success("Données d'exemple générées");
  };

  const handleManualDataChange = (data: typeof formData.historical_data) => {
    setFormData(prev => ({
      ...prev,
      historical_data: data
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Modèles Temporels (GRU/LSTM)
          </CardTitle>
          <CardDescription>
            Prédiction de 7 jours de nouveaux cas avec 30 jours de données historiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Les modèles temporels nécessitent exactement 30 jours de données historiques pour 6 variables.
              Vous pouvez saisir les données manuellement, les charger depuis un fichier CSV, ou générer des données d'exemple.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(availableModels.map(m => m.country))].map((country) => (
                      <SelectItem key={country} value={country}>
                        {country.charAt(0).toUpperCase() + country.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_type">Type de modèle</Label>
                <Select
                  value={formData.model_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, model_type: value }))}
                >
                  <SelectTrigger id="model_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRU">GRU</SelectItem>
                    <SelectItem value="LSTM">LSTM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Méthode de saisie des données</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inputMethod === 'manual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMethod('manual')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Saisie manuelle
                </Button>
                <Button
                  type="button"
                  variant={inputMethod === 'csv' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMethod('csv')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fichier CSV
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSampleData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Données d'exemple
                </Button>
              </div>
            </div>

            {inputMethod === 'csv' && (
              <div className="space-y-2">
                <Label htmlFor="csvFile">Fichier CSV</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                />
                <p className="text-sm text-muted-foreground">
                  Le fichier doit contenir les colonnes: dateReleve, nbNouveauCas, nbDeces, nbHospitalisation, nbHospiSoinsIntensif, nbTeste
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Résumé des données</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>Dates: {formData.historical_data.dates.length}</div>
                <div>Nouveaux cas: {formData.historical_data.nbNouveauCas.length}</div>
                <div>Décès: {formData.historical_data.nbDeces.length}</div>
                <div>Hospitalisations: {formData.historical_data.nbHospitalisation.length}</div>
                <div>Soins intensifs: {formData.historical_data.nbHospiSoinsIntensif.length}</div>
                <div>Tests: {formData.historical_data.nbTeste.length}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="predictionHorizon">Horizon de prédiction</Label>
              <Select
                value={formData.prediction_horizon.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, prediction_horizon: parseInt(value) }))}
              >
                <SelectTrigger id="predictionHorizon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.country || formData.historical_data.dates.length !== 30}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Prédiction en cours...
                </>
              ) : (
                "Exécuter la prédiction temporelle"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {inputMethod === 'manual' && (
        <ManualTemporalInput
          data={formData.historical_data}
          onChange={handleManualDataChange}
        />
      )}
    </div>
  );
}
