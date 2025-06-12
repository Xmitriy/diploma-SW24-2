import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/theme";
import LottieView from "lottie-react-native";
import Reanimated, {
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";

interface ProgressAnimationProps {
  title: string;
  progressText: string;
  progress: number;
}

export default function ProgressAnimation({
  title,
  progressText,
  progress,
}: ProgressAnimationProps) {
  const { theme } = useAppTheme();
  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const backgroundColor = isDarkMode ? "bg-[#1e1e1e]" : "bg-white";

  const progressInterpolate = useDerivedValue(() => {
    return interpolate(progress, [0, 1], [0, 100]);
  });

  return (
    <View
      className={`flex-1 justify-end items-center px-5 pb-40 ${backgroundColor}`}
    >
      <View className="absolute top-10 left-0 right-0 items-center mt-10">
        <LottieView
          source={require("@/assets/mascot/bluvifood.json")}
          loop
          autoPlay
          style={styles.animation}
        />
      </View>

      <View className="items-center mb-8">
        <Text className={`text-lg font-bold text-center ${textColor}`}>
          {title}
        </Text>
      </View>

      <View className="w-full items-center">
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <Reanimated.View
            style={{
              width: progressInterpolate.value,
            }}
            className="h-full bg-blue-600 rounded-full"
          />
        </View>

        <Text className={`text-base mt-2 ${textColor}`}>{progressText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 400,
    height: 420,
  },
});
