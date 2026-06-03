// Nutrition per 100g unless noted. calories=kcal, others in grams.
export interface FoodEntry {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  defaultQty?: number;   // default serving in grams
  unit?: string;         // human label for defaultQty
}

export const FOOD_DB: Record<string, FoodEntry> = {
  // ── Grains ──────────────────────────────────────────────────────────
  "rice":               { calories: 130, protein: 2.7, carbs: 28,  fat: 0.3, fiber: 0.4, defaultQty: 180, unit: "1 cup cooked" },
  "brown rice":         { calories: 112, protein: 2.6, carbs: 23,  fat: 0.9, fiber: 1.8, defaultQty: 195, unit: "1 cup cooked" },
  "white rice":         { calories: 130, protein: 2.7, carbs: 28,  fat: 0.3, defaultQty: 180, unit: "1 cup cooked" },
  "oats":               { calories: 68,  protein: 2.4, carbs: 12,  fat: 1.4, fiber: 1.7, defaultQty: 240, unit: "1 cup cooked" },
  "oatmeal":            { calories: 68,  protein: 2.4, carbs: 12,  fat: 1.4, defaultQty: 240, unit: "1 bowl" },
  "bread":              { calories: 265, protein: 9,   carbs: 49,  fat: 3.2, defaultQty: 30,  unit: "1 slice" },
  "white bread":        { calories: 265, protein: 9,   carbs: 49,  fat: 3.2, defaultQty: 30,  unit: "1 slice" },
  "whole wheat bread":  { calories: 247, protein: 13,  carbs: 41,  fat: 4.2, fiber: 7,   defaultQty: 30,  unit: "1 slice" },
  "pasta":              { calories: 131, protein: 5,   carbs: 25,  fat: 1.1, defaultQty: 200, unit: "1 cup cooked" },
  "noodles":            { calories: 138, protein: 4.5, carbs: 25,  fat: 2.1, defaultQty: 200, unit: "1 cup cooked" },
  "roti":               { calories: 297, protein: 9,   carbs: 55,  fat: 4,   defaultQty: 40,  unit: "1 roti" },
  "chapati":            { calories: 297, protein: 9,   carbs: 55,  fat: 4,   defaultQty: 40,  unit: "1 chapati" },
  "tortilla":           { calories: 218, protein: 5.7, carbs: 36,  fat: 5.6, defaultQty: 45,  unit: "1 medium" },
  "quinoa":             { calories: 120, protein: 4.4, carbs: 21,  fat: 1.9, fiber: 2.8, defaultQty: 185, unit: "1 cup cooked" },

  // ── Proteins ─────────────────────────────────────────────────────────
  "chicken breast":     { calories: 165, protein: 31,  carbs: 0,   fat: 3.6, defaultQty: 150, unit: "1 medium breast" },
  "chicken":            { calories: 165, protein: 31,  carbs: 0,   fat: 3.6, defaultQty: 150, unit: "1 serving" },
  "grilled chicken":    { calories: 165, protein: 31,  carbs: 0,   fat: 3.6, defaultQty: 150, unit: "1 serving" },
  "chicken thigh":      { calories: 209, protein: 26,  carbs: 0,   fat: 11,  defaultQty: 120, unit: "1 thigh" },
  "beef":               { calories: 250, protein: 26,  carbs: 0,   fat: 15,  defaultQty: 150, unit: "1 serving" },
  "ground beef":        { calories: 215, protein: 26,  carbs: 0,   fat: 13,  defaultQty: 150, unit: "1 serving" },
  "salmon":             { calories: 208, protein: 20,  carbs: 0,   fat: 13,  defaultQty: 150, unit: "1 fillet" },
  "tuna":               { calories: 144, protein: 30,  carbs: 0,   fat: 3.2, defaultQty: 150, unit: "1 can drained" },
  "tuna can":           { calories: 144, protein: 30,  carbs: 0,   fat: 3.2, defaultQty: 150, unit: "1 can" },
  "shrimp":             { calories: 99,  protein: 24,  carbs: 0.2, fat: 0.3, defaultQty: 100, unit: "100g" },
  "egg":                { calories: 155, protein: 13,  carbs: 1.1, fat: 11,  defaultQty: 60,  unit: "1 large egg" },
  "eggs":               { calories: 155, protein: 13,  carbs: 1.1, fat: 11,  defaultQty: 60,  unit: "per egg" },
  "boiled egg":         { calories: 155, protein: 13,  carbs: 1.1, fat: 11,  defaultQty: 60,  unit: "1 egg" },
  "tofu":               { calories: 76,  protein: 8,   carbs: 1.9, fat: 4.8, defaultQty: 150, unit: "1 serving" },
  "paneer":             { calories: 265, protein: 18,  carbs: 3.6, fat: 20,  defaultQty: 100, unit: "100g" },
  "lentils":            { calories: 116, protein: 9,   carbs: 20,  fat: 0.4, fiber: 7.9, defaultQty: 200, unit: "1 cup cooked" },
  "dal":                { calories: 116, protein: 9,   carbs: 20,  fat: 0.4, fiber: 7.9, defaultQty: 200, unit: "1 bowl" },
  "kidney beans":       { calories: 127, protein: 8.7, carbs: 22,  fat: 0.5, fiber: 6.4, defaultQty: 180, unit: "1 cup cooked" },
  "chickpeas":          { calories: 164, protein: 8.9, carbs: 27,  fat: 2.6, fiber: 7.6, defaultQty: 164, unit: "1 cup cooked" },
  "black beans":        { calories: 132, protein: 8.9, carbs: 24,  fat: 0.5, fiber: 8.7, defaultQty: 180, unit: "1 cup cooked" },

  // ── Dairy ─────────────────────────────────────────────────────────────
  "milk":               { calories: 42,  protein: 3.4, carbs: 5,   fat: 1,   defaultQty: 240, unit: "1 cup" },
  "whole milk":         { calories: 61,  protein: 3.2, carbs: 4.8, fat: 3.3, defaultQty: 240, unit: "1 cup" },
  "greek yogurt":       { calories: 59,  protein: 10,  carbs: 3.6, fat: 0.4, defaultQty: 170, unit: "1 container" },
  "yogurt":             { calories: 59,  protein: 10,  carbs: 3.6, fat: 0.4, defaultQty: 170, unit: "1 container" },
  "cheese":             { calories: 402, protein: 25,  carbs: 1.3, fat: 33,  defaultQty: 30,  unit: "1 slice" },
  "cheddar":            { calories: 403, protein: 25,  carbs: 1.3, fat: 33,  defaultQty: 30,  unit: "1 slice" },
  "cottage cheese":     { calories: 98,  protein: 11,  carbs: 3.4, fat: 4.3, defaultQty: 226, unit: "1 cup" },
  "butter":             { calories: 717, protein: 0.9, carbs: 0.1, fat: 81,  defaultQty: 14,  unit: "1 tbsp" },
  "whey protein":       { calories: 100, protein: 20,  carbs: 5,   fat: 1.5, defaultQty: 30,  unit: "1 scoop" },
  "protein shake":      { calories: 100, protein: 20,  carbs: 5,   fat: 1.5, defaultQty: 30,  unit: "1 scoop" },

  // ── Fruits ────────────────────────────────────────────────────────────
  "banana":             { calories: 89,  protein: 1.1, carbs: 23,  fat: 0.3, fiber: 2.6, defaultQty: 120, unit: "1 medium" },
  "apple":              { calories: 52,  protein: 0.3, carbs: 14,  fat: 0.2, fiber: 2.4, defaultQty: 182, unit: "1 medium" },
  "orange":             { calories: 47,  protein: 0.9, carbs: 12,  fat: 0.1, fiber: 2.4, defaultQty: 130, unit: "1 medium" },
  "mango":              { calories: 60,  protein: 0.8, carbs: 15,  fat: 0.4, fiber: 1.6, defaultQty: 165, unit: "1 cup sliced" },
  "grapes":             { calories: 69,  protein: 0.7, carbs: 18,  fat: 0.2, defaultQty: 150, unit: "1 cup" },
  "strawberries":       { calories: 32,  protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2,   defaultQty: 152, unit: "1 cup" },
  "blueberries":        { calories: 57,  protein: 0.7, carbs: 14,  fat: 0.3, fiber: 2.4, defaultQty: 148, unit: "1 cup" },
  "watermelon":         { calories: 30,  protein: 0.6, carbs: 7.6, fat: 0.2, defaultQty: 280, unit: "2 cups" },
  "avocado":            { calories: 160, protein: 2,   carbs: 9,   fat: 15,  fiber: 6.7, defaultQty: 150, unit: "1 medium" },

  // ── Vegetables ───────────────────────────────────────────────────────
  "broccoli":           { calories: 34,  protein: 2.8, carbs: 7,   fat: 0.4, fiber: 2.6, defaultQty: 91,  unit: "1 cup" },
  "spinach":            { calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, defaultQty: 30,  unit: "1 cup raw" },
  "carrot":             { calories: 41,  protein: 0.9, carbs: 10,  fat: 0.2, fiber: 2.8, defaultQty: 61,  unit: "1 medium" },
  "potato":             { calories: 77,  protein: 2,   carbs: 17,  fat: 0.1, fiber: 2.2, defaultQty: 150, unit: "1 medium" },
  "sweet potato":       { calories: 86,  protein: 1.6, carbs: 20,  fat: 0.1, fiber: 3,   defaultQty: 130, unit: "1 medium" },
  "tomato":             { calories: 18,  protein: 0.9, carbs: 3.9, fat: 0.2, defaultQty: 123, unit: "1 medium" },
  "cucumber":           { calories: 15,  protein: 0.7, carbs: 3.6, fat: 0.1, defaultQty: 100, unit: "100g" },
  "onion":              { calories: 40,  protein: 1.1, carbs: 9.3, fat: 0.1, defaultQty: 110, unit: "1 medium" },
  "mixed vegetables":   { calories: 65,  protein: 3.5, carbs: 13,  fat: 0.5, defaultQty: 150, unit: "1 cup" },
  "salad":              { calories: 20,  protein: 1.5, carbs: 3,   fat: 0.3, defaultQty: 150, unit: "1 bowl" },

  // ── Nuts & Seeds ─────────────────────────────────────────────────────
  "almonds":            { calories: 579, protein: 21,  carbs: 22,  fat: 50,  fiber: 12.5, defaultQty: 28, unit: "1 oz (28g)" },
  "peanuts":            { calories: 567, protein: 26,  carbs: 16,  fat: 49,  fiber: 8.5, defaultQty: 28,  unit: "1 oz" },
  "peanut butter":      { calories: 588, protein: 25,  carbs: 20,  fat: 50,  defaultQty: 32,  unit: "2 tbsp" },
  "cashews":            { calories: 553, protein: 18,  carbs: 30,  fat: 44,  defaultQty: 28,  unit: "1 oz" },
  "walnuts":            { calories: 654, protein: 15,  carbs: 14,  fat: 65,  defaultQty: 28,  unit: "1 oz" },

  // ── Meals / Dishes ───────────────────────────────────────────────────
  "pizza":              { calories: 266, protein: 11,  carbs: 33,  fat: 10,  defaultQty: 107, unit: "1 slice" },
  "burger":             { calories: 295, protein: 17,  carbs: 24,  fat: 14,  defaultQty: 150, unit: "1 burger" },
  "sandwich":           { calories: 250, protein: 12,  carbs: 30,  fat: 8,   defaultQty: 150, unit: "1 sandwich" },
  "biryani":            { calories: 163, protein: 8,   carbs: 26,  fat: 3.5, defaultQty: 300, unit: "1 plate" },
  "fried rice":         { calories: 163, protein: 4.8, carbs: 26,  fat: 4.5, defaultQty: 250, unit: "1 cup" },
  "dal rice":           { calories: 130, protein: 6,   carbs: 24,  fat: 1.5, defaultQty: 300, unit: "1 plate" },
  "idli":               { calories: 58,  protein: 2,   carbs: 12,  fat: 0.5, defaultQty: 50,  unit: "1 idli" },
  "dosa":               { calories: 133, protein: 3,   carbs: 26,  fat: 1.7, defaultQty: 100, unit: "1 dosa" },
  "sambar":             { calories: 45,  protein: 2.8, carbs: 6,   fat: 0.8, defaultQty: 200, unit: "1 bowl" },
  "upma":               { calories: 113, protein: 3,   carbs: 20,  fat: 2.5, defaultQty: 200, unit: "1 cup" },
  "poha":               { calories: 130, protein: 3,   carbs: 26,  fat: 2,   defaultQty: 200, unit: "1 cup" },
  "paratha":            { calories: 257, protein: 5,   carbs: 36,  fat: 10,  defaultQty: 80,  unit: "1 paratha" },
  "chole":              { calories: 164, protein: 8.9, carbs: 27,  fat: 2.6, defaultQty: 200, unit: "1 bowl" },
  "paneer butter masala": { calories: 200, protein: 10, carbs: 8, fat: 15,  defaultQty: 200, unit: "1 bowl" },
  "rajma":              { calories: 132, protein: 8.7, carbs: 24,  fat: 0.5, defaultQty: 200, unit: "1 bowl" },
  "soup":               { calories: 70,  protein: 4,   carbs: 8,   fat: 2,   defaultQty: 240, unit: "1 bowl" },
  "stir fry":           { calories: 120, protein: 8,   carbs: 12,  fat: 4,   defaultQty: 200, unit: "1 serving" },

  // ── Beverages ─────────────────────────────────────────────────────────
  "coffee":             { calories: 2,   protein: 0.3, carbs: 0,   fat: 0,   defaultQty: 240, unit: "1 cup black" },
  "black coffee":       { calories: 2,   protein: 0.3, carbs: 0,   fat: 0,   defaultQty: 240, unit: "1 cup" },
  "tea":                { calories: 1,   protein: 0,   carbs: 0.2, fat: 0,   defaultQty: 240, unit: "1 cup plain" },
  "orange juice":       { calories: 45,  protein: 0.7, carbs: 10,  fat: 0.2, defaultQty: 240, unit: "1 cup" },
  "smoothie":           { calories: 150, protein: 5,   carbs: 28,  fat: 2,   defaultQty: 300, unit: "1 glass" },
  "protein shake drink":{ calories: 200, protein: 25,  carbs: 10,  fat: 3,   defaultQty: 300, unit: "1 shake" },

  // ── Snacks ────────────────────────────────────────────────────────────
  "chocolate":          { calories: 546, protein: 5,   carbs: 60,  fat: 31,  defaultQty: 40,  unit: "4 squares" },
  "dark chocolate":     { calories: 598, protein: 7.8, carbs: 46,  fat: 43,  defaultQty: 30,  unit: "30g" },
  "chips":              { calories: 536, protein: 7,   carbs: 53,  fat: 35,  defaultQty: 30,  unit: "small bag" },
  "biscuits":           { calories: 450, protein: 6,   carbs: 65,  fat: 18,  defaultQty: 30,  unit: "3 biscuits" },
  "granola bar":        { calories: 471, protein: 10,  carbs: 64,  fat: 20,  defaultQty: 47,  unit: "1 bar" },
};

// ─── Quantity parser ──────────────────────────────────────────────────────────
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1, gram: 1, grams: 1,
  kg: 1000, kilogram: 1000,
  oz: 28.35, ounce: 28.35, ounces: 28.35,
  lb: 453.6, pound: 453.6, pounds: 453.6,
  cup: 240, cups: 240,
  tbsp: 15, tablespoon: 15, tablespoons: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  ml: 1, l: 1000,
  piece: 100, pieces: 100, slice: 30, slices: 30,
  bowl: 250, plate: 300, serving: 150,
};

export interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "exact" | "estimated";
  matchedFood?: string;
}

export function estimateNutrition(mealName: string, quantityGrams = 0): NutritionEstimate {
  const name = mealName.toLowerCase().trim();

  // 1. Try exact match
  if (FOOD_DB[name]) {
    const qty = quantityGrams || FOOD_DB[name].defaultQty || 100;
    return scale(FOOD_DB[name], qty, "exact", name);
  }

  // 2. Try partial match (longest key that appears in the name)
  const keys = Object.keys(FOOD_DB).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (name.includes(key)) {
      const qty = quantityGrams || FOOD_DB[key].defaultQty || 100;
      return scale(FOOD_DB[key], qty, "estimated", key);
    }
  }

  // 3. Keyword-based fallback estimate
  const fallback = keywordFallback(name);
  const qty = quantityGrams || 200;
  return scale(fallback, qty, "estimated");
}

function scale(food: FoodEntry, grams: number, confidence: "exact" | "estimated", matchedFood?: string): NutritionEstimate {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.calories * ratio),
    protein:  Math.round(food.protein  * ratio * 10) / 10,
    carbs:    Math.round(food.carbs    * ratio * 10) / 10,
    fat:      Math.round(food.fat      * ratio * 10) / 10,
    confidence,
    matchedFood,
  };
}

function keywordFallback(name: string): FoodEntry {
  if (/salad|greens|lettuce|spinach|kale/.test(name))  return { calories: 20,  protein: 1.5, carbs: 3,   fat: 0.3 };
  if (/soup|broth|stew/.test(name))                    return { calories: 70,  protein: 4,   carbs: 8,   fat: 2   };
  if (/fried|fries|chips|crisps/.test(name))           return { calories: 500, protein: 5,   carbs: 50,  fat: 30  };
  if (/cake|cookie|pastry|dessert|sweet|donut/.test(name)) return { calories: 400, protein: 5, carbs: 55, fat: 18 };
  if (/pizza|burger|sandwich|wrap/.test(name))         return { calories: 280, protein: 12,  carbs: 30,  fat: 12  };
  if (/juice|drink|beverage|soda|cola/.test(name))     return { calories: 45,  protein: 0,   carbs: 11,  fat: 0   };
  if (/protein|shake|supplement/.test(name))           return { calories: 150, protein: 25,  carbs: 5,   fat: 2   };
  if (/curry|masala|gravy/.test(name))                 return { calories: 180, protein: 8,   carbs: 15,  fat: 10  };
  if (/rice|grain|cereal|porridge/.test(name))         return { calories: 130, protein: 3,   carbs: 28,  fat: 0.5 };
  if (/meat|chicken|fish|beef|pork|mutton/.test(name)) return { calories: 180, protein: 25,  carbs: 0,   fat: 9   };
  // generic meal
  return { calories: 250, protein: 10, carbs: 30, fat: 8 };
}

// Parse "2 cups rice", "150g chicken", "1 banana" → { food, grams }
export function parseQuantity(input: string): { food: string; grams: number } {
  const str = input.toLowerCase().trim();
  // patterns: "150g chicken", "2 cups rice", "1 banana", "3 slices bread"
  const match = str.match(/^(\d+\.?\d*)\s*(g|kg|oz|lb|cup|cups|tbsp|tsp|ml|l|piece|pieces|slice|slices|bowl|plate|serving)s?\s+(.+)$/i)
    || str.match(/^(\d+\.?\d*)\s+(.+)$/i);

  if (match) {
    if (match.length === 4) {
      // has unit
      const qty    = parseFloat(match[1]);
      const unit   = match[2].toLowerCase().replace(/s$/, "");
      const food   = match[3];
      const multiplier = UNIT_TO_GRAMS[unit] ?? 100;
      return { food, grams: Math.round(qty * multiplier) };
    } else {
      // no unit — treat as count
      const qty  = parseFloat(match[1]);
      const food = match[2];
      const key  = food.toLowerCase().trim();
      const defaultQty = FOOD_DB[key]?.defaultQty ?? 100;
      return { food, grams: Math.round(qty * defaultQty) };
    }
  }

  return { food: str, grams: 0 };
}
