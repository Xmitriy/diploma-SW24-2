import { View, Text } from "react-native";
import React from "react";
import { Image } from "expo-image";

type propTypes = {
  text: string;
};

export default function Dialogue({ text }: propTypes) {
  return (
    <View
      className="flex flex-row items-center justify-between w-full px-6 py-4"
      key={"mascotReading"}
    >
      <View className="w-[30%] relative aspect-square overflow-hidden mx-auto">
        <Image
          source={require("@/assets/mascot/logo.png")}
          style={{ width: "100%", height: "100%" }}
          cachePolicy={"memory-disk"}
          contentFit={"contain"}
          focusable={false}
        />
      </View>
      <View className="w-[70%] self-start bg-white rounded-xl p-2 items-start shadow-lg">
        <Text className="text-black text-xl">{text}</Text>
      </View>
    </View>
  );
}
