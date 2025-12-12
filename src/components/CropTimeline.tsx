import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sprout, Flower2, Apple, Scissors, CheckCircle2, Clock, Droplets, Thermometer } from "lucide-react";
import { CROP_DATA, getCurrentStage, getStageProgress, getOverallProgress, GrowthStage } from "@/data/cropData";

interface CropTimelineProps {
  selectedCrop: string;
  currentWeek: number;
}

const stageIcons: Record<string, React.ElementType> = {
  "Seedling Stage": Sprout,
  "Vegetative Growth": Sprout,
  "Flowering Stage": Flower2,
  "Fruit Development": Apple,
  "Harvesting Stage": Scissors,
};

const CropTimeline = ({ selectedCrop, currentWeek }: CropTimelineProps) => {
  const crop = CROP_DATA[selectedCrop];
  if (!crop) return null;

  const currentStage = getCurrentStage(selectedCrop, currentWeek);
  const stageProgress = getStageProgress(selectedCrop, currentWeek);
  const overallProgress = getOverallProgress(selectedCrop, currentWeek);

  const getStageStatus = (stage: GrowthStage) => {
    if (currentWeek > stage.endWeek) return "completed";
    if (currentWeek >= stage.startWeek && currentWeek <= stage.endWeek) return "active";
    return "upcoming";
  };

  return (
    <Card className="animate-fade-in border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{crop.icon}</span>
              {crop.name} Growth Timeline
            </CardTitle>
            <CardDescription>
              Week {currentWeek} of {crop.totalDuration} • {crop.scientificName}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {Math.round(overallProgress)}% Complete
          </Badge>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Progress</span>
            <span>{currentWeek} / {crop.totalDuration} weeks</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline Visualization */}
        <div className="relative">
          {/* Timeline Track */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {crop.stages.map((stage, index) => {
              const status = getStageStatus(stage);
              const StageIcon = stageIcons[stage.name] || Sprout;
              const isActive = status === "active";
              const isCompleted = status === "completed";

              return (
                <div 
                  key={stage.name} 
                  className={`relative pl-14 transition-all duration-300 ${
                    isActive ? "scale-[1.02]" : ""
                  }`}
                >
                  {/* Timeline Node */}
                  <div 
                    className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : isActive 
                          ? "bg-accent text-accent-foreground ring-4 ring-accent/30 animate-pulse" 
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <StageIcon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Stage Card */}
                  <div 
                    className={`rounded-lg border p-4 transition-all duration-300 ${
                      isActive 
                        ? "bg-accent/10 border-accent shadow-md" 
                        : isCompleted 
                          ? "bg-primary/5 border-primary/20" 
                          : "bg-muted/30 border-border/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${isActive ? "text-accent-foreground" : ""}`}>
                            {stage.name}
                          </h4>
                          {isActive && (
                            <Badge className="bg-accent text-accent-foreground text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Weeks {stage.startWeek} - {stage.endWeek} • {stage.endWeek - stage.startWeek + 1} weeks
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {stage.description}
                        </p>
                      </div>
                      
                      {/* Stage Stats */}
                      <div className="hidden sm:flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          {stage.optimalTemp.min}-{stage.optimalTemp.max}°C
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          {stage.waterRequirement}
                        </div>
                      </div>
                    </div>

                    {/* Stage Progress (only for active stage) */}
                    {isActive && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Stage Progress</span>
                          <span>{Math.round(stageProgress)}%</span>
                        </div>
                        <Progress value={stageProgress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Week Activities */}
        {currentStage && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Week {currentWeek} Activities</h4>
            </div>
            <ul className="grid gap-2">
              {currentStage.keyActivities.map((activity, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-2 text-sm"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
            
            {/* Expected Height */}
            <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expected plant height:</span>
              <Badge variant="secondary">
                {currentStage.expectedHeight.min} - {currentStage.expectedHeight.max} cm
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropTimeline;
