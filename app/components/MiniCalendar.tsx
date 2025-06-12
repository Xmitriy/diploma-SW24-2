import { ThemeText } from "@/components";
import { View, Text, Pressable, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { format, startOfMonth, endOfMonth, getDay, getDate } from "date-fns";
import { useRef, useState } from "react";

const weekdayShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MiniCalendar({
  currentDate,
  completedDays,
  onToggleComplete,
  onPrevMonth,
  onNextMonth,
  isNextDisabled,
}: {
  currentDate: Date;
  completedDays: number[];
  onToggleComplete: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isNextDisabled: boolean;
}) {
  const today = new Date();
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const totalDays = getDate(end);
  const startDay = (getDay(start) + 6) % 7;
  const daysArray = Array(startDay)
    .fill(null)
    .concat([...Array(totalDays)].map((_, i) => i + 1));

  const isToday = (date: number) =>
    today.getDate() === date &&
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  const isCompleted = (date: number) => completedDays.includes(date);
  const ArrowButton = ({
    direction,
    onPress,
  }: {
    direction: "left" | "right";
    onPress: () => void;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [pressed, setPressed] = useState(false);

    const handlePressIn = () => {
      setPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      onPress();
      setPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <View
            className={`${
              pressed ? "bg-blue-700" : "bg-blue-500"
            } rounded-full p-1`}
          >
            <ThemeText className="text-white dark:text-black">
              <Feather
                name={direction === "left" ? "chevron-left" : "chevron-right"}
                size={22}
              />
            </ThemeText>
          </View>
        </Pressable>
      </Animated.View>
    );
  };
  return (
    <View className="w-full border-2 border-gray-200 dark:border-gray-500 p-3 rounded-xl">
      {/* Header with month & nav */}
      <View className="flex-row justify-between items-center mb-4 px-2">
        <ArrowButton direction="left" onPress={onPrevMonth} />
        <Text className="text-lg font-bold text-black dark:text-white">
          {format(currentDate, "MMMM, yyyy")}
        </Text>
        {isNextDisabled ? (
          <View className="bg-gray-400 dark:bg-gray-700 rounded-full p-1">
            <Feather name="chevron-right" size={22} color="white" />
          </View>
        ) : (
          <ArrowButton direction="right" onPress={onNextMonth} />
        )}
      </View>

      {/* Weekday header */}
      <View className="flex-row justify-between mb-1 mt-2">
        {weekdayShort.map((day, i) => (
          <Text
            key={i}
            className="flex-1 text-center text-md font-bold text-gray-500"
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Dates grid */}
      <View className="flex-row flex-wrap mt-3">
        {daysArray.map((day, index) => {
          const isTodayDate = isToday(day);
          const isStreakDay = isCompleted(day);

          return (
            <View
              key={index}
              className="w-[14.28%] aspect-square items-center justify-center p-1"
            >
              {day ? (
                <Pressable
                  // onPress={() => onToggleComplete(day)}
                  className={`
                    w-12 h-12 rounded-full items-center justify-center
                    ${isStreakDay ? "bg-blue-500" : ""}
                    ${
                      isTodayDate && !isStreakDay
                        ? "border-2 border-blue-500"
                        : ""
                    }
                  `}
                >
                  <Text
                    className={`${
                      isStreakDay
                        ? "text-white"
                        : "text-gray-400 text-md font-bold dark:text-gray-500"
                    }`}
                  >
                    {day}
                  </Text>
                </Pressable>
              ) : (
                <Text className="text-transparent">0</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
