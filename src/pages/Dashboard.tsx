import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Droplets, Thermometer, Wind, Sun, CloudRain, Zap, BarChart3, Sprout, TrendingUp, Calendar, Leaf } from "lucide-react";
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
import CropRipeness from "@/components/CropRipeness";
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
  solarRadiation: number;
  rainfall: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [moisture, setMoisture] = useState(45);
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);
  const [soilPh, setSoilPh] = useState(6.5);
  const [lightIntensity, setLightIntensity] = useState(70);
  const [solarRadiation, setSolarRadiation] = useState(149);
  const [rainfall, setRainfall] = useState(12);
  const [dataLog, setDataLog] = useState<SensorData[]>([]);
  const [nitrogen, setNitrogen] = useState(65);
  const [phosphorus, setPhosphorus] = useState(70);
  const [potassium, setPotassium] = useState(60);
  const [activeGraph, setActiveGraph] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState("tomato");
  const [currentWeek, setCurrentWeek] = useState(1);
  const [ripenessDay, setRipenessDay] = useState(0);

  const crop = CROP_DATA[selectedCrop];
  const currentStage = getCurrentStage(selectedCrop, currentWeek);
  const cropImages: Record<string, string> = { tomato: tomatoImage, chili: chiliImage, brinjal: brinjalImage };

  // Apply realistic environmental interdependencies
  const applyEnvironmentalEffects = (
    changedFactor: string,
    newValue: number,
  ) => {
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    switch (changedFactor) {
      case "solarRadiation": {
        const solarEffect = (newValue - 100) / 100;
        setTemperature(prev => clamp(prev + solarEffect * 2, 15, 45));
        setLightIntensity(prev => clamp(prev + solarEffect * 5, 0, 100));
        setHumidity(prev => clamp(prev - solarEffect * 3, 0, 100));
        setMoisture(prev => clamp(prev - solarEffect * 1.5, 0, 100));
        break;
      }
      case "temperature": {
        const tempEffect = (newValue - 25) / 10;
        setHumidity(prev => clamp(prev - tempEffect * 4, 0, 100));
        setMoisture(prev => clamp(prev - tempEffect * 2, 0, 100));
        break;
      }
      case "rainfall": {
        const rainEffect = newValue / 10;
        setMoisture(prev => clamp(prev + rainEffect * 8, 0, 100));
        setHumidity(prev => clamp(prev + rainEffect * 5, 0, 100));
        setTemperature(prev => clamp(prev - rainEffect * 0.5, 15, 45));
        break;
      }
      case "humidity": {
        const humidityEffect = (newValue - 50) / 50;
        setMoisture(prev => clamp(prev + humidityEffect * 2, 0, 100));
        break;
      }
      case "lightIntensity": {
        const lightEffect = (newValue - 50) / 50;
        setTemperature(prev => clamp(prev + lightEffect * 1.5, 15, 45));
        setMoisture(prev => clamp(prev - lightEffect * 1, 0, 100));
        break;
      }
    }
  };

  // Simulate Bangalore climate variations
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prev => {
        const bangaloreTemp = 22 + Math.random() * 10;
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
      solarRadiation,
      rainfall,
    };
    setDataLog(prev => [...prev.slice(-99), newEntry]);
  }, [moisture, temperature, humidity, soilPh, lightIntensity, solarRadiation, rainfall]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      dataLog.map(entry => ({
        Timestamp: new Date(entry.timestamp).toLocaleString(),
        "Moisture (%)": entry.moisture,
        "Temperature (°C)": entry.temperature,
        "Humidity (%)": entry.humidity,
        "Soil pH": entry.soilPh,
        "Light Intensity (%)": entry.lightIntensity,
        "Solar Radiation (W/m²)": entry.solarRadiation,
        "Rainfall (mm)": entry.rainfall,
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
        metric === "solarRadiation" ? entry.solarRadiation :
        entry.rainfall,
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

  // Water efficiency data
  const waterEfficiencyData = (() => {
    const moistureStress = moisture < 30 ? 1 : moisture > 70 ? 0.8 : 0.3;
    const tempStress = temperature > 35 ? 1 : temperature < 20 ? 0.7 : 0.2;
    const humidityFactor = humidity > 80 ? 0.9 : humidity < 40 ? 0.6 : 0.3;
    const phStress = soilPh < 5.5 || soilPh > 7.5 ? 0.8 : 0.2;

    return [
      { scenario: "Optimal", manual: Math.round(2 + moistureStress * 3), digitalTwin: Math.round(5 + moistureStress * 5) },
      { scenario: "Water Stress", manual: Math.round(8 + moistureStress * 8), digitalTwin: Math.round(12 + moistureStress * 12) },
      { scenario: "Disease-Prone", manual: Math.round(10 + humidityFactor * 10 + tempStress * 5), digitalTwin: Math.round(18 + humidityFactor * 12 + tempStress * 8) },
      { scenario: "Multi-Stress", manual: Math.round(12 + (moistureStress + tempStress + phStress) * 5), digitalTwin: Math.round(15 + (moistureStress + tempStress + phStress) * 7) },
      { scenario: "Seasonal", manual: Math.round(6 + tempStress * 6), digitalTwin: Math.round(8 + tempStress * 8) },
    ];
  })();

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
    { title: "Current Yield", value: "3.8", unit: "tons/hectare", change: "+12%", icon: Sprout, trend: "up" },
    { title: "Active Crops", value: "3", unit: "varieties", change: "Stable", icon: Leaf, trend: "stable" },
    { title: "Forecast Accuracy", value: "94%", unit: "precision", change: "+3%", icon: TrendingUp, trend: "up" },
    { title: "Next Harvest", value: "45", unit: "days", change: "On track", icon: Calendar, trend: "stable" },
  ];

  const graphMetaMap: Record<string, { title: string; unit: string; color: string }> = {
    moisture: { title: "Soil Moisture", unit: "%", color: "#3b82f6" },
    temperature: { title: "Temperature", unit: "°C", color: "#ef4444" },
    humidity: { title: "Humidity", unit: "%", color: "#06b6d4" },
    soilPh: { title: "Soil pH", unit: "pH", color: "#8b5cf6" },
    lightIntensity: { title: "Light Intensity", unit: "%", color: "#eab308" },
    solarRadiation: { title: "Solar Radiation", unit: "W/m²", color: "#f97316" },
    rainfall: { title: "Rainfall", unit: "mm", color: "#2563eb" },
  };

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
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
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

        {/* 3D Field + Controls Side by Side */}
        <Card className="border-2 border-primary/20 mb-6 overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle>🌾 3D Virtual Field Visualization</CardTitle>
            <CardDescription>Adjust parameters on the right and observe real-time changes in the 3D field</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* 3D Field */}
              <div className="flex-1 min-h-[500px] rounded-lg overflow-hidden border border-border">
                <VirtualField3D
                  moisture={moisture}
                  temperature={temperature}
                  soilPh={soilPh}
                  lightIntensity={lightIntensity}
                  humidity={humidity}
                  todayRainfall={rainfall}
                  totalRainfall={rainfall}
                  selectedCrop={selectedCrop}
                  currentWeek={currentWeek}
                  ripenessDay={ripenessDay}
                />
              </div>

              {/* Sensor Controls Panel */}
              <div className="lg:w-80 xl:w-96 flex flex-col gap-2 max-h-[540px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-primary/10">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Sensor Controls
                  </h3>
                  <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
                    Live
                  </Badge>
                </div>

                {/* Sensor Cards */}
                {[
                  {
                    key: "moisture", label: "Soil Moisture", icon: Droplets,
                    value: moisture, display: `${moisture}%`, color: "hsl(210, 80%, 55%)",
                    min: 0, max: 100, step: 1,
                    onChange: (v: number) => setMoisture(v),
                    status: moisture < 30 ? "Low" : moisture > 70 ? "High" : "Optimal",
                    statusColor: moisture < 30 || moisture > 70 ? "destructive" as const : "default" as const,
                  },
                  {
                    key: "temperature", label: "Temperature", icon: Thermometer,
                    value: temperature, display: `${temperature}°C`, color: "hsl(0, 75%, 55%)",
                    min: 15, max: 45, step: 0.1,
                    onChange: (v: number) => { setTemperature(v); applyEnvironmentalEffects("temperature", v); },
                    status: temperature < 20 ? "Cold" : temperature > 35 ? "Hot" : "Optimal",
                    statusColor: (temperature < 20 || temperature > 35) ? "destructive" as const : "default" as const,
                  },
                  {
                    key: "humidity", label: "Humidity", icon: Wind,
                    value: humidity, display: `${humidity}%`, color: "hsl(185, 70%, 45%)",
                    min: 0, max: 100, step: 1,
                    onChange: (v: number) => { setHumidity(v); applyEnvironmentalEffects("humidity", v); },
                    status: humidity < 40 ? "Dry" : humidity > 80 ? "Wet" : "Normal",
                    statusColor: (humidity < 40 || humidity > 80) ? "destructive" as const : "default" as const,
                  },
                  {
                    key: "soilPh", label: "Soil pH", icon: null,
                    value: soilPh, display: soilPh.toFixed(1), color: "hsl(270, 60%, 55%)",
                    min: 4, max: 9, step: 0.1,
                    onChange: (v: number) => setSoilPh(v),
                    status: soilPh < 6 ? "Acidic" : soilPh > 7.5 ? "Alkaline" : "Balanced",
                    statusColor: (soilPh < 6 || soilPh > 7.5) ? "destructive" as const : "default" as const,
                  },
                  {
                    key: "lightIntensity", label: "Light Intensity", icon: Sun,
                    value: lightIntensity, display: `${lightIntensity}%`, color: "hsl(45, 90%, 50%)",
                    min: 0, max: 100, step: 1,
                    onChange: (v: number) => { setLightIntensity(v); applyEnvironmentalEffects("lightIntensity", v); },
                    status: lightIntensity < 30 ? "Low" : lightIntensity > 85 ? "Intense" : "Good",
                    statusColor: (lightIntensity < 30 || lightIntensity > 85) ? "destructive" as const : "default" as const,
                  },
                  {
                    key: "solarRadiation", label: "Solar Radiation", icon: Zap,
                    value: solarRadiation, display: `${solarRadiation} W/m²`, color: "hsl(25, 90%, 55%)",
                    min: 0, max: 1000, step: 1,
                    onChange: (v: number) => { setSolarRadiation(v); applyEnvironmentalEffects("solarRadiation", v); },
                    status: solarRadiation < 100 ? "Low" : solarRadiation > 600 ? "High" : "Normal",
                    statusColor: (solarRadiation < 100 || solarRadiation > 600) ? "destructive" as const : "default" as const,
                  },
                  {
                    key: "rainfall", label: "Rainfall", icon: CloudRain,
                    value: rainfall, display: `${rainfall} mm`, color: "hsl(210, 90%, 45%)",
                    min: 0, max: 200, step: 0.5,
                    onChange: (v: number) => { setRainfall(v); applyEnvironmentalEffects("rainfall", v); },
                    status: rainfall < 5 ? "Dry" : rainfall > 50 ? "Heavy" : "Moderate",
                    statusColor: (rainfall > 50) ? "destructive" as const : "default" as const,
                  },
                ].map((sensor) => (
                  <div
                    key={sensor.key}
                    className="rounded-lg border border-border bg-card p-2.5 space-y-1.5 hover:shadow-md transition-all duration-200 hover:border-primary/30"
                    style={{ borderLeftWidth: "3px", borderLeftColor: sensor.color }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        {sensor.icon ? <sensor.icon className="w-3.5 h-3.5" style={{ color: sensor.color }} /> : <span className="text-[10px] font-bold rounded px-1 py-0.5" style={{ color: sensor.color, backgroundColor: `${sensor.color}20` }}>pH</span>}
                        {sensor.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={sensor.statusColor} className="text-[9px] h-4 px-1.5">
                          {sensor.status}
                        </Badge>
                        <span className="text-sm font-bold text-foreground tabular-nums">{sensor.display}</span>
                      </div>
                    </div>
                    <Slider
                      value={[sensor.value]}
                      onValueChange={(val) => sensor.onChange(val[0])}
                      min={sensor.min}
                      max={sensor.max}
                      step={sensor.step}
                    />
                  </div>
                ))}

                {/* Quick Actions */}
                <div className="rounded-lg border border-border bg-muted/50 p-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">📊 View History</p>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(graphMetaMap).map(([key, meta]) => (
                      <Button key={key} onClick={() => setActiveGraph(key)} variant="ghost" size="sm" className="text-[10px] h-6 px-2 justify-start hover:bg-primary/10 hover:text-primary">
                        <BarChart3 className="w-3 h-3 mr-1 shrink-0" />{meta.title}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <p className="text-[10px] text-muted-foreground font-medium">{dataLog.length} data points logged</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graph Dialog */}
        <Dialog open={!!activeGraph} onOpenChange={(open) => { if (!open) setActiveGraph(null); }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{activeGraph && graphMetaMap[activeGraph]?.title} History</DialogTitle>
              <DialogDescription>Last 50 readings</DialogDescription>
            </DialogHeader>
            {activeGraph && graphMetaMap[activeGraph] && (
              <MetricGraph
                title={graphMetaMap[activeGraph].title}
                data={getGraphData(activeGraph)}
                unit={graphMetaMap[activeGraph].unit}
                color={graphMetaMap[activeGraph].color}
                onClose={() => setActiveGraph(null)}
              />
            )}
          </DialogContent>
        </Dialog>

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

        {/* Crop Ripeness Tracker */}
        <CropRipeness
          selectedCrop={selectedCrop}
          temperature={temperature}
          moisture={moisture}
          currentWeek={currentWeek}
          onRipenessChange={(days) => setRipenessDay(days)}
        />

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
              <Droplets className="w-5 h-5 text-primary" />
              Water Use Efficiency: Manual vs Soil Digital Twin
            </CardTitle>
            <CardDescription>
              Comparison of water savings across different agricultural scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={waterEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="scenario" stroke="hsl(var(--foreground))" />
                <YAxis 
                  stroke="hsl(var(--foreground))" 
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Water Savings (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Legend />
                <Bar dataKey="manual" fill="hsl(210, 60%, 55%)" name="Manual Scheduling" radius={[4, 4, 0, 0]} label={{ position: 'top', formatter: (v: number) => `${v}%`, fill: 'hsl(210, 60%, 55%)', fontSize: 12, fontWeight: 'bold' }} />
                <Bar dataKey="digitalTwin" fill="hsl(120, 50%, 55%)" name="Digital Twin" radius={[4, 4, 0, 0]} label={{ position: 'top', formatter: (v: number) => `${v}%`, fill: 'hsl(120, 50%, 55%)', fontSize: 12, fontWeight: 'bold' }} />
              </BarChart>
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
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="projected" fill="hsl(var(--primary))" name="Projected" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="optimal" fill="hsl(var(--accent))" name="Optimal" radius={[8, 8, 0, 0]} />
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
                <p className="text-2xl font-bold">{rainfall}mm</p>
                <p className="text-sm text-muted-foreground">Current rainfall</p>
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
                <p className="text-2xl font-bold">{currentStage?.name || "Flowering"}</p>
                <p className="text-sm text-muted-foreground">Current phase</p>
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
                  <img src={crop.image} alt={crop.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{crop.name}</h3>
                    <Badge variant={crop.status === "Excellent" ? "default" : "secondary"}>{crop.status}</Badge>
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
                <div key={idx} className="p-3 bg-muted rounded-lg text-sm font-medium">{effect}</div>
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
