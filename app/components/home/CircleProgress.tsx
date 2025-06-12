import React, { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircleProgressProps {
  progress: number; // 0 - 1
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  progress,
  size = 128,
  strokeWidth = 8,
  strokeColor = "#3b82f6",
  backgroundColor = "#e5e7eb",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 800 });
  }, [progress, progressValue]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progressValue.value),
    };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background Circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress Circle */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        strokeLinecap="round"
        origin={`${size / 2},${size / 2}`}
        rotation={-90}
      />
    </Svg>
  );
};

export default CircleProgress;
