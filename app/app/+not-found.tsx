import { ThemeText, ThemeView } from "@/components";
import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemeView style={styles.container}>
        <ThemeText>This screen does not exist.</ThemeText>
        <Link href="/(tabs)" style={styles.link}>
          <ThemeText>Go to home screen!</ThemeText>
        </Link>
      </ThemeView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
