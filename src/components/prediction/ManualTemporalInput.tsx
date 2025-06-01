
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Edit3, Save } from 'lucide-react';

interface TemporalData {
  nbNouveauCas: number[];
  nbDeces: number[];
  nbHospitalisation: number[];
  nbHospiSoinsIntensif: number[];
  nbTeste: number[];
  dates: string[];
}

interface ManualTemporalInputProps {
  data: TemporalData;
  onChange: (data: TemporalData) => void;
}

export default function ManualTemporalInput({ data, onChange }: ManualTemporalInputProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const generateDates = () => {
    const dates = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate.toISOString().split('T')[0]);
    }

    return dates;
  };

  const initializeData = () => {
    const newData = {
      nbNouveauCas: Array(30).fill(0),
      nbDeces: Array(30).fill(0),
      nbHospitalisation: Array(30).fill(0),
      nbHospiSoinsIntensif: Array(30).fill(0),
      nbTeste: Array(30).fill(0),
      dates: generateDates()
    };
    onChange(newData);
  };

  const updateValue = (day: number, field: keyof TemporalData, value: string) => {
    if (field === 'dates') {
      const newDates = [...data.dates];
      newDates[day] = value;
      onChange({ ...data, dates: newDates });
    } else {
      const newValues = [...(data[field] as number[])];
      newValues[day] = parseInt(value) || 0;
      onChange({ ...data, [field]: newValues });
    }
  };

  if (data.dates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Saisie manuelle des données temporelles
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Aucune donnée saisie. Cliquez pour initialiser 30 jours de données.
          </p>
          <Button onClick={initializeData}>
            <Calendar className="mr-2 h-4 w-4" />
            Initialiser 30 jours
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Saisie manuelle - 30 jours de données
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table">Vue tableau</TabsTrigger>
            <TabsTrigger value="form">Saisie par jour</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Nouveaux cas</th>
                    <th className="text-left p-2">Décès</th>
                    <th className="text-left p-2">Hospitalisations</th>
                    <th className="text-left p-2">Soins intensifs</th>
                    <th className="text-left p-2">Tests</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dates.map((date, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{new Date(date).toLocaleDateString('fr-FR')}</td>
                      <td className="p-2">{data.nbNouveauCas[index]}</td>
                      <td className="p-2">{data.nbDeces[index]}</td>
                      <td className="p-2">{data.nbHospitalisation[index]}</td>
                      <td className="p-2">{data.nbHospiSoinsIntensif[index]}</td>
                      <td className="p-2">{data.nbTeste[index]}</td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDay(index)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="form" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jour à modifier</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={editingDay !== null ? editingDay + 1 : ''}
                  onChange={(e) => {
                    const day = parseInt(e.target.value) - 1;
                    if (day >= 0 && day < 30) {
                      setEditingDay(day);
                    }
                  }}
                  placeholder="Numéro du jour (1-30)"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editingDay !== null ? data.dates[editingDay] : ''}
                  onChange={(e) => editingDay !== null && updateValue(editingDay, 'dates', e.target.value)}
                  disabled={editingDay === null}
                />
              </div>
            </div>

            {editingDay !== null && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Nouveaux cas</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nbNouveauCas[editingDay]}
                    onChange={(e) => updateValue(editingDay, 'nbNouveauCas', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Décès</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nbDeces[editingDay]}
                    onChange={(e) => updateValue(editingDay, 'nbDeces', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hospitalisations</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nbHospitalisation[editingDay]}
                    onChange={(e) => updateValue(editingDay, 'nbHospitalisation', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Soins intensifs</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nbHospiSoinsIntensif[editingDay]}
                    onChange={(e) => updateValue(editingDay, 'nbHospiSoinsIntensif', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tests</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.nbTeste[editingDay]}
                    onChange={(e) => updateValue(editingDay, 'nbTeste', e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => setEditingDay(null)} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {data.dates.length} jours de données saisies
          </div>
          <Button variant="outline" onClick={initializeData}>
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
