import React from "react";
import { View, Modal, Pressable } from "react-native";
import { Icon } from "react-native-paper";
import { ThemeText } from "@/components";
import { useAppTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/language";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

const ImagePickerModal = ({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
}: ImagePickerModalProps) => {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl">
          <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-2" />

          <View className="p-4">
            <Pressable
              className="flex-row items-center gap-4 p-4"
              onPress={onCameraPress}
            >
              <View className="bg-blue-50 dark:bg-gray-700 p-3 rounded-full">
                <Icon
                  source="camera"
                  size={24}
                  color={theme === "dark" ? "#fff" : "#000"}
                />
              </View>
              <ThemeText className="text-lg">
                {t("imagePickerModal.takePhoto")}
              </ThemeText>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-4 p-4"
              onPress={onGalleryPress}
            >
              <View className="bg-blue-50 dark:bg-gray-700 p-3 rounded-full">
                <Icon
                  source="image"
                  size={24}
                  color={theme === "dark" ? "#fff" : "#000"}
                />
              </View>
              <ThemeText className="text-lg">
                {t("imagePickerModal.chooseFromGallery")}
              </ThemeText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ImagePickerModal;
