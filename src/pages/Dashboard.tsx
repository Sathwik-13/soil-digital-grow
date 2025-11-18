import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, Droplets, Thermometer, Wind, Sun } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import SoilAIChat from "@/components/SoilAIChat";
import VirtualField3D from "@/components/VirtualField3D";
import NutrientAnalysis from "@/components/NutrientAnalysis";
import PestDetection from "@/components/PestDetection";
import YieldPrediction from "@/components/YieldPrediction";
import FieldPhotoAnalysis from "@/components/FieldPhotoAnalysis";

interface SensorData {
  timestamp: string;
  moisture: number;
  temperature: number;
  humidity: number;
  soilPh: number;
  lightIntensity: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [moisture, setMoisture] = useState(45);
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);
  const [soilPh, setSoilPh] = useState(6.5);
  const [lightIntensity, setLightIntensity] = useState(70);
  const [dataLog, setDataLog] = useState<SensorData[]>([]);
  const [nitrogen, setNitrogen] = useState(65);
  const [phosphorus, setPhosphorus] = useState(70);
  const [potassium, setPotassium] = useState(60);

  // Simulate Bangalore climate variations
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prev => {
        const bangaloreTemp = 22 + Math.random() * 10; // 22-32°C typical for Bangalore
        return Number((prev * 0.9 + bangaloreTemp * 0.1).toFixed(1));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Log data changes
  useEffect(() => {
    const newEntry: SensorData = {
      timestamp: new Date().toISOString(),
      moisture,
      temperature,
      humidity,
      soilPh,
      lightIntensity,
    };
    setDataLog(prev => [...prev.slice(-99), newEntry]);
  }, [moisture, temperature, humidity, soilPh, lightIntensity]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      dataLog.map(entry => ({
        Timestamp: new Date(entry.timestamp).toLocaleString(),
        "Moisture (%)": entry.moisture,
        "Temperature (°C)": entry.temperature,
        "Humidity (%)": entry.humidity,
        "Soil pH": entry.soilPh,
        "Light Intensity (%)": entry.lightIntensity,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sensor Data");
    XLSX.writeFile(workbook, `soil-twin-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: `Exported ${dataLog.length} data points to Excel`,
    });
  };

  const getFieldEffect = () => {
    const effects = [];
    
    if (moisture < 30) effects.push("🌵 Dry soil - Irrigation needed");
    else if (moisture > 70) effects.push("💧 Waterlogged - Reduce irrigation");
    else effects.push("✅ Optimal moisture level");

    if (temperature < 20) effects.push("❄️ Low temperature - Slow growth");
    else if (temperature > 35) effects.push("🔥 High temperature - Heat stress");
    else effects.push("🌡️ Ideal temperature range");

    if (soilPh < 6) effects.push("🍋 Acidic soil - Add lime");
    else if (soilPh > 7.5) effects.push("🧪 Alkaline soil - Add sulfur");
    else effects.push("⚖️ Balanced pH");

    return effects;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Soil Digital Twin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Virtual Field Monitoring - Bangalore Climate</p>
          </div>
          <Button onClick={exportToExcel} className="gap-2">
            <Download className="w-4 h-4" />
            Export to Excel ({dataLog.length} records)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Soil Moisture
              </CardTitle>
              <CardDescription>Adjust moisture level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{moisture}%</div>
              <Slider
                value={[moisture]}
                onValueChange={(val) => setMoisture(val[0])}
                min={0}
                max={100}
                step={1}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                Temperature
              </CardTitle>
              <CardDescription>Bangalore climate-based</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{temperature}°C</div>
              <Slider
                value={[temperature]}
                onValueChange={(val) => setTemperature(val[0])}
                min={15}
                max={45}
                step={0.1}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-500" />
                Humidity
              </CardTitle>
              <CardDescription>Relative humidity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{humidity}%</div>
              <Slider
                value={[humidity]}
                onValueChange={(val) => setHumidity(val[0])}
                min={0}
                max={100}
                step={1}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-purple-500">pH</span>
                Soil pH Level
              </CardTitle>
              <CardDescription>Acidity/Alkalinity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{soilPh.toFixed(1)}</div>
              <Slider
                value={[soilPh]}
                onValueChange={(val) => setSoilPh(val[0])}
                min={4}
                max={9}
                step={0.1}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                Light Intensity
              </CardTitle>
              <CardDescription>Sunlight exposure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{lightIntensity}%</div>
              <Slider
                value={[lightIntensity]}
                onValueChange={(val) => setLightIntensity(val[0])}
                min={0}
                max={100}
                step={1}
              />
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary">
            <CardHeader>
              <CardTitle>Data Tracking</CardTitle>
              <CardDescription>Logged sensor readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{dataLog.length}</div>
              <p className="text-sm text-muted-foreground mt-2">Total data points collected</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>🌾 3D Virtual Field Visualization</CardTitle>
            <CardDescription>Interactive 3D field showing real-time environmental effects - Drag to rotate, scroll to zoom</CardDescription>
          </CardHeader>
          <CardContent>
            <VirtualField3D
              moisture={moisture}
              temperature={temperature}
              soilPh={soilPh}
              lightIntensity={lightIntensity}
              humidity={humidity}
            />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>📊 Field Effect Analysis</CardTitle>
            <CardDescription>Real-time impact summary of current environmental conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {getFieldEffect().map((effect, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-lg text-sm font-medium">
                  {effect}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <YieldPrediction
            moisture={moisture}
            temperature={temperature}
            soilPh={soilPh}
            lightIntensity={lightIntensity}
            nitrogen={nitrogen}
            phosphorus={phosphorus}
            potassium={potassium}
          />
          <FieldPhotoAnalysis />
        </div>
      </div>

      <SoilAIChat />
    </div>
  );
};

export default Dashboard;
