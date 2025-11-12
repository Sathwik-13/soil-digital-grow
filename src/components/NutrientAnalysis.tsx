import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplets, Leaf, Bug, Sprout, AlertTriangle, CheckCircle } from "lucide-react";

interface NutrientAnalysisProps {
  soilPh: number;
  moisture: number;
  temperature: number;
}

const NutrientAnalysis = ({ soilPh, moisture, temperature }: NutrientAnalysisProps) => {
  // Calculate nutrient levels based on soil conditions
  const nitrogen = Math.min(100, Math.max(0, 70 + (soilPh - 6.5) * 10 + (moisture - 50) * 0.3));
  const phosphorus = Math.min(100, Math.max(0, 60 + (soilPh - 7) * -8 + (temperature - 25) * 1.5));
  const potassium = Math.min(100, Math.max(0, 75 + (moisture - 50) * 0.4));

  const getNutrientStatus = (level: number) => {
    if (level > 70) return { status: "Optimal", color: "bg-green-500", icon: CheckCircle };
    if (level > 40) return { status: "Moderate", color: "bg-yellow-500", icon: AlertTriangle };
    return { status: "Low", color: "bg-red-500", icon: AlertTriangle };
  };

  const nutrients = [
    { name: "Nitrogen (N)", level: nitrogen, icon: Sprout, unit: "ppm" },
    { name: "Phosphorus (P)", level: phosphorus, icon: Leaf, unit: "ppm" },
    { name: "Potassium (K)", level: potassium, icon: Droplets, unit: "ppm" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Soil Nutrient Analysis
        </CardTitle>
        <CardDescription>NPK levels and soil fertility indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {nutrients.map((nutrient) => {
          const status = getNutrientStatus(nutrient.level);
          const Icon = nutrient.icon;
          const StatusIcon = status.icon;
          
          return (
            <div key={nutrient.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{nutrient.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {status.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {nutrient.level.toFixed(0)} {nutrient.unit}
                  </span>
                </div>
              </div>
              <Progress value={nutrient.level} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NutrientAnalysis;