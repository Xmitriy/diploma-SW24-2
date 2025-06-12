import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ProgressBar, Icon } from "react-native-paper";
import { ThemeText } from "@/components";
import { useAppTheme } from "@/lib/theme";
import moment from "moment";

export default function Tab3() {
  const { theme } = useAppTheme();

  // Dynamic names
  const yourName = "You";
  const opponentName = "Alex";

  // Steps
  const yourSteps = 4246;
  const alexSteps = 9468;

  // Progress
  const total = yourSteps + alexSteps;
  const yourProgress = yourSteps / total;
  const alexProgress = alexSteps / total;

  // Today's date using moment
  const today = moment().format("dddd, D MMM"); // Жишээ: Tuesday, 13 May

  return (
    <ScrollView className="p-4">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mt-8">
        {/* Top avatars and dynamic title */}
        <View className="flex-row justify-evenly items-center border-b pb-4 border-gray-300 dark:border-gray-600">
          <Image
            source={require("@/assets/img/duel1.png")}
            style={{ width: 53, height: 50 }}
          />
          <View className="items-center">
            <View className="flex-row jsutify-center items-center gap-4">
              <Text className="text-xl font-bold text-[#E9509F]">
                {yourName}
              </Text>
              <ThemeText>vs</ThemeText>
              <Text className="text-xl font-bold text-blue-500">
                {opponentName}
              </Text>
            </View>
            <ThemeText className="text-sm text-gray-500">3 workouts</ThemeText>
          </View>
          <Image
            source={require("@/assets/img/duel2.png")}
            style={{ width: 53, height: 50 }}
          />
        </View>

        {/* Dynamic Date */}
        <ThemeText className="text-center text-sm text-gray-500 mt-4 mb-2">
          {today}
        </ThemeText>

        {/* Steps */}
        <View className="flex-row justify-center space-x-1">
          <Text className="font-bold text-xl text-[#E9509F]">{yourSteps}</Text>
          <ThemeText className="text-lg text-gray-500 mx-2">vs</ThemeText>
          <Text className="font-bold text-xl text-blue-500">{alexSteps}</Text>
        </View>

        {/* Progress Bars */}
        <View className="flex-row items-center">
          <View className="mr-4 bg-gray-200 dark:bg-gray-700 p-3 rounded-full">
            <Icon
              source="run-fast"
              size={36}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </View>

          <View className="flex-1">
            <View className="space-y-1 gap-2">
              <ProgressBar
                progress={yourProgress}
                color="#E9509F"
                style={{ height: 8, borderRadius: 4 }}
              />
              <ProgressBar
                progress={alexProgress}
                color="#136CF1"
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
