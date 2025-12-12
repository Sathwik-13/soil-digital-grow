import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Leaf, Thermometer, Droplets, Activity } from "lucide-react";
import { CROP_DATA, getCropList, getCurrentStage, getStageProgress, getOverallProgress, CropData, GrowthStage } from "@/data/cropData";

interface CropSelectorProps {
  selectedCrop: string;
  onCropChange: (cropId: string) => void;
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

const CropSelector = ({ selectedCrop, onCropChange, currentWeek, onWeekChange }: CropSelectorProps) => {
  const crops = getCropList();
  const crop = CROP_DATA[selectedCrop];
  const currentStage = getCurrentStage(selectedCrop, currentWeek);
  const stageProgress = getStageProgress(selectedCrop, currentWeek);
  const overallProgress = getOverallProgress(selectedCrop, currentWeek);

  const getStageColor = (stage: GrowthStage, isActive: boolean) => {
    if (isActive) return "bg-primary text-primary-foreground";
    const stageIndex = crop?.stages.indexOf(stage) || 0;
    const currentIndex = crop?.stages.findIndex(s => s === currentStage) || 0;
    if (stageIndex < currentIndex) return "bg-accent/20 text-accent-foreground border-accent";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Crop Selection */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Select Your Crop
          </CardTitle>
          <CardDescription>Choose from Tomato, Chili, or Brinjal - optimized for Bangalore climate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {crops.map((c) => (
              <Button
                key={c.id}
                variant={selectedCrop === c.id ? "default" : "outline"}
                onClick={() => onCropChange(c.id)}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs opacity-80">{c.totalMonths} months</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Crop Info */}
      {crop && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{crop.icon}</span>
                  {crop.name}
                  <Badge variant="secondary" className="ml-2">{crop.scientificName}</Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  Total duration: {crop.totalDuration} weeks (~{crop.totalMonths} months)
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Yield Potential</p>
                <p className="text-lg font-bold text-primary">{crop.yieldPerHectare}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Week Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Current Week: {currentWeek} of {crop.totalDuration}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}% Complete
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
                  disabled={currentWeek <= 1}
                >
                  -
                </Button>
                <input
                  type="range"
                  min={1}
                  max={crop.totalDuration}
                  value={currentWeek}
                  onChange={(e) => onWeekChange(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWeekChange(Math.min(crop.totalDuration, currentWeek + 1))}
                  disabled={currentWeek >= crop.totalDuration}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Optimal Conditions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Temperature</span>
                </div>
                <p className="font-semibold">{crop.optimalTemperature.min}-{crop.optimalTemperature.max}°C</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Moisture</span>
                </div>
                <p className="font-semibold">{crop.optimalMoisture.min}-{crop.optimalMoisture.max}%</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">pH Level</span>
                </div>
                <p className="font-semibold">{crop.optimalPh.min}-{crop.optimalPh.max}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Spacing</span>
                </div>
                <p className="font-semibold">{crop.spacing.row}×{crop.spacing.plant}cm</p>
              </div>
            </div>

            {/* Growth Stages Timeline */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Growth Stages
              </h4>
              <div className="flex gap-2 flex-wrap">
                {crop.stages.map((stage, idx) => {
                  const isActive = currentStage?.name === stage.name;
                  return (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={`cursor-pointer transition-all ${getStageColor(stage, isActive)} ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => onWeekChange(stage.startWeek)}
                    >
                      {stage.name}
                      <span className="ml-1 opacity-70">(W{stage.startWeek}-{stage.endWeek})</span>
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Current Stage Details */}
            {currentStage && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Current Stage: {currentStage.name}</span>
                    <Badge>{Math.round(stageProgress)}% Complete</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{currentStage.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Optimal Temperature</p>
                      <p className="font-semibold">{currentStage.optimalTemp.min}-{currentStage.optimalTemp.max}°C</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Height</p>
                      <p className="font-semibold">{currentStage.expectedHeight.min}-{currentStage.expectedHeight.max} cm</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Water Requirement</p>
                      <p className="font-semibold">{currentStage.waterRequirement}/week</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Moisture Level</p>
                      <p className="font-semibold">{currentStage.optimalMoisture.min}-{currentStage.optimalMoisture.max}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Key Activities:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentStage.keyActivities.map((activity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CropSelector;
