import apiClient from "@/api/client";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("chat", {
      name: "Chat",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "Expo projectId not found. Run eas init or add EAS project config.",
    );
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token.data;
}

export async function syncExpoPushToken(enabled: boolean) {
  if (!enabled) {
    return;
  }

  const token = await registerForPushNotificationsAsync();

  if (!token) return null;

  await apiClient.post("/user/expo-push-token", {
    token,
    platform: Platform.OS,
  });

  return token;
}
