// ────────────────────────────────────────────────────────────────────────────
// BMI + Body Composition Calculations
// ────────────────────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type BodyType = "ectomorph" | "mesomorph" | "endomorph" | "ecto_meso" | "endo_meso";
export type BodyShape = "apple" | "pear" | "hourglass" | "rectangle" | "inverted_triangle";
export type Condition = "none" | "pcos" | "thyroid" | "diabetes" | "hypertension" | "heart" | "arthritis";
export type HealthGoal = "lose_weight" | "maintain" | "gain_muscle" | "improve_fitness" | "manage_condition";

export interface BmiInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  bodyType: BodyType;
  bodyShape?: BodyShape;
  conditions: Condition[];
  goal: HealthGoal;
}

export interface BmiResult {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  idealBmiMin: number;
  idealBmiMax: number;
  idealWeightMin: number;
  idealWeightMax: number;
  weightToLose: number;   // negative means need to gain
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: { protein: number; carbs: number; fat: number };
  bodyFatEstimate: number;
  leanMass: number;
  waterIntakeLiters: number;
  mealPlan: MealSuggestion[];
  exercisePlan: ExerciseSuggestion[];
  healthTips: string[];
  warnings: string[];
}

export interface MealSuggestion {
  meal: string;
  foods: string[];
  calories: number;
  timing: string;
  notes?: string;
}

export interface ExerciseSuggestion {
  type: string;
  name: string;
  frequency: string;
  duration: string;
  intensity: "low" | "moderate" | "high";
  notes: string;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Ideal BMI range per body type
const IDEAL_BMI: Record<BodyType, [number, number]> = {
  ectomorph:  [18.5, 22.0],
  ecto_meso:  [20.0, 23.5],
  mesomorph:  [21.5, 25.5],
  endo_meso:  [23.0, 27.0],
  endomorph:  [24.0, 28.5],
};

export function calculateBmi(input: BmiInput): BmiResult {
  const { weightKg, heightCm, age, gender, activityLevel, bodyType, conditions, goal } = input;
  const heightM = heightCm / 100;

  // ── Core calculations ───────────────────────────────────────────────────────
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  const [idealBmiMin, idealBmiMax] = IDEAL_BMI[bodyType];
  const idealWeightMin = Math.round(idealBmiMin * heightM * heightM * 10) / 10;
  const idealWeightMax = Math.round(idealBmiMax * heightM * heightM * 10) / 10;
  const idealWeightMid = (idealWeightMin + idealWeightMax) / 2;
  const weightToLose = Math.round((weightKg - idealWeightMid) * 10) / 10;

  // BMR — Mifflin-St Jeor
  const bmr = gender === "male"
    ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
    : Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);

  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);

  // ── Body fat estimate (US Navy approximation via BMI) ────────────────────────
  const bodyFatEstimate = gender === "male"
    ? Math.round((1.2 * bmi + 0.23 * age - 16.2) * 10) / 10
    : Math.round((1.2 * bmi + 0.23 * age - 5.4) * 10) / 10;
  const leanMass = Math.round((weightKg * (1 - bodyFatEstimate / 100)) * 10) / 10;

  // ── Target calories based on goal ───────────────────────────────────────────
  let targetCalories = tdee;
  if (goal === "lose_weight") targetCalories = Math.max(1200, tdee - 500);
  else if (goal === "gain_muscle") targetCalories = tdee + 300;
  else if (goal === "manage_condition") targetCalories = tdee - 200;

  // Condition adjustments
  if (conditions.includes("thyroid")) targetCalories = Math.max(1200, targetCalories - 150);
  if (conditions.includes("diabetes")) targetCalories = Math.min(targetCalories, tdee - 300);

  // ── Macros ──────────────────────────────────────────────────────────────────
  const macros = getMacros(targetCalories, goal, bodyType, conditions);

  // ── Water intake ────────────────────────────────────────────────────────────
  const waterIntakeLiters = Math.round((weightKg * 0.033 + (activityLevel === "active" || activityLevel === "very_active" ? 0.5 : 0)) * 10) / 10;

  // ── Category and color ──────────────────────────────────────────────────────
  const { category: bmiCategory, color: bmiColor } = getBmiCategory(bmi, bodyType);

  // ── Meal plan ───────────────────────────────────────────────────────────────
  const mealPlan = generateMealPlan(targetCalories, macros, goal, conditions, bodyType);

  // ── Exercise plan ───────────────────────────────────────────────────────────
  const exercisePlan = generateExercisePlan(bmi, goal, activityLevel, conditions, bodyType);

  // ── Tips and warnings ───────────────────────────────────────────────────────
  const { tips, warnings } = generateTipsAndWarnings(bmi, goal, conditions, bodyType, bodyFatEstimate);

  return {
    bmi,
    bmiCategory,
    bmiColor,
    idealBmiMin,
    idealBmiMax,
    idealWeightMin,
    idealWeightMax,
    weightToLose,
    bmr,
    tdee,
    targetCalories,
    macros,
    bodyFatEstimate: Math.max(5, bodyFatEstimate),
    leanMass,
    waterIntakeLiters,
    mealPlan,
    exercisePlan,
    healthTips: tips,
    warnings,
  };
}

function getMacros(calories: number, goal: HealthGoal, bodyType: BodyType, conditions: Condition[]) {
  let proteinPct = 0.30, carbsPct = 0.45, fatPct = 0.25;

  if (goal === "gain_muscle") { proteinPct = 0.35; carbsPct = 0.45; fatPct = 0.20; }
  if (goal === "lose_weight") { proteinPct = 0.35; carbsPct = 0.35; fatPct = 0.30; }
  if (conditions.includes("diabetes")) { carbsPct = 0.30; proteinPct = 0.35; fatPct = 0.35; }
  if (bodyType === "endomorph" || bodyType === "endo_meso") { carbsPct -= 0.05; fatPct += 0.05; }

  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs:   Math.round((calories * carbsPct) / 4),
    fat:     Math.round((calories * fatPct) / 9),
  };
}

function getBmiCategory(bmi: number, bodyType: BodyType) {
  const [min, max] = IDEAL_BMI[bodyType];
  if (bmi < 16)    return { category: "Severely Underweight", color: "#F85149" };
  if (bmi < 18.5)  return { category: "Underweight",          color: "#D29922" };
  if (bmi < min)   return { category: "Below Ideal for Your Body Type", color: "#58A6FF" };
  if (bmi <= max)  return { category: "Ideal for Your Body Type ✓",    color: "#3FB950" };
  if (bmi < 25)    return { category: "Slightly Above Ideal",           color: "#58A6FF" };
  if (bmi < 30)    return { category: "Overweight",                     color: "#D29922" };
  if (bmi < 35)    return { category: "Obese Class I",                  color: "#F85149" };
  if (bmi < 40)    return { category: "Obese Class II",                 color: "#F85149" };
  return { category: "Severely Obese", color: "#F85149" };
}

function generateMealPlan(
  calories: number,
  macros: { protein: number; carbs: number; fat: number },
  goal: HealthGoal,
  conditions: Condition[],
  bodyType: BodyType
): MealSuggestion[] {
  const breakfastCal = Math.round(calories * 0.25);
  const snack1Cal    = Math.round(calories * 0.10);
  const lunchCal     = Math.round(calories * 0.35);
  const snack2Cal    = Math.round(calories * 0.10);
  const dinnerCal    = Math.round(calories * 0.20);

  const isLowCarb   = conditions.includes("diabetes") || conditions.includes("pcos");
  const isLowSodium = conditions.includes("hypertension") || conditions.includes("heart");
  const isAntiInflam = conditions.includes("arthritis");

  return [
    {
      meal: "Breakfast",
      timing: "7:00 – 8:30 AM",
      calories: breakfastCal,
      foods: isLowCarb
        ? ["3 boiled eggs", "Avocado (half)", "Mixed greens", "Black coffee / green tea"]
        : goal === "gain_muscle"
        ? ["Oats with banana + protein powder", "2 boiled eggs", "Full-fat milk", "Nuts"]
        : ["Oats with berries", "Greek yogurt", "1 boiled egg", "Green tea"],
      notes: isLowCarb ? "Avoid white bread and sugary cereals." : undefined,
    },
    {
      meal: "Mid-Morning Snack",
      timing: "10:30 – 11:00 AM",
      calories: snack1Cal,
      foods: isAntiInflam
        ? ["Walnuts (handful)", "1 apple", "Turmeric tea"]
        : goal === "gain_muscle"
        ? ["Protein shake", "Banana", "Peanut butter (1 tbsp)"]
        : ["Almonds (15–20)", "1 fruit", "Water"],
    },
    {
      meal: "Lunch",
      timing: "1:00 – 2:00 PM",
      calories: lunchCal,
      foods: isLowSodium
        ? ["Grilled chicken 150g (no salt)", "Brown rice ½ cup", "Steamed broccoli + spinach", "Lemon water"]
        : isLowCarb
        ? ["Grilled salmon 150g", "Large salad with olive oil", "Cucumber + tomato", "Lemon water"]
        : goal === "gain_muscle"
        ? ["Chicken breast 200g", "Rice 1 cup", "Dal + vegetables", "Curd"]
        : ["Brown rice + dal", "Grilled chicken 150g", "Mixed salad", "Buttermilk"],
      notes: "Eat slowly — chew 20× per bite for better digestion.",
    },
    {
      meal: "Evening Snack",
      timing: "4:00 – 5:00 PM",
      calories: snack2Cal,
      foods: goal === "lose_weight"
        ? ["Green tea", "Roasted chana 30g", "1 fruit"]
        : ["Fruit chaat", "Low-fat yogurt", "Nuts"],
    },
    {
      meal: "Dinner",
      timing: "7:00 – 8:00 PM",
      calories: dinnerCal,
      foods: isLowCarb
        ? ["Grilled fish / paneer 150g", "Stir-fried vegetables", "Salad", "Chamomile tea"]
        : isAntiInflam
        ? ["Baked salmon with turmeric", "Quinoa ½ cup", "Steamed greens", "Ginger tea"]
        : ["Dal + 1 roti", "Sabzi + salad", "Curd", "Warm water"],
      notes: "Eat dinner at least 2 hours before sleeping.",
    },
  ];
}

function generateExercisePlan(
  bmi: number,
  goal: HealthGoal,
  activity: ActivityLevel,
  conditions: Condition[],
  bodyType: BodyType
): ExerciseSuggestion[] {
  const isHighBmi      = bmi >= 30;
  const hasJointIssue  = conditions.includes("arthritis");
  const hasHeart       = conditions.includes("heart") || conditions.includes("hypertension");
  const hasDiabetes    = conditions.includes("diabetes");

  const plan: ExerciseSuggestion[] = [];

  // Cardio
  if (isHighBmi || hasJointIssue) {
    plan.push({
      type: "cardio",
      name: "Brisk Walking",
      frequency: "Daily",
      duration: "30–45 min",
      intensity: "low",
      notes: "Start with 20 min, add 5 min each week. Flat terrain preferred.",
    });
    plan.push({
      type: "cardio",
      name: "Swimming / Water Aerobics",
      frequency: "3× per week",
      duration: "30 min",
      intensity: "moderate",
      notes: "Zero-impact — ideal for joints. Excellent for weight loss.",
    });
  } else if (goal === "lose_weight" || goal === "improve_fitness") {
    plan.push({
      type: "cardio",
      name: "HIIT Cardio Circuit",
      frequency: "4× per week",
      duration: "25–30 min",
      intensity: "high",
      notes: "30s work / 20s rest. Jumping jacks, burpees, mountain climbers.",
    });
  } else {
    plan.push({
      type: "cardio",
      name: "Steady-State Cardio",
      frequency: "3× per week",
      duration: "30–40 min",
      intensity: "moderate",
      notes: "Cycling, jogging, elliptical. Keep heart rate at 65–75% max.",
    });
  }

  // Strength
  if (!hasHeart || bmi < 30) {
    if (goal === "gain_muscle" || bodyType === "ectomorph" || bodyType === "ecto_meso") {
      plan.push({
        type: "strength",
        name: "Progressive Overload Strength Training",
        frequency: "4–5× per week",
        duration: "45–60 min",
        intensity: "high",
        notes: "Focus on compound lifts: squats, deadlifts, bench press, rows. Add weight weekly.",
      });
    } else if (isHighBmi) {
      plan.push({
        type: "strength",
        name: "Resistance Band + Bodyweight Training",
        frequency: "3× per week",
        duration: "30–40 min",
        intensity: "moderate",
        notes: "Builds muscle while managing joint stress. Squats, wall push-ups, seated rows.",
      });
    } else {
      plan.push({
        type: "strength",
        name: "Full Body Strength Circuit",
        frequency: "3× per week",
        duration: "40–45 min",
        intensity: "moderate",
        notes: "Squats, push-ups, lunges, planks, dumbbell rows. 3 sets × 12 reps.",
      });
    }
  }

  // Flexibility
  plan.push({
    type: "flexibility",
    name: "Yoga / Stretching",
    frequency: "Daily or 5× per week",
    duration: "15–20 min",
    intensity: "low",
    notes: hasJointIssue
      ? "Gentle yoga (Yin / Restorative). Avoid deep backbends. Reduces inflammation."
      : "Morning sun salutations + evening full-body stretch. Improves recovery.",
  });

  // Condition-specific
  if (hasDiabetes) {
    plan.push({
      type: "cardio",
      name: "Post-Meal Walk",
      frequency: "After every meal",
      duration: "10–15 min",
      intensity: "low",
      notes: "Reduces blood sugar spikes. Even a gentle stroll has significant effect.",
    });
  }
  if (conditions.includes("pcos")) {
    plan.push({
      type: "strength",
      name: "Strength Training (PCOS Protocol)",
      frequency: "3× per week",
      duration: "30–40 min",
      intensity: "moderate",
      notes: "Resistance training reduces insulin resistance and androgen levels. Prioritize over pure cardio.",
    });
  }

  return plan;
}

function generateTipsAndWarnings(
  bmi: number,
  goal: HealthGoal,
  conditions: Condition[],
  bodyType: BodyType,
  bodyFat: number
) {
  const tips: string[] = [];
  const warnings: string[] = [];

  if (bmi < 18.5) {
    tips.push("Eat every 3 hours to maintain caloric surplus. Don't skip meals.");
    tips.push("Focus on nutrient-dense foods: nuts, avocado, whole grains, legumes.");
  } else if (bmi >= 25 && bmi < 30) {
    tips.push("Reduce refined carbs and sugar. Swap white rice for brown rice or quinoa.");
    tips.push("Drink a glass of water 20 min before each meal to reduce portion size.");
  } else if (bmi >= 30) {
    tips.push("Start with walking 30 min daily before adding intense exercise.");
    tips.push("Log every meal — awareness is the first step to change.");
    warnings.push("BMI above 30 indicates increased risk for type 2 diabetes, hypertension, and joint problems. Consult a doctor.");
  }

  if (conditions.includes("pcos")) {
    tips.push("Follow a low-GI diet. Avoid refined sugar and processed foods.");
    tips.push("Manage stress actively — cortisol worsens PCOS symptoms.");
    warnings.push("PCOS can affect metabolism. Consult an endocrinologist for personalized guidance.");
  }
  if (conditions.includes("thyroid")) {
    tips.push("Avoid raw cruciferous vegetables in large amounts (goitrogens).");
    tips.push("Selenium-rich foods (Brazil nuts, fish) support thyroid function.");
    warnings.push("Thyroid conditions significantly affect BMR. Work with your doctor to adjust calorie targets.");
  }
  if (conditions.includes("diabetes")) {
    tips.push("Never skip meals — it causes dangerous blood sugar swings.");
    tips.push("Choose low-GI foods: oats, legumes, non-starchy vegetables.");
    warnings.push("Always monitor blood sugar before and after exercise. Carry glucose tablets.");
  }
  if (conditions.includes("heart") || conditions.includes("hypertension")) {
    tips.push("Reduce sodium to under 2g/day. Avoid processed and packaged foods.");
    tips.push("DASH diet principles: fruits, vegetables, whole grains, lean proteins.");
    warnings.push("Consult your cardiologist before starting any new exercise program.");
  }

  if (bodyFat > 30 && goal !== "lose_weight") {
    tips.push("Your body fat % is elevated. Consider adding a calorie deficit even for maintenance.");
  }

  tips.push("Sleep 7–9 hours. Poor sleep increases cortisol and sabotages fat loss.");
  tips.push("Manage stress — chronic stress raises cortisol, which promotes fat storage.");

  return { tips, warnings };
}

// ── Constants for UI ──────────────────────────────────────────────────────────
export const BODY_TYPES: { id: BodyType; label: string; desc: string; traits: string[] }[] = [
  {
    id: "ectomorph",
    label: "Ectomorph",
    desc: "Naturally lean, thin frame",
    traits: ["Slim build", "Fast metabolism", "Hard to gain weight", "Narrow shoulders and hips"],
  },
  {
    id: "ecto_meso",
    label: "Ecto-Mesomorph",
    desc: "Lean with athletic potential",
    traits: ["Lean but can build muscle", "Good athletic ability", "Average metabolism"],
  },
  {
    id: "mesomorph",
    label: "Mesomorph",
    desc: "Athletic, naturally muscular",
    traits: ["Muscular build", "Responds well to training", "Moderate metabolism", "Well-defined muscles"],
  },
  {
    id: "endo_meso",
    label: "Endo-Mesomorph",
    desc: "Muscular with tendency to gain fat",
    traits: ["Strong and muscular", "Gains fat easily", "Slower metabolism", "Broad frame"],
  },
  {
    id: "endomorph",
    label: "Endomorph",
    desc: "Naturally stocky, gains weight easily",
    traits: ["Rounder build", "Slow metabolism", "Gains fat easily", "Wider waist and hips"],
  },
];

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: "sedentary",   label: "Sedentary",    desc: "Desk job, little to no exercise" },
  { id: "light",       label: "Light",        desc: "1–3 days exercise per week" },
  { id: "moderate",    label: "Moderate",     desc: "3–5 days exercise per week" },
  { id: "active",      label: "Active",       desc: "6–7 days hard exercise" },
  { id: "very_active", label: "Very Active",  desc: "Physical job + daily training" },
];

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: "none",        label: "None" },
  { id: "pcos",        label: "PCOS / PCOD" },
  { id: "thyroid",     label: "Thyroid" },
  { id: "diabetes",    label: "Diabetes" },
  { id: "hypertension",label: "Hypertension" },
  { id: "heart",       label: "Heart Condition" },
  { id: "arthritis",   label: "Arthritis / Joint Issues" },
];

export const HEALTH_GOALS: { id: HealthGoal; label: string; desc: string }[] = [
  { id: "lose_weight",       label: "Lose Weight",       desc: "Reduce body fat" },
  { id: "maintain",          label: "Maintain",          desc: "Stay at current weight" },
  { id: "gain_muscle",       label: "Build Muscle",      desc: "Increase lean mass" },
  { id: "improve_fitness",   label: "Improve Fitness",   desc: "Better endurance and health" },
  { id: "manage_condition",  label: "Manage Condition",  desc: "Optimise for health condition" },
];
