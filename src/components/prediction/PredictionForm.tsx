
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, LineChart, Loader } from "lucide-react";
import { predictions } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function PredictionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ taux_mortalite: number; pays: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nbNouveauCas: 0,
    nbDeces: 0,
    densitePopulation: 0,
    PIB: 0,
    populationTotale: 0,
    nbVaccineTotalement: 0,
    nbHospiSoinsIntensif: 0,
    pays: "france", // Default value
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pays' ? value : Number(value),
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      pays: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await predictions.predictMortality(formData);
      setResult(response.data);
      toast({
        title: "Prédiction réussie",
        description: `Le taux de mortalité prédit pour ${response.data.pays} est de ${response.data.taux_mortalite}%`,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de la prédiction");
      toast({
        variant: "destructive",
        title: "Erreur de prédiction",
        description: "Impossible d'effectuer la prédiction. Vérifiez vos données.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Prédiction du taux de mortalité</CardTitle>
          <CardDescription>
            Entrez les données pour prédire le taux de mortalité d'une maladie pour un pays spécifique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pays">Pays</Label>
              <Select 
                value={formData.pays} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="france">France</SelectItem>
                  <SelectItem value="italie">Italie</SelectItem>
                  <SelectItem value="espagne">Espagne</SelectItem>
                  <SelectItem value="allemagne">Allemagne</SelectItem>
                  <SelectItem value="royaume-uni">Royaume-Uni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nbNouveauCas">Nouveaux cas</Label>
              <Input
                id="nbNouveauCas"
                name="nbNouveauCas"
                type="number"
                value={formData.nbNouveauCas}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nbDeces">Nombre de décès</Label>
              <Input
                id="nbDeces"
                name="nbDeces"
                type="number"
                value={formData.nbDeces}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="densitePopulation">Densité de population</Label>
              <Input
                id="densitePopulation"
                name="densitePopulation"
                type="number"
                value={formData.densitePopulation}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="PIB">PIB</Label>
              <Input
                id="PIB"
                name="PIB"
                type="number"
                value={formData.PIB}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="populationTotale">Population totale</Label>
              <Input
                id="populationTotale"
                name="populationTotale"
                type="number"
                value={formData.populationTotale}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nbVaccineTotalement">Vaccinés complètement</Label>
              <Input
                id="nbVaccineTotalement"
                name="nbVaccineTotalement"
                type="number"
                value={formData.nbVaccineTotalement}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nbHospiSoinsIntensif">Hospitalisations en soins intensifs</Label>
              <Input
                id="nbHospiSoinsIntensif"
                name="nbHospiSoinsIntensif"
                type="number"
                value={formData.nbHospiSoinsIntensif}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
          
          {result && (
            <Alert className="mt-4">
              <LineChart className="h-4 w-4" />
              <AlertTitle>Résultat de la prédiction</AlertTitle>
              <AlertDescription>
                Le taux de mortalité prédit pour {result.pays} est de{" "}
                <span className="font-bold">{result.taux_mortalite}%</span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Prédiction en cours...
              </>
            ) : (
              "Prédire le taux de mortalité"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
