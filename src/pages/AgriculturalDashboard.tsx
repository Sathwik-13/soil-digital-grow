import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sprout, TrendingUp, Calendar, Thermometer, Droplets, Leaf } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import heroImage from "@/assets/hero-farm-fields.jpg";
import wheatImage from "@/assets/wheat-field.jpg";
import riceImage from "@/assets/rice-field.jpg";
import cornImage from "@/assets/corn-field.jpg";

const AgriculturalDashboard = () => {
  // Yield prediction data
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

  // Growth forecast data
  const growthData = [
    { week: "Week 1", projected: 85, optimal: 90 },
    { week: "Week 2", projected: 88, optimal: 90 },
    { week: "Week 3", projected: 82, optimal: 90 },
    { week: "Week 4", projected: 90, optimal: 90 },
    { week: "Week 5", projected: 87, optimal: 90 },
    { week: "Week 6", projected: 91, optimal: 90 },
  ];

  // Crop data
  const crops = [
    {
      name: "Wheat",
      image: wheatImage,
      health: 92,
      yield: "4.8 tons/hectare",
      lastSeason: "+8%",
      harvest: "Aug 15, 2025",
      status: "Excellent",
    },
    {
      name: "Rice",
      image: riceImage,
      health: 88,
      yield: "5.2 tons/hectare",
      lastSeason: "+5%",
      harvest: "Sep 2, 2025",
      status: "Good",
    },
    {
      name: "Corn",
      image: cornImage,
      health: 85,
      yield: "6.1 tons/hectare",
      lastSeason: "+12%",
      harvest: "Aug 28, 2025",
      status: "Good",
    },
  ];

  // Stats data
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
        className="relative h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="animate-float mb-6 flex gap-4">
            <Sprout className="w-12 h-12 text-accent" />
            <TrendingUp className="w-12 h-12 text-secondary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
            Agricultural Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl animate-slide-up">
            AI-Powered Yield Predictions & Smart Farming Analytics
          </p>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 -mt-20 relative z-10 pb-12">
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

        {/* Yield Prediction Chart */}
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
                <p className="text-2xl font-bold">24°C</p>
                <p className="text-sm text-muted-foreground">Optimal range</p>
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
                <p className="text-2xl font-bold">125mm</p>
                <p className="text-sm text-muted-foreground">This month</p>
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
      </div>
    </div>
  );
};

export default AgriculturalDashboard;
