import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const router = useRouter();
export default function Activity() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle} />
            <Text style={styles.title}>Activity Hub</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>STEPS</Text>
            <Text style={styles.cardValue}>8,432</Text>
            <Text style={styles.greenText}>+12% vs yesterday</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>CALORIES</Text>
            <Text style={styles.cardValue}>640</Text>
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
                    { height: index === 4 ? 120 : 50 + index * 10 },
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
          <Text style={styles.edit}>Edit</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={styles.activityCard}
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "running" },
            })}
            >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="run"
                size={24}
                color="#0ea5e9"
              />
            </View>
            <Text style={styles.activityTitle}>Running</Text>
            <Text style={styles.activitySub}>Goal: 5 km</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.activityCard}
            onPress={() => router.push({
              pathname: "/activity/[type]",
              params: { type: "gym" },
            })}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={24}
                color="#6366f1"
              />
            </View>
            <Text style={styles.activityTitle}>Gym</Text>
            <Text style={styles.activitySub}>Leg Day</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="bike"
                size={24}
                color="#22c55e"
              />
            </View>
            <Text style={styles.activityTitle}>Cycling</Text>
            <Text style={styles.activitySub}>Goal: 10 km</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="swim"
                size={24}
                color="#06b6d4"
              />
            </View>
            <Text style={styles.activityTitle}>Swimming</Text>
            <Text style={styles.activitySub}>Goal: 30 min</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0ea5e9",
    marginRight: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  cardLabel: {
    fontSize: 12,
    color: "#64748b",
  },

  cardValue: {
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 8,
    color: "#0f172a",
  },

  greenText: {
    fontSize: 12,
    color: "#22c55e",
  },

  grayText: {
    fontSize: 12,
    color: "#64748b",
  },

  weekCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  weekTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  weekSub: {
    fontSize: 14,
    color: "#64748b",
  },

  onTrack: {
    color: "#0ea5e9",
    fontSize: 14,
  },

  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  barContainer: {
    alignItems: "center",
  },

  bar: {
    width: 18,
    backgroundColor: "#0ea5e9",
    borderRadius: 10,
    marginBottom: 6,
  },

  dayLabel: {
    fontSize: 12,
    color: "#64748b",
  },

  startHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  startTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  edit: {
    color: "#0ea5e9",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  activityCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },

  activitySub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});