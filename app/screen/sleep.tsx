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
import Svg, { Circle, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useSleepAnalysis } from "../../hooks/useSleepSession";
import { useTheme } from "../../context/ThemeContext";

export default function SleepScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: sleepAnalysis, isLoading } = useSleepAnalysis();

  const styles = createStyles(colors, isDark);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const score = sleepAnalysis?.avg_efficiency || 88; 
  const hours = Math.floor(sleepAnalysis?.avg_duration_hours || 7);
  const minutes = Math.round(((sleepAnalysis?.avg_duration_hours || 7.2) % 1) * 60);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.logoTitleRow}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoTiny}
              resizeMode="contain"
            />
            <Text style={styles.title}>Sleep Analysis</Text>
          </View>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* DATE */}
        <View style={styles.datePill}>
          <Ionicons name="chevron-back" size={14} color={colors.textSecondary} />
          <Text style={styles.dateText}>Oct 24 - Oct 25</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
        </View>

        {/* CIRCULAR PROGRESS */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreGlow} />
          <Svg width="220" height="220" viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="40" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" fill="none" />
            <Circle cx="50" cy="50" r="40" stroke={colors.primary} strokeWidth="8" fill="none"
              strokeDasharray="251" strokeDashoffset={251 * (1 - score/100)} strokeLinecap="round" />
          </Svg>
          <View style={styles.scoreInner}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreText}>EXCELLENT</Text>
          </View>
        </View>

        <Text style={styles.totalTime}>{hours}h {minutes}m</Text>
        <Text style={styles.totalTimeSub}>Total Sleep Time</Text>

        {/* SLEEP STAGES GRAPH */}
        <View style={styles.stagesCard}>
          <View style={styles.stagesHeader}>
            <Text style={styles.stagesTitle}>Sleep Stages</Text>
            <View style={styles.legend}>
              <View style={[styles.legendDot, { backgroundColor: "#4f46e5" }]} />
              <Text style={styles.legendText}>Deep</Text>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Light</Text>
            </View>
          </View>
          <View style={styles.graphSpace}>
            <Svg height="120" width="100%" style={{ position: "absolute" }}>
                <Path d="M0 60 Q 50 20 100 80 T 200 60 T 350 40" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth="1" strokeDasharray="4 4" fill="none" />
            </Svg>
            <View style={[styles.bar, { backgroundColor: colors.primary, left: "10%", height: 30, top: 40 }]} />
            <View style={[styles.bar, { backgroundColor: colors.primary, left: "12%", height: 30, top: 40 }]} />
            <View style={[styles.bar, { backgroundColor: "#4f46e5", left: "25%", height: 40, top: 30 }]} />
            <View style={[styles.bar, { backgroundColor: "#4f46e5", left: "27%", height: 40, top: 30 }]} />
            <View style={[styles.bar, { backgroundColor: colors.primary, left: "45%", height: 35, top: 35 }]} />
            <View style={[styles.bar, { backgroundColor: colors.primary, left: "47%", height: 35, top: 35 }]} />
            <View style={[styles.bar, { backgroundColor: colors.accent, left: "65%", height: 25, top: 45 }]} />
            <View style={[styles.bar, { backgroundColor: colors.accent, left: "67%", height: 25, top: 45 }]} />
            
            <View style={[styles.bar, { backgroundColor: "#4f46e5", left: "15%", height: 50, top: 65 }]} />
            <View style={[styles.bar, { backgroundColor: colors.primary, left: "35%", height: 40, top: 75 }]} />
          </View>
          <View style={styles.timeLabels}>
            <Text style={styles.timeLabelText}>11 PM</Text>
            <Text style={styles.timeLabelText}>1 AM</Text>
            <Text style={styles.timeLabelText}>3 AM</Text>
            <Text style={styles.timeLabelText}>5 AM</Text>
            <Text style={styles.timeLabelText}>7 AM</Text>
          </View>
        </View>

        {/* BREAKDOWN */}
        <Text style={styles.sectionTitle}>Breakdown</Text>
        <View style={styles.breakdownGrid}>
          <BreakdownCard icon="moon" title="DEEP" time="1h 30m" sub="18% of total" progress={30} color="#4f46e5" colors={colors} styles={styles} />
          <BreakdownCard icon="partly-sunny" title="LIGHT" time="4h 02m" sub="58% of total" progress={60} color={colors.primary} colors={colors} styles={styles} />
          <BreakdownCard icon="color-wand" title="REM" time="2h 10m" sub="24% of total" progress={40} color={colors.accent} colors={colors} styles={styles} />
          <BreakdownCard icon="sunny" title="AWAKE" time="20m" sub="3 interruptions" progress={10} color={colors.secondary} colors={colors} styles={styles} />
        </View>

        {/* RECOVERY INSIGHT */}
        <View style={styles.insightCard}>
          <View style={styles.insightIconBox}>
            <Ionicons name="sparkles" size={20} color="#3b82f6" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              Recovery Insight <View style={styles.greenDot} />
            </Text>
            <Text style={styles.insightText}>
              {sleepAnalysis?.quality_assessment || "You got 15% more Deep Sleep than usual. Excellent for muscle recovery."}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function BreakdownCard({ icon, title, time, sub, progress, color, colors, styles }: any) {
  return (
    <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.bdHeader}>
        <Ionicons name={icon as any} size={14} color={color} style={{marginRight: 6}} />
        <Text style={[styles.bdTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.bdTime, { color: colors.text }]}>{time}</Text>
      <Text style={styles.bdSub}>{sub}</Text>
      <View style={[styles.bdLineBase, { backgroundColor: colors.border }]}>
        <View style={[styles.bdLineFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
  },
  logoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTiny: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  datePill: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
    marginHorizontal: 15,
  },
  scoreContainer: {
    alignItems: "center",
    marginTop: 30,
    position: "relative",
  },
  scoreGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    opacity: 0.1,
    shadowColor: colors.primary,
    shadowRadius: 50,
    shadowOpacity: 1,
    top: 40,
  },
  scoreInner: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 65,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: "bold",
    color: colors.text,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1.5,
  },
  totalTime: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginTop: 20,
  },
  totalTimeSub: {
    textAlign: "center",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  stagesCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stagesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  stagesTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  legendText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginRight: 8,
  },
  graphSpace: {
    height: 120,
    width: "100%",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bar: {
    width: 6,
    position: "absolute",
    borderRadius: 4,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  timeLabelText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 4,
  },
  breakdownGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  breakdownCard: {
    width: "48%",
    borderRadius: 24,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  bdHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  bdTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  bdTime: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  bdSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  bdLineBase: {
    height: 4,
    borderRadius: 2,
    width: "100%",
  },
  bdLineFill: {
    height: 4,
    borderRadius: 2,
  },
  insightCard: {
    backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.05)",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    marginTop: 16,
  },
  insightIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginLeft: 6,
  },
  insightText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
