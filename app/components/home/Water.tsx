import { useTranslation } from "@/lib/language";
import { Pressable, View } from "react-native";
import { ThemeText } from "@/components";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "@/lib/theme";
import { useState } from "react";
import WaterModal from "./WaterModal";
import { Droplets } from "lucide-react-native";
import { useStatsStore } from "@/stores/statsStore";
import WaterAnimation from "./WaterAnimation";

export default function Water() {
  const { theme } = useAppTheme();
  const [componentHeight, setComponentHeight] = useState<number>(0);
  const { t } = useTranslation();

  const { waterGoal } = useStatsStore();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 150 });
  };

  const handlePress = () => {
    setModalVisible(true);
  };

  const pressed = useSharedValue<number>(0);
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
      onLayout={(e) => {
        setComponentHeight(e.nativeEvent.layout.height);
      }}
      className="dark:bg-gray-900 rounded-[26px] flex-[2] relative overflow-hidden dark:border-gray-800 border-[1px] border-gray-200"
      style={[animatedStyle, { flex: 2 }]}
    >
      <WaterModal visible={modalVisible} setVisible={setModalVisible} />
      <Pressable
        className="flex-1 justify-between p-4 relative z-10"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View className="flex-row items-center justify-between  ">
          <ThemeText className="flex-1 font-bold text-lg dark:text-black px-1 ">
            {t("water.word")}
          </ThemeText>
          <View className="w-[20px] h-[25px] ">
            <Droplets size={25} color={theme === "dark" ? "#fff" : "#000"} />
          </View>
        </View>

        {/* Text content */}
        <View className="relative">
          <ThemeText className="text-2xl font-bold">{waterGoal}</ThemeText>
          <ThemeText className="text-sm font-normal">17 oz</ThemeText>
        </View>
      </Pressable>
      <WaterAnimation containerHeight={componentHeight} />
    </Animated.View>
  );
}
