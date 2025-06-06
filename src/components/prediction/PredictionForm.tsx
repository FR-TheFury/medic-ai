
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { predictions } from '@/lib/api';

interface PredictionFormProps {
  onPredictionResult: (result: { pays: string; taux_mortalite: number }) => void;
  onPredictionError: (error: string) => void;
  onPredictionStart: () => void;
  onPredictionEnd: () => void;
}

const paysDisponibles = [
  { id: 'france', name: 'France' },
  { id: 'etats-unis', name: 'États-Unis' },
  { id: 'allemagne', name: 'Allemagne' },
  { id: 'italie', name: 'Italie' },
  { id: 'japon', name: 'Japon' },
  { id: 'bresil', name: 'Brésil' },
  { id: 'russie', name: 'Russie' },
  { id: 'philippines', name: 'Philippines' },
  { id: 'maroc', name: 'Maroc' },
  { id: 'suisse', name: 'Suisse' },
  { id: 'colombie', name: 'Colombie' },
  { id: 'indonesie', name: 'Indonésie' }
];

export default function PredictionForm({ 
  onPredictionResult, 
  onPredictionError,
  onPredictionStart,
  onPredictionEnd
}: PredictionFormProps) {
  const [formData, setFormData] = useState({
    pays: '',
    nbNouveauCas: 1000,
    nbDeces: 50,
    densitePopulation: 105.8,
    PIB: 38476,
    populationTotale: 67000000,
    nbVaccineTotalement: 45000000,
    nbHospiSoinsIntensif: 800
  });
  
  const [isPredicting, setIsPredicting] = useState(false);
  
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.pays) {
      toast.error("Veuillez sélectionner un pays.");
      return;
    }
    
    if (formData.nbDeces > formData.nbNouveauCas) {
      toast.error("Le nombre de décès ne peut pas être supérieur au nombre de nouveaux cas.");
      return;
    }
    
    setIsPredicting(true);
    onPredictionStart();
    
    // Format du pays pour l'API (id du pays)
    const selectedPays = paysDisponibles.find(p => p.id === formData.pays)?.name || formData.pays;
    
    try {
      const response = await predictions.predictMortality(formData);
      
      // Délai artificiel pour montrer le chargement (à supprimer en production)
      setTimeout(() => {
        onPredictionResult({
          pays: selectedPays,
          taux_mortalite: response.data.taux_mortalite
        });
        setIsPredicting(false);
        onPredictionEnd();
      }, 1000);
      
    } catch (error: any) {
      console.error('Erreur de prédiction:', error);
      const errorMessage = error.response?.data?.detail || 
                          "Impossible d'effectuer la prédiction. Vérifiez que le serveur API est actif.";
      onPredictionError(errorMessage);
      setIsPredicting(false);
      onPredictionEnd();
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Saisie des données</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <Select 
              value={formData.pays} 
              onValueChange={(value) => handleChange('pays', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {paysDisponibles.map((pays) => (
                  <SelectItem key={pays.id} value={pays.id}>{pays.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveaux cas
                <span className="text-xs text-muted-foreground ml-1">(par jour)</span>
              </label>
              <Input 
                type="number" 
                value={formData.nbNouveauCas} 
                onChange={(e) => handleChange('nbNouveauCas', parseInt(e.target.value) || 0)} 
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Décès
                <span className="text-xs text-muted-foreground ml-1">(par jour)</span>
              </label>
              <Input 
                type="number" 
                value={formData.nbDeces} 
                onChange={(e) => handleChange('nbDeces', parseInt(e.target.value) || 0)} 
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Densité de population
                <span className="text-xs text-muted-foreground ml-1">(hab/km²)</span>
              </label>
              <Input 
                type="number" 
                value={formData.densitePopulation} 
                onChange={(e) => handleChange('densitePopulation', parseFloat(e.target.value) || 0)} 
                step="0.1"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIB par habitant
                <span className="text-xs text-muted-foreground ml-1">(USD)</span>
              </label>
              <Input 
                type="number" 
                value={formData.PIB} 
                onChange={(e) => handleChange('PIB', parseInt(e.target.value) || 0)} 
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Population totale
              </label>
              <Input 
                type="number" 
                value={formData.populationTotale} 
                onChange={(e) => handleChange('populationTotale', parseInt(e.target.value) || 0)} 
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Population vaccinée
              </label>
              <Input 
                type="number" 
                value={formData.nbVaccineTotalement} 
                onChange={(e) => handleChange('nbVaccineTotalement', parseInt(e.target.value) || 0)} 
                min="0"
                max={formData.populationTotale}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patients en soins intensifs
            </label>
            <Input 
              type="number" 
              value={formData.nbHospiSoinsIntensif} 
              onChange={(e) => handleChange('nbHospiSoinsIntensif', parseInt(e.target.value) || 0)} 
              min="0"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isPredicting || !formData.pays}
          className="w-full"
        >
          {isPredicting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Prédiction en cours...
            </>
          ) : (
            "Lancer la prédiction"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
