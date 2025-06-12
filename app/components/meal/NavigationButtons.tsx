import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/theme";
import { useRouter } from "expo-router";

interface NavigationButtonsProps {
  onNext: () => void;
  nextLabel: string;
  isNextDisabled: boolean;
}

export default function NavigationButtons({
  onNext,
  nextLabel,
  isNextDisabled,
}: NavigationButtonsProps) {
  const { theme } = useAppTheme();
  const router = useRouter();
  const isDarkMode = theme === "dark";
  const backButtonColor = isDarkMode ? "#FFFFFF" : "#000000";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            backgroundColor: isDarkMode ? "transparent" : "#FFFFFF",
          },
        ]}
      >
        <Text style={[styles.backButtonText, { color: backButtonColor }]}>
          {"<"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNext}
        disabled={isNextDisabled}
        style={[
          styles.nextButton,
          {
            backgroundColor: isNextDisabled ? "#ccc" : "#136CF1",
          },
        ]}
      >
        <Text style={styles.nextButtonText}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 40,
    width: 340,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  backButtonText: {
    fontWeight: "bold",
    fontSize: 28,
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 10,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
