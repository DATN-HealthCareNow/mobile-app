import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../hooks/useUser";
import { useSession } from "../../hooks/useAuth";
import { useHealthData } from "../../hooks/useHealthData";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { token } = useSession();
  const { data: profile } = useProfile(token);
  const { isSyncing, syncData } = useHealthData();

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
             <Text style={styles.brandTitle}>HEALTHCARE</Text>
             <Text style={styles.brandSubtitle}>NOW</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      {/* WELCOME SECTION */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Hello, {(profile?.fullName || profile?.full_name || 'User').split(' ')[0]}! 👋</Text>
        <Text style={styles.statsSummary}>You have 3 tasks for today.</Text>
      </View>

      {/* QUICK MANAGEMENT */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Tracking</Text>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={syncData}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="sync" size={16} color={colors.primary} />
              <Text style={[styles.syncBtnText, { color: colors.primary }]}>Sync Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.managementGrid}>
        {/* SLEEP MANAGEMENT */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/sleep")}
        >
          <View style={[styles.iconBox, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
            <Ionicons name="moon" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.manageCardTitle}>Sleep</Text>
          <Text style={styles.manageCardSub}>8h Goal</Text>
        </TouchableOpacity>

        {/* HYDRATION MANAGEMENT */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/hydration")}
        >
          <View style={[styles.iconBox, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
            <Ionicons name="water" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.manageCardTitle}>Water</Text>
          <Text style={styles.manageCardSub}>2.5L Goal</Text>
        </TouchableOpacity>

        {/* MEAL SCHEDULE & AI */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/meal_schedule")}
        >
          <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
            <MaterialIcons name="restaurant" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.manageCardTitle}>AI Meals</Text>
          <Text style={styles.manageCardSub}>Planner</Text>
        </TouchableOpacity>
      </View>

      {/* REMINDER SECTION */}
      <LinearGradient
        colors={isDark ? ["#1e3a8a", "#1e40af"] : ["#3b82f6", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.reminderContainer}
      >
        <Text style={styles.reminderTitle}>UPCOMING TASKS</Text>

        <View style={styles.reminderCard}>
          <View style={styles.reminderIconBox}>
            <Ionicons name="medical" size={20} color={isDark ? "#60a5fa" : "#3b82f6"} />
          </View>
          <View>
            <Text style={styles.reminderHeading}>Take Medication</Text>
            <Text style={styles.reminderSub}>
              8:00 AM - Blood Pressure Meds
            </Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderIconBox}>
            <MaterialIcons name="directions-run" size={20} color={isDark ? "#60a5fa" : "#3b82f6"} />
          </View>
          <View>
            <Text style={styles.reminderHeading}>Workout Session</Text>
            <Text style={styles.reminderSub}>5:00 PM - Cardio</Text>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 2,
    lineHeight: 20,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 1,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  statsSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: 0.5,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  managementGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  manageCard: {
    width: "31%",
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  manageCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  manageCardSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  reminderContainer: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 28,
    padding: 24,
    marginBottom: 120,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  reminderTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 20,
    letterSpacing: 2,
  },
  reminderCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  reminderIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  reminderHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  reminderSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
  },
});
