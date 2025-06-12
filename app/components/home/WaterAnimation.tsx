import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useStatsStore } from "@/stores/statsStore";

export default function WaterAnimation({
  containerHeight,
}: {
  containerHeight: number;
}) {
  const animateHeight = useSharedValue(0);
  const [imgWidth] = useState(1000);

  const { waterGoal, water } = useStatsStore();

  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);
  const wave4 = useSharedValue(0);

  useEffect(() => {
    animateHeight.value = withTiming(Math.min(water / waterGoal, 1), {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [water, waterGoal, animateHeight]);

  useEffect(() => {
    const config = { duration: 8000, easing: Easing.linear };
    wave1.value = withRepeat(withTiming(1, config), -1, true);
    wave2.value = withRepeat(
      withTiming(1, { ...config, duration: 9000 }),
      -1,
      true
    );
    wave3.value = withRepeat(
      withTiming(1, { ...config, duration: 10000 }),
      -1,
      true
    );
    wave4.value = withRepeat(
      withTiming(1, { ...config, duration: 11000 }),
      -1,
      true
    );
  }, [wave1, wave2, wave3, wave4]);

  const wave1Style = useAnimatedStyle(() => {
    const translateX = interpolate(wave1.value, [0, 1], [0, -imgWidth]);
    const translateY = 30;
    return { transform: [{ translateX }, { translateY }] };
  });

  const wave2Style = useAnimatedStyle(() => {
    const translateX = interpolate(wave2.value, [0, 1], [0, -imgWidth]);
    return { transform: [{ translateX }] };
  });

  const wave3Style = useAnimatedStyle(() => {
    const translateX = interpolate(wave3.value, [0, 1], [-imgWidth + 10, 0]);
    return { transform: [{ translateX }] };
  });

  const wave4Style = useAnimatedStyle(() => {
    const translateX = interpolate(wave4.value, [0, 1], [-imgWidth, 0]);
    return { transform: [{ translateX }] };
  });

  const animatedHeightStyle = useAnimatedStyle(() => {
    const top = interpolate(animateHeight.value, [0, 1], [80, 0]);
    return {
      top: `${top}%`,
    };
  });

  return (
    <View className="absolute bottom-0 right-0 left-0 flex-1">
      <Animated.View
        style={[animatedHeightStyle, { height: containerHeight }]}
        className="flex-1"
      >
        <Animated.View
          style={wave1Style}
          className="absolute top-0 left-0 z-0 flex-1 w-[1500px] h-full opacity-30"
        >
          <Image
            source={require("@/assets/water2/1.svg")}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>

        <Animated.View
          style={wave2Style}
          className="absolute top-0 left-0 z-0 flex-1 w-[1500px] h-full opacity-30"
        >
          <Image
            source={require("@/assets/water2/2.svg")}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>

        <Animated.View
          style={wave3Style}
          className="absolute top-0 left-0 z-0 flex-1 w-[1500px] h-full opacity-30"
        >
          <Image
            source={require("@/assets/water2/3.svg")}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>

        <Animated.View
          style={wave4Style}
          className="absolute top-0 left-0 z-0 flex-1 w-[1500px] h-full opacity-30"
        >
          <Image
            source={require("@/assets/water2/4.svg")}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
