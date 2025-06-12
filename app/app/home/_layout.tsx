import { ThemeView } from "@/components";
import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <ThemeView>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="training" />
      </Stack>
    </ThemeView>
  );
}
