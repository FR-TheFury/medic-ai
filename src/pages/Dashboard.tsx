
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import DataChart from '@/components/dashboard/DataChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Users, Heart, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  // Mock data for demonstration purposes
  const statsData = [
    {
      title: 'Nouveaux cas',
      value: '2,345',
      description: 'Dans les 7 derniers jours',
      icon: <Activity />,
      trend: { value: 12.5, isPositive: false },
    },
    {
      title: 'Cas actifs',
      value: '18,756',
      description: 'Dans le monde entier',
      icon: <Users />,
      trend: { value: 8.2, isPositive: false },
    },
    {
      title: 'Taux de guérison',
      value: '92.3%',
      description: 'Sur tous les cas confirmés',
      icon: <Heart />,
      trend: { value: 3.1, isPositive: true },
    },
    {
      title: 'Taux de mortalité',
      value: '1.8%',
      description: 'Sur tous les cas confirmés',
      icon: <AlertCircle />,
      trend: { value: 0.4, isPositive: false },
    },
  ];
  
  // Mock chart data
  const chartData = [
    { date: '2023-01', nouveauxCas: 1200, deces: 45, gueris: 980 },
    { date: '2023-02', nouveauxCas: 1800, deces: 78, gueris: 1400 },
    { date: '2023-03', nouveauxCas: 2400, deces: 120, gueris: 1950 },
    { date: '2023-04', nouveauxCas: 3100, deces: 165, gueris: 2600 },
    { date: '2023-05', nouveauxCas: 2700, deces: 135, gueris: 2300 },
    { date: '2023-06', nouveauxCas: 2300, deces: 98, gueris: 2100 },
    { date: '2023-07', nouveauxCas: 1900, deces: 76, gueris: 1750 },
    { date: '2023-08', nouveauxCas: 1500, deces: 56, gueris: 1400 },
    { date: '2023-09', nouveauxCas: 1800, deces: 67, gueris: 1650 },
    { date: '2023-10', nouveauxCas: 2100, deces: 89, gueris: 1850 },
    { date: '2023-11', nouveauxCas: 2400, deces: 110, gueris: 2100 },
    { date: '2023-12', nouveauxCas: 2000, deces: 85, gueris: 1800 },
  ];
  
  // Mock top affected countries
  const topCountries = [
    { id: 1, name: 'France', cases: 3245678, deaths: 154789 },
    { id: 2, name: 'Allemagne', cases: 3098765, deaths: 142567 },
    { id: 3, name: 'Italie', cases: 2876543, deaths: 137890 },
    { id: 4, name: 'Espagne', cases: 2654321, deaths: 128765 },
    { id: 5, name: 'Royaume-Uni', cases: 2543210, deaths: 124321 },
  ];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble de la situation pandémique mondiale
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="americas">Amériques</SelectItem>
                <SelectItem value="asia">Asie</SelectItem>
                <SelectItem value="africa">Afrique</SelectItem>
                <SelectItem value="oceania">Océanie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatsCard 
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DataChart 
            title="Évolution des cas"
            description="Tendance sur les 12 derniers mois"
            data={chartData}
            lines={[
              { dataKey: 'nouveauxCas', color: '#2563eb', name: 'Nouveaux cas' },
              { dataKey: 'deces', color: '#dc2626', name: 'Décès' },
              { dataKey: 'gueris', color: '#16a34a', name: 'Guérisons' },
            ]}
          />
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Pays les plus touchés</CardTitle>
              <CardDescription>
                Top 5 des pays avec le plus de cas confirmés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCountries.map((country) => (
                <div key={country.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{country.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {country.cases.toLocaleString()} cas
                      </Badge>
                      <Badge variant="outline" className="text-xs text-destructive">
                        {country.deaths.toLocaleString()} décès
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {Math.round((country.deaths / country.cases) * 100 * 10) / 10}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
