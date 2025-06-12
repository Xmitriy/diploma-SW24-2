import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  useColorScheme,
  ScrollView,
  Image,
} from "react-native";
import moment, { Moment } from "moment";
import { i18n, useTranslation } from "@/lib/language";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemeText } from "@/components";
import QuizLottie from "@/components/home/Quizlottie";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatsData, useStatsStore } from "@/stores/statsStore";
import { Check, Plus } from "lucide-react-native";

const screenWidth = Dimensions.get("window").width;

const Blog = () => {
  const [dates, setDates] = useState<Moment[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const { dailyFoods } = useStatsStore();

  const NUTRIENT_BAR_HEIGHT = 170;
  const {
    calories,
    protein,
    carbs,
    fat,
    // rdc,
    caloriesGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    // rdcGoal,
  } = useStatsStore();

  useEffect(() => {
    const today = moment();
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(today.clone().add(i, "days"));
    }
    setDates(days);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectDate = (date: Moment) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
  };

  const meals = [
    {
      image: require("@/assets/food/breakfast.png"),
      typeIndex: 0,
      cal: "120 / 304 cal",
    },
    {
      image: require("@/assets/food/lunch.png"),
      typeIndex: 1,
      cal: "450 / 700 cal",
    },
    {
      image: require("@/assets/food/dinner.png"),
      typeIndex: 2,
      cal: "500 / 600 cal",
    },
    {
      image: require("@/assets/food/donut.png"),
      typeIndex: 3,
      cal: "220 / 300 cal",
    },
  ];

  return (
    <SafeAreaView>
      <ScrollView className="dark:bg-gray-900 bg-white">
        <View className="items-center px-10 pb-20">
          {/* Header */}
          <View className="flex-row justify-between items-center w-full mb-4">
            <ThemeText className="font-bold text-2xl">{t("stats.title")}</ThemeText>
            <Feather name="bell" size={20} color={isDark ? "#ccc" : "black"} />
          </View>

          {/* Calendar */}
          <View style={styles.container}>
            {dates.map((date) => {
              const isSelected = selectedDate === date.format("YYYY-MM-DD");
              return (
                <TouchableOpacity
                  key={date.format("YYYY-MM-DD")}
                  // onPress={() => handleSelectDate(date)}
                  style={styles.dayContainer}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayText, isDark && { color: "#ccc" }]}>
                    {date.format("dd").charAt(0)}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.selectedDate,
                      isDark && !isSelected && { color: "#fff" },
                    ]}
                  >
                    {date.format("D")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Nutrient Bars */}
          <View className="flex-row gap-7 mt-6">
            {[
              {
                label: "Cal",
                color: "bg-blue-300",
                value: calories,
                goal: caloriesGoal,
              },
              {
                label: "Prot",
                color: "bg-green-200",
                value: protein,
                goal: proteinGoal,
              },
              {
                label: "Carb",
                color: "bg-green-300",
                value: carbs,
                goal: carbsGoal,
              },
              {
                label: "Fats",
                color: "bg-green-300",
                value: fat,
                goal: fatGoal,
              },
              // {
              //   label: "RDC",
              //   color: "bg-orange-200",
              //   value: rdc,
              //   goal: rdcGoal,
              // },
            ].map((item, i) => (
              <View
                className="gap-3 justify-center flex-1 items-center"
                key={i}
              >
                <Text className="justify-center text-center text-gray-500">
                  {item.goal}
                </Text>
                <View
                  className="w-14 border rounded-full border-gray-300 justify-end"
                  style={{ height: NUTRIENT_BAR_HEIGHT }}
                >
                  <View
                    className={`w-15 ${item.color} rounded-full items-center`}
                    style={{
                      height: Math.min(
                        (item.value / item.goal) * NUTRIENT_BAR_HEIGHT,
                        NUTRIENT_BAR_HEIGHT - 2
                      ),
                      minHeight: 45,
                    }}
                  >
                    <View className="top-1 flex bg-white w-[40px] aspect-square rounded-full items-center justify-center">
                      <Text className="text-[10px]">{item.value}</Text>
                    </View>
                  </View>
                </View>
                <Text className="justify-center text-center text-gray-500">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* AI Suggestion Box */}
          <View className="w-full h-[180px] rounded-3xl mt-5 items-center justify-center relative">
            <Image
              source={require("@/assets/img/foodPoster.png")}
              className="w-full h-full rounded-3xl"
              resizeMode="cover"
            />
            <ThemeText
              className={`absolute text-center font-bold text-white ${
                i18n.language === "mn"
                  ? "w-48 left-8 top-12"
                  : "w-36 text-xl top-8 left-10"
              }`}
            >
              {t("quiz.desc")}
            </ThemeText>

            <TouchableOpacity
              onPress={() => router.push("/mnkv")}
              className="absolute w-[100px] items-center rounded-full justify-center overflow-hidden"
              style={{
                bottom: 40,
                left: 35,
                height: 40,
              }}
            >
              <QuizLottie />
              <Text className="text-orange-500 absolute mb-2 font-bold font-quicksand">
                {t("quiz.title")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Meals Section */}
          <ThemeText
            className={`text-2xl font-bold mt-6 w-full px-2 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {t("meal.meal")}
          </ThemeText>

          {meals.map((meal, index) => {
            const mealTypes = t("meal.type", { returnObjects: true }) as {
              name: string;
              desc: string;
            }[];
            return (
              <View
                key={index}
                className="w-full h-28 border relative border-gray-300 rounded-3xl mt-6 flex-row items-center px-4"
              >
                {/* Food image */}
                <View className="w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    source={meal.image}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Text info */}
                <View className="flex-1 ml-4">
                  <Text
                    className={`font-bold text-xl ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {mealTypes[meal.typeIndex]?.name}
                  </Text>
                  <Text className="text-gray-500">{meal.cal}</Text>
                </View>

                {/* Add button */}
                <Pressable
                  onPress={() => router.push("/(meal)/nemeh")}
                  className="w-12 h-12 rounded-full bg-[#CBE4FC]/40 dark:bg-[#CBE4FC]/20 justify-center items-center"
                >
                  <Feather name="plus" size={24} color="#136CF1" />
                </Pressable>
              </View>
            );
          })}

          {dailyFoods && Object.keys(dailyFoods).length > 0 && (
            <DailyRecommendation />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DailyRecommendation = () => {
  const { t } = useTranslation();
  const {
    dailyFoods,
    breakfastEaten,
    lunchEaten,
    dinnerEaten,
    snackEaten,
    setField,
  } = useStatsStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="mt-6 w-full">
      <Text
        className={`text-xl font-bold mb-3 ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        {t("meal.recommendation")}
      </Text>
      {Object.keys(dailyFoods).map((food) => {
        const { food_name, image, calories, protein, carbs, fat } =
          dailyFoods[food];

        const isEaten =
          (food === "breakfast" && breakfastEaten) ||
          (food === "lunch" && lunchEaten) ||
          (food === "dinner" && dinnerEaten) ||
          (food === "snack" && snackEaten);

        const eaten = food + "Eaten";
        return (
          <View
            key={food}
            className={`flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-3 mb-3 items-center`}
          >
            <Image
              source={{ uri: image }}
              className="w-32 h-32 rounded-lg mr-3"
            />
            <View className="flex-1">
              <Text
                className={`text-base font-semibold mb-1 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {food_name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mb-0.5 text-sm">
                {t("meal.calories")}: {calories}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mb-0.5 text-sm">
                {t("meal.protein")}: {protein}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mb-0.5 text-sm">
                {t("meal.carbs")}: {carbs}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {t("meal.fat")}: {fat}
              </Text>
            </View>
            <View className="absolute right-2 bottom-2">
              <Pressable
                onPress={() => {
                  if (!isEaten) {
                    setField(eaten as keyof StatsData, true);
                  } else {
                    setField(eaten as keyof StatsData, false);
                  }
                }}
                android_ripple={{ color: "gray", radius: 10 }}
                className="bg-gray-200 dark:bg-gray-700 rounded-full p-2"
              >
                {isEaten ? (
                  <Check size={20} color={isDark ? "white" : "black"} />
                ) : (
                  <Plus size={20} color={isDark ? "white" : "black"} />
                )}
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Blog;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginTop: 20,
  },
  dayContainer: {
    alignItems: "center",
    width: (screenWidth - 27) / 7,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#000",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 20,
  },
  selectedDate: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontWeight: "bold",
  },
});
