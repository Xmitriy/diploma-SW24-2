import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "@/lib/language";
import moment, { Moment } from "moment";
import QuestionLayout from "@/components/meal/QuestionLayout";
import Question from "@/components/meal/Question";
import Calendar from "@/components/meal/Calendar";
import NavigationButtons from "@/components/meal/NavigationButtons";

export default function Asuult4() {
  const { t } = useTranslation();
  const router = useRouter();
  const [dates, setDates] = useState<Moment[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );

  useEffect(() => {
    const today = moment();
    const days = [];
    for (let i = 0; i < 14; i++) {
      days.push(today.clone().add(i, "days"));
    }
    setDates(days);
  }, []);

  const handleSelectDate = (date: Moment) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
  };

  return (
    <QuestionLayout currentStep={3}>
      <Question title={t("question4.chi")} icon="gem" />

      <Calendar
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        weekLabel1={t("question4.ene")}
        weekLabel2={t("question4.dar")}
        addButtonLabel={t("question4.nemeh")}
      />

      <NavigationButtons
        onNext={() => router.push("/(meal)/asuult5")}
        nextLabel={t("question4.daraah")}
        isNextDisabled={!selectedDate}
      />
    </QuestionLayout>
  );
}
