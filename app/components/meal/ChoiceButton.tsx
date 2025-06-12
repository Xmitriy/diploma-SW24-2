import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/theme";

interface ChoiceButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function ChoiceButton({
  label,
  isSelected,
  onPress,
}: ChoiceButtonProps) {
  const { theme } = useAppTheme();
  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const borderColor = isDarkMode ? "#444" : "#ccc";
  const selectedBorderColor = isDarkMode ? "#ffffff" : "#2c2c2c";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          borderColor: isSelected ? selectedBorderColor : borderColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      {isSelected && (
        <Text style={[styles.checkmark, { color: selectedBorderColor }]}>
          ✓
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 30,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 20,
  },
});
