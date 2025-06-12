import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer, { Browser, Page } from "puppeteer";
import { IUser } from "@/models/user";
import { config } from "dotenv";
import { IDailyGoal } from "@/models/dailyGoal";
config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type ImageSource = string | null;

async function scrapeFoodiesfeed(page: Page, foodName: string) {
  try {
    const searchTerm = foodName.replace(/\s+/g, "+");
    const url = `https://www.foodiesfeed.com/?s=${searchTerm}`;
    // console.log(`Scraping Foodiesfeed for ${foodName}`);

    await page.goto(url, { waitUntil: "networkidle2" });

    let imageSources: ImageSource[] = [];
    const primarySelector = "a.getty-image-item img";
    const fallbackSelector = "li.photo-published img.wp-post-image";

    try {
      await page.waitForSelector(primarySelector, { timeout: 10000 });
      imageSources = await page.evaluate((selector) => {
        const images = Array.from(document.querySelectorAll(selector));
        return images.map((img) => img.getAttribute("src"));
      }, primarySelector);
    } catch (e) {
      console.log(
        `Primary selector ${primarySelector} not found or timeout for ${foodName}.`
      );
    }

    if (imageSources.length === 0) {
      console.log(`Trying fallback selector for ${foodName} on Foodiesfeed.`);
      try {
        await page.waitForSelector(fallbackSelector, { timeout: 7000 });
        imageSources = await page.evaluate((selector) => {
          const images = Array.from(document.querySelectorAll(selector));
          return images.map((img) => img.getAttribute("src"));
        }, fallbackSelector);
      } catch (e) {
        console.log(
          `Fallback selector ${fallbackSelector} not found or timeout for ${foodName}.`
        );
      }
    }
    return imageSources.length > 0
      ? imageSources[
          Math.floor(Math.random() * Math.min(imageSources.length, 5))
        ]
      : null;
  } catch (error: any) {
    console.error(
      `Error scraping Foodiesfeed for ${foodName} on page:`,
      error.message
    );
    return null;
  }
}

const genFoodPlan = async (user: IUser, goal?: IDailyGoal | null) => {
  let browser: Browser | null = null;
  console.time("genFoodPlan");
  try {
    browser = await puppeteer.launch({
      headless: "shell",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate varied and creative food recommendations for USER for breakfast, lunch, dinner, and a snack, aiming for different suggestions each time this is run.
    USER's weight is ${user.weight}kg, height is ${user.height}cm, gender is ${
      user.gender
    }, activity level is ${user.activityLevel}, health condition is ${
      user.healthCondition
    }.
    ${
      goal
        ? `USER's goal is ${goal.caloriesGoal}kcal and ${goal.proteinGoal}g of protein, ${goal.carbsGoal}g of carbs, ${goal.fatGoal}g of fat.`
        : ""
    }
    For each meal, provide the following information in a JSON-like format:
    IMPORTANT: Keep food names simple and common and not too long (e.g., "Chicken Salad", not "Grilled Chicken Breast Salad with Mixed Greens and Italian Vinaigrette"). This will help find matching images.
    Ensure the entire response is only the JSON object, with no other text before or after it.
    Do not use hyphens (-) in the food names.

{
  "breakfast": {
    "food_name": "Food Name",
    "protein": "XX",
    "fat": "XX",
    "carbs": "XX",
    "calories": "XXX"
  },
  "lunch": { 
    "food_name": "Food Name", 
    "protein": "XX", 
    "fat": "XX", 
    "carbs": "XX", 
    "calories": "XXX" 
  },
  "dinner": { 
    "food_name": "Food Name", 
    "protein": "XX", 
    "fat": "XX", 
    "carbs": "XX", 
    "calories": "XXX" 
  },
  "snack": { 
    "food_name": "Food Name", 
    "protein": "XX", 
    "fat": "XX", 
    "carbs": "XX", 
    "calories": "XXX" 
  }
}

The nutritional values (protein, fat, carbs, calorie) should be approximate for a standard serving.
only return number values, no units for protein, fat, carbs, calories.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    console.log("AI Response for food plan:", jsonMatch[0]);
    const aiFoodPlan = JSON.parse(jsonMatch[0]);

    const mealTypes = Object.keys(aiFoodPlan);

    const scrapePromises = mealTypes.map(async (mealType) => {
      let page: Page | null = null;
      try {
        page = await browser!.newPage();
        await page.setRequestInterception(true);
        page.on("request", (req) => {
          if (["image", "stylesheet", "font"].includes(req.resourceType())) {
            req.abort();
          } else {
            req.continue();
          }
        });

        const foodName = aiFoodPlan[mealType].food_name;
        const imageUrl = await scrapeFoodiesfeed(page, foodName);
        return {
          mealType: mealType,
          data: {
            ...aiFoodPlan[mealType],
            image: imageUrl,
          },
        };
      } catch (err: any) {
        console.error(
          `Error processing ${mealType}:`,
          err.message ? err.message : err
        );
        return {
          mealType: mealType,
          data: {
            ...aiFoodPlan[mealType],
            image: null,
          },
        };
      } finally {
        if (page) {
          await page.close();
        }
      }
    });

    const mealsWithImagesArray = await Promise.all(scrapePromises);

    const finalFoodPlan: { [key: string]: any } = {};
    mealsWithImagesArray.forEach((meal) => {
      if (meal && meal.mealType) {
        finalFoodPlan[meal.mealType] = meal.data;
      }
    });

    return finalFoodPlan;
  } catch (error: any) {
    console.error(
      "Error in genFoodPlan function:",
      error.message ? error.message : error
    );
    return null;
  } finally {
    console.timeEnd("genFoodPlan");
    if (browser) {
      await browser.close();
    }
  }
};

export default genFoodPlan;
