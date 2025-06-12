import { create } from "zustand";

export const useRegisterStore = create<RegisterState>((set) => ({
  // mock data
  gender: "male",
  birthday: new Date(),
  weight: 55,
  height: 180,
  goal: "gain weight",
  activityLevel: "sedentary",
  mealPerDay: "3 meals",
  waterPerDay: "1l",
  workSchedule: "24/7",
  healthCondition: "healthy",
  // gender: "",
  // birthday: new Date(),
  // weight: 0,
  // height: 0,
  // goal: "",
  // activityLevel: "",
  // mealPerDay: "",
  // waterPerDay: "",
  // workSchedule: "",
  // healthCondition: "",

  username: "",
  email: "",
  password: "",
  progress: 0,
  setField: (key, value) => {
    console.log("setField", key, value);
    set((state) => ({ ...state, [key]: value }));
  },
}));
