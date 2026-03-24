import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useStepReport } from "../../../hooks/useDailyStep";
import { useHealthScoreToday } from "../../../hooks/useHealthScore";
import { useHealthKit } from "../../../hooks/useHealthKit";

export default function Activity() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const today = new Date().toISOString().split('T')[0];
  const { data: stepReport, isLoading: stepsLoading } = useStepReport(today, today);
  const { data: healthData, isLoading: healthLoading } = useHealthScoreToday();
  const { steps: hkSteps, calories: hkCalories } = useHealthKit();

  const styles = createStyles(colors, isDark);

  if (stepsLoading || healthLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stepsToday = hkSteps > 0 ? hkSteps : (stepReport?.length ? stepReport[0].steps : 0);
  const burnedCalories = hkCalories > 0 ? hkCalories : (healthData?.tdee ? Math.round(healthData.tdee * 0.25) : 0); // Override with HealthKit or Server default


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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Activity Hub</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>STEPS</Text>
            <Text style={styles.cardValue}>{stepsToday.toLocaleString()}</Text>
            <Text style={styles.greenText}>Goal: 10,000</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>CALORIES</Text>
            <Text style={styles.cardValue}>{burnedCalories.toLocaleString()}</Text>
            <Text style={styles.grayText}>kcal burned</Text>
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
                      backgroundColor: index === 4 ? colors.primary : colors.accent,
                      opacity: index === 4 ? 1 : 0.6
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
            sub="Goal: 5 km" 
            color="#0ea5e9" 
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "running" },
            })}
            colors={colors}
          />

          <ActivityItem 
            icon="dumbbell" 
            title="Gym" 
            sub="Leg Day" 
            color="#6366f1" 
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "gym" },
            })}
            colors={colors}
          />

          <ActivityItem 
            icon="bike" 
            title="Cycling" 
            sub="Phổ biến" 
            color="#22c55e" 
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "cycling" },
            })}
            colors={colors}
          />

          <ActivityItem 
            icon="foot-print" 
            title="Walking" 
            sub="Auto Tracking" 
            color="#10b981" 
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "walking" },
            })}
            colors={colors}
          />
          
          <ActivityItem 
            icon="human-handsup" 
            title="Stretching" 
            sub="Quick Recovery" 
            color="#8b5cf6" 
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "stretching" },
            })}
            colors={colors}
          />

          <ActivityItem 
            icon="yoga" 
            title="Yoga" 
            sub="Mindfulness" 
            color="#0ea5e9" 
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "yoga" },
            })}
            colors={colors}
          />
        </View>
        <View style={{height: 120}} />
      </ScrollView>
    </View>
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
    marginTop: 60,
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    fontWeight: '600',
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
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  startHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  startTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  edit: {
    color: colors.primary,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  activitySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});