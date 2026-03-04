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

export default function ActivityDetail() {
  const { type } = useLocalSearchParams();
  const router = useRouter();

  const isRunning = type === "running";

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
              {isRunning ? "Running" : "Gym"}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {isRunning ? "Aerobic" : "Strength"}
              </Text>
            </View>
          </View>

          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={isRunning ? "run" : "dumbbell"}
              size={26}
              color="#fff"
            />
          </View>
        </View>

        {/* STATS */}
        {isRunning ? (
          <>
            <InfoRow icon="heart-outline" label="Heart Rate" value="145 BPM" />
            <InfoRow icon="speedometer" label="Avg. Speed" value="12.4 KM/H" />
            <InfoRow icon="fire-outline" label="Calories" value="342 KCAL" />
          </>
        ) : (
          <>
            <InfoRow icon="repeat" label="Reps" value="50" />
            <InfoRow icon="layers-outline" label="Sets" value="3" />
            <InfoRow icon="barbell-outline" label="Weight" value="60 KG" />
          </>
        )}

        <TouchableOpacity style={styles.startBtn}>
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