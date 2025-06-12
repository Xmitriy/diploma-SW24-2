import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppTheme } from "@/lib/theme";
import { Moment } from "moment";

interface CalendarProps {
  dates: Moment[];
  selectedDate: string;
  onSelectDate: (date: Moment) => void;
  weekLabel1: string;
  weekLabel2: string;
  addButtonLabel: string;
}

export default function Calendar({
  dates,
  selectedDate,
  onSelectDate,
  weekLabel1,
  weekLabel2,
  addButtonLabel,
}: CalendarProps) {
  const { theme } = useAppTheme();
  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "#ffffff" : "#000000";

  const renderWeek = (weekDates: Moment[]) => (
    <View style={styles.weekRow}>
      {weekDates.map((date) => {
        const isSelected = selectedDate === date.format("YYYY-MM-DD");
        return (
          <TouchableOpacity
            key={date.format("YYYY-MM-DD")}
            onPress={() => onSelectDate(date)}
            style={[
              styles.dayContainer,
              isSelected && styles.selectedDayContainer,
            ]}
          >
            <Text style={[styles.dayText, isDarkMode && { color: "#aaa" }]}>
              {date.format("dd").charAt(0)}
            </Text>
            <Text
              style={[
                styles.dateText,
                isSelected && styles.selectedDate,
                isDarkMode && !isSelected && { color: "#fff" },
              ]}
            >
              {date.format("D")}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.calendarSection}>
      <Text style={[styles.weekLabel, { color: textColor }]}>{weekLabel1}</Text>
      {renderWeek(dates.slice(0, 7))}

      <Text style={[styles.weekLabel, { color: textColor }]}>{weekLabel2}</Text>
      {renderWeek(dates.slice(7, 14))}

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ {addButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarSection: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  weekLabel: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayContainer: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    width: 40,
  },
  selectedDayContainer: {
    backgroundColor: "#136CF1",
  },
  dayText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedDate: {
    color: "#fff",
  },
  addButton: {
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#136CF1",
    marginTop: -20,
    fontWeight: "500",
  },
});
