import { AuthContext } from "@/context/auth";
import { Stack } from "expo-router";
import { useAppTheme } from "@/lib/theme";
import { use } from "react";
const RootLayout = () => {
  const { user } = use(AuthContext);
  const loggedIn = !!user;
  const { theme } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme === "light" ? "white" : "#111827",
        },
      }}
    >
      <Stack.Protected guard={loggedIn}>
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};

export default RootLayout;
