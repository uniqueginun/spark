import { colors } from "@/constants/colors";
import { getLocationInfo } from "@/services/locationService";
import { completeOnboarding } from "@/services/onboardingService";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { RelativePathString, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "../components/ui/AppButton";
import StepIndicator from "../components/ui/StepIndicator";

export default function SetLocation() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { onboarding, setOnboarding } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);

  async function getCurrentLocation() {
    setIsLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location: Location.LocationObject | null =
        await Location.getCurrentPositionAsync({});

      if (!location) {
        setErrorMsg("Failed to get current location");
        return;
      }

      const { city, principalSubdivision, countryName, longitude, latitude } =
        await getLocationInfo(location);

      setOnboarding({
        ...onboarding,
        location: {
          city,
          principalSubdivision,
          countryName,
          longitude,
          latitude,
        },
      });
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to get current location");
    } finally {
      setIsLoading(false);
    }
  }

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await completeOnboarding(onboarding);
      Alert.alert("Success", response.message, [
        {
          text: "OK",
          onPress: () => router.push("/(home)/index" as RelativePathString),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to complete onboarding", [{ text: "OK" }]);
    } finally {
      setSubmitting(false);
    }
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable onPress={() => router.back()}>
              <AntDesign name="arrow-left" size={24} color="white" />
            </Pressable>
            <StepIndicator step={3} total={3} />
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.title}>Where are you?</Text>
            <Text style={styles.subtitle}>
              We&apos;ll show activities happening nearby. Your exact location
              stays private.
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationButton}>
            <Pressable
              style={[styles.locationButton, styles.selectedLocationButton]}
              onPress={getCurrentLocation}
            >
              <Entypo name="location-pin" size={28} color={colors.primary} />
              <Text style={styles.locationText}>
                {isLoading ? "Loading..." : "Use current location"}
              </Text>
              {isLoading && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </Pressable>
          </View>

          <View style={styles.locationInfo}>
            <Text style={styles.locationInfoText}>
              {onboarding?.location?.city}
              {", "}
              {onboarding?.location?.principalSubdivision}
              {", "}
              {onboarding?.location?.countryName}
            </Text>
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <AppButton style={{ marginTop: 50 }} onPress={handleSubmit}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={styles.buttonText}>
              {submitting ? "Submitting..." : "Start exploring"}
            </Text>
          </View>
        </AppButton>
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
    paddingBottom: 100,
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
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationInfo: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationText: {
    color: colors.gray,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
  locationContainer: {
    width: "100%",
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  selectedLocationButton: {
    backgroundColor: "transparent",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.gray,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  unselectedLocationButton: {
    backgroundColor: colors.secondary,
    borderRadius: 40,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 10,
  },
  locationInfoText: {
    color: colors.gray,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 10,
  },
});
