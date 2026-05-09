import type { Activity as HomeActivity } from "@/app/(tabs)/(home)/index";
import ActivityItem from "@/app/components/ActivityItem";
import { colors } from "@/constants/colors";
import {
  fetchHostedActivities,
  HostedActivityFilter,
} from "@/services/activitiesService";
import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PAGE_SIZE = 10;

const FILTERS: { key: HostedActivityFilter; label: string }[] = [
  { key: "coming", label: "Coming" },
  { key: "ended", label: "Ended" },
  { key: "canceled", label: "Canceled" },
];

export default function Activity() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const [filter, setFilter] = useState<HostedActivityFilter>("coming");
  const [items, setItems] = useState<HomeActivity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFirstPage = useCallback(async () => {
    if (!email) {
      setItems([]);
      setLoading(false);
      setHasMore(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchHostedActivities(email, {
        status: filter,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setItems(result.activities);
      setPage(1);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Could not load activities",
        "Check your connection or try again later.",
        [{ text: "OK" }],
      );
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [email, filter]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  useFocusEffect(
    useCallback(() => {
      void loadFirstPage();
    }, [loadFirstPage]),
  );

  const onRefresh = useCallback(async () => {
    if (!email) return;
    setRefreshing(true);
    try {
      const result = await fetchHostedActivities(email, {
        status: filter,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setItems(result.activities);
      setPage(1);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error(e);
      Alert.alert("Refresh failed", "Try again in a moment.", [{ text: "OK" }]);
    } finally {
      setRefreshing(false);
    }
  }, [email, filter]);

  const loadMore = useCallback(async () => {
    if (!email || !hasMore || loadingMore || loading) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await fetchHostedActivities(email, {
        status: filter,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setItems((prev) => [...prev, ...result.activities]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error(e);
      Alert.alert("Could not load more", "Pull to refresh or try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoadingMore(false);
    }
  }, [email, filter, hasMore, loadingMore, loading, page]);

  const renderItem: ListRenderItem<HomeActivity> = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() =>
          router.push(`/(tabs)/(home)/details?activityId=${item.id}`)
        }
        style={styles.cardPress}
      >
        <ActivityItem activity={item} omitDistance />
      </Pressable>
    ),
    [],
  );

  const listHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.title}>Your activities</Text>
      <Text style={styles.subtitle}>
        Activities you&apos;re hosting—filter by status and open a card for
        details.
      </Text>
      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[
              styles.filterChip,
              filter === key && styles.filterChipSelected,
            ]}
          >
            <Text
              style={[
                styles.filterChipLabel,
                filter === key && styles.filterChipLabelSelected,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const listEmpty = !loading ? (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No activities here</Text>
      <Text style={styles.emptySubtitle}>
        {filter === "coming"
          ? "Upcoming hosted activities will show up when you create them."
          : filter === "ended"
            ? "Past activities you hosted will appear in this tab."
            : "Canceled activities are listed here."}
      </Text>
    </View>
  ) : null;

  const listFooter = loadingMore ? (
    <View style={styles.footerLoading}>
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : null;

  if (!email) {
    return (
      <View
        style={[styles.screen, styles.centered, { paddingTop: insets.top }]}
      >
        <Text style={styles.emptyTitle}>Sign in to see your activities</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {loading && items.length === 0 ? (
        <View
          style={[
            styles.loadingFull,
            {
              paddingTop: Math.max(insets.top, 12) + 8,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          {listHeader}
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: Math.max(insets.top, 12) + 8,
              paddingBottom: insets.bottom + 100,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.35}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#141414",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingFull: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 24,
  },
  listContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  headerBlock: {
    gap: 12,
    marginBottom: 20,
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: "rgba(242, 93, 46, 0.5)",
  },
  filterChipLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.88)",
  },
  filterChipLabelSelected: {
    color: "#fff",
  },
  cardPress: {
    marginBottom: 12,
  },
  empty: {
    paddingVertical: 48,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray,
    textAlign: "center",
    maxWidth: 320,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
