import { useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Alert } from "react-native";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/sso-callback"),
      });

      if (!(createdSessionId && setActive)) {
        Alert.alert("Error", "Failed to start SSO flow", [{ text: "OK" }]);
        return;
      }

      await setActive({ session: createdSessionId });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    signInWithGoogle,
  };
};
