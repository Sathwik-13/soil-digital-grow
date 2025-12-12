import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Play, Pause, RefreshCw, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  CROP_DATA, 
  getCurrentStage, 
  calculatePlantHealth, 
  getExpectedHeight,
  getOverallProgress 
} from "@/data/cropData";

interface PlantGrowthResultsProps {
  moisture: number;
  temperature: number;
  soilPh: number;
  lightIntensity: number;
  humidity: number;
  selectedCrop: string;
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

interface GrowthSnapshot {
  timestamp: string;
  health: number;
  height: number;
  image: string;
  weekNumber: number;
  stageName: string;
  cropName: string;
}

const PlantGrowthResults = ({ 
  moisture, 
  temperature, 
  soilPh, 
  lightIntensity,
  humidity,
  selectedCrop,
  currentWeek,
  onWeekChange
}: PlantGrowthResultsProps) => {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const crop = CROP_DATA[selectedCrop];

  const generatePlantImage = (
    health: number, 
    height: number, 
    weekNumber: number,
    stageName: string
  ): string => {
    if (!canvasRef.current || !crop) return "";
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 300;
    canvas.height = 400;

    // Background gradient based on time of growth
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#90EE90");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 400);

    // Soil - darker when moist
    const soilDarkness = moisture * 0.5;
    ctx.fillStyle = `rgb(${102 - soilDarkness * 0.3}, ${66 - soilDarkness * 0.2}, ${33 - soilDarkness * 0.1})`;
    ctx.fillRect(0, 300, 300, 100);

    // Plant color based on health and crop type
    const healthFactor = health / 100;
    let plantColor: string;
    let fruitColor: string;
    
    if (selectedCrop === "tomato") {
      plantColor = `rgb(${60 - healthFactor * 20}, ${100 + healthFactor * 80}, ${40})`;
      fruitColor = "#e53935";
    } else if (selectedCrop === "chili") {
      plantColor = `rgb(${50 - healthFactor * 15}, ${90 + healthFactor * 70}, ${35})`;
      fruitColor = "#d32f2f";
    } else {
      plantColor = `rgb(${55 - healthFactor * 18}, ${95 + healthFactor * 75}, ${38})`;
      fruitColor = "#5e35b1";
    }

    const plantHeight = Math.min(200, height * 1.5);
    
    // Stem
    ctx.fillStyle = "#3d5a2c";
    const stemWidth = 8 + (weekNumber * 0.5);
    ctx.fillRect(150 - stemWidth/2, 300 - plantHeight, stemWidth, plantHeight);

    // Leaves
    ctx.fillStyle = plantColor;
    const leafCount = Math.floor(2 + (height / 15));
    for (let i = 0; i < leafCount; i++) {
      const y = 300 - (plantHeight * (i + 1) / (leafCount + 1));
      const leafSize = 15 + (height / 10);
      
      // Left leaf
      ctx.beginPath();
      ctx.ellipse(150 - 20, y, leafSize, leafSize * 0.5, -Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Right leaf
      ctx.beginPath();
      ctx.ellipse(150 + 20, y, leafSize, leafSize * 0.5, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Top foliage
    ctx.beginPath();
    ctx.arc(150, 300 - plantHeight, 20 + (height / 8), 0, 2 * Math.PI);
    ctx.fill();

    // Draw fruits/vegetables if in fruiting or harvesting stage
    const stageIndex = crop.stages.findIndex(s => s.name === stageName);
    if (stageIndex >= 3) { // Fruit development or harvesting
      const fruitCount = Math.min(8, 2 + Math.floor((weekNumber - 10) / 2));
      ctx.fillStyle = fruitColor;
      
      for (let i = 0; i < fruitCount; i++) {
        const x = 130 + Math.random() * 40;
        const y = 300 - plantHeight * 0.3 - Math.random() * plantHeight * 0.5;
        
        if (selectedCrop === "tomato") {
          // Round tomatoes
          ctx.beginPath();
          ctx.arc(x, y, 8 + Math.random() * 4, 0, 2 * Math.PI);
          ctx.fill();
        } else if (selectedCrop === "chili") {
          // Elongated chilies
          ctx.beginPath();
          ctx.ellipse(x, y, 3, 12 + Math.random() * 5, Math.PI / 6, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // Oval brinjals
          ctx.beginPath();
          ctx.ellipse(x, y, 6 + Math.random() * 3, 10 + Math.random() * 5, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Flowers if in flowering stage
    if (stageIndex === 2) {
      const flowerCount = Math.min(6, 2 + weekNumber - 8);
      for (let i = 0; i < flowerCount; i++) {
        const x = 130 + Math.random() * 40;
        const y = 300 - plantHeight * 0.4 - Math.random() * plantHeight * 0.4;
        
        ctx.fillStyle = selectedCrop === "brinjal" ? "#9c27b0" : "#ffeb3b";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Info overlay
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(5, 5, 140, 85);
    
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Arial";
    ctx.fillText(`${crop.icon} ${crop.name}`, 10, 22);
    ctx.font = "11px Arial";
    ctx.fillText(`Week ${weekNumber} of ${crop.totalDuration}`, 10, 38);
    ctx.fillText(`Stage: ${stageName}`, 10, 54);
    ctx.fillText(`Health: ${health.toFixed(0)}%`, 10, 70);
    ctx.fillText(`Height: ${height.toFixed(0)} cm`, 10, 86);

    return canvas.toDataURL("image/png");
  };

  useEffect(() => {
    if (!isTracking || !crop) return;

    const interval = setInterval(() => {
      const newWeek = Math.min(currentWeek + 1, crop.totalDuration);
      onWeekChange(newWeek);
      
      const health = calculatePlantHealth(selectedCrop, moisture, temperature, soilPh, humidity, lightIntensity);
      const height = getExpectedHeight(selectedCrop, newWeek);
      const stage = getCurrentStage(selectedCrop, newWeek);
      const stageName = stage?.name || "Harvesting Complete";
      
      const image = generatePlantImage(health, height, newWeek, stageName);
      
      const newSnapshot: GrowthSnapshot = {
        timestamp: new Date().toISOString(),
        health,
        height,
        image,
        weekNumber: newWeek,
        stageName,
        cropName: crop.name,
      };

      setSnapshots((prev) => [...prev, newSnapshot]);

      toast({
        title: `${crop.icon} Week ${newWeek} - ${stageName}`,
        description: `${crop.name} health: ${health.toFixed(0)}%, Height: ${height.toFixed(0)}cm`,
      });

      // Stop if reached end
      if (newWeek >= crop.totalDuration) {
        setIsTracking(false);
        toast({
          title: `${crop.icon} Growth Cycle Complete!`,
          description: `${crop.name} has completed its ${crop.totalMonths}-month growth cycle`,
        });
      }
    }, 3000); // 3 seconds = 1 week of growth

    return () => clearInterval(interval);
  }, [isTracking, currentWeek, moisture, temperature, soilPh, lightIntensity, humidity, selectedCrop, crop]);

  const downloadResults = () => {
    snapshots.forEach((snapshot, index) => {
      const link = document.createElement("a");
      link.href = snapshot.image;
      link.download = `${snapshot.cropName.toLowerCase()}-week${snapshot.weekNumber}-${new Date(snapshot.timestamp).toISOString()}.png`;
      link.click();
    });

    toast({
      title: "Download Complete",
      description: `Downloaded ${snapshots.length} growth images for ${crop?.name}`,
    });
  };

  const resetTracking = () => {
    setSnapshots([]);
    setIsTracking(false);
    onWeekChange(1);
    toast({
      title: "Tracking Reset",
      description: `${crop?.name} growth tracking reset to Week 1`,
    });
  };

  if (!crop) return null;

  const currentStage = getCurrentStage(selectedCrop, currentWeek);
  const progress = getOverallProgress(selectedCrop, currentWeek);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="text-xl">{crop.icon}</span>
            {crop.name} Growth Simulation
          </CardTitle>
          <CardDescription>
            Simulate {crop.totalDuration}-week growth cycle • Each 3 seconds = 1 week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Week {currentWeek}/{crop.totalDuration}</Badge>
            <Badge variant="secondary">{currentStage?.name || "Complete"}</Badge>
            <Badge variant="default" className="ml-auto">{Math.round(progress)}% Complete</Badge>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setIsTracking(!isTracking)}
              variant={isTracking ? "destructive" : "default"}
              className="gap-2"
              disabled={currentWeek >= crop.totalDuration}
            >
              {isTracking ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {currentWeek >= crop.totalDuration ? "Cycle Complete" : "Start Simulation"}
                </>
              )}
            </Button>
            {snapshots.length > 0 && (
              <>
                <Button onClick={downloadResults} variant="secondary" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download ({snapshots.length})
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
                🟢 Simulating {crop.name} growth - Week {currentWeek} ({currentStage?.name})
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Next: Week {Math.min(currentWeek + 1, crop.totalDuration)} • {crop.totalDuration - currentWeek} weeks remaining
              </p>
            </div>
          )}

          {snapshots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
              {snapshots.map((snapshot, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={snapshot.image}
                    alt={`${snapshot.cropName} week ${snapshot.weekNumber}`}
                    className="w-full rounded-lg border-2 border-primary/20 shadow-lg"
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-primary">Week {snapshot.weekNumber}</p>
                    <p className="text-muted-foreground">{snapshot.stageName}</p>
                    <p>Health: {snapshot.health.toFixed(0)}%</p>
                    <p>Height: {snapshot.height.toFixed(0)} cm</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {snapshots.length === 0 && !isTracking && (
            <div className="text-center p-8 text-muted-foreground">
              <p className="text-2xl mb-2">{crop.icon}</p>
              <p>Ready to simulate {crop.name} growth</p>
              <p className="text-sm mt-2">
                Click "Start Simulation" to watch {crop.totalMonths}-month growth cycle
              </p>
              <p className="text-xs mt-1">
                Duration: {crop.totalDuration} weeks | Yield: {crop.yieldPerHectare}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PlantGrowthResults;
