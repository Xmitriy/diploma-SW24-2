import { ThemeText, ThemeView } from "@/components";
import { useTranslation } from "@/lib/language";
import { useRegisterStore } from "@/stores/register";
import { useAppTheme } from "@/lib/theme";
import { Image } from "expo-image";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, Text, TouchableHighlight, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";

export default function LoginOrRegister() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { setField } = useRegisterStore();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const handleRegister = () => {
    router.push("/(auth)/register");
  };
  const handleLogin = () => {
    router.push("/(auth)/login");
  };
  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };
  useFocusEffect(
    useCallback(() => {
      setField("progress", 0);
    }, [setField])
  );
  return (
    <ThemeView className="dark:bg-blue1 flex-1 items-center pb-20 justify-between">
      <View className="h-[60px] w-full justify-center items-start overflow-hidden rounded-full p-4 ">
        <Pressable
          className="rounded-full items-center justify-center overflow-hidden"
          android_ripple={{
            color: theme === "dark" ? "#ffffff20" : "#00000020",
            radius: 25,
          }}
          android_disableSound
          onPress={handleBack}
        >
          <ChevronLeft size={45} color={theme === "dark" ? "#fff" : "#000"} />
        </Pressable>
      </View>

      <View className="w-3/4 relative aspect-square overflow-hidden mx-auto">
        <Image
          source={require("@/assets/mascot/BluviSmile.png")}
          style={{ width: "100%", height: "100%" }}
          cachePolicy={"memory-disk"}
          contentFit={"contain"}
          focusable={false}
        />
      </View>
      <View>
        <ThemeText className="text-3xl mb-[40%] text-center ">
          {t("mascot.desc")}
        </ThemeText>
      </View>
      <View className="w-3/4 mx-auto flex flex-row items-center justify-center gap-4">
        <TouchableHighlight
          onPress={handleLogin}
          className="border-2 border-black dark:bg-white rounded-full px-10 py-2 items-center "
          activeOpacity={0.9}
          underlayColor={"#DDDDDD"}
        >
          <Text className="text-lg text-black font-semibold text-center">
            {t("login.button1")}
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={handleRegister}
          className="bg-blue1/70 border-2 border-blue1 dark:bg-white rounded-full px-10 py-2 items-center"
          activeOpacity={0.9}
          underlayColor={"#DDDDDD"}
        >
          <Text className="text-lg text-black font-semibold text-center">
            {t("login.button2")}
          </Text>
        </TouchableHighlight>
      </View>
    </ThemeView>
  );
}
