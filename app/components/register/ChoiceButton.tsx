import { useAppTheme } from "@/lib/theme";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ChoiceButtonProps {
  choice: string;
  isSelected: boolean;
  onPress: () => void;
  iconColor: string;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  choice,
  isSelected,
  onPress,
  iconColor,
}) => {
  const { theme } = useAppTheme();
  const borderColor = useSharedValue(theme === "dark" ? "#dddddd" : "#d1d5db");

  useEffect(() => {
    borderColor.value = withTiming(
      isSelected ? "#ffffff70" : theme === "dark" ? "#ffffff40" : "#d1d5db",
      {
        duration: 300,
      }
    );
  }, [isSelected, borderColor, theme]);

  // Create an animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: borderColor.value,
    };
  });

  return (
    <Animated.View style={animatedStyle} className="mb-4 border-2 rounded-2xl">
      {isSelected && (
        <View className="absolute -right-2 -top-2 rounded-full dark:text-black bg-black dark:bg-gray-200 p-1 items-center justify-center">
          <Icon source="check" size={16} color={iconColor} />
        </View>
      )}
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: isSelected ? "rgba(0, 0, 0, 0.1)" : "transparent",
        }}
        className="p-5 rounded-xl"
      >
        <Text
          className={`font-semibold text-lg ${
            isSelected
              ? "text-black dark:text-gray-200"
              : "text-slate-500 dark:text-gray-300"
          }`}
        >
          {choice}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default ChoiceButton;
