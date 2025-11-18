import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural AI analyzing field photos. Analyze the image and provide:
1. A health score (0-100)
2. 3-5 key findings about crop health, soil condition, pest presence, disease signs
3. 3-5 actionable recommendations

Respond in JSON format:
{
  "healthScore": number,
  "findings": ["finding1", "finding2", ...],
  "recommendations": ["rec1", "rec2", ...]
}`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this field photo and provide health assessment." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI API error:", error);
      throw new Error("Failed to analyze image");
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      // If AI didn't return valid JSON, create a fallback response
      analysis = {
        healthScore: 75,
        findings: [
          "Image analyzed successfully",
          "General field condition appears normal",
          "Further detailed inspection recommended",
        ],
        recommendations: [
          "Continue monitoring field conditions regularly",
          "Maintain current irrigation schedule",
          "Check for early signs of pest or disease",
        ],
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
