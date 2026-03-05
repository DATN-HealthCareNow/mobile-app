import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useHealthScoreToday } from "../../hooks/useHealthScore";
import { useWaterProgress } from "../../hooks/useWaterIntake";
import { useSleepAnalysis } from "../../hooks/useSleepSession";

export default function AnalysisScreen() {
  const { data: healthData, isLoading: hnLoad } = useHealthScoreToday();
  const { data: waterData, isLoading: wLoad } = useWaterProgress();
  const { data: sleepData, isLoading: sLoad } = useSleepAnalysis();

  if (hnLoad || wLoad || sLoad) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const scoreLevel = healthData?.health_score?.level || "UNKNOWN";
  const sleepHrs = sleepData?.avg_duration_hours || 0;
  const waterPct = waterData?.progress_percent || 0;
  const kcalBurned = healthData?.tdee || 2400;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="analytics" size={26} color="#3b82f6" />
        </View>
        <View>
          <Text style={styles.title}>Health Analysis</Text>
          <Text style={styles.subtitle}>Detailed insights & reports</Text>
        </View>
      </View>

      {/* AI CARD */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.aiLabel}>✨ PHOENIX AI</Text>
          <Text style={styles.smallText}>● Real-time sync</Text>
        </View>

        <Text style={styles.cardTitle}>Multi-metric Health</Text>
        <Text style={styles.subTitle}>Latest Insights: {scoreLevel}</Text>

        {/* Line Chart */}
        <Svg height="140" width="100%">
          <Path
            d="M10 100 Q 60 120 100 80 T 200 90 T 300 60"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
          />
        </Svg>

        {/* Bottom stats */}
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.sectionTitle}>Sleep Quality</Text>
            <View style={styles.barRow}>
              <View style={[styles.bar, { height: 60 }]} />
              <View style={[styles.barLight, { height: 40 }]} />
              <View style={[styles.barMid, { height: 70 }]} />
              <View style={[styles.barLight, { height: 90 }]} />
            </View>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Stress Level</Text>
            <View style={styles.gauge}>
              <Text style={styles.gaugeText}>Low</Text>
            </View>
          </View>
        </View>
      </View>

      {/* STEPS */}
      <View style={styles.metricCard}>
        <CardHeader
          icon="directions-walk"
          title="Steps"
          subtitle="Last 7 Days"
        />
        <View style={styles.barRowLarge}>
          {renderBars([40, 70, 85, 55, 100, 80, 45], "#3b82f6")}
        </View>
      </View>

      {/* SLEEP ANALYSIS */}
      <View style={styles.metricCard}>
        <CardHeader
          icon="bedtime"
          title="Sleep Analysis"
          subtitle={`Average: ${sleepHrs.toFixed(1)} hrs`}
        />
        <Svg height="140" width="100%">
          <Path
            d="M10 100 Q 60 120 100 80 T 200 70 T 300 90"
            stroke="#8b5cf6"
            strokeWidth="3"
            fill="none"
          />
          <Circle cx="200" cy="70" r="5" fill="#8b5cf6" />
        </Svg>
      </View>

      {/* HYDRATION */}
      <View style={styles.metricCard}>
        <CardHeader
          icon="water-drop"
          title="Hydration"
          subtitle={`${waterPct}% of Daily Goal`}
        />
        <View style={styles.barRowLarge}>
          {renderBars([40, 60, 90, 65, 80, 95, Math.min(waterPct, 100)], "#0ea5e9")}
        </View>
      </View>

      {/* KCAL */}
      <View style={[styles.metricCard, { marginBottom: 120 }]}>
        <CardHeader
          icon="local-fire-department"
          title="Kcal Burned"
          subtitle={`TDEE Est: ${kcalBurned}`}
        />
        <View style={styles.barRowLarge}>
          {renderBars([50, 90, 80, 65, 110, 85, (kcalBurned / 2400) * 80], "#f59e0b")}
        </View>
      </View>
    </ScrollView>
  );
}

/* REUSABLE HEADER */
const CardHeader = ({ icon, title, subtitle }: any) => (
  <View style={styles.metricHeader}>
    <MaterialIcons name={icon} size={22} color="#60a5fa" />
    <View style={{ marginLeft: 15 }}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricSub}>{subtitle}</Text>
    </View>
  </View>
);

/* BAR GENERATOR */
const renderBars = (data: number[], color: string) =>
  data.map((h, i) => (
    <View
      key={i}
      style={[styles.largeBar, { height: h, backgroundColor: color }]}
    />
  ));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  aiLabel: {
    color: "#60a5fa",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 1,
  },
  smallText: {
    color: "#64748b",
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#f8fafc",
  },
  subTitle: {
    marginTop: 8,
    marginBottom: 10,
    color: "#94a3b8",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
  },
  bar: {
    width: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 6,
    marginRight: 6,
  },
  barLight: {
    width: 12,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 6,
    marginRight: 6,
  },
  barMid: {
    width: 12,
    backgroundColor: "#60a5fa",
    borderRadius: 6,
    marginRight: 6,
  },
  gauge: {
    marginTop: 12,
    width: 100,
    height: 50,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(59, 130, 246, 0.5)",
  },
  gaugeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#60a5fa",
  },
  metricCard: {
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  metricSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  barRowLarge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  largeBar: {
    width: 16,
    borderRadius: 8,
  },
});
