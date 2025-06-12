import React from "react";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";

interface StepHeaderProps {
  title: string;
  lottieSource?: any;
  titleSize?: number;
  lottieSize?: number;
}

const StepHeader: React.FC<StepHeaderProps> = ({
  title,
  lottieSource = require("@/assets/icons/gem.json"),
  titleSize = 24,
  lottieSize = 50,
}) => {
  return (
    <View className="flex-row items-center px-6 justify-center relative mb-4">
      <View style={{ width: lottieSize }}>
        <LottieView
          source={lottieSource}
          autoPlay
          loop
          style={{
            width: lottieSize,
            aspectRatio: "1/1",
            borderRadius: 50,
          }}
        />
      </View>
      <View className="flex-1 items-center">
        <Text
          className="font-bold text-center text-gray-500 dark:text-gray-200"
          style={{ fontSize: titleSize }}
        >
          {title}
        </Text>
      </View>
      <View style={{ width: lottieSize }} />
    </View>
  );
};

export default StepHeader;
