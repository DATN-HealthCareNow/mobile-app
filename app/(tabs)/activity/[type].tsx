import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function ActivityDetail() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useSession();

  const isRunning = type === "running";
  const isYoga = type === "yoga";
  const isGym = type === "gym";
  const isWalking = type === "walking";
  const isStretching = type === "stretching";
  const isCycling = type === "cycling";

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
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Fitness Activities</Text>

        <Ionicons name="settings-outline" size={24} color="#64748b" />
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.activityTitle}>
              {isRunning ? "Running" : isYoga ? "Yoga" : isWalking ? "Walking" : isStretching ? "Stretching" : isCycling ? "Cycling" : "Gym"}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {isRunning ? "Aerobic" : isYoga ? "Flexibility" : isWalking ? "Active" : isStretching ? "Recovery" : isCycling ? "Wheels" : "Strength"}
              </Text>
            </View>
          </View>

          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={isRunning ? "run" : isYoga ? "yoga" : isWalking ? "walk" : isStretching ? "human-handsup" : isCycling ? "bike" : "dumbbell"}
              size={26}
              color="#fff"
            />
          </View>
        </View>

        {/* STATS */}
        {isRunning && (
          <>
            <InfoRow icon="walk-outline" label="Total Distance" value={totalDistance} />
            <InfoRow icon="speedometer" label="Avg. Speed" value={avgSpeed} />
            <InfoRow icon="fire-outline" label="Calories" value={totalCalories} />
          </>
        )}
        {isGym && (
          <>
            <InfoRow icon="repeat" label="Reps" value="-- / --" />
            <InfoRow icon="layers-outline" label="Sets" value="--" />
            <InfoRow icon="barbell-outline" label="Weight" value="-- KG" />
          </>
        )}
        {isYoga && (
          <>
            <InfoRow icon="time-outline" label="Total Flow Time" value="-- MIN" />
            <InfoRow icon="body-outline" label="Completed Poses" value="--" />
            <InfoRow icon="flame-outline" label="Calories" value="-- KCAL" />
          </>
        )}
        {isWalking && (
          <>
            <InfoRow icon="footsteps-outline" label="Daily Steps" value="--" />
            <InfoRow icon="walk-outline" label="Distance" value="-- KM" />
            <InfoRow icon="flame-outline" label="Calories Burned" value="-- KCAL" />
          </>
        )}
        {isStretching && (
          <>
            <InfoRow icon="medical-outline" label="Recovery Time" value="-- MIN" />
            <InfoRow icon="body-outline" label="Stretches Done" value="--" />
            <InfoRow icon="heart-outline" label="Relief" value="-- %" />
          </>
        )}
        {isCycling && (
          <>
            <InfoRow icon="bicycle-outline" label="Avg. Speed" value="-- KM/H" />
            <InfoRow icon="map-outline" label="Total Distance" value="-- KM" />
            <InfoRow icon="flame-outline" label="Calories Burned" value="-- KCAL" />
          </>
        )}

        <TouchableOpacity 
          style={styles.startBtn}
          onPress={() => {
            if (isRunning) {
              router.push("/screen/running");
            } else if (isYoga) {
              router.push("/screen/yoga_selection" as any);
            } else if (isWalking) {
              router.push("/screen/walking" as any);
            } else if (isStretching) {
              router.push("/screen/stretch_selection" as any);
            } else if (isCycling) {
              router.push("/screen/cycling" as any);
            } else {
              router.push("/screen/gym_selection" as any);
            }
          }}
        >
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color="#94a3b8" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
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

  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    elevation: 5,
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
    marginVertical: 10,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    marginLeft: 8,
    fontSize: 16,
    color: "#64748b",
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