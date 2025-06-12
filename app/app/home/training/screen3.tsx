import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
const StrengthScoreScreen = () => {
  const [activeTab, setActiveTab] = useState("Upper Body");

  const upperBodyParts = [
    "Shoulders",
    "Triceps",
    "Abs",
    "Chest",
    "Lower Back",
    "Back",
    "Biceps",
  ];

  const lowerBodyParts = ["Quadriceps", "Hamstrings", "Glutes"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.topLeft}>
          <Text style={styles.goalText}>Build Muscle and Gain Strength</Text>
          <Text style={styles.headerText}>Strength Score</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Centered Score Prompt */}
      <View style={styles.centerSection}>
        <Text style={styles.getScoreText}>Get your Strength Score</Text>
        <Text style={styles.instructionText}>Complete 2 Gym workouts</Text>
        <Text style={styles.rangeText}>
          Preliminary Strength Score: 350–650
        </Text>
      </View>

      {/* Coach + Time Filters */}
      <View style={styles.coachSection}>
        <Text style={styles.coachText}>COACH JOHN</Text>
        <Text style={styles.descriptionText}>
          Your Strength Score is a measure of your strength based on your recent
          workouts.
        </Text>
        <View style={styles.timeFilters}>
          <TouchableOpacity style={styles.timeFilterActive}>
            <Text style={styles.timeFilterText}>M</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timeFilter}>
            <Text style={styles.timeFilterText}>6M</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timeFilter}>
            <Text style={styles.timeFilterText}>Y</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body Section */}
      <View style={styles.tabSection}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Upper Body" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Upper Body")}
        >
          <Text style={styles.tabText}>UPPER BODY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Lower Body" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Lower Body")}
        >
          <Text style={styles.tabText}>LOWER BODY</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.bodyScroll}>
        <Text style={styles.sectionHeader}>{activeTab}</Text>
        <Text style={styles.lastWorkout}>LAST WORKOUT TRAINED</Text>
        {(activeTab === "Upper Body" ? upperBodyParts : lowerBodyParts).map(
          (part, index) => (
            <View key={index} style={styles.bodyItem}>
              <View style={styles.bodyIconPlaceholder} />
              <Text style={styles.bodyText}>{part}</Text>
              <Text style={styles.bodyScore}>0</Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  topLeft: {
    flexDirection: "column",
  },
  goalText: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  centerSection: {
    alignItems: "center",
    marginTop: 150,
  },
  getScoreText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  instructionText: {
    fontSize: 16,
    marginTop: 8,
  },
  rangeText: {
    fontSize: 14,
    marginTop: 4,
    color: "gray",
  },
  coachSection: {
    marginTop: 66,
  },
  coachText: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 16,
  },
  timeFilters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  timeFilter: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  timeFilterActive: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#000",
  },
  timeFilterText: {
    fontSize: 16,
    color: "#fff",
  },
  tabSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bodyScroll: {
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  lastWorkout: {
    fontSize: 13,
    color: "gray",
    marginBottom: 20,
  },
  bodyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 5,
    borderBottomColor: "#f0f0f0",
  },
  bodyIconPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginRight: 16,
  },
  bodyText: {
    fontSize: 18,
    flex: 1,
  },
  bodyScore: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default StrengthScoreScreen;
