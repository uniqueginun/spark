import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
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
      <NativeTabs.Trigger name="(home)">
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          drawable="custom_home_drawable"
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="create">
        <Icon
          sf={{ default: "plus", selected: "plus.circle.fill" }}
          drawable="custom_create_drawable"
        />
        <Label>Create</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <Icon
          sf={{ default: "list.bullet", selected: "list.bullet.circle.fill" }}
          drawable="custom_activity_drawable"
        />
        <Label>Activity</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon
          sf={{ default: "person", selected: "person.fill" }}
          drawable="custom_profile_drawable"
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
