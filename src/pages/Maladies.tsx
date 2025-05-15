
import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import MaladieCard from '@/components/maladies/MaladieCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertCircle, Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  useGetMaladies, 
  useCreateMaladie, 
  useUpdateMaladie, 
  useDeleteMaladie
} from '@/hooks/use-maladies';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Maladies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nomMaladie, setNomMaladie] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Nombre de maladies par page
  
  // Fetch maladies from API
  const { data: maladiesData, isLoading, isError } = useGetMaladies();
  
  // Mutations
  const createMaladieMutation = useCreateMaladie();
  const updateMaladieMutation = useUpdateMaladie();
  const deleteMaladieMutation = useDeleteMaladie();
  
  // Process the maladies data to include variants
  const processedMaladies = (maladiesData || []).map((maladie: any) => ({
    id: maladie.idMaladie,
    nomMaladie: maladie.nomMaladie,
    variants: maladie.variants || [], // This will be populated when API returns variants
  }));
  
  // Filter maladies based on search term
  const filteredMaladies = processedMaladies.filter((maladie: any) => 
    maladie.nomMaladie.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination logic
  const totalPages = Math.ceil(filteredMaladies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaladies = filteredMaladies.slice(startIndex, endIndex);
  
  const handleCreateMaladie = async () => {
    if (!nomMaladie.trim()) {
      setError('Le nom de la maladie est requis');
      return;
    }
    
    setError(null);
    
    createMaladieMutation.mutate({ nomMaladie }, {
      onSuccess: () => {
        setNomMaladie('');
        setIsDialogOpen(false);
      }
    });
  };
  
  const handleUpdateMaladie = async () => {
    if (!nomMaladie.trim() || !selectedId) {
      setError('Le nom de la maladie est requis');
      return;
    }
    
    setError(null);
    
    updateMaladieMutation.mutate({ 
      id: selectedId,
      data: { nomMaladie }
    }, {
      onSuccess: () => {
        setNomMaladie('');
        setSelectedId(null);
        setIsDialogOpen(false);
      }
    });
  };
  
  const handleDeleteMaladie = async (id: number) => {
    deleteMaladieMutation.mutate(id);
  };
  
  const handleEdit = (id: number) => {
    const maladie = processedMaladies.find((m: any) => m.id === id);
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
  
  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="flex flex-col items-center gap-2">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des maladies...</p>
            </div>
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de charger les maladies. Veuillez réessayer plus tard.
            </AlertDescription>
          </Alert>
        ) : filteredMaladies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMaladies.map((maladie: any) => (
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
            
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => goToPage(currentPage - 1)} 
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* First page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis if needed */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Previous page if not first */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(currentPage - 1)}>
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                  
                  {/* Next page if not last */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(currentPage + 1)}>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis if needed */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => goToPage(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => goToPage(currentPage + 1)} 
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
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
              disabled={createMaladieMutation.isPending || updateMaladieMutation.isPending}
              onClick={dialogMode === 'create' ? handleCreateMaladie : handleUpdateMaladie}
            >
              {(createMaladieMutation.isPending || updateMaladieMutation.isPending) ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {dialogMode === 'create' ? 'Création...' : 'Mise à jour...'}
                </>
              ) : (
                dialogMode === 'create' ? 'Créer' : 'Mettre à jour'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
