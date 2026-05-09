import AppButton from "@/app/components/ui/AppButton";
import InputField from "@/app/components/ui/InputField";
import { colors } from "@/constants/colors";
import { updateProfile } from "@/services/onboardingService";
import { useHomeStore } from "@/store/useHomeStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

type AvatarValue = {
  uri: string;
  name: string;
  type: string;
} | null;

const schema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  avatar: z.custom<AvatarValue>().nullable(),
  bio: z.string().nullable(),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    error: "Gender is required",
  }),
  email: z.string().email(),
  location: z.string(),
});

type FormValues = z.infer<typeof schema>;

const GENDERS: Array<{ label: string; value: FormValues["gender"] }> = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

function normalizeLocation(location: unknown): {
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
} {
  if (!location) return {};
  if (typeof location === "string") {
    try {
      return JSON.parse(location) as {
        city?: string;
        principalSubdivision?: string;
        countryName?: string;
      };
    } catch {
      return {};
    }
  }
  if (typeof location === "object") {
    return location as {
      city?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
  }
  return {};
}

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const { currentUser, getCurrentUser } = useHomeStore();
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(
    currentUser?.image_url ?? "",
  );

  const normalizedLocation = normalizeLocation(currentUser?.location);
  const locationText =
    [
      normalizedLocation.city,
      normalizedLocation.principalSubdivision,
      normalizedLocation.countryName,
    ]
      .filter(Boolean)
      .join(", ") || "Unknown";

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: currentUser?.first_name ?? "",
      last_name: currentUser?.last_name ?? "",
      avatar: null,
      bio: currentUser?.bio ?? null,
      dob: currentUser?.dob ?? "",
      gender: currentUser?.gender ?? "male",
      email: currentUser?.email ?? "",
      location: locationText,
    },
  });

  const dob = watch("dob");
  const selectedAvatar = watch("avatar");

  const pickAvatar = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to upload an avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    const avatarFile: NonNullable<AvatarValue> = {
      uri: asset.uri,
      name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    };
    setValue("avatar", avatarFile, { shouldDirty: true });
    setCurrentImageUri(asset.uri);
  };

  const clearAvatar = () => {
    setValue("avatar", null, { shouldDirty: true });
    setCurrentImageUri(currentUser?.image_url ?? "");
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        bio: values.bio,
        dob: values.dob,
        gender: values.gender,
        avatar: values.avatar,
        email: values.email,
      });

      if (values.email) {
        await getCurrentUser(values.email);
      }

      Alert.alert("Profile updated", "Your changes have been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error.response.data);
      Alert.alert(
        "Update failed",
        "Could not update your profile. Please try again.",
      );
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setShowDobPicker(false);
      }}
      accessible={false}
    >
      <View style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: Math.max(insets.top, 12) + 8,
                paddingBottom: insets.bottom + 100,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <AntDesign name="arrow-left" size={20} color={colors.gray} />
              </Pressable>
              <Text style={styles.title}>Edit profile</Text>
            </View>

            <View style={styles.card}>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldBlock}>
                    <InputField
                      label="First Name"
                      placeholder="Enter first name"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.first_name?.message && (
                      <Text style={styles.errorText}>
                        {errors.first_name.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldBlock}>
                    <InputField
                      label="Last Name"
                      placeholder="Enter last name"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.last_name?.message && (
                      <Text style={styles.errorText}>
                        {errors.last_name.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Avatar</Text>
                <View style={styles.avatarRow}>
                  <Image
                    source={{ uri: currentImageUri }}
                    style={styles.avatarPreview}
                  />
                  <View style={styles.avatarActions}>
                    <Pressable style={styles.inlineAction} onPress={pickAvatar}>
                      <Text style={styles.inlineActionText}>Upload Image</Text>
                    </Pressable>
                    <Pressable
                      style={styles.inlineAction}
                      onPress={clearAvatar}
                    >
                      <Text style={styles.inlineActionText}>Reset</Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.mutedText}>
                  {selectedAvatar?.name
                    ? `Selected: ${selectedAvatar.name}`
                    : "Current image_url is shown above."}
                </Text>
              </View>

              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldBlock}>
                    <InputField
                      label="Bio"
                      placeholder="Tell people a little about you..."
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={value ?? ""}
                      onChangeText={(text) => onChange(text || null)}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={4}
                      style={styles.bioInput}
                      autoCapitalize="sentences"
                    />
                    {errors.bio?.message && (
                      <Text style={styles.errorText}>{errors.bio.message}</Text>
                    )}
                  </View>
                )}
              />

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Date of Birth</Text>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => setShowDobPicker(true)}
                >
                  <Text style={styles.pickerButtonText}>
                    {dob || "Select date of birth"}
                  </Text>
                </Pressable>
                {errors.dob?.message && (
                  <Text style={styles.errorText}>{errors.dob.message}</Text>
                )}
              </View>
              {showDobPicker && (
                <DateTimePicker
                  value={dob ? new Date(dob) : new Date()}
                  mode="date"
                  maximumDate={new Date()}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  {...(Platform.OS === "ios"
                    ? { themeVariant: "dark", textColor: "#FFFFFF" }
                    : {})}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS !== "ios") {
                      setShowDobPicker(false);
                    }
                    if (event.type === "dismissed" || !selectedDate) return;
                    const y = selectedDate.getFullYear();
                    const m = String(selectedDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const d = String(selectedDate.getDate()).padStart(2, "0");
                    setValue("dob", `${y}-${m}-${d}`, { shouldValidate: true });
                  }}
                />
              )}

              <Controller
                control={control}
                name="gender"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.radioRow}>
                      {GENDERS.map((option) => {
                        const selected = value === option.value;
                        return (
                          <Pressable
                            key={option.value}
                            style={styles.radioItem}
                            onPress={() => onChange(option.value)}
                          >
                            <View
                              style={[
                                styles.radioOuter,
                                selected && styles.radioOuterSelected,
                              ]}
                            >
                              {selected && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {errors.gender?.message && (
                      <Text style={styles.errorText}>
                        {errors.gender.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { value } }) => (
                  <View style={styles.fieldBlock}>
                    <InputField label="Email" value={value} editable={false} />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="location"
                render={({ field: { value } }) => (
                  <View style={styles.fieldBlock}>
                    <InputField
                      label="Location"
                      value={value}
                      editable={false}
                    />
                  </View>
                )}
              />

              <View style={styles.actions}>
                <AppButton
                  onPress={() => router.back()}
                  style={styles.secondaryAction}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </AppButton>
                <AppButton
                  onPress={handleSubmit(onSubmit)}
                  style={styles.primaryAction}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Save changes</Text>
                </AppButton>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#141414",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    gap: 14,
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.88)",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  avatarActions: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  inlineAction: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  inlineActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  mutedText: {
    color: colors.gray,
    fontSize: 13,
  },
  bioInput: {
    minHeight: 92,
  },
  pickerButton: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  pickerButtonText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "400",
  },
  radioRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 13,
    fontWeight: "500",
  },
  actions: {
    gap: 10,
    marginTop: 10,
  },
  secondaryAction: {
    opacity: 0.9,
  },
  primaryAction: {
    marginTop: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
