import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { X } from "lucide-react-native";
import { useTranslation } from "@/lib/language";

interface WorkoutDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  workout: IExercise | null;
}

const {
  width: screenWidth,
  //  height: screenHeight
} = Dimensions.get("window");

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  isVisible,
  onClose,
  workout,
}) => {
  const { t } = useTranslation();
  if (!workout) return null;

  const videoHeight = screenWidth * (9 / 16);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // This is important for Android back button handling
    >
      <View className="flex-1 justify-end items-center bg-black/60">
        <View className="w-full max-h-[85vh] bg-neutral-100 dark:bg-neutral-800 border-t-2 border-neutral-200 dark:border-neutral-700 rounded-t-2xl p-5 pt-10 shadow-xl">
          <Pressable
            className="absolute top-4 right-4 p-2 z-10"
            onPress={onClose} // Ensure this onPress calls the passed onClose prop
          >
            <X size={28} className="text-neutral-700 dark:text-neutral-300" />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-5"
          >
            <Text className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 text-center">
              {workout.name}
            </Text>

            {workout.video && (
              <View
                className="w-full mb-5 rounded-lg overflow-hidden bg-black"
                style={{ height: videoHeight }} // Dynamic height might still need style prop
              >
                <WebView
                  className="flex-1"
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  source={{ uri: workout.video }}
                  allowsFullscreenVideo
                />
              </View>
            )}

            <View className="mb-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <Text className="text-base text-neutral-500 dark:text-neutral-400 font-semibold">
                {t("workoutModal.category")}
              </Text>
              <Text className="text-base text-neutral-800 dark:text-white mt-1">
                {workout.category}
              </Text>
            </View>

            <View className="mb-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <Text className="text-base text-neutral-500 dark:text-neutral-400 font-semibold">
                {t("workoutModal.level")}
              </Text>
              <Text className="text-base text-neutral-800 dark:text-white mt-1">
                {workout.level}
              </Text>
            </View>

            <View className="mb-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <Text className="text-base text-neutral-500 dark:text-neutral-400 font-semibold">
                {t("workoutModal.duration")}
              </Text>
              <Text className="text-base text-neutral-800 dark:text-white mt-1">
                {workout.duration_minutes} minutes
              </Text>
            </View>

            {workout.repetitions && (
              <View className="mb-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
                <Text className="text-base text-neutral-500 dark:text-neutral-400 font-semibold">
                  {t("workoutModal.repetitions")}
                </Text>
                <Text className="text-base text-neutral-800 dark:text-white mt-1">
                  {workout.repetitions}
                </Text>
              </View>
            )}

            {workout.sets && (
              <View className="mb-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
                <Text className="text-base text-neutral-500 dark:text-neutral-400 font-semibold">
                  {t("workoutModal.sets")}
                </Text>
                <Text className="text-base text-neutral-800 dark:text-white mt-1">
                  {workout.sets}
                </Text>
              </View>
            )}

            <View className="mb-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <Text className="text-base text-neutral-500 dark:text-neutral-400 font-semibold">
                {t("workoutModal.equipment")}
              </Text>
              <Text className="text-base text-neutral-800 dark:text-white mt-1">
                {workout.equipment || t("workoutModal.none")}
              </Text>
            </View>

            <Text className="text-lg font-bold text-neutral-900 dark:text-white mt-4 mb-2">
              {t("workoutModal.description")}
            </Text>
            <Text className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {workout.description}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default WorkoutDetailModal;
