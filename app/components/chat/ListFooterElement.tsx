import { View, Text } from "react-native";
import React from "react";

export default function ListFooterElement() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-gray-500 dark:text-gray-400">
        Our Fitness AI is here to help you!
      </Text>
    </View>
  );
}
