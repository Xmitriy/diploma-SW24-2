import { useAppTheme } from "@/lib/theme";
import React from "react";
import { View } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/auth";

const ThemeUser = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useAppTheme();
  return (
    <View className={`${theme} flex-1`}>
      <PaperProvider theme={theme === "dark" ? MD3DarkTheme : MD3LightTheme}>
        <AuthProvider>{children}</AuthProvider>
      </PaperProvider>
    </View>
  );
};

export default ThemeUser;
