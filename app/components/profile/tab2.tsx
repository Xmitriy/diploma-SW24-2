import { ThemeView, ThemeText } from "@/components";
import { Icon } from "react-native-paper";

import { LayoutChangeEvent, ScrollView, Text } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LineChart from "@/components/graph/LineChart";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AnimatedText from "@/components/graph/AnimatedText";
import { useSharedValue } from "react-native-reanimated";
import { useFont } from "@shopify/react-native-skia";
import { useAppTheme } from "@/lib/theme";

const data: DataType[] = [
  { label: "Mon", date: "Monday", value: 1298 },
  { label: "Tue", date: "Tuesday", value: 1032 },
  { label: "Wed", date: "Wednesday", value: 1346 },
  { label: "Thu", date: "Thursday", value: 1186 },
  { label: "Fri", date: "Friday", value: 1378 },
  { label: "Sat", date: "Saturday", value: 1187 },
  { label: "Sun", date: "Sunday", value: 1234 },
];

const LineChartScreen = () => {
  const CHART_MARGIN = 20;
  const CHART_HEIGHT = 180;
  const [selectedDate, setSelectedDate] = useState<string>("Total");
  const selectedValue = useSharedValue(0);
  const font = useFont(require("@/assets/fonts/Roboto-Regular.ttf"), 22);
  const [tabWidth, setTabWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setTabWidth(e.nativeEvent.layout.width);
  };

  if (!font) {
    return null;
  }

  return (
    <GestureHandlerRootView
      onLayout={onLayout}
      className="items-center justify-center text-center w-full"
    >
      <SafeAreaView className="bg-white dark:bg-gray-900 text-center">
        <Text className="text-black dark:text-white">{selectedDate}</Text>
        <AnimatedText selectedValue={selectedValue} font={font} />
        <LineChart
          data={data}
          chartHeight={CHART_HEIGHT}
          chartWidth={tabWidth}
          chartMargin={CHART_MARGIN}
          setSelectedDate={setSelectedDate}
          selectedValue={selectedValue}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default function Tab2() {
  const { theme } = useAppTheme();
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
      <LineChartScreen />

      <ThemeView className="items-center justify-between flex-row mt-8">
        <ThemeText className="text-xl font-semibold">Active Calories</ThemeText>
        <ThemeText className="text-xl font-semibold">7 days</ThemeText>
      </ThemeView>

      <ThemeView className="justify-evenly flex-row mt-8 mb-20">
        <ThemeView className="items-center">
          <Icon
            source="heart-outline"
            size={30}
            color={theme === "dark" ? "#fff" : "#000"}
          />
          <ThemeText className="text-xl font-semibold mt-2">246 Kcal</ThemeText>
          <ThemeText className="text-gray-400 dark:text-gray-500">
            Last 7 days
          </ThemeText>
        </ThemeView>
        <ThemeView className="items-center">
          <Icon
            source="fire"
            size={30}
            color={theme === "dark" ? "#fff" : "#000"}
          />
          <ThemeText className="text-xl font-semibold mt-2">24k Kcal</ThemeText>
          <ThemeText className="text-gray-400 dark:text-gray-500">
            All time
          </ThemeText>
        </ThemeView>
        <ThemeView className="items-center">
          <Icon
            source="flash"
            size={30}
            color={theme === "dark" ? "#fff" : "#000"}
          />
          <ThemeText className="text-xl font-semibold mt-2">246 Kcal</ThemeText>
          <ThemeText className="text-gray-400 dark:text-gray-500">
            Avarage
          </ThemeText>
        </ThemeView>
      </ThemeView>
    </ScrollView>
  );
}
