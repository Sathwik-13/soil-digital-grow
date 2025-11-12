import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bug, AlertTriangle, Shield, Leaf } from "lucide-react";
import { useMemo } from "react";

interface PestDetectionProps {
  temperature: number;
  humidity: number;
  moisture: number;
}

const PestDetection = ({ temperature, humidity, moisture }: PestDetectionProps) => {
  const pests = useMemo(() => {
    const detectedPests = [];
    
    // Aphids thrive in warm, humid conditions
    if (temperature > 25 && humidity > 60) {
      detectedPests.push({
        name: "Aphids",
        risk: temperature > 30 ? "High" : "Medium",
        description: "Small sap-sucking insects that can weaken plants",
        recommendation: "Apply neem oil spray or introduce ladybugs"
      });
    }
    
    // Fungal diseases in high moisture
    if (moisture > 70 && humidity > 75) {
      detectedPests.push({
        name: "Fungal Disease Risk",
        risk: "High",
        description: "High moisture creates ideal conditions for fungal growth",
        recommendation: "Reduce watering frequency and improve air circulation"
      });
    }
    
    // Root rot in very wet conditions
    if (moisture > 80) {
      detectedPests.push({
        name: "Root Rot Risk",
        risk: "High",
        description: "Excessive moisture can lead to root damage",
        recommendation: "Improve drainage and reduce irrigation"
      });
    }
    
    // Spider mites in hot, dry conditions
    if (temperature > 32 && humidity < 40) {
      detectedPests.push({
        name: "Spider Mites",
        risk: "Medium",
        description: "Tiny pests that thrive in hot, dry environments",
        recommendation: "Increase humidity and apply miticide if needed"
      });
    }

    return detectedPests;
  }, [temperature, humidity, moisture]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-orange-600" />
          Pest & Disease Detection
        </CardTitle>
        <CardDescription>AI-powered risk assessment based on environmental conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pests.length === 0 ? (
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              No significant pest or disease risks detected. Conditions are optimal!
            </AlertDescription>
          </Alert>
        ) : (
          pests.map((pest, index) => (
            <Alert key={index} variant={pest.risk === "High" ? "destructive" : "default"}>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{pest.name}</span>
                  <Badge variant={getRiskColor(pest.risk)}>{pest.risk} Risk</Badge>
                </div>
                <p className="text-sm">{pest.description}</p>
                <div className="flex items-start gap-2 mt-2 p-2 bg-muted rounded-md">
                  <Leaf className="w-4 h-4 mt-0.5 text-green-600" />
                  <p className="text-sm"><strong>Action:</strong> {pest.recommendation}</p>
                </div>
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default PestDetection;