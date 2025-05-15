
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertCircle, Calendar, FileUp, Loader, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from '@/hooks/use-toast';
import { releves, regions, maladies } from '@/lib/api';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';

interface Releve {
  idReleve: number;
  dateReleve: string;
  nbNouveauCas: number | null;
  nbDeces: number | null;
  nbGueri: number | null;
  nbHospitalisation: number | null;
  nbHospiSoinsIntensif: number | null;
  nbVaccineTotalement: number | null;
  nbSousRespirateur: number | null;
  nbVaccine: number | null;
  nbTeste: number | null;
  idRegion: number;
  idMaladie: number;
  region?: {
    nomEtat: string;
  };
  maladie?: {
    nomMaladie: string;
  };
}

interface NewReleveForm extends Omit<Releve, 'idReleve' | 'region' | 'maladie'> {
  dateReleve: string;
}

export default function Releves() {
  // State declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedMaladie, setSelectedMaladie] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });
  
  const [newReleve, setNewReleve] = useState<NewReleveForm>({
    dateReleve: format(new Date(), 'yyyy-MM-dd'),
    nbNouveauCas: 0,
    nbDeces: 0,
    nbGueri: 0,
    nbHospitalisation: 0,
    nbHospiSoinsIntensif: 0,
    nbVaccineTotalement: 0,
    nbSousRespirateur: 0,
    nbVaccine: 0,
    nbTeste: 0,
    idRegion: 0,
    idMaladie: 0
  });
  
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  
  // Format dates for API calls
  const formattedStartDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const formattedEndDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  // Fetch regions for dropdown
  const { data: regionsData } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response = await regions.getAll();
      return response.data;
    }
  });

  // Fetch maladies for dropdown
  const { data: maladiesData } = useQuery({
    queryKey: ['maladies'],
    queryFn: async () => {
      const response = await maladies.getAll();
      return response.data;
    }
  });
  
  // Fetch releves with date range filtering
  const { data: relevesData, isLoading, error } = useQuery({
    queryKey: ['releves', formattedStartDate, formattedEndDate, selectedRegion],
    queryFn: async () => {
      if (selectedRegion && formattedStartDate) {
        const response = await releves.getByRegionAndDateRange(
          parseInt(selectedRegion),
          formattedStartDate,
          formattedEndDate
        );
        return response.data;
      } else if (formattedStartDate) {
        const response = await releves.getByDateRange(formattedStartDate, formattedEndDate);
        return response.data;
      } else {
        const response = await releves.getAll();
        return response.data;
      }
    },
    enabled: !!formattedStartDate || !selectedRegion
  });
  
  // Create new releve mutation
  const createReleveMutation = useMutation({
    mutationFn: (data: Omit<Releve, 'idReleve'>) => releves.create(data),
    onSuccess: () => {
      toast({
        title: "Relevé ajouté",
        description: "Le relevé a été ajouté avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['releves'] });
      setIsAddDialogOpen(false);
      resetNewReleveForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le relevé."
      });
      console.error("Erreur lors de l'ajout du relevé:", error);
    }
  });

  // Delete releve mutation
  const deleteReleveMutation = useMutation({
    mutationFn: (id: number) => releves.delete(id),
    onSuccess: () => {
      toast({
        title: "Relevé supprimé",
        description: "Le relevé a été supprimé avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['releves'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le relevé."
      });
      console.error("Erreur lors de la suppression du relevé:", error);
    }
  });
  
  // Helper function to reset the form
  const resetNewReleveForm = () => {
    setNewReleve({
      dateReleve: format(new Date(), 'yyyy-MM-dd'),
      nbNouveauCas: 0,
      nbDeces: 0,
      nbGueri: 0,
      nbHospitalisation: 0,
      nbHospiSoinsIntensif: 0,
      nbVaccineTotalement: 0,
      nbSousRespirateur: 0,
      nbVaccine: 0,
      nbTeste: 0,
      idRegion: 0,
      idMaladie: 0
    });
  };

  // Filter and paginate releves
  const filteredReleves = relevesData ? relevesData.filter(
    (releve: Releve) => {
      const regionFilter = selectedRegion ? releve.idRegion === parseInt(selectedRegion) : true;
      const maladieFilter = selectedMaladie ? releve.idMaladie === parseInt(selectedMaladie) : true;
      const searchFilter = searchTerm 
        ? releve.dateReleve.toLowerCase().includes(searchTerm.toLowerCase()) 
        : true;
      return regionFilter && maladieFilter && searchFilter;
    }
  ) : [];
  
  const paginatedReleves = filteredReleves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredReleves.length / itemsPerPage);
  
  // Handle form submission for new releve
  const handleAddReleve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleve.dateReleve || !newReleve.idRegion || !newReleve.idMaladie) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La date, la région et la maladie sont requises."
      });
      return;
    }
    createReleveMutation.mutate(newReleve);
  };
  
  // Handle delete releve
  const handleDeleteReleve = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce relevé?")) {
      deleteReleveMutation.mutate(id);
    }
  };

  // Get region and maladie names
  const getRegionName = (idRegion: number) => {
    if (!regionsData) return "Inconnu";
    const region = regionsData.find((r: any) => r.idRegion === idRegion);
    return region ? region.nomEtat : "Inconnu";
  };

  const getMaladieName = (idMaladie: number) => {
    if (!maladiesData) return "Inconnue";
    const maladie = maladiesData.find((m: any) => m.idMaladie === idMaladie);
    return maladie ? maladie.nomMaladie : "Inconnue";
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Relevés</h1>
            <p className="text-muted-foreground mt-1">
              Gestion des données épidémiologiques
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileUp className="mr-2 h-4 w-4" />
                  Ajouter un relevé
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleAddReleve}>
                  <DialogHeader>
                    <DialogTitle>Ajouter un relevé</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations pour ajouter un nouveau relevé épidémiologique.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="dateReleve" className="text-sm font-medium">
                        Date *
                      </label>
                      <Input
                        id="dateReleve"
                        type="date"
                        value={newReleve.dateReleve}
                        onChange={(e) => setNewReleve({ ...newReleve, dateReleve: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="idRegion" className="text-sm font-medium">
                        Région *
                      </label>
                      <Select
                        value={newReleve.idRegion.toString()}
                        onValueChange={(value) => setNewReleve({ ...newReleve, idRegion: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {regionsData?.map((region: any) => (
                            <SelectItem key={region.idRegion} value={region.idRegion.toString()}>
                              {region.nomEtat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="idMaladie" className="text-sm font-medium">
                        Maladie *
                      </label>
                      <Select
                        value={newReleve.idMaladie.toString()}
                        onValueChange={(value) => setNewReleve({ ...newReleve, idMaladie: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une maladie" />
                        </SelectTrigger>
                        <SelectContent>
                          {maladiesData?.map((maladie: any) => (
                            <SelectItem key={maladie.idMaladie} value={maladie.idMaladie.toString()}>
                              {maladie.nomMaladie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbNouveauCas" className="text-sm font-medium">
                        Nouveaux cas
                      </label>
                      <Input
                        id="nbNouveauCas"
                        type="number"
                        value={newReleve.nbNouveauCas || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbNouveauCas: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbDeces" className="text-sm font-medium">
                        Décès
                      </label>
                      <Input
                        id="nbDeces"
                        type="number"
                        value={newReleve.nbDeces || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbDeces: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbGueri" className="text-sm font-medium">
                        Guérisons
                      </label>
                      <Input
                        id="nbGueri"
                        type="number"
                        value={newReleve.nbGueri || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbGueri: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbHospitalisation" className="text-sm font-medium">
                        Hospitalisations
                      </label>
                      <Input
                        id="nbHospitalisation"
                        type="number"
                        value={newReleve.nbHospitalisation || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbHospitalisation: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbHospiSoinsIntensif" className="text-sm font-medium">
                        Soins intensifs
                      </label>
                      <Input
                        id="nbHospiSoinsIntensif"
                        type="number"
                        value={newReleve.nbHospiSoinsIntensif || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbHospiSoinsIntensif: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbVaccineTotalement" className="text-sm font-medium">
                        Vaccinés (complet)
                      </label>
                      <Input
                        id="nbVaccineTotalement"
                        type="number"
                        value={newReleve.nbVaccineTotalement || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbVaccineTotalement: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbSousRespirateur" className="text-sm font-medium">
                        Sous respirateur
                      </label>
                      <Input
                        id="nbSousRespirateur"
                        type="number"
                        value={newReleve.nbSousRespirateur || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbSousRespirateur: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbVaccine" className="text-sm font-medium">
                        Vaccinés (dose)
                      </label>
                      <Input
                        id="nbVaccine"
                        type="number"
                        value={newReleve.nbVaccine || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbVaccine: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nbTeste" className="text-sm font-medium">
                        Testés
                      </label>
                      <Input
                        id="nbTeste"
                        type="number"
                        value={newReleve.nbTeste || ''}
                        onChange={(e) => setNewReleve({ ...newReleve, nbTeste: parseInt(e.target.value) || null })}
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
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-72">
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="search" className="text-sm font-medium">Rechercher</label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      id="search"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Période</label>
                  <DateRangePicker 
                    dateRange={dateRange} 
                    onDateRangeChange={setDateRange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Région</label>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les régions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les régions</SelectItem>
                      {regionsData?.map((region: any) => (
                        <SelectItem key={region.idRegion} value={region.idRegion.toString()}>
                          {region.nomEtat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maladie</label>
                  <Select
                    value={selectedMaladie}
                    onValueChange={setSelectedMaladie}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les maladies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les maladies</SelectItem>
                      {maladiesData?.map((maladie: any) => (
                        <SelectItem key={maladie.idMaladie} value={maladie.idMaladie.toString()}>
                          {maladie.nomMaladie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            <Card className="w-full">
              {error ? (
                <CardContent className="pt-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                      Impossible de charger les relevés. Veuillez réessayer plus tard.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle>Liste des relevés</CardTitle>
                    <CardDescription>
                      {filteredReleves.length} relevés trouvés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : paginatedReleves.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                              Aucun relevé trouvé pour ces critères
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedReleves.map((releve: Releve) => (
                            <TableRow key={releve.idReleve}>
                              <TableCell>
                                {new Date(releve.dateReleve).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{getRegionName(releve.idRegion)}</TableCell>
                              <TableCell>{getMaladieName(releve.idMaladie)}</TableCell>
                              <TableCell>{releve.nbNouveauCas?.toLocaleString() || '-'}</TableCell>
                              <TableCell>{releve.nbDeces?.toLocaleString() || '-'}</TableCell>
                              <TableCell>{releve.nbGueri?.toLocaleString() || '-'}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteReleve(releve.idReleve)}
                                  disabled={deleteReleveMutation.isPending}
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
        </div>
      </div>
    </MainLayout>
  );
}
