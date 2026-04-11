import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { Typography } from "../../../constants/typography";
import { useDailyHealthMetric } from "../../../hooks/useDailyHealthMetric";

import { useGoalStore } from "../../../store/goalStore";

export default function Activity() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { stepsGoal, caloriesGoal } = useGoalStore();

  const offset = new Date().getTimezoneOffset() * 60000;
  const today = new Date(Date.now() - offset).toISOString().split("T")[0];
  const { data: dailyHealth, isLoading: dailyHealthLoading } = useDailyHealthMetric(today);

  const styles = createStyles(colors, isDark);

  if (dailyHealthLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const metrics = dailyHealth?.metrics;
  const stepsToday = Number(metrics?.steps ?? 0);
  const burnedCalories = Number(
    metrics?.active_calories ??
      (metrics as any)?.activeCalories ??
      0,
  );

  const ActivityItem = ({ icon, title, sub, color, onPress, colors }: any) => {
    return (
      <TouchableOpacity style={styles.activityCard} onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySub}>{sub}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ["#0d1c2e", "#12263d"] : ["#b9dbf5", "#d7ebfa", "#e7f2fb"]}
        style={styles.heroBg}
      />

      <ScrollView style={styles.scrollSurface} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              <Text style={{ color: "#0f3f67" }}>Activity </Text>
              <Text style={{ color: "#1497dd" }}>Hub</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push("/screen/settings" as any)}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>STEPS</Text>
            <Text style={styles.cardValue}>{stepsToday.toLocaleString()}</Text>
            <Text style={styles.greenText}>Goal: {stepsGoal.toLocaleString()}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>CALORIES</Text>
            <Text style={styles.cardValue}>
              {burnedCalories.toLocaleString()}
            </Text>
            <Text style={styles.greenText}>Goal: {caloriesGoal.toLocaleString()} kcal</Text>
          </View>
        </View>

        {/* WEEKLY PROGRESS */}
        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.weekTitle}>Weekly Progress</Text>
              <Text style={styles.weekSub}>Activity duration</Text>
            </View>
            <Text style={styles.onTrack}>● On Track</Text>
          </View>

          <View style={styles.chartRow}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: index === 4 ? 100 : 40 + index * 8,
                      backgroundColor:
                        index === 4 ? colors.primary : isDark ? "#3f6d95" : "#93c5ea",
                      opacity: index === 4 ? 1 : 0.75,
                    },
                  ]}
                />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* START ACTIVITY */}
        <View style={styles.startHeader}>
          <Text style={styles.startTitle}>Start Activity</Text>
          <TouchableOpacity>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <ActivityItem
            icon="run"
            title="Running"
            sub="Outdoor"
            color="#0ea5e9"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "running" },
              })
            }
            colors={colors}
          />

          <ActivityItem
            icon="dumbbell"
            title="Gym"
            sub="Indoor"
            color="#6366f1"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "gym" },
              })
            }
            colors={colors}
          />



          <ActivityItem
            icon="human-handsup"
            title="Stretching"
            sub="Indoor"
            color="#8b5cf6"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "stretching" },
              })
            }
            colors={colors}
          />

          <ActivityItem
            icon="yoga"
            title="Yoga"
            sub="Indoor"
            color="#0ea5e9"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "yoga" },
              })
            }
            colors={colors}
          />
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FLOATING ACTION BUTTON FOR ADD SCHEDULE */}
      <TouchableOpacity 
          style={styles.fabBtn} 
          onPress={() => router.push("/screen/schedule_new" as any)}
      >
          <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollSurface: {
      flex: 1,
      backgroundColor: "transparent",
    },
    heroBg: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 420,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoImage: {
      width: 40,
      height: 40,
      marginRight: 12,
    },
    title: {
      ...Typography.brandTitle,
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    card: {
      width: "48%",
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
      letterSpacing: 0.5,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: "800",
      marginVertical: 8,
      color: colors.text,
    },
    greenText: {
      fontSize: 12,
      color: colors.success,
      fontWeight: "600",
    },
    grayText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    weekCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 32,
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.16 : 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    weekHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    weekTitle: {
      ...Typography.heading,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    weekSub: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    onTrack: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
    chartRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      height: 120,
    },
    barContainer: {
      alignItems: "center",
    },
    bar: {
      width: 14,
      borderRadius: 7,
      marginBottom: 8,
    },
    dayLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    startHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      marginBottom: 16,
      alignItems: "center",
    },
    startTitle: {
      ...Typography.heading,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    edit: {
      color: colors.primary,
      fontWeight: "700",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    activityCard: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.12 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    activityTitle: {
      ...Typography.heading,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    activitySub: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    fabBtn: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.tabBar,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.34,
      shadowRadius: 10,
      elevation: 5,
    }
  });
