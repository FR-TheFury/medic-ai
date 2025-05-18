
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Download, Loader, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { predictions } from '@/lib/api';

interface CSVUploadFormProps {
  onPredictionResult: (result: { pays: string; nombre_hospitalisations: number }) => void;
  onPredictionError: (error: string) => void;
  onPredictionStart: () => void;
  onPredictionEnd: () => void;
}

const paysDisponibles = [
  { id: 'france', name: 'France' },
  { id: 'italie', name: 'Italie' },
  { id: 'japon', name: 'Japon' },
  { id: 'bresil', name: 'Brésil' },
  { id: 'colombie', name: 'Colombie' },
  { id: 'philippines', name: 'Philippines' },
  { id: 'suisse', name: 'Suisse' }
];

export default function CSVUploadForm({ 
  onPredictionResult, 
  onPredictionError,
  onPredictionStart,
  onPredictionEnd
}: CSVUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pays, setPays] = useState('');
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');
    
    if (!selectedFile) {
      setFile(null);
      setPreviewData(null);
      return;
    }
    
    // Vérifier que c'est bien un fichier CSV
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Le fichier doit être au format CSV.');
      setFile(null);
      setPreviewData(null);
      return;
    }
    
    setFile(selectedFile);
    
    // Lire le fichier pour prévisualisation
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        // Vérifier l'en-tête
        const headers = lines[0].split(',');
        const requiredHeaders = ['nbNouveauCas', 'nbDeces', 'nbGueri', 'populationTotale'];
        
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          setError(`Colonnes manquantes dans le CSV: ${missingHeaders.join(', ')}`);
          setPreviewData(null);
          return;
        }
        
        // Afficher un aperçu des 5 premières lignes
        const preview = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const values = lines[i].split(',');
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          
          preview.push(row);
        }
        
        setPreviewData(preview);
      } catch (error) {
        setError('Erreur lors de la lecture du fichier CSV.');
        setPreviewData(null);
      }
    };
    
    reader.readAsText(selectedFile);
  };
  
  const downloadTemplate = () => {
    const csvContent = 'nbNouveauCas,nbDeces,nbGueri,populationTotale\n1000,50,800,67000000';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_prediction_hospitalisation.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Veuillez sélectionner un fichier CSV.');
      return;
    }
    
    if (!pays) {
      toast.error('Veuillez sélectionner un pays.');
      return;
    }
    
    setIsUploading(true);
    onPredictionStart();
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pays', pays);
      
      // Dans un cas réel, nous enverrions formData à l'API
      // Mais pour cette démonstration, nous utilisons la première ligne du CSV
      
      // Simuler l'envoi et la réponse de l'API
      setTimeout(() => {
        if (previewData && previewData.length > 0) {
          const firstRow = previewData[0];
          const selectedPaysName = paysDisponibles.find(p => p.id === pays)?.name || pays;
          
          // Simuler une prédiction basée sur la première ligne du CSV
          const prediction = {
            pays: selectedPaysName,
            nombre_hospitalisations: Math.round(
              parseInt(firstRow.nbNouveauCas) * 0.15 + 
              parseInt(firstRow.nbDeces) * 2 - 
              parseInt(firstRow.nbGueri) * 0.05
            )
          };
          
          onPredictionResult(prediction);
        } else {
          onPredictionError('Aucune donnée valide dans le fichier CSV.');
        }
        
        setIsUploading(false);
        onPredictionEnd();
      }, 1500);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Erreur lors du traitement du fichier CSV.';
      onPredictionError(errorMessage);
      setIsUploading(false);
      onPredictionEnd();
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload de données CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="flex items-center gap-1 mb-4"
          >
            <Download className="h-4 w-4" />
            Télécharger modèle CSV
          </Button>
        </div>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <Select 
              value={pays} 
              onValueChange={(value) => setPays(value)}
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fichier CSV</label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Le fichier doit contenir les colonnes: nbNouveauCas, nbDeces, nbGueri, populationTotale
            </p>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {previewData && previewData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Aperçu des données:</h4>
            <div className="border rounded overflow-x-auto max-h-40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b">
                    {Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="p-2 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      {Object.values(row).map((value: any, j) => (
                        <td key={j} className="p-2">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {previewData.length > 5 ? "Aperçu limité à 5 lignes" : ""}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isUploading || !file || !pays}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Upload en cours...
            </>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Lancer la prédiction
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
