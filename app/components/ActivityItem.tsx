import { colors } from "@/constants/colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Octicons from "@expo/vector-icons/Octicons";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Activity } from "../(tabs)/(home)";

export default function ActivityItem({
  activity,
  omitDistance,
}: {
  activity: Activity;
  /** Hide distance (e.g. for activities you host). */
  omitDistance?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.categoryRow}>
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{activity.interest.icon}</Text>
          </View>
          <Text style={styles.category}>{activity.interest.name}</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>{activity.start_status}</Text>
        </View>
      </View>

      <Text style={styles.title}>{activity.name}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {activity.description}
      </Text>

      <View style={styles.footer}>
        <View
          style={styles.metaGroup}
          accessibilityLabel={
            omitDistance
              ? activity.formatted_start_at
              : `${activity.distance_from_user} kilometers away, today at ${activity.formatted_start_at}`
          }
        >
          {!omitDistance ? (
            <View style={styles.metaChip}>
              <FontAwesome name="map-marker" size={14} color={colors.gray} />
              <Text style={styles.metaText}>
                {activity.distance_from_user} km
              </Text>
            </View>
          ) : null}
          <View style={styles.metaChip}>
            <FontAwesome name="clock-o" size={14} color={colors.gray} />
            <Text style={styles.metaText} numberOfLines={1}>
              {activity.formatted_start_at}
            </Text>
          </View>
        </View>
        <View style={styles.spotsRow}>
          <Octicons name="people" size={18} color={colors.primary} />
          <Text style={styles.spotsText}>{activity.left_spots} spots</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: 10,
    marginBottom: 4,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 20,
  },
  category: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  metaGroup: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginRight: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    maxWidth: "100%",
  },
  spotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  spotsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.2,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.88)",
    letterSpacing: 0.2,
  },
});
