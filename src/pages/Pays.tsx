
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertCircle, Flag, Loader, MapPin, Search, ChevronLeft, ChevronRight, Globe, ServerCrash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { pays } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interface complète pour correspondre au modèle backend
interface Pays {
  id: number;
  nomPays: string;
  isoPays?: string;
  population?: number;
  populationTotale?: number;
  continent?: string;
  codeISO?: string;
  latitudePays?: number | null | string;
  longitudePays?: number | null | string;
  Superficie?: number;
  densitePopulation?: number;
  idContinent?: number;
}

// Données mock pour les pays (utilisées en cas d'erreur API)
const mockPaysData: Pays[] = [
  { id: 1, nomPays: "France", isoPays: "FR", populationTotale: 67000000, continent: "Europe", latitudePays: 46.603354, longitudePays: 1.888334, Superficie: 551695, densitePopulation: 123.1, idContinent: 1 },
  { id: 2, nomPays: "Allemagne", isoPays: "DE", populationTotale: 83000000, continent: "Europe", latitudePays: 51.165691, longitudePays: 10.451526, Superficie: 357022, densitePopulation: 232.8, idContinent: 1 },
  { id: 3, nomPays: "Espagne", isoPays: "ES", populationTotale: 46000000, continent: "Europe", latitudePays: 40.463667, longitudePays: -3.74922, Superficie: 505990, densitePopulation: 91.1, idContinent: 1 },
  { id: 4, nomPays: "États-Unis", isoPays: "US", populationTotale: 329000000, continent: "Amérique du Nord", latitudePays: 37.09024, longitudePays: -95.712891, Superficie: 9372610, densitePopulation: 35.1, idContinent: 2 },
  { id: 5, nomPays: "Japon", isoPays: "JP", populationTotale: 126000000, continent: "Asie", latitudePays: 36.204824, longitudePays: 138.252924, Superficie: 377975, densitePopulation: 333.6, idContinent: 3 },
];

// Fonction utilitaire pour normaliser les coordonnées
const normalizeCoordinate = (value: any): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

// Fonction pour formatter les coordonnées avec sécurité
const formatCoordinate = (value: any): string => {
  const normalized = normalizeCoordinate(value);
  return normalized !== null ? normalized.toFixed(2) : '-';
};

export default function Pays() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPays, setNewPays] = useState<Omit<Pays, 'id'>>({
    nomPays: '',
    isoPays: '',
    populationTotale: undefined,
    continent: '',
    codeISO: '',
    latitudePays: undefined,
    longitudePays: undefined,
    Superficie: undefined,
    densitePopulation: undefined,
    idContinent: undefined
  });
  const [apiMode, setApiMode] = useState(true);
  
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  // Fetch pays data with error handling - optimized query configuration
  const { data: paysData, isLoading, error, isError } = useQuery({
    queryKey: ['pays'],
    queryFn: async () => {
      console.log('Appel API: Récupération des pays');
      try {
        const response = await pays.getAll();
        console.log('Réponse API pays:', response.data);
        
        // Normaliser les données
        const normalizedData = Array.isArray(response.data) ? response.data.map((pays: Pays) => ({
          ...pays,
          latitudePays: normalizeCoordinate(pays.latitudePays),
          longitudePays: normalizeCoordinate(pays.longitudePays)
        })) : [];
        
        setApiMode(true);
        return normalizedData;
      } catch (err) {
        console.error('Erreur API lors de la récupération des pays:', err);
        // En cas d'erreur, on utilise les données de test mais on continue d'afficher la page
        setApiMode(false);
        return mockPaysData;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    // Ajouter un fallback pour éviter des erreurs dans le rendu
    placeholderData: mockPaysData,
    // Augmenter le staleTime pour éviter trop de requêtes
    staleTime: 60000
  });
  
  // Create new pays mutation
  const createPaysMutation = useMutation({
    mutationFn: (data: Omit<Pays, 'id'>) => pays.create(data),
    onSuccess: () => {
      toast.success("Pays ajouté avec succès.");
      queryClient.invalidateQueries({ queryKey: ['pays'] });
      setIsAddDialogOpen(false);
      setNewPays({
        nomPays: '',
        isoPays: '',
        populationTotale: undefined,
        continent: '',
        codeISO: '',
        latitudePays: undefined,
        longitudePays: undefined,
        Superficie: undefined,
        densitePopulation: undefined,
        idContinent: undefined
      });
    },
    onError: (error) => {
      toast.error("Impossible d'ajouter le pays.");
      console.error("Erreur lors de l'ajout du pays:", error);
    }
  });

  // Delete pays mutation
  const deletePaysMutation = useMutation({
    mutationFn: (id: number) => pays.delete(id),
    onSuccess: () => {
      toast.success("Pays supprimé avec succès.");
      queryClient.invalidateQueries({ queryKey: ['pays'] });
    },
    onError: (error) => {
      toast.error("Impossible de supprimer le pays.");
      console.error("Erreur lors de la suppression du pays:", error);
    }
  });
  
  // S'assurer que dataToUse est toujours un tableau, même en cas d'erreur
  const dataToUse = Array.isArray(paysData) ? paysData : mockPaysData;
  
  // Filter and paginate pays
  const filteredPays = dataToUse.filter(
    (pays: Pays) => pays.nomPays.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedPays = filteredPays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredPays.length / itemsPerPage);
  
  // Handle form submission for new pays
  const handleAddPays = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPays.nomPays) {
      toast.error("Le nom du pays est requis.");
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
                    <label htmlFor="isoPays" className="text-right">
                      Code ISO
                    </label>
                    <Input
                      id="isoPays"
                      className="col-span-3"
                      value={newPays.isoPays || ''}
                      onChange={(e) => setNewPays({ ...newPays, isoPays: e.target.value })}
                      maxLength={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="populationTotale" className="text-right">
                      Population
                    </label>
                    <Input
                      id="populationTotale"
                      type="number"
                      className="col-span-3"
                      value={newPays.populationTotale || ''}
                      onChange={(e) => setNewPays({ ...newPays, populationTotale: e.target.value ? parseInt(e.target.value) : undefined })}
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
                    <label htmlFor="latitudePays" className="text-right">
                      Latitude
                    </label>
                    <Input
                      id="latitudePays"
                      type="number"
                      step="0.01"
                      className="col-span-3"
                      value={newPays.latitudePays || ''}
                      onChange={(e) => setNewPays({ ...newPays, latitudePays: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="longitudePays" className="text-right">
                      Longitude
                    </label>
                    <Input
                      id="longitudePays"
                      type="number"
                      step="0.01"
                      className="col-span-3"
                      value={newPays.longitudePays || ''}
                      onChange={(e) => setNewPays({ ...newPays, longitudePays: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="superficie" className="text-right">
                      Superficie
                    </label>
                    <Input
                      id="superficie"
                      type="number"
                      step="0.01"
                      className="col-span-3"
                      value={newPays.Superficie || ''}
                      onChange={(e) => setNewPays({ ...newPays, Superficie: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="densitePopulation" className="text-right">
                      Densité
                    </label>
                    <Input
                      id="densitePopulation"
                      type="number"
                      step="0.1"
                      className="col-span-3"
                      value={newPays.densitePopulation || ''}
                      onChange={(e) => setNewPays({ ...newPays, densitePopulation: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="idContinent" className="text-right">
                      ID Continent
                    </label>
                    <Input
                      id="idContinent"
                      type="number"
                      className="col-span-3"
                      value={newPays.idContinent || ''}
                      onChange={(e) => setNewPays({ ...newPays, idContinent: e.target.value ? parseInt(e.target.value) : undefined })}
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
        
        {!apiMode && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600">Mode hors ligne</AlertTitle>
            <AlertDescription className="text-amber-700">
              Impossible de se connecter à l'API. Les données affichées sont des exemples. Vérifiez que l'API est en cours d'exécution.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          {isError && apiMode ? (
            <CardContent className="pt-6">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de connexion</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>Impossible de se connecter à l'API. Vérifiez que:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Le serveur FastAPI est démarré à l'adresse http://127.0.0.1:8000</li>
                    <li>Les routes API sont configurées correctement</li>
                    <li>CORS est activé sur le serveur</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ServerCrash className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Erreur de connexion à l'API</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  L'application affiche des données d'exemple en attendant que la connexion à l'API soit rétablie.
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Code ISO</TableHead>
                    <TableHead>Population</TableHead>
                    <TableHead>Continent</TableHead>
                    <TableHead>Superficie</TableHead>
                    <TableHead>Densité</TableHead>
                    <TableHead>Coordonnées</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPaysData.map((pays: Pays) => (
                    <TableRow key={pays.id}>
                      <TableCell>{pays.id}</TableCell>
                      <TableCell className="font-medium">{pays.nomPays}</TableCell>
                      <TableCell>{pays.isoPays || pays.codeISO || '-'}</TableCell>
                      <TableCell>{(pays.populationTotale || pays.population)?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{pays.continent || '-'}</TableCell>
                      <TableCell>{pays.Superficie?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{pays.densitePopulation?.toLocaleString() || '-'}</TableCell>
                      <TableCell>
                        {pays.latitudePays !== undefined && pays.longitudePays !== undefined ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            {formatCoordinate(pays.latitudePays)}, {formatCoordinate(pays.longitudePays)}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePays(pays.id)}
                          disabled={true}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          ) : (
            <>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Code ISO</TableHead>
                      <TableHead>Population</TableHead>
                      <TableHead>Continent</TableHead>
                      <TableHead>Superficie</TableHead>
                      <TableHead>Densité</TableHead>
                      <TableHead>Coordonnées</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : paginatedPays.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                          {searchTerm ? "Aucun pays trouvé avec cette recherche" : "Aucun pays disponible"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPays.map((pays: Pays) => (
                        <TableRow key={pays.id}>
                          <TableCell>{pays.id}</TableCell>
                          <TableCell className="font-medium">{pays.nomPays}</TableCell>
                          <TableCell>{pays.isoPays || pays.codeISO || '-'}</TableCell>
                          <TableCell>{(pays.populationTotale || pays.population)?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{pays.continent || '-'}</TableCell>
                          <TableCell>{pays.Superficie?.toLocaleString() || '-'}</TableCell>
                          <TableCell>{pays.densitePopulation?.toLocaleString() || '-'}</TableCell>
                          <TableCell>
                            {(pays.latitudePays !== undefined && pays.latitudePays !== null) && 
                             (pays.longitudePays !== undefined && pays.longitudePays !== null) ? (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                {formatCoordinate(pays.latitudePays)}, {formatCoordinate(pays.longitudePays)}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePays(pays.id)}
                              disabled={deletePaysMutation.isPending || !apiMode}
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
