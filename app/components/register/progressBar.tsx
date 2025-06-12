import { useRegisterStore } from "@/stores/register";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Button, Icon } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function ProgressBar() {
  const { progress } = useRegisterStore();
  const router = useRouter();
  const navigaton = useNavigation();
  const maxStep = 8;
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(Math.min(progress / maxStep, 1), {
      duration: 500,
      easing: Easing.inOut(Easing.quad),
    });
  }, [progress, progressValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const handleBack = () => {
    if (navigaton.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  return (
    <View className="flex-row w-full items-center px-4 h-[60px]">
      <Button
        className="top-0 left-0"
        mode="text"
        textColor="white"
        rippleColor={"#FFf00020"}
        onPress={handleBack}
      >
        <Icon source="chevron-left" size={24} color="white" />
      </Button>
      <View className="flex-1 h-6 bg-white/80 rounded-full p-0.5 overflow-hidden relative">
        <View className="flex-1">
          <Animated.View
            style={[
              animatedStyle,
              {
                backgroundColor: "#3b82f6",
                borderRadius: 999,
                position: "absolute",
                inset: 0,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}
