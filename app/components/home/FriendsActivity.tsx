import React from "react";
import { View, Text, Image } from "react-native";
// import { Footprints } from "lucide-react-native"; // optional, if you're using the shoe icon
import { useTranslation } from "@/lib/language";

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

const friends: Friend[] = [
  {
    id: "1",
    name: "Tengis",
    avatar: "https://via.placeholder.com/40x40.png?text=A",
  },
  {
    id: "2",
    name: "Gerelt-Od",
    avatar: "https://via.placeholder.com/40x40.png?text=J",
  },
];

export default function FriendsActivity() {
  const { t } = useTranslation();
  return (
    <View className="mt-8">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("friendsActivity.title")}
      </Text>
      {friends.map((friend) => (
        <View
          key={friend.id}
          className="flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-full px-4 py-3 mb-3  border border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center space-x-3">
            <Image
              source={{ uri: friend.avatar }}
              className="w-10 h-10 rounded-full"
              resizeMode="cover"
            />
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {friend.name}
            </Text>
          </View>
          <Text className="text-blue-600 text-lg">👟</Text>
        </View>
      ))}
    </View>
  );
}
