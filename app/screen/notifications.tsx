import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { notificationService } from "../../api/services/notificationService";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "../../hooks/useNotifications";

const getNotificationIcon = (eventId?: string) => {
  switch (eventId) {
    case "WATER_REMINDER":
      return { type: 'icon', name: "water", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" }; // Blue
    case "LOW_EXERCISE_REMINDER":
    case "ACTIVITY_REMINDER":
      return { type: 'icon', name: "walk", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" }; // Orange
    case "MEDICATION_TIME":
      return { type: 'icon', name: "medkit", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" }; // Green
    case "SLEEP_REMINDER":
      return { type: 'icon', name: "moon", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" }; // Purple
    case "HEALTH_REPORT":
      return { type: 'icon', name: "document-text", color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)" }; // Indigo
    default:
      return { type: 'image', bg: "rgba(100, 116, 139, 0.1)" }; // App Logo
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const { data, isLoading, refetch, isRefetching } = useNotifications(0, 30);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  const [activeTab, setActiveTab] = useState<"UNREAD" | "READ">("UNREAD");

  const items = data?.content ?? [];
  
  // Smart Sorting: 
  // - Unread: Sort by createdAt (latest first)
  // - Read: Sort by readAt (recently read first) or createdAt fallback
  const sortedItems = [...items].sort((a, b) => {
    if (activeTab === "READ") {
      const timeA = a.readAt ? new Date(a.readAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.readAt ? new Date(b.readAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    } else {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    }
  });

  const filteredItems = sortedItems.filter((item) => activeTab === "UNREAD" ? !item.isRead : item.isRead);

  const handleTestExercise = async () => {
    try {
      await notificationService.testExercise();
      Alert.alert("Thành công", "Đã gửi thông báo nhắc nhở luyện tập đến điện thoại!");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi thông báo thử nghiệm.");
    }
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: async () => {
        // Đợi một chút để Backend kịp xử lý Database
        setTimeout(() => {
          refetch();
          setActiveTab("READ");
        }, 600);
      },
      onError: () => {
        Alert.alert("Lỗi", "Không thể đánh dấu đã đọc tất cả.");
      }
    });
  };

  return (
    <View style={styles.container}>
      {!isDark && (
        <LinearGradient
          colors={["#b9dbf5", "#e7f2fb", colors.background]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {activeTab === "UNREAD" && filteredItems.length > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              disabled={markAllAsReadMutation.isPending}
              onPress={handleMarkAllRead}
            >
              <Text style={styles.markAllText}>
                {markAllAsReadMutation.isPending ? "Đang xử lý..." : "Đọc tất cả"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "UNREAD" && styles.activeTab]}
          onPress={() => setActiveTab("UNREAD")}
        >
          <Text style={[styles.tabText, activeTab === "UNREAD" && styles.activeTabText]}>Chưa đọc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "READ" && styles.activeTab]}
          onPress={() => setActiveTab("READ")}
        >
          <Text style={[styles.tabText, activeTab === "READ" && styles.activeTabText]}>Đã đọc</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filteredItems.length === 0 ? styles.centerBox : styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => {
            const unread = !item.isRead;
            const iconConfig = getNotificationIcon(item.eventId);
            return (
              <TouchableOpacity
                style={[styles.card, unread && styles.cardUnread]}
                activeOpacity={0.9}
                onPress={() => {
                  if (unread) {
                    markAsReadMutation.mutate(item.id);
                  }
                }}
              >
                <View style={styles.cardInner}>
                  <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                    {iconConfig.type === 'image' ? (
                        <Image source={require("../../assets/images/logo.png")} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    ) : (
                        <Ionicons name={iconConfig.name as any} size={22} color={iconConfig.color} />
                    )}
                  </View>
                  <View style={styles.cardContentWrapper}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardContent}>
                      {(item.content || "").replace(/{execiseMintues}/g, "30").replace(/{exerciseMinutes}/g, "30")}
                    </Text>
                    <Text style={styles.cardTime}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có thông báo nào.</Text>
          }
        />
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 56,
    },
    heroBg: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    circleBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
    },
    markAllBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(59,130,246,0.2)" : "#e6f3ff",
      borderWidth: 1,
      borderColor: isDark ? "rgba(147, 197, 253, 0.2)" : "rgba(59,130,246,0.18)",
    },
    markAllText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 12,
    },
    testBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: "#ef4444",
      marginRight: 6,
    },
    testBtnText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 12,
    },
    tabContainer: {
      flexDirection: "row",
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: isDark ? "rgba(59,130,246,0.2)" : "#e6f3ff",
    },
    tabText: {
      color: colors.textSecondary,
      fontWeight: "600",
    },
    activeTabText: {
      color: colors.primary,
    },
    listContent: {
      paddingBottom: 24,
      gap: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      shadowColor: "#0b3f64",
      shadowOpacity: isDark ? 0.12 : 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    cardUnread: {
      borderColor: colors.primary,
    },
    cardInner: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      marginTop: 2,
    },
    cardContentWrapper: {
      flex: 1,
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    cardTitle: {
      flex: 1,
      color: colors.text,
      fontWeight: "700",
      fontSize: 15,
      paddingRight: 10,
      lineHeight: 20,
    },
    cardContent: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 8,
    },
    cardTime: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    unreadDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: "#ef4444",
    },
    centerBox: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
    },
  });
