import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FieldPhotoAnalysis = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    healthScore: number;
    findings: string[];
    recommendations: string[];
  } | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze the image
    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;

        // Call edge function for AI analysis
        const { data, error } = await supabase.functions.invoke("analyze-field-photo", {
          body: { image: base64Image },
        });

        if (error) throw error;

        setAnalysis(data);
        toast({
          title: "Analysis Complete",
          description: "Field photo has been analyzed successfully",
        });
      };
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Field Photo Analysis
        </CardTitle>
        <CardDescription>Upload field images for AI-powered health assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="photo-upload"
            className="w-full cursor-pointer"
          >
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to upload field photo</p>
              <p className="text-xs text-muted-foreground">Supports JPG, PNG (max 5MB)</p>
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {selectedImage && (
            <div className="w-full">
              <img
                src={selectedImage}
                alt="Selected field"
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Analyzing image...</span>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <div className="w-full space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Field Health Score</span>
                  <span className={`text-2xl font-bold ${getHealthColor(analysis.healthScore)}`}>
                    {analysis.healthScore}%
                  </span>
                </div>
              </div>

              {analysis.findings.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Key Findings
                  </h4>
                  <div className="space-y-2">
                    {analysis.findings.map((finding, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                        {finding}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg text-sm flex items-start gap-2">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldPhotoAnalysis;
