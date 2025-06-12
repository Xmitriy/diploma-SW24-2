import { useTranslation } from "@/lib/language";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/theme";
import { ThemeText } from "@/components";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Dumbbell } from "lucide-react-native";

export default function Training() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 150 });
  };

  const handlePress = () => {
    router.push("/home/training");
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
      className="dark:bg-black-900 rounded-[26px] flex-1  overflow-hidden"
      style={animatedStyle}
    >
      {/* Background Gradient */}
      <View className="absolute top-0 w-full left-0 right-0 bottom-0 ">
        <Image
          source={require("@/assets/img/gradient.png")}
          style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
          contentFit="cover"
        />
      </View>
      <Pressable
        className="flex-1 justify-between p-4 px-6"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View className="flex-row items-center justify-between absolute top-4 left-5">
          <ThemeText className="flex-1 font-bold text-lg dark:text-black px-1 ">
            {t("training.workout")}
          </ThemeText>
          <View className="w-[25px] h-[20px] px-1">
            <Dumbbell size={25} color={theme === "dark" ? "white" : "black"} />
          </View>
        </View>
        <View>
          <Text className="text-2xl text-gray-800 dark:text-gray-200 font-semibold mt-16">
            69
          </Text>
          <Text className="text-sm font-normal text-gray-600 dark:text-gray-200">
            {t("training.duration")}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
