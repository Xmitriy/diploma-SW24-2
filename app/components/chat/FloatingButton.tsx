import { Pressable, useWindowDimensions, StyleSheet } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const BUTTON_SIZE = 50;
const PADDING = 5;

export default function FloatingButton() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Calculate safe area insets or tab bar height if necessary.
  // For this example, PADDING * 5 at the bottom is a simple placeholder.
  // A more robust solution would use `useSafeAreaInsets` from `react-native-safe-area-context`.
  const SAFE_BOTTOM_OFFSET = PADDING * 3.5; // Approximate space for tab bar or bottom navigation

  const translateX = useSharedValue(screenWidth - BUTTON_SIZE - PADDING);
  const translateY = useSharedValue(
    screenHeight - BUTTON_SIZE - SAFE_BOTTOM_OFFSET - PADDING - 150
  );

  // Shared values to store the starting position of the gesture
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Store the current position when the gesture starts
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // event.translationX/Y are the deltas from the gesture's start point
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      const MAX_X = screenWidth - BUTTON_SIZE - PADDING;
      const MIN_X = PADDING;
      // Adjust MAX_Y to account for top safe area/header if needed
      const MAX_Y = screenHeight - BUTTON_SIZE - SAFE_BOTTOM_OFFSET;
      const MIN_Y = PADDING; // Could be `safeAreaInsets.top + PADDING`

      let targetX = translateX.value;
      let targetY = translateY.value;

      // Snap to horizontal edges
      if (translateX.value < screenWidth / 2 - BUTTON_SIZE / 2) {
        targetX = MIN_X; // Snap to left
      } else {
        targetX = MAX_X; // Snap to right
      }

      // Clamp vertical position
      if (translateY.value > MAX_Y) {
        targetY = MAX_Y;
      } else if (translateY.value < MIN_Y) {
        targetY = MIN_Y;
      }

      translateX.value = withSpring(targetX, { damping: 15, stiffness: 120 });
      translateY.value = withSpring(targetY, { damping: 15, stiffness: 120 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const handlePress = () => {
    router.push("/chatbot");
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[animatedStyle, styles.shadow]}
        className={`
    absolute z-50 aspect-square w-[${BUTTON_SIZE}px] bg-white elevation-md rounded-full overflow-hidden`}
      >
        <LinearGradient
          colors={["#8A24FF", "#BB80FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0 rounded-full p-3"
        >
          <Pressable
            onPress={() => runOnJS(handlePress)()}
            className="w-full h-full rounded-full overflow-hidden"
            android_ripple={{
              color: "rgba(255,255,255,0.3)",
              radius: BUTTON_SIZE / 2,
              borderless: true,
            }}
          >
            <Image
              source={require("@/assets/icons/Chat.svg")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
