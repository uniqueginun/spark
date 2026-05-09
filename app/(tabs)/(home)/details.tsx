import AppButton from "@/app/components/ui/AppButton";
import { colors } from "@/constants/colors";
import {
  cancelActivity,
  deleteActivity,
  favoriteActivity,
  fetchActivityById,
  toggleJoinActivity,
} from "@/services/activitiesService";
import { getLocationInfo } from "@/services/locationService";
import { useUser } from "@clerk/expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import * as Location from "expo-location";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityDetails } from ".";

export default function Details() {
  const { activityId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: clerkUser } = useUser();
  const [joinActivityLoading, setJoinActivityLoading] = useState(false);
  const [cancelActivityLoading, setCancelActivityLoading] = useState(false);
  const [deleteActivityLoading, setDeleteActivityLoading] = useState(false);
  const [eventLocation, setEventLocation] = useState<string | null>(null);

  const getEventLocation = async (coords: any) => {
    const { city, principalSubdivision } = await getLocationInfo({
      coords,
      mocked: false,
      timestamp: Date.now(),
    } as Location.LocationObject);

    setEventLocation(`${city}, ${principalSubdivision}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchActivityById(activityId as string);
        setActivity(data);
        await getEventLocation(data.area_location);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activityId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0a7ea4" />;
  }

  const userEmail = clerkUser?.emailAddresses[0].emailAddress;

  const isMine = activity?.organizer?.email === userEmail;

  const isJoined = activity?.participants?.some(
    (participant) => participant.email === userEmail,
  );

  const handleJoinActivity = async () => {
    if (!userEmail) return;

    try {
      setJoinActivityLoading(true);

      const freshActivity = await toggleJoinActivity(
        activity?.id as number,
        userEmail,
      );
      setActivity(freshActivity);
    } catch (error) {
      console.error(error);
    } finally {
      setJoinActivityLoading(false);
    }
  };

  const handleCancelActivity = () => {
    if (!activity?.id || cancelActivityLoading || deleteActivityLoading) return;

    const isVisible = activity.is_visible;

    Alert.alert(
      isVisible ? "Cancel activity?" : "Reopen activity?",
      isVisible
        ? "Participants will no longer be able to join."
        : "Participants will be able to discover and join again.",
      [
        { text: "Keep", style: "cancel" },
        {
          text: isVisible ? "Cancel activity" : "Reopen activity",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelActivityLoading(true);
              const updatedActivity = await cancelActivity(activity.id);
              setActivity(updatedActivity);
            } catch (error) {
              console.error(error);
            } finally {
              setCancelActivityLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleHeartPress = async () => {
    const updatedActivity = await favoriteActivity(activity?.id as number);

    setActivity(updatedActivity);
  };

  const handleSharePress = async () => {
    const activityId = activity?.id;

    const message = `Check this activity 👇\n https://yourapp.com/activity/${activityId}`;

    console.log("Sharing activity with message:", message);

    try {
      await Share.share({
        message,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleChatPress = () => {
    if (!isJoined && !isMine) {
      Alert.alert("Join the activity to access the chat.");
      return;
    }

    router.push(`/chat?activityId=${activity?.id}`);
  };

  const handleDeleteActivity = () => {
    if (!activity?.id || deleteActivityLoading || cancelActivityLoading) return;

    Alert.alert(
      "Delete activity?",
      "This action is permanent and cannot be undone.",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleteActivityLoading(true);
              await deleteActivity(activity.id);
              router.dismissTo("/(tabs)/(home)");
            } catch (error) {
              console.error(error);
            } finally {
              setDeleteActivityLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Math.max(insets.top, 12) + 8,
          paddingBottom: insets.bottom + 28,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Link href="/(tabs)/(home)" asChild>
          <Pressable
            hitSlop={12}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.headerIconPressed,
            ]}
            onPress={() => router.dismissTo("/(tabs)/(home)")}
          >
            <AntDesign name="arrow-left" size={22} color={colors.gray} />
          </Pressable>
        </Link>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={12}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.headerIconPressed,
            ]}
            onPress={handleSharePress}
          >
            <Feather name="share-2" size={22} color={colors.gray} />
          </Pressable>
          <Pressable
            hitSlop={12}
            onPress={handleHeartPress}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.headerIconPressed,
            ]}
          >
            <Feather
              name="heart"
              size={22}
              color={activity?.hearted_by_user ? "red" : colors.gray}
            />
          </Pressable>
          <Pressable
            hitSlop={12}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.headerIconPressed,
            ]}
            onPress={handleChatPress}
          >
            <AntDesign name="message" size={22} color={colors.gray} />
          </Pressable>
        </View>
      </View>

      <View style={styles.categoryRow}>
        <View style={styles.categoryLeading}>
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{activity?.interest.icon}</Text>
          </View>
          <Text style={styles.categoryText}>{activity?.interest.name}</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>{activity?.start_status}</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.title}>{activity?.name}</Text>

        <View style={styles.organizerRow}>
          <Image
            source={{ uri: activity?.organizer.image_url }}
            style={styles.avatar}
          />
          <View style={styles.avatarInfo}>
            <Text style={styles.organizerName}>{activity?.organizer.name}</Text>
            <Text style={styles.organizerRole}>Organizer</Text>
          </View>
        </View>

        <View style={styles.detailRows}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="time-outline" size={20} color={colors.gray} />
            </View>
            <Text style={styles.detailPrimary}>
              {activity?.formatted_start_at}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <FontAwesome name="map-marker" size={18} color={colors.gray} />
            </View>
            <View style={styles.detailTextBlock}>
              <Text style={styles.detailPrimary}>
                {eventLocation || "Unknown Location"}
              </Text>
              <Text style={styles.detailSecondary}>
                {activity?.distance_from_user}m away
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Octicons name="people" size={18} color={colors.primary} />
            </View>
            <Text style={styles.detailEmphasis}>
              {activity?.participants.length}/{activity?.max_participants}{" "}
              joined · {activity?.left_spots} spot left
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this activity</Text>
        <Text style={styles.descriptionText}>{activity?.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants</Text>
        {(activity?.participants?.length ?? 0) > 0 ? (
          <View style={styles.participantsRow}>
            {activity?.participants.map((participant, i) => (
              <View key={i} style={styles.participantAvatarWrap}>
                <Image
                  source={{ uri: participant.image_url }}
                  style={styles.participantAvatar}
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.descriptionText}>No participants yet</Text>
        )}
      </View>

      <View style={styles.locationNotice}>
        <View style={styles.locationIconWrap}>
          <Entypo name="lock" size={18} color={colors.secondary} />
        </View>
        <Text style={styles.locationNoticeText}>
          Exact meetup location will be revealed after you join.
        </Text>
      </View>

      <View
        style={{
          paddingBottom: 100,
        }}
      >
        {Number(activity?.left_spots) > 0 && !isMine && (
          <AppButton
            onPress={handleJoinActivity}
            style={styles.joinButton}
            disabled={joinActivityLoading}
            loading={joinActivityLoading}
          >
            <Text style={styles.joinButtonText}>
              {isJoined ? "Leave Activity" : "Join Activity"}
            </Text>
          </AppButton>
        )}

        {isMine && (
          <AppButton
            onPress={handleCancelActivity}
            style={styles.joinButton}
            loading={cancelActivityLoading}
            disabled={cancelActivityLoading || deleteActivityLoading}
          >
            <Text style={styles.joinButtonText}>
              {activity?.is_visible ? "Cancel Activity" : "Reopen Activity"}
            </Text>
          </AppButton>
        )}

        {isMine && (
          <AppButton
            onPress={handleDeleteActivity}
            style={styles.secondaryButton}
            loading={deleteActivityLoading}
            disabled={deleteActivityLoading || cancelActivityLoading}
          >
            <Text style={styles.joinButtonText}>Delete Activity</Text>
          </AppButton>
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
  scrollContent: {
    paddingHorizontal: 20,
    gap: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerIconPressed: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  categoryLeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 22,
  },
  categoryText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(52, 211, 153, 0.35)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6ee7b7",
    letterSpacing: 1.2,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 18,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
    lineHeight: 34,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  avatarInfo: {
    flex: 1,
    gap: 2,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  organizerRole: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: "500",
  },
  detailRows: {
    gap: 4,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailTextBlock: {
    flex: 1,
    gap: 4,
  },
  detailPrimary: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.2,
  },
  detailSecondary: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: "400",
  },
  detailEmphasis: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  section: {
    marginTop: 22,
    paddingTop: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "400",
    letterSpacing: 0.15,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  participantAvatarWrap: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  participantAvatarOverlap: {
    marginLeft: -14,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  joinButton: {
    marginTop: 28,
  },
  secondaryButton: {
    marginTop: 12,
  },
  joinButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.3,
  },
  locationNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(234, 54, 102, 0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(234, 54, 102, 0.22)",
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(234, 54, 102, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationNoticeText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "500",
    letterSpacing: 0.15,
    paddingTop: 2,
  },
});
