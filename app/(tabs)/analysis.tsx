import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useHealthScoreToday } from "../../hooks/useHealthScore";
import { useWaterProgress } from "../../hooks/useWaterIntake";
import { useSleepAnalysis } from "../../hooks/useSleepSession";
import { useTheme } from "../../context/ThemeContext";

export default function AnalysisScreen() {
  const { colors, isDark } = useTheme();
  const { data: healthData, isLoading: hnLoad } = useHealthScoreToday();
  const { data: waterData, isLoading: wLoad } = useWaterProgress();
  const { data: sleepData, isLoading: sLoad } = useSleepAnalysis();

  const styles = createStyles(colors, isDark);

  if (hnLoad || wLoad || sLoad) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const scoreLevel = healthData?.health_score?.level || "GOOD";
  const sleepHrs = sleepData?.avg_duration_hours || 7.2;
  const waterPct = waterData?.progress_percent || 65;
  const kcalBurned = healthData?.tdee || 2400;

  const MetricCard = ({ icon, title, subtitle, data, color, style }: any) => (
    <View style={[styles.metricCard, style]}>
      <CardHeader icon={icon} title={title} subtitle={subtitle} />
      <View style={styles.barRowLarge}>
        {data.map((h: number, i: number) => (
          <View
            key={i}
            style={[styles.largeBar, { height: h, backgroundColor: color }]}
          />
        ))}
      </View>
    </View>
  );

  const CardHeader = ({ icon, title, subtitle }: any) => (
    <View style={styles.metricHeader}>
      <MaterialIcons name={icon} size={22} color={colors.primary} />
      <View style={{ marginLeft: 16 }}>
        <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
        <Text style={styles.metricSub}>{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.title}>Health Analysis</Text>
          <Text style={styles.subtitle}>Detailed insights & reports</Text>
        </View>
      </View>

      {/* AI CARD */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.aiLabel}>✨ HEALTHCARE AI</Text>
          <Text style={styles.smallText}>● Real-time sync</Text>
        </View>

        <Text style={styles.cardTitle}>Multi-metric Health</Text>
        <Text style={styles.cardSubTitle}>Latest Insights: {scoreLevel}</Text>

        {/* Line Chart */}
        <Svg height="140" width="100%">
          <Path
            d="M10 100 Q 60 120 100 80 T 200 90 T 300 60"
            stroke={colors.primary}
            strokeWidth="3"
            fill="none"
          />
          <Circle cx="10" cy="100" r="4" fill={colors.primary} />
          <Circle cx="100" cy="80" r="4" fill={colors.primary} />
          <Circle cx="200" cy="90" r="4" fill={colors.primary} />
          <Circle cx="300" cy="60" r="4" fill={colors.primary} />
        </Svg>

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.sectionTitle}>Sleep Trend</Text>
            <View style={styles.barRow}>
               <View style={[styles.bar, { height: 30, backgroundColor: colors.accent }]} />
               <View style={[styles.barLight, { height: 45 }]} />
               <View style={[styles.bar, { height: 55, backgroundColor: colors.accent }]} />
            </View>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Level</Text>
            <View style={styles.gauge}>
               <Text style={styles.gaugeText}>{scoreLevel}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* DETAILED CARDS */}
      {/* SLEEP */}
      <MetricCard
        icon="nightlight-round"
        title="Sleep Quality"
        subtitle={`${hoursToHms(sleepHrs)} / night`}
        data={[60, 80, 45, 90, 70, 110, 85]}
        color={colors.accent}
      />

      {/* WATER */}
      <MetricCard
        icon="opacity"
        title="Water Hydration"
        subtitle={`${waterPct}% of Daily Goal`}
        data={[40, 60, 90, 65, 80, 95, Math.min(waterPct, 100)]}
        color={isDark ? "#38bdf8" : "#0ea5e9"}
      />

      {/* KCAL */}
      <MetricCard
        icon="local-fire-department"
        title="Kcal Burned"
        subtitle={`TDEE Est: ${kcalBurned}`}
        data={[50, 90, 80, 65, 110, 85, 75]}
        color={colors.secondary}
        style={{ marginBottom: 120 }}
      />
    </ScrollView>
  );
}

function hoursToHms(h: number) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  aiLabel: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  smallText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    color: colors.text,
  },
  cardSubTitle: {
    marginTop: 8,
    marginBottom: 10,
    color: colors.textSecondary,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  barLight: {
    width: 12,
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    borderRadius: 6,
    marginRight: 8,
  },
  gauge: {
    marginTop: 16,
    width: 100,
    height: 54,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.1)",
  },
  gaugeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  metricCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metricSub: {
    fontSize: 12,
    color: colors.textSecondary,
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
