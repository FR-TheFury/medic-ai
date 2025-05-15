
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import DataChart from '@/components/dashboard/DataChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Users, Heart, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { pays, regions, releves, maladies } from '@/lib/api';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMaladie, setSelectedMaladie] = useState<number | null>(null);
  const [statsData, setStatsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  
  // État pour le sélecteur de dates
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    return {
      from: startDate,
      to: today,
    };
  });

  // Fetch regions for dropdown
  const { data: regionsData, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regions.getAll(),
  });

  // Fetch maladies for filtering
  const { data: maladiesData, isLoading: maladiesLoading } = useQuery({
    queryKey: ['maladies'],
    queryFn: () => maladies.getAll(),
  });

  // Set default maladie ID once data is loaded
  useEffect(() => {
    if (maladiesData?.data && maladiesData.data.length > 0 && !selectedMaladie) {
      setSelectedMaladie(maladiesData.data[0].idMaladie);
    }
  }, [maladiesData, selectedMaladie]);

  // Formater les dates pour l'API
  const formattedStartDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const formattedEndDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
  
  // Fetch releves data based on selected region and dates
  const { data: relevesData, isLoading: relevesLoading, error: relevesError } = useQuery({
    queryKey: ['releves', selectedRegion, formattedStartDate, formattedEndDate],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        return { data: [] };
      }
      
      if (selectedRegion === 'all') {
        return releves.getByDateRange(formattedStartDate, formattedEndDate);
      } else {
        const regionId = parseInt(selectedRegion);
        return releves.getByRegionAndDateRange(regionId, formattedStartDate, formattedEndDate);
      }
    },
    enabled: !!selectedMaladie && !!dateRange?.from && !!dateRange?.to,
  });

  // Fetch top countries with most cases
  const { data: paysData, isLoading: paysLoading } = useQuery({
    queryKey: ['pays'],
    queryFn: () => pays.getAll(),
  });

  // Process data when API responses change
  useEffect(() => {
    if (relevesError) {
      toast({
        title: "Erreur lors du chargement des données",
        description: "Impossible de charger les données de relevés. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }

    if (relevesData?.data) {
      // Process data for chart
      const processedChartData = processChartData(relevesData.data);
      setChartData(processedChartData);
      
      // Process data for stats cards
      const processedStatsData = processStatsData(relevesData.data);
      setStatsData(processedStatsData);
    }

    if (paysData?.data && relevesData?.data) {
      // Process data for top countries
      const processedTopCountries = processTopCountriesData(paysData.data, relevesData.data);
      setTopCountries(processedTopCountries);
    }
  }, [relevesData, paysData, relevesError]);

  // Helper function to process chart data
  const processChartData = (releves) => {
    // Group the releves by month
    const groupedByMonth = releves.reduce((acc, releve) => {
      const date = releve.dateReleve.substring(0, 7); // Format: "YYYY-MM"
      if (!acc[date]) {
        acc[date] = {
          nouveauxCas: 0,
          deces: 0,
          gueris: 0,
        };
      }
      
      acc[date].nouveauxCas += releve.nbNouveauCas || 0;
      acc[date].deces += releve.nbDeces || 0;
      acc[date].gueris += releve.nbGueri || 0;
      
      return acc;
    }, {});
    
    // Convert to array format for the chart
    return Object.keys(groupedByMonth).map(date => ({
      date,
      nouveauxCas: groupedByMonth[date].nouveauxCas,
      deces: groupedByMonth[date].deces,
      gueris: groupedByMonth[date].gueris,
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Helper function to process stats data
  const processStatsData = (releves) => {
    // Filter releves to get only last 7 days
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekFormatted = format(lastWeekDate, 'yyyy-MM-dd');
    
    const lastWeekReleves = releves.filter(r => r.dateReleve >= lastWeekFormatted);
    const allReleves = releves;
    
    // Calculate stats
    const newCases = lastWeekReleves.reduce((sum, r) => sum + (r.nbNouveauCas || 0), 0);
    const activeCases = allReleves.reduce((sum, r) => sum + ((r.nbNouveauCas || 0) - (r.nbGueri || 0) - (r.nbDeces || 0)), 0);
    
    // Calculate recovery and mortality rates
    const totalCases = allReleves.reduce((sum, r) => sum + (r.nbNouveauCas || 0), 0);
    const totalRecovered = allReleves.reduce((sum, r) => sum + (r.nbGueri || 0), 0);
    const totalDeaths = allReleves.reduce((sum, r) => sum + (r.nbDeces || 0), 0);
    
    const recoveryRate = totalCases > 0 ? (totalRecovered / totalCases) * 100 : 0;
    const mortalityRate = totalCases > 0 ? (totalDeaths / totalCases) * 100 : 0;
    
    // Calculate trends (compare with previous period)
    const previousWeekDate = new Date(lastWeekDate);
    previousWeekDate.setDate(previousWeekDate.getDate() - 7);
    const previousWeekFormatted = format(previousWeekDate, 'yyyy-MM-dd');
    
    const previousWeekReleves = releves.filter(r => r.dateReleve >= previousWeekFormatted && r.dateReleve < lastWeekFormatted);
    
    const previousNewCases = previousWeekReleves.reduce((sum, r) => sum + (r.nbNouveauCas || 0), 0);
    const newCasesTrend = previousNewCases > 0 ? ((newCases - previousNewCases) / previousNewCases) * 100 : 0;
    
    return [
      {
        title: 'Nouveaux cas',
        value: newCases.toLocaleString(),
        description: 'Dans les 7 derniers jours',
        icon: <Activity />,
        trend: { value: Math.abs(newCasesTrend).toFixed(1), isPositive: newCasesTrend <= 0 },
      },
      {
        title: 'Cas actifs',
        value: Math.max(0, activeCases).toLocaleString(),
        description: 'Dans le monde entier',
        icon: <Users />,
        trend: { value: 0, isPositive: true }, // Placeholder as we don't track trend for active cases
      },
      {
        title: 'Taux de guérison',
        value: `${recoveryRate.toFixed(1)}%`,
        description: 'Sur tous les cas confirmés',
        icon: <Heart />,
        trend: { value: 0, isPositive: true }, // Placeholder
      },
      {
        title: 'Taux de mortalité',
        value: `${mortalityRate.toFixed(1)}%`,
        description: 'Sur tous les cas confirmés',
        icon: <AlertCircle />,
        trend: { value: 0, isPositive: true }, // Placeholder
      },
    ];
  };

  // Helper function to process top countries data
  const processTopCountriesData = (paysData, relevesData) => {
    // Create map of region ids to country ids
    const regionToCountry = {};
    if (regionsData?.data) {
      regionsData.data.forEach(region => {
        regionToCountry[region.idRegion] = region.idPays;
      });
    }
    
    // Group releves by country
    const countryCases = {};
    relevesData.forEach(releve => {
      const countryId = regionToCountry[releve.idRegion];
      if (!countryId) return;
      
      if (!countryCases[countryId]) {
        countryCases[countryId] = { cases: 0, deaths: 0 };
      }
      
      countryCases[countryId].cases += releve.nbNouveauCas || 0;
      countryCases[countryId].deaths += releve.nbDeces || 0;
    });
    
    // Map country ids to names and create top countries array
    const countriesWithNames = paysData.map(country => {
      const stats = countryCases[country.idPays] || { cases: 0, deaths: 0 };
      return {
        id: country.idPays,
        name: country.nomPays,
        cases: stats.cases,
        deaths: stats.deaths
      };
    });
    
    // Sort by cases and take top 5
    return countriesWithNames
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 5);
  };

  // Loading state for the dashboard
  if (maladiesLoading || (regionsLoading && selectedRegion !== 'all')) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </MainLayout>
    );
  }

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
          
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            <DateRangePicker 
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              className="w-full md:w-auto"
            />
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regionsData?.data?.map(region => (
                  <SelectItem key={region.idRegion} value={region.idRegion.toString()}>
                    {region.nomEtat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.length > 0 ? (
            statsData.map((stat, index) => (
              <StatsCard 
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))
          ) : (
            relevesLoading ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)
            ) : (
              <p className="text-muted-foreground col-span-4 text-center py-8">
                Aucune donnée disponible pour la période sélectionnée
              </p>
            )
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {chartData.length > 0 ? (
            <DataChart 
              title="Évolution des cas"
              description={`Tendance du ${dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : ''} au ${dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : ''}`}
              data={chartData}
              lines={[
                { dataKey: 'nouveauxCas', color: '#2563eb', name: 'Nouveaux cas' },
                { dataKey: 'deces', color: '#dc2626', name: 'Décès' },
                { dataKey: 'gueris', color: '#16a34a', name: 'Guérisons' },
              ]}
            />
          ) : (
            relevesLoading ? (
              <Skeleton className="h-80 lg:col-span-2" />
            ) : (
              <div className="lg:col-span-2 flex items-center justify-center p-12 border rounded-lg">
                <p className="text-muted-foreground">
                  Aucune donnée disponible pour créer le graphique
                </p>
              </div>
            )
          )}
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Pays les plus touchés</CardTitle>
              <CardDescription>
                Top 5 des pays avec le plus de cas confirmés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCountries.length > 0 ? (
                topCountries.map((country) => (
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
                      {country.deaths > 0 && country.cases > 0 ? 
                        Math.round((country.deaths / country.cases) * 100 * 10) / 10 : 0}%
                    </div>
                  </div>
                ))
              ) : (
                paysLoading ? (
                  <Skeleton className="h-60" />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune donnée disponible sur les pays
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
