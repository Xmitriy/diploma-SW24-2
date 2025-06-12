import { useEffect } from "react";
import { useRegisterStore } from "@/stores/register";
import { View } from "react-native";
import { useAppTheme } from "@/lib/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

export default function ProgressBar({ maxTabs = 3 }: { maxTabs?: number }) {
  const { progress } = useRegisterStore();
  const { theme } = useAppTheme();
  const maxStep = maxTabs;

  return (
    <View className="flex-row w-full items-center px-6 h-[60px] justify-center">
      <View className="flex-1 h-2 flex-row overflow-hidden gap-2">
        {[...Array(maxStep).keys()].map((step) => {
          return (
            <ProgressBarSegment
              key={step}
              isActive={step === progress}
              theme={theme}
            />
          );
        })}
      </View>
    </View>
  );
}
interface ProgressBarSegmentProps {
  isActive: boolean;
  theme: "light" | "dark";
}

const ProgressBarSegment: React.FC<ProgressBarSegmentProps> = ({
  isActive,
  theme,
}) => {
  const progressState = useSharedValue(0);

  useEffect(() => {
    progressState.value = withTiming(isActive ? 1 : 0, { duration: 300 });
  }, [isActive, progressState]);

  const animatedStyle = useAnimatedStyle(() => {
    const unselectedColor = theme === "light" ? "#E5E7EB" : "#374151";
    const selectedColor = theme === "light" ? "#000000" : "#3B82F6";

    //
    const backgroundColor = interpolateColor(
      progressState.value,
      [0, 1],
      [unselectedColor, selectedColor],
      "RGB",
      {
        gamma: 5,
      }
    );
    return {
      backgroundColor,
    };
  });

  return (
    <Animated.View
      className="flex-1 rounded-full h-full"
      style={animatedStyle}
    />
  );
};
