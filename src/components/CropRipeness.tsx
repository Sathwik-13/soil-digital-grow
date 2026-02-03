import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Clock, Thermometer, Sun, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  CROP_RIPENESS_DATA,
  calculateRipeningSpeed,
  getCurrentRipenessStage,
  getRipenessPercentage,
} from "@/data/ripenessData";

interface CropRipenessProps {
  selectedCrop: string;
  temperature: number;
  moisture: number;
  currentWeek: number;
  onRipenessChange?: (daysIntoRipening: number, ripenessPercentage: number) => void;
}

const CropRipeness: React.FC<CropRipenessProps> = ({
  selectedCrop,
  temperature,
  moisture,
  currentWeek,
  onRipenessChange,
}) => {
  const [daysIntoRipening, setDaysIntoRipening] = useState(0);
  const predictionDays = [3, 7, 14];

  const cropData = CROP_RIPENESS_DATA[selectedCrop];
  
  if (!cropData) {
    return null;
  }

  const ripeningSpeed = calculateRipeningSpeed(selectedCrop, temperature);
  const currentStage = getCurrentRipenessStage(selectedCrop, daysIntoRipening, ripeningSpeed);
  const currentPercentage = getRipenessPercentage(selectedCrop, daysIntoRipening, ripeningSpeed);

  // Check if we're in fruit development stage
  const isFruitDevelopmentStage = currentWeek >= cropData.fruitStartWeek;

  // Notify parent of ripeness changes
  useEffect(() => {
    if (onRipenessChange) {
      onRipenessChange(daysIntoRipening, currentPercentage);
    }
  }, [daysIntoRipening, currentPercentage, onRipenessChange]);

  // Auto-calculate days based on current week in fruit development
  useEffect(() => {
    if (currentWeek >= cropData.fruitStartWeek) {
      const weeksIntoFruitDev = currentWeek - cropData.fruitStartWeek;
      const calculatedDays = Math.min(cropData.maxRipeningDays, weeksIntoFruitDev * 1.5);
      setDaysIntoRipening(calculatedDays);
    }
  }, [currentWeek, cropData.fruitStartWeek, cropData.maxRipeningDays]);

  // Predict future stage
  const predictFutureStage = (currentDays: number, futureDays: number) => {
    return getCurrentRipenessStage(selectedCrop, currentDays + futureDays, ripeningSpeed);
  };

  const predictFuturePercentage = (currentDays: number, futureDays: number) => {
    return getRipenessPercentage(selectedCrop, currentDays + futureDays, ripeningSpeed);
  };

  // Check if at optimal harvest stage
  const isOptimalHarvest = currentStage.name === cropData.optimalHarvestStage;
  const isNearOptimal = cropData.stages.indexOf(currentStage) >= cropData.stages.length - 3;
  const isOverripe = currentStage.name.toLowerCase().includes("overripe") || currentPercentage >= 100;

  // Get gradient colors for the card based on crop
  const getCardGradient = () => {
    switch (selectedCrop) {
      case "tomato":
        return "from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800";
      case "chili":
        return "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800";
      case "brinjal":
        return "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800";
      default:
        return "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800";
    }
  };

  if (!isFruitDevelopmentStage) {
    return (
      <Card className={`bg-gradient-to-br ${getCardGradient()}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {cropData.icon} {cropData.cropName} Ripeness Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Ripeness tracking available from Week {cropData.fruitStartWeek}</p>
            <p className="text-xs mt-1">(Fruit Development Stage)</p>
            <p className="text-xs mt-2">Current: Week {currentWeek}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${getCardGradient()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {cropData.icon} {cropData.cropName} Ripeness Tracker
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
                color: currentStage.textColor 
              }}
            >
              {currentStage.name}
            </Badge>
          </div>
          
          {/* Visual Ripeness Bar */}
          <div className="relative mb-3">
            <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
              {cropData.stages.map((stage, idx) => {
                const stageIndex = cropData.stages.indexOf(currentStage);
                return (
                  <div
                    key={stage.name}
                    className={`flex-1 transition-all duration-300 ${
                      idx <= stageIndex ? "opacity-100" : "opacity-30"
                    }`}
                    style={{ backgroundColor: stage.color }}
                    title={stage.name}
                  />
                );
              })}
            </div>
          </div>

          <Progress value={currentPercentage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">{currentStage.description}</p>
        </div>

        {/* Crop-Specific Characteristics */}
        <div className="grid grid-cols-3 gap-2">
          {cropData.characteristics.map((char) => (
            <div key={char.label} className="p-2 rounded-lg bg-white/40 dark:bg-black/20 text-center">
              <p className="text-xs text-muted-foreground">{char.label}</p>
              <p className="text-sm font-medium">{char.getValue(currentPercentage)}</p>
            </div>
          ))}
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
            max={cropData.maxRipeningDays + 3}
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
          {ripeningSpeed >= 1 && temperature <= cropData.optimalTempRange.max && (
            <p>✓ Optimal temperature ({cropData.optimalTempRange.min}-{cropData.optimalTempRange.max}°C)</p>
          )}
          {ripeningSpeed > 1 && temperature > cropData.optimalTempRange.max && (
            <p>⚠ Fast ripening but may affect quality</p>
          )}
          {ripeningSpeed < 1 && ripeningSpeed > 0 && (
            <p>⚠ Slow ripening - consider adjusting temperature</p>
          )}
          {ripeningSpeed === 0 && (
            <p>✗ Ripening stopped - temperature too low</p>
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
              const futurePercentage = Math.min(100, predictFuturePercentage(daysIntoRipening, days));
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
        {isOptimalHarvest && (
          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              🎉 Optimal Harvest Time!
            </p>
            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
              {cropData.cropName} at peak ripeness - harvest now for best quality
            </p>
          </div>
        )}
        
        {isNearOptimal && !isOptimalHarvest && !isOverripe && (
          <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⏳ Almost Ready
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
              {selectedCrop === "brinjal" 
                ? "Harvest soon for optimal texture and flavor"
                : "1-2 more days for optimal harvest"
              }
            </p>
          </div>
        )}

        {isOverripe && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ⚠️ Overripe Warning
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
              {selectedCrop === "brinjal" 
                ? "Seeds hardening, skin becoming dull - harvest immediately"
                : "Quality declining - harvest now to prevent waste"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropRipeness;
