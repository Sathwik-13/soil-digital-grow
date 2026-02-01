import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Clock, Thermometer, Sun, Ruler } from "lucide-react";

interface RipenessStage {
  name: string;
  color: string;
  description: string;
  daysFromFlowering: number;
  percentage: number;
  sizeRange: string;
  glossLevel: string;
}

const BRINJAL_RIPENESS_STAGES: RipenessStage[] = [
  { 
    name: "Fruit Set", 
    color: "#C8E6C9", 
    description: "Small fruit just formed after pollination", 
    daysFromFlowering: 0, 
    percentage: 0,
    sizeRange: "1-3 cm",
    glossLevel: "Low"
  },
  { 
    name: "Young Fruit", 
    color: "#A5D6A7", 
    description: "Light colored, still developing seeds", 
    daysFromFlowering: 7, 
    percentage: 20,
    sizeRange: "3-8 cm",
    glossLevel: "Medium"
  },
  { 
    name: "Developing", 
    color: "#9575CD", 
    description: "Purple color intensifying, firm texture", 
    daysFromFlowering: 14, 
    percentage: 40,
    sizeRange: "8-15 cm",
    glossLevel: "High"
  },
  { 
    name: "Nearly Mature", 
    color: "#7E57C2", 
    description: "Rich purple, glossy skin, tender flesh", 
    daysFromFlowering: 21, 
    percentage: 65,
    sizeRange: "15-20 cm",
    glossLevel: "Very High"
  },
  { 
    name: "Harvest Ready", 
    color: "#5E35B1", 
    description: "Deep purple, maximum gloss, optimal harvest", 
    daysFromFlowering: 28, 
    percentage: 85,
    sizeRange: "18-25 cm",
    glossLevel: "Peak Gloss"
  },
  { 
    name: "Over-Mature", 
    color: "#4A148C", 
    description: "Dull skin, seeds hardening, bitter taste developing", 
    daysFromFlowering: 35, 
    percentage: 100,
    sizeRange: "25+ cm",
    glossLevel: "Declining"
  },
];

interface BrinjalRipenessProps {
  temperature: number;
  moisture: number;
  currentWeek: number;
}

const BrinjalRipeness: React.FC<BrinjalRipenessProps> = ({
  temperature,
  moisture,
  currentWeek,
}) => {
  const [daysIntoRipening, setDaysIntoRipening] = useState(0);
  const predictionDays = [7, 14, 21];

  // Calculate ripening speed factor based on temperature
  // Brinjal optimal: 25-32°C (heat-loving crop)
  // Below 18°C: growth slows significantly
  // Above 38°C: stress, poor fruit set
  const calculateRipeningSpeed = (temp: number): number => {
    if (temp < 18) return 0.3;
    if (temp >= 25 && temp <= 32) return 1.0;
    if (temp > 32 && temp <= 38) return 0.8;
    if (temp > 38) return 0.5;
    if (temp >= 18 && temp < 25) return 0.5 + ((temp - 18) / 7) * 0.5;
    return 1.0;
  };

  const ripeningSpeed = calculateRipeningSpeed(temperature);

  // Get current ripeness stage based on days
  const getCurrentStage = (days: number): RipenessStage => {
    const adjustedDays = days * ripeningSpeed;
    for (let i = BRINJAL_RIPENESS_STAGES.length - 1; i >= 0; i--) {
      if (adjustedDays >= BRINJAL_RIPENESS_STAGES[i].daysFromFlowering) {
        return BRINJAL_RIPENESS_STAGES[i];
      }
    }
    return BRINJAL_RIPENESS_STAGES[0];
  };

  // Get ripeness percentage
  const getRipenessPercentage = (days: number): number => {
    const adjustedDays = days * ripeningSpeed;
    const maxDays = 35;
    return Math.min(100, (adjustedDays / maxDays) * 100);
  };

  // Predict future stage
  const predictFutureStage = (currentDays: number, futureDays: number): RipenessStage => {
    return getCurrentStage(currentDays + futureDays);
  };

  const currentStage = getCurrentStage(daysIntoRipening);
  const currentPercentage = getRipenessPercentage(daysIntoRipening);

  // Brinjal fruit development starts around week 12
  const isFruitDevelopmentStage = currentWeek >= 12;

  useEffect(() => {
    if (currentWeek >= 12 && currentWeek <= 18) {
      const weeksIntoFruitDev = currentWeek - 12;
      setDaysIntoRipening(Math.min(35, weeksIntoFruitDev * 5));
    }
  }, [currentWeek]);

  // Calculate gloss indicator
  const getGlossLevel = (stage: RipenessStage): number => {
    const stageIndex = BRINJAL_RIPENESS_STAGES.indexOf(stage);
    // Gloss peaks at "Harvest Ready" then declines
    if (stageIndex <= 4) return ((stageIndex + 1) / 5) * 100;
    return 60; // Over-mature has reduced gloss
  };

  if (!isFruitDevelopmentStage) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🍆 Brinjal Ripeness Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Ripeness tracking available from Week 12</p>
            <p className="text-xs mt-1">(Fruit Development Stage)</p>
            <p className="text-xs mt-2">Current: Week {currentWeek}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🍆 Brinjal Ripeness Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Ripeness Status */}
        <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Current Stage</span>
            <Badge 
              style={{ 
                backgroundColor: currentStage.color, 
                color: currentStage.name === "Fruit Set" || currentStage.name === "Young Fruit" ? "#000" : "#fff" 
              }}
            >
              {currentStage.name}
            </Badge>
          </div>
          
          {/* Visual Ripeness Bar */}
          <div className="relative mb-3">
            <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
              {BRINJAL_RIPENESS_STAGES.map((stage, idx) => (
                <div
                  key={stage.name}
                  className={`flex-1 transition-all duration-300 ${
                    idx <= BRINJAL_RIPENESS_STAGES.indexOf(currentStage) ? "opacity-100" : "opacity-30"
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

        {/* Size and Gloss Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/30 dark:bg-black/10 border">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Size</span>
            </div>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {currentStage.sizeRange}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/30 dark:bg-black/10 border">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Skin Gloss</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="h-3 flex-1 rounded-full bg-gradient-to-r from-gray-300 to-purple-400 overflow-hidden"
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                  style={{ width: `${getGlossLevel(currentStage)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{currentStage.glossLevel}</span>
            </div>
          </div>
        </div>

        {/* Days Control */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Days since flowering:</span>
            <span className="font-medium">{daysIntoRipening.toFixed(1)} days</span>
          </div>
          <Slider
            value={[daysIntoRipening]}
            onValueChange={(v) => setDaysIntoRipening(v[0])}
            min={0}
            max={40}
            step={1}
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
            <span>Growth Rate: {(ripeningSpeed * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Growth Speed Info */}
        <div className={`p-3 rounded-lg text-sm ${
          ripeningSpeed >= 0.9 
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
            : ripeningSpeed >= 0.5 
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
        }`}>
          {ripeningSpeed >= 0.9 && (
            <p>✓ Optimal temperature for brinjal (25-32°C) - heat-loving crop!</p>
          )}
          {ripeningSpeed >= 0.5 && ripeningSpeed < 0.9 && (
            <p>⚠ Moderate growth - brinjal prefers warmer conditions</p>
          )}
          {ripeningSpeed < 0.5 && (
            <p>✗ Slow growth - temperature too low for optimal development</p>
          )}
        </div>

        {/* Future Predictions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Growth Predictions
          </h4>
          <div className="grid gap-2">
            {predictionDays.map((days) => {
              const futureStage = predictFutureStage(daysIntoRipening, days);
              const futurePercentage = Math.min(100, getRipenessPercentage(daysIntoRipening + days));
              const isOverMature = futureStage.name === "Over-Mature";
              return (
                <div 
                  key={days}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isOverMature 
                      ? "bg-red-100/50 dark:bg-red-900/20" 
                      : "bg-white/40 dark:bg-black/20"
                  }`}
                >
                  <span className="text-sm text-muted-foreground">
                    In {days} day{days > 1 ? "s" : ""}:
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: futureStage.color }}
                    />
                    <Badge 
                      variant={isOverMature ? "destructive" : "outline"} 
                      className="text-xs"
                    >
                      {futureStage.name}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Harvest Recommendation */}
        {currentStage.name === "Harvest Ready" ? (
          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              🎉 Perfect Harvest Time!
            </p>
            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
              Glossy skin, tender flesh - harvest now for best quality
            </p>
          </div>
        ) : currentStage.name === "Nearly Mature" ? (
          <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⏳ Almost Ready
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
              5-7 more days for peak glossiness and flavor
            </p>
          </div>
        ) : currentStage.name === "Over-Mature" ? (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              ⚠️ Over-Mature Warning
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
              Seeds hardening, becoming bitter - harvest immediately or use for seed saving
            </p>
          </div>
        ) : null}

        {/* Quality Tip */}
        <div className="p-3 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 text-xs text-purple-800 dark:text-purple-200">
          <p className="font-medium">💡 Quality Tip:</p>
          <p className="mt-1">Press gently - ready brinjal should spring back. Dull skin = over-mature!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrinjalRipeness;
