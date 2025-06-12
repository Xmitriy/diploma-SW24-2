import React, { use, useEffect, useState } from "react";
import { View, Pressable, Switch, Text } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { ThemeView, ThemeText } from "@/components";
import { Image } from "expo-image";
import { useAppTheme } from "@/lib/theme";
import { useTranslation, setLanguage as setI18nLanguage } from "@/lib/language";
import { Icon } from "react-native-paper";
import { AuthContext } from "@/context/auth";
import { SettingsItem } from "@/components/SettingsItem";

export default function Settings() {
  const { user, logout } = use(AuthContext);
  const { theme, setTheme } = useAppTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [isSwitchOn, setIsSwitchOn] = useState<boolean>(false);

  const toggleLang = () => {
    const newLang = i18n.language === "en" ? "mn" : "en";
    setI18nLanguage(newLang as "en" | "mn");
  };

  const isDark = theme === "dark";
  const toggleSwitch = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsSwitchOn(newTheme === "dark");
    setTheme(newTheme);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    setIsSwitchOn(theme === "dark");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeView className="pt-8 px-10 flex-1">
      <View className="flex-row items-center justify-between w-full">
        <View className="border-2 overflow-hidden border-gray-200 dark:border-gray-700 rounded-full">
          <Pressable
            android_disableSound
            android_ripple={{
              color: "#dddddd",
              radius: 20,
            }}
            className="p-2"
            onPress={handleBack}
          >
            <Icon
              source="chevron-left"
              size={25}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </Pressable>
        </View>
        <ThemeText className="text-2xl text-center font-semibold absolute left-1/2 -translate-x-1/2">
          {t("settings.title")}
        </ThemeText>
        {/* <Pressable
          className="border-2 border-gray-200 dark:border-gray-700 p-2 rounded-full"
          onPress={handleBack}
        >
          <Icon
            source="account-outline"
            size={25}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </Pressable> */}
      </View>

      {/* Account section */}
      {user && (
        <>
          <ThemeText className="text-xl font-semibold mt-8">
            {t("settings.account")}
          </ThemeText>
          <Pressable
            className="flex-row mt-4 items-center justify-between"
            onPress={() => router.push("/(settings)/Edit")}
          >
            <View className="flex-row gap-4 items-center flex-1">
              <Image
                source={
                  user?.image
                    ? { uri: user.image }
                    : require("@/assets/img/profile.png")
                }
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 999,
                }}
              />
              <ThemeText className="text-xl font-semibold">
                {user?.username}
              </ThemeText>
              {/* <ThemeText className="text-lg">Profile</ThemeText> */}
            </View>
            <Icon
              source="chevron-right"
              size={25}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </Pressable>
        </>
      )}

      {/* Settings section */}
      {user && (
        <ThemeText className="text-xl font-semibold mt-8">
          {t("settings.title")}
        </ThemeText>
      )}

      {/* Notifications */}
      <SettingsItem
        icon="bell-outline"
        title={t("settings.notifications")}
        onPress={() => router.push("/(settings)/Notifications")}
      />

      {/* Close Friends */}
      <SettingsItem
        icon="account-group-outline"
        title={t("settings.closeFriends")}
        onPress={() => router.push("/(settings)/CloseFriends")}
      />

      {/* Privacy */}
      <SettingsItem
        icon="lock-outline"
        title={t("settings.Privacy")}
        onPress={() => router.push("/(settings)/Privacy")}
      />

      {/* Language */}
      <SettingsItem
        icon="translate"
        title={t("settings.language")}
        showChevron={false}
        rightElement={
          <Pressable onPress={toggleLang}>
            <View className="flex-row items-center px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <Text className="text-black dark:text-white text-lg">
                {i18n.language === "mn" ? "Монгол" : "English"}
              </Text>
            </View>
          </Pressable>
        }
      />

      {/* Dark Mode Switch */}
      <SettingsItem
        icon="moon-waning-crescent"
        title={t("settings.darkMode")}
        showChevron={false}
        rightElement={
          <Switch
            value={isSwitchOn}
            onValueChange={toggleSwitch}
            trackColor={{ false: "#ccc", true: "#93c5fd" }}
            thumbColor={isDark ? "#1d4ed8" : "#f4f3f4"}
          />
        }
      />

      {/* logout */}
      {user && (
        <SettingsItem
          icon="logout"
          title={t("settings.logout")}
          showChevron={false}
          onPress={() => {
            logout();
            router.replace("/(tabs)");
          }}
        />
      )}
    </ThemeView>
  );
}
