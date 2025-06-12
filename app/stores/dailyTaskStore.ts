import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TFunction } from "i18next";
import { API_URL } from "@/utils/constants"; // Assuming API_URL is your base server URL

export type TaskTemplate = {
  templateId: string; // e.g., 'water_glasses_5', 'walk_km_2'
  categoryId: string;
  icon: string;
  // max will be part of the template for fixed-max tasks
  // or could be dynamic if tasks have variable goals (e.g. user-set)
  max: number;
  // keys for i18n
  titleKey: string;
  targetKey: string;
  unitKey: string;
};

export type Task = {
  id: number; // Unique ID for the task instance of the day (timestamp + index)
  templateId: string;
  categoryId: string;
  title: string;
  target: string;
  current: number;
  max: number;
  completed: boolean;
  icon: string;
  unit: string;
};

interface DailyTaskState {
  tasks: Task[];
  lastGeneratedDate: string | null;
  isLoading: boolean;
  streakIncrementedToday: boolean;
  triggerAuthStreakIncrement: (() => Promise<boolean | void>) | null; // To trigger AuthContext streak update

  // New state for completed days calendar
  completedMonthlyDays: number[]; // Stores day numbers (1-31) for the current month
  isLoadingMonthlyDays: boolean;

  // Auth details needed for API calls
  accessToken: string | null;

  initializeTasks: (t: TFunction) => Promise<void>;
  generateNewTasks: (t: TFunction) => Task[];
  incrementTaskProgress: (taskId: number) => Promise<void>;
  setTaskProgress: (taskId: number, currentProgress: number) => Promise<void>;
  checkAndIncrementStreak: () => Promise<void>;
  setTriggerAuthStreakIncrement: (
    fn: (() => Promise<boolean | void>) | null
  ) => void; // Action to set the trigger

  // New actions
  setAuthDetails: (userId: string | null, accessToken: string | null) => void;
  fetchCompletedDaysForMonth: (year: number, month: number) => Promise<void>; // month is 1-12
  markDayAsCompleted: (date: Date) => Promise<void>; // date is a JS Date object for the day completed
}

const STORAGE_KEY_TASKS = "dailyTasks";
const STORAGE_KEY_LAST_GENERATED_DATE = "lastGeneratedDate";
const STORAGE_KEY_STREAK_INCREMENTED_TODAY = "streakIncrementedToday";

// Helper function to get today's date as YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper to format date to YYYY-MM-DD for API
const formatDateForApi = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// --- Task Templates Definitions ---
const taskTemplates: Record<string, TaskTemplate[]> = {
  hydration: [
    {
      templateId: "water_glasses_5",
      categoryId: "hydration",
      icon: "💧",
      max: 5,
      titleKey: "dailyTasks.hydration.waterGlasses.title",
      targetKey: "dailyTasks.hydration.waterGlasses.target",
      unitKey: "dailyTasks.hydration.waterGlasses.unit",
    },
    {
      templateId: "water_liters_2",
      categoryId: "hydration",
      icon: "💧",
      max: 2,
      titleKey: "dailyTasks.hydration.waterLiters.title",
      targetKey: "dailyTasks.hydration.waterLiters.target",
      unitKey: "dailyTasks.hydration.waterLiters.unit",
    },
  ],
  activity: [
    {
      templateId: "walk_steps_7500",
      categoryId: "activity",
      icon: "👣",
      max: 7500,
      titleKey: "dailyTasks.activity.walkSteps.title",
      targetKey: "dailyTasks.activity.walkSteps.target",
      unitKey: "dailyTasks.activity.walkSteps.unit",
    },
    {
      templateId: "walk_steps_5000",
      categoryId: "activity",
      icon: "👣",
      max: 5000,
      titleKey: "dailyTasks.activity.walkSteps.title",
      targetKey: "dailyTasks.activity.walkSteps.target",
      unitKey: "dailyTasks.activity.walkSteps.unit",
    },
    {
      templateId: "walk_steps_10000",
      categoryId: "activity",
      icon: "👣",
      max: 10000,
      titleKey: "dailyTasks.activity.walkSteps.title",
      targetKey: "dailyTasks.activity.walkSteps.target",
      unitKey: "dailyTasks.activity.walkSteps.unit",
    },
    {
      templateId: "workout_minutes_10",
      categoryId: "activity",
      icon: "💪",
      max: 10,
      titleKey: "dailyTasks.activity.workoutMinutes.title",
      targetKey: "dailyTasks.activity.workoutMinutes.target",
      unitKey: "dailyTasks.activity.workoutMinutes.unit",
    },
    {
      templateId: "workout_minutes_20",
      categoryId: "activity",
      icon: "💪",
      max: 20,
      titleKey: "dailyTasks.activity.workoutMinutes.title",
      targetKey: "dailyTasks.activity.workoutMinutes.target",
      unitKey: "dailyTasks.activity.workoutMinutes.unit",
    },
  ],
  mindfulness: [
    {
      templateId: "meditate_minutes_5",
      categoryId: "mindfulness",
      icon: "🧠",
      max: 5,
      titleKey: "dailyTasks.mindfulness.meditateMinutes.title",
      targetKey: "dailyTasks.mindfulness.meditateMinutes.target",
      unitKey: "dailyTasks.mindfulness.meditateMinutes.unit",
    },
    {
      templateId: "stretch_minutes_5",
      categoryId: "mindfulness",
      icon: "🧘",
      max: 5,
      titleKey: "dailyTasks.mindfulness.stretchMinutes.title",
      targetKey: "dailyTasks.mindfulness.stretchMinutes.target",
      unitKey: "dailyTasks.mindfulness.stretchMinutes.unit",
    },
  ],
  nutrition: [
    {
      templateId: "log_meals_1",
      categoryId: "nutrition",
      icon: "🍽️",
      max: 1,
      titleKey: "dailyTasks.nutrition.logMeals.title",
      targetKey: "dailyTasks.nutrition.logMeals.target",
      unitKey: "dailyTasks.nutrition.logMeals.unit",
    },
    {
      templateId: "log_meals_2",
      categoryId: "nutrition",
      icon: "🍽️",
      max: 2,
      titleKey: "dailyTasks.nutrition.logMeals.title",
      targetKey: "dailyTasks.nutrition.logMeals.target",
      unitKey: "dailyTasks.nutrition.logMeals.unit",
    },
    {
      templateId: "log_meals_3",
      categoryId: "nutrition",
      icon: "🍽️",
      max: 3,
      titleKey: "dailyTasks.nutrition.logMeals.title",
      targetKey: "dailyTasks.nutrition.logMeals.target",
      unitKey: "dailyTasks.nutrition.logMeals.unit",
    },
  ],
  sleep: [
    {
      templateId: "sleep_hours_7",
      categoryId: "sleep",
      icon: "😴",
      max: 7,
      titleKey: "dailyTasks.sleep.sleepHours.title",
      targetKey: "dailyTasks.sleep.sleepHours.target",
      unitKey: "dailyTasks.sleep.sleepHours.unit",
    },
  ],
};

const NUMBER_OF_DAILY_TASKS = 5; // Number of tasks to generate each day

const useDailyTaskStore = create<DailyTaskState>((set, get) => ({
  tasks: [],
  lastGeneratedDate: null,
  isLoading: true,
  streakIncrementedToday: false,
  triggerAuthStreakIncrement: null,

  // Initialize new state
  completedMonthlyDays: [],
  isLoadingMonthlyDays: false,
  userId: null,
  accessToken: null,

  setTriggerAuthStreakIncrement: (fn) =>
    set({ triggerAuthStreakIncrement: fn }),

  setAuthDetails: (userId, accessToken) => set({ accessToken }),

  generateNewTasks: (t: TFunction): Task[] => {
    const allTemplates: TaskTemplate[] = Object.values(taskTemplates).flat();
    const selectedTasks: Task[] = [];
    const usedTemplateIds = new Set<string>();
    const timestamp = Date.now(); // For unique task IDs

    // Shuffle = randomize
    const shuffledTemplates = [...allTemplates].sort(() => 0.5 - Math.random());

    for (
      let i = 0;
      selectedTasks.length < NUMBER_OF_DAILY_TASKS &&
      i < shuffledTemplates.length;
      i++
    ) {
      const template = shuffledTemplates[i];
      if (!usedTemplateIds.has(template.templateId)) {
        selectedTasks.push({
          id: timestamp + selectedTasks.length, // Unique ID for this instance
          templateId: template.templateId,
          categoryId: template.categoryId,
          title: t(template.titleKey as any, { count: template.max }),
          target: t(template.targetKey as any, { count: template.max }),
          current: 0,
          max: template.max,
          completed: false,
          icon: template.icon,
          unit: t(template.unitKey as any, { count: template.max }),
        });
        usedTemplateIds.add(template.templateId);
      }
    }
    // If not enough unique tasks, you might want to allow duplicates or have a larger pool
    // For now, it will generate up to NUMBER_OF_DAILY_TASKS or fewer if not enough templates
    return selectedTasks;
  },

  initializeTasks: async (t: TFunction) => {
    set({ isLoading: true });
    try {
      // const storedDate = await AsyncStorage.getItem(
      //   STORAGE_KEY_LAST_GENERATED_DATE
      // );
      const today = getTodayDateString();

      // if (storedDate === today) {
      //   const storedTasks = await AsyncStorage.getItem(STORAGE_KEY_TASKS);
      //   const storedStreakStatus = await AsyncStorage.getItem(
      //     STORAGE_KEY_STREAK_INCREMENTED_TODAY
      //   );
      //   if (storedTasks) {
      //     set({
      //       tasks: JSON.parse(storedTasks),
      //       lastGeneratedDate: storedDate,
      //       streakIncrementedToday: storedStreakStatus === "true",
      //       isLoading: false,
      //     });
      //     return;
      //   }
      // }
      const newTasks = get().generateNewTasks(t);
      await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
      await AsyncStorage.setItem(STORAGE_KEY_LAST_GENERATED_DATE, today);
      await AsyncStorage.setItem(STORAGE_KEY_STREAK_INCREMENTED_TODAY, "false");
      set({
        tasks: newTasks,
        lastGeneratedDate: today,
        streakIncrementedToday: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to initialize tasks:", error);
      const newTasks = get().generateNewTasks(t);
      const today = getTodayDateString();
      // Ensure AsyncStorage is set even in fallback, especially streakIncrementedToday
      try {
        await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
        await AsyncStorage.setItem(STORAGE_KEY_LAST_GENERATED_DATE, today);
        await AsyncStorage.setItem(
          STORAGE_KEY_STREAK_INCREMENTED_TODAY,
          "false"
        );
      } catch (storageError) {
        console.error(
          "Failed to save fallback tasks to AsyncStorage:",
          storageError
        );
      }
      set({
        tasks: newTasks,
        lastGeneratedDate: today,
        streakIncrementedToday: false,
        isLoading: false,
      });
    }
  },

  incrementTaskProgress: async (taskId: number) => {
    // Removed t from params
    const currentTasks = get().tasks;
    const updatedTasks = currentTasks.map((task) => {
      if (task.id === taskId && !task.completed) {
        const newCurrent = task.current + 1;
        const isCompleted = newCurrent >= task.max;
        return {
          ...task,
          current: newCurrent,
          completed: isCompleted,
        };
      }
      return task;
    });

    set({ tasks: updatedTasks });
    await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedTasks));
    await get().checkAndIncrementStreak();
  },

  setTaskProgress: async (taskId: number, newCurrentProgress: number) => {
    const currentTasks = get().tasks;
    let taskChanged = false;
    const updatedTasks = currentTasks.map((task) => {
      if (task.id === taskId) {
        // Ensure progress doesn't exceed max, though for steps it might just be the raw count
        const newCurrent = newCurrentProgress; // Directly set the new progress
        const newCompleted = newCurrent >= task.max;

        // Only mark as changed if current or completed status actually changes
        if (task.current !== newCurrent || task.completed !== newCompleted) {
          taskChanged = true;
          return {
            ...task,
            current: newCurrent,
            completed: newCompleted,
          };
        }
      }
      return task;
    });

    if (taskChanged) {
      set({ tasks: updatedTasks });
      await AsyncStorage.setItem(
        STORAGE_KEY_TASKS,
        JSON.stringify(updatedTasks)
      );
      console.log(
        `DailyTaskStore: Task ${taskId} progress set to ${newCurrentProgress}.`
      );
      await get().checkAndIncrementStreak();
    } else {
      // console.log(`DailyTaskStore: Task ${taskId} progress ${newCurrentProgress} did not result in a change.`);
    }
  },

  checkAndIncrementStreak: async () => {
    const {
      tasks,
      streakIncrementedToday,
      triggerAuthStreakIncrement,
      markDayAsCompleted,
    } = get();
    // 3 tasks completed
    const allTasksCompleted =
      tasks.filter((task) => task.completed).length >= 3;

    // Condition for streak increment might be different, e.g., all tasks completed
    // Original logic: completedCount >= 3
    // New logic: if all tasks are completed for the day
    if (allTasksCompleted && !streakIncrementedToday) {
      if (triggerAuthStreakIncrement) {
        console.log(
          "DailyTaskStore: All tasks completed, attempting to trigger AuthContext streak increment."
        );
        try {
          const success = await triggerAuthStreakIncrement();
          if (success) {
            set({ streakIncrementedToday: true });
            await AsyncStorage.setItem(
              STORAGE_KEY_STREAK_INCREMENTED_TODAY,
              "true"
            );
            console.log(
              "DailyTaskStore: AuthContext confirmed streak increment. Local streak status updated."
            );
            // Also mark the day as completed on the backend
            await markDayAsCompleted(new Date()); // Mark today as completed
          } else {
            console.warn(
              "DailyTaskStore: AuthContext reported failure to increment streak. Local status not updated."
            );
          }
        } catch (error) {
          console.error(
            "DailyTaskStore: Error calling triggerAuthStreakIncrement:",
            error
          );
        }
      } else {
        console.warn(
          "DailyTaskStore: triggerAuthStreakIncrement not set. Cannot update streak in AuthContext."
        );
      }
    }
  },

  fetchCompletedDaysForMonth: async (year: number, month: number) => {
    const { accessToken } = get();
    if (!accessToken) {
      console.warn(
        "DailyTaskStore: Cannot fetch completed days. Missing accessToken."
      );
      set({ completedMonthlyDays: [], isLoadingMonthlyDays: false });
      return;
    }
    set({ isLoadingMonthlyDays: true });
    try {
      // Format month to YYYY-MM
      const monthString = `${year}-${month.toString().padStart(2, "0")}`;
      // The backend route is /api/v1/users/completed-days, so we use /users/completed-days with API_URL
      const response = await fetch(
        `${API_URL}/streak/completed-days?month=${monthString}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Failed to fetch completed days:",
          response.status,
          errorData
        );
        throw new Error(errorData.message || "Failed to fetch completed days");
      }
      const data = await response.json(); // Expecting { completedDayNumbers: number[] }
      set({
        completedMonthlyDays: data.completedDayNumbers || [],
        isLoadingMonthlyDays: false,
      });
      console.log(
        `Fetched completed days for ${monthString}:`,
        data.completedDayNumbers
      );
    } catch (error) {
      console.error("Error in fetchCompletedDaysForMonth:", error);
      set({ completedMonthlyDays: [], isLoadingMonthlyDays: false });
    }
  },

  markDayAsCompleted: async (dateToMark: Date) => {
    const { accessToken } = get();
    if (!accessToken) {
      console.warn(
        "DailyTaskStore: Cannot mark day as completed. Missing accessToken."
      );
      return;
    }
    try {
      const dateString = formatDateForApi(dateToMark);
      // The backend POST route is /api/v1/users/completed-days
      const response = await fetch(`${API_URL}/streak/completed-days`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ date: dateString }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Failed to mark day as completed:",
          response.status,
          errorData
        );
        throw new Error(errorData.message || "Failed to mark day as completed");
      }
      const data = await response.json();
      console.log("Day marked as completed on backend:", data);
      // Optionally, refresh the current month's completed days to update UI immediately
      const today = new Date();
      if (
        dateToMark.getFullYear() === today.getFullYear() &&
        dateToMark.getMonth() === today.getMonth()
      ) {
        await get().fetchCompletedDaysForMonth(
          today.getFullYear(),
          today.getMonth() + 1
        );
      }
    } catch (error) {
      console.error("Error in markDayAsCompleted:", error);
    }
  },
}));

export default useDailyTaskStore;
