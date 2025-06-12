import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

const LOTTIE_WIDTH = 130;
const LOTTIE_HEIGHT = 150;

const ShimmerPlaceholder = () => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1
    );
  }, [animationProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const shadeWidth = LOTTIE_WIDTH * 0.6;
    const translateX = interpolate(
      animationProgress.value,
      [0, 1],
      [-shadeWidth, LOTTIE_WIDTH]
    );

    return {
      transform: [{ translateX }, { rotate: "30deg" }],
    };
  });

  return (
    <View
      style={{
        width: LOTTIE_WIDTH,
        height: LOTTIE_HEIGHT,
        overflow: "hidden",
        borderRadius: 20,
      }}
      className="rounded-full bg-white"
    >
      <Animated.View
        style={[
          {
            width: 40,
            height: "100%",
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={["transparent", "#ededed", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>
    </View>
  );
};

export default ShimmerPlaceholder;
