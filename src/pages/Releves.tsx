import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Plus, Search, Trash2, CalendarIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { DateRange } from 'react-day-picker';
import { releves, regions, maladies } from '@/lib/api';

// Interface pour les relevés
interface Releve {
  idReleve: number;
  dateReleve: string;
  nbNouveauCas: number;
  nbDeces: number;
  nbGueri: number;
  nbHospitalisation: number;
  nbHospiSoinsIntensif: number;
  nbVaccineTotalement: number;
  nbSousRespirateur: number;
  nbVaccine: number;
  nbTeste: number;
  idRegion: number;
  idMaladie: number;
  region?: {
    nomEtat: string;
  };
  maladie?: {
    nomMaladie: string;
  };
}

interface Region {
  idRegion: number;
  nomEtat: string;
}

interface Maladie {
  idMaladie: number;
  nomMaladie: string;
}

const ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 10;

export default function Releves() {
  const [allReleves, setAllReleves] = useState<Releve[]>([]);
  const [currentReleves, setCurrentReleves] = useState<Releve[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [regionsData, setRegionsData] = useState<Region[]>([]);
  const [maladiesData, setMaladiesData] = useState<Maladie[]>([]);
  const [newReleve, setNewReleve] = useState({
    dateReleve: '',
    idRegion: 0,
    idMaladie: 0,
    nbNouveauCas: 0,
    nbDeces: 0,
    nbGueri: 0,
    nbHospitalisation: 0,
    nbHospiSoinsIntensif: 0,
    nbVaccineTotalement: 0,
    nbSousRespirateur: 0,
    nbVaccine: 0,
    nbTeste: 0
  });

  // Charger les régions et maladies pour les selects
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        const [regionsResponse, maladiesResponse] = await Promise.all([
          regions.getAll(),
          maladies.getAll()
        ]);
        setRegionsData(regionsResponse.data.slice(0, 50)); // Limiter à 50 régions
        setMaladiesData(maladiesResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données de sélection:', error);
        toast.error('Erreur lors du chargement des données de sélection');
      }
    };

    loadSelectData();
  }, []);

  // Fonction pour charger les relevés avec filtres
  const loadReleves = async (page: number = 1) => {
    setIsLoading(true);
    console.log('Chargement des relevés - page:', page);
    
    try {
      let relevesData: Releve[] = [];
      
      // Si une plage de dates est sélectionnée, utiliser l'endpoint de filtrage par date
      if (dateRange?.from && dateRange?.to) {
        const startDate = dateRange.from.toISOString().split('T')[0];
        const endDate = dateRange.to.toISOString().split('T')[0];
        console.log('Filtrage par date:', startDate, 'à', endDate);
        
        const response = await releves.getByDateRange(startDate, endDate);
        relevesData = response.data;
      } else {
        // Sinon, récupérer tous les relevés
        const response = await releves.getAll();
        relevesData = response.data;
      }

      console.log('Relevés récupérés:', relevesData.length);

      // Filtrer par terme de recherche si nécessaire
      if (searchTerm) {
        // Pour rechercher, on doit d'abord récupérer les détails des régions et maladies
        const filteredReleves = relevesData.filter(releve => {
          const regionName = regionsData.find(r => r.idRegion === releve.idRegion)?.nomEtat || '';
          const maladieName = maladiesData.find(m => m.idMaladie === releve.idMaladie)?.nomMaladie || '';
          
          return regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 maladieName.toLowerCase().includes(searchTerm.toLowerCase());
        });
        relevesData = filteredReleves;
      }

      // Calculer la pagination
      const totalItems = relevesData.length;
      const totalPagesCalculated = Math.ceil(totalItems / ITEMS_PER_PAGE);
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const pageData = relevesData.slice(startIndex, endIndex);

      // Enrichir les données avec les noms de région et maladie
      const enrichedData = pageData.map(releve => ({
        ...releve,
        region: { nomEtat: regionsData.find(r => r.idRegion === releve.idRegion)?.nomEtat || 'Région inconnue' },
        maladie: { nomMaladie: maladiesData.find(m => m.idMaladie === releve.idMaladie)?.nomMaladie || 'Maladie inconnue' }
      }));

      setCurrentReleves(enrichedData);
      setTotalPages(totalPagesCalculated);
      setCurrentPage(page);

      console.log('Page affichée:', page, 'Total pages:', totalPagesCalculated);
    } catch (error) {
      console.error('Erreur lors du chargement des relevés:', error);
      toast.error('Erreur lors du chargement des relevés');
      setCurrentReleves([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (regionsData.length > 0 && maladiesData.length > 0) {
      loadReleves(1);
    }
  }, [regionsData, maladiesData]);

  // Recharger quand les filtres changent
  useEffect(() => {
    if (regionsData.length > 0 && maladiesData.length > 0) {
      loadReleves(1);
    }
  }, [searchTerm, dateRange]);

  // Changer de page
  const handlePageChange = (page: number) => {
    console.log('Changement de page vers:', page);
    loadReleves(page);
  };

  // Fonction pour générer les numéros de pages à afficher
  const getVisiblePages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(MAX_VISIBLE_PAGES / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + MAX_VISIBLE_PAGES - 1, totalPages);

    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(end - MAX_VISIBLE_PAGES + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Ajouter un nouveau relevé
  const handleAddReleve = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReleve.dateReleve || !newReleve.idRegion || !newReleve.idMaladie) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      console.log('Création du relevé:', newReleve);
      await releves.create(newReleve);
      
      setIsAddDialogOpen(false);
      setNewReleve({
        dateReleve: '',
        idRegion: 0,
        idMaladie: 0,
        nbNouveauCas: 0,
        nbDeces: 0,
        nbGueri: 0,
        nbHospitalisation: 0,
        nbHospiSoinsIntensif: 0,
        nbVaccineTotalement: 0,
        nbSousRespirateur: 0,
        nbVaccine: 0,
        nbTeste: 0
      });
      
      toast.success("Relevé ajouté avec succès");
      
      // Recharger la première page
      loadReleves(1);
    } catch (error) {
      console.error('Erreur lors de la création du relevé:', error);
      toast.error('Erreur lors de la création du relevé');
    }
  };

  // Supprimer un relevé
  const handleDeleteReleve = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce relevé ?")) {
      try {
        console.log('Suppression du relevé:', id);
        await releves.delete(id);
        toast.success("Relevé supprimé avec succès");
        
        // Recharger la page courante
        loadReleves(currentPage);
      } catch (error) {
        console.error('Erreur lors de la suppression du relevé:', error);
        toast.error('Erreur lors de la suppression du relevé');
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relevés</h1>
            <p className="text-muted-foreground mt-1">
              Gestion des relevés épidémiologiques (5 par page)
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
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
                <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dateReleve" className="text-right">
                      Date *
                    </Label>
                    <Input
                      id="dateReleve"
                      type="date"
                      className="col-span-3"
                      value={newReleve.dateReleve}
                      onChange={(e) => setNewReleve({ ...newReleve, dateReleve: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="idRegion" className="text-right">
                      Région *
                    </Label>
                    <div className="col-span-3">
                      <Select 
                        value={newReleve.idRegion.toString()}
                        onValueChange={(value) => setNewReleve({ ...newReleve, idRegion: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {regionsData.map((region) => (
                            <SelectItem key={region.idRegion} value={region.idRegion.toString()}>
                              {region.nomEtat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="idMaladie" className="text-right">
                      Maladie *
                    </Label>
                    <div className="col-span-3">
                      <Select 
                        value={newReleve.idMaladie.toString()}
                        onValueChange={(value) => setNewReleve({ ...newReleve, idMaladie: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une maladie" />
                        </SelectTrigger>
                        <SelectContent>
                          {maladiesData.map((maladie) => (
                            <SelectItem key={maladie.idMaladie} value={maladie.idMaladie.toString()}>
                              {maladie.nomMaladie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nbNouveauCas" className="text-right">
                      Nouveaux cas
                    </Label>
                    <Input
                      id="nbNouveauCas"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbNouveauCas}
                      onChange={(e) => setNewReleve({ ...newReleve, nbNouveauCas: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nbDeces" className="text-right">
                      Décès
                    </Label>
                    <Input
                      id="nbDeces"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbDeces}
                      onChange={(e) => setNewReleve({ ...newReleve, nbDeces: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nbGueri" className="text-right">
                      Guérisons
                    </Label>
                    <Input
                      id="nbGueri"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbGueri}
                      onChange={(e) => setNewReleve({ ...newReleve, nbGueri: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nbHospitalisation" className="text-right">
                      Hospitalisations
                    </Label>
                    <Input
                      id="nbHospitalisation"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nbHospitalisation}
                      onChange={(e) => setNewReleve({ ...newReleve, nbHospitalisation: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Ajouter</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des relevés</CardTitle>
            <CardDescription>
              Consultation paginée des relevés épidémiologiques (5 par page)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par région ou maladie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  className="w-[300px]"
                />
                {dateRange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                  >
                    Effacer
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chargement des relevés...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Région</TableHead>
                      <TableHead>Maladie</TableHead>
                      <TableHead>Nouveaux cas</TableHead>
                      <TableHead>Décès</TableHead>
                      <TableHead>Guérisons</TableHead>
                      <TableHead>Hospitalisations</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReleves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Aucun relevé trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentReleves.map((releve) => (
                        <TableRow key={releve.idReleve}>
                          <TableCell>
                            {new Date(releve.dateReleve).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>{releve.region?.nomEtat}</TableCell>
                          <TableCell>{releve.maladie?.nomMaladie}</TableCell>
                          <TableCell>{releve.nbNouveauCas?.toLocaleString('fr-FR') || 0}</TableCell>
                          <TableCell>{releve.nbDeces?.toLocaleString('fr-FR') || 0}</TableCell>
                          <TableCell>{releve.nbGueri?.toLocaleString('fr-FR') || 0}</TableCell>
                          <TableCell>{releve.nbHospitalisation?.toLocaleString('fr-FR') || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReleve(releve.idReleve)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {/* Première page et ellipse si nécessaire */}
                        {getVisiblePages()[0] > 1 && (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(1)}
                                className="cursor-pointer"
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {getVisiblePages()[0] > 2 && (
                              <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                              </PaginationItem>
                            )}
                          </>
                        )}
                        
                        {/* Pages visibles */}
                        {getVisiblePages().map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === currentPage}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        {/* Ellipse et dernière page si nécessaire */}
                        {getVisiblePages()[getVisiblePages().length - 1] < totalPages && (
                          <>
                            {getVisiblePages()[getVisiblePages().length - 1] < totalPages - 1 && (
                              <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(totalPages)}
                                className="cursor-pointer"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                <div className="text-sm text-muted-foreground mt-4 text-center">
                  Page {currentPage} sur {totalPages} - Affichage de {currentReleves.length} relevé(s)
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
