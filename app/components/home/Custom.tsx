import { View, Text, Modal, ScrollView } from "react-native";
import { ThemeView } from "@/components";
import { useTranslation } from "@/lib/language";

function CustomWorkout({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      presentationStyle="pageSheet"
      animationType="slide"
    >
      <ScrollView>
        <ThemeView className="flex-1 items-center pt-12 px-8 bg-white">
          <View className="w-full h-60 overflow-hidden rounded-[40px] bg-white dark:bg-gray-900 justify-center items-start">
            <Text className="">{t("custom.hello")}</Text>
          </View>
        </ThemeView>
      </ScrollView>
    </Modal>
  );
}

export default CustomWorkout;
