import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface YieldPredictionProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface PredictionTimeline {
  period: string;
  plantHeight: number;
  plantHealth: number;
  soilColor: string;
  soilQuality: number;
  expectedYield: number;
}

const YieldPrediction = ({
  moisture,
  temperature,
  soilPh,
  lightIntensity,
  nitrogen,
  phosphorus,
  potassium,
}: YieldPredictionProps) => {
  const [yieldScore, setYieldScore] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<PredictionTimeline[]>([]);

  useEffect(() => {
    // Calculate yield score based on optimal conditions
    let score = 100;
    const issues: string[] = [];

    // Moisture evaluation (optimal: 40-60%)
    if (moisture < 30) {
      score -= 15;
      issues.push("Increase irrigation - soil too dry");
    } else if (moisture > 70) {
      score -= 10;
      issues.push("Reduce irrigation - risk of waterlogging");
    }

    // Temperature evaluation (optimal: 22-28°C for Bangalore crops)
    if (temperature < 20) {
      score -= 12;
      issues.push("Temperature too low - consider greenhouse protection");
    } else if (temperature > 32) {
      score -= 12;
      issues.push("High temperature - increase shade/mulching");
    }

    // pH evaluation (optimal: 6.0-7.0)
    if (soilPh < 5.5) {
      score -= 15;
      issues.push("Soil too acidic - add lime to raise pH");
    } else if (soilPh > 7.5) {
      score -= 15;
      issues.push("Soil too alkaline - add sulfur to lower pH");
    }

    // Light evaluation (optimal: 60-80%)
    if (lightIntensity < 50) {
      score -= 10;
      issues.push("Insufficient light - prune surrounding vegetation");
    }

    // NPK evaluation (optimal: 60-80% each)
    if (nitrogen < 50) {
      score -= 8;
      issues.push("Low nitrogen - apply nitrogen-rich fertilizer");
    }
    if (phosphorus < 50) {
      score -= 8;
      issues.push("Low phosphorus - add bone meal or rock phosphate");
    }
    if (potassium < 50) {
      score -= 8;
      issues.push("Low potassium - apply potash or wood ash");
    }

    score = Math.max(0, Math.min(100, score));
    setYieldScore(score);

    // Set prediction message
    if (score >= 85) {
      setPrediction("Excellent conditions - expect high yield");
    } else if (score >= 70) {
      setPrediction("Good conditions - above average yield expected");
    } else if (score >= 55) {
      setPrediction("Moderate conditions - average yield expected");
    } else {
      setPrediction("Poor conditions - yield may be below average");
    }

    setRecommendations(issues);

    // Calculate future predictions
    const calculatePredictions = () => {
      const baseHeight = 20; // Starting plant height in cm
      const baseYield = score / 100; // Base yield multiplier
      const growthRate = (score / 100) * (lightIntensity / 100) * (moisture / 100);
      
      const getSoilColor = (quality: number) => {
        if (quality >= 80) return "Rich dark brown";
        if (quality >= 60) return "Medium brown";
        if (quality >= 40) return "Light brown";
        return "Pale brown";
      };

      const timeframes = [
        { weeks: 1, period: "1 Week" },
        { weeks: 4, period: "1 Month" },
        { weeks: 12, period: "3 Months" },
      ];

      return timeframes.map(({ weeks, period }) => {
        const heightGrowth = baseHeight + (weeks * 3 * growthRate);
        const healthDecay = weeks > 4 ? Math.max(0, score - (weeks - 4) * 2) : score;
        const soilQuality = Math.max(0, Math.min(100, 
          (nitrogen + phosphorus + potassium) / 3 - (weeks * 0.5)
        ));
        const yieldMultiplier = 1 + (weeks / 12) * growthRate;

        return {
          period,
          plantHeight: Math.round(heightGrowth),
          plantHealth: Math.round(healthDecay),
          soilColor: getSoilColor(soilQuality),
          soilQuality: Math.round(soilQuality),
          expectedYield: Math.round(baseYield * yieldMultiplier * 100),
        };
      });
    };

    setPredictions(calculatePredictions());
  }, [moisture, temperature, soilPh, lightIntensity, nitrogen, phosphorus, potassium]);

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

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getScoreIcon()}
          Yield Prediction & Growth Forecast
        </CardTitle>
        <CardDescription>AI-powered crop yield estimation and future growth projections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Future Predictions</TabsTrigger>
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

        {recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recommendations to Improve Yield
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
                  All parameters are within optimal range! Continue current management practices.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Predictions assume current environmental conditions remain constant
            </div>
            
            {predictions.map((pred, idx) => (
              <div key={idx} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-lg">{pred.period} Forecast</h4>
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
                    <p className="text-sm text-muted-foreground">Soil Color</p>
                    <p className="text-sm font-medium">{pred.soilColor}</p>
                  </div>
                  
                  <div className="col-span-2 space-y-1 pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">Expected Yield</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-primary">{pred.expectedYield}%</p>
                      <span className="text-sm text-muted-foreground">of optimal yield</span>
                    </div>
                  </div>
                </div>

                {pred.plantHealth < 70 && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Health may decline over time. Consider adjusting conditions to maintain optimal growth.
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> These predictions are based on current sensor values remaining constant. 
                Actual results may vary based on weather changes, pest activity, and farming practices.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default YieldPrediction;
