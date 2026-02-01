import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Droplets, Thermometer, Wind, Sun, CloudRain, Gauge, Zap, Navigation, BarChart3, Sprout, TrendingUp, Calendar, Leaf } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import SoilAIChat from "@/components/SoilAIChat";
import VirtualField3D from "@/components/VirtualField3D";
import NutrientAnalysis from "@/components/NutrientAnalysis";
import PestDetection from "@/components/PestDetection";
import YieldPrediction from "@/components/YieldPrediction";

import MetricGraph from "@/components/MetricGraph";
import PlantGrowthResults from "@/components/PlantGrowthResults";
import CropSelector from "@/components/CropSelector";
import CropTimeline from "@/components/CropTimeline";
import DiseaseDetection from "@/components/DiseaseDetection";
import TomatoRipeness from "@/components/TomatoRipeness";
import { CROP_DATA, getCurrentStage, calculatePlantHealth  } from "@/data/cropData";
import heroImage from "@/assets/hero-farm-fields.jpg";
import tomatoImage from "@/assets/tomato-field.jpg";
import chiliImage from "@/assets/chili-field.jpg";
import brinjalImage from "@/assets/brinjal-field.jpg";

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
  const [selectedCrop, setSelectedCrop] = useState("tomato");
  const [currentWeek, setCurrentWeek] = useState(1);

  const crop = CROP_DATA[selectedCrop];
  const currentStage = getCurrentStage(selectedCrop, currentWeek);
  const cropImages: Record<string, string> = { tomato: tomatoImage, chili: chiliImage, brinjal: brinjalImage };

  // Apply realistic environmental interdependencies
  const applyEnvironmentalEffects = (
    changedFactor: string,
    newValue: number,
    currentValues: {
      moisture: number;
      temperature: number;
      humidity: number;
      lightIntensity: number;
      solarRadiation: number;
      windSpeed: number;
      airPressure: number;
      todayRainfall: number;
    }
  ) => {
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    switch (changedFactor) {
      case "solarRadiation":
        // Solar radiation increases temperature, light, and decreases humidity/moisture
        const solarEffect = (newValue - 100) / 100; // Normalize around 100 W/m²
        setTemperature(prev => clamp(prev + solarEffect * 2, 15, 45));
        setLightIntensity(prev => clamp(prev + solarEffect * 5, 0, 100));
        setHumidity(prev => clamp(prev - solarEffect * 3, 0, 100));
        setMoisture(prev => clamp(prev - solarEffect * 1.5, 0, 100));
        break;

      case "temperature":
        // Temperature affects humidity inversely and reduces moisture
        const tempEffect = (newValue - 25) / 10; // Normalize around 25°C
        setHumidity(prev => clamp(prev - tempEffect * 4, 0, 100));
        setMoisture(prev => clamp(prev - tempEffect * 2, 0, 100));
        setAirPressure(prev => clamp(prev - tempEffect * 2, 850, 1050));
        break;

      case "todayRainfall":
        // Rainfall increases moisture and humidity, slightly cools temperature
        const rainEffect = newValue / 10;
        setMoisture(prev => clamp(prev + rainEffect * 8, 0, 100));
        setHumidity(prev => clamp(prev + rainEffect * 5, 0, 100));
        setTemperature(prev => clamp(prev - rainEffect * 0.5, 15, 45));
        break;

      case "windSpeed":
        // Wind increases evaporation, reduces moisture and humidity, cooling effect
        const windEffect = (newValue - 2) / 2; // Normalize around 2 m/s
        setMoisture(prev => clamp(prev - windEffect * 3, 0, 100));
        setHumidity(prev => clamp(prev - windEffect * 4, 0, 100));
        setTemperature(prev => clamp(prev - windEffect * 1.5, 15, 45));
        break;

      case "humidity":
        // Humidity helps retain soil moisture
        const humidityEffect = (newValue - 50) / 50; // Normalize around 50%
        setMoisture(prev => clamp(prev + humidityEffect * 2, 0, 100));
        break;

      case "airPressure":
        // Air pressure slightly affects temperature
        const pressureEffect = (newValue - 915) / 100; // Normalize around 915 hPa (Bangalore)
        setTemperature(prev => clamp(prev + pressureEffect * 0.5, 15, 45));
        break;

      case "lightIntensity":
        // Light intensity affects temperature and moisture (evaporation)
        const lightEffect = (newValue - 50) / 50; // Normalize around 50%
        setTemperature(prev => clamp(prev + lightEffect * 1.5, 15, 45));
        setMoisture(prev => clamp(prev - lightEffect * 1, 0, 100));
        break;
    }
  };

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

  // Agricultural Dashboard Data
  const yieldData = [
    { month: "Jan", actual: 2.5, predicted: null },
    { month: "Feb", actual: 2.8, predicted: null },
    { month: "Mar", actual: 3.2, predicted: null },
    { month: "Apr", actual: 3.5, predicted: null },
    { month: "May", actual: 3.8, predicted: null },
    { month: "Jun", actual: null, predicted: 4.2 },
    { month: "Jul", actual: null, predicted: 4.5 },
    { month: "Aug", actual: null, predicted: 4.8 },
    { month: "Sep", actual: null, predicted: 5.0 },
    { month: "Oct", actual: null, predicted: 5.2 },
  ];

  const growthData = [
    { week: "Week 1", projected: 85, optimal: 90 },
    { week: "Week 2", projected: 88, optimal: 90 },
    { week: "Week 3", projected: 82, optimal: 90 },
    { week: "Week 4", projected: 90, optimal: 90 },
    { week: "Week 5", projected: 87, optimal: 90 },
    { week: "Week 6", projected: 91, optimal: 90 },
  ];

  const crops = [
    {
      name: "Tomato",
      image: tomatoImage,
      health: calculatePlantHealth("tomato", moisture, temperature, soilPh, humidity, lightIntensity),
      yield: CROP_DATA.tomato.yieldPerHectare,
      lastSeason: "+8%",
      harvest: `${CROP_DATA.tomato.totalDuration} weeks`,
      status: calculatePlantHealth("tomato", moisture, temperature, soilPh, humidity, lightIntensity) > 85 ? "Excellent" : "Good",
    },
    {
      name: "Chili",
      image: chiliImage,
      health: calculatePlantHealth("chili", moisture, temperature, soilPh, humidity, lightIntensity),
      yield: CROP_DATA.chili.yieldPerHectare,
      lastSeason: "+5%",
      harvest: `${CROP_DATA.chili.totalDuration} weeks`,
      status: calculatePlantHealth("chili", moisture, temperature, soilPh, humidity, lightIntensity) > 85 ? "Excellent" : "Good",
    },
    {
      name: "Brinjal",
      image: brinjalImage,
      health: calculatePlantHealth("brinjal", moisture, temperature, soilPh, humidity, lightIntensity),
      yield: CROP_DATA.brinjal.yieldPerHectare,
      lastSeason: "+12%",
      harvest: `${CROP_DATA.brinjal.totalDuration} weeks`,
      status: calculatePlantHealth("brinjal", moisture, temperature, soilPh, humidity, lightIntensity) > 85 ? "Excellent" : "Good",
    },
  ];

  const stats = [
    {
      title: "Current Yield",
      value: "3.8",
      unit: "tons/hectare",
      change: "+12%",
      icon: Sprout,
      trend: "up",
    },
    {
      title: "Active Crops",
      value: "3",
      unit: "varieties",
      change: "Stable",
      icon: Leaf,
      trend: "stable",
    },
    {
      title: "Forecast Accuracy",
      value: "94%",
      unit: "precision",
      change: "+3%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Next Harvest",
      value: "45",
      unit: "days",
      change: "On track",
      icon: Calendar,
      trend: "stable",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="animate-float mb-4 flex gap-4">
            <Sprout className="w-10 h-10 text-accent" />
            <TrendingUp className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 animate-fade-in">
            Agricultural Intelligence
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl animate-slide-up">
            Soil Digital Twin - Smart Irrigation & AI-Powered Yield Predictions
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-10 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card 
              key={idx} 
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                  <Badge 
                    variant={stat.trend === "up" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.unit}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Crop Selector */}
        <CropSelector
          selectedCrop={selectedCrop}
          onCropChange={setSelectedCrop}
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
        />

        {/* Export Button */}
        <div className="flex justify-end mb-6">
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
                onValueChange={(val) => {
                  setMoisture(val[0]);
                  // Moisture changes don't trigger other effects directly
                }}
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
                onValueChange={(val) => {
                  setTemperature(val[0]);
                  applyEnvironmentalEffects("temperature", val[0], {
                    moisture,
                    temperature: val[0],
                    humidity,
                    lightIntensity,
                    solarRadiation,
                    windSpeed,
                    airPressure,
                    todayRainfall,
                  });
                }}
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
                onValueChange={(val) => {
                  setHumidity(val[0]);
                  applyEnvironmentalEffects("humidity", val[0], {
                    moisture,
                    temperature,
                    humidity: val[0],
                    lightIntensity,
                    solarRadiation,
                    windSpeed,
                    airPressure,
                    todayRainfall,
                  });
                }}
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
                onValueChange={(val) => {
                  setLightIntensity(val[0]);
                  applyEnvironmentalEffects("lightIntensity", val[0], {
                    moisture,
                    temperature,
                    humidity,
                    lightIntensity: val[0],
                    solarRadiation,
                    windSpeed,
                    airPressure,
                    todayRainfall,
                  });
                }}
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
                onValueChange={(val) => {
                  setAirPressure(val[0]);
                  applyEnvironmentalEffects("airPressure", val[0], {
                    moisture,
                    temperature,
                    humidity,
                    lightIntensity,
                    solarRadiation,
                    windSpeed,
                    airPressure: val[0],
                    todayRainfall,
                  });
                }}
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
                onValueChange={(val) => {
                  setSolarRadiation(val[0]);
                  applyEnvironmentalEffects("solarRadiation", val[0], {
                    moisture,
                    temperature,
                    humidity,
                    lightIntensity,
                    solarRadiation: val[0],
                    windSpeed,
                    airPressure,
                    todayRainfall,
                  });
                }}
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
                onValueChange={(val) => {
                  setWindSpeed(val[0]);
                  applyEnvironmentalEffects("windSpeed", val[0], {
                    moisture,
                    temperature,
                    humidity,
                    lightIntensity,
                    solarRadiation,
                    windSpeed: val[0],
                    airPressure,
                    todayRainfall,
                  });
                }}
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
                onValueChange={(val) => {
                  setTodayRainfall(val[0]);
                  applyEnvironmentalEffects("todayRainfall", val[0], {
                    moisture,
                    temperature,
                    humidity,
                    lightIntensity,
                    solarRadiation,
                    windSpeed,
                    airPressure,
                    todayRainfall: val[0],
                  });
                }}
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
              todayRainfall={todayRainfall}
              totalRainfall={totalRainfall}
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
          selectedCrop={selectedCrop}
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
        />

        {/* Crop Timeline Visualization */}
        <CropTimeline selectedCrop={selectedCrop} currentWeek={currentWeek} />

        {/* Tomato Ripeness Tracker - Only for Tomato crop */}
        {selectedCrop === "tomato" && (
          <TomatoRipeness
            temperature={temperature}
            moisture={moisture}
            currentWeek={currentWeek}
          />
        )}

        {/* Disease Detection */}
        <DiseaseDetection
          selectedCrop={selectedCrop}
          currentWeek={currentWeek}
          moisture={moisture}
          temperature={temperature}
          humidity={humidity}
          soilPh={soilPh}
          lightIntensity={lightIntensity}
        />


        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Yield Prediction Timeline
            </CardTitle>
            <CardDescription>
              Historical actual yields vs AI-predicted future yields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis 
                  stroke="hsl(var(--foreground))" 
                  label={{ value: 'Tons/Hectare', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  fill="url(#actualGradient)" 
                  name="Actual Yield"
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)" 
                  name="Predicted Yield"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Forecast Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 animate-slide-up">
            <CardHeader>
              <CardTitle>6-Week Growth Forecast</CardTitle>
              <CardDescription>Projected vs optimal growth rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="projected" 
                    fill="hsl(var(--primary))" 
                    name="Projected" 
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="optimal" 
                    fill="hsl(var(--accent))" 
                    name="Optimal" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-primary" />
                  Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{temperature}°C</p>
                <p className="text-sm text-muted-foreground">Current range</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  Rainfall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalRainfall}mm</p>
                <p className="text-sm text-muted-foreground">Total rainfall</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  Growth Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Flowering</p>
                <p className="text-sm text-muted-foreground">Peak growth phase</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Insight Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 animate-glow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Forecast Benefits Active</h3>
                <p className="text-muted-foreground">
                  AI predictions indicate optimal conditions for the next 6 weeks. 
                  Expected yield increase of 8-12% compared to last season based on current growth patterns 
                  and environmental factors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crop Analysis Cards */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary" />
            Crop Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crops.map((crop, idx) => (
              <Card 
                key={idx} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={crop.image} 
                    alt={crop.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{crop.name}</h3>
                    <Badge variant={crop.status === "Excellent" ? "default" : "secondary"}>
                      {crop.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Health</span>
                        <span className="font-semibold">{crop.health}%</span>
                      </div>
                      <Progress value={crop.health} className="h-2" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Yield</span>
                        <span className="font-semibold">{crop.yield}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">vs Last Season</span>
                        <span className="font-semibold text-accent">{crop.lastSeason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Harvest</span>
                        <span className="font-semibold">{crop.harvest}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

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
            humidity={humidity}
            selectedCrop={selectedCrop}
            currentWeek={currentWeek}
          />
          
        </div>
      </div>

      <SoilAIChat />
    </div>
  );
};

export default Dashboard;
