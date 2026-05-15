import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { DailyHealthDTO } from "../../api/services/iotService";
import PremiumUpgradeModal from "../../components/PremiumUpgradeModal";
import { Typography } from "../../constants/typography";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useWeeklyReport } from "../../hooks/useDailyHealthMetric";
import {
  HealthInsightResponse,
  useHealthInsights,
} from "../../hooks/useHealthInsights";

const { width } = Dimensions.get("window");

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACT_LABEL: Record<"vi" | "en", Record<string, string>> = {
  vi: {
    SEDENTARY: "Ít vận động",
    LIGHTLY_ACTIVE: "Nhẹ nhàng",
    MODERATELY_ACTIVE: "Vừa phải",
    VERY_ACTIVE: "Năng động",
    UNKNOWN: "Chưa rõ",
  },
  en: {
    SEDENTARY: "Sedentary",
    LIGHTLY_ACTIVE: "Lightly active",
    MODERATELY_ACTIVE: "Moderately active",
    VERY_ACTIVE: "Very active",
    UNKNOWN: "Unknown",
  },
};

const getBMIStatusColor = (bmi: number | null) => {
  if (!bmi) return "#94a3b8";
  if (bmi < 18.5) return "#3b82f6";
  if (bmi < 25) return "#22c55e";
  if (bmi < 30) return "#f59e0b";
  return "#ef4444";
};

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ── Components ───────────────────────────────────────────────────────────────

function TopMetricCard({
  title,
  value,
  subLabel,
  badgeText,
  badgeColor,
  isDark,
}: any) {
  return (
    <View
      style={[
        styles.topCard,
        isDark && { backgroundColor: "#1e293b", borderColor: "#334155" },
      ]}
    >
      <Text style={styles.topCardTitle}>{title}</Text>
      <Text style={[styles.topCardValue, isDark && { color: "#f8fafc" }]}>
        {value}
      </Text>
      {badgeText ? (
        <View
          style={[styles.topCardBadge, { backgroundColor: badgeColor + "22" }]}
        >
          <Text style={[styles.topCardBadgeText, { color: badgeColor }]}>
            {badgeText}
          </Text>
        </View>
      ) : (
        <Text style={styles.topCardSubLabel}>{subLabel}</Text>
      )}
    </View>
  );
}

function BarChartCard({
  title,
  subtitle,
  icon,
  iconBg,
  iconColor,
  data,
  highlightColor,
  colors,
  isDark,
  refreshTrigger,
}: any) {
  // Find max value to scale bars relative to card height
  const maxVal = Math.max(...data.map((d: any) => d.value), 1);

  const [selectedIndex, setSelectedIndex] = useState<number>(6); // Default to last day (today)

  // Auto-select today's column when data loads or refreshed
  useEffect(() => {
    const todayIdx = data.findIndex((d: any) => d.isToday);
    if (todayIdx !== -1) {
      setSelectedIndex(todayIdx);
    }
  }, [data, refreshTrigger]);

  return (
    <View
      style={[
        styles.chartCard,
        isDark && { backgroundColor: "#1e293b", borderColor: "#334155" },
      ]}
    >
      <View style={styles.chartHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[styles.chartIconWrap, { backgroundColor: iconBg }]}>
            <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
          </View>
          <View>
            <Text style={[styles.chartTitle, isDark && { color: "#f8fafc" }]}>
              {title}
            </Text>
            <Text style={styles.chartSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartBarsWrap}>
        {data.map((day: any, i: number) => {
          // Default height is 10% minimum
          const heightPct = Math.max((day.value / maxVal) * 100, 10);
          const isSelected = i === selectedIndex;

          return (
            <TouchableOpacity
              key={i}
              style={styles.barCol}
              activeOpacity={0.7}
              onPress={() => setSelectedIndex(i)}
            >
              <View style={styles.barTrack}>
                {isSelected ? (
                  <LinearGradient
                    colors={highlightColor}
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPct}%`,
                        shadowColor: highlightColor[1],
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                      },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: isDark
                          ? "#334155"
                          : `${highlightColor[0]}44`,
                      },
                    ]}
                  />
                )}

                <Text
                  style={[
                    styles.barValueLabel,
                    {
                      color: isSelected
                        ? highlightColor[1]
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {day.value > 1000
                    ? (day.value / 1000).toFixed(1) + "k"
                    : day.value}
                </Text>
              </View>
              <Text
                style={[
                  styles.barLabel,
                  isSelected && { color: highlightColor[1], fontWeight: "700" },
                ]}
              >
                {day.dayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function LoadingProgress({ progress, isDark, colors, text }: any) {
  return (
    <View
      style={{ alignItems: "center", paddingTop: 80, paddingHorizontal: 40 }}
    >
      <Text
        style={{
          fontSize: 48,
          fontWeight: "800",
          color: isDark ? "#f8fafc" : "#1e293b",
          marginBottom: 24,
        }}
      >
        {progress}
        <Text style={{ fontSize: 24, color: "#94a3b8" }}>%</Text>
      </Text>
      <View
        style={{
          width: "100%",
          height: 8,
          backgroundColor: isDark ? "#334155" : "#e2e8f0",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={["#2563eb", "#60a5fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${progress}%`, height: "100%", borderRadius: 4 }}
        />
      </View>
      <Text
        style={{
          color: colors.textSecondary,
          marginTop: 24,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AnalysisScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();

  const [refreshCount, setRefreshCount] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 1. Fetch AI Analytics
  const {
    data: rawData,
    isLoading: aiLoading,
    isFetching: aiFetching,
    isError: aiError,
    error: aiErrorObj,
    refetch: refetchAi,
  } = useHealthInsights();
  const aiData = rawData as HealthInsightResponse | undefined;

  useEffect(() => {
    if (aiError && (aiErrorObj as any)?.response?.status === 403) {
      setShowUpgradeModal(true);
      setShowLoading(false);
    }
  }, [aiError, aiErrorObj, refreshCount]);

  // 2. Compute date range for 7 days
  const { startDate, endDate, last7Days } = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const sDate = getLocalDateString(sevenDaysAgo);
    const eDate = getLocalDateString(today);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = getLocalDateString(d);
      return {
        date: dateStr,
        dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
        isToday: dateStr === eDate,
      };
    });

    return { startDate: sDate, endDate: eDate, last7Days: days };
  }, []);

  // 3. Fetch 7-day raw data
  const {
    data: weeklyData,
    isLoading: weeklyLoading,
    isFetching: weeklyFetching,
    refetch: refetchWeekly,
  } = useWeeklyReport(startDate, endDate);

  // Use both isLoading (initial load) and isFetching (background refresh)
  const isLoading = aiLoading || weeklyLoading || aiFetching || weeklyFetching;

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setShowLoading(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 94) return 94; // Pause at 94% until actual data loaded
          return p + Math.floor(Math.random() * 8) + 2;
        });
      }, 150);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setShowLoading(false), 500);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleRefresh = () => {
    setShowLoading(true);
    setProgress(0);
    refetchAi();
    refetchWeekly();
    setRefreshCount((c) => c + 1);
  };

  // 4. Map raw data to chart format
  const chartData = useMemo(() => {
    return {
      steps: last7Days.map((d) => {
        const r = weeklyData?.find(
          (w: DailyHealthDTO) =>
            w.date_string === d.date || w.date_string_local === d.date,
        );
        return { ...d, value: r?.metrics?.steps ?? 0 };
      }),
      calories: last7Days.map((d) => {
        const r = weeklyData?.find(
          (w: DailyHealthDTO) =>
            w.date_string === d.date || w.date_string_local === d.date,
        );
        const appCal = Number(r?.metrics?.active_calories ?? 0);
        const ggCal = Number((r?.metrics as any)?.google_active_calories ?? 0);
        return { ...d, value: appCal + ggCal };
      }),
      exercise: last7Days.map((d) => {
        const r = weeklyData?.find(
          (w: DailyHealthDTO) =>
            w.date_string === d.date || w.date_string_local === d.date,
        );
        const appMin = Number(r?.metrics?.exercise_minutes ?? 0);
        const ggMin = Number(r?.metrics?.google_exercise_minutes ?? 0);
        return { ...d, value: appMin + ggMin };
      }),
      heartRate: last7Days.map((d) => {
        const r = weeklyData?.find(
          (w: DailyHealthDTO) =>
            w.date_string === d.date || w.date_string_local === d.date,
        );
        return { ...d, value: r?.metrics?.heart_rate ?? 0 };
      }),
    };
  }, [last7Days, weeklyData]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <LinearGradient
          colors={
            isDark
              ? ["#0d1c2e", "#12263d", colors.background]
              : ["#e0f2fe", "#f0f9ff", colors.background]
          }
          style={styles.heroBg}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.title, isDark && { color: "#f8fafc" }]}>
                <Text style={{ color: isDark ? "#38bdf8" : "#0f3f67" }}>
                  Health{" "}
                </Text>
                <Text style={{ color: "#1497dd" }}>{t("analysis.title_analysis")}</Text>
              </Text>
              <Text style={styles.subtitle}>{t("analysis.subtitle")}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              isDark && { backgroundColor: "#1e293b", borderColor: "#334155" },
            ]}
            onPress={handleRefresh}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Loading state */}
        {showLoading && (
          <LoadingProgress
            progress={progress}
            isDark={isDark}
            colors={colors}
            text={t("analysis.loading")}
          />
        )}

        {/* Main content */}
        {!showLoading && (
          <View style={styles.contentWrap}>
            {/* Top 3 Cards */}
            <View style={styles.topCardsRow}>
              <TopMetricCard
                title="BMI"
                value={aiData?.analytics?.bmi?.toFixed(1) ?? "--"}
                badgeText={aiData?.analytics?.bmi_category ?? t("analysis.na")}
                badgeColor={getBMIStatusColor(aiData?.analytics?.bmi ?? null)}
                isDark={isDark}
              />
              <TopMetricCard
                title="BMR"
                value={aiData?.analytics?.bmr ?? "--"}
                subLabel="kcal"
                isDark={isDark}
              />
              <TopMetricCard
                title="TDEE"
                value={aiData?.analytics?.tdee ?? "--"}
                subLabel="kcal"
                isDark={isDark}
              />
            </View>

            {/* Activity Level */}
            <View style={styles.activityLevelWrap}>
              <Text style={styles.activityLevelText}>
                {t("analysis.activity_level")}:{" "}
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {ACT_LABEL[language][
                    aiData?.analytics?.activity_level ?? "UNKNOWN"
                  ] ??
                    aiData?.analytics?.activity_level ??
                    ACT_LABEL[language].UNKNOWN}
                </Text>
              </Text>
            </View>

            {/* Charts */}
            <BarChartCard
              title={t("analysis.steps")}
              subtitle={t("analysis.last_7_days")}
              icon="shoe-print"
              iconBg="#e0f2fe"
              iconColor="#0284c7"
              data={chartData.steps}
              highlightColor={["#38bdf8", "#0284c7"]}
              colors={colors}
              isDark={isDark}
              refreshTrigger={refreshCount}
            />

            <BarChartCard
              title={t("analysis.kcal_burned")}
              subtitle={t("analysis.active_calories")}
              icon="fire"
              iconBg="#ffedd5"
              iconColor="#ea580c"
              data={chartData.calories}
              highlightColor={["#fb923c", "#ea580c"]}
              colors={colors}
              isDark={isDark}
              refreshTrigger={refreshCount}
            />

            <BarChartCard
              title={t("analysis.exercise_time")}
              subtitle={t("analysis.minutes_active")}
              icon="run"
              iconBg="#dcfce7"
              iconColor="#16a34a"
              data={chartData.exercise}
              highlightColor={["#4ade80", "#16a34a"]}
              colors={colors}
              isDark={isDark}
              refreshTrigger={refreshCount}
            />

            <BarChartCard
              title={t("analysis.heart_rate")}
              subtitle={t("analysis.avg_daily_bpm")}
              icon="heart-pulse"
              iconBg="#fee2e2"
              iconColor="#dc2626"
              data={chartData.heartRate}
              highlightColor={["#f87171", "#dc2626"]}
              colors={colors}
              isDark={isDark}
              refreshTrigger={refreshCount}
            />

            <View style={{ height: 40 }} />
          </View>
        )}
      </ScrollView>

      <PremiumUpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={t("analysis.premium_feature")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroBg: { position: "absolute", left: 0, right: 0, top: 0, bottom: 300 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  logoWrap: { flexDirection: "row", alignItems: "center" },
  logoImage: { width: 38, height: 38, marginRight: 10 },
  title: { ...Typography.brandTitle, fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },

  contentWrap: { paddingHorizontal: 20 },

  // Top Cards
  topCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  topCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  topCardTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 8,
  },
  topCardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 8,
  },
  topCardSubLabel: { fontSize: 12, color: "#94a3b8" },
  topCardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  topCardBadgeText: { fontSize: 10, fontWeight: "700" },

  // Activity Level
  activityLevelWrap: { marginBottom: 24, paddingHorizontal: 8 },
  activityLevelText: { fontSize: 15, color: "#475569", fontWeight: "500" },

  // Chart Cards
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  chartIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  chartTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  chartSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  chartArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  chartBarsWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
  },
  barCol: { alignItems: "center", width: `${100 / 7}%` },
  barTrack: {
    height: 110,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  barFill: { width: 24, borderRadius: 12 },
  barValueLabel: {
    position: "absolute",
    top: -20,
    fontSize: 10,
    fontWeight: "700",
  },
  barLabel: { fontSize: 11, color: "#94a3b8" },
});
