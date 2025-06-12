import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, use, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { ThemeView, ThemeText, Avatar } from "@/components";
import { useAppTheme } from "@/lib/theme";
import { Icon } from "react-native-paper";
import { AuthContext } from "@/context/auth";
import * as ImagePicker from "expo-image-picker";
import ImagePickerModal from "@/components/ui/ImagePickerModal";
import { Camera } from "expo-camera";

export default function Edit() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { user, isUpdating, update } = use(AuthContext);

  const [name, setName] = useState(user?.username || "");
  const [image, setImage] = useState<string | null>(user?.image || null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(true);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    if ((name === "" || name === user?.username) && image === user?.image) {
      setSaveDisabled(true);
    } else {
      setSaveDisabled(false);
    }
  }, [image, name, user]);

  const handleSave = async () => {
    console.log("saving");
    const updatedData: Record<string, any> = {};

    if (image !== user?.image) {
      updatedData.image = image;
    }

    if (name !== user?.username) {
      updatedData.username = name;
    }

    if (Object.keys(updatedData).length > 0) {
      const success: boolean = await update(updatedData);
      if (success) {
        router.replace("/(tabs)/(profile)/profile");
      }
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const handleCameraPress = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setShowImagePicker(false);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleGalleryPress = async () => {
    setShowImagePicker(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const isDisabled = saveDisabled || isUpdating;

  return (
    <ThemeView className="pt-4 px-8 flex-1 justify-between">
      <View>
        {/* Header */}
        <View className="flex-row items-center justify-between w-full">
          <View className="border-2 border-gray-200 dark:border-gray-700 rounded-full">
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
          <ThemeText className="text-2xl text-center font-semibold">
            Edit
          </ThemeText>
          <Pressable
            className="border-2 border-gray-200 dark:border-gray-700 p-2 rounded-full"
            onPress={handleBack}
          >
            <Icon
              source="cog-outline"
              size={25}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </Pressable>
        </View>
        {/* Profile image */}
        <Text className="mt-8 text-lg text-gray-400 dark:text-gray-400">
          Profile picture
        </Text>
        <View className="flex-row justify-center relative mt-4">
          <Pressable
            className="relative p-2"
            onPress={() => setShowImagePicker(true)}
          >
            <Avatar size={120} image={image} />
            <View className="border-2 border-white bg-black p-2 rounded-full absolute z-10 right-0 bottom-0">
              <Icon source="pencil" size={20} color="white" />
            </View>
          </Pressable>
        </View>

        {/* Name */}
        <Text className="mt-8 text-lg text-gray-400 dark:text-gray-400">
          Username
        </Text>
        <TextInput
          className="border border-gray-300 dark:border-gray-600 px-8 py-4 rounded-full text-black dark:text-white mt-4"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          style={{ fontSize: 18 }}
          aria-disabled={isDisabled}
        />
      </View>

      {/* Save button */}
      <Pressable
        onPress={handleSave}
        disabled={isDisabled}
        className={`bg-blue-500 py-4 rounded-full mb-20 ${
          isDisabled && "bg-blue-900"
        }`}
      >
        {isUpdating ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white text-center text-xl font-semibold">
            Save
          </Text>
        )}
      </Pressable>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />
    </ThemeView>
  );
}
