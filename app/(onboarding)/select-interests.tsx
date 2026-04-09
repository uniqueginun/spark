import { colors } from "@/constants/colors";
import { fetchInterests as getInterests } from "@/services/onboardingService";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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

export type Interest = {
  id: number;
  name: string;
  icon: string;
};

export default function SelectInterests() {
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const { onboarding, setOnboarding } = useOnboardingStore();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        setInterests(await getInterests());
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to fetch interests", [{ text: "OK" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const handleSelectInterest = (interestId: number) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests((prev) => prev.filter((id) => id !== interestId));
    } else {
      setSelectedInterests((prev) => [...prev, interestId]);
    }
  };

  const onSubmit = () => {
    setOnboarding({
      ...onboarding,
      interests: selectedInterests,
    });

    router.push("/(onboarding)/set-location" as RelativePathString);
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
            <StepIndicator step={2} total={3} />
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.title}>What are you into?</Text>
            <Text style={styles.subtitle}>
              Pick at least 3 interests to find matching activities
            </Text>
          </View>
        </View>

        <View style={styles.interestsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            interests.map((interest) => (
              <Pressable
                key={interest.id}
                style={[
                  styles.interest,
                  selectedInterests.includes(interest.id)
                    ? styles.selectedInterest
                    : {},
                ]}
                onPress={() => handleSelectInterest(interest.id)}
              >
                <Text style={styles.interestText}>
                  {interest.icon} {interest.name}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        <AppButton style={{ marginTop: 50 }} onPress={onSubmit}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={styles.buttonText}>
              Continue {`(${selectedInterests.length} selected)`}
            </Text>
            <AntDesign name="arrow-right" size={24} color="white" />
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
  interest: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  interestText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  selectedInterest: {
    backgroundColor: colors.primary,
    borderRadius: 40,
  },
});
