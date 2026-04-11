import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useSession } from "../../../hooks/useAuth";
import { useUserActivities } from "../../../hooks/useActivity";
import { useTheme } from "../../../context/ThemeContext";

export default function ActivityDetail() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useSession();
  const { colors, isDark } = useTheme();

  const isRunning = type === "running";
  const isYoga = type === "yoga";
  const isGym = type === "gym";
  const isStretching = type === "stretching";

  const { data: activitiesPage } = useUserActivities(userId || "", 0, 50);
  const activities = (activitiesPage?.content || activitiesPage || []) as any[];

  // Tính trung bình / tổng cộng của ngày hôm nay
  let avgSpeed = "-- KM/H";
  let totalCalories = "-- KCAL";
  let totalDistance = "-- KM";

  if (isRunning && activities.length > 0) {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaysRuns = activities.filter(
      (a: any) =>
        a.type === "RUN" &&
        a.start_at &&
        (a.start_at.startsWith(todayStr) || a.start_at.includes(todayStr))
    );

    if (todaysRuns.length > 0) {
      let sumDist = 0;
      let sumCal = 0;
      let sumDurationSec = 0;

      todaysRuns.forEach((r: any) => {
        const dist = r.outdoor_context?.distance_meter || r.distance_meter || 0;
        const cal = r.summary_metrics?.active_calories || r.calories_burned || 0;
        const dur = r.summary_metrics?.total_duration || r.duration_seconds || 0;

        sumDist += dist;
        sumCal += cal;
        sumDurationSec += dur;
      });

      if (sumDurationSec > 0) {
        // Speed = (km) / (hours)
        const speed = (sumDist / 1000) / (sumDurationSec / 3600);
        avgSpeed = speed.toFixed(1) + " KM/H";
      }
      totalCalories = sumCal.toFixed(0) + " KCAL";
      totalDistance = (sumDist / 1000).toFixed(2) + " KM";
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      {!isDark && (
        <LinearGradient
          colors={["#b9dbf5", "#d7ebfa", "#e7f2fb"]}
          style={styles.heroBg}
        />
      )}
      <ScrollView style={[styles.container, { backgroundColor: "transparent" }]}> 
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Fitness Activities</Text>

        <View style={{ width: 44 }} />
      </View>

      {/* CARD */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              {isRunning ? "Running" : isYoga ? "Yoga" : isStretching ? "Stretching" : "Gym"}
            </Text>

            <View style={[styles.badge, isDark && { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
              <Text style={[styles.badgeText, isDark && { color: '#38bdf8' }]}>
                {isRunning ? "Aerobic" : isYoga ? "Flexibility" : isStretching ? "Recovery" : "Strength"}
              </Text>
            </View>
          </View>

          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons
              name={isRunning ? "run" : isYoga ? "yoga" : isStretching ? "human-handsup" : "dumbbell"}
              size={26}
              color="#fff"
            />
          </View>
        </View>

        {/* STATS */}
        {isRunning && (
          <>
            <InfoRow icon="walk-outline" label="Total Distance" value={totalDistance} colors={colors} isDark={isDark} />
            <InfoRow icon="speedometer" label="Avg. Speed" value={avgSpeed} colors={colors} isDark={isDark} />
            <InfoRow icon="fire-outline" label="Calories" value={totalCalories} colors={colors} isDark={isDark} />
          </>
        )}
        {isGym && (
          <>
            <InfoRow icon="repeat" label="Reps" value="-- / --" colors={colors} isDark={isDark} />
            <InfoRow icon="layers-outline" label="Sets" value="--" colors={colors} isDark={isDark} />
            <InfoRow icon="barbell-outline" label="Weight" value="-- KG" colors={colors} isDark={isDark} />
          </>
        )}
        {isYoga && (
          <>
            <InfoRow icon="time-outline" label="Total Flow Time" value="-- MIN" colors={colors} isDark={isDark} />
            <InfoRow icon="body-outline" label="Completed Poses" value="--" colors={colors} isDark={isDark} />
            <InfoRow icon="flame-outline" label="Calories" value="-- KCAL" colors={colors} isDark={isDark} />
          </>
        )}
        {isStretching && (
          <>
            <InfoRow icon="medical-outline" label="Recovery Time" value="-- MIN" colors={colors} isDark={isDark} />
            <InfoRow icon="body-outline" label="Stretches Done" value="--" colors={colors} isDark={isDark} />
            <InfoRow icon="heart-outline" label="Relief" value="-- %" colors={colors} isDark={isDark} />
          </>
        )}

        <TouchableOpacity 
          style={[styles.startBtn, isDark && { backgroundColor: '#0284c7' }]}
          onPress={() => {
            if (isRunning) {
              router.push("/screen/running");
            } else if (isYoga) {
              router.push("/screen/yoga_selection" as any);
            } else if (isStretching) {
              router.push("/screen/stretch_selection" as any);
            } else {
              router.push("/screen/gym_selection" as any);
            }
          }}
        >
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, colors, isDark }: any) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={isDark ? "#94a3b8" : "#64748b"} />
        <Text style={[styles.label, { color: isDark ? "#94a3b8" : "#64748b" }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  activityTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    alignSelf: "flex-start",
  },

  badgeText: {
    color: "#2563eb",
    fontWeight: "600",
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.18)",
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    marginLeft: 8,
    fontSize: 16,
  },

  value: {
    fontSize: 18,
    fontWeight: "600",
  },

  startBtn: {
    backgroundColor: "#0f3e88",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 25,
  },

  startText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});