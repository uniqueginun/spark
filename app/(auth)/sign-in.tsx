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
        <View style={styles.orbTop} />
        <View style={styles.orbBottom} />
        <View style={styles.content}>
          <View style={styles.hero}>
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
          </View>
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaHint}>Get started in seconds</Text>
            <AppButton style={styles.button} onPress={handleSignInWithGoogle}>
              <View style={styles.buttonContent}>
                <AntDesign name="google" size={22} color="white" />

                <Text style={styles.buttonText}>Continue with Google</Text>
              </View>
            </AppButton>
          </View>
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
    paddingHorizontal: 24,
  },
  orbTop: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  orbBottom: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 120,
    paddingBottom: 56,
  },
  hero: {
    width: "100%",
    alignItems: "center",
  },
  titleContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    gap: 16,
  },
  sparkle: {
    width: 78,
    height: 78,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: 0.4,
    fontWeight: "800",
    color: "white",
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
  },
  ctaContainer: {
    width: "100%",
    gap: 14,
  },
  ctaHint: {
    fontSize: 14,
    textAlign: "center",
    color: "rgba(255,255,255,0.78)",
  },
  button: {
    height: 56,
    borderRadius: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonContent: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "white",
  },
});
