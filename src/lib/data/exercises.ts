export interface Exercise {
  name: string;
  durationSecs: number;   // work time
  restSecs: number;       // rest after
  sets?: number;
  reps?: string;
  muscles: string[];
  instructions: string[];
  tip?: string;
  equipment: "none" | "home" | "gym";
  type: "cardio" | "strength" | "flexibility" | "hiit";
  level: "beginner" | "intermediate" | "advanced";
  caloriesPerMin: number;
}

export const EXERCISE_DB: Exercise[] = [
  // ── Cardio / No Equipment ──────────────────────────────────────────────
  {
    name: "Jumping Jacks",
    durationSecs: 60, restSecs: 20,
    muscles: ["full body", "cardio"],
    caloriesPerMin: 8,
    equipment: "none", type: "cardio", level: "beginner",
    instructions: [
      "Stand upright with feet together and arms at your sides.",
      "Jump and simultaneously spread your feet shoulder-width apart.",
      "Raise both arms overhead as you jump.",
      "Jump back to starting position — feet together, arms down.",
      "Keep a steady rhythm throughout.",
    ],
    tip: "Land softly with slightly bent knees to protect your joints.",
  },
  {
    name: "High Knees",
    durationSecs: 45, restSecs: 15,
    muscles: ["core", "hip flexors", "cardio"],
    caloriesPerMin: 10,
    equipment: "none", type: "cardio", level: "beginner",
    instructions: [
      "Stand with feet hip-width apart.",
      "Run in place, driving your knees up to hip height.",
      "Pump your arms in sync with your legs.",
      "Keep your core tight and back straight.",
      "Maintain a fast, controlled pace.",
    ],
    tip: "Focus on driving the knee UP rather than just lifting the foot.",
  },
  {
    name: "Burpees",
    durationSecs: 40, restSecs: 20,
    muscles: ["full body", "chest", "legs", "cardio"],
    caloriesPerMin: 12,
    equipment: "none", type: "hiit", level: "intermediate",
    instructions: [
      "Stand with feet shoulder-width apart.",
      "Drop into a squat and place your hands on the floor.",
      "Jump or step both feet back into a plank position.",
      "Do one push-up (optional).",
      "Jump feet forward to hands, then explode up and clap overhead.",
    ],
    tip: "Modify by stepping instead of jumping if you're a beginner.",
  },
  {
    name: "Mountain Climbers",
    durationSecs: 45, restSecs: 15,
    muscles: ["core", "shoulders", "cardio"],
    caloriesPerMin: 11,
    equipment: "none", type: "hiit", level: "intermediate",
    instructions: [
      "Start in a high plank — hands under shoulders, body straight.",
      "Bring your right knee toward your chest.",
      "Quickly switch, extending right leg back while bringing left knee forward.",
      "Alternate legs as fast as you can control.",
      "Keep hips level — don't let them rise or sink.",
    ],
    tip: "Slow it down if your hips are rocking — control beats speed.",
  },
  {
    name: "Jump Rope (Shadow)",
    durationSecs: 60, restSecs: 30,
    muscles: ["calves", "cardio", "coordination"],
    caloriesPerMin: 13,
    equipment: "none", type: "cardio", level: "beginner",
    instructions: [
      "Stand with feet together, elbows close to your sides.",
      "Mimic a jump rope motion by rotating your wrists.",
      "Make small, quick hops staying on the balls of your feet.",
      "Land gently — no need to jump high, just enough to clear a rope.",
      "Keep a steady rhythm for the full duration.",
    ],
  },
  {
    name: "Squat Jumps",
    durationSecs: 40, restSecs: 20,
    muscles: ["quads", "glutes", "calves", "cardio"],
    caloriesPerMin: 12,
    equipment: "none", type: "hiit", level: "intermediate",
    instructions: [
      "Stand with feet shoulder-width apart.",
      "Lower into a squat — thighs parallel to the floor.",
      "Explode upward, jumping as high as you can.",
      "Land softly in the squat position with bent knees.",
      "Immediately drop into the next squat.",
    ],
    tip: "Swing your arms for extra height and momentum.",
  },
  {
    name: "Butt Kicks",
    durationSecs: 45, restSecs: 15,
    muscles: ["hamstrings", "cardio"],
    caloriesPerMin: 9,
    equipment: "none", type: "cardio", level: "beginner",
    instructions: [
      "Stand with feet hip-width apart.",
      "Run in place, kicking your heels up toward your glutes.",
      "Keep your thighs relatively still — focus on heel-to-butt contact.",
      "Pump your arms in a running motion.",
      "Maintain an upright posture throughout.",
    ],
  },

  // ── Strength / No Equipment ────────────────────────────────────────────
  {
    name: "Push-Ups",
    durationSecs: 40, restSecs: 20, reps: "10–15 reps",
    muscles: ["chest", "triceps", "shoulders"],
    caloriesPerMin: 7,
    equipment: "none", type: "strength", level: "beginner",
    instructions: [
      "Start in a high plank — hands slightly wider than shoulders.",
      "Lower your body until your chest nearly touches the floor.",
      "Keep elbows at a 45° angle from your body.",
      "Push up explosively to starting position.",
      "Keep your body in a straight line — no sagging hips.",
    ],
    tip: "Drop to knees if needed. Full range of motion beats partial reps.",
  },
  {
    name: "Bodyweight Squats",
    durationSecs: 45, restSecs: 15, reps: "15–20 reps",
    muscles: ["quads", "glutes", "hamstrings"],
    caloriesPerMin: 6,
    equipment: "none", type: "strength", level: "beginner",
    instructions: [
      "Stand with feet shoulder-width apart, toes slightly outward.",
      "Push your hips back and bend your knees to lower down.",
      "Keep your chest up and knees tracking over toes.",
      "Lower until thighs are parallel to the floor (or as low as comfortable).",
      "Drive through your heels to stand back up.",
    ],
    tip: "Imagine sitting into a chair behind you.",
  },
  {
    name: "Plank Hold",
    durationSecs: 45, restSecs: 15,
    muscles: ["core", "shoulders", "back"],
    caloriesPerMin: 4,
    equipment: "none", type: "strength", level: "beginner",
    instructions: [
      "Forearms on the floor, elbows under shoulders.",
      "Extend legs behind you, toes on the floor.",
      "Keep your body in a straight line from head to heels.",
      "Squeeze your core and glutes — don't let hips sag or rise.",
      "Breathe steadily throughout the hold.",
    ],
    tip: "Focus on squeezing the abs — not just enduring the time.",
  },
  {
    name: "Lunges",
    durationSecs: 45, restSecs: 15, reps: "10 each leg",
    muscles: ["quads", "glutes", "hamstrings"],
    caloriesPerMin: 6,
    equipment: "none", type: "strength", level: "beginner",
    instructions: [
      "Stand tall with feet together.",
      "Step forward with your right foot into a lunge.",
      "Lower your back knee toward the floor — keep front knee over ankle.",
      "Push back to starting position.",
      "Alternate legs for the full duration.",
    ],
  },
  {
    name: "Glute Bridges",
    durationSecs: 45, restSecs: 15, reps: "15–20 reps",
    muscles: ["glutes", "hamstrings", "lower back"],
    caloriesPerMin: 5,
    equipment: "none", type: "strength", level: "beginner",
    instructions: [
      "Lie on your back with knees bent, feet flat on the floor.",
      "Drive your feet into the floor and squeeze your glutes.",
      "Lift your hips until your body forms a straight line knee-to-shoulder.",
      "Hold at the top for 1 second.",
      "Slowly lower back down.",
    ],
  },
  {
    name: "Tricep Dips (Chair)",
    durationSecs: 40, restSecs: 20, reps: "10–12 reps",
    muscles: ["triceps", "shoulders"],
    caloriesPerMin: 6,
    equipment: "home", type: "strength", level: "beginner",
    instructions: [
      "Sit on the edge of a sturdy chair, hands gripping the seat beside your hips.",
      "Slide your bottom off the chair, legs extended or bent.",
      "Lower your body by bending your elbows to ~90°.",
      "Push back up by straightening your arms.",
      "Keep your back close to the chair throughout.",
    ],
  },
  {
    name: "Pike Push-Ups",
    durationSecs: 40, restSecs: 20, reps: "8–12 reps",
    muscles: ["shoulders", "triceps", "upper back"],
    caloriesPerMin: 7,
    equipment: "none", type: "strength", level: "intermediate",
    instructions: [
      "Start in a downward dog position — hips high, body in an inverted V.",
      "Bend your elbows to lower the top of your head toward the floor.",
      "Push back up by straightening your arms.",
      "Keep elbows tucked, not flared wide.",
    ],
    tip: "This is a shoulder press using your bodyweight.",
  },

  // ── Flexibility / Stretching ───────────────────────────────────────────
  {
    name: "Child's Pose",
    durationSecs: 60, restSecs: 10,
    muscles: ["lower back", "hips", "shoulders"],
    caloriesPerMin: 1,
    equipment: "none", type: "flexibility", level: "beginner",
    instructions: [
      "Kneel on the floor with knees hip-width apart, big toes touching.",
      "Sit back onto your heels.",
      "Stretch your arms forward on the floor and rest your forehead down.",
      "Breathe deeply into your back and hold.",
    ],
    tip: "Breathe into your back body to deepen the stretch.",
  },
  {
    name: "Hip Flexor Stretch",
    durationSecs: 60, restSecs: 10,
    muscles: ["hip flexors", "quads"],
    caloriesPerMin: 1,
    equipment: "none", type: "flexibility", level: "beginner",
    instructions: [
      "Kneel on your right knee, left foot forward (lunge position).",
      "Shift your weight forward until you feel a stretch in your right hip.",
      "Keep your torso upright, hands on your left knee.",
      "Hold 30 seconds, then switch sides.",
    ],
  },
  {
    name: "Cat-Cow Stretch",
    durationSecs: 60, restSecs: 10,
    muscles: ["spine", "back", "core"],
    caloriesPerMin: 1,
    equipment: "none", type: "flexibility", level: "beginner",
    instructions: [
      "Start on all fours — wrists under shoulders, knees under hips.",
      "Inhale: drop your belly, lift your chest and tailbone (Cow).",
      "Exhale: round your spine toward the ceiling, tuck chin and pelvis (Cat).",
      "Flow between the two slowly, following your breath.",
    ],
  },
];

// ── Workout generator ──────────────────────────────────────────────────────────
export interface WorkoutPlan {
  name: string;
  totalMins: number;
  exercises: Exercise[];
  estimatedCalories: number;
}

export function generateWorkout(params: {
  goal: "cardio" | "strength" | "flexibility" | "hiit" | "full_body";
  durationMins: number;
  level: "beginner" | "intermediate" | "advanced";
  equipment: "none" | "home" | "gym";
}): WorkoutPlan {
  const { goal, durationMins, level, equipment } = params;

  // Filter exercises
  let pool = EXERCISE_DB.filter((e) => {
    const levelOk = level === "beginner" ? e.level === "beginner"
      : level === "intermediate" ? e.level !== "advanced"
      : true;
    const equipOk = equipment === "none" ? e.equipment === "none"
      : equipment === "home" ? e.equipment !== "gym"
      : true;
    return levelOk && equipOk;
  });

  // Type filter
  if (goal === "cardio")      pool = pool.filter((e) => e.type === "cardio" || e.type === "hiit");
  if (goal === "strength")    pool = pool.filter((e) => e.type === "strength");
  if (goal === "flexibility") pool = pool.filter((e) => e.type === "flexibility");
  if (goal === "hiit")        pool = pool.filter((e) => e.type === "hiit" || e.type === "cardio");
  if (goal === "full_body")   pool = [...pool]; // all types

  // Shuffle
  pool = pool.sort(() => Math.random() - 0.5);

  // Fill time
  const selected: Exercise[] = [];
  let elapsed = 60; // 1 min warmup
  for (const ex of pool) {
    const total = ex.durationSecs + ex.restSecs;
    if (elapsed + total > durationMins * 60) break;
    selected.push(ex);
    elapsed += total;
  }

  const estCalories = selected.reduce(
    (sum, ex) => sum + Math.round(ex.caloriesPerMin * (ex.durationSecs / 60)),
    0
  );

  const goalLabel: Record<string, string> = {
    cardio: "Cardio Blast",
    strength: "Strength Builder",
    flexibility: "Flexibility Flow",
    hiit: "HIIT Circuit",
    full_body: "Full Body Burn",
  };

  return {
    name: `${goalLabel[goal]} — ${durationMins} min`,
    totalMins: durationMins,
    exercises: selected,
    estimatedCalories: estCalories,
  };
}
