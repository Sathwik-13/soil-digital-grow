import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Droplets, Cpu, BarChart3, Download } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Soil Digital Twin
          </h1>
          <p className="text-2xl text-muted-foreground">
            Smart Irrigation Management System
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Virtual replica of soil conditions with real-time monitoring, AI-powered insights, 
            and Excel export capabilities for sustainable water management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl w-full">
          <div className="p-6 bg-card border rounded-lg">
            <Droplets className="w-8 h-8 text-primary mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Virtual Field</h3>
            <p className="text-sm text-muted-foreground">Simulate environmental changes</p>
          </div>
          <div className="p-6 bg-card border rounded-lg">
            <Cpu className="w-8 h-8 text-primary mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">IoT Sensors</h3>
            <p className="text-sm text-muted-foreground">Manual control and monitoring</p>
          </div>
          <div className="p-6 bg-card border rounded-lg">
            <BarChart3 className="w-8 h-8 text-primary mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Real-time Data</h3>
            <p className="text-sm text-muted-foreground">Live environmental tracking</p>
          </div>
          <div className="p-6 bg-card border rounded-lg">
            <Download className="w-8 h-8 text-primary mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Excel Export</h3>
            <p className="text-sm text-muted-foreground">Track changes and results</p>
          </div>
        </div>

        <Button onClick={() => navigate("/dashboard")} size="lg" className="text-lg px-8 py-6">
          Launch Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Index;
