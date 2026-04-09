import { colors } from "@/constants/colors";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useUser } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";
import {
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { z } from "zod";
import AppButton from "../components/ui/AppButton";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import StepIndicator from "../components/ui/StepIndicator";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  age: z
    .number({ error: "Age must be a number" })
    .min(18, "Must be at least 18"),
  gender: z.enum(["Male", "Female", "Other"], {
    error: "Please select a valid gender",
  }),
  email: z.string().email("email is required"),
});

type FormData = z.infer<typeof schema>;

export default function CompleteProfile() {
  const { user } = useUser();
  const { onboarding, setOnboarding } = useOnboardingStore();
  const { firstName, lastName, emailAddresses, id, imageUrl, hasImage } =
    user ?? {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: firstName ?? "",
      last_name: lastName ?? "",
      age: 0,
      email: emailAddresses?.[0]?.emailAddress ?? "",
    },
  });

  const onSubmit = (data: FormData) => {
    setOnboarding({
      ...onboarding,
      profile: {
        ...onboarding.profile,
        ...data,
        imageUrl: user?.imageUrl ?? "",
        email: emailAddresses?.[0]?.emailAddress ?? "",
      },
    });

    router.push("/(onboarding)/select-interests" as RelativePathString);
  };

  const firstErrorMessage = Object.values(errors).find(
    (error) => !!error?.message,
  )?.message;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <LinearGradient
          style={styles.gradient}
          colors={colors.gradient}
          locations={[0, 0.35, 0.72, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                <StepIndicator step={1} total={3} />
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>Complete your profile</Text>
                  <Text style={styles.subtitle}>
                    Let us know a bit about yourself to help us find the best
                    matches.
                  </Text>
                </View>
                <View style={styles.formContainer}>
                  <View style={styles.avatar}>
                    <ImageBackground
                      source={{ uri: user?.imageUrl }}
                      style={styles.avatarImage}
                      imageStyle={{ borderRadius: 100 }}
                    ></ImageBackground>
                  </View>
                  <View style={[styles.formGroupRow, { width: "100%" }]}>
                    <View style={{ flex: 0.5 }}>
                      <Controller
                        control={control}
                        name="first_name"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <InputField
                            label="First Name"
                            placeholder="First name"
                            autoCapitalize="words"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                          />
                        )}
                      />
                    </View>
                    <View style={{ flex: 0.5 }}>
                      <Controller
                        control={control}
                        name="last_name"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <InputField
                            label="Last Name"
                            placeholder="Last name"
                            autoCapitalize="words"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                          />
                        )}
                      />
                    </View>
                  </View>
                  <View style={styles.formGroupRow}>
                    <View style={{ flex: 0.5 }}>
                      <Controller
                        control={control}
                        name="age"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <InputField
                            label="Age"
                            placeholder="Age"
                            placeholderTextColor={colors.gray}
                            keyboardType="numeric"
                            autoCapitalize="none"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                            onBlur={onBlur}
                            onChangeText={(text) =>
                              onChange(text.trim() === "" ? 0 : Number(text))
                            }
                            value={value ? String(value) : ""}
                          />
                        )}
                      />
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field: { onChange, value } }) => (
                        <SelectField
                          label="Gender"
                          options={["Male", "Female", "Other"]}
                          value={value}
                          onValueChange={onChange}
                        />
                      )}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <InputField
                          label="Email"
                          placeholder="Email"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect={false}
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                </View>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {typeof firstErrorMessage === "string"
                      ? firstErrorMessage
                      : ""}
                  </Text>
                </View>
                <AppButton
                  style={styles.submitButton}
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text style={styles.buttonText}>Complete profile</Text>
                </AppButton>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
  },
  formContainer: {
    flexDirection: "column",
    gap: 16,
    marginTop: 18,
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  content: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 76,
    paddingBottom: 28,
  },
  headerContainer: {
    width: "100%",
    gap: 8,
    marginTop: 18,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: "white",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
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
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 88,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    marginBottom: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
    resizeMode: "cover",
  },
  errorContainer: {
    width: "100%",
    minHeight: 28,
    marginTop: 12,
  },
  errorText: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    fontFamily: "Inter_400Regular",
    fontStyle: "normal",
    fontVariant: ["tabular-nums"],
    textAlign: "left",
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 18,
  },
});
