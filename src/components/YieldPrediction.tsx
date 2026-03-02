import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout } from "lucide-react";
import { 
  CROP_DATA, 
  getCurrentStage, 
  getOverallProgress,
  calculatePlantHealth,
  getExpectedHeight,
} from "@/data/cropData";
import tomatoImage from "@/assets/tomato-field.jpg";
import chiliImage from "@/assets/chili-field.jpg";
import brinjalImage from "@/assets/brinjal-field.jpg";

interface YieldPredictionProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
  humidity: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  selectedCrop: string;
  currentWeek: number;
}

const cropImages: Record<string, string> = {
  tomato: tomatoImage,
  chili: chiliImage,
  brinjal: brinjalImage,
};

// Circular progress ring component
const CircularGauge = ({ 
  value, 
  label, 
  displayValue, 
  size = 90,
  color = "hsl(160, 80%, 50%)" 
}: { 
  value: number; 
  label: string; 
  displayValue: string; 
  size?: number;
  color?: string;
}) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{displayValue}</span>
        </div>
      </div>
    </div>
  );
};

// Vertical sensor bar
const SensorBar = ({ 
  label, 
  value, 
  unit, 
  max,
  color = "hsl(160, 80%, 50%)" 
}: { 
  label: string; 
  value: number; 
  unit: string; 
  max: number;
  color?: string;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <div className="relative w-2 h-16 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute bottom-0 w-full rounded-full transition-all duration-500"
          style={{ height: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-sm font-bold text-foreground">{value}{unit}</p>
    </div>
  );
};

const YieldPrediction = ({
  moisture,
  temperature,
  soilPh,
  lightIntensity,
  humidity,
  nitrogen,
  phosphorus,
  potassium,
  selectedCrop,
  currentWeek,
}: YieldPredictionProps) => {
  const crop = CROP_DATA[selectedCrop];

  const metrics = useMemo(() => {
    if (!crop) return null;
    const health = calculatePlantHealth(selectedCrop, moisture, temperature, soilPh, humidity, lightIntensity);
    const overallProgress = getOverallProgress(selectedCrop, currentWeek);
    const currentStage = getCurrentStage(selectedCrop, currentWeek);
    const expectedHeight = getExpectedHeight(selectedCrop, currentWeek);
    const stageIndex = currentStage ? crop.stages.indexOf(currentStage) : 0;
    
    // Ripening progress: based on stage progression (fruiting stages = higher ripening)
    const ripenessProgress = stageIndex >= 3 
      ? Math.min(100, 40 + (overallProgress - 60) * 2.5)
      : stageIndex >= 2 
        ? Math.min(40, overallProgress * 0.6)
        : Math.min(15, overallProgress * 0.3);

    // Disease risk based on environmental conditions
    let diseaseScore = 0;
    if (humidity > 80) diseaseScore += 30;
    if (humidity > 70) diseaseScore += 10;
    if (temperature > 32) diseaseScore += 15;
    if (temperature < 18) diseaseScore += 10;
    if (moisture > 75) diseaseScore += 20;
    if (soilPh < 5.5 || soilPh > 7.5) diseaseScore += 15;
    diseaseScore = Math.min(100, diseaseScore);
    
    const diseaseLevel = diseaseScore > 60 ? "High" : diseaseScore > 30 ? "Medium" : "Low";

    // Predicted yield change based on health
    const yieldChange = health >= 85 ? Math.round((health - 70) * 0.6) 
      : health >= 60 ? Math.round((health - 70) * 0.4)
      : -Math.round((70 - health) * 0.5);

    return { health, overallProgress, ripenessProgress, diseaseScore, diseaseLevel, yieldChange, currentStage, expectedHeight };
  }, [selectedCrop, moisture, temperature, soilPh, humidity, lightIntensity, currentWeek, crop]);

  if (!crop || !metrics) return null;

  const healthColor = metrics.health >= 70 ? "hsl(160, 80%, 45%)" : metrics.health >= 50 ? "hsl(45, 90%, 50%)" : "hsl(0, 70%, 55%)";
  const diseaseColor = metrics.diseaseScore <= 30 ? "hsl(160, 80%, 45%)" : metrics.diseaseScore <= 60 ? "hsl(45, 90%, 50%)" : "hsl(0, 70%, 55%)";

  return (
    <Card className="col-span-full overflow-hidden border-2 animate-fade-in">
      <CardContent className="p-0">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/90 to-transparent p-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">
                {crop.icon} {crop.name} — Soil Digital Twin
              </h3>
              <Badge variant="secondary" className="ml-auto">
                Week {currentWeek}/{crop.totalDuration}
              </Badge>
            </div>
          </div>

          {/* Main layout */}
          <div className="relative h-[380px]">
            {/* Background crop image */}
            <img 
              src={cropImages[selectedCrop] || tomatoImage} 
              alt={crop.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-background/85" />

            {/* Left: Sensor readings */}
            <div className="absolute left-4 top-16 bottom-4 z-10 flex flex-col justify-center">
              <div className="bg-card/80 backdrop-blur-md rounded-xl p-3 border border-border/50 space-y-3">
                <SensorBar label="Temp" value={temperature} unit="°C" max={45} color="hsl(0, 70%, 55%)" />
                <SensorBar label="Moisture" value={moisture} unit="%" max={100} color="hsl(210, 70%, 55%)" />
                <SensorBar label="pH" value={soilPh} unit="" max={14} color="hsl(45, 80%, 50%)" />
                <SensorBar label="Humidity" value={humidity} unit="%" max={100} color="hsl(160, 60%, 50%)" />
              </div>
            </div>

            {/* Right: Circular gauges */}
            <div className="absolute right-4 top-16 bottom-4 z-10 flex flex-col justify-center">
              <div className="bg-card/80 backdrop-blur-md rounded-xl p-3 border border-border/50 space-y-2">
                <CircularGauge 
                  label="Plant Health" 
                  value={metrics.health} 
                  displayValue={`${metrics.health}%`}
                  color={healthColor}
                />
                <CircularGauge 
                  label="Ripening" 
                  value={metrics.ripenessProgress} 
                  displayValue={`${Math.round(metrics.ripenessProgress)}%`}
                  color="hsl(160, 80%, 45%)"
                />
                <CircularGauge 
                  label="Disease Risk" 
                  value={metrics.diseaseScore} 
                  displayValue={metrics.diseaseLevel}
                  color={diseaseColor}
                />
                <div className="flex flex-col items-center pt-1">
                  <p className="text-xs text-muted-foreground font-medium">Predicted Yield</p>
                  <p className={`text-xl font-bold ${metrics.yieldChange >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {metrics.yieldChange >= 0 ? '+' : ''}{metrics.yieldChange}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Growth timeline */}
          <div className="bg-card border-t border-border px-4 py-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {crop.stages.map((stage, idx) => {
                const isActive = metrics.currentStage?.name === stage.name;
                const isPast = currentWeek > stage.endWeek;
                return (
                  <div key={stage.name} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                        isPast ? 'bg-primary text-primary-foreground' 
                        : isActive ? 'bg-accent text-accent-foreground ring-2 ring-accent/50' 
                        : 'bg-muted text-muted-foreground'
                      }`}>
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[9px] max-w-[60px] text-center leading-tight ${
                        isActive ? 'font-bold text-foreground' : 'text-muted-foreground'
                      }`}>
                        {stage.name.split(' ')[0]}
                      </span>
                    </div>
                    {idx < crop.stages.length - 1 && (
                      <div className={`w-6 h-0.5 mx-0.5 ${isPast ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YieldPrediction;
