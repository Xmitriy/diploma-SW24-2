import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { BlurEllipse } from "@/components";

const VerificationSuccess = () => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black px-6 pt-15">
      <BlurEllipse />
      <Image
        source={require("@/assets/img/verified-badge.png")}
        style={{ width: 100, height: 100 }}
        contentFit="contain"
      />

      <Text className="text-2xl font-bold text-black dark:text-white mt-6">
        You are Verified!
      </Text>

      <Text className="text-base text-gray-500 dark:text-gray-300 mt-2 mb-6 text-center">
        Congratulations to you. You are now Verified! Kindly proceed to log in
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/(auth)/login")}
        className="bg-blue-600 w-full py-4 rounded-md items-center"
      >
        <Text className="text-white font-bold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerificationSuccess;
