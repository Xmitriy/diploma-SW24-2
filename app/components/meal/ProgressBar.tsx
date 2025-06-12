import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/theme";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const { theme } = useAppTheme();
  const isDarkMode = theme === "dark";

  return (
    <View style={styles.progressBar}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressStep,
            {
              backgroundColor:
                i === currentStep
                  ? isDarkMode
                    ? "#ffffff"
                    : "#2c2c2c"
                  : isDarkMode
                  ? "#2c2c2c"
                  : "#D1D5DB",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 60,
    width: "100%",
  },
  progressStep: {
    width: 46,
    height: 8,
    borderRadius: 8,
  },
});
