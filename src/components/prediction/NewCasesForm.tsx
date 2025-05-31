
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { TrendingUp, Loader } from 'lucide-react';

interface NewCasesFormProps {
  onPredictionResult?: (result: any) => void;
}

// Pays disponibles pour les prédictions de nouveaux cas (basé sur les modèles)
const availableCountries = [
  { code: 'allemagne', name: 'Allemagne', model: 'ridge' },
  { code: 'bresil', name: 'Brésil', model: 'rf' },
  { code: 'colombie', name: 'Colombie', model: 'cat' },
  { code: 'etats-unis', name: 'États-Unis', model: 'lightgbm' },
  { code: 'france', name: 'France', model: 'cat' },
  { code: 'indonesie', name: 'Indonésie', model: 'lightgbm' },
  { code: 'italie', name: 'Italie', model: 'cat' },
  { code: 'japon', name: 'Japon', model: 'reg' },
  { code: 'maroc', name: 'Maroc', model: 'xgb' },
  { code: 'philippines', name: 'Philippines', model: 'cat' },
  { code: 'russie', name: 'Russie', model: 'cat' },
  { code: 'suisse', name: 'Suisse', model: 'rf' },
];

interface PredictionFormData {
  country: string;
  currentCases: number;
  population: number;
  vaccinationRate: number;
  mobilityIndex: number;
  weatherTemp: number;
  daysToPredict: number;
}

export default function NewCasesForm({ onPredictionResult }: NewCasesFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PredictionFormData>({
    country: '',
    currentCases: 0,
    population: 0,
    vaccinationRate: 0,
    mobilityIndex: 100,
    weatherTemp: 20,
    daysToPredict: 7
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country) {
      toast.error("Veuillez sélectionner un pays");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simuler un appel API pour l'instant
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedCountry = availableCountries.find(c => c.code === formData.country);
      const mockResult = {
        country: selectedCountry?.name,
        model: selectedCountry?.model,
        predictedCases: Math.floor(formData.currentCases * (1 + Math.random() * 0.3)),
        confidence: Math.floor(Math.random() * 30 + 70),
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

  const updateFormData = (field: keyof PredictionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Prédiction de nouveaux cas
        </CardTitle>
        <CardDescription>
          Prédisez l'évolution du nombre de nouveaux cas pour les 7 prochains jours
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
              <Label htmlFor="currentCases">Cas actuels *</Label>
              <Input
                id="currentCases"
                type="number"
                min="0"
                value={formData.currentCases}
                onChange={(e) => updateFormData('currentCases', parseInt(e.target.value) || 0)}
                placeholder="Nombre de cas actuels"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="population">Population</Label>
              <Input
                id="population"
                type="number"
                min="0"
                value={formData.population}
                onChange={(e) => updateFormData('population', parseInt(e.target.value) || 0)}
                placeholder="Population totale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccinationRate">Taux de vaccination (%)</Label>
              <Input
                id="vaccinationRate"
                type="number"
                min="0"
                max="100"
                value={formData.vaccinationRate}
                onChange={(e) => updateFormData('vaccinationRate', parseFloat(e.target.value) || 0)}
                placeholder="0-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobilityIndex">Indice de mobilité</Label>
              <Input
                id="mobilityIndex"
                type="number"
                min="0"
                max="200"
                value={formData.mobilityIndex}
                onChange={(e) => updateFormData('mobilityIndex', parseInt(e.target.value) || 100)}
                placeholder="100 = normal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weatherTemp">Température moyenne (°C)</Label>
              <Input
                id="weatherTemp"
                type="number"
                min="-50"
                max="50"
                value={formData.weatherTemp}
                onChange={(e) => updateFormData('weatherTemp', parseFloat(e.target.value) || 20)}
                placeholder="Température en °C"
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.country}
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
