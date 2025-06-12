import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "@/lib/language";
import { useSharedValue, withTiming } from "react-native-reanimated";
import ProgressAnimation from "@/components/meal/ProgressAnimation";

export default function Asuult5() {
  const { t } = useTranslation();
  const router = useRouter();
  const progress = useSharedValue(0);
  const [progressText, setProgressText] = useState("0%");

  useEffect(() => {
    progress.value = withTiming(1, { duration: 6000 });

    const interval = setInterval(() => {
      setProgressText((prevText) => {
        const currentValue = parseInt(prevText);
        if (currentValue < 100) {
          return `${currentValue + 20}%`;
        }
        return "100%";
      });
    }, 1000);

    const timer = setTimeout(() => {
      router.replace("/(tabs)/stats");
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router, progress]);

  return (
    <ProgressAnimation
      title={t("question5.zori")}
      progressText={progressText}
      progress={progress.value}
    />
  );
}
