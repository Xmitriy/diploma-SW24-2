import { useTranslation } from "@/lib/language";
import { useRegisterStore } from "@/stores/register";
import { useAppTheme } from "@/lib/theme";
import { useState } from "react";
import { Text, View } from "react-native";
import StepHeader from "./StepHeader";
import ChoiceButton from "./ChoiceButton";

export default function Step4() {
  const { setField } = useRegisterStore();
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const choices = t("register.steps.meals.choices", {
    returnObjects: true,
  }) as string[];
  const mealsTitle = t("register.steps.meals.title");
  const mealsDesc = t("register.steps.meals.desc");

  const { theme } = useAppTheme();
  const iconColor = theme === "dark" ? "black" : "white";
  const handlePress = (index: number) => {
    setSelectedIndex(index);
    setField("mealPerDay", choices[index]);
  };

  return (
    <View className="flex-1 mt-28 items-center">
      <View className="flex items-center">
        <StepHeader title={mealsTitle} />
        <Text className="text-gray-300 text-lg w-[300px] font-semibold dark:text-gray-500 text-center mt-4">
          {mealsDesc}
        </Text>
      </View>
      <View className="space-y-4 my-4 w-full px-14">
        {choices.map((choice, i) => (
          <ChoiceButton
            key={i}
            choice={choice}
            isSelected={selectedIndex === i}
            onPress={() => handlePress(i)}
            iconColor={iconColor}
          />
        ))}
      </View>
    </View>
  );
}
