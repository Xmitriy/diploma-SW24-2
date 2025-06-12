import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useAppTheme } from "@/lib/theme";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

const Header = ({ title, showBackButton = true }: HeaderProps) => {
  const navigation = useNavigation();
  const { theme } = useAppTheme();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const iconColor = theme === "dark" ? "#FFFFFF" : "#000000";

  return (
    <View
      className="
        flex-row 
        items-center 
        justify-between 
        h-[60px] 
        px-4 
        border-b 
        border-slate-200 
        bg-white 
        dark:bg-[#1A202C]
      "
    >
      {showBackButton ? (
        <Pressable onPress={handleBackPress} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </Pressable>
      ) : (
        <View className="w-6 -ml-2" />
      )}

      <Text
        className="
          flex-1 
          text-center 
          text-xl 
          font-bold 
          text-black 
          dark:text-white
        "
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      <View className="w-6 p-2 -mr-2" />
    </View>
  );
};

export default Header;
