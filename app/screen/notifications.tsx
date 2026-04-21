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
} from "react-native";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { notificationService } from "../../api/services/notificationService";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "../../hooks/useNotifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const { data, isLoading, refetch, isRefetching } = useNotifications(0, 30);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  const [activeTab, setActiveTab] = useState<"UNREAD" | "READ">("UNREAD");

  const items = data?.content ?? [];
  const filteredItems = items.filter((item) => activeTab === "UNREAD" ? !item.isRead : item.isRead);

  const handleTestExercise = async () => {
    try {
      await notificationService.testExercise();
      Alert.alert("Thành công", "Đã gửi thông báo nhắc nhở luyện tập đến điện thoại!");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi thông báo thử nghiệm.");
    }
  };

  return (
    <View style={styles.container}>
      {!isDark && (
        <LinearGradient
          colors={["#b9dbf5", "#d7ebfa", "#e7f2fb"]}
          style={styles.heroBg}
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity
          style={styles.testBtn}
          onPress={handleTestExercise}
        >
          <Text style={styles.testBtnText}>
            Test
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.markAllBtn}
          disabled={markAllAsReadMutation.isPending}
          onPress={() => markAllAsReadMutation.mutate()}
        >
          <Text style={styles.markAllText}>
            {markAllAsReadMutation.isPending ? "..." : "Read all"}
          </Text>
        </TouchableOpacity>
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
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {unread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardContent}>{item.content}</Text>
                <Text style={styles.cardTime}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </Text>
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
      height: 240,
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
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    cardTitle: {
      flex: 1,
      color: colors.text,
      fontWeight: "700",
      fontSize: 15,
      paddingRight: 10,
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
