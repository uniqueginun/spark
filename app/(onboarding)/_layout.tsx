import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="select-interests"
        options={{ title: "Select Interests" }}
      />
      <Stack.Screen name="set-location" options={{ title: "Set Location" }} />
    </Stack>
  );
}
