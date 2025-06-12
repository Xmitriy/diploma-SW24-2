import React, { use, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppTheme } from "@/lib/theme";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ThemeView } from "@/components";
import { AuthContext } from "@/context/auth";
import RegisterPromptModal from "@/components/ui/registerPrompt";
import { EyeClosedIcon, EyeIcon } from "lucide-react-native";
import { useTranslation } from "@/lib/language";

const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useAppTheme();
  const {
    login,
    register,
    user,
    loading,
    loginWithGoogle,
    needsRegistration,
    setNeedsRegistration,
  } = use(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const passwordRef = useRef<TextInput>(null);

  const logIn = () => {
    login(username, password);
  };

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  const signUp = () => router.push("/(auth)/signup");

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <ThemeView className="flex-1 relative">
      {needsRegistration.visible && needsRegistration.data && (
        <RegisterPromptModal
          visible={needsRegistration.visible}
          data={needsRegistration.data}
          onConfirm={() => {
            register(needsRegistration.data as unknown as registerFormType);
          }}
          onCancel={() => {
            setNeedsRegistration({ visible: false, data: null });
          }}
        />
      )}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 250,
          zIndex: 0,
        }}
      >
        <Image
          source={require("@/assets/img/gradient.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </View>

      {/* Main login content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 35 : 0}
        className="flex-1 z-10 justify-center items-center pt-24 p-6"
      >
        <View className="w-full h-full">
          <View className="absolute bg-white dark:bg-black opacity-70 -top-9 left-6 right-6 h-10 rounded-t-3xl items-center justify-center z-10" />
          <View className="flex-1 absolute bg-white dark:bg-gray-900 rounded-3xl inset-0 items-center justify-start pt-10 z-20">
            <Image
              source={require("@/assets/img/logoLarge.png")}
              style={{ width: 100, height: 100 }}
            />
            <Text className="text-4xl tracking-wider text-center mb-6 font-semibold dark:text-gray-200 my-3">
              {t("login1.title")}
            </Text>
            <View className="w-5/6 mb-4">
              <View className="mb-4">
                <TextInput
                  placeholder={t("login1.email")}
                  autoCapitalize="none"
                  className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-6 py-5 border border-gray-300"
                  onChangeText={setUsername}
                  style={{ fontSize: 16 }}
                  placeholderTextColor={theme === "dark" ? "#ccc" : "#89888E"}
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              <View className="mb-2 relative border flex-row border-gray-300 rounded-full overflow-hidden">
                <TextInput
                  placeholder={t("login1.password")}
                  secureTextEntry={passwordHidden}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-white dark:bg-gray-800 text-black flex-1 dark:text-white px-6 py-5 items-center justify-center"
                  onChangeText={setPassword}
                  style={{ fontSize: 16 }}
                  placeholderTextColor={theme === "dark" ? "#ccc" : "#89888E"}
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                  ref={passwordRef}
                  onSubmitEditing={logIn}
                />
                <Pressable
                  className="w-[50px] h-full absolute right-0 items-center justify-center"
                  android_ripple={{ color: "#00000020", radius: 25 }}
                  onPress={() => setPasswordHidden(!passwordHidden)}
                >
                  {passwordHidden ? (
                    <EyeIcon
                      size={20}
                      color={theme === "dark" ? "#ccc" : "#89888E"}
                    />
                  ) : (
                    <EyeClosedIcon
                      size={20}
                      color={theme === "dark" ? "#ccc" : "#89888E"}
                    />
                  )}
                </Pressable>
              </View>

              <View className="items-end my-3">
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/ForgotPassword")}
                >
                  <Text className="text-blue-700 text-sm dark:text-gray-200">
                    {t("account.forget")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center mb-4 space-x-4 mt-2">
                <TouchableOpacity
                  onPress={logIn}
                  className="bg-black dark:bg-transparent dark:border-2 border-slate-500 rounded-full w-full py-4 items-center"
                >
                  <Text className="text-white dark:text-slate-200 font-semibold text-lg">
                    {t("account.login")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center w-full items-center gap-2">
                <View className="bg-gray-300 h-[1px] flex-1" />
                <Text className="text-gray-500 my-3">{t("account.or")}</Text>
                <View className="bg-gray-300 h-[1px] flex-1" />
              </View>

              <View className="flex-row justify-center space-x-4 mt-4 gap-8">
                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  className="border border-gray-300 dark:border-gray-600 rounded-2xl px-8 py-3"
                >
                  <Image
                    source={require("@/assets/socialLogo/google.png")}
                    style={{ width: 25, height: 30 }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-2xl px-8 py-3">
                  <Image
                    source={require("@/assets/socialLogo/instagram.png")}
                    style={{ width: 25, height: 30 }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-2xl px-8 py-3">
                  <Image
                    source={require("@/assets/socialLogo/apple.png")}
                    style={{ width: 28, height: 28 }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="dark:text-gray-200">
                {t("login1.dont")}{" "}
              </Text>
              <Text
                className="text-blue-700 dark:text-gray-200 font-semibold dark:underline"
                disabled={loading}
                onPress={signUp}
              >
                {t("login1.signup")}
              </Text>
            </View>
          </View>
        </View>

        {loading && <ActivityIndicator size="large" className="mt-4" />}
      </KeyboardAvoidingView>
    </ThemeView>
  );
};

export default Login;
