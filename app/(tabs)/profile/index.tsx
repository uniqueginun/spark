import AppButton from "@/app/components/ui/AppButton";
import { colors } from "@/constants/colors";
import { useHomeStore } from "@/store/useHomeStore";
import { useClerk } from "@clerk/expo";
import Entypo from "@expo/vector-icons/Entypo";
import { Link, useRouter } from "expo-router";

import {
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

function StatCard({
  title,
  value,
  style,
}: {
  title: string;
  value: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.statCard, style]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function Index() {
  const { currentUser } = useHomeStore();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  const location = !!currentUser
    ? JSON.parse(currentUser?.location! as unknown as string)
    : { city: "", principalSubdivision: "", countryName: "" };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileHeader}>
        <Image source={{ uri: currentUser?.image_url }} style={styles.image} />
        <Text style={styles.name}>
          {currentUser?.first_name} {currentUser?.last_name}
        </Text>
        <Text style={styles.email}>{currentUser?.email}</Text>
        <View style={styles.locationContainer}>
          <Entypo name="location-pin" size={18} color={colors.gray} />
          <Text style={styles.locationValue}>
            {location.city}, {location.principalSubdivision}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.bioValue}>{currentUser?.bio || "No bio yet"}</Text>
      </View>

      <View style={styles.statContainer}>
        <StatCard style={styles.statItem} title="Posts" value="100" />
        <StatCard style={styles.statItem} title="Followers" value="100" />
        <StatCard style={styles.statItem} title="Following" value="100" />
      </View>

      <View style={styles.interests}>
        <Text style={styles.interestsTitle}>Interests</Text>
        <View style={styles.interestsContainer}>
          {currentUser?.interests.map((interest) => (
            <Text style={styles.interest} key={interest.id}>
              {interest.icon} {interest.name}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.actionGroup}>
        <Link href="/(tabs)/profile/edit-profile" style={styles.link}>
          <View style={styles.linkContent}>
            <Text style={styles.linkText}>Edit Profile</Text>
            <Entypo name="chevron-right" size={18} color={colors.gray} />
          </View>
        </Link>
        <Link href="/(tabs)/profile/privacy-safety" style={styles.link}>
          <View style={styles.linkContent}>
            <Text style={styles.linkText}>Privacy & Safety</Text>
            <Entypo name="chevron-right" size={18} color={colors.gray} />
          </View>
        </Link>
      </View>

      <AppButton onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </AppButton>
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
    paddingTop: 20,
    paddingBottom: 100,
    gap: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.4,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
  },
  profileHeader: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  email: {
    fontSize: 15,
    color: colors.gray,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  locationValue: {
    fontSize: 14,
    color: colors.gray,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bioValue: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray,
  },
  statCard: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  statItem: {
    flex: 1,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray,
    textAlign: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
  statContainer: {
    flexDirection: "row",
    gap: 12,
  },
  interests: {
    gap: 12,
  },
  interestsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interest: {
    color: "#D6D8DA",
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
    fontWeight: "600",
    textAlign: "center",
  },
  actionGroup: {
    gap: 12,
    marginTop: 8,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
  },
  linkText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
