import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { AlertCircle, CalendarIcon, FileBarChart, Loader, Search, ChevronLeft, ChevronRight, ServerCrash, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { releves, maladies, regions, isApiActive, checkApiAvailability } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Mode test pour désactiver les requêtes API problématiques
const TEST_MODE = true;

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

// Données mock pour les dates disponibles
const mockAvailableDates: string[] = [
  "2023-01-15",
  "2023-01-16",
  "2023-02-01",
  "2023-03-10"
];

// Fonction pour formater la date pour l'API
const formatDateToApi = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Composant principal
export default function Releves() {
  // Vérification initiale de la disponibilité de l'API - DÉSACTIVÉE EN MODE TEST
  useEffect(() => {
    if (!TEST_MODE) {
      checkApiAvailability(true);
    }
  }, []);

  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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
  
  // État pour indiquer si les données doivent être chargées
  const [shouldLoadData, setShouldLoadData] = useState(false);
  
  // Paramètres de pagination
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  // Récupération des données des régions et maladies - AVEC FALLBACK
  const { data: maladiesData, isLoading: isLoadingMaladies } = useQuery({
    queryKey: ['maladies'],
    queryFn: async () => {
      if (TEST_MODE) {
        return mockMaladiesData;
      }
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
      if (TEST_MODE) {
        return mockRegionsData;
      }
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
  
  // Récupération des dates disponibles - DÉSACTIVÉE EN MODE TEST
  const { 
    data: availableDates, 
    isLoading: isLoadingDates,
    error: datesError,
    isError: isDatesError
  } = useQuery({
    queryKey: ['availableDates'],
    queryFn: async () => {
      if (TEST_MODE) {
        return mockAvailableDates;
      }
      try {
        const response = await releves.getAvailableDates();
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des dates disponibles:', error);
        return mockAvailableDates;
      }
    },
    placeholderData: mockAvailableDates,
    staleTime: 300000,
    enabled: !TEST_MODE // Désactiver la requête en mode test
  });
  
  // Préparation des dates disponibles pour le calendrier
  const datesMap = new Map<string, boolean>();
  
  if (Array.isArray(availableDates)) {
    availableDates.forEach(dateStr => {
      datesMap.set(dateStr, true);
    });
  }
  
  // Fonction pour vérifier si une date contient des données
  const hasData = (date: Date) => {
    const formattedDate = formatDateToApi(date);
    return datesMap.has(formattedDate);
  };
  
  // Récupération des données des relevés - SIMPLIFIÉE EN MODE TEST
  const { 
    data: relevesData, 
    isLoading: isLoadingReleves, 
    error: relevesError, 
    isError: isRelevesError,
    refetch: refetchReleves
  } = useQuery({
    queryKey: ['releves', selectedDate, selectedRegion, shouldLoadData],
    queryFn: async () => {
      if (TEST_MODE) {
        // En mode test, retourner directement les données mock
        return mockRelevesData;
      }
      
      if (!selectedDate) {
        return [];
      }

      try {
        const dateStr = formatDateToApi(selectedDate);
        
        let response;
        if (selectedRegion) {
          response = await releves.getByRegionAndDateRange(
            selectedRegion, 
            dateStr, 
            dateStr
          );
        } else {
          response = await releves.getByDate(dateStr);
        }
        
        return response?.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des relevés:', error);
        return mockRelevesData;
      }
    },
    enabled: TEST_MODE || (shouldLoadData && !!selectedDate),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000
  });
  
  // Mutations - CORRECTION DES TYPES
  const createReleveMutation = useMutation({
    mutationFn: async (data: Omit<Releve, 'idReleve' | 'region' | 'maladie'>) => {
      if (TEST_MODE) {
        // Retourner un objet compatible avec AxiosResponse
        return {
          data: { id: Date.now() },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {}
        };
      }
      return releves.create(data);
    },
    onSuccess: () => {
      toast.success("Relevé ajouté avec succès.");
      if (!TEST_MODE) {
        queryClient.invalidateQueries({ queryKey: ['releves'] });
        queryClient.invalidateQueries({ queryKey: ['availableDates'] });
      }
      setIsAddDialogOpen(false);
      resetReleveForm();
    },
    onError: (error) => {
      toast.error("Impossible d'ajouter le relevé.");
      console.error("Erreur lors de l'ajout du relevé:", error);
    }
  });

  const deleteReleveMutation = useMutation({
    mutationFn: async (id: number) => {
      if (TEST_MODE) {
        // Retourner un objet compatible avec AxiosResponse
        return {
          data: null,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {}
        };
      }
      return releves.delete(id);
    },
    onSuccess: () => {
      toast.success("Relevé supprimé avec succès.");
      if (!TEST_MODE) {
        queryClient.invalidateQueries({ queryKey: ['releves'] });
        queryClient.invalidateQueries({ queryKey: ['availableDates'] });
      }
      setShouldLoadData(false);
      setSelectedDate(undefined);
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
  
  // Gestionnaire pour charger les données
  const handleLoadData = () => {
    if (!selectedDate && !TEST_MODE) {
      toast.error("Veuillez sélectionner une date avant de charger les données");
      return;
    }
    setShouldLoadData(true);
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
  
  const dataToUse = Array.isArray(relevesData) ? relevesData : [];
  
  const filteredReleves = dataToUse.filter((releve: Releve) => {
    // Filtre par terme de recherche sur la région ou maladie
    const regionName = getRegionName(releve.idRegion).toLowerCase();
    const maladieName = getMaladieName(releve.idMaladie).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
                       regionName.includes(searchLower) || 
                       maladieName.includes(searchLower);
    
    // Filtre par maladie si sélectionnée
    const maladieMatch = !selectedMaladie || releve.idMaladie === selectedMaladie;
    
    return searchMatch && maladieMatch;
  });
  
  const paginatedReleves = filteredReleves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.max(1, Math.ceil(filteredReleves.length / itemsPerPage));
  
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
      dateReleve: selectedDate ? formatDateToApi(selectedDate) : format(new Date(), 'yyyy-MM-dd')
    };
    
    createReleveMutation.mutate(releveToCreate);
  };
  
  const handleDeleteReleve = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce relevé?")) {
      deleteReleveMutation.mutate(id);
    }
  };

  // Fonction pour désactiver les dates sans données
  const disabledDays = (date: Date) => {
    return !hasData(date);
  };
  
  // Transformer les dates string en objets Date pour le calendrier
  const availableDatesObjects = Array.isArray(availableDates) 
    ? availableDates.map(dateStr => new Date(dateStr))
    : [];
  
  // Vérifier si l'API est disponible
  const apiIsActive = TEST_MODE || isApiActive();

  // Rendu du composant
  return (
    <MainLayout>
      {/* Skip link pour l'accessibilité */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        tabIndex={1}
      >
        Aller au contenu principal
      </a>
      
      <div className="space-y-6" id="main-content" role="main" aria-label="Gestion des relevés épidémiologiques">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" id="page-title">Relevés</h1>
            <p className="text-muted-foreground mt-1" aria-describedby="page-title">
              Gestion des relevés épidémiologiques
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button aria-label="Ajouter un nouveau relevé épidémiologique">
                <FileBarChart className="mr-2 h-4 w-4" aria-hidden="true" />
                Ajouter un relevé
              </Button>
            </DialogTrigger>
            <DialogContent aria-labelledby="dialog-title" aria-describedby="dialog-description">
              <form onSubmit={handleAddReleve}>
                <DialogHeader>
                  <DialogTitle id="dialog-title">Ajouter un relevé</DialogTitle>
                  <DialogDescription id="dialog-description">
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
                            aria-label={selectedDate ? `Date sélectionnée: ${format(selectedDate, 'dd/MM/yyyy')}` : "Sélectionner une date"}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                            className="pointer-events-auto"
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
                        <SelectTrigger aria-label="Sélectionner une région">
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingRegions ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader className="h-4 w-4 animate-spin mr-2" aria-hidden="true" /> 
                              <span>Chargement...</span>
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
                        <SelectTrigger aria-label="Sélectionner une maladie">
                          <SelectValue placeholder="Sélectionner une maladie" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingMaladies ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader className="h-4 w-4 animate-spin mr-2" aria-hidden="true" /> 
                              <span>Chargement...</span>
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
                      aria-label="Nombre de nouveaux cas"
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
                      aria-label="Nombre de décès"
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
                      aria-label="Nombre de guérisons"
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
                      aria-label="Nombre d'hospitalisations"
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
                      aria-label="Nombre de patients en soins intensifs"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createReleveMutation.isPending}>
                    {createReleveMutation.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
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
        
        {/* Alert pour mode test */}
        {TEST_MODE && (
          <Alert variant="default" className="bg-blue-50 border-blue-200" role="alert">
            <AlertCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <AlertTitle className="text-blue-600">Mode test activé</AlertTitle>
            <AlertDescription className="text-blue-700">
              Les requêtes API sont désactivées temporairement. Les données affichées sont des exemples pour tester l'interface.
            </AlertDescription>
          </Alert>
        )}
        
        {!apiIsActive && !TEST_MODE && (
          <Alert variant="default" className="bg-amber-50 border-amber-200" role="alert">
            <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <AlertTitle className="text-amber-600">Mode hors ligne</AlertTitle>
            <AlertDescription className="text-amber-700">
              Impossible de se connecter à l'API. Les données affichées sont des exemples. Vérifiez que l'API est en cours d'exécution.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Sélection des données</CardTitle>
            <CardDescription>
              {TEST_MODE ? "Mode test - données mock affichées directement" : "Choisissez une date pour laquelle des relevés existent, puis cliquez sur 'Charger les données'"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sélectionnez une date avec des relevés</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                        aria-label={selectedDate ? `Date sélectionnée: ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}` : "Sélectionner une date"}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                        {selectedDate ? (
                          format(selectedDate, 'dd MMMM yyyy', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      {isLoadingDates && !TEST_MODE ? (
                        <div className="p-4 flex items-center justify-center">
                          <Loader className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
                          <span>Chargement des dates disponibles...</span>
                        </div>
                      ) : isDatesError && !TEST_MODE ? (
                        <div className="p-4 text-red-500">
                          <AlertCircle className="h-5 w-5 inline mr-2" aria-hidden="true" />
                          <span>Erreur lors du chargement des dates</span>
                        </div>
                      ) : (
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setShouldLoadData(false);
                          }}
                          disabled={TEST_MODE ? undefined : disabledDays}
                          defaultMonth={availableDatesObjects.length > 0 ? availableDatesObjects[0] : undefined}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      )}
                      
                      {!isLoadingDates && !TEST_MODE && availableDates?.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          <AlertCircle className="h-5 w-5 inline mr-2" aria-hidden="true" />
                          Aucune date avec des relevés n'est disponible
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  
                  <div className="text-xs text-muted-foreground">
                    {TEST_MODE ? (
                      "Mode test - toutes les dates disponibles"
                    ) : isLoadingDates ? (
                      "Chargement..."
                    ) : Array.isArray(availableDates) && availableDates.length > 0 ? (
                      <>Dates disponibles: {availableDates.length}</>
                    ) : (
                      <>Aucune date disponible</>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Filtrer par région (optionnel)</label>
                  <Select
                    value={selectedRegion?.toString() || ''}
                    onValueChange={(value) => {
                      setSelectedRegion(value ? parseInt(value) : null);
                      setShouldLoadData(false);
                    }}
                  >
                    <SelectTrigger aria-label="Filtrer par région">
                      <SelectValue placeholder="Toutes les régions" />
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
                </div>
              </div>
              
              <div className="flex flex-col justify-end space-y-4">
                <Button 
                  className="w-full" 
                  onClick={handleLoadData}
                  disabled={(!selectedDate && !TEST_MODE) || isLoadingReleves}
                  aria-label="Charger les données des relevés pour la date sélectionnée"
                >
                  {isLoadingReleves ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {TEST_MODE ? "Afficher les données test" : "Charger les données"}
                    </>
                  )}
                </Button>
                
                {((selectedDate && shouldLoadData) || TEST_MODE) && (
                  <Alert variant="default" className="bg-blue-50 border-blue-200" role="status">
                    <CalendarIcon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <AlertTitle className="text-blue-600">
                      {TEST_MODE ? "Mode test activé" : `Date sélectionnée: ${selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : ''}`}
                    </AlertTitle>
                    {selectedRegion && (
                      <AlertDescription className="text-blue-700">
                        Filtré par région: {getRegionName(selectedRegion)}
                      </AlertDescription>
                    )}
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Affichage des données */}
        <Card>
          <CardHeader className="pb-0">
            {(shouldLoadData || TEST_MODE) && (
              <>
                <CardTitle>
                  {TEST_MODE ? "Données de test" : `Relevés du ${selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : ''}`}
                </CardTitle>
                <CardDescription>
                  {TEST_MODE ? "Données d'exemple pour tester l'interface" : selectedRegion 
                    ? `Relevés pour la région ${getRegionName(selectedRegion)}` 
                    : 'Tous relevés pour cette date'}
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {/* Options de filtrage pour les résultats */}
            {(shouldLoadData || TEST_MODE) && !isLoadingReleves && paginatedReleves.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      placeholder="Rechercher par région ou maladie..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                      aria-label="Rechercher dans les relevés par région ou maladie"
                    />
                  </div>
                </div>
                
                <Select
                  value={selectedMaladie?.toString() || ''}
                  onValueChange={(value) => {
                    setSelectedMaladie(value ? parseInt(value) : null);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="md:w-[250px]" aria-label="Filtrer par maladie">
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
            )}
            
            {!(shouldLoadData || TEST_MODE) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-primary mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium">Aucune donnée chargée</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Veuillez sélectionner une date puis cliquer sur "Charger les données" pour afficher les relevés.
                </p>
              </div>
            ) : isLoadingReleves ? (
              <div className="space-y-4" aria-label="Chargement des données">
                <div className="flex justify-center items-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                  <span className="sr-only">Chargement des relevés en cours</span>
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
                    {Array.from({ length: 5 }).map((_, index) => (
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : isRelevesError && !TEST_MODE ? (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Erreur de connexion</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>Impossible de charger les relevés. Vérifiez que:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Le serveur FastAPI est démarré à l'adresse http://127.0.0.1:8000</li>
                    <li>Les routes API sont configurées correctement</li>
                    <li>CORS est activé sur le serveur</li>
                  </ul>
                  <Button 
                    onClick={() => {
                      setShouldLoadData(true);
                      refetchReleves();
                    }} 
                    variant="outline" 
                    className="mt-2 w-fit"
                  >
                    Réessayer
                  </Button>
                </AlertDescription>
              </Alert>
            ) : paginatedReleves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium">Aucun relevé trouvé</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  {searchTerm || selectedMaladie ? (
                    "Aucun relevé ne correspond à vos critères de recherche."
                  ) : (
                    `Aucun relevé trouvé pour ${selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: fr }) : 'la date sélectionnée'}.`
                  )}
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedMaladie(null);
                  }}
                  variant="outline" 
                  className="mt-4"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <>
                <Table role="table" aria-label="Tableau des relevés épidémiologiques">
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
                    {paginatedReleves.map((releve: Releve) => (
                      <TableRow key={releve.idReleve}>
                        <TableCell>{releve.idReleve}</TableCell>
                        <TableCell>
                          {new Date(releve.dateReleve).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>{getRegionName(releve.idRegion)}</TableCell>
                        <TableCell>{getMaladieName(releve.idMaladie)}</TableCell>
                        <TableCell>{releve.nbNouveauCas?.toLocaleString('fr-FR') || 0}</TableCell>
                        <TableCell>{releve.nbDeces?.toLocaleString('fr-FR') || 0}</TableCell>
                        <TableCell>{releve.nbGueri?.toLocaleString('fr-FR') || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteReleve(releve.idReleve)}
                            disabled={deleteReleveMutation.isPending || (!TEST_MODE && !apiIsActive)}
                            aria-label={`Supprimer le relevé ${releve.idReleve}`}
                          >
                            {deleteReleveMutation.isPending && deleteReleveMutation.variables === releve.idReleve ? (
                              <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              "Supprimer"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <nav aria-label="Navigation des pages" className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button 
                            variant="outline" 
                            size="icon"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            aria-label="Page précédente"
                          >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i} className={currentPage === i + 1 ? "hidden sm:inline-block" : "hidden sm:inline-block"}>
                            <PaginationLink
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              aria-label={`Aller à la page ${i + 1}`}
                              aria-current={currentPage === i + 1 ? "page" : undefined}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )).slice(
                          Math.max(0, Math.min(currentPage - 2, totalPages - 3)),
                          Math.min(totalPages, Math.max(3, currentPage + 1))
                        )}
                        
                        <PaginationItem>
                          <Button 
                            variant="outline" 
                            size="icon"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            aria-label="Page suivante"
                          >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    <p className="text-center text-sm text-muted-foreground mt-2" aria-live="polite">
                      Page {currentPage} sur {totalPages}
                    </p>
                  </nav>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
