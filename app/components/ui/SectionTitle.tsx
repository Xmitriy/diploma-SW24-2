import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SectionTitleProps {
  title: string;
  colors?: readonly [string, string, ...string[]];
}

export function SectionTitle({ title, colors }: SectionTitleProps) {
  // const gradientColors = ['#4f46e5', 'rgba(79, 70, 229, 0)']; // fade into indigo transparent

  return (
    <View className="relative mb-4">
      <Text className="text-[18px] font-semibold tracking-[-0.5px] font-quicksand ">
        {title}
      </Text>

      {/* Apply LinearGradient with custom colors */}
      <LinearGradient
        colors={["#116CFD", "rgba(79, 70, 229, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          bottom: -4,
          left: 0,
          width: "60%",
          height: 3,
          borderRadius: 3,
        }}
      />
    </View>
  );
}
