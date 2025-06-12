import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/theme";
import LottieView from "lottie-react-native";

interface QuestionProps {
  title: string;
  icon?: string;
}

export default function Question({ title, icon }: QuestionProps) {
  const { theme } = useAppTheme();
  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {icon && (
          <LottieView
            source={require("@/assets/icons/gem.json")}
            autoPlay
            loop
            style={styles.icon}
          />
        )}
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 1,
  },
  icon: {
    width: 35,
    height: 35,
    marginRight: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    flexShrink: 1,
  },
});
