// Realistic crop data for Tomato, Chili, and Brinjal (Eggplant)
// Based on Bangalore climate conditions and real agricultural data

export interface GrowthStage {
  name: string;
  startWeek: number;
  endWeek: number;
  description: string;
  optimalTemp: { min: number; max: number };
  optimalMoisture: { min: number; max: number };
  optimalPh: { min: number; max: number };
  expectedHeight: { min: number; max: number }; // in cm
  waterRequirement: string; // mm per week
  keyActivities: string[];
}

export interface CropData {
  id: string;
  name: string;
  scientificName: string;
  totalDuration: number; // in weeks
  totalMonths: number;
  stages: GrowthStage[];
  optimalTemperature: { min: number; max: number };
  optimalMoisture: { min: number; max: number };
  optimalPh: { min: number; max: number };
  optimalHumidity: { min: number; max: number };
  yieldPerPlant: string;
  yieldPerHectare: string;
  spacing: { row: number; plant: number }; // in cm
  color: string;
  icon: string;
}

export const CROP_DATA: Record<string, CropData> = {
  tomato: {
    id: "tomato",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    totalDuration: 16, // 16 weeks = ~4 months
    totalMonths: 4,
    optimalTemperature: { min: 21, max: 29 },
    optimalMoisture: { min: 60, max: 80 },
    optimalPh: { min: 6.0, max: 6.8 },
    optimalHumidity: { min: 50, max: 70 },
    yieldPerPlant: "3-5 kg",
    yieldPerHectare: "25-40 tons",
    spacing: { row: 60, plant: 45 },
    color: "#e53935",
    icon: "🍅",
    stages: [
      {
        name: "Seedling Stage",
        startWeek: 1,
        endWeek: 3,
        description: "Seeds germinate in 5-10 days. Cotyledons emerge followed by first true leaves.",
        optimalTemp: { min: 24, max: 28 },
        optimalMoisture: { min: 70, max: 80 },
        optimalPh: { min: 6.0, max: 6.5 },
        expectedHeight: { min: 5, max: 15 },
        waterRequirement: "10-15 mm",
        keyActivities: ["Maintain consistent moisture", "Provide 12-14 hours light", "Thin seedlings if crowded"],
      },
      {
        name: "Vegetative Growth",
        startWeek: 4,
        endWeek: 7,
        description: "Rapid stem and leaf development. Plant establishes strong root system.",
        optimalTemp: { min: 22, max: 28 },
        optimalMoisture: { min: 60, max: 75 },
        optimalPh: { min: 6.0, max: 6.8 },
        expectedHeight: { min: 30, max: 60 },
        waterRequirement: "25-35 mm",
        keyActivities: ["Apply nitrogen fertilizer", "Install stakes/cages", "Remove suckers below first flower"],
      },
      {
        name: "Flowering Stage",
        startWeek: 8,
        endWeek: 10,
        description: "Yellow flowers appear in clusters. Pollination occurs. Critical period for fruit set.",
        optimalTemp: { min: 21, max: 27 },
        optimalMoisture: { min: 65, max: 80 },
        optimalPh: { min: 6.2, max: 6.8 },
        expectedHeight: { min: 60, max: 90 },
        waterRequirement: "35-45 mm",
        keyActivities: ["Ensure consistent watering", "Apply phosphorus fertilizer", "Monitor for pests", "Avoid temperature extremes"],
      },
      {
        name: "Fruit Development",
        startWeek: 11,
        endWeek: 14,
        description: "Green fruits grow and mature. Fruits develop color as they ripen.",
        optimalTemp: { min: 20, max: 28 },
        optimalMoisture: { min: 60, max: 75 },
        optimalPh: { min: 6.0, max: 6.8 },
        expectedHeight: { min: 90, max: 150 },
        waterRequirement: "40-50 mm",
        keyActivities: ["Apply potassium fertilizer", "Support heavy fruit clusters", "Monitor for diseases", "Reduce nitrogen"],
      },
      {
        name: "Harvesting Stage",
        startWeek: 15,
        endWeek: 16,
        description: "Fruits reach mature color. Harvest when firm and fully colored.",
        optimalTemp: { min: 20, max: 26 },
        optimalMoisture: { min: 55, max: 70 },
        optimalPh: { min: 6.0, max: 6.8 },
        expectedHeight: { min: 120, max: 180 },
        waterRequirement: "30-40 mm",
        keyActivities: ["Harvest regularly", "Store at 12-15°C", "Continue monitoring for pests"],
      },
    ],
  },
  chili: {
    id: "chili",
    name: "Chili",
    scientificName: "Capsicum annuum",
    totalDuration: 20, // 20 weeks = ~5 months
    totalMonths: 5,
    optimalTemperature: { min: 20, max: 32 },
    optimalMoisture: { min: 55, max: 75 },
    optimalPh: { min: 6.0, max: 7.0 },
    optimalHumidity: { min: 45, max: 65 },
    yieldPerPlant: "1-2 kg",
    yieldPerHectare: "8-15 tons",
    spacing: { row: 60, plant: 45 },
    color: "#d32f2f",
    icon: "🌶️",
    stages: [
      {
        name: "Seedling Stage",
        startWeek: 1,
        endWeek: 4,
        description: "Seeds germinate in 8-14 days. Slower germination than tomatoes. First true leaves appear.",
        optimalTemp: { min: 25, max: 30 },
        optimalMoisture: { min: 70, max: 80 },
        optimalPh: { min: 6.0, max: 6.5 },
        expectedHeight: { min: 5, max: 12 },
        waterRequirement: "8-12 mm",
        keyActivities: ["Keep soil warm", "Light watering", "Provide indirect sunlight initially"],
      },
      {
        name: "Vegetative Growth",
        startWeek: 5,
        endWeek: 9,
        description: "Branching pattern develops. Plant builds strong framework for fruit production.",
        optimalTemp: { min: 22, max: 30 },
        optimalMoisture: { min: 60, max: 75 },
        optimalPh: { min: 6.0, max: 7.0 },
        expectedHeight: { min: 20, max: 45 },
        waterRequirement: "20-30 mm",
        keyActivities: ["Apply balanced NPK", "Pinch growing tip at 30cm", "Weed control", "Mulching"],
      },
      {
        name: "Flowering Stage",
        startWeek: 10,
        endWeek: 13,
        description: "White flowers appear at branch nodes. Multiple flowering flushes occur.",
        optimalTemp: { min: 20, max: 28 },
        optimalMoisture: { min: 60, max: 70 },
        optimalPh: { min: 6.2, max: 6.8 },
        expectedHeight: { min: 45, max: 65 },
        waterRequirement: "25-35 mm",
        keyActivities: ["Avoid water stress", "Apply calcium", "Monitor for aphids", "Maintain even moisture"],
      },
      {
        name: "Fruit Development",
        startWeek: 14,
        endWeek: 17,
        description: "Green chilies develop and grow. Color change begins in late stage.",
        optimalTemp: { min: 22, max: 30 },
        optimalMoisture: { min: 55, max: 70 },
        optimalPh: { min: 6.0, max: 7.0 },
        expectedHeight: { min: 60, max: 90 },
        waterRequirement: "30-40 mm",
        keyActivities: ["Increase potassium", "Support branches", "Regular pest monitoring", "Reduce nitrogen"],
      },
      {
        name: "Harvesting Stage",
        startWeek: 18,
        endWeek: 20,
        description: "Harvest green or wait for full color. Multiple harvests possible.",
        optimalTemp: { min: 20, max: 28 },
        optimalMoisture: { min: 50, max: 65 },
        optimalPh: { min: 6.0, max: 7.0 },
        expectedHeight: { min: 75, max: 120 },
        waterRequirement: "25-35 mm",
        keyActivities: ["Harvest every 5-7 days", "Handle carefully", "Continue watering for multiple harvests"],
      },
    ],
  },
  brinjal: {
    id: "brinjal",
    name: "Brinjal",
    scientificName: "Solanum melongena",
    totalDuration: 18, // 18 weeks = ~4.5 months
    totalMonths: 4.5,
    optimalTemperature: { min: 22, max: 35 },
    optimalMoisture: { min: 60, max: 80 },
    optimalPh: { min: 5.5, max: 6.8 },
    optimalHumidity: { min: 50, max: 70 },
    yieldPerPlant: "2-4 kg",
    yieldPerHectare: "20-35 tons",
    spacing: { row: 75, plant: 60 },
    color: "#5e35b1",
    icon: "🍆",
    stages: [
      {
        name: "Seedling Stage",
        startWeek: 1,
        endWeek: 4,
        description: "Seeds germinate in 7-14 days. Requires warm conditions for germination.",
        optimalTemp: { min: 25, max: 30 },
        optimalMoisture: { min: 70, max: 85 },
        optimalPh: { min: 5.5, max: 6.5 },
        expectedHeight: { min: 8, max: 18 },
        waterRequirement: "12-18 mm",
        keyActivities: ["Maintain 25-30°C soil temp", "Light watering", "Harden off before transplanting"],
      },
      {
        name: "Vegetative Growth",
        startWeek: 5,
        endWeek: 8,
        description: "Strong stem and leaf development. Dark green foliage indicates healthy growth.",
        optimalTemp: { min: 24, max: 32 },
        optimalMoisture: { min: 65, max: 80 },
        optimalPh: { min: 5.5, max: 6.8 },
        expectedHeight: { min: 25, max: 50 },
        waterRequirement: "30-40 mm",
        keyActivities: ["Apply nitrogen-rich fertilizer", "Stake plants early", "Control weeds", "Deep watering"],
      },
      {
        name: "Flowering Stage",
        startWeek: 9,
        endWeek: 11,
        description: "Purple flowers appear. Self-pollinating but benefits from insect activity.",
        optimalTemp: { min: 22, max: 30 },
        optimalMoisture: { min: 65, max: 75 },
        optimalPh: { min: 6.0, max: 6.8 },
        expectedHeight: { min: 50, max: 75 },
        waterRequirement: "35-45 mm",
        keyActivities: ["Apply phosphorus", "Avoid high nitrogen", "Monitor for fruit borers", "Consistent watering"],
      },
      {
        name: "Fruit Development",
        startWeek: 12,
        endWeek: 15,
        description: "Fruits grow rapidly. Skin develops characteristic purple/dark color.",
        optimalTemp: { min: 24, max: 32 },
        optimalMoisture: { min: 60, max: 75 },
        optimalPh: { min: 5.5, max: 6.8 },
        expectedHeight: { min: 70, max: 100 },
        waterRequirement: "40-55 mm",
        keyActivities: ["Apply potassium", "Support heavy fruits", "Monitor for shoot borer", "Maintain mulch"],
      },
      {
        name: "Harvesting Stage",
        startWeek: 16,
        endWeek: 18,
        description: "Harvest when fruits are firm and glossy. Continue for 2-3 months of production.",
        optimalTemp: { min: 22, max: 30 },
        optimalMoisture: { min: 55, max: 70 },
        optimalPh: { min: 5.5, max: 6.8 },
        expectedHeight: { min: 90, max: 130 },
        waterRequirement: "35-45 mm",
        keyActivities: ["Harvest every 4-5 days", "Cut with stem attached", "Store at 10-12°C"],
      },
    ],
  },
};

export const getCropList = () => Object.values(CROP_DATA);

export const getCurrentStage = (cropId: string, currentWeek: number): GrowthStage | null => {
  const crop = CROP_DATA[cropId];
  if (!crop) return null;
  
  return crop.stages.find(
    stage => currentWeek >= stage.startWeek && currentWeek <= stage.endWeek
  ) || null;
};

export const getStageProgress = (cropId: string, currentWeek: number): number => {
  const crop = CROP_DATA[cropId];
  if (!crop) return 0;
  
  const stage = getCurrentStage(cropId, currentWeek);
  if (!stage) return 100;
  
  const stageWeeks = stage.endWeek - stage.startWeek + 1;
  const weeksIntoStage = currentWeek - stage.startWeek + 1;
  return Math.min(100, (weeksIntoStage / stageWeeks) * 100);
};

export const getOverallProgress = (cropId: string, currentWeek: number): number => {
  const crop = CROP_DATA[cropId];
  if (!crop) return 0;
  
  return Math.min(100, (currentWeek / crop.totalDuration) * 100);
};

export const calculatePlantHealth = (
  cropId: string,
  moisture: number,
  temperature: number,
  soilPh: number,
  humidity: number,
  lightIntensity: number
): number => {
  const crop = CROP_DATA[cropId];
  if (!crop) return 50;

  let health = 100;
  const penalties: { factor: string; penalty: number }[] = [];

  // Moisture check
  if (moisture < crop.optimalMoisture.min) {
    const penalty = (crop.optimalMoisture.min - moisture) * 0.8;
    health -= penalty;
    penalties.push({ factor: "Low moisture", penalty });
  } else if (moisture > crop.optimalMoisture.max) {
    const penalty = (moisture - crop.optimalMoisture.max) * 0.6;
    health -= penalty;
    penalties.push({ factor: "High moisture", penalty });
  }

  // Temperature check
  if (temperature < crop.optimalTemperature.min) {
    const penalty = (crop.optimalTemperature.min - temperature) * 2;
    health -= penalty;
    penalties.push({ factor: "Low temperature", penalty });
  } else if (temperature > crop.optimalTemperature.max) {
    const penalty = (temperature - crop.optimalTemperature.max) * 2.5;
    health -= penalty;
    penalties.push({ factor: "High temperature", penalty });
  }

  // pH check
  if (soilPh < crop.optimalPh.min) {
    const penalty = (crop.optimalPh.min - soilPh) * 12;
    health -= penalty;
    penalties.push({ factor: "Low pH", penalty });
  } else if (soilPh > crop.optimalPh.max) {
    const penalty = (soilPh - crop.optimalPh.max) * 12;
    health -= penalty;
    penalties.push({ factor: "High pH", penalty });
  }

  // Humidity check
  if (humidity < crop.optimalHumidity.min) {
    const penalty = (crop.optimalHumidity.min - humidity) * 0.3;
    health -= penalty;
  } else if (humidity > crop.optimalHumidity.max) {
    const penalty = (humidity - crop.optimalHumidity.max) * 0.4;
    health -= penalty;
  }

  // Light intensity check (general optimal: 60-80%)
  if (lightIntensity < 50) {
    health -= (50 - lightIntensity) * 0.4;
  }

  return Math.max(0, Math.min(100, Math.round(health)));
};

export const getExpectedHeight = (cropId: string, currentWeek: number): number => {
  const crop = CROP_DATA[cropId];
  if (!crop) return 0;

  const stage = getCurrentStage(cropId, currentWeek);
  if (!stage) {
    // Return max height if past all stages
    const lastStage = crop.stages[crop.stages.length - 1];
    return lastStage.expectedHeight.max;
  }

  const stageProgress = getStageProgress(cropId, currentWeek) / 100;
  const heightRange = stage.expectedHeight.max - stage.expectedHeight.min;
  return Math.round(stage.expectedHeight.min + (heightRange * stageProgress));
};

export const getYieldEstimate = (
  cropId: string,
  health: number,
  currentWeek: number
): { percentage: number; estimate: string } => {
  const crop = CROP_DATA[cropId];
  if (!crop) return { percentage: 0, estimate: "N/A" };

  const progress = getOverallProgress(cropId, currentWeek);
  const healthFactor = health / 100;
  const progressFactor = progress / 100;
  
  // Yield only meaningful after flowering stage
  const stage = getCurrentStage(cropId, currentWeek);
  const stageIndex = stage ? crop.stages.indexOf(stage) : -1;
  
  if (stageIndex < 2) {
    return { percentage: 0, estimate: "Too early to estimate" };
  }

  const yieldPercentage = Math.round(healthFactor * progressFactor * 100);
  return {
    percentage: yieldPercentage,
    estimate: crop.yieldPerHectare,
  };
};
