import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import moment from "moment";
import { Icon } from "react-native-paper";
import { useAppTheme } from "@/lib/theme";
import { ThemeText } from "@/components";

const HorizontalDateSelector = () => {
  const { theme } = useAppTheme();
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );

  useEffect(() => {
    const tempDates = [];
    const today = moment();
    for (let i = -3; i <= 3; i++) {
      tempDates.push(today.clone().add(i, "days").format("YYYY-MM-DD"));
    }
    setDates(tempDates);
  }, []);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <ScrollView className="py-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {dates.map((date) => {
          const isSelected = selectedDate === date;
          const formatted = moment(date);
          const isToday = formatted.isSame(moment(), "day");
          return (
            <TouchableOpacity
              key={date}
              onPress={() => handleSelectDate(date)}
              className={`px-4 py-2 mx-2 rounded-2xl ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              <Text
                className={`text-sm ${
                  isSelected
                    ? "text-black font-bold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {isToday
                  ? `Today, ${formatted.format("D MMM")}`
                  : formatted.format("D")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View className="flex-row justify-between items-center border-2 border-gray-200 dark:border-gray-700 rounded-full mt-8 w-full p-2">
        <View className="flex-row items-center justify-center">
          <View className="items-center justify-center p-5 rounded-full bg-blue-400 shadow-sm shadow-gray-500 ">
            <Icon source="run-fast" size={25} color="white" />
          </View>
          <View className="ml-4">
            <ThemeText className="text-lg font-semibold dark:text-white">
              Indoor Run
            </ThemeText>
            <Text className="text-base text-gray-500 dark:text-gray-400">
              24 min
            </Text>
          </View>
        </View>
        <View className="flex-end mr-4">
          <ThemeText className="text-lg font-semibold ml-2 dark:text-white">
            5.56 km
          </ThemeText>
          <View className="flex-row items-center justify-center">
            <Icon
              source="fire"
              size={20}
              color={theme === "dark" ? "#fff" : "#000"}
            />
            <ThemeText className="text-base dark:text-white">
              333 kcal
            </ThemeText>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-2 border-gray-200 dark:border-gray-700 rounded-full mt-5 w-full p-2">
        <View className="flex-row items-center justify-center">
          <View className="items-center justify-center p-5 rounded-full bg-black dark:bg-white shadow-sm shadow-gray-500 ">
            <Icon
              source="bike"
              size={25}
              color={theme === "dark" ? "#000" : "#fff"}
            />
          </View>
          <View className="ml-4">
            <ThemeText className="text-lg font-semibold dark:text-white">
              Outdoor Cycle
            </ThemeText>
            <Text className="text-base text-gray-500 dark:text-gray-400">
              24 min
            </Text>
          </View>
        </View>
        <View className="flex-end mr-4">
          <ThemeText className="text-lg font-semibold ml-2">5.56 km</ThemeText>
          <View className="flex-row items-center justify-center">
            <Icon
              source="fire"
              size={20}
              color={theme === "dark" ? "#fff" : "#000"}
            />
            <ThemeText className="text-base">333 kcal</ThemeText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HorizontalDateSelector;
