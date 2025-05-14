
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import MaladieCard from '@/components/maladies/MaladieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { maladies } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function Maladies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nomMaladie, setNomMaladie] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data for demonstration purposes
  // In a real application, this would be fetched from your API
  const [maladiesList, setMaladiesList] = useState([
    { id: 1, nomMaladie: 'COVID-19', variants: ['Alpha', 'Beta', 'Delta', 'Omicron'] },
    { id: 2, nomMaladie: 'Ebola', variants: ['Zaïre', 'Soudan', 'Bundibugyo'] },
    { id: 3, nomMaladie: 'Grippe', variants: ['H1N1', 'H3N2', 'H5N1'] },
    { id: 4, nomMaladie: 'Paludisme', variants: ['P. falciparum', 'P. vivax', 'P. ovale'] },
    { id: 5, nomMaladie: 'Variole', variants: [] },
    { id: 6, nomMaladie: 'Choléra', variants: ['O1', 'O139'] },
  ]);
  
  // Filter maladies based on search term
  const filteredMaladies = maladiesList.filter(maladie => 
    maladie.nomMaladie.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateMaladie = async () => {
    if (!nomMaladie.trim()) {
      setError('Le nom de la maladie est requis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real application, this would make an API call
      // const response = await maladies.create({ nomMaladie });
      
      // For demo purposes, we'll simulate the API call
      const newMaladie = {
        id: Math.max(...maladiesList.map(m => m.id), 0) + 1,
        nomMaladie,
        variants: [],
      };
      
      setMaladiesList([...maladiesList, newMaladie]);
      toast({
        title: "Maladie créée",
        description: `La maladie ${nomMaladie} a été créée avec succès`,
      });
      
      // Reset form and close dialog
      setNomMaladie('');
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de la création");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateMaladie = async () => {
    if (!nomMaladie.trim() || !selectedId) {
      setError('Le nom de la maladie est requis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real application, this would make an API call
      // const response = await maladies.update(selectedId, { nomMaladie });
      
      // For demo purposes, we'll simulate the API call
      const updatedMaladies = maladiesList.map(maladie => 
        maladie.id === selectedId ? { ...maladie, nomMaladie } : maladie
      );
      
      setMaladiesList(updatedMaladies);
      toast({
        title: "Maladie mise à jour",
        description: `La maladie ${nomMaladie} a été mise à jour avec succès`,
      });
      
      // Reset form and close dialog
      setNomMaladie('');
      setSelectedId(null);
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMaladie = async (id: number) => {
    try {
      // In a real application, this would make an API call
      // await maladies.delete(id);
      
      // For demo purposes, we'll simulate the API call
      const updatedMaladies = maladiesList.filter(maladie => maladie.id !== id);
      setMaladiesList(updatedMaladies);
      
      toast({
        title: "Maladie supprimée",
        description: "La maladie a été supprimée avec succès",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.detail || "Une erreur est survenue lors de la suppression",
      });
    }
  };
  
  const handleEdit = (id: number) => {
    const maladie = maladiesList.find(m => m.id === id);
    if (maladie) {
      setNomMaladie(maladie.nomMaladie);
      setSelectedId(id);
      setDialogMode('edit');
      setIsDialogOpen(true);
    }
  };
  
  const handleOpenCreateDialog = () => {
    setNomMaladie('');
    setSelectedId(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Maladies</h1>
            <p className="text-muted-foreground mt-1">
              Gestion des maladies infectieuses
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une maladie..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une maladie
            </Button>
          </div>
        </div>
        
        {filteredMaladies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaladies.map((maladie) => (
              <MaladieCard
                key={maladie.id}
                id={maladie.id}
                name={maladie.nomMaladie}
                variants={maladie.variants}
                onEdit={handleEdit}
                onDelete={handleDeleteMaladie}
                onView={(id) => console.log('View maladie', id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">Aucune maladie trouvée</p>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une maladie
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Créer une nouvelle maladie' : 'Modifier la maladie'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'Ajoutez une nouvelle maladie infectieuse à la base de données.'
                : 'Modifiez les informations de la maladie sélectionnée.'}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nomMaladie">Nom de la maladie</Label>
              <Input
                id="nomMaladie"
                placeholder="Entrez le nom de la maladie"
                value={nomMaladie}
                onChange={(e) => setNomMaladie(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={dialogMode === 'create' ? handleCreateMaladie : handleUpdateMaladie}
            >
              {dialogMode === 'create' ? 'Créer' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
