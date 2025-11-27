import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as THREE from "three";

interface PlantGrowthResultsProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
  humidity: number;
}

interface GrowthSnapshot {
  timestamp: string;
  health: number;
  height: number;
  image: string;
  weekNumber: number;
}

const PlantGrowthResults = ({ 
  moisture, 
  temperature, 
  soilPh, 
  lightIntensity,
  humidity 
}: PlantGrowthResultsProps) => {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculatePlantHealth = () => {
    let health = 100;
    if (moisture < 30) health -= (30 - moisture);
    if (moisture > 70) health -= (moisture - 70) * 0.5;
    if (temperature < 20) health -= (20 - temperature) * 2;
    if (temperature > 35) health -= (temperature - 35) * 3;
    if (soilPh < 6) health -= (6 - soilPh) * 10;
    if (soilPh > 7.5) health -= (soilPh - 7.5) * 10;
    if (lightIntensity < 50) health -= (50 - lightIntensity) * 0.3;
    return Math.max(0, Math.min(100, health));
  };

  const generatePlantImage = (health: number, height: number): string => {
    if (!canvasRef.current) return "";
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 300;
    canvas.height = 400;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#90EE90");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 400);

    // Soil
    ctx.fillStyle = `rgb(${102 - moisture * 0.3}, ${66 - moisture * 0.2}, ${33 - moisture * 0.1})`;
    ctx.fillRect(0, 300, 300, 100);

    // Plant
    const healthColor = `rgb(${255 - health * 1.5}, ${100 + health * 1.5}, 50)`;
    const plantHeight = 200 * (height / 100);
    
    // Stem
    ctx.fillStyle = "#3d5a2c";
    ctx.fillRect(140, 300 - plantHeight, 20, plantHeight);

    // Leaves
    ctx.fillStyle = healthColor;
    const leafCount = Math.floor(3 + (height / 25));
    for (let i = 0; i < leafCount; i++) {
      const y = 300 - (plantHeight * (i + 1) / (leafCount + 1));
      ctx.beginPath();
      ctx.ellipse(120, y, 30, 15, -Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(180, y, 30, 15, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Top leaves
    ctx.beginPath();
    ctx.arc(150, 300 - plantHeight, 25, 0, 2 * Math.PI);
    ctx.fill();

    // Info text
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.fillText(`Health: ${health.toFixed(0)}%`, 10, 20);
    ctx.fillText(`Height: ${height.toFixed(0)}cm`, 10, 40);

    return canvas.toDataURL("image/png");
  };

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      const health = calculatePlantHealth();
      const baseHeight = 20;
      const growthFactor = (health / 100) * (lightIntensity / 100);
      const weekNumber = snapshots.length + 1;
      const currentHeight = baseHeight + (weekNumber * 5 * growthFactor);
      
      const image = generatePlantImage(health, Math.min(currentHeight, 100));
      
      const newSnapshot: GrowthSnapshot = {
        timestamp: new Date().toISOString(),
        health,
        height: Math.min(currentHeight, 100),
        image,
        weekNumber,
      };

      setSnapshots((prev) => [...prev, newSnapshot]);

      toast({
        title: "Week " + weekNumber + " Growth Captured",
        description: `Plant health: ${health.toFixed(0)}%, Height: ${Math.min(currentHeight, 100).toFixed(0)}cm`,
      });
    }, 10000); // Capture every 10 seconds = 1 week of growth

    return () => clearInterval(interval);
  }, [isTracking, moisture, temperature, soilPh, lightIntensity, humidity, snapshots.length]);

  const downloadResults = () => {
    snapshots.forEach((snapshot, index) => {
      const link = document.createElement("a");
      link.href = snapshot.image;
      link.download = `plant-growth-${index + 1}-${new Date(snapshot.timestamp).toISOString()}.png`;
      link.click();
    });

    toast({
      title: "Download Complete",
      description: `Downloaded ${snapshots.length} growth images`,
    });
  };

  const resetTracking = () => {
    setSnapshots([]);
    setIsTracking(false);
    toast({
      title: "Tracking Reset",
      description: "All growth snapshots cleared",
    });
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Plant Growth Results
          </CardTitle>
          <CardDescription>
            Track plant growth over time - Each snapshot represents 1 week of growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsTracking(!isTracking)}
              variant={isTracking ? "destructive" : "default"}
              className="gap-2"
            >
              {isTracking ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Tracking
                </>
              )}
            </Button>
            {snapshots.length > 0 && (
              <>
                <Button onClick={downloadResults} variant="secondary" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download All ({snapshots.length})
                </Button>
                <Button onClick={resetTracking} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {isTracking && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium">
                🟢 Recording growth snapshots every 10 seconds (1 week of growth each)...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Next snapshot: Week {snapshots.length + 1}
              </p>
            </div>
          )}

          {snapshots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {snapshots.map((snapshot, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={snapshot.image}
                    alt={`Growth snapshot ${index + 1}`}
                    className="w-full rounded-lg border-2 border-primary/20 shadow-lg"
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-primary">Week {snapshot.weekNumber}</p>
                    <p>Health: {snapshot.health.toFixed(0)}%</p>
                    <p>Height: {snapshot.height.toFixed(0)}cm</p>
                    <p className="text-muted-foreground">
                      Captured: {new Date(snapshot.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {snapshots.length === 0 && !isTracking && (
            <div className="text-center p-8 text-muted-foreground">
              <p>No growth data recorded yet.</p>
              <p className="text-sm mt-2">Click "Start Tracking" to begin recording weekly plant growth.</p>
              <p className="text-xs mt-1">Each 10-second interval = 1 week of growth</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PlantGrowthResults;
