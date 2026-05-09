import { attachAuthInterceptor } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { useEffect } from "react";
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function AppWithAuth() {
  const { getAuthToken } = useAuth();

  useEffect(() => {
    attachAuthInterceptor(getAuthToken);
  }, [getAuthToken]);

  useNotificationNavigation();

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppWithAuth />
    </ClerkProvider>
  );
}
