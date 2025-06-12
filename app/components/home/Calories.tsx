import { useTranslation } from "@/lib/language";
import { View, Text, Pressable } from "react-native";
import { useAppTheme } from "@/lib/theme";
import { ThemeText } from "@/components";
import { useState } from "react";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Zap } from "lucide-react-native";
import CaloriesModal from "./CaloriesModal";
export default function Calories() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 150 });
  };

  const handlePress = () => {
    // setModalVisible(true);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const blurRadius = interpolate(pressed.value, [0, 1], [2, 5]);
    const color = interpolateColor(
      pressed.value,
      [0, 1],
      theme === "dark" ? ["#ffffff60", "#ffffff00"] : ["#00000040", "#00000030"]
    );
    const boxShadow = `0px 0px ${blurRadius} 0px ${color}`;
    return {
      boxShadow,
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, 0.99]),
        },
      ],
    };
  });

  return (
    <Animated.View
      className="dark:bg-gray-900 rounded-[26px] flex-1  bg-white"
      style={animatedStyle}
    >
      <CaloriesModal visible={modalVisible} setVisible={setModalVisible} />
      <Pressable
        className="flex-1 justify-between p-4 px-6 "
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View className="flex-row items-center justify-between">
          <ThemeText className="flex-1 font-bold text-lg  ">
            {t("calories.calorie")}
          </ThemeText>
          <View className="w-[25px] h-[25px] px-2">
            <Zap color={theme === "dark" ? "#ffffff" : "#000000"} size={25} />
          </View>
        </View>

        <View>
          <Text className="text-2xl text-gray-700 dark:text-gray-200 font-semibold">
            12
          </Text>
          <Text className="text-sm font-normal text-slate-400">
            {t("calories.kcal")}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
