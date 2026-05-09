import { syncExpoPushToken } from "@/services/pushNotifications";
import { useAuth } from "@clerk/expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs, useSegments } from "expo-router";
import { useEffect, useMemo } from "react";
import { Platform, View } from "react-native";

const TAB_BAR_HEIGHT = 72;

type TabIconProps = {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  focusedName: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  focused: boolean;
};

function TabIcon({ name, focusedName, color, focused }: TabIconProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 52,
          height: 34,
          borderRadius: 17,
          backgroundColor: focused ? "rgba(159,212,179,0.15)" : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name={focused ? focusedName : name}
          size={28}
          color={color}
        />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

  const hideTabBar = useMemo(() => {
    return segments.includes("chat");
  }, [segments]);

  useEffect(() => {
    syncExpoPushToken(isSignedIn || false);
  }, [isSignedIn]);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#9fd4b3",
        tabBarInactiveTintColor: "#4e535a",
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : "#0d1017",
          borderTopWidth: 0,
          elevation: 0,
          height: TAB_BAR_HEIGHT,
          display: hideTabBar ? "none" : "flex",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          height: TAB_BAR_HEIGHT,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarIconStyle: {
          flex: 1,
          width: "100%",
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint="dark"
              intensity={80}
              style={{
                flex: 1,
                borderTopWidth: 0.5,
                borderTopColor: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: "#0d1017",
                borderTopWidth: 0.5,
                borderTopColor: "rgba(255,255,255,0.07)",
              }}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="home-outline"
              focusedName="home"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="plus-circle-outline"
              focusedName="plus-circle"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="view-list-outline"
              focusedName="view-list"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="account-circle-outline"
              focusedName="account-circle"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
