import { BarChart, Book, Home, User } from "lucide-react-native";
import { useAppTheme } from "@/lib/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, View, Platform } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

enum labelValues {
  home = "home",
  profile = "profile",
  blogs = "blogs",
  stats = "stats",
}

type TabButtonProps = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  label: labelValues;
  btnWidth: number;
};

type IconProps = {
  color: string;
  label: labelValues;
};

const icons = (props: IconProps) => {
  switch (props.label) {
    case "home":
      return <Home {...props} />;
    case "profile":
      return <User {...props} />;
    case "blogs":
      return <Book {...props} />;
    case "stats":
      return <BarChart {...props} />;
    default:
      return null;
  }
};

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  label,
}: TabButtonProps) => {
  const scale = useSharedValue(0);
  const { theme } = useAppTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 120,
      mass: 0.5,
    });
  }, [scale, isFocused]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [0, 1]);
    return {
      opacity,
      width: interpolate(scale.value, [0, 1], [0, 45]),
    };
  });
  const inimatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    return {
      transform: [{ scale: scaleValue }],
    };
  });

  const buttonStyle = {
    width: 60,
    marginHorizontal: isFocused ? 10 : 5,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center relative z-10 h-[50px] flex-row gap-1 pl-4"
      style={buttonStyle}
    >
      <Animated.View style={inimatedIconStyle}>
        {icons({ color: isFocused ? "#fff" : "gray", label })}
      </Animated.View>
      <Animated.Text
        style={[
          animatedTextStyle,
          {
            textTransform: "capitalize",
            color: isFocused ? "#fff" : isDark ? "#fff" : "#000",
          },
        ]}
        className="font-semibold"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ width: 100, height: 30 });
  const btnWidth = dimensions.width / state.routes.length;
  const { theme } = useAppTheme();
  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setDimensions(e.nativeEvent.layout);
  };

  const tabPosition = useSharedValue(10);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tabPosition.value,
        },
      ],
    };
  });
  const barMargin =
    Platform.OS === "android"
      ? "mb-10"
      : Platform.OS === "ios"
      ? "mb-10"
      : "mb-0";

  useEffect(() => {
    const newPosition = Math.max(
      Math.min(state.index * btnWidth, dimensions.width - btnWidth - 10),
      10
    );

    tabPosition.value = withSpring(newPosition, {
      damping: 15,
      stiffness: 150,
      mass: 0.5,
    });
  }, [state.index, btnWidth, dimensions.width, tabPosition]);

  return (
    <View
      className={`flex-row absolute bottom-[10px] left-0 right-0 items-center h-[60px] justify-between mx-12 px-3 bg-white dark:bg-slate-950 rounded-full ${barMargin}`}
      style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
      key={state.key}
      onLayout={onTabBarLayout}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: btnWidth + 10,
            height: dimensions.height - 12,
            backgroundColor: theme === "dark" ? "#4C91F9" : "#4C91F9",
          },
        ]}
        className="z-10 rounded-full -ml-[5px] absolute"
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          console.log("long press");
          Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press);
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        return (
          <TabBarButton
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            btnWidth={btnWidth}
            label={
              (label?.toString().toLowerCase() as labelValues) ||
              (route.name.toLowerCase() as labelValues)
            }
          />
        );
      })}
    </View>
  );
}
