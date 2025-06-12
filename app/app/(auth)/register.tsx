import { useRegisterStore } from "@/stores/register";
import { View, Platform, Pressable, Text } from "react-native";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "@/lib/language";
import * as RegisterComponents from "@/components/register";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import StepProgressBar from "@/components/register/StepProgressBar";
import PagerView from "react-native-pager-view";

export default function Register() {
  const store = useRegisterStore();
  const { setField } = store;
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const router = useRouter();

  const scrollRef = useRef<PagerView>(null);

  // Pre-define the data array to avoid recreating it on each render
  const steps = useMemo(
    () =>
      Object.values(RegisterComponents).map((component) => ({
        key: component.name,
        component,
      })),
    []
  );

  const maxTabs = steps.length;

  const scrollToTab = (index: number) => {
    if (scrollRef.current && index >= 0 && index < maxTabs) {
      setField("progress", index);
      scrollRef.current.setPage(index);
    }
  };

  const handleNext = () => {
    if (tab === maxTabs - 1) {
      router.push("/(auth)/signup");
      return;
    }
    if (tab < maxTabs) {
      const nextTab = tab + 1;
      scrollToTab(nextTab);
      setTab(nextTab);
    }
  };

  const handleBack = () => {
    if (tab > 0) {
      const prevTab = tab - 1;
      scrollToTab(prevTab);
      setTab(prevTab);
    } else {
      router.back();
    }
  };

  const nextDisabeled = () => {
    if (process.env.NODE_ENV === "development") return false;
    switch (tab) {
      case 0:
        return !Boolean(
          store.height && store.gender && store.weight && store.birthday
        );
      case 1:
        return !Boolean(store.goal);
      case 2:
        return !Boolean(store.activityLevel);
      case 3:
        return !Boolean(store.mealPerDay);
      case 4:
        return !Boolean(store.waterPerDay);
      case 5:
        return !Boolean(store.workSchedule);
      case 6:
        return !Boolean(store.healthCondition);
      default:
        return false;
    }
  };

  return (
    <SafeAreaView className="dark:bg-gray-900 bg-white flex-1">
      <StepProgressBar maxTabs={maxTabs} />

      <View className="flex-1 items-center justify-center overflow-hidden">
        {/* code for web idk why i made this tbh */}
        {Platform.OS === "web" ? (
          <View className="flex-1 overflow-hidden">
            {tab === 0 && <RegisterComponents.Step1 />}
            {tab === 1 && <RegisterComponents.Step2 />}
            {tab === 2 && <RegisterComponents.Step3 />}
            {tab === 3 && <RegisterComponents.Step4 />}
            {tab === 4 && <RegisterComponents.Step5 />}
            {tab === 5 && <RegisterComponents.Step6 />}
            {tab === 6 && <RegisterComponents.Step7 />}
          </View>
        ) : (
          <View className="flex-1 h-full w-full">
            <PagerView
              style={{ flex: 1 }}
              initialPage={0}
              scrollEnabled={false}
              ref={scrollRef}
              onPageSelected={(e) => {
                const newTab = e.nativeEvent.position;
                setTab(newTab);
                setField("progress", newTab);
              }}
            >
              {steps.map((step) => (
                <step.component key={step.key} />
              ))}
            </PagerView>
          </View>
        )}

        <View className="flex-row w-full px-12 justify-between mt-4 mb-4">
          <View className="overflow-hidden rounded-3xl">
            <Pressable
              className={`items-center justify-center rounded-3xl font-medium bg-white text-black`}
              android_ripple={{
                color: "#DDDDDD",
                radius: 50,
              }}
              onPress={handleBack}
            >
              <Text
                className={`text-center text-xl border border-gray-400 rounded-3xl px-5 py-2 text-black`}
              >
                {t("back")}
              </Text>
            </Pressable>
          </View>
          <View className="overflow-hidden rounded-3xl">
            <Pressable
              className={`px-5 py-2 items-center justify-center rounded-3xl font-medium ${
                nextDisabeled() ? "bg-gray-300" : "bg-blue-500"
              }`}
              android_ripple={{
                color: "#DDDDDD20",
                radius: 50,
              }}
              onPress={handleNext}
              disabled={nextDisabeled()}
            >
              <Text
                className={`text-center text-xl ${
                  nextDisabeled() ? "text-gray-400" : "text-white"
                }`}
              >
                {t("next")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
