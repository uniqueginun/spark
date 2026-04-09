import { colors } from "@/constants/colors";
import { useUser } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import StepIndicator from "../components/ui/StepIndicator";

export default function CompleteProfile() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const { firstName, lastName, emailAddresses, id, imageUrl, hasImage } =
        user;

      const data = {
        firstName,
        lastName,
        email: emailAddresses[0].emailAddress,
        id,
        imageUrl,
        hasImage,
      };
    }
  }, [user]);

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
          <StepIndicator step={1} total={3} />
          <View style={{ alignItems: "flex-start", gap: 10, marginTop: 20 }}>
            <Text style={styles.title}>Complete your profile</Text>
            <Text style={styles.subtitle}>
              Let us know a bit about yourself to help us find the best matches
            </Text>
          </View>
          <View style={styles.formContainer}>
            <View style={[styles.formGroupRow, { width: "100%" }]}>
              <View style={{ flex: 0.5 }}>
                <InputField
                  label="First Name"
                  placeholder="First name"
                  autoCapitalize="words"
                />
              </View>
              <View style={{ flex: 0.5 }}>
                <InputField
                  label="Last Name"
                  placeholder="Last name"
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.formGroupRow}>
              <View style={{ flex: 0.5 }}>
                <InputField
                  label="Age"
                  placeholder="Age"
                  keyboardType="numeric"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={styles.formGroup}>
              <SelectField
                label="Gender"
                options={["Male", "Female", "Other"]}
              />
            </View>
            <View style={styles.formGroup}>
              <InputField
                label="Email"
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />
            </View>
          </View>
          <AppButton
            style={{ marginTop: 50 }}
            onPress={() => router.push("/(onboarding)/select-interests")}
          >
            <Text style={styles.buttonText}>Complete profile</Text>
          </AppButton>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  gradient: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 40,
  },
  formContainer: {
    flexDirection: "column",
    gap: 20,
    marginTop: 20,
    width: "100%",
  },
  content: {
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "30%",
    paddingBottom: 100,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 10,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  formGroup: {
    flexDirection: "column",
    gap: 10,
  },
  formGroupRow: {
    flexDirection: "row",
    gap: 10,
  },
});
