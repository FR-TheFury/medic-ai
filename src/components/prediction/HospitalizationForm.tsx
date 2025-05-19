
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { predictions } from '@/lib/api';

interface HospitalizationFormProps {
  onPredictionResult: (result: { pays: string; nombre_hospitalisations: number }) => void;
  onPredictionError: (error: string) => void;
  onPredictionStart: () => void;
  onPredictionEnd: () => void;
}

// Liste des pays mise à jour selon les modèles disponibles dans le dossier nbHospitalisation
const paysDisponibles = [
  { id: 'france', name: 'France' },
  { id: 'italie', name: 'Italie' },
  { id: 'japon', name: 'Japon' },
  { id: 'bresil', name: 'Brésil' },
  { id: 'colombie', name: 'Colombie' },
  { id: 'philippines', name: 'Philippines' },
  { id: 'suisse', name: 'Suisse' }
];

export default function HospitalizationForm({ 
  onPredictionResult, 
  onPredictionError,
  onPredictionStart,
  onPredictionEnd
}: HospitalizationFormProps) {
  const [formData, setFormData] = useState({
    pays: '',
    nbNouveauCas: 1000,
    nbDeces: 50,
    nbGueri: 800,
    populationTotale: 67000000
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

    if (formData.nbGueri > formData.nbNouveauCas) {
      toast.error("Le nombre de guérisons ne peut pas être supérieur au nombre de nouveaux cas.");
      return;
    }
    
    setIsPredicting(true);
    onPredictionStart();
    
    // Format du pays pour l'API (id du pays)
    const selectedPays = paysDisponibles.find(p => p.id === formData.pays)?.name || formData.pays;
    
    try {
      const response = await predictions.predictHospitalization(formData);
      
      // Délai artificiel pour montrer le chargement (à supprimer en production)
      setTimeout(() => {
        onPredictionResult({
          pays: selectedPays,
          nombre_hospitalisations: response.data.nombre_hospitalisations
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
                Guérisons
                <span className="text-xs text-muted-foreground ml-1">(par jour)</span>
              </label>
              <Input 
                type="number" 
                value={formData.nbGueri} 
                onChange={(e) => handleChange('nbGueri', parseInt(e.target.value) || 0)} 
                min="0"
              />
            </div>
            
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
