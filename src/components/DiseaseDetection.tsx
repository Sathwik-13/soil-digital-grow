import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, Bug, Droplets, Thermometer, Wind, CheckCircle, XCircle } from "lucide-react";
import { CROP_DATA, getCurrentStage } from "@/data/cropData";
import { useMemo } from "react";

interface DiseaseDetectionProps {
  selectedCrop: string;
  currentWeek: number;
  moisture: number;
  temperature: number;
  humidity: number;
  soilPh: number;
  lightIntensity: number;
}

interface Disease {
  name: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  triggers: string[];
  symptoms: string[];
  prevention: string[];
}

const CROP_DISEASES: Record<string, { name: string; conditions: { highMoisture?: boolean; lowMoisture?: boolean; highTemp?: boolean; lowTemp?: boolean; highHumidity?: boolean; wrongPh?: boolean; lowLight?: boolean }; symptoms: string[]; prevention: string[] }[]> = {
  tomato: [
    {
      name: "Early Blight (Alternaria)",
      conditions: { highHumidity: true, highTemp: true },
      symptoms: ["Dark brown spots on lower leaves", "Concentric rings on lesions", "Yellow halos around spots"],
      prevention: ["Remove infected leaves", "Improve air circulation", "Apply copper-based fungicide"]
    },
    {
      name: "Late Blight (Phytophthora)",
      conditions: { highMoisture: true, highHumidity: true, lowTemp: true },
      symptoms: ["Water-soaked lesions", "White fuzzy growth on undersides", "Rapid plant collapse"],
      prevention: ["Avoid overhead watering", "Ensure good drainage", "Use resistant varieties"]
    },
    {
      name: "Fusarium Wilt",
      conditions: { highTemp: true, wrongPh: true },
      symptoms: ["Yellowing of lower leaves", "Wilting during day", "Brown vascular tissue"],
      prevention: ["Rotate crops", "Use disease-free seeds", "Maintain proper pH 6.0-6.8"]
    },
    {
      name: "Blossom End Rot",
      conditions: { lowMoisture: true, wrongPh: true },
      symptoms: ["Dark sunken spots at fruit bottom", "Leathery texture", "Secondary infections"],
      prevention: ["Consistent watering", "Add calcium to soil", "Mulch to retain moisture"]
    }
  ],
  chili: [
    {
      name: "Anthracnose",
      conditions: { highMoisture: true, highHumidity: true },
      symptoms: ["Sunken circular spots on fruits", "Orange spore masses", "Premature fruit drop"],
      prevention: ["Use disease-free seeds", "Avoid overhead irrigation", "Remove infected fruits"]
    },
    {
      name: "Bacterial Leaf Spot",
      conditions: { highHumidity: true, highTemp: true },
      symptoms: ["Small water-soaked spots", "Spots turn brown with yellow halos", "Leaf defoliation"],
      prevention: ["Use copper sprays", "Avoid working with wet plants", "Rotate crops"]
    },
    {
      name: "Powdery Mildew",
      conditions: { lowMoisture: true, highTemp: true, lowLight: true },
      symptoms: ["White powdery coating on leaves", "Leaf curling", "Stunted growth"],
      prevention: ["Improve air circulation", "Apply sulfur-based fungicide", "Remove affected leaves"]
    },
    {
      name: "Root Rot (Phytophthora)",
      conditions: { highMoisture: true, wrongPh: true },
      symptoms: ["Wilting despite moist soil", "Brown roots", "Plant stunting"],
      prevention: ["Improve drainage", "Avoid overwatering", "Use raised beds"]
    }
  ],
  brinjal: [
    {
      name: "Verticillium Wilt",
      conditions: { highTemp: true, wrongPh: true },
      symptoms: ["V-shaped yellowing on leaves", "One-sided wilting", "Brown vascular tissue"],
      prevention: ["Soil solarization", "Use resistant varieties", "Long crop rotation"]
    },
    {
      name: "Phomopsis Blight",
      conditions: { highHumidity: true, highMoisture: true },
      symptoms: ["Circular spots on leaves", "Stem cankers", "Fruit rot at calyx end"],
      prevention: ["Remove plant debris", "Use fungicide during fruiting", "Avoid injuries to plants"]
    },
    {
      name: "Bacterial Wilt",
      conditions: { highTemp: true, highMoisture: true },
      symptoms: ["Sudden wilting", "No leaf yellowing before wilt", "Brown vascular bundles"],
      prevention: ["Use disease-free seedlings", "Avoid waterlogging", "Apply biocontrol agents"]
    },
    {
      name: "Cercospora Leaf Spot",
      conditions: { highHumidity: true, lowLight: true },
      symptoms: ["Small circular spots with gray centers", "Leaf yellowing", "Premature leaf drop"],
      prevention: ["Wide plant spacing", "Remove infected leaves", "Apply copper fungicide"]
    }
  ]
};

const DiseaseDetection = ({
  selectedCrop,
  currentWeek,
  moisture,
  temperature,
  humidity,
  soilPh,
  lightIntensity
}: DiseaseDetectionProps) => {
  const crop = CROP_DATA[selectedCrop];
  const currentStage = getCurrentStage(selectedCrop, currentWeek);
  const diseases = CROP_DISEASES[selectedCrop] || [];

  const getConditionLabel = (key: string): string => {
    const labels: Record<string, string> = {
      highMoisture: "High soil moisture",
      lowMoisture: "Low soil moisture",
      highTemp: "High temperature",
      lowTemp: "Low temperature",
      highHumidity: "High humidity",
      wrongPh: "Suboptimal pH",
      lowLight: "Low light intensity"
    };
    return labels[key] || key;
  };

  const detectedDiseases = useMemo(() => {
    if (!currentStage || !crop) return [];

    // Use crop-level optimal conditions combined with stage-specific ones
    const conditions = {
      highMoisture: moisture > currentStage.optimalMoisture.max + 10,
      lowMoisture: moisture < currentStage.optimalMoisture.min - 10,
      highTemp: temperature > currentStage.optimalTemp.max + 3,
      lowTemp: temperature < currentStage.optimalTemp.min - 3,
      highHumidity: humidity > crop.optimalHumidity.max + 10,
      wrongPh: soilPh < currentStage.optimalPh.min - 0.5 || soilPh > currentStage.optimalPh.max + 0.5,
      lowLight: lightIntensity < 40
    };

    return diseases.map(disease => {
      const triggers: string[] = [];
      let matchCount = 0;
      let totalConditions = 0;

      Object.entries(disease.conditions).forEach(([key, required]) => {
        if (required) {
          totalConditions++;
          if (conditions[key as keyof typeof conditions]) {
            matchCount++;
            triggers.push(getConditionLabel(key));
          }
        }
      });

      const riskScore = totalConditions > 0 ? (matchCount / totalConditions) * 100 : 0;
      
      let riskLevel: "low" | "medium" | "high" | "critical" = "low";
      if (riskScore >= 75) riskLevel = "critical";
      else if (riskScore >= 50) riskLevel = "high";
      else if (riskScore >= 25) riskLevel = "medium";

      return {
        name: disease.name,
        riskLevel,
        riskScore,
        triggers,
        symptoms: disease.symptoms,
        prevention: disease.prevention
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [selectedCrop, currentWeek, moisture, temperature, humidity, soilPh, lightIntensity, diseases, currentStage, getConditionLabel]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const overallHealth = useMemo(() => {
    const criticalCount = detectedDiseases.filter(d => d.riskLevel === "critical").length;
    const highCount = detectedDiseases.filter(d => d.riskLevel === "high").length;
    
    if (criticalCount > 0) return { status: "At Risk", color: "text-red-500", score: 25 };
    if (highCount > 1) return { status: "Moderate Risk", color: "text-orange-500", score: 50 };
    if (highCount === 1) return { status: "Low Risk", color: "text-yellow-500", score: 75 };
    return { status: "Healthy", color: "text-green-500", score: 100 };
  }, [detectedDiseases]);

  if (!crop || !currentStage) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-primary" />
          Disease Detection & Prevention
        </CardTitle>
        <CardDescription>
          AI-powered analysis of disease risks for {crop.name} at {currentStage.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health Status */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className={`w-6 h-6 ${overallHealth.color}`} />
              <span className="font-semibold text-lg">Crop Health Status</span>
            </div>
            <Badge variant={overallHealth.score >= 75 ? "outline" : "destructive"} className="text-sm">
              {overallHealth.status}
            </Badge>
          </div>
          <Progress value={overallHealth.score} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Based on current environmental conditions and growth stage analysis
          </p>
        </div>

        {/* Current Conditions Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Droplets className="w-4 h-4 text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Moisture</p>
            <p className="font-semibold">{moisture}%</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <Thermometer className="w-4 h-4 text-red-500 mb-1" />
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="font-semibold">{temperature}°C</p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
            <Wind className="w-4 h-4 text-cyan-500 mb-1" />
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="font-semibold">{humidity}%</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
            <span className="text-purple-500 font-bold text-sm">pH</span>
            <p className="text-xs text-muted-foreground">Soil pH</p>
            <p className="font-semibold">{soilPh}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
            <span className="text-yellow-500 font-bold text-sm">☀</span>
            <p className="text-xs text-muted-foreground">Light</p>
            <p className="font-semibold">{lightIntensity}%</p>
          </div>
        </div>

        {/* Disease Risk Analysis */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Disease Risk Analysis
          </h4>
          
          {detectedDiseases.map((disease, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border ${
                disease.riskLevel === "critical" ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800" :
                disease.riskLevel === "high" ? "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800" :
                disease.riskLevel === "medium" ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800" :
                "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{disease.name}</h5>
                <Badge variant={getRiskBadge(disease.riskLevel) as any}>
                  {disease.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Risk Score:</span>
                  <span className="text-sm font-medium">{Math.round(disease.riskScore)}%</span>
                </div>
                <Progress value={disease.riskScore} className={`h-2 ${getRiskColor(disease.riskLevel)}`} />
              </div>

              {disease.triggers.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Active Triggers:</p>
                  <div className="flex flex-wrap gap-1">
                    {disease.triggers.map((trigger, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <XCircle className="w-3 h-3 mr-1 text-red-500" />
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Symptoms to Watch:</p>
                  <ul className="space-y-1">
                    {disease.symptoms.slice(0, 2).map((symptom, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs">
                        <span className="text-orange-500 mt-0.5">•</span>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Prevention:</p>
                  <ul className="space-y-1">
                    {disease.prevention.slice(0, 2).map((action, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiseaseDetection;
