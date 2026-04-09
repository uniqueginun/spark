import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Icon, NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <NativeTabs
      labelStyle={{
        color: DynamicColorIOS({
          dark: "#e6f1eb",
          light: "#1a2620",
        }),
      }}
      tintColor={DynamicColorIOS({
        dark: "#9fd4b3",
        light: "#2f6f4e",
      })}
    >
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          drawable="custom_home_drawable"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
