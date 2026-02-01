import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Clock, Thermometer, Sun, Flame } from "lucide-react";

interface RipenessStage {
  name: string;
  color: string;
  description: string;
  daysFromGreen: number;
  percentage: number;
  scovilleRange: string;
}

const CHILI_RIPENESS_STAGES: RipenessStage[] = [
  { name: "Immature Green", color: "#81C784", description: "Young pepper, still developing, mild flavor", daysFromGreen: 0, percentage: 0, scovilleRange: "500-1,000" },
  { name: "Mature Green", color: "#4CAF50", description: "Full size, crisp texture, tangy flavor", daysFromGreen: 5, percentage: 20, scovilleRange: "1,000-2,500" },
  { name: "Breaking", color: "#8BC34A", description: "First hints of color change appearing", daysFromGreen: 8, percentage: 35, scovilleRange: "2,500-5,000" },
  { name: "Yellow/Orange", color: "#FF9800", description: "Transitioning, sweeter and hotter", daysFromGreen: 12, percentage: 55, scovilleRange: "5,000-15,000" },
  { name: "Light Red", color: "#FF5722", description: "Nearly ripe, developing full heat", daysFromGreen: 15, percentage: 75, scovilleRange: "15,000-30,000" },
  { name: "Deep Red", color: "#D32F2F", description: "Fully ripe, maximum heat and sweetness", daysFromGreen: 18, percentage: 100, scovilleRange: "30,000-50,000" },
];

interface ChiliRipenessProps {
  temperature: number;
  moisture: number;
  currentWeek: number;
}

const ChiliRipeness: React.FC<ChiliRipenessProps> = ({
  temperature,
  moisture,
  currentWeek,
}) => {
  const [daysIntoRipening, setDaysIntoRipening] = useState(0);
  const predictionDays = [5, 10, 15];

  // Calculate ripening speed factor based on temperature
  // Chili optimal ripening: 25-30°C (they like it hotter than tomatoes)
  // Below 15°C: ripening slows significantly
  // Above 35°C: stress, slower ripening
  const calculateRipeningSpeed = (temp: number): number => {
    if (temp < 15) return 0.2;
    if (temp >= 25 && temp <= 30) return 1.0;
    if (temp > 30 && temp <= 35) return 0.9;
    if (temp > 35) return 0.6;
    if (temp >= 15 && temp < 25) return 0.4 + ((temp - 15) / 10) * 0.6;
    return 1.0;
  };

  const ripeningSpeed = calculateRipeningSpeed(temperature);

  // Get current ripeness stage based on days
  const getCurrentStage = (days: number): RipenessStage => {
    const adjustedDays = days * ripeningSpeed;
    for (let i = CHILI_RIPENESS_STAGES.length - 1; i >= 0; i--) {
      if (adjustedDays >= CHILI_RIPENESS_STAGES[i].daysFromGreen) {
        return CHILI_RIPENESS_STAGES[i];
      }
    }
    return CHILI_RIPENESS_STAGES[0];
  };

  // Get ripeness percentage
  const getRipenessPercentage = (days: number): number => {
    const adjustedDays = days * ripeningSpeed;
    const maxDays = 18;
    return Math.min(100, (adjustedDays / maxDays) * 100);
  };

  // Predict future stage
  const predictFutureStage = (currentDays: number, futureDays: number): RipenessStage => {
    return getCurrentStage(currentDays + futureDays);
  };

  const currentStage = getCurrentStage(daysIntoRipening);
  const currentPercentage = getRipenessPercentage(daysIntoRipening);

  // Chili fruit development starts around week 14
  const isFruitDevelopmentStage = currentWeek >= 14;

  useEffect(() => {
    if (currentWeek >= 14 && currentWeek <= 20) {
      const weeksIntoFruitDev = currentWeek - 14;
      setDaysIntoRipening(Math.min(18, weeksIntoFruitDev * 3));
    }
  }, [currentWeek]);

  // Calculate heat level indicator
  const getHeatLevel = (stage: RipenessStage): number => {
    const stageIndex = CHILI_RIPENESS_STAGES.indexOf(stage);
    return ((stageIndex + 1) / CHILI_RIPENESS_STAGES.length) * 100;
  };

  if (!isFruitDevelopmentStage) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🌶️ Chili Ripeness Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Ripeness tracking available from Week 14</p>
            <p className="text-xs mt-1">(Fruit Development Stage)</p>
            <p className="text-xs mt-2">Current: Week {currentWeek}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🌶️ Chili Ripeness Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Ripeness Status */}
        <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Current Ripeness</span>
            <Badge 
              style={{ 
                backgroundColor: currentStage.color, 
                color: currentStage.name.includes("Green") ? "#000" : "#fff" 
              }}
            >
              {currentStage.name}
            </Badge>
          </div>
          
          {/* Visual Ripeness Bar */}
          <div className="relative mb-3">
            <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
              {CHILI_RIPENESS_STAGES.map((stage, idx) => (
                <div
                  key={stage.name}
                  className={`flex-1 transition-all duration-300 ${
                    idx <= CHILI_RIPENESS_STAGES.indexOf(currentStage) ? "opacity-100" : "opacity-30"
                  }`}
                  style={{ backgroundColor: stage.color }}
                  title={stage.name}
                />
              ))}
            </div>
          </div>

          <Progress value={currentPercentage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">{currentStage.description}</p>
        </div>

        {/* Heat Level Indicator */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Heat Level</span>
            </div>
            <span className="text-xs font-mono">{currentStage.scovilleRange} SHU</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600 overflow-hidden">
            <div 
              className="h-full bg-white/50 transition-all duration-500"
              style={{ width: `${100 - getHeatLevel(currentStage)}%`, marginLeft: 'auto' }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
            <span>Mild</span>
            <span>Medium</span>
            <span>Hot</span>
          </div>
        </div>

        {/* Days Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Days into ripening:</span>
            <span className="font-medium">{daysIntoRipening.toFixed(1)} days</span>
          </div>
          <Slider
            value={[daysIntoRipening]}
            onValueChange={(v) => setDaysIntoRipening(v[0])}
            min={0}
            max={20}
            step={0.5}
            className="py-2"
          />
        </div>

        {/* Environmental Factors */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white/30 dark:bg-black/10">
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span>{temperature}°C</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span>Speed: {(ripeningSpeed * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Ripening Speed Info */}
        <div className={`p-3 rounded-lg text-sm ${
          ripeningSpeed >= 0.9 
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
            : ripeningSpeed >= 0.5 
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
        }`}>
          {ripeningSpeed >= 0.9 && (
            <p>✓ Optimal temperature for chili ripening (25-30°C)</p>
          )}
          {ripeningSpeed >= 0.5 && ripeningSpeed < 0.9 && (
            <p>⚠ Moderate ripening speed - chilies prefer warmer conditions</p>
          )}
          {ripeningSpeed < 0.5 && (
            <p>✗ Slow ripening - temperature too low for optimal development</p>
          )}
        </div>

        {/* Future Predictions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ripeness Predictions
          </h4>
          <div className="grid gap-2">
            {predictionDays.map((days) => {
              const futureStage = predictFutureStage(daysIntoRipening, days);
              const futurePercentage = Math.min(100, getRipenessPercentage(daysIntoRipening + days));
              return (
                <div 
                  key={days}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-black/20"
                >
                  <span className="text-sm text-muted-foreground">
                    In {days} day{days > 1 ? "s" : ""}:
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: futureStage.color }}
                    />
                    <Badge variant="outline" className="text-xs">
                      {futureStage.name} ({futurePercentage.toFixed(0)}%)
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Harvest Recommendation */}
        {currentStage.name === "Deep Red" ? (
          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              🔥 Peak Harvest Time!
            </p>
            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
              Maximum heat and sweetness achieved - perfect for drying or fresh use
            </p>
          </div>
        ) : currentStage.name === "Light Red" ? (
          <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⏳ Almost Ready
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
              3-5 more days for peak ripeness, or harvest now for milder heat
            </p>
          </div>
        ) : currentStage.name === "Mature Green" ? (
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              🥗 Harvestable for Green Chili
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Can harvest now for green chili dishes, or wait for red ripeness
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ChiliRipeness;
