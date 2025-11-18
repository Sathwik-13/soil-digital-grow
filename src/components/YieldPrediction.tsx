import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface YieldPredictionProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
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
          Yield Prediction Analysis
        </CardTitle>
        <CardDescription>AI-powered crop yield estimation based on current conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
};

export default YieldPrediction;
