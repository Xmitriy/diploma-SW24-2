interface RegisterState {
  username: string;
  gender: string;
  birthday: Date;
  weight: number;
  height: number;
  goal: string;
  activityLevel: string;
  mealPerDay: string;
  waterPerDay: string;
  workSchedule: string;
  healthCondition: string;

  email: string;
  password: string;
  progress: number;
  setField: (key: keyof Omit<RegisterState, "setField">, value: any) => void;
}

type registerFormType = {
  username: string;
  gender: string;
  birthday: Date;
  weight: number;
  height: number;
  goal: string;
  activityLevel: string;
  mealPerDay: string;
  waterPerDay: string;
  workSchedule: string;
  healthCondition: string;
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: any;
};

type DataType = {
  label: string;
  date: string;
  value: number;
};

type User = {
  // id is from accessToken
  id: string;
  _id: string;
  username: string;
  email: string;
  streak: number;
  stats?: Record<string, any>;
  gender: Gender;
  birthday: Date;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
  mealPerDay: string;
  waterPerDay: string;
  workSchedule: string;
  healthCondition: string;
  password: string;
  role: Role;
  bio?: string;
  image?: string | null;
  posts?: string[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  dailyGoals?: DailyGoals;
  highestStreak?: number;
};

type DailyGoals = {
  stepsGoal: number;
  waterGoal: number;
  caloriesGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  sleepGoal: number;
  rdcGoal: number;
};

interface Message {
  id: string;
  content: string;
  role: "user" | "model" | "system";
  timestamp: Date | string; // Allow string from API, convert to Date
  isStreaming?: boolean;
}

type FoodImage = {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

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
