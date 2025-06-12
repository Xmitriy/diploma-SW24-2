import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface UserStats {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  activityLevel?: string;
  healthConditions?: string[];
}

interface DailyGoals {
  waterGoal: number;
  stepsGoal: number;
  caloriesGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  sleepGoal: number;
  rdcGoal: number;
}

export async function generateDailyGoals(
  userStats: UserStats
): Promise<DailyGoals> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `As a health and fitness expert, please provide personalized daily goals for a user with the following characteristics:
    Age: ${userStats.age || "Not specified"}
    Weight: ${userStats.weight || "Not specified"} kg
    Height: ${userStats.height || "Not specified"} cm
    Gender: ${userStats.gender || "Not specified"}
    Activity Level: ${userStats.activityLevel || "Not specified"}
    Health Conditions: ${
      userStats.healthConditions?.join(", ") || "None specified"
    }

    Please provide specific numerical values for:
    1. Daily water intake (in ml)
    2. Daily steps target
    3. Daily calorie target
    4. Daily protein target (in g)
    5. Daily carbs target (in g)
    6. Daily fat target (in g)
    7. Daily sleep target (in hours)
    8. Daily recommended calorie deficit/surplus (in calories)

    Format the response as a JSON object with these exact keys:
    {
      "waterGoal": number,
      "stepsGoal": number,
      "caloriesGoal": number,
      "proteinGoal": number,
      "carbsGoal": number,
      "fatGoal": number,
      "sleepGoal": number,
      "rdcGoal": number
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const goals: DailyGoals = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the values
    return {
      waterGoal: Math.max(1500, Math.min(5000, goals.waterGoal)),
      stepsGoal: Math.max(5000, Math.min(20000, goals.stepsGoal)),
      caloriesGoal: Math.max(1200, Math.min(4000, goals.caloriesGoal)),
      proteinGoal: Math.max(30, Math.min(300, goals.proteinGoal)),
      carbsGoal: Math.max(100, Math.min(500, goals.carbsGoal)),
      fatGoal: Math.max(20, Math.min(200, goals.fatGoal)),
      sleepGoal: Math.max(6, Math.min(10, goals.sleepGoal)),
      rdcGoal: Math.max(-1000, Math.min(1000, goals.rdcGoal)),
    };
  } catch (error) {
    console.error("Error generating daily goals:", error);
    // Return default values if AI generation fails
    return {
      waterGoal: 2000,
      stepsGoal: 10000,
      caloriesGoal: 2000,
      proteinGoal: 50,
      carbsGoal: 275,
      fatGoal: 55,
      sleepGoal: 8,
      rdcGoal: 30,
    };
  }
}
