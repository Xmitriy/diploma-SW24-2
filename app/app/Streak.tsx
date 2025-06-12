import { ThemeView } from "@/components";
import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { addMonths, subMonths } from "date-fns";
import MiniCalendar from "@/components/MiniCalendar";
import ConfettiCannon from "react-native-confetti-cannon";
import useDailyTaskStore from "@/stores/dailyTaskStore";
import { AuthContext } from "@/context/auth";
import { useAppTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/language";

export default function Streak() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const confettiRef = useRef<ConfettiCannon>(null);

  const { user, accessToken } = useContext(AuthContext);
  const { theme } = useAppTheme();
  const {
    completedMonthlyDays,
    isLoadingMonthlyDays,
    fetchCompletedDaysForMonth,
    // markDayAsCompleted,
  } = useDailyTaskStore();

  const today = new Date();

  useEffect(() => {
    if ((user?.id || user?._id) && accessToken) {
      console.log("fetching completed days for month", user?.id, user?._id);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      fetchCompletedDaysForMonth(year, month);
    }
  }, [currentDate, fetchCompletedDaysForMonth, user, accessToken]);

  const onToggleComplete = async (day: number) => {
    // const dateToToggle = new Date(
    //   currentDate.getFullYear(),
    //   currentDate.getMonth(),
    //   day
    // );
    // const isCompleted = completedMonthlyDays.includes(day);
    // if (!isCompleted) {
    //   await markDayAsCompleted(dateToToggle);
    //   // After marking, refresh the month's data
    //   const year = currentDate.getFullYear();
    //   const month = currentDate.getMonth() + 1;
    //   fetchCompletedDaysForMonth(year, month);
    // } else {
    //   console.log(
    //     "Day already completed or un-marking is not implemented yet."
    //   );
    //   // If un-marking were implemented, you would call a different store action here
    //   // and then refresh: e.g., await unmarkDayAsCompleted(dateToToggle);
    //   // followed by fetchCompletedDaysForMonth(year, month);
    // }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleNextMonth = () => {
    const nextMonthDate = addMonths(currentDate, 1);
    if (
      nextMonthDate.getFullYear() < today.getFullYear() ||
      (nextMonthDate.getFullYear() === today.getFullYear() &&
        nextMonthDate.getMonth() <= today.getMonth())
    ) {
      setCurrentDate(nextMonthDate);
    }
  };

  const isNextDisabled =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  // Use global streak data from AuthContext user object
  const globalCurrentStreak = user?.streak || 0;
  const globalLongestStreak = user?.highestStreak || 0;

  const achievements = useMemo(
    () => [
      { days: 7, label: "7-Day Streak" },
      { days: 14, label: "14-Day Streak" },
      { days: 30, label: "30-Day Streak" },
      { days: 60, label: "60-Day Streak" },
    ],
    []
  );

  useEffect(() => {
    const isAchievementMilestone = achievements.some(
      (ach) => ach.days === globalCurrentStreak && globalCurrentStreak > 0
    );
    if (isAchievementMilestone && confettiRef.current) {
      // Check if this milestone was already hit for this specific streak count to avoid re-triggering too often
      // This might need more sophisticated state if you only want confetti once per milestone achievement.
      // For simplicity, if current streak IS a milestone, show confetti.
      confettiRef.current?.start();
    }
  }, [globalCurrentStreak, achievements]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemeView className="flex-1 bg-white dark:bg-gray-900">
        <View className="w-full px-2 mb-2">
          <Text className="text-lg font-bold text-black dark:text-white mt-10 text-center">
            {t("streak.title")}
          </Text>
        </View>

        <View className="p-4 dark:bg-gray-900">
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 bg-blue-100 p-3 rounded-xl mr-2">
              <Text className="text-md font-semibold text-blue-800">
                {t("streak.current")}
              </Text>
              <Text className="text-2xl font-bold text-blue-900">
                {globalCurrentStreak} Days
              </Text>
            </View>
            <View className="flex-1 bg-yellow-100 p-3 rounded-xl ml-2">
              <Text className="text-md font-semibold text-yellow-800">
                {t("streak.longest")}
              </Text>
              <Text className="text-2xl font-bold text-yellow-900">
                {globalLongestStreak} Days
              </Text>
            </View>
          </View>

          {isLoadingMonthlyDays ? (
            <View
              className="h-64 flex justify-center items-center"
              style={{ height: 362 }}
            >
              <ActivityIndicator
                size="large"
                color={theme === "dark" ? "#FFFFFF" : "#0000FF"}
              />
            </View>
          ) : (
            <MiniCalendar
              currentDate={currentDate}
              completedDays={completedMonthlyDays}
              onToggleComplete={onToggleComplete}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              isNextDisabled={isNextDisabled}
            />
          )}

          {/* Achievements */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-black dark:text-white mb-4 text-center">
              {t("streak.achievements")}
            </Text>
            <View className="flex-row flex-wrap justify-between gap-4">
              {achievements.map((achievement, index) => {
                const unlocked = globalLongestStreak >= achievement.days;
                const progress = Math.min(
                  globalLongestStreak / achievement.days,
                  1
                );

                return (
                  <View
                    key={index}
                    className={`w-[48%] items-center p-4 rounded-xl ${
                      unlocked ? "bg-green-100" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <View
                      className={`h-12 w-12 rounded-full mb-2 items-center justify-center ${
                        unlocked
                          ? "bg-green-200"
                          : "bg-gray-400 dark:bg-gray-600"
                      }`}
                    >
                      <Text className="text-xl">{unlocked ? "🏆" : "🔒"}</Text>
                    </View>

                    <Text
                      className={`text-sm font-medium ${
                        unlocked
                          ? "text-green-800"
                          : "text-gray-500 dark:text-gray-300"
                      }`}
                    >
                      {achievement.label}
                    </Text>

                    <Text
                      className={`text-xs mt-1 px-2 py-1 rounded-full ${
                        unlocked
                          ? "bg-green-300 text-green-900"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {unlocked ? "Unlocked" : "Locked"}
                    </Text>

                    {!unlocked && (
                      <View className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2">
                        <View
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <ConfettiCannon
              count={50}
              origin={{ x: 200, y: -20 }}
              fadeOut
              explosionSpeed={300}
              fallSpeed={3000}
              ref={confettiRef}
              autoStart={false}
            />
          </View>
        </View>
      </ThemeView>
    </ScrollView>
  );
}
