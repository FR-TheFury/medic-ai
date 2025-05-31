
import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileBarChart, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

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

// Données statiques d'exemple
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
  }
];

const regions = ['Île-de-France', 'Occitanie', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur'];
const maladies = ['COVID-19', 'Grippe', 'Pneumonie'];

export default function Releves() {
  const [releves, setReleves] = useState<Releve[]>(mockReleves);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReleve, setNewReleve] = useState({
    date: '',
    region: '',
    maladie: '',
    nouveauCas: 0,
    deces: 0,
    guerisons: 0,
    hospitalisations: 0
  });

  // Filtrer les relevés selon le terme de recherche
  const filteredReleves = releves.filter(releve =>
    releve.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    releve.maladie.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

    setReleves([...releves, nouveauReleve]);
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
  };

  // Supprimer un relevé
  const handleDeleteReleve = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce relevé ?")) {
      setReleves(releves.filter(releve => releve.id !== id));
      toast.success("Relevé supprimé avec succès");
    }
  };

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
              Gestion et consultation des relevés épidémiologiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par région ou maladie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

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
                {filteredReleves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Aucun relevé trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReleves.map((releve) => (
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
