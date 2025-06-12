import { ThemeText, ThemeView } from "@/components";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useTranslation } from "@/lib/language";
import { ChevronRight } from "lucide-react-native";
import { Button } from "react-native-paper";

type Option = "Gym" | "Home";
const options: Option[] = ["Gym", "Home"];

const timeOptions: Record<Option, string[]> = {
  Gym: ["20min", "30min", "40min", "50min", "60min", "80min"],
  Home: ["7min", "10min", "15min", "25min", "35min", "45min"],
};

const wtypeOptions = ["Cardio", "Strength", "Stretch", "Mobility", "Endurance"];

const muscleOptions = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Back",
  "Core",
] as const;
type MuscleGroup = (typeof muscleOptions)[number];

const subMuscleOptions = [
  "shoulders",
  "biceps",
  "triceps",
  "back",
  "chest",
  "abs",
  "lowerback",
  "glutes",
  "quadriceps",
  "hamstrings",
];

const muscleMap: Record<MuscleGroup, string[]> = {
  "Full Body": subMuscleOptions,
  "Upper Body": subMuscleOptions.slice(0, 7),
  "Lower Body": subMuscleOptions.slice(7),
  Back: ["back", "lowerback"],
  Core: ["abs", "glutes", "hamstrings"],
};
const intensityOptions = ["Basic", "Moderate", "High"];

export default function Screen1() {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<Option>("Gym");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedWType, setSelectedWType] = useState<string>("");
  const [selectedMuscle, setSelectedMuscle] =
    useState<MuscleGroup>("Full Body");
  const [selectedSubMuscle, setSelectedSubMuscle] = useState<string>("");
  const [selectedIntensity, setSelectedIntensity] = useState<string>("");

  return (
    <ThemeView className="flex-1 relative">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ThemeView className="p-8">
          <ThemeText className="text-4xl font-bold">
            {t("training.custom")}
          </ThemeText>

          <ThemeText className="mt-3">{t("training.custom1")}</ThemeText>

          <ThemeText className="text-3xl font-bold mt-8">
            {t("training.location")}
          </ThemeText>
          <View className="flex-row mt-3 gap-2">
            {options.map((option, index) => {
              const isSelected = selectedOption === option;

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedOption(option)}
                  className={`w-32 py-5 rounded-xl items-center ${
                    isSelected ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <ThemeText className="text-3xl font-bold mt-8">
            {t("training.wtype")}
          </ThemeText>
          <View className="flex-row mt-3 gap-2 w-full flex-wrap">
            {wtypeOptions.map((option, index) => {
              const isSelected = selectedWType === option;
              const isDisabled = selectedOption === "Gym" && index !== 0;

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    if (!isDisabled) setSelectedWType(option);
                  }}
                  disabled={isDisabled}
                  className={`w-32 py-5 rounded-xl items-center ${
                    isSelected ? "bg-black" : "bg-gray-300"
                  } ${isDisabled ? "opacity-40" : ""}`}
                >
                  <Text
                    className={`text-base font-bold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <ThemeText className="text-3xl font-bold mt-8">
            {t("training.time")}
          </ThemeText>
          <View className="flex-row mt-3 gap-2 w-full flex-wrap">
            {timeOptions[selectedOption].map((option, index) => {
              const isSelected = selectedTime === option;

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedTime(option)}
                  className={`w-32 py-5 rounded-xl items-center ${
                    isSelected ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <ThemeText className="text-3xl font-bold mt-8">
            {t("training.muscle")}
          </ThemeText>
          <ThemeText className="mt-3 text-gray-600">
            {t("training.muscle1")}
          </ThemeText>
          <View className="flex-row mt-3 gap-2 w-full flex-wrap">
            {muscleOptions.map((option, index) => {
              const isSelected = selectedMuscle === option;

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    setSelectedMuscle(option);
                    setSelectedSubMuscle("");
                  }}
                  className={`w-32 py-5 rounded-xl items-center ${
                    isSelected ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className="px-5 w-full mt-4">
            <View className="flex-row mt-3 gap-10 w-full flex-wrap">
              {subMuscleOptions.map((option, index) => {
                const isEnabled = muscleMap[selectedMuscle].includes(option);
                const isSelected = selectedSubMuscle === option;

                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      if (isEnabled) setSelectedSubMuscle(option);
                    }}
                    disabled={!isEnabled}
                    className={`w-24 h-24 bg-gray-300 rounded-3xl items-center justify-center border ${
                      isSelected ? "border-black" : "border-gray-300"
                    } ${!isEnabled ? "opacity-40" : ""}`}
                  >
                    <Text
                      className={`text-base font-bold ${
                        isSelected ? "text-white" : "text-black"
                      }`}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <ThemeText className="text-3xl font-bold mt-8">
            {t("training.inten")}
          </ThemeText>
          <View className="flex-row mt-3 gap-2 w-full flex-wrap">
            {intensityOptions.map((option, index) => {
              const isSelected = selectedIntensity === option;

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedIntensity(option)}
                  className={`w-32 py-5 rounded-xl items-center ${
                    isSelected ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <ThemeText className="text-xl font-bold mt-8">{t("dasgal.super")}</ThemeText>
          <ThemeText className="text-gray-600 mt-3">
            {t("dasgal.text")}
          </ThemeText>
          <View className="border-y border-gray-200 py-4 mt-5 flex-row items-center justify-between">
            <ThemeText className="text-xl font-bold">{t("dasgal.blah")}</ThemeText>
            <View className="flex-row gap-2 items-center">
              <ThemeText className="text-xl font-bold">0 of 6</ThemeText>
              <ChevronRight size={20} color="black" />
            </View>
          </View>
          <View className="border-y border-gray-200 py-4 flex-row items-center justify-between">
            <ThemeText className="text-xl font-bold">{t("dasgal.equipment")}</ThemeText>
            <View className="flex-row gap-2 items-center">
              <ThemeText className="text-xl font-bold">0 of 42</ThemeText>
              <ChevronRight size={20} color="black" />
            </View>
          </View>
          <View className="border-y border-gray-200 py-4 flex-row items-center justify-between">
            <ThemeText className="text-xl font-bold">
              {t("dasgal.health")}
            </ThemeText>
            <View className="flex-row gap-2 items-center">
              <ThemeText className="text-xl font-bold">0</ThemeText>
              <ChevronRight size={20} color="black" />
            </View>
          </View>
        </ThemeView>
      </ScrollView>
      <View className="absolute bottom-5 left-5 right-5">
        <Button
          mode="contained"
          className="rounded-xl"
          contentStyle={{ paddingVertical: 12, backgroundColor: "black" }}
        >
          {t("dasgal.button")}
        </Button>
      </View>
    </ThemeView>
  );
}
