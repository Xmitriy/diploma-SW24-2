import { Stack } from "expo-router";

export default function TrainingLayout() {
  return (
    <Stack screenOptions={{
      animation: "fade",
      headerShown: false
    }}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="screen1" />
      <Stack.Screen name="screen2" />
      <Stack.Screen name="screen3" />
    </Stack>
  );
}
