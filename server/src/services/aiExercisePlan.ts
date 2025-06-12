import { GoogleGenerativeAI } from "@google/generative-ai";
import { IUser } from "@/models/user";
import { config } from "dotenv";
import fs from "fs";
config();

const exercises: IExercise[] = JSON.parse(
  fs.readFileSync("./src/services/exercises.json", "utf8")
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface IExercise {
  id: number;
  name: string;
  category: string;
  description: string;
  duration_minutes: number;
  repetitions?: number;
  sets?: number;
  equipment: string;
  level: string;
  video?: string;
}

const genExercisePlan = async (user: IUser) => {
  console.time("genExercisePlan");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const exerciseNames = exercises.map((ex) => ex.name).join(", ");
    console.log(exerciseNames);

    const prompt = `Generate a personalized exercise plan for the USER based on their information and the provided list of available exercises.
    The plan should include 3-5 exercises.
    USER's weight is ${user.weight}kg, height is ${user.height}cm, gender is ${user.gender}, activity level is ${user.activityLevel},
    health condition is ${user.healthCondition}, and fitness goal is ${user.goal}.

    Available exercises: ${exerciseNames}.

    For each selected exercise, provide the following information in a JSON array format.
    Only choose exercises from the provided list.
    Ensure the entire response is only the JSON array, with no other text before or after it.
    if the equipment is not available, set it to null.

    Example structure for output:
[
  {
    "name": "Push-ups",
    "category": "Upper Body",
    "description": "Works chest, shoulders, and triceps.",
    "duration_minutes": 5,
    "repetitions": 15,
    "sets": 3,
    "equipment": null,
    "level": "Beginner",
    "video": "https://www.youtube.com/watch?v=BxifHP2ZgL4"
  },
  {
    "name": "Squats",
    "category": "Lower Body",
    "description": "Targets thighs, hips, and glutes.",
    "duration_minutes": 5,
    "repetitions": 20,
    "sets": 3,
    "equipment": null,
    "level": "Dumbbell",
    "video": "https://www.youtube.com/watch?v=ONh_HjAnLBs"
  }
  // ... more exercises
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error("Raw AI Response:", text);
      throw new Error(
        "Failed to parse AI response into a JSON array. The response might not be in the expected array format."
      );
    }

    let plan: IExercise[] = [];
    try {
      plan = JSON.parse(jsonMatch[0]);
    } catch (e: any) {
      console.error("Failed to parse JSON from AI response:", jsonMatch[0]);
      console.error("Error parsing JSON:", e.message);
      // Corrected template literal for the error message
      throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
    }

    const validatedPlan = plan
      .map((aiExercise) => {
        const foundExercise = exercises.find(
          (ex) => ex.name.toLowerCase() === aiExercise.name.toLowerCase()
        );
        if (!foundExercise) {
          console.warn(
            `AI recommended exercise "${aiExercise.name}" not found in the local exercises.json. Skipping.`
          );
          return null;
        }

        return {
          ...foundExercise,
        };
      })
      .filter((ex) => ex !== null) as IExercise[]; // Filter out any nulls (skipped exercises)

    if (validatedPlan.length === 0 && plan.length > 0) {
      throw new Error(
        "AI generated a plan, but none of the exercises could be validated against the local list."
      );
    }
    if (validatedPlan.length === 0) {
      throw new Error(
        "AI failed to generate any valid exercises for the plan or no exercises were returned."
      );
    }

    return validatedPlan;
  } catch (error: any) {
    console.error(
      "Error generating exercise plan:",
      error.message ? error.message : error
    );
    return null;
  } finally {
    console.timeEnd("genExercisePlan");
  }
};

export default genExercisePlan;
