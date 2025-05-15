
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertCircle, Flag, Loader, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { pays } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';

interface Pays {
  id: number;
  nomPays: string;
  population?: number;
  continent?: string;
  codeISO?: string;
}

export default function Pays() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPays, setNewPays] = useState<Omit<Pays, 'id'>>({
    nomPays: '',
    population: undefined,
    continent: '',
    codeISO: ''
  });
  
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  // Fetch pays data
  const { data: paysData, isLoading, error } = useQuery({
    queryKey: ['pays'],
    queryFn: async () => {
      const response = await pays.getAll();
      return response.data;
    }
  });
  
  // Create new pays mutation
  const createPaysMutation = useMutation({
    mutationFn: (data: Omit<Pays, 'id'>) => pays.create(data),
    onSuccess: () => {
      toast({
        title: "Pays ajouté",
        description: "Le pays a été ajouté avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['pays'] });
      setIsAddDialogOpen(false);
      setNewPays({
        nomPays: '',
        population: undefined,
        continent: '',
        codeISO: ''
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le pays."
      });
      console.error("Erreur lors de l'ajout du pays:", error);
    }
  });

  // Delete pays mutation
  const deletePaysMutation = useMutation({
    mutationFn: (id: number) => pays.delete(id),
    onSuccess: () => {
      toast({
        title: "Pays supprimé",
        description: "Le pays a été supprimé avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['pays'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le pays."
      });
      console.error("Erreur lors de la suppression du pays:", error);
    }
  });
  
  // Filter and paginate pays
  const filteredPays = paysData?.filter(
    (pays: Pays) => pays.nomPays.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const paginatedPays = filteredPays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredPays.length / itemsPerPage);
  
  // Handle form submission for new pays
  const handleAddPays = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPays.nomPays) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom du pays est requis."
      });
      return;
    }
    createPaysMutation.mutate(newPays);
  };
  
  // Handle delete pays
  const handleDeletePays = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pays?")) {
      deletePaysMutation.mutate(id);
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pays</h1>
            <p className="text-muted-foreground mt-1">
              Gérez la liste des pays pour votre système de suivi
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Flag className="mr-2 h-4 w-4" />
                Ajouter un pays
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddPays}>
                <DialogHeader>
                  <DialogTitle>Ajouter un pays</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour ajouter un nouveau pays.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="nomPays" className="text-right">
                      Nom *
                    </label>
                    <Input
                      id="nomPays"
                      className="col-span-3"
                      value={newPays.nomPays}
                      onChange={(e) => setNewPays({ ...newPays, nomPays: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="population" className="text-right">
                      Population
                    </label>
                    <Input
                      id="population"
                      type="number"
                      className="col-span-3"
                      value={newPays.population || ''}
                      onChange={(e) => setNewPays({ ...newPays, population: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="continent" className="text-right">
                      Continent
                    </label>
                    <Input
                      id="continent"
                      className="col-span-3"
                      value={newPays.continent || ''}
                      onChange={(e) => setNewPays({ ...newPays, continent: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="codeISO" className="text-right">
                      Code ISO
                    </label>
                    <Input
                      id="codeISO"
                      className="col-span-3"
                      value={newPays.codeISO || ''}
                      onChange={(e) => setNewPays({ ...newPays, codeISO: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPaysMutation.isPending}>
                    {createPaysMutation.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      "Ajouter"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un pays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Card>
          {error ? (
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  Impossible de charger les pays. Veuillez réessayer plus tard.
                </AlertDescription>
              </Alert>
            </CardContent>
          ) : (
            <>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Population</TableHead>
                      <TableHead>Continent</TableHead>
                      <TableHead>Code ISO</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : paginatedPays.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          {searchTerm ? "Aucun pays trouvé avec cette recherche" : "Aucun pays disponible"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPays.map((pays: Pays) => (
                        <TableRow key={pays.id}>
                          <TableCell>{pays.id}</TableCell>
                          <TableCell className="font-medium">{pays.nomPays}</TableCell>
                          <TableCell>{pays.population?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{pays.continent || '-'}</TableCell>
                          <TableCell>{pays.codeISO || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePays(pays.id)}
                              disabled={deletePaysMutation.isPending}
                            >
                              {deletePaysMutation.isPending && deletePaysMutation.variables === pays.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                "Supprimer"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {totalPages > 1 && (
                <CardFooter>
                  <Pagination className="w-full">
                    <PaginationContent>
                      <PaginationItem>
                        {currentPage === 1 ? (
                          <Button variant="outline" size="icon" disabled className="cursor-not-allowed opacity-50">
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        ) : (
                          <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                        )}
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                      
                      <PaginationItem>
                        {currentPage === totalPages ? (
                          <Button variant="outline" size="icon" disabled className="cursor-not-allowed opacity-50">
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        ) : (
                          <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardFooter>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
