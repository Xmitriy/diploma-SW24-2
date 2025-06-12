import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  TouchableOpacity,
  FlatList,
} from "react-native";
import moment, { Moment } from "moment";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "@/lib/language";
import {
  ArrowRight,
  ChevronRight,
  // Dumbbell,
  // DumbbellIcon,
  // Flag,
} from "lucide-react-native";
import { Image } from "expo-image";
import { AuthContext } from "@/context/auth";
import WorkoutListItem from "@/components/WorkoutListItem";
import WorkoutDetailModal from "@/components/WorkoutModal";
import { ScrollView } from "react-native-gesture-handler";

export default function Training() {
  const [dates, setDates] = useState<Moment[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { user, workouts } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);

  useEffect(() => {
    const today = moment();
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(today.clone().add(i, "days"));
    }
    setDates(days);
  }, []);

  const handleSelectDate = (date: Moment) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
  };

  const handleArrow = () => {
    router.push("/home/training/screen1");
  };

  const handleMyWorkouts = () => {
    router.push("/home/training/screen2");
  };

  // const handleCustomWorkout = () => {
  //   router.push("/home/training/screen3");
  // };

  const handleWorkoutPress = (workout: any) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedWorkout(null);
  };

  return (
    <ScrollView className="flex-1 relative bg-white dark:bg-black">
      <View className="p-6 flex-1">
        <Image
          source={require("@/assets/img/lightEffect.jpg")}
          style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}
          contentFit="fill"
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: isDark ? "#00000000" : "#ffffff00" },
          ]}
        />

        {/* Main Content */}
        <View className="flex-1">
          {/* Calendar */}
          <View className="p-2">
            <View className="flex-row justify-between mt-8">
              {dates.map((date) => {
                const isSelected = selectedDate === date.format("YYYY-MM-DD");
                return (
                  <TouchableOpacity
                    key={date.format("YYYY-MM-DD")}
                    onPress={() => handleSelectDate(date)}
                    activeOpacity={0.7}
                    className={`items-center px-3 py-2 rounded-2xl ${
                      isSelected ? " bg-gray-200/40" : "bg-none"
                    }`}
                  >
                    <Text className="text-xs text-slate-300">
                      {date.format("dd").charAt(0)}
                    </Text>
                    <Text className="text-white font-bold text-base">
                      {date.format("D")}
                    </Text>
                    {isSelected && (
                      <View className="flex flex-row mt-1">
                        <View className="w-1 h-1 bg-white rounded-full mx-0.5" />
                        <View className="w-1 h-1 bg-white rounded-full mx-0.5" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-3xl text-start font-semibold mt-4 text-white">
              {t("training.hi")}, {user?.username || "Galbadrakh"}!
            </Text>
            <Text className="text-lg text-start mt-2 text-gray-200 ">
              {t("training.hello")}
            </Text>

            {/* Highlight Workout Block */}
            <View className="w-full bg-blue-200/30 relative rounded-3xl mt-4 p-6">
              <View className="flex-row items-start gap-4">
                <View className="p-2 bg-blue-700 rounded-full items-center">
                  <Text className="text-white text-[11px] font-semibold p-1">
                    {t("training.special")}
                  </Text>
                </View>
                <View className="p-2 px-4 bg-gray-300/40 rounded-full items-center">
                  <Text className="text-white p-1 text-[11px] font-semibold">
                    Gym
                  </Text>
                </View>
              </View>

              <Text className="text-black font-bold text-4xl mt-8">75 min</Text>
              <Text className=" text-base text-black">
                {t("training.nerrr")}
              </Text>

              <View className="flex-row mt-6 gap-2">
                <View className="w-16 h-16 rounded-2xl bg-white" />
                <View className="w-16 h-16 rounded-2xl bg-white" />
                <View className="w-16 h-16 rounded-2xl bg-white" />
                <View className="w-16 h-16 rounded-2xl bg-white" />
                <Pressable
                  className="w-16 h-16 rounded-2xl bg-white items-center justify-center"
                  onPress={handleArrow}
                >
                  <ArrowRight size={32} color="black" />
                </Pressable>
              </View>
            </View>

            {/* Custom Workouts Block */}
            <Pressable
              className="flex-row border rounded-3xl border-gray-400 w-full mt-10 p-4 items-center justify-between gap-4"
              onPress={handleMyWorkouts}
            >
              <View className="flex-row gap-4 items-center">
                <View className="w-16 h-16 bg-gray-200 rounded-3xl justify-center items-center">
                  <Feather name="sliders" size={20} color="black" />
                </View>
                <Text className="font-semibold text-lg text-white">
                  {t("training.custom")}
                </Text>
              </View>
              <ChevronRight size={20} color="white" />
            </Pressable>
          </View>
          {/* Gym Challenge */}

          {workouts && workouts.length > 0 && (
            <View className="mt-6 mb-6">
              <Text className="text-2xl text-white dark:text-black font-bold text-black dark:text-white mb-4">
                Your Daily Workouts
              </Text>
              <FlatList
                data={workouts as any[]}
                renderItem={({ item }) => (
                  <WorkoutListItem
                    item={item}
                    onPress={() => handleWorkoutPress(item)}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          )}
        </View>
      </View>

      {/* Modal for Workout Details */}
      {selectedWorkout && (
        <WorkoutDetailModal
          isVisible={modalVisible}
          onClose={handleCloseModal}
          workout={selectedWorkout}
        />
      )}
    </ScrollView>
  );
}
