import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useSleepAnalysis } from "../../hooks/useSleepSession";

export default function SleepScreen() {
  const router = useRouter();
  const { data: sleepAnalysis, isLoading } = useSleepAnalysis();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const score = sleepAnalysis?.avg_efficiency || 0; 
  const hours = Math.floor(sleepAnalysis?.avg_duration_hours || 0);
  const minutes = Math.round(((sleepAnalysis?.avg_duration_hours || 0) % 1) * 60);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.title}>Last Night</Text>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="share-outline" size={20} color="#f8fafc" />
          </TouchableOpacity>
        </View>

        {/* DATE */}
        <View style={styles.datePill}>
          <Ionicons name="chevron-back" size={14} color="#64748b" />
          <Text style={styles.dateText}>Oct 24 - Oct 25</Text>
          <Ionicons name="chevron-forward" size={14} color="#64748b" />
        </View>

        {/* CIRCULAR PROGRESS */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreGlow} />
          <Svg width="220" height="220" viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
            <Circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="8" fill="none"
              strokeDasharray="251" strokeDashoffset="37" strokeLinecap="round" />
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
              <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
              <Text style={styles.legendText}>Light</Text>
              <View style={[styles.legendDot, { backgroundColor: "#8b5cf6" }]} />
              <Text style={styles.legendText}>REM</Text>
              <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
              <Text style={styles.legendText}>Awake</Text>
            </View>
          </View>
          <View style={styles.graphSpace}>
            <Svg height="120" width="100%" style={{ position: "absolute" }}>
                <Path d="M0 60 Q 50 20 100 80 T 200 60 T 350 40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                <Path d="M0 90 Q 50 90 100 110 T 200 100 T 350 90" stroke="rgba(244, 63, 94, 0.4)" strokeWidth="1" fill="none" />
            </Svg>
            <View style={[styles.bar, { backgroundColor: "#3b82f6", left: "10%", height: 30, top: 40 }]} />
            <View style={[styles.bar, { backgroundColor: "#3b82f6", left: "12%", height: 30, top: 40 }]} />
            <View style={[styles.bar, { backgroundColor: "#4f46e5", left: "25%", height: 40, top: 30 }]} />
            <View style={[styles.bar, { backgroundColor: "#4f46e5", left: "27%", height: 40, top: 30 }]} />
            <View style={[styles.bar, { backgroundColor: "#3b82f6", left: "45%", height: 35, top: 35 }]} />
            <View style={[styles.bar, { backgroundColor: "#3b82f6", left: "47%", height: 35, top: 35 }]} />
            <View style={[styles.bar, { backgroundColor: "#8b5cf6", left: "65%", height: 25, top: 45 }]} />
            <View style={[styles.bar, { backgroundColor: "#8b5cf6", left: "67%", height: 25, top: 45 }]} />
            <View style={[styles.bar, { backgroundColor: "#f59e0b", left: "85%", height: 15, top: 55 }]} />
            
            <View style={[styles.bar, { backgroundColor: "#4f46e5", left: "15%", height: 50, top: 65 }]} />
            <View style={[styles.bar, { backgroundColor: "#4f46e5", left: "17%", height: 50, top: 65 }]} />
            <View style={[styles.bar, { backgroundColor: "#3b82f6", left: "35%", height: 40, top: 75 }]} />
            <View style={[styles.bar, { backgroundColor: "#3b82f6", left: "37%", height: 40, top: 75 }]} />
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
          {/* DEEP */}
          <View style={styles.breakdownCard}>
            <View style={styles.bdHeader}>
              <Ionicons name="moon" size={14} color="#4f46e5" style={{marginRight: 6}} />
              <Text style={styles.bdTitle}>DEEP</Text>
            </View>
            <Text style={styles.bdTime}>1h 30m</Text>
            <Text style={styles.bdSub}>18% of total</Text>
            <View style={styles.bdLineBase}>
              <View style={[styles.bdLineFill, { width: "30%", backgroundColor: "#4f46e5" }]} />
            </View>
          </View>

          {/* LIGHT */}
          <View style={styles.breakdownCard}>
            <View style={styles.bdHeader}>
              <Ionicons name="partly-sunny" size={14} color="#3b82f6" style={{marginRight: 6}} />
              <Text style={styles.bdTitle}>LIGHT</Text>
            </View>
            <Text style={styles.bdTime}>4h 02m</Text>
            <Text style={styles.bdSub}>58% of total</Text>
            <View style={styles.bdLineBase}>
              <View style={[styles.bdLineFill, { width: "60%", backgroundColor: "#3b82f6" }]} />
            </View>
          </View>

          {/* REM */}
          <View style={styles.breakdownCard}>
            <View style={styles.bdHeader}>
              <Ionicons name="color-wand" size={14} color="#8b5cf6" style={{marginRight: 6}} />
              <Text style={styles.bdTitle}>REM</Text>
            </View>
            <Text style={styles.bdTime}>2h 10m</Text>
            <Text style={styles.bdSub}>24% of total</Text>
            <View style={styles.bdLineBase}>
              <View style={[styles.bdLineFill, { width: "40%", backgroundColor: "#8b5cf6" }]} />
            </View>
          </View>

          {/* AWAKE */}
          <View style={styles.breakdownCard}>
            <View style={styles.bdHeader}>
              <Ionicons name="sunny" size={14} color="#f59e0b" style={{marginRight: 6}} />
              <Text style={styles.bdTitle}>AWAKE</Text>
            </View>
            <Text style={styles.bdTime}>20m</Text>
            <Text style={styles.bdSub}>3 interruptions</Text>
            <View style={styles.bdLineBase}>
              <View style={[styles.bdLineFill, { width: "10%", backgroundColor: "#f59e0b" }]} />
            </View>
          </View>
        </View>

        {/* RECOVERY INSIGHT */}
        <View style={styles.insightCard}>
          <View style={styles.insightIconBox}>
            <Ionicons name="sparkles" size={20} color="#60a5fa" />
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

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  datePill: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  dateText: {
    color: "#cbd5e1",
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
    backgroundColor: "#3b82f6",
    opacity: 0.2,
    shadowColor: "#3b82f6",
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
    color: "#fff",
  },
  scoreText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#60a5fa",
    letterSpacing: 1.5,
  },
  totalTime: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 20,
  },
  totalTimeSub: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  stagesCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
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
    color: "#f8fafc",
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
    fontSize: 9,
    color: "#94a3b8",
    marginRight: 6,
  },
  graphSpace: {
    height: 120,
    width: "100%",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
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
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#f8fafc",
    marginTop: 30,
    marginBottom: 15,
  },
  breakdownGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  breakdownCard: {
    width: "48%",
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  bdHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  bdTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#f8fafc",
    letterSpacing: 1,
  },
  bdTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  bdSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 15,
  },
  bdLineBase: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    width: "100%",
  },
  bdLineFill: {
    height: 4,
    borderRadius: 2,
  },
  insightCard: {
    backgroundColor: "#1e3a8a",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    marginTop: 10,
  },
  insightIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginLeft: 6,
  },
  insightText: {
    fontSize: 12,
    color: "#bfdbfe",
    lineHeight: 18,
  },
});
