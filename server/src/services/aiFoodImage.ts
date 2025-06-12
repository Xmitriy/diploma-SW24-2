import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface FoodNutrition {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const analyzeFoodImage = async (
  imageBase64: string
): Promise<FoodNutrition | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this image and provide nutrition information for the food shown. 
    If the image does not contain food, return null.
    If it is food, provide the following information in JSON format:
    {
      "food_name": "name of the food",
      "calories": number (in kcal),
      "protein": number (in grams),
      "carbs": number (in grams),
      "fat": number (in grams),
    }

    Only return the JSON object, nothing else. If it's not food, return null.`;

    const imageData = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imageData]);
    const text = result.response.text();

    // Check if the response is "null"
    if (text.trim().toLowerCase() === "null") {
      return null;
    }

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const nutrition: FoodNutrition = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the values
    return {
      food_name: nutrition.food_name,
      calories: Math.max(0, Math.min(2000, nutrition.calories)),
      protein: Math.max(0, Math.min(100, nutrition.protein)),
      carbs: Math.max(0, Math.min(200, nutrition.carbs)),
      fat: Math.max(0, Math.min(100, nutrition.fat)),
    };
  } catch (error) {
    console.error("Error analyzing food image:", error);
    return null;
  }
};

export default analyzeFoodImage;
