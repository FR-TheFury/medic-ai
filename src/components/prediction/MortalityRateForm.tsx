
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AlertTriangle, Loader } from 'lucide-react';

interface MortalityRateFormProps {
  onPredictionResult?: (result: any) => void;
}

// Pays disponibles pour les prédictions de taux de mortalité (basé sur les modèles)
const availableCountries = [
  { code: 'allemagne', name: 'Allemagne', model: 'cat' },
  { code: 'bresil', name: 'Brésil', model: 'cat' },
  { code: 'colombie', name: 'Colombie', model: 'cat' },
  { code: 'etats-unis', name: 'États-Unis', model: 'xgb' },
  { code: 'france', name: 'France', model: 'xgb' },
  { code: 'indonesie', name: 'Indonésie', model: 'cat' },
  { code: 'italie', name: 'Italie', model: 'xgb' },
  { code: 'japon', name: 'Japon', model: 'cat' },
  { code: 'maroc', name: 'Maroc', model: 'cat' },
  { code: 'philippines', name: 'Philippines', model: 'cat' },
  { code: 'russie', name: 'Russie', model: 'cat' },
  { code: 'suisse', name: 'Suisse', model: 'cat' },
];

interface MortalityFormData {
  country: string;
  totalCases: number;
  currentDeaths: number;
  hospitalizations: number;
  intensiveCare: number;
  averageAge: number;
  healthcareCapacity: number;
  daysToPredict: number;
}

export default function MortalityRateForm({ onPredictionResult }: MortalityRateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MortalityFormData>({
    country: '',
    totalCases: 0,
    currentDeaths: 0,
    hospitalizations: 0,
    intensiveCare: 0,
    averageAge: 45,
    healthcareCapacity: 100,
    daysToPredict: 7
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country) {
      toast.error("Veuillez sélectionner un pays");
      return;
    }

    if (formData.totalCases === 0) {
      toast.error("Le nombre total de cas doit être supérieur à 0");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simuler un appel API pour l'instant
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedCountry = availableCountries.find(c => c.code === formData.country);
      const currentRate = (formData.currentDeaths / formData.totalCases) * 100;
      const mockResult = {
        country: selectedCountry?.name,
        model: selectedCountry?.model,
        currentMortalityRate: currentRate.toFixed(2),
        predictedMortalityRate: (currentRate * (0.9 + Math.random() * 0.2)).toFixed(2),
        predictedDeaths: Math.floor(formData.currentDeaths * (1 + Math.random() * 0.1)),
        confidence: Math.floor(Math.random() * 25 + 75),
        daysToPredict: formData.daysToPredict
      };
      
      onPredictionResult?.(mockResult);
      toast.success("Prédiction calculée avec succès");
      
    } catch (error) {
      toast.error("Erreur lors du calcul de la prédiction");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof MortalityFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Prédiction du taux de mortalité
        </CardTitle>
        <CardDescription>
          Prédisez l'évolution du taux de mortalité basé sur les données actuelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays *</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => updateFormData('country', value)}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.model.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCases">Cas totaux *</Label>
              <Input
                id="totalCases"
                type="number"
                min="1"
                value={formData.totalCases}
                onChange={(e) => updateFormData('totalCases', parseInt(e.target.value) || 0)}
                placeholder="Nombre total de cas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentDeaths">Décès actuels *</Label>
              <Input
                id="currentDeaths"
                type="number"
                min="0"
                value={formData.currentDeaths}
                onChange={(e) => updateFormData('currentDeaths', parseInt(e.target.value) || 0)}
                placeholder="Nombre de décès"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalizations">Hospitalisations</Label>
              <Input
                id="hospitalizations"
                type="number"
                min="0"
                value={formData.hospitalizations}
                onChange={(e) => updateFormData('hospitalizations', parseInt(e.target.value) || 0)}
                placeholder="Patients hospitalisés"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensiveCare">Soins intensifs</Label>
              <Input
                id="intensiveCare"
                type="number"
                min="0"
                value={formData.intensiveCare}
                onChange={(e) => updateFormData('intensiveCare', parseInt(e.target.value) || 0)}
                placeholder="Patients en soins intensifs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageAge">Âge moyen de la population</Label>
              <Input
                id="averageAge"
                type="number"
                min="0"
                max="100"
                value={formData.averageAge}
                onChange={(e) => updateFormData('averageAge', parseFloat(e.target.value) || 45)}
                placeholder="Âge moyen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthcareCapacity">Capacité du système de santé (%)</Label>
              <Input
                id="healthcareCapacity"
                type="number"
                min="0"
                max="200"
                value={formData.healthcareCapacity}
                onChange={(e) => updateFormData('healthcareCapacity', parseInt(e.target.value) || 100)}
                placeholder="100 = capacité normale"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysToPredict">Nombre de jours à prédire</Label>
            <Select
              value={formData.daysToPredict.toString()}
              onValueChange={(value) => updateFormData('daysToPredict', parseInt(value))}
            >
              <SelectTrigger id="daysToPredict">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="14">14 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.totalCases > 0 && formData.currentDeaths > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Taux de mortalité actuel: {((formData.currentDeaths / formData.totalCases) * 100).toFixed(2)}%
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.country || formData.totalCases === 0}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              "Calculer la prédiction"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
