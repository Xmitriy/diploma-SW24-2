import React from "react";
import { Text, Pressable, View } from "react-native";

interface WorkoutListItemProps {
  item: any;
  onPress: () => void;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({ item, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className="bg-neutral-700 dark:bg-neutral-800 rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow-md"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-white dark:text-gray-100 mb-1">
          {item.name}
        </Text>
        <Text className="text-sm text-neutral-400 dark:text-neutral-300">
          {item.category}
        </Text>
      </View>
      <View className="bg-neutral-600 dark:bg-neutral-700 rounded-lg px-3 py-1.5">
        <Text className="text-sm text-white dark:text-gray-200 font-semibold">
          {item.duration_minutes} min
        </Text>
      </View>
    </Pressable>
  );
};

export default WorkoutListItem;
