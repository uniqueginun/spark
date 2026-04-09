import { Show, useClerk, useUser } from "@clerk/expo";
import { Link, Redirect, RelativePathString } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Page() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user?.completed_on_boarding) {
    return (
      <Redirect href={"(onboarding)/complete-profile" as RelativePathString} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Show when="signed-out">
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
      </Show>
      <Show when="signed-in">
        <Text>Hello {user?.id}</Text>
        <Pressable style={styles.button} onPress={() => signOut()}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </Show>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
