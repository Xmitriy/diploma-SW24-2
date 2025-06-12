import { use, useEffect, useRef, useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ThemeView, BlurEllipse } from "@/components";
import { useTranslation } from "@/lib/language";
import { useRegisterStore } from "@/stores/register";
import { AuthContext } from "@/context/auth";

const RegisterForm = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const { loading, register, user } = use(AuthContext);
  const store = useRegisterStore();
  const { setField } = store;
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleRegister = () => {
    const { progress, setField, ...rest } = store;
    register({
      ...rest,
    });
  };

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  const handleUsername = (text: string) => {
    setField("username", text);
  };

  const handleEmail = (text: string) => {
    setField("email", text);
  };

  const handlePassword = (text: string) => {
    setField("password", text);
  };

  const gotoLogin = () => router.replace("/(auth)/signup");

  return (
    <ThemeView className="relative">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 35 : 0}
        className="flex-1 bg-white dark:bg-gray-900 relative justify-center items-center pt-24 p-6"
      >
        <BlurEllipse left={-175} top={-400} size={250} />
        <View className="w-full h-full">
          <View className="absolute bg-white dark:bg-black opacity-50 -top-9 left-6 right-6 h-10 rounded-t-3xl items-center justify-center z-10" />
          <View className="flex-1 absolute bg-white dark:bg-gray-900 rounded-3xl inset-0 items-center justify-start pt-10 z-20">
            <Image
              source={require("@/assets/img/logoLarge.png")}
              style={{ width: 100, height: 100 }}
              cachePolicy={"memory-disk"}
              contentFit={"contain"}
              focusable={false}
            />
            <Text className="text-3xl text-center mb-6 font-semibold dark:text-gray-100">
              {t("account.title")}
            </Text>
            <View className="w-5/6 mb-4">
              <View className="mb-4">
                <TextInput
                  placeholder={t("register.username")}
                  autoCapitalize="none"
                  className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-6 py-5 border border-gray-300 dark:border-gray-600 text-lg"
                  onChangeText={handleUsername}
                  placeholderTextColor={"#89888E"}
                  autoFocus={false}
                  autoCorrect={false}
                  autoComplete="off"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>

              <View className="mb-4">
                <TextInput
                  placeholder={t("register.email")}
                  autoCapitalize="none"
                  className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-6 py-5 border border-gray-300 dark:border-gray-600 text-lg"
                  onChangeText={handleEmail}
                  placeholderTextColor={"#89888E"}
                  autoFocus={false}
                  autoCorrect={false}
                  ref={emailRef}
                  autoComplete="off"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              <View className="mb-2 relative border flex-row border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-full overflow-hidden">
                <TextInput
                  placeholder={t("register.password")}
                  secureTextEntry={passwordHidden}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={false}
                  className="bg-white dark:bg-gray-800 text-black flex-1 dark:text-white px-6 py-5 text-lg"
                  onChangeText={handlePassword}
                  placeholderTextColor={"#89888E"}
                  autoComplete="off"
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                  ref={passwordRef}
                  onSubmitEditing={handleRegister}
                />
                <Pressable
                  className="w-[50px] h-full"
                  android_ripple={{
                    color: "#00000020",
                    radius: 25,
                  }}
                  onPress={() => setPasswordHidden(!passwordHidden)}
                >
                  <Image
                    source={require("@/assets/seen.png")}
                    style={{
                      width: 20,
                      height: 20,
                      position: "absolute",
                      right: 16,
                      top: 20,
                    }}
                    contentFit="contain"
                  />
                </Pressable>
              </View>

              {/* Forgot Password */}
              <View className="items-end">
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/ForgotPassword")}
                >
                  <Text className="text-blue-700 my-3 dark:text-gray-300 underline text-sm">
                    {t("account.forget")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center mb-4 space-x-4 mt-2">
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  className="bg-black dark:bg-transparent dark:border-2 border-slate-500 rounded-full w-full py-4 items-center"
                >
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-white dark:text-slate-200 font-semibold text-lg">
                      {t("register.register")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-center w-full items-center gap-2">
                <View className="bg-gray-300 dark:bg-gray-600 h-[1px] flex-1" />
                <Text className="text-gray-500 my-3">{t("account.or")}</Text>
                <View className="bg-gray-300 dark:bg-gray-600 h-[1px] flex-1" />
              </View>
              <View className="flex-row justify-center space-x-4 mt-4 gap-8">
                <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-full px-8 py-3">
                  <Image
                    source={require("@/assets/socialLogo/google.png")}
                    style={{ width: 25, height: 30 }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-full px-8 py-3">
                  <Image
                    source={require("@/assets/socialLogo/instagram.png")}
                    style={{ width: 25, height: 30 }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-full px-8 py-3">
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
                {t("account.already")}{" "}
              </Text>
              <Text
                className="text-blue-700 dark:text-gray-200 font-semibold dark:underline"
                disabled={loading}
                onPress={gotoLogin}
              >
                {t("account.login")}
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemeView>
  );
};

export default RegisterForm;
