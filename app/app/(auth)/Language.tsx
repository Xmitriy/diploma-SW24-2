import { useRouter } from "expo-router";
import { View, TouchableHighlight, Text } from "react-native";
import React, { useState } from "react";
import { ThemeText } from "@/components";
import { useTranslation, setLanguage as setI18nLanguage } from "@/lib/language";
import DropDownPicker from "react-native-dropdown-picker";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Language() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(i18n.language);
  const [items, setItems] = useState([
    { label: "English", value: "en" },
    { label: "Монгол", value: "mn" },
  ]);

  const handleLanguageChange = (newLang: "en" | "mn") => {
    setI18nLanguage(newLang);
    setValue(newLang);
  };

  return (
    <SafeAreaView className="dark:bg-gray-900 bg-white flex-1 items-center px-4 gap-10 justify-between py-8">
      <View className="items-center gap-10">
        <Image
          source={require("@/assets/mascot/BluviSmile.png")}
          style={{ width: 200, height: 200 }}
          cachePolicy={"memory-disk"}
          contentFit={"contain"}
          focusable={false}
        />

        <ThemeText className="text-xl text-center">
          {t("language.asuult")}
        </ThemeText>

        <View className="w-[80%]">
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={(callback) => {
              const selectedValue = callback(value as "en" | "mn");
              handleLanguageChange(selectedValue as "en" | "mn");
            }}
            setItems={setItems}
            placeholder="Please select your language"
          />
        </View>
      </View>
      <View className="justify-end">
        <TouchableHighlight
          onPress={() => {
            router.push("/(auth)/welcome");
          }}
          className="bg-blue1/70 border-2 border-blue1 rounded-full px-10 py-2 items-center"
          activeOpacity={0.9}
          underlayColor={"#DDDDDD"}
        >
          <Text className="text-lg text-black dark:text-white capitalize w-full font-semibold text-center">
            {t("a")}
          </Text>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
}
