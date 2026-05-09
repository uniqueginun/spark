import { colors } from "@/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ItemProps = {
  label: string;
  value?: string;
  onPress?: () => void;
};

function SettingsItem({ label, value, onPress }: ItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.itemRow, pressed && styles.itemRowPressed]}
    >
      <View style={styles.itemTextWrap}>
        <Text style={styles.itemLabel}>{label}</Text>
        {!!value && <Text style={styles.itemValue}>{value}</Text>}
      </View>
      <Entypo name="chevron-right" size={18} color={colors.gray} />
    </Pressable>
  );
}

export default function PrivacySafety() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, 12) + 8,
          paddingBottom: insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrow-left" size={20} color={colors.gray} />
        </Pressable>
        <Text style={styles.title}>Privacy & Safety</Text>
      </View>

      <Text style={styles.subtitle}>
        Control who can see your profile, manage your data, and keep your account
        secure.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Privacy</Text>
        <SettingsItem label="Profile visibility" value="Public" />
        <SettingsItem label="Show my activities" value="Followers only" />
        <SettingsItem label="Show distance from me" value="Off" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Permissions</Text>
        <SettingsItem label="Location permission" value="While using app" />
        <SettingsItem label="Download my data" value="Request export" />
        <SettingsItem label="Delete account" value="Permanent action" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety</Text>
        <SettingsItem label="Blocked users" value="Manage list" />
        <SettingsItem label="Muted users" value="Manage list" />
        <SettingsItem label="Report a safety issue" value="Get support" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <SettingsItem label="Privacy policy" />
        <SettingsItem label="Terms of service" />
        <SettingsItem label="Community guidelines" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#141414",
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray,
    marginTop: 2,
  },
  section: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  itemRow: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  itemRowPressed: {
    opacity: 0.8,
  },
  itemTextWrap: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  itemValue: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
  },
});
