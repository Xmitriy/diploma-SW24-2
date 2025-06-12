import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useAppTheme } from "@/lib/theme";
import { BlurEllipse } from "@/components";
import { useTranslation } from "@/lib/language";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useAppTheme();

  const handlePress = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* 🔙 Буцах товч */}
      <BlurEllipse />
      <View className="flex-row items-center px-4 pt-12">
        <Pressable
          onPress={handlePress}
          className="w-10 h-10 bg-white dark:bg-gray-800 items-center justify-center shadow rounded-md"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </Pressable>
      </View>

      {/* 📩 Гол контент хэсэг */}
      <View className="flex-1 items-center justify-start px-6 mt-16">
        <Text className="text-[3.25rem] font-bold text-black dark:text-white mb-2">
          {t("forget.title")}
        </Text>

        <Text className="text-base text-center text-gray-600 dark:text-gray-300 mb-6 px-2">
          {t("forget.text")}
          
        </Text>

        <TextInput
          placeholder={t("forget.email")}
          className="w-full p-4 border rounded-full text-black dark:text-white bg-white dark:bg-gray-800 border-gray-300 mb-10"
          placeholderTextColor={theme === "dark" ? "#ccc" : "#666"}
        />

        <TouchableOpacity
          className="w-full bg-black dark:bg-white py-4 rounded-full mb-6"
          onPress={() => router.push("/(auth)/otp-verification")}
        >
          <Text className="text-center text-white dark:text-black font-bold">
            {t("forget.button")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔁 Доод хэсэг */}
      <View className="items-center mb-6">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Remember Password?{" "}
          <Text
            onPress={() => router.push("/(auth)/login")}
            className="font-semibold text-blue-600 dark:text-blue-400"
          >
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default ForgotPassword;
