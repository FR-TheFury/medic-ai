
import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertCircle, CalendarIcon, FileBarChart, Loader, Search, ChevronLeft, ChevronRight, ServerCrash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { releves, maladies, regions, pays } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interface pour les modèles
interface Releve {
  idReleve: number;
  dateReleve: string;
  nbNouveauCas?: number;
  nbDeces?: number;
  nbGueri?: number;
  nbHospitalisation?: number;
  nbHospiSoinsIntensif?: number;
  nbVaccineTotalement?: number;
  nbSousRespirateur?: number;
  nbVaccine?: number;
  nbTeste?: number;
  idRegion: number;
  idMaladie: number;
  region?: Region;
  maladie?: Maladie;
}

interface Region {
  idRegion: number;
  nomEtat: string;
  idPays: number;
  pays?: Pays;
}

interface Pays {
  idPays: number;
  nomPays: string;
}

interface Maladie {
  idMaladie: number;
  nomMaladie: string;
}

// Données mock pour les relevés (utilisées en cas d'erreur API)
const mockRelevesData: Releve[] = [
  {
    idReleve: 1,
    dateReleve: "2023-01-15",
    nbNouveauCas: 1245,
    nbDeces: 45,
    nbGueri: 980,
    nbHospitalisation: 230,
    nbHospiSoinsIntensif: 85,
    idRegion: 1,
    idMaladie: 1
  },
  {
    idReleve: 2,
    dateReleve: "2023-01-16",
    nbNouveauCas: 1120,
    nbDeces: 38,
    nbGueri: 1050,
    nbHospitalisation: 210,
    nbHospiSoinsIntensif: 75,
    idRegion: 1,
    idMaladie: 1
  },
  {
    idReleve: 3,
    dateReleve: "2023-01-15",
    nbNouveauCas: 890,
    nbDeces: 25,
    nbGueri: 760,
    nbHospitalisation: 150,
    nbHospiSoinsIntensif: 45,
    idRegion: 2,
    idMaladie: 1
  },
];

// Données mock pour les maladies
const mockMaladiesData: Maladie[] = [
  { idMaladie: 1, nomMaladie: "COVID-19" },
  { idMaladie: 2, nomMaladie: "Grippe" },
  { idMaladie: 3, nomMaladie: "Pneumonie" },
];

// Données mock pour les régions
const mockRegionsData: Region[] = [
  { idRegion: 1, nomEtat: "Île-de-France", idPays: 1 },
  { idRegion: 2, nomEtat: "Occitanie", idPays: 1 },
  { idRegion: 3, nomEtat: "Auvergne-Rhône-Alpes", idPays: 1 },
  { idRegion: 4, nomEtat: "Bavière", idPays: 2 },
];

// Fonction pour formater la date pour l'API
const formatDateToApi = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Composant principal
export default function Releves() {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedMaladie, setSelectedMaladie] = useState<number | null>(null);
  const [newReleve, setNewReleve] = useState<Omit<Releve, 'idReleve' | 'region' | 'maladie'>>({
    dateReleve: format(new Date(), 'yyyy-MM-dd'),
    nbNouveauCas: 0,
    nbDeces: 0,
    nbGueri: 0,
    idRegion: 0,
    idMaladie: 0
  });
  
  // État pour suivre si l'API est disponible
  const [apiMode, setApiMode] = useState(true);
  
  // Paramètres de pagination
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  // Récupération des données
  const { data: relevesData, isLoading: isLoadingReleves, error: relevesError, isError: isRelevesError } = useQuery({
    queryKey: ['releves'],
    queryFn: async () => {
      try {
        const response = await releves.getAll();
        setApiMode(true);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des relevés:', error);
        setApiMode(false);
        return mockRelevesData;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: mockRelevesData, // Données par défaut pour éviter les erreurs
    staleTime: 60000 // 1 minute pour éviter trop de requêtes
  });
  
  const { data: maladiesData, isLoading: isLoadingMaladies } = useQuery({
    queryKey: ['maladies'],
    queryFn: async () => {
      try {
        const response = await maladies.getAll();
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des maladies:', error);
        return mockMaladiesData;
      }
    },
    placeholderData: mockMaladiesData,
    staleTime: 60000
  });
  
  const { data: regionsData, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      try {
        const response = await regions.getAll();
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des régions:', error);
        return mockRegionsData;
      }
    },
    placeholderData: mockRegionsData,
    staleTime: 60000
  });
  
  // Mutations
  const createReleveMutation = useMutation({
    mutationFn: (data: Omit<Releve, 'idReleve' | 'region' | 'maladie'>) => releves.create(data),
    onSuccess: () => {
      toast.success("Relevé ajouté avec succès.");
      queryClient.invalidateQueries({ queryKey: ['releves'] });
      setIsAddDialogOpen(false);
      resetReleveForm();
    },
    onError: (error) => {
      toast.error("Impossible d'ajouter le relevé.");
      console.error("Erreur lors de l'ajout du relevé:", error);
    }
  });

  const deleteReleveMutation = useMutation({
    mutationFn: (id: number) => releves.delete(id),
    onSuccess: () => {
      toast.success("Relevé supprimé avec succès.");
      queryClient.invalidateQueries({ queryKey: ['releves'] });
    },
    onError: (error) => {
      toast.error("Impossible de supprimer le relevé.");
      console.error("Erreur lors de la suppression du relevé:", error);
    }
  });
  
  // Fonctions utilitaires
  const resetReleveForm = () => {
    setNewReleve({
      dateReleve: format(new Date(), 'yyyy-MM-dd'),
      nbNouveauCas: 0,
      nbDeces: 0,
      nbGueri: 0,
      idRegion: 0,
      idMaladie: 0
    });
    setSelectedDate(new Date());
  };
  
  // Filtrer et paginer les données
  const getRegionName = (regionId: number): string => {
    const region = regionsData?.find((r: Region) => r.idRegion === regionId);
    return region ? region.nomEtat : `Région #${regionId}`;
  };
  
  const getMaladieName = (maladieId: number): string => {
    const maladie = maladiesData?.find((m: Maladie) => m.idMaladie === maladieId);
    return maladie ? maladie.nomMaladie : `Maladie #${maladieId}`;
  };
  
  const dataToUse = Array.isArray(relevesData) ? relevesData : mockRelevesData;
  
  const filteredReleves = dataToUse.filter((releve: Releve) => {
    // Filtre par terme de recherche sur la région ou maladie
    const regionName = getRegionName(releve.idRegion).toLowerCase();
    const maladieName = getMaladieName(releve.idMaladie).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || regionName.includes(searchLower) || maladieName.includes(searchLower);
    
    // Filtre par région si sélectionnée
    const regionMatch = !selectedRegion || releve.idRegion === selectedRegion;
    
    // Filtre par maladie si sélectionnée
    const maladieMatch = !selectedMaladie || releve.idMaladie === selectedMaladie;
    
    return searchMatch && regionMatch && maladieMatch;
  });
  
  const paginatedReleves = filteredReleves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredReleves.length / itemsPerPage);
  
  // Gestionnaires d'événements
  const handleAddReleve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleve.idRegion || !newReleve.idMaladie) {
      toast.error("La région et la maladie sont requises.");
      return;
    }
    
    // Mise à jour de la date depuis l'état du sélecteur de date
    const releveToCreate = {
      ...newReleve,
      dateReleve: formatDateToApi(selectedDate)
    };
    
    createReleveMutation.mutate(releveToCreate);
  };
  
  const handleDeleteReleve = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce relevé?")) {
      deleteReleveMutation.mutate(id);
    }
  };

  // Rendu du composant
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relevés</h1>
            <p className="text-muted-foreground mt-1">
              Gestion des relevés épidémiologiques
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileBarChart className="mr-2 h-4 w-4" />
                Ajouter un relevé
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddReleve}>
                <DialogHeader>
                  <DialogTitle>Ajouter un relevé</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour ajouter un nouveau relevé épidémiologique.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="date" className="text-right">
                      Date *
                    </label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="region" className="text-right">
                      Région *
                    </label>
                    <div className="col-span-3">
                      <Select 
                        value={newReleve.idRegion ? String(newReleve.idRegion) : ''}
                        onValueChange={(value) => setNewReleve({ ...newReleve, idRegion: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingRegions ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader className="h-4 w-4 animate-spin mr-2" /> Chargement...
                            </div>
                          ) : (
                            regionsData?.map((region: Region) => (
                              <SelectItem key={region.idRegion} value={String(region.idRegion)}>
                                {region.nomEtat}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="maladie" className="text-right">
                      Maladie *
                    </label>
                    <div className="col-span-3">
                      <Select 
                        value={newReleve.idMaladie ? String(newReleve.idMaladie) : ''}
                        onValueChange={(value) => setNewReleve({ ...newReleve, idMaladie: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une maladie" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingMaladies ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader className="h-4 w-4 animate-spin mr-2" /> Chargement...
                            </div>
                          ) : (
                            maladiesData?.map((maladie: Maladie) => (
                              <SelectItem key={maladie.idMaladie} value={String(maladie.idMaladie)}>
                                {maladie.nomMaladie}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="nbNouveauCas" className="text-right">
                      Nouveaux cas
                    </label>
                    <Input
                      id="nbNouveauCas"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbNouveauCas || 0}
                      onChange={(e) => setNewReleve({ ...newReleve, nbNouveauCas: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="nbDeces" className="text-right">
                      Décès
                    </label>
                    <Input
                      id="nbDeces"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbDeces || 0}
                      onChange={(e) => setNewReleve({ ...newReleve, nbDeces: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="nbGueri" className="text-right">
                      Guérisons
                    </label>
                    <Input
                      id="nbGueri"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbGueri || 0}
                      onChange={(e) => setNewReleve({ ...newReleve, nbGueri: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="nbHospitalisation" className="text-right">
                      Hospitalisations
                    </label>
                    <Input
                      id="nbHospitalisation"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbHospitalisation || 0}
                      onChange={(e) => setNewReleve({ ...newReleve, nbHospitalisation: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="nbHospiSoinsIntensif" className="text-right">
                      Soins intensifs
                    </label>
                    <Input
                      id="nbHospiSoinsIntensif"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbHospiSoinsIntensif || 0}
                      onChange={(e) => setNewReleve({ ...newReleve, nbHospiSoinsIntensif: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createReleveMutation.isPending}>
                    {createReleveMutation.isPending ? (
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select
            value={selectedRegion?.toString() || ''}
            onValueChange={(value) => setSelectedRegion(value ? parseInt(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les régions</SelectItem>
              {regionsData?.map((region: Region) => (
                <SelectItem key={region.idRegion} value={region.idRegion.toString()}>
                  {region.nomEtat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedMaladie?.toString() || ''}
            onValueChange={(value) => setSelectedMaladie(value ? parseInt(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par maladie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les maladies</SelectItem>
              {maladiesData?.map((maladie: Maladie) => (
                <SelectItem key={maladie.idMaladie} value={maladie.idMaladie.toString()}>
                  {maladie.nomMaladie}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {isRelevesError && apiMode ? (
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de connexion</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>Impossible de charger les relevés. Vérifiez que:</p>
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
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Maladie</TableHead>
                    <TableHead>Nouveaux cas</TableHead>
                    <TableHead>Décès</TableHead>
                    <TableHead>Guérisons</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRelevesData.map((releve: Releve) => (
                    <TableRow key={releve.idReleve}>
                      <TableCell>{releve.idReleve}</TableCell>
                      <TableCell>
                        {new Date(releve.dateReleve).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getRegionName(releve.idRegion)}</TableCell>
                      <TableCell>{getMaladieName(releve.idMaladie)}</TableCell>
                      <TableCell>{releve.nbNouveauCas?.toLocaleString() || 0}</TableCell>
                      <TableCell>{releve.nbDeces?.toLocaleString() || 0}</TableCell>
                      <TableCell>{releve.nbGueri?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
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
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Région</TableHead>
                      <TableHead>Maladie</TableHead>
                      <TableHead>Nouveaux cas</TableHead>
                      <TableHead>Décès</TableHead>
                      <TableHead>Guérisons</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingReleves || isLoadingRegions || isLoadingMaladies ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : paginatedReleves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          {searchTerm || selectedRegion || selectedMaladie 
                            ? "Aucun relevé trouvé avec ces critères" 
                            : "Aucun relevé disponible"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReleves.map((releve: Releve) => (
                        <TableRow key={releve.idReleve}>
                          <TableCell>{releve.idReleve}</TableCell>
                          <TableCell>
                            {new Date(releve.dateReleve).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getRegionName(releve.idRegion)}</TableCell>
                          <TableCell>{getMaladieName(releve.idMaladie)}</TableCell>
                          <TableCell>{releve.nbNouveauCas?.toLocaleString() || 0}</TableCell>
                          <TableCell>{releve.nbDeces?.toLocaleString() || 0}</TableCell>
                          <TableCell>{releve.nbGueri?.toLocaleString() || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReleve(releve.idReleve)}
                              disabled={deleteReleveMutation.isPending || !apiMode}
                            >
                              {deleteReleveMutation.isPending && deleteReleveMutation.variables === releve.idReleve ? (
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
                            <span className="sr-only">Page précédente</span>
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
                            <span className="sr-only">Page suivante</span>
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
