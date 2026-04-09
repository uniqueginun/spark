import { colors } from "@/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/ui/AppButton";
import StepIndicator from "../components/ui/StepIndicator";

const interests = [
  {
    id: 1,
    name: "Sports",
    icon: "🏆",
  },
  {
    id: 2,
    name: "Reading",
    icon: "📚",
  },
  {
    id: 3,
    name: "Coding",
    icon: "💻",
  },
  {
    id: 4,
    name: "Design",
    icon: "🎨",
  },
  {
    id: 5,
    name: "Photography",
    icon: "📸",
  },
  {
    id: 6,
    name: "Travel",
    icon: "🌍",
  },
  {
    id: 7,
    name: "Food",
    icon: "🍔",
  },
  {
    id: 8,
    name: "Art",
    icon: "🎨",
  },
  {
    id: 9,
    name: "Movies",
    icon: "🎥",
  },
  {
    id: 10,
    name: "Gaming",
    icon: "🎮",
  },
];

export default function SelectInterests() {
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);

  const handleSelectInterest = (interestId: number) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests((prev) => prev.filter((id) => id !== interestId));
    } else {
      setSelectedInterests((prev) => [...prev, interestId]);
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
          {interests.map((interest) => (
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
          ))}
        </View>

        <AppButton
          style={{ marginTop: 50 }}
          onPress={() => router.push("/(onboarding)/set-location")}
        >
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
