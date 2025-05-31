
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Interface pour les relevés
interface Releve {
  id: number;
  date: string;
  region: string;
  maladie: string;
  nouveauCas: number;
  deces: number;
  guerisons: number;
  hospitalisations: number;
}

// Données statiques d'exemple (simulant une base de données plus large)
const mockReleves: Releve[] = [
  {
    id: 1,
    date: '2024-01-15',
    region: 'Île-de-France',
    maladie: 'COVID-19',
    nouveauCas: 1245,
    deces: 45,
    guerisons: 980,
    hospitalisations: 230
  },
  {
    id: 2,
    date: '2024-01-16',
    region: 'Occitanie',
    maladie: 'COVID-19',
    nouveauCas: 890,
    deces: 25,
    guerisons: 760,
    hospitalisations: 150
  },
  {
    id: 3,
    date: '2024-01-17',
    region: 'Auvergne-Rhône-Alpes',
    maladie: 'Grippe',
    nouveauCas: 567,
    deces: 12,
    guerisons: 450,
    hospitalisations: 89
  },
  {
    id: 4,
    date: '2024-01-18',
    region: 'Provence-Alpes-Côte d\'Azur',
    maladie: 'COVID-19',
    nouveauCas: 423,
    deces: 18,
    guerisons: 390,
    hospitalisations: 67
  },
  {
    id: 5,
    date: '2024-01-19',
    region: 'Nouvelle-Aquitaine',
    maladie: 'Grippe',
    nouveauCas: 334,
    deces: 8,
    guerisons: 298,
    hospitalisations: 45
  },
  {
    id: 6,
    date: '2024-01-20',
    region: 'Hauts-de-France',
    maladie: 'COVID-19',
    nouveauCas: 678,
    deces: 22,
    guerisons: 589,
    hospitalisations: 112
  },
  {
    id: 7,
    date: '2024-01-21',
    region: 'Grand Est',
    maladie: 'Pneumonie',
    nouveauCas: 245,
    deces: 15,
    guerisons: 198,
    hospitalisations: 32
  },
  {
    id: 8,
    date: '2024-01-22',
    region: 'Pays de la Loire',
    maladie: 'COVID-19',
    nouveauCas: 512,
    deces: 19,
    guerisons: 445,
    hospitalisations: 78
  },
  {
    id: 9,
    date: '2024-01-23',
    region: 'Bretagne',
    maladie: 'Grippe',
    nouveauCas: 389,
    deces: 11,
    guerisons: 334,
    hospitalisations: 54
  },
  {
    id: 10,
    date: '2024-01-24',
    region: 'Normandie',
    maladie: 'COVID-19',
    nouveauCas: 456,
    deces: 16,
    guerisons: 398,
    hospitalisations: 69
  },
  {
    id: 11,
    date: '2024-01-25',
    region: 'Centre-Val de Loire',
    maladie: 'Pneumonie',
    nouveauCas: 198,
    deces: 7,
    guerisons: 167,
    hospitalisations: 28
  },
  {
    id: 12,
    date: '2024-01-26',
    region: 'Bourgogne-Franche-Comté',
    maladie: 'COVID-19',
    nouveauCas: 367,
    deces: 13,
    guerisons: 312,
    hospitalisations: 51
  }
];

const regions = ['Île-de-France', 'Occitanie', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur'];
const maladies = ['COVID-19', 'Grippe', 'Pneumonie'];

const ITEMS_PER_PAGE = 5;

export default function Releves() {
  const [allReleves, setAllReleves] = useState<Releve[]>(mockReleves);
  const [currentReleves, setCurrentReleves] = useState<Releve[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newReleve, setNewReleve] = useState({
    date: '',
    region: '',
    maladie: '',
    nouveauCas: 0,
    deces: 0,
    guerisons: 0,
    hospitalisations: 0
  });

  // Fonction pour filtrer les relevés selon les critères
  const getFilteredReleves = () => {
    let filtered = allReleves;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(releve =>
        releve.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        releve.maladie.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par plage de dates
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(releve => {
        const releveDate = new Date(releve.date);
        return releveDate >= dateRange.from! && releveDate <= dateRange.to!;
      });
    }

    return filtered;
  };

  // Fonction pour charger les relevés de la page courante
  const loadPageData = (page: number) => {
    setIsLoading(true);
    
    // Simuler un délai de chargement (comme une vraie API)
    setTimeout(() => {
      const filteredReleves = getFilteredReleves();
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const pageData = filteredReleves.slice(startIndex, endIndex);
      
      setCurrentReleves(pageData);
      setTotalPages(Math.ceil(filteredReleves.length / ITEMS_PER_PAGE));
      setIsLoading(false);
    }, 300);
  };

  // Charger les données initiales
  useEffect(() => {
    loadPageData(1);
  }, []);

  // Recharger quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
    loadPageData(1);
  }, [searchTerm, dateRange]);

  // Changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPageData(page);
  };

  // Ajouter un nouveau relevé
  const handleAddReleve = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReleve.date || !newReleve.region || !newReleve.maladie) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const nouveauReleve: Releve = {
      id: Date.now(),
      date: newReleve.date,
      region: newReleve.region,
      maladie: newReleve.maladie,
      nouveauCas: newReleve.nouveauCas,
      deces: newReleve.deces,
      guerisons: newReleve.guerisons,
      hospitalisations: newReleve.hospitalisations
    };

    setAllReleves([nouveauReleve, ...allReleves]);
    setIsAddDialogOpen(false);
    setNewReleve({
      date: '',
      region: '',
      maladie: '',
      nouveauCas: 0,
      deces: 0,
      guerisons: 0,
      hospitalisations: 0
    });
    toast.success("Relevé ajouté avec succès");
    
    // Recharger la première page
    setCurrentPage(1);
    loadPageData(1);
  };

  // Supprimer un relevé
  const handleDeleteReleve = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce relevé ?")) {
      setAllReleves(allReleves.filter(releve => releve.id !== id));
      toast.success("Relevé supprimé avec succès");
      
      // Recharger la page courante
      loadPageData(currentPage);
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
                    <Label htmlFor="date" className="text-right">
                      Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      className="col-span-3"
                      value={newReleve.date}
                      onChange={(e) => setNewReleve({ ...newReleve, date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="region" className="text-right">
                      Région *
                    </Label>
                    <div className="col-span-3">
                      <Select 
                        value={newReleve.region}
                        onValueChange={(value) => setNewReleve({ ...newReleve, region: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maladie" className="text-right">
                      Maladie *
                    </Label>
                    <div className="col-span-3">
                      <Select 
                        value={newReleve.maladie}
                        onValueChange={(value) => setNewReleve({ ...newReleve, maladie: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une maladie" />
                        </SelectTrigger>
                        <SelectContent>
                          {maladies.map((maladie) => (
                            <SelectItem key={maladie} value={maladie}>
                              {maladie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nouveauCas" className="text-right">
                      Nouveaux cas
                    </Label>
                    <Input
                      id="nouveauCas"
                      type="number"
                      className="col-span-3"
                      value={newReleve.nouveauCas}
                      onChange={(e) => setNewReleve({ ...newReleve, nouveauCas: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deces" className="text-right">
                      Décès
                    </Label>
                    <Input
                      id="deces"
                      type="number"
                      className="col-span-3"
                      value={newReleve.deces}
                      onChange={(e) => setNewReleve({ ...newReleve, deces: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guerisons" className="text-right">
                      Guérisons
                    </Label>
                    <Input
                      id="guerisons"
                      type="number"
                      className="col-span-3"
                      value={newReleve.guerisons}
                      onChange={(e) => setNewReleve({ ...newReleve, guerisons: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hospitalisations" className="text-right">
                      Hospitalisations
                    </Label>
                    <Input
                      id="hospitalisations"
                      type="number"
                      className="col-span-3"
                      value={newReleve.hospitalisations}
                      onChange={(e) => setNewReleve({ ...newReleve, hospitalisations: parseInt(e.target.value) || 0 })}
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
                        <TableRow key={releve.id}>
                          <TableCell>
                            {new Date(releve.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>{releve.region}</TableCell>
                          <TableCell>{releve.maladie}</TableCell>
                          <TableCell>{releve.nouveauCas.toLocaleString('fr-FR')}</TableCell>
                          <TableCell>{releve.deces.toLocaleString('fr-FR')}</TableCell>
                          <TableCell>{releve.guerisons.toLocaleString('fr-FR')}</TableCell>
                          <TableCell>{releve.hospitalisations.toLocaleString('fr-FR')}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReleve(releve.id)}
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
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                  Page {currentPage} sur {totalPages} - Affichage de {currentReleves.length} relevé(s) sur {getFilteredReleves().length} au total
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
