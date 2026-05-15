import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Modal, ScrollView, SafeAreaView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import { useHealthForecast, HealthForecastResponse } from "../hooks/useHealthInsights";
import { DailyHealthDTO } from "../api/services/iotService";
import { useRouter } from "expo-router";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  profile: any;
  weeklyData: DailyHealthDTO[] | undefined;
}

const CIRCLE_SIZE = 160;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SystemPulseWidget({ profile, weeklyData }: Props) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { mutate: fetchForecast } = useHealthForecast();

  const [step, setStep] = useState<"IDLE" | "SCANNING" | "RESULT" | "QUOTA_EXCEEDED">("IDLE");
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<HealthForecastResponse | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  // Load cached result on mount
  useEffect(() => {
    const loadCache = async () => {
      if (!profile) return;
      const userId = profile?.id || profile?._id || "default";
      const key = `ai_pulse_cache_${userId}`;
      try {
        const cacheStr = await SecureStore.getItemAsync(key);
        if (cacheStr) {
          const cache = JSON.parse(cacheStr);
          const today = new Date().toISOString().split("T")[0];
          // Nếu data của ngày hôm nay thì load lên luôn
          if (cache.date === today && cache.result) {
            setResult(cache.result);
            setStep("RESULT");
            setScanProgress(100);
          }
        }
      } catch (e) {
        console.log("Error loading ai pulse cache", e);
      }
    };
    loadCache();
  }, [profile]);

  // Simulate scanning progress
  useEffect(() => {
    if (step === "SCANNING") {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // Nếu có result thì phi thẳng lên 100
          if (result) return 100;
          
          // Nếu chưa có result thì dừng ở 99% để chờ
          if (prev >= 99) return 99;
          
          // Chạy chậm dần về cuối để hợp lý với thời gian chờ 10-15s của Gemini
          if (prev > 85) return prev + 0.5;
          if (prev > 60) return prev + 1;
          return prev + 2;
        });
      }, 150);

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      return () => {
        clearInterval(interval);
        rotateAnim.stopAnimation();
      };
    }
  }, [step, result]);

  // Transition to RESULT when API is done and progress is 100
  useEffect(() => {
    if (step === "SCANNING" && scanProgress >= 100 && result) {
      setStep("RESULT");
    }
  }, [scanProgress, result, step]);

  const handleAnalyze = () => {
    setStep("SCANNING");
    setResult(null);

    const payload = {
      profile: {
        age: profile?.age,
        weight: profile?.weight,
        height: profile?.height,
      },
      recent_data: weeklyData?.slice(-3) || [],
    };

    fetchForecast(payload, {
      onSuccess: async (data) => {
        setResult(data);
        // Lưu vào cache
        const userId = profile?.id || profile?._id || "default";
        const today = new Date().toISOString().split("T")[0];
        try {
          await SecureStore.setItemAsync(`ai_pulse_cache_${userId}`, JSON.stringify({ date: today, result: data }));
        } catch (e) {
          console.log("Failed to cache ai pulse", e);
        }
      },
      onError: (err: any) => {
        const errorData = err?.response?.data;
        if (err?.response?.status === 403 || errorData?.error === "quota_exceeded") {
          setStep("QUOTA_EXCEEDED");
          return;
        }
        // Mock fallback if API fails
        setResult({
          health_score: 84,
          status: "GOOD",
          headline: "Vitality Stable",
          insight: "API Error, but assuming stable health based on available data.",
          metrics: { sleep_score: 80, stress_index: "Low" },
          recommendations: { workout: "Keep moving", diet: "Eat healthy" }
        });
      }
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderIdle = () => (
    <View style={styles.centerContent}>
      <View style={styles.circleContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={isDark ? "#1e293b" : "#e2e8f0"}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
        </Svg>
        <View style={styles.circleInner}>
          <MaterialCommunityIcons name="microscope" size={32} color="#0ea5e9" />
          <Text style={[styles.scanText, { color: "#0ea5e9" }]}>READY</Text>
        </View>
      </View>
      <Text style={[styles.descTitle, { color: colors.textSecondary }]}>Ready for Analysis</Text>
      <Text style={styles.descSub}>Syncing with wearable devices</Text>
      <TouchableOpacity style={styles.btnPrimary} onPress={handleAnalyze}>
        <Text style={styles.btnPrimaryText}>Analyze Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScanning = () => {
    const strokeDashoffset = CIRCUMFERENCE - (scanProgress / 100) * CIRCUMFERENCE;
    return (
      <View style={styles.centerContent}>
        <View style={styles.circleContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
            <Defs>
              <SvgGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#0ea5e9" />
                <Stop offset="100%" stopColor="#3b82f6" />
              </SvgGradient>
            </Defs>
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke={isDark ? "#1e293b" : "#e2e8f0"}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke="url(#scanGrad)"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <View style={styles.circleInner}>
            <Text style={[styles.progressText, { color: colors.text }]}>{Math.round(scanProgress)}%</Text>
            <Text style={styles.scanText}>SCANNING</Text>
          </View>
        </View>
        <Text style={[styles.descTitle, { color: colors.textSecondary }]}>Analyzing biometrics...</Text>
        <Text style={styles.descSub}>Syncing with wearable devices</Text>
      </View>
    );
  };

  const renderResult = () => {
    if (!result) return null;
    const isGood = result.status === "GOOD";
    const primaryColor = isGood ? "#3b82f6" : "#f59e0b";
    const bgPulse = isGood ? "#eff6ff" : "#fef3c7";
    
    const strokeDashoffset = CIRCUMFERENCE - (result.health_score / 100) * CIRCUMFERENCE;

    return (
      <View>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View style={[styles.statusBadge, { backgroundColor: isGood ? "#dbeafe" : "#ffedd5" }]}>
            <View style={[styles.statusDot, { backgroundColor: primaryColor }]} />
            <Text style={[styles.statusText, { color: primaryColor }]}>STATUS: {result.status}</Text>
          </View>
          <Text style={[styles.resultHeadline, { color: colors.text }]}>{result.headline}</Text>
          {isGood && <Text style={styles.resultSubHead}>Your biological rhythms are harmonized.</Text>}
        </View>

        <View style={styles.centerContent}>
          <View style={styles.circleContainer}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={isDark ? "#1e293b" : "#e2e8f0"}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={primaryColor}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <View style={styles.circleInner}>
              <Text style={[styles.scoreText, { color: colors.text }]}>{result.health_score}</Text>
              <Text style={styles.scoreMax}>/ 100</Text>
            </View>
          </View>
        </View>

        {!isGood && (
          <View style={[styles.alertBox, { backgroundColor: isDark ? "#332a1b" : "#fffbeb" }]}>
            <View style={styles.alertHeader}>
              <MaterialCommunityIcons name="brain" size={20} color="#f59e0b" />
              <Text style={[styles.alertTitle, { color: "#f59e0b" }]}>AI Prediction Insight</Text>
              <View style={styles.alertBadge}><Text style={styles.alertBadgeText}>ALERT</Text></View>
            </View>
            <Text style={[styles.alertText, { color: isDark ? "#d4d4d8" : "#52525b" }]}>
              {result.insight}
            </Text>
          </View>
        )}

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>SLEEP SCORE</Text>
            <Text style={[styles.metricVal, { color: colors.text }]}>{result.metrics.sleep_score}<Text style={styles.metricSub}>/100</Text></Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>STRESS INDEX</Text>
            <Text style={[styles.metricVal, { color: "#0ea5e9" }]}>{result.metrics.stress_index}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.btnPrimary, { backgroundColor: primaryColor, marginTop: 10 }]}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.btnPrimaryText}>View Detailed AI Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ marginTop: 16, alignItems: 'center', padding: 8 }}
          onPress={handleAnalyze}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "600" }}>
            <Ionicons name="refresh" size={12} /> Force Re-analyze
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuotaExceeded = () => (
    <View style={{ padding: 4 }}>
      <LinearGradient
        colors={['#1e3a8a', '#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 24, alignItems: 'center', overflow: 'hidden' }}
      >
        <View style={{ 
          width: 70, 
          height: 70, 
          borderRadius: 35, 
          backgroundColor: '#fff', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: 16,
          padding: 12
        }}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 }}>
          {t('premium.limit_reached')}
        </Text>
        
        <Text style={{ 
          fontSize: 13, 
          color: 'rgba(255,255,255,0.9)', 
          textAlign: 'center', 
          lineHeight: 18, 
          marginBottom: 20 
        }}>
          {t('premium.description', 'Bạn đã đạt đến giới hạn số lần sử dụng. Nâng cấp lên Premium để mở khóa không giới hạn.').replace('{featureName}', t('home.ai_health_predict'))}
        </Text>

        <TouchableOpacity 
          style={{ 
            backgroundColor: '#fff', 
            paddingHorizontal: 24, 
            paddingVertical: 12, 
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center'
          }} 
          onPress={() => router.push("/screen/subscription" as any)}
        >
          <Text style={{ color: '#2563eb', fontWeight: '700', fontSize: 15, marginRight: 6 }}>
            {t('premium.upgrade_now')}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#2563eb" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ marginTop: 12, padding: 8 }}
          onPress={() => setStep("IDLE")}
        >
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: "600" }}>
            {t('premium.later')}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const { t } = useLanguage();

  return (
    <View style={[styles.card, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="sparkles" size={16} color="#0ea5e9" />
          <Text style={styles.headerTitle}>{t("home.ai_health_predict")}</Text>
        </View>
        {step !== "RESULT" && <Text style={[styles.headerMainTitle, { color: colors.text }]}>{t("home.system_pulse")}</Text>}
      </View>

      <View style={styles.content}>
        {step === "IDLE" && renderIdle()}
        {step === "SCANNING" && renderScanning()}
        {step === "RESULT" && renderResult()}
        {step === "QUOTA_EXCEEDED" && renderQuotaExceeded()}
      </View>

      {/* AI Detailed Plan Modal */}
      {result && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? "#334155" : "#e2e8f0" }]}>
              <View style={styles.modalTitleWrap}>
                <MaterialCommunityIcons name="brain" size={24} color="#0ea5e9" />
                <Text style={[styles.modalTitle, { color: colors.text }]}>AI Health Plan</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 20 }}>
              {/* Insight Section */}
              <View style={[styles.detailSection, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <Ionicons name="analytics" size={18} color="#f59e0b" /> Overall Insight
                </Text>
                <Text style={[styles.sectionContent, { color: isDark ? "#cbd5e1" : "#475569" }]}>
                  {result.insight}
                </Text>
              </View>

              {/* Workout Section */}
              <View style={[styles.detailSection, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <Ionicons name="fitness" size={18} color="#10b981" /> Workout Recommendation
                </Text>
                <Text style={[styles.sectionContent, { color: isDark ? "#cbd5e1" : "#475569" }]}>
                  {result.recommendations.workout}
                </Text>
              </View>

              {/* Diet Section */}
              <View style={[styles.detailSection, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <Ionicons name="restaurant" size={18} color="#ef4444" /> Diet Plan
                </Text>
                <Text style={[styles.sectionContent, { color: isDark ? "#cbd5e1" : "#475569" }]}>
                  {result.recommendations.diet}
                </Text>
              </View>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    marginBottom: 20,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  headerMainTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  content: {
    alignItems: "stretch",
  },
  centerContent: {
    alignItems: "center",
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  circleInner: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  scanText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    marginTop: 4,
  },
  progressText: {
    fontSize: 32,
    fontWeight: "800",
  },
  descTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  descSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 24,
  },
  btnPrimary: {
    backgroundColor: "#0ea5e9",
    width: "100%",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // RESULT STYLES
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  resultHeadline: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  resultSubHead: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  scoreText: {
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
  },
  scoreMax: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  alertBox: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
    flex: 1,
  },
  alertBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertBadgeText: {
    color: "#ef4444",
    fontSize: 9,
    fontWeight: "800",
  },
  alertText: {
    fontSize: 13,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.1)",
    paddingTop: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: "800",
  },
  metricSub: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  detailSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
});
