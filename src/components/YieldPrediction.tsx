import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle, Calendar, Leaf, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CROP_DATA, 
  getCurrentStage, 
  getStageProgress, 
  getOverallProgress,
  calculatePlantHealth,
  getExpectedHeight,
  getYieldEstimate 
} from "@/data/cropData";

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

interface PredictionTimeline {
  period: string;
  weekNumber: number;
  stageName: string;
  plantHeight: number;
  plantHealth: number;
  soilQuality: number;
  expectedYield: number;
}

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
  const [yieldScore, setYieldScore] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<PredictionTimeline[]>([]);

  const crop = CROP_DATA[selectedCrop];

  useEffect(() => {
    if (!crop) return;

    // Calculate plant health using crop-specific optimal conditions
    const health = calculatePlantHealth(selectedCrop, moisture, temperature, soilPh, humidity, lightIntensity);
    
    // Calculate yield score based on health and NPK
    let score = health;
    const issues: string[] = [];

    // Stage-specific recommendations
    const currentStage = getCurrentStage(selectedCrop, currentWeek);
    
    // Moisture evaluation
    if (currentStage) {
      if (moisture < currentStage.optimalMoisture.min) {
        score -= 10;
        issues.push(`Increase irrigation - current moisture ${moisture}% is below optimal ${currentStage.optimalMoisture.min}% for ${currentStage.name}`);
      } else if (moisture > currentStage.optimalMoisture.max) {
        score -= 8;
        issues.push(`Reduce irrigation - moisture ${moisture}% exceeds optimal ${currentStage.optimalMoisture.max}% for ${currentStage.name}`);
      }

      // Temperature evaluation
      if (temperature < currentStage.optimalTemp.min) {
        score -= 12;
        issues.push(`Temperature ${temperature}°C is low for ${currentStage.name} - optimal is ${currentStage.optimalTemp.min}-${currentStage.optimalTemp.max}°C`);
      } else if (temperature > currentStage.optimalTemp.max) {
        score -= 12;
        issues.push(`Temperature ${temperature}°C is high for ${currentStage.name} - consider shade/mulching`);
      }

      // pH evaluation
      if (soilPh < currentStage.optimalPh.min) {
        score -= 15;
        issues.push(`Soil pH ${soilPh} is acidic for ${crop.name} - optimal is ${currentStage.optimalPh.min}-${currentStage.optimalPh.max}`);
      } else if (soilPh > currentStage.optimalPh.max) {
        score -= 15;
        issues.push(`Soil pH ${soilPh} is alkaline for ${crop.name} - add sulfur to lower pH`);
      }
    }

    // NPK evaluation based on growth stage
    const stageIndex = currentStage ? crop.stages.indexOf(currentStage) : 0;
    
    if (stageIndex <= 1 && nitrogen < 60) {
      score -= 8;
      issues.push(`Low nitrogen (${nitrogen}%) - critical during ${currentStage?.name || 'early growth'}`);
    }
    
    if (stageIndex >= 2 && stageIndex <= 3 && phosphorus < 55) {
      score -= 8;
      issues.push(`Low phosphorus (${phosphorus}%) - important for flowering and fruiting`);
    }
    
    if (stageIndex >= 3 && potassium < 55) {
      score -= 8;
      issues.push(`Low potassium (${potassium}%) - essential for fruit development`);
    }

    // Light intensity
    if (lightIntensity < 50) {
      score -= 10;
      issues.push(`Insufficient light (${lightIntensity}%) - ${crop.name} needs good sunlight`);
    }

    score = Math.max(0, Math.min(100, score));
    setYieldScore(score);

    // Set prediction message
    if (score >= 85) {
      setPrediction(`Excellent conditions for ${crop.name} - expect high yield of ${crop.yieldPerHectare}`);
    } else if (score >= 70) {
      setPrediction(`Good conditions - expect above average yield for ${crop.name}`);
    } else if (score >= 55) {
      setPrediction(`Moderate conditions - address issues to improve ${crop.name} yield`);
    } else {
      setPrediction(`Poor conditions - ${crop.name} yield may be significantly reduced`);
    }

    setRecommendations(issues);

    // Calculate future predictions based on crop-specific stages
    const calculatePredictions = () => {
      const futureWeeks = [
        { weeksAhead: 2, period: "2 Weeks" },
        { weeksAhead: 4, period: "1 Month" },
        { weeksAhead: 8, period: "2 Months" },
      ];

      return futureWeeks.map(({ weeksAhead, period }) => {
        const futureWeek = Math.min(currentWeek + weeksAhead, crop.totalDuration);
        const futureStage = getCurrentStage(selectedCrop, futureWeek);
        const futureHeight = getExpectedHeight(selectedCrop, futureWeek);
        const futureHealth = Math.max(40, score - (weeksAhead * 0.5)); // Slight decay
        const soilQuality = Math.max(40, (nitrogen + phosphorus + potassium) / 3 - (weeksAhead * 0.8));
        
        const yieldEstimate = getYieldEstimate(selectedCrop, futureHealth, futureWeek);

        return {
          period,
          weekNumber: futureWeek,
          stageName: futureStage?.name || "Harvesting",
          plantHeight: futureHeight,
          plantHealth: Math.round(futureHealth),
          soilQuality: Math.round(soilQuality),
          expectedYield: yieldEstimate.percentage,
        };
      });
    };

    setPredictions(calculatePredictions());
  }, [moisture, temperature, soilPh, lightIntensity, humidity, nitrogen, phosphorus, potassium, selectedCrop, currentWeek, crop]);

  const getScoreColor = () => {
    if (yieldScore >= 85) return "text-green-600";
    if (yieldScore >= 70) return "text-blue-600";
    if (yieldScore >= 55) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = () => {
    if (yieldScore >= 70) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (yieldScore >= 55) return <TrendingUp className="w-6 h-6 text-yellow-600" />;
    return <AlertTriangle className="w-6 h-6 text-red-600" />;
  };

  if (!crop) return null;

  const currentStage = getCurrentStage(selectedCrop, currentWeek);
  const expectedHeight = getExpectedHeight(selectedCrop, currentWeek);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getScoreIcon()}
          <span className="text-xl">{crop.icon}</span>
          {crop.name} Yield Prediction
        </CardTitle>
        <CardDescription>
          Week {currentWeek} of {crop.totalDuration} | {currentStage?.name || "Complete"} | Expected height: {expectedHeight}cm
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Growth Forecast</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-6 mt-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Predicted Yield Score</span>
                <span className={`text-2xl font-bold ${getScoreColor()}`}>{yieldScore}%</span>
              </div>
              <Progress value={yieldScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">{prediction}</p>
            </div>

            {/* Current Stage Info */}
            {currentStage && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{currentStage.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    Week {currentWeek}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{currentStage.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Height</p>
                    <p className="font-semibold">{expectedHeight} cm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Water Need</p>
                    <p className="font-semibold">{currentStage.waterRequirement}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Optimal Temp</p>
                    <p className="font-semibold">{currentStage.optimalTemp.min}-{currentStage.optimalTemp.max}°C</p>
                  </div>
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recommendations for {crop.name}
                </h4>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg text-sm flex items-start gap-2">
                      <span className="text-primary font-bold">{idx + 1}.</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length === 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  All parameters are optimal for {crop.name}! Continue current management practices.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Projections for {crop.name} based on current conditions (total duration: {crop.totalDuration} weeks)
            </div>
            
            {predictions.map((pred, idx) => (
              <div key={idx} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-lg">{pred.period} - Week {pred.weekNumber}</h4>
                  <Badge variant="secondary" className="ml-auto">{pred.stageName}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Plant Height</p>
                    <p className="text-xl font-bold text-primary">{pred.plantHeight} cm</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Plant Health</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold" style={{ 
                        color: pred.plantHealth >= 70 ? 'rgb(34, 197, 94)' : 
                               pred.plantHealth >= 50 ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)' 
                      }}>
                        {pred.plantHealth}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Soil Quality</p>
                    <p className="text-xl font-bold">{pred.soilQuality}%</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expected Yield</p>
                    <p className="text-xl font-bold text-primary">
                      {pred.expectedYield > 0 ? `${pred.expectedYield}%` : "Building"}
                    </p>
                  </div>
                </div>

                {pred.plantHealth < 70 && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Adjust conditions now to prevent health decline in {crop.name}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> {crop.name} typically yields {crop.yieldPerHectare} under optimal conditions. 
                These predictions assume Bangalore climate patterns and current management practices.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default YieldPrediction;
