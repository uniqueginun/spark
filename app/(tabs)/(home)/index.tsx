import { Interest } from "@/app/(onboarding)/select-interests";
import ActivityItem from "@/app/components/ActivityItem";
import AppButton from "@/app/components/ui/AppButton";
import AppModal from "@/app/components/ui/AppModal";
import { colors } from "@/constants/colors";
import { fetchActivities } from "@/services/activitiesService";
import { fetchInterests } from "@/services/onboardingService";
import { useHomeStore, User } from "@/store/useHomeStore";
import { useClerk, useUser } from "@clerk/expo";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Slider from "@react-native-community/slider";

export type Activity = {
  id: number;
  name: string;
  description: string;
  interest: Interest;
  start_status: string;
  left_spots: number;
  formatted_start_at: string;
  distance_from_user: number;
};

export type SimpleUser = {
  id: number;
  name: string;
  image_url: string;
};

export type ActivityDetails = Activity & {
  participants: SimpleUser[];
  organizer: SimpleUser;
  max_participants: number;
};

export default function Page() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const { getCurrentUser } = useHomeStore();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [locationRadius, setLocationRadius] = useState<number>(5000);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInterest, setSelectedInterest] = useState<number>(0);

  const loadActivities = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoadingActivities(true);

      const location = JSON.parse(currentUser.location as unknown as string);

      const activities = await fetchActivities(
        selectedInterest,
        searchQuery,
        locationRadius,
        location.latitude,
        location.longitude,
      );

      setActivities(activities);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingActivities(false);
    }
  }, [currentUser, selectedInterest, searchQuery, locationRadius]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    const fetchUser = async (email: string) => {
      try {
        const user = await getCurrentUser(email);

        if (!user?.onboarded) {
          router.replace("/(onboarding)/complete-profile");
        }

        setCurrentUser(user as User);
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    };

    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

    email && fetchUser(email);
  }, [clerkUser]);

  useEffect(() => {
    const loadInterests = async () => {
      const interests = await fetchInterests();
      setInterests([{ id: 0, name: "All", icon: "🌍" }, ...interests]);
    };

    loadInterests();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [radiusDraftMeters, setRadiusDraftMeters] = useState(locationRadius);

  const radiusKm = Math.round(locationRadius / 1000);
  const draftKm = Math.round(radiusDraftMeters / 1000);

  useEffect(() => {
    if (showModal) {
      setRadiusDraftMeters(locationRadius);
    }
  }, [showModal]);

  if (checking) {
    return <ActivityIndicator size="large" color="#0a7ea4" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppModal
        modalVisible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderTitle}>Search radius</Text>
            <View style={styles.sliderValuePill}>
              <Text style={styles.sliderValue}>{draftKm} km</Text>
            </View>
          </View>
          <Text style={styles.sliderHint}>
            Activities within this distance from you
          </Text>
          <View style={styles.sliderTrackWrap}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={draftKm}
              onValueChange={(km) =>
                setRadiusDraftMeters(Math.round(km) * 1000)
              }
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="rgba(255,255,255,0.12)"
              thumbTintColor="#ffffff"
            />
            <View style={styles.sliderEnds}>
              <Text style={styles.sliderEndLabel}>1 km</Text>
              <Text style={styles.sliderEndLabel}>50 km</Text>
            </View>
          </View>
          <AppButton
            onPress={() => {
              setLocationRadius(radiusDraftMeters);
              setShowModal(false);
            }}
            style={styles.sliderApplyButton}
          >
            <Text style={styles.sliderButtonText}>Apply</Text>
          </AppButton>
        </View>
      </AppModal>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 4 }}>
          <Text style={styles.title}>Discover</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Entypo name="location-pin" size={24} color={colors.gray} />
            <Text style={{ color: colors.gray }}>
              Downtown · {radiusKm} km radius
            </Text>
          </View>
        </View>
        <View>
          <FontAwesome
            name="sliders"
            size={24}
            color={colors.gray}
            onPress={() => setShowModal(true)}
          />
        </View>
      </View>
      <View style={styles.searchContainer}>
        <Entypo name="magnifying-glass" size={24} color={colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities nearby..."
          placeholderTextColor={colors.gray}
          onChangeText={(text) => {
            setSearchQuery(text);
          }}
        />
      </View>
      <ScrollView horizontal style={styles.interestsContainer}>
        {interests.map((interest) => (
          <Pressable
            style={[
              styles.interest,
              selectedInterest === interest.id ? styles.selectedInterest : {},
            ]}
            key={interest.id}
            onPress={() => {
              setSelectedInterest(interest.id);
            }}
          >
            <Text style={styles.interestIcon}>{interest.icon}</Text>
            <Text style={styles.interestName}>{interest.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.activitiesContainer}>
        {loadingActivities ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          activities.map((activity) => (
            <Pressable
              key={activity.id}
              onPress={() =>
                router.push(`/(tabs)/(home)/details?activityId=${activity.id}`)
              }
            >
              <ActivityItem activity={activity} />
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
    gap: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.4,
  },
  interest: {
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedInterest: {
    backgroundColor: colors.primary,
  },
  interestIcon: {
    fontSize: 14,
  },
  interestName: {
    fontSize: 14,
    color: "white",
  },
  interestsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  interestsScroll: {
    flexDirection: "row",
    gap: 10,
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sliderContainer: {
    width: "100%",
    gap: 14,
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sliderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  sliderValuePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(242, 93, 46, 0.2)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(242, 93, 46, 0.45)",
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.2,
  },
  sliderHint: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginTop: -4,
  },
  sliderTrackWrap: {
    marginTop: 4,
  },
  slider: {
    width: "100%",
    height: 44,
  },
  sliderEnds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sliderEndLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.45)",
  },
  sliderApplyButton: {
    marginTop: 8,
  },
  sliderButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
