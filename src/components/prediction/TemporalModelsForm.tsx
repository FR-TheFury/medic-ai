
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Brain, Loader, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TemporalModelsFormProps {
  onPredictionResult?: (result: any) => void;
}

// Modèles temporels disponibles (basé sur les fichiers dans le dossier temporel)
const availableModels = [
  { 
    id: 'suisse_gru', 
    name: 'Suisse - GRU Neural Network', 
    type: 'GRU',
    description: 'Modèle GRU entraîné sur les données temporelles de la Suisse',
    file: 'suisse_GRU_20250522_190941.pth'
  }
];

interface TemporalFormData {
  model: string;
  inputSequence: string;
  predictionHorizon: number;
  useSeasonality: boolean;
  confidenceLevel: number;
}

export default function TemporalModelsForm({ onPredictionResult }: TemporalModelsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TemporalFormData>({
    model: '',
    inputSequence: '',
    predictionHorizon: 7,
    useSeasonality: true,
    confidenceLevel: 95
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.model) {
      toast.error("Veuillez sélectionner un modèle");
      return;
    }

    if (!formData.inputSequence.trim()) {
      toast.error("Veuillez fournir une séquence de données d'entrée");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simuler un appel API pour l'instant
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const selectedModel = availableModels.find(m => m.id === formData.model);
      
      // Parser la séquence d'entrée
      const inputValues = formData.inputSequence
        .split(',')
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v));

      if (inputValues.length === 0) {
        throw new Error("Aucune valeur numérique valide trouvée");
      }

      // Générer des prédictions simulées
      const predictions = [];
      let lastValue = inputValues[inputValues.length - 1];
      
      for (let i = 0; i < formData.predictionHorizon; i++) {
        // Simulation d'une tendance avec variation aléatoire
        const trend = Math.random() * 0.1 - 0.05; // -5% à +5%
        const seasonal = formData.useSeasonality ? Math.sin((i / 7) * Math.PI) * 0.02 : 0;
        lastValue = Math.max(0, lastValue * (1 + trend + seasonal));
        predictions.push(Math.round(lastValue));
      }
      
      const mockResult = {
        model: selectedModel?.name,
        type: selectedModel?.type,
        inputLength: inputValues.length,
        predictions: predictions,
        confidence: formData.confidenceLevel,
        predictionHorizon: formData.predictionHorizon,
        useSeasonality: formData.useSeasonality,
        mse: Math.random() * 100,
        mae: Math.random() * 50
      };
      
      onPredictionResult?.(mockResult);
      toast.success("Prédiction temporelle calculée avec succès");
      
    } catch (error) {
      toast.error(`Erreur lors du calcul: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof TemporalFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Extraire les nombres du fichier CSV
        const numbers = content.match(/\d+(\.\d+)?/g);
        if (numbers) {
          updateFormData('inputSequence', numbers.slice(0, 50).join(', ')); // Limiter à 50 valeurs
          toast.success("Données chargées depuis le fichier");
        } else {
          toast.error("Aucune donnée numérique trouvée dans le fichier");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Modèles Temporels (GRU/LSTM)
        </CardTitle>
        <CardDescription>
          Utilisez des réseaux de neurones récurrents pour prédire l'évolution temporelle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Brain className="h-4 w-4" />
          <AlertDescription>
            Les modèles temporels analysent les séquences de données historiques pour prédire les tendances futures.
            Fournissez une séquence d'au moins 7 valeurs pour obtenir des prédictions fiables.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Modèle temporal *</Label>
            <Select
              value={formData.model}
              onValueChange={(value) => updateFormData('model', value)}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Sélectionner un modèle" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.model && (
              <p className="text-sm text-muted-foreground">
                {availableModels.find(m => m.id === formData.model)?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inputSequence">Séquence de données d'entrée *</Label>
            <Textarea
              id="inputSequence"
              placeholder="Entrez une séquence de valeurs séparées par des virgules (ex: 100, 120, 110, 130, 125, 140, 135...)"
              value={formData.inputSequence}
              onChange={(e) => updateFormData('inputSequence', e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Charger depuis un fichier
              </Button>
              <span className="text-sm text-muted-foreground">
                {formData.inputSequence ? 
                  `${formData.inputSequence.split(',').length} valeurs` : 
                  'Aucune donnée'
                }
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="predictionHorizon">Horizon de prédiction (jours)</Label>
              <Select
                value={formData.predictionHorizon.toString()}
                onValueChange={(value) => updateFormData('predictionHorizon', parseInt(value))}
              >
                <SelectTrigger id="predictionHorizon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidenceLevel">Niveau de confiance (%)</Label>
              <Select
                value={formData.confidenceLevel.toString()}
                onValueChange={(value) => updateFormData('confidenceLevel', parseInt(value))}
              >
                <SelectTrigger id="confidenceLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useSeasonality"
              checked={formData.useSeasonality}
              onChange={(e) => updateFormData('useSeasonality', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="useSeasonality">Prendre en compte la saisonnalité</Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.model || !formData.inputSequence.trim()}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              "Exécuter la prédiction temporelle"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
