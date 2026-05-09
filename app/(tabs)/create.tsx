import { Interest } from "@/app/(onboarding)/select-interests";
import AppButton from "@/app/components/ui/AppButton";
import InputField from "@/app/components/ui/InputField";
import { colors } from "@/constants/colors";
import {
  createActivity,
  CreateActivityPayload,
} from "@/services/activitiesService";
import { fetchInterests } from "@/services/onboardingService";
import { useUser } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
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
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Title is required").max(120),
  description: z.string().min(1, "Add a description").max(2000),
  interestId: z.number().refine((id) => id > 0, {
    message: "Pick a category",
  }),
  maxParticipants: z
    .number({ error: "Must be a number" })
    .min(2, "At least 2 spots")
    .max(100, "Maximum 100 spots"),
  startDate: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  startTime: z
    .string()
    .min(1, "Time is required")
    .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h)"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

type FormData = z.infer<typeof schema>;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** API payload: form date + time as a UTC ISO string (no client-side TZ shift). */
function toStartsAtIso(startDate: string, startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  return `${startDate}T${pad2(h)}:${pad2(m)}:00.000Z`;
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function formatLocalTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function dateFromYmd(ymd: string): Date {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return new Date();
  const [y, mo, d] = ymd.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function dateFromHm(hm: string, ymd: string): Date {
  let y: number;
  let mo: number;
  let d: number;
  if (ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    [y, mo, d] = ymd.split("-").map(Number);
  } else {
    const n = new Date();
    y = n.getFullYear();
    mo = n.getMonth() + 1;
    d = n.getDate();
  }
  if (!hm || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(hm)) {
    return new Date(y, mo - 1, d, 12, 0, 0, 0);
  }
  const [h, min] = hm.split(":").map(Number);
  return new Date(y, mo - 1, d, h, min, 0, 0);
}

const pickerLightTextProps =
  Platform.OS === "ios"
    ? { themeVariant: "dark" as const, textColor: "#FFFFFF" }
    : {};

const DEFAULT_MAP_REGION = {
  latitude: 24.450549767521007,
  longitude: 39.53781144286388,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
} as const;

export default function Create() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const [interests, setInterests] = useState<Interest[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setValue("location", { latitude, longitude }, { shouldValidate: true });
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      interestId: 0,
      maxParticipants: 8,
      startDate: "",
      startTime: "",
      location: {
        latitude: DEFAULT_MAP_REGION.latitude,
        longitude: DEFAULT_MAP_REGION.longitude,
      },
    },
  });

  const selectedInterestId = watch("interestId");
  const startDateValue = watch("startDate");
  const mapLocation = watch("location");

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingInterests(true);
        setInterests(await fetchInterests());
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not load categories.", [{ text: "OK" }]);
      } finally {
        setLoadingInterests(false);
      }
    };
    void load();
  }, []);

  const firstErrorMessage = Object.values(errors).find(
    (error) => !!error?.message,
  )?.message;

  const onSubmit = async (data: FormData) => {
    if (!email) {
      Alert.alert(
        "Sign in required",
        "We need your email to host an activity.",
      );
      return;
    }

    const payload: CreateActivityPayload = {
      location: {
        latitude: Number(mapLocation.latitude.toFixed(5)),
        longitude: Number(mapLocation.longitude.toFixed(5)),
      },
      name: data.name.trim(),
      description: data.description.trim(),
      interestId: data.interestId,
      maxParticipants: data.maxParticipants,
      startsAt: toStartsAtIso(data.startDate, data.startTime),
      email,
    };

    try {
      setSubmitting(true);
      const activity = await createActivity(payload);
      reset();
      router.push(`/(tabs)/(home)/details?activityId=${activity.id}`);
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Could not create activity",
        "Check your connection and try again.",
        [{ text: "OK" }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                paddingTop: Math.max(insets.top, 12) + 48,
                paddingBottom: insets.bottom + 100,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerBlock}>
              <Text style={styles.title}>Create</Text>
              <Text style={styles.subtitle}>
                Host something nearby—set the basics and you&apos;re live.
              </Text>
            </View>

            <View style={styles.card}>
              {loadingInterests ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.interestsScroll}
                    contentContainerStyle={styles.interestsScrollContent}
                  >
                    {interests.map((interest) => (
                      <Pressable
                        key={interest.id}
                        style={[
                          styles.interestChip,
                          selectedInterestId === interest.id &&
                            styles.interestChipSelected,
                        ]}
                        onPress={() => setValue("interestId", interest.id)}
                      >
                        <Text style={styles.interestIcon}>{interest.icon}</Text>
                        <Text style={styles.interestName}>{interest.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  {errors.interestId?.message ? (
                    <Text style={styles.fieldError}>
                      {errors.interestId.message}
                    </Text>
                  ) : null}

                  <View style={styles.fieldGap}>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <InputField
                          label="Title"
                          placeholder="Weekend hike, coffee chat…"
                          placeholderTextColor={colors.gray}
                          autoCapitalize="sentences"
                          returnKeyType="next"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          style={styles.inputText}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.fieldGap}>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <InputField
                          label="Description"
                          placeholder="What to expect, meeting point hints, skill level…"
                          placeholderTextColor={colors.gray}
                          multiline
                          numberOfLines={5}
                          textAlignVertical="top"
                          style={[styles.inputText, styles.descriptionInput]}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={styles.rowItem}>
                      <Text style={styles.fieldLabel}>Date</Text>
                      <Controller
                        control={control}
                        name="startDate"
                        render={({ field: { onChange, value } }) => (
                          <DateTimePicker
                            value={dateFromYmd(value)}
                            mode="date"
                            display="default"
                            {...pickerLightTextProps}
                            onChange={(event, selectedDate) => {
                              if (
                                event.type === "set" &&
                                selectedDate != null
                              ) {
                                onChange(formatLocalDate(selectedDate));
                              }
                            }}
                          />
                        )}
                      />
                      {errors.startDate?.message ? (
                        <Text style={styles.fieldErrorInline}>
                          {errors.startDate.message}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.rowItem}>
                      <Text style={styles.fieldLabel}>Time</Text>
                      <Controller
                        control={control}
                        name="startTime"
                        render={({ field: { onChange, value } }) => (
                          <DateTimePicker
                            value={dateFromHm(value, startDateValue)}
                            mode="time"
                            display="default"
                            is24Hour
                            {...pickerLightTextProps}
                            onChange={(event, selectedDate) => {
                              if (
                                event.type === "set" &&
                                selectedDate != null
                              ) {
                                onChange(formatLocalTime(selectedDate));
                              }
                            }}
                          />
                        )}
                      />
                      {errors.startTime?.message ? (
                        <Text style={styles.fieldErrorInline}>
                          {errors.startTime.message}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.fieldGap}>
                    <Controller
                      control={control}
                      name="maxParticipants"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <InputField
                          label="Max participants"
                          placeholder="8"
                          placeholderTextColor={colors.gray}
                          keyboardType="number-pad"
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                          onBlur={onBlur}
                          onChangeText={(text) =>
                            onChange(
                              text.trim() === ""
                                ? 0
                                : Number(text.replace(/\D/g, "")),
                            )
                          }
                          value={value ? String(value) : ""}
                          style={styles.inputText}
                        />
                      )}
                    />
                  </View>
                </>
              )}
              <View style={styles.mapBlock}>
                <Text style={styles.fieldLabel}>Meeting point</Text>
                <Text style={styles.mapCoords} selectable>
                  {mapLocation.latitude.toFixed(5)},{" "}
                  {mapLocation.longitude.toFixed(5)}
                </Text>
                <Text style={styles.mapHint}>Tap the map to move the pin</Text>
                <MapView
                  style={styles.map}
                  onPress={handleMapPress}
                  initialRegion={{
                    ...DEFAULT_MAP_REGION,
                    latitude: mapLocation.latitude,
                    longitude: mapLocation.longitude,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: mapLocation.latitude,
                      longitude: mapLocation.longitude,
                    }}
                    title="Meeting point"
                    description="Tap elsewhere on the map to change"
                  />
                </MapView>
              </View>
            </View>

            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>
                {typeof firstErrorMessage === "string" ? firstErrorMessage : ""}
              </Text>
            </View>

            <AppButton
              onPress={handleSubmit(onSubmit)}
              disabled={loadingInterests || !email}
              loading={submitting}
              style={styles.submitButton}
            >
              <Text style={styles.submitLabel}>Publish activity</Text>
            </AppButton>
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
  headerBlock: {
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray,
    fontWeight: "400",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  interestsScroll: {
    marginHorizontal: -4,
  },
  interestsScrollContent: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  interestChipSelected: {
    backgroundColor: colors.primary,
  },
  interestIcon: {
    fontSize: 14,
  },
  interestName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  fieldGap: {
    gap: 0,
  },
  fieldError: {
    marginTop: -8,
    fontSize: 13,
    color: colors.secondary,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowItem: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.88)",
  },
  fieldErrorInline: {
    marginTop: 4,
    fontSize: 13,
    color: colors.secondary,
  },
  inputText: {
    color: "rgba(255,255,255,0.92)",
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  descriptionInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  errorBlock: {
    minHeight: 22,
  },
  errorText: {
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 4,
  },
  submitLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.3,
  },
  mapBlock: {
    gap: 8,
    marginTop: 4,
  },
  mapCoords: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontVariant: ["tabular-nums"],
  },
  mapHint: {
    fontSize: 13,
    color: colors.gray,
  },
  map: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
  bottomBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 5,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
