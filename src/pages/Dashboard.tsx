import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, Droplets, Thermometer, Wind, Sun, CloudRain, Gauge, Zap, Navigation, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import SoilAIChat from "@/components/SoilAIChat";
import VirtualField3D from "@/components/VirtualField3D";
import NutrientAnalysis from "@/components/NutrientAnalysis";
import PestDetection from "@/components/PestDetection";
import YieldPrediction from "@/components/YieldPrediction";
import FieldPhotoAnalysis from "@/components/FieldPhotoAnalysis";
import MetricGraph from "@/components/MetricGraph";
import PlantGrowthResults from "@/components/PlantGrowthResults";

interface SensorData {
  timestamp: string;
  moisture: number;
  temperature: number;
  humidity: number;
  soilPh: number;
  lightIntensity: number;
  airPressure: number;
  solarRadiation: number;
  windSpeed: number;
  windDirection: number;
  totalRainfall: number;
  todayRainfall: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [moisture, setMoisture] = useState(45);
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);
  const [soilPh, setSoilPh] = useState(6.5);
  const [lightIntensity, setLightIntensity] = useState(70);
  const [airPressure, setAirPressure] = useState(915);
  const [solarRadiation, setSolarRadiation] = useState(149);
  const [windSpeed, setWindSpeed] = useState(1.1);
  const [windDirection, setWindDirection] = useState(35);
  const [totalRainfall, setTotalRainfall] = useState(23.4);
  const [todayRainfall, setTodayRainfall] = useState(0);
  const [dataLog, setDataLog] = useState<SensorData[]>([]);
  const [nitrogen, setNitrogen] = useState(65);
  const [phosphorus, setPhosphorus] = useState(70);
  const [potassium, setPotassium] = useState(60);
  const [activeGraph, setActiveGraph] = useState<string | null>(null);

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
      airPressure,
      solarRadiation,
      windSpeed,
      windDirection,
      totalRainfall,
      todayRainfall,
    };
    setDataLog(prev => [...prev.slice(-99), newEntry]);
  }, [moisture, temperature, humidity, soilPh, lightIntensity, airPressure, solarRadiation, windSpeed, windDirection, totalRainfall, todayRainfall]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      dataLog.map(entry => ({
        Timestamp: new Date(entry.timestamp).toLocaleString(),
        "Moisture (%)": entry.moisture,
        "Temperature (°C)": entry.temperature,
        "Humidity (%)": entry.humidity,
        "Soil pH": entry.soilPh,
        "Light Intensity (%)": entry.lightIntensity,
        "Air Pressure (hPa)": entry.airPressure,
        "Solar Radiation (W/m²)": entry.solarRadiation,
        "Wind Speed (m/s)": entry.windSpeed,
        "Wind Direction (°)": entry.windDirection,
        "Total Rainfall (mm)": entry.totalRainfall,
        "Today Rainfall (mm)": entry.todayRainfall,
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

  const getGraphData = (metric: string) => {
    return dataLog.map((entry) => ({
      timestamp: entry.timestamp,
      value:
        metric === "moisture" ? entry.moisture :
        metric === "temperature" ? entry.temperature :
        metric === "humidity" ? entry.humidity :
        metric === "soilPh" ? entry.soilPh :
        metric === "lightIntensity" ? entry.lightIntensity :
        metric === "airPressure" ? entry.airPressure :
        metric === "solarRadiation" ? entry.solarRadiation :
        metric === "windSpeed" ? entry.windSpeed :
        metric === "windDirection" ? entry.windDirection :
        metric === "totalRainfall" ? entry.totalRainfall :
        entry.todayRainfall,
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/10 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02em0wIDI0YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02ek0xMiAxOGMwLTMuMzE0LTIuNjg2LTYtNi02cy02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNnptMCAyNGMwLTMuMzE0LTIuNjg2LTYtNi02cy02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNnptMjQtMjRjMC0zLjMxNC0yLjY4Ni02LTYtNnMtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDYgNi0yLjY4NiA2LTZ6bTAgMjRjMC0zLjMxNC0yLjY4Ni02LTYtNnMtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDYgNi0yLjY4NiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      <div className="relative z-10">
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
              <Button
                onClick={() => setActiveGraph("moisture")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
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
              <Button
                onClick={() => setActiveGraph("temperature")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
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
              <Button
                onClick={() => setActiveGraph("humidity")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
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
              <Button
                onClick={() => setActiveGraph("soilPh")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
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
              <Button
                onClick={() => setActiveGraph("lightIntensity")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-purple-500" />
                Air Pressure
              </CardTitle>
              <CardDescription>Atmospheric pressure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{airPressure} hPa</div>
              <Slider
                value={[airPressure]}
                onValueChange={(val) => setAirPressure(val[0])}
                min={850}
                max={1050}
                step={1}
              />
              <Button
                onClick={() => setActiveGraph("airPressure")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Solar Radiation (TSR)
              </CardTitle>
              <CardDescription>Total solar radiation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{solarRadiation} W/m²</div>
              <Slider
                value={[solarRadiation]}
                onValueChange={(val) => setSolarRadiation(val[0])}
                min={0}
                max={1000}
                step={1}
              />
              <Button
                onClick={() => setActiveGraph("solarRadiation")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-teal-500" />
                Wind Speed
              </CardTitle>
              <CardDescription>Current wind speed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{windSpeed} m/s</div>
              <Slider
                value={[windSpeed]}
                onValueChange={(val) => setWindSpeed(val[0])}
                min={0}
                max={30}
                step={0.1}
              />
              <Button
                onClick={() => setActiveGraph("windSpeed")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-500" />
                Wind Direction
              </CardTitle>
              <CardDescription>Wind direction in degrees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">{windDirection}°</div>
              <Slider
                value={[windDirection]}
                onValueChange={(val) => setWindDirection(val[0])}
                min={0}
                max={360}
                step={1}
              />
              <Button
                onClick={() => setActiveGraph("windDirection")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-600" />
                Total Rainfall
              </CardTitle>
              <CardDescription>Cumulative rainfall</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-blue-600">{totalRainfall} mm</div>
              <Slider
                value={[totalRainfall]}
                onValueChange={(val) => setTotalRainfall(val[0])}
                min={0}
                max={500}
                step={0.1}
              />
              <Button
                onClick={() => setActiveGraph("totalRainfall")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-cyan-600" />
                Today's Rainfall
              </CardTitle>
              <CardDescription>Rainfall today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-cyan-600">{todayRainfall} mm</div>
              <Slider
                value={[todayRainfall]}
                onValueChange={(val) => setTodayRainfall(val[0])}
                min={0}
                max={200}
                step={0.1}
              />
              <Button
                onClick={() => setActiveGraph("todayRainfall")}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Graph
              </Button>
            </CardContent>
          </Card>
        </div>

        {activeGraph && (
          <MetricGraph
            title={
              activeGraph === "moisture" ? "Soil Moisture" :
              activeGraph === "temperature" ? "Temperature" :
              activeGraph === "humidity" ? "Humidity" :
              activeGraph === "soilPh" ? "Soil pH" :
              activeGraph === "lightIntensity" ? "Light Intensity" :
              activeGraph === "airPressure" ? "Air Pressure" :
              activeGraph === "solarRadiation" ? "Solar Radiation" :
              activeGraph === "windSpeed" ? "Wind Speed" :
              activeGraph === "windDirection" ? "Wind Direction" :
              activeGraph === "totalRainfall" ? "Total Rainfall" :
              "Today's Rainfall"
            }
            data={getGraphData(activeGraph)}
            unit={
              activeGraph === "moisture" ? "%" :
              activeGraph === "temperature" ? "°C" :
              activeGraph === "humidity" ? "%" :
              activeGraph === "soilPh" ? "pH" :
              activeGraph === "lightIntensity" ? "%" :
              activeGraph === "airPressure" ? "hPa" :
              activeGraph === "solarRadiation" ? "W/m²" :
              activeGraph === "windSpeed" ? "m/s" :
              activeGraph === "windDirection" ? "°" :
              activeGraph === "totalRainfall" ? "mm" :
              "mm"
            }
            color={
              activeGraph === "moisture" ? "#3b82f6" :
              activeGraph === "temperature" ? "#ef4444" :
              activeGraph === "humidity" ? "#06b6d4" :
              activeGraph === "soilPh" ? "#8b5cf6" :
              activeGraph === "lightIntensity" ? "#eab308" :
              activeGraph === "airPressure" ? "#a855f7" :
              activeGraph === "solarRadiation" ? "#f97316" :
              activeGraph === "windSpeed" ? "#14b8a6" :
              activeGraph === "windDirection" ? "#6366f1" :
              activeGraph === "totalRainfall" ? "#2563eb" :
              "#0891b2"
            }
            onClose={() => setActiveGraph(null)}
          />
        )}

        <Card className="border-2">
          <CardHeader>
            <CardTitle>🌾 3D Virtual Field Visualization</CardTitle>
            <CardDescription>Interactive 3D field showing real-time environmental effects - Drag to rotate, scroll to zoom</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <VirtualField3D
              moisture={moisture}
              temperature={temperature}
              soilPh={soilPh}
              lightIntensity={lightIntensity}
              humidity={humidity}
            />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button onClick={() => setActiveGraph("moisture")} variant="outline" size="sm" className="gap-2">
                <Droplets className="w-4 h-4" />
                Moisture Graph
              </Button>
              <Button onClick={() => setActiveGraph("temperature")} variant="outline" size="sm" className="gap-2">
                <Thermometer className="w-4 h-4" />
                Temperature Graph
              </Button>
              <Button onClick={() => setActiveGraph("humidity")} variant="outline" size="sm" className="gap-2">
                <Wind className="w-4 h-4" />
                Humidity Graph
              </Button>
              <Button onClick={() => setActiveGraph("soilPh")} variant="outline" size="sm" className="gap-2">
                pH Graph
              </Button>
              <Button onClick={() => setActiveGraph("lightIntensity")} variant="outline" size="sm" className="gap-2">
                <Sun className="w-4 h-4" />
                Light Graph
              </Button>
            </div>
          </CardContent>
        </Card>

        <PlantGrowthResults
          moisture={moisture}
          temperature={temperature}
          soilPh={soilPh}
          lightIntensity={lightIntensity}
          humidity={humidity}
        />

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
    </div>
  );
};

export default Dashboard;
