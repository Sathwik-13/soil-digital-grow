// Crop-specific ripeness stages and data
// Based on real agricultural color development patterns

export interface RipenessStage {
  name: string;
  color: string;
  textColor: string;
  description: string;
  daysFromStart: number;
  percentage: number;
}

export interface CropRipenessData {
  cropId: string;
  cropName: string;
  icon: string;
  stages: RipenessStage[];
  optimalHarvestStage: string;
  maxRipeningDays: number;
  optimalTempRange: { min: number; max: number };
  fruitStartWeek: number; // Week when fruit development starts
  characteristics: {
    label: string;
    getValue: (ripenessPercentage: number) => string;
  }[];
}

// Tomato Ripeness Stages (Green to Red Ripe)
const TOMATO_RIPENESS: CropRipenessData = {
  cropId: "tomato",
  cropName: "Tomato",
  icon: "🍅",
  fruitStartWeek: 11,
  maxRipeningDays: 7,
  optimalTempRange: { min: 20, max: 25 },
  optimalHarvestStage: "Red Ripe",
  stages: [
    { name: "Green", color: "#4CAF50", textColor: "#000", description: "Fully mature but unripe, firm texture", daysFromStart: 0, percentage: 0 },
    { name: "Breaker", color: "#8BC34A", textColor: "#000", description: "First sign of color change at blossom end", daysFromStart: 2, percentage: 17 },
    { name: "Turning", color: "#CDDC39", textColor: "#000", description: "10-30% of surface shows pink/red color", daysFromStart: 3, percentage: 33 },
    { name: "Pink", color: "#FFEB3B", textColor: "#000", description: "30-60% pink/red coloration", daysFromStart: 4, percentage: 50 },
    { name: "Light Red", color: "#FF9800", textColor: "#fff", description: "60-90% red coloration", daysFromStart: 5, percentage: 75 },
    { name: "Red Ripe", color: "#F44336", textColor: "#fff", description: "Over 90% red, optimal harvest", daysFromStart: 7, percentage: 100 },
  ],
  characteristics: [
    {
      label: "Firmness",
      getValue: (pct) => pct < 30 ? "Very Firm" : pct < 60 ? "Firm" : pct < 80 ? "Slightly Soft" : "Soft"
    },
    {
      label: "Lycopene Content",
      getValue: (pct) => `${Math.round(pct * 0.45)} mg/100g`
    },
    {
      label: "Sugar Level (Brix)",
      getValue: (pct) => `${(3 + pct * 0.03).toFixed(1)}°`
    },
  ]
};

// Chili Ripeness Stages (Green to Red with heat development)
const CHILI_RIPENESS: CropRipenessData = {
  cropId: "chili",
  cropName: "Chili",
  icon: "🌶️",
  fruitStartWeek: 14,
  maxRipeningDays: 10,
  optimalTempRange: { min: 22, max: 28 },
  optimalHarvestStage: "Red",
  stages: [
    { name: "Green (Immature)", color: "#2E7D32", textColor: "#fff", description: "Young fruit, mild heat, crisp texture", daysFromStart: 0, percentage: 0 },
    { name: "Green (Mature)", color: "#4CAF50", textColor: "#000", description: "Full-sized green, moderate heat developing", daysFromStart: 3, percentage: 25 },
    { name: "Breaking", color: "#7CB342", textColor: "#000", description: "First color change at tip, heat increasing", daysFromStart: 5, percentage: 40 },
    { name: "Orange", color: "#FF9800", textColor: "#000", description: "50-70% orange coloration, strong heat", daysFromStart: 7, percentage: 65 },
    { name: "Red-Orange", color: "#FF5722", textColor: "#fff", description: "80-95% red, peak capsaicin", daysFromStart: 9, percentage: 85 },
    { name: "Red", color: "#D32F2F", textColor: "#fff", description: "Fully red, maximum heat and flavor", daysFromStart: 10, percentage: 100 },
  ],
  characteristics: [
    {
      label: "Heat Level (Scoville)",
      getValue: (pct) => {
        const shu = Math.round(5000 + pct * 450); // 5000-50000 SHU range
        return `${(shu/1000).toFixed(0)}K SHU`;
      }
    },
    {
      label: "Capsaicin Content",
      getValue: (pct) => `${(0.1 + pct * 0.009).toFixed(2)}%`
    },
    {
      label: "Flavor Profile",
      getValue: (pct) => pct < 40 ? "Fresh & Grassy" : pct < 70 ? "Fruity & Spicy" : "Sweet & Intense"
    },
  ]
};

// Brinjal (Eggplant) Ripeness Stages (Light to Deep Purple)
const BRINJAL_RIPENESS: CropRipenessData = {
  cropId: "brinjal",
  cropName: "Brinjal",
  icon: "🍆",
  fruitStartWeek: 12,
  maxRipeningDays: 8,
  optimalTempRange: { min: 24, max: 30 },
  optimalHarvestStage: "Deep Purple",
  stages: [
    { name: "Light Green", color: "#81C784", textColor: "#000", description: "Young fruit, still developing", daysFromStart: 0, percentage: 0 },
    { name: "Light Purple", color: "#9575CD", textColor: "#fff", description: "Color beginning to develop", daysFromStart: 2, percentage: 20 },
    { name: "Medium Purple", color: "#7E57C2", textColor: "#fff", description: "Half colored, firm flesh", daysFromStart: 4, percentage: 45 },
    { name: "Dark Purple", color: "#5E35B1", textColor: "#fff", description: "80% colored, optimal texture", daysFromStart: 6, percentage: 70 },
    { name: "Deep Purple", color: "#4527A0", textColor: "#fff", description: "Fully colored, glossy skin - HARVEST NOW", daysFromStart: 7, percentage: 90 },
    { name: "Overripe", color: "#311B92", textColor: "#fff", description: "Dull skin, seeds hardening", daysFromStart: 8, percentage: 100 },
  ],
  characteristics: [
    {
      label: "Skin Glossiness",
      getValue: (pct) => pct < 20 ? "Low" : pct < 50 ? "Medium" : pct < 90 ? "High (Harvest!)" : "Dull"
    },
    {
      label: "Flesh Firmness",
      getValue: (pct) => pct < 30 ? "Very Firm" : pct < 70 ? "Firm" : pct < 90 ? "Optimal" : "Soft/Spongy"
    },
    {
      label: "Seed Development",
      getValue: (pct) => pct < 40 ? "Immature" : pct < 80 ? "Soft Seeds" : pct < 95 ? "Mature" : "Hard/Bitter"
    },
  ]
};

export const CROP_RIPENESS_DATA: Record<string, CropRipenessData> = {
  tomato: TOMATO_RIPENESS,
  chili: CHILI_RIPENESS,
  brinjal: BRINJAL_RIPENESS,
};

// Calculate ripening speed based on temperature for each crop
export const calculateRipeningSpeed = (
  cropId: string,
  temperature: number
): number => {
  const cropData = CROP_RIPENESS_DATA[cropId];
  if (!cropData) return 1;

  const { min, max } = cropData.optimalTempRange;
  const midPoint = (min + max) / 2;

  // Below minimum threshold - ripening very slow or stopped
  if (temperature < min - 8) return 0;
  if (temperature < min) return 0.3 + ((temperature - (min - 8)) / 8) * 0.2;

  // In optimal range
  if (temperature >= min && temperature <= max) return 1.0;

  // Above optimal - faster but quality degrades
  if (temperature > max && temperature <= max + 5) return 1.2;

  // Too hot - quality issues, slower effective ripening
  if (temperature > max + 5) return 0.8;

  return 1.0;
};

// Get current ripeness stage based on days and speed
export const getCurrentRipenessStage = (
  cropId: string,
  daysIntoRipening: number,
  ripeningSpeed: number
): RipenessStage => {
  const cropData = CROP_RIPENESS_DATA[cropId];
  if (!cropData) return TOMATO_RIPENESS.stages[0];

  const adjustedDays = daysIntoRipening * ripeningSpeed;

  for (let i = cropData.stages.length - 1; i >= 0; i--) {
    if (adjustedDays >= cropData.stages[i].daysFromStart) {
      return cropData.stages[i];
    }
  }

  return cropData.stages[0];
};

// Get ripeness percentage
export const getRipenessPercentage = (
  cropId: string,
  daysIntoRipening: number,
  ripeningSpeed: number
): number => {
  const cropData = CROP_RIPENESS_DATA[cropId];
  if (!cropData) return 0;

  const adjustedDays = daysIntoRipening * ripeningSpeed;
  return Math.min(100, (adjustedDays / cropData.maxRipeningDays) * 100);
};

// Get ripeness color for 3D visualization (THREE.js color)
export const getRipenessColor = (
  cropId: string,
  daysIntoRipening: number,
  ripeningSpeed: number
): string => {
  const stage = getCurrentRipenessStage(cropId, daysIntoRipening, ripeningSpeed);
  return stage.color;
};
