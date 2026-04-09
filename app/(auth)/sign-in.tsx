import { colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";

export default function SignIn() {
  const { isLoading, signInWithGoogle } = useAuth();

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient
        style={styles.gradient}
        colors={colors.gradient}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <LinearGradient
              style={styles.sparkle}
              colors={[colors.primary, colors.secondary]}
              locations={[0, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Octicons name="sparkle" size={36} color="white" />
            </LinearGradient>
            <Text style={styles.title}>Spark</Text>
            <Text style={styles.subtitle}>
              Find people nearby who want to do the same thing, right now.
            </Text>
          </View>
          <AppButton style={{ marginTop: 50 }} onPress={handleSignInWithGoogle}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <AntDesign name="google" size={24} color="white" />

              <Text style={styles.buttonText}>Continue with Google</Text>
            </View>
          </AppButton>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 40,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "50%",
    paddingBottom: 100,
  },
  titleContainer: {
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  sparkle: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 10,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 24,
    color: colors.gray,
    textAlign: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
