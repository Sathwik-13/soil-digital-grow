import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Clock, Thermometer, Sun, Droplets } from "lucide-react";

interface RipenessStage {
  name: string;
  color: string;
  description: string;
  daysFromGreen: number;
  percentage: number;
}

const RIPENESS_STAGES: RipenessStage[] = [
  { name: "Green", color: "#4CAF50", description: "Fully mature but unripe, firm texture", daysFromGreen: 0, percentage: 0 },
  { name: "Breaker", color: "#8BC34A", description: "First sign of color change at blossom end", daysFromGreen: 2, percentage: 17 },
  { name: "Turning", color: "#CDDC39", description: "10-30% of surface shows pink/red color", daysFromGreen: 4, percentage: 33 },
  { name: "Pink", color: "#FFEB3B", description: "30-60% pink/red coloration", daysFromGreen: 5, percentage: 50 },
  { name: "Light Red", color: "#FF9800", description: "60-90% red coloration", daysFromGreen: 6, percentage: 75 },
  { name: "Red Ripe", color: "#F44336", description: "Over 90% red, optimal harvest", daysFromGreen: 7, percentage: 100 },
];

interface TomatoRipenessProps {
  temperature: number;
  moisture: number;
  currentWeek: number;
}

const TomatoRipeness: React.FC<TomatoRipenessProps> = ({
  temperature,
  moisture,
  currentWeek,
}) => {
  const [daysIntoRipening, setDaysIntoRipening] = useState(0);
  const [predictionDays, setPredictionDays] = useState([3, 7, 14]);

  // Calculate ripening speed factor based on temperature
  // Optimal ripening temperature: 20-25°C
  // Below 12°C: ripening stops
  // Above 30°C: ripening quality degrades
  const calculateRipeningSpeed = (temp: number): number => {
    if (temp < 12) return 0;
    if (temp >= 20 && temp <= 25) return 1.0;
    if (temp > 25 && temp <= 30) return 1.2; // Faster but slightly lower quality
    if (temp > 30) return 0.8; // Too hot, quality issues
    if (temp >= 12 && temp < 20) return 0.5 + ((temp - 12) / 8) * 0.5; // Gradual increase
    return 1.0;
  };

  const ripeningSpeed = calculateRipeningSpeed(temperature);

  // Get current ripeness stage based on days
  const getCurrentStage = (days: number): RipenessStage => {
    const adjustedDays = days * ripeningSpeed;
    for (let i = RIPENESS_STAGES.length - 1; i >= 0; i--) {
      if (adjustedDays >= RIPENESS_STAGES[i].daysFromGreen) {
        return RIPENESS_STAGES[i];
      }
    }
    return RIPENESS_STAGES[0];
  };

  // Get ripeness percentage
  const getRipenessPercentage = (days: number): number => {
    const adjustedDays = days * ripeningSpeed;
    const maxDays = 7; // Days to full ripeness
    return Math.min(100, (adjustedDays / maxDays) * 100);
  };

  // Predict future stage
  const predictFutureStage = (currentDays: number, futureDays: number): RipenessStage => {
    return getCurrentStage(currentDays + futureDays);
  };

  const currentStage = getCurrentStage(daysIntoRipening);
  const currentPercentage = getRipenessPercentage(daysIntoRipening);

  // Only show ripeness tracking from fruit development stage (week 11+)
  const isFruitDevelopmentStage = currentWeek >= 11;

  useEffect(() => {
    // Auto-calculate days based on current week in fruit development
    if (currentWeek >= 11 && currentWeek <= 16) {
      const weeksIntoFruitDev = currentWeek - 11;
      setDaysIntoRipening(Math.min(7, weeksIntoFruitDev * 1.5)); // Scale for demo
    }
  }, [currentWeek]);

  if (!isFruitDevelopmentStage) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🍅 Tomato Ripeness Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Ripeness tracking available from Week 11</p>
            <p className="text-xs mt-1">(Fruit Development Stage)</p>
            <p className="text-xs mt-2">Current: Week {currentWeek}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🍅 Tomato Ripeness Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Ripeness Status */}
        <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Current Ripeness</span>
            <Badge 
              style={{ backgroundColor: currentStage.color, color: currentStage.name === "Green" || currentStage.name === "Breaker" ? "#000" : "#fff" }}
            >
              {currentStage.name}
            </Badge>
          </div>
          
          {/* Visual Ripeness Bar */}
          <div className="relative mb-3">
            <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
              {RIPENESS_STAGES.map((stage, idx) => (
                <div
                  key={stage.name}
                  className={`flex-1 transition-all duration-300 ${
                    idx <= RIPENESS_STAGES.indexOf(currentStage) ? "opacity-100" : "opacity-30"
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
            max={10}
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
          ripeningSpeed >= 1 
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
            : ripeningSpeed >= 0.5 
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
        }`}>
          {ripeningSpeed >= 1 && temperature <= 30 && (
            <p>✓ Optimal temperature for ripening (20-25°C)</p>
          )}
          {ripeningSpeed > 1 && temperature > 25 && (
            <p>⚠ Fast ripening but may affect quality</p>
          )}
          {ripeningSpeed < 1 && ripeningSpeed > 0 && (
            <p>⚠ Slow ripening - consider adjusting temperature</p>
          )}
          {ripeningSpeed === 0 && (
            <p>✗ Ripening stopped - temperature too low (&lt;12°C)</p>
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
        {currentStage.name === "Light Red" || currentStage.name === "Red Ripe" ? (
          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              🎉 Ready for Harvest!
            </p>
            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
              {currentStage.name === "Red Ripe" 
                ? "Optimal harvest time - fruits at peak ripeness"
                : "Good for harvest - will continue ripening off-vine"
              }
            </p>
          </div>
        ) : currentStage.name === "Pink" ? (
          <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⏳ Almost Ready
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
              1-2 more days for optimal harvest
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TomatoRipeness;
