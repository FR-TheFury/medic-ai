
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface DataPoint {
  name: string;
  value: number;
}

interface PredictionChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  isLoading?: boolean;
  error?: string;
}

export default function PredictionChart({ 
  title, 
  description, 
  data, 
  isLoading = false,
  error
}: PredictionChartProps) {
  const config = {
    actual: { label: "Données réelles", color: "#9b87f5" },
    predicted: { label: "Prédiction", color: "#F97316" }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">
            {error ? error : "Aucune donnée à afficher"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Générer des données historiques simulées
  const generateHistoricalData = (predictionValue: number) => {
    // Créer 5 points de données pour les 5 mois précédents
    const historicalData = [];
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    const currentMonth = new Date().getMonth();
    
    // Valeurs aléatoires autour de la valeur de prédiction
    const baseValue = predictionValue * 0.8;
    
    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonth - 5 + i) % 12;
      const monthName = months[monthIndex >= 0 ? monthIndex : monthIndex + 12];
      
      historicalData.push({
        name: monthName,
        actual: Math.round(baseValue + (Math.random() * 0.4 * predictionValue)),
        predicted: null
      });
    }
    
    // Ajouter la valeur prédite pour le mois courant
    historicalData.push({
      name: months[currentMonth],
      actual: null,
      predicted: predictionValue
    });
    
    return historicalData;
  };

  const chartData = generateHistoricalData(data[0]?.value || 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ChartContainer config={config}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey="name"
                    labelKey="name"
                  />
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#9b87f5"
                name="Données réelles"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#F97316"
                name="Prédiction"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
