import React, { useState } from "react";
import { FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "@/lib/language";
import QuestionLayout from "@/components/meal/QuestionLayout";
import Question from "@/components/meal/Question";
import ChoiceButton from "@/components/meal/ChoiceButton";
import NavigationButtons from "@/components/meal/NavigationButtons";

export default function Asuult2() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const choices = t("question2.bi", { returnObjects: true }) as string[];

  return (
    <QuestionLayout currentStep={1}>
      <Question title={t("question2.songo")} icon="gem" />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={choices}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 50, paddingTop: 60 }}
        className="w-full"
        renderItem={({ item, index }) => (
          <ChoiceButton
            label={item}
            isSelected={selectedIndex === index}
            onPress={() => setSelectedIndex(index)}
          />
        )}
      />

      <NavigationButtons
        onNext={() => router.push("/(meal)/asuult3")}
        nextLabel={t("question2.daraah")}
        isNextDisabled={selectedIndex === null}
      />
    </QuestionLayout>
  );
}
