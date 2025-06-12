import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { Pencil, Check, Footprints } from "lucide-react-native";
import { ThemeText, ThemeView } from "@/components";
import FriendsActivity from "./FriendsActivity";
import { useTranslation } from "@/lib/language";
import { useAppTheme } from "@/lib/theme";

interface StepsModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

export default function StepsModal({ visible, setVisible }: StepsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState("9000");
  const todaySteps = "130";
  const { t } = useTranslation();

  const { theme } = useAppTheme();
  const pencilColor = theme === "dark" ? "#d1d5db" : "#4b5563";

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      presentationStyle="pageSheet"
      animationType="slide"
    >
      <ScrollView>
        <ThemeView className="flex-1 pt-6 px-6 ">
          <Text className="text-2xl font-bold text-center mb-6 mt-10 text-gray-900 dark:text-white  ">
            {t("stepsModal.title")}
          </Text>

          <View className="bg-white dark:bg-gray-900 rounded-2xl  border border-gray-200 dark:border-gray-700 flex-row p-6 justify-between items-center mb-6">
            {/* Left side: Today */}
            <View className="absolute top-5 left-8">
              <Footprints size={25} color="#3b82f6" className="mb-1" />
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl text-gray-400 dark:text-gray-400 mb-1 font-quicksand font-bold">
                {t("stepsModal.today")}
              </Text>
              <Text className="text-2xl font-bold text-blue-600">
                {todaySteps}
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px h-12 bg-gray-200 dark:bg-gray-700 mx-4" />

            {/* Right side: Daily Step Goal */}
            <View className="flex-1 items-center justify-center gap-1">
              <Text className="text-xl text-gray-400 dark:text-gray-400  font-quicksand font-bold">
                {t("stepsModal.dailyGoal")}
              </Text>

              {isEditing ? (
                <TextInput
                  value={goal}
                  onChangeText={setGoal}
                  keyboardType="numeric"
                  className="text-xl font-bold text-center border-b border-gray-400 w-20 text-gray-900 dark:text-white"
                  autoFocus
                  onSubmitEditing={handleSave}
                />
              ) : (
                <Text className="text-2xl font-bold text-gray-800 dark:text-white">
                  {goal}
                </Text>
              )}

              <TouchableOpacity
                onPress={isEditing ? handleSave : () => setIsEditing(true)}
                className="absolute top-8 right-0 p-1"
              >
                {isEditing ? (
                  <Check size={20} color="#10b981" />
                ) : (
                  <Pencil size={20} color={pencilColor} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ThemeText className="text-gray-400 text-sm text-center dark:text-gray-400">
            {t("stepsModal.recommendation", { count: 10000 })}
          </ThemeText>

          <View className="p-2">
            <FriendsActivity />
          </View>
        </ThemeView>
      </ScrollView>
    </Modal>
  );
}
