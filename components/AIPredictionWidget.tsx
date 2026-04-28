import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient as SvgGradient, Path, Stop, Text as SvgText } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import { HealthInsightResponse, PredictionBlock } from "../hooks/useHealthInsights";
import { DailyHealthDTO } from "../api/services/iotService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CHART_HEIGHT = 110;
const CHART_PADDING = { left: 36, right: 16, top: 16, bottom: 20 };

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_CONFIG = {
  LOW:    { color: "#22c55e", bg: "#dcfce7", label: "Low Risk" },
  MEDIUM: { color: "#f59e0b", bg: "#fef3c7", label: "Med Risk" },
  HIGH:   { color: "#ef4444", bg: "#fee2e2", label: "High Risk" },
};

const ACTIVITY_COLORS: Record<string, string> = {
  SEDENTARY:        "#ef4444",
  LIGHTLY_ACTIVE:   "#f59e0b",
  MODERATELY_ACTIVE:"#3b82f6",
  VERY_ACTIVE:      "#22c55e",
  UNKNOWN:          "#94a3b8",
};

const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY:        "Sedentary",
  LIGHTLY_ACTIVE:   "Light",
  MODERATELY_ACTIVE:"Moderate",
  VERY_ACTIVE:      "Active",
  UNKNOWN:          "Unknown",
};

/**
 * Converts array of numeric values to a smooth SVG path string.
 */
function buildSmoothPath(
  points: { x: number; y: number }[],
): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 3;
    const cp1y = prev.y;
    const cp2x = prev.x + (2 * (curr.x - prev.x)) / 3;
    const cp2y = curr.y;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildAreaPath(
  points: { x: number; y: number }[],
  bottomY: number,
): string {
  if (points.length < 2) return "";
  const line = buildSmoothPath(points);
  return `${line} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
}

// ── Chart ─────────────────────────────────────────────────────────────────────

interface ChartProps {
  actualValues: number[];   // 7 actual days
  forecastValues: number[]; // 7 predicted days (follows immediately after)
  isDark: boolean;
}

function MultiLineChart({ actualValues, forecastValues, isDark }: ChartProps) {
  const allValues = [...actualValues, ...forecastValues];
  const minV = Math.min(...allValues, 0);
  const maxV = Math.max(...allValues, 1);

  const chartW = CARD_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const chartH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  // Total 14 points spread across chartW
  const totalPoints = 14;
  const stepX = chartW / (totalPoints - 1);

  const toY = (v: number) =>
    CHART_PADDING.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const actualPoints = actualValues.map((v, i) => ({
    x: CHART_PADDING.left + i * stepX,
    y: toY(v),
  }));

  const forecastPoints = forecastValues.map((v, i) => ({
    x: CHART_PADDING.left + (7 + i) * stepX,
    y: toY(v),
  }));

  const allPoints = [...actualPoints, ...forecastPoints];

  const actualPath = buildSmoothPath(actualPoints);
  const forecastPath = buildSmoothPath([actualPoints[actualPoints.length - 1], ...forecastPoints]);
  const actualArea = buildAreaPath(actualPoints, CHART_PADDING.top + chartH);
  const forecastArea = buildAreaPath(
    [actualPoints[actualPoints.length - 1], ...forecastPoints],
    CHART_PADDING.top + chartH,
  );

  const bottomY = CHART_PADDING.top + chartH;

  // x-axis labels: show Today at index 6
  const xLabels = ["", "", "", "4d ago", "", "", "Today", "+2d", "", "+4d", "", "+6d", "", "+7d"];

  return (
    <Svg width={CARD_WIDTH} height={CHART_HEIGHT + 4}>
      <Defs>
        <SvgGradient id="areaActual" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3b82f6" stopOpacity="0.25" />
          <Stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </SvgGradient>
        <SvgGradient id="areaForecast" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#a855f7" stopOpacity="0.2" />
          <Stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </SvgGradient>
      </Defs>

      {/* Horizontal grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = CHART_PADDING.top + chartH * pct;
        const val = Math.round(maxV - (maxV - minV) * pct);
        return (
          <React.Fragment key={i}>
            <Line
              x1={CHART_PADDING.left}
              y1={y}
              x2={CHART_PADDING.left + chartW}
              y2={y}
              stroke={isDark ? "#334155" : "#e2e8f0"}
              strokeWidth="1"
              strokeDasharray={i === 0 || i === 4 ? undefined : "3,3"}
            />
            {i % 2 === 0 && (
              <SvgText
                x={CHART_PADDING.left - 4}
                y={y + 4}
                fontSize="9"
                fill={isDark ? "#64748b" : "#94a3b8"}
                textAnchor="end"
              >
                {val > 999 ? (val / 1000).toFixed(1) + "k" : val}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}

      {/* Divider line: Today */}
      <Line
        x1={CHART_PADDING.left + 6 * stepX}
        y1={CHART_PADDING.top}
        x2={CHART_PADDING.left + 6 * stepX}
        y2={bottomY}
        stroke={isDark ? "#475569" : "#cbd5e1"}
        strokeWidth="1.5"
        strokeDasharray="4,3"
      />

      {/* Area fill actual */}
      <Path d={actualArea} fill="url(#areaActual)" />
      {/* Area fill forecast */}
      <Path d={forecastArea} fill="url(#areaForecast)" />

      {/* Actual line */}
      <Path
        d={actualPath}
        stroke="#3b82f6"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Forecast line */}
      <Path
        d={forecastPath}
        stroke="#a855f7"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="5,3"
      />

      {/* Dot at transition (Today) */}
      <Circle
        cx={actualPoints[actualPoints.length - 1].x}
        cy={actualPoints[actualPoints.length - 1].y}
        r="4.5"
        fill="#3b82f6"
        stroke="#fff"
        strokeWidth="2"
      />

      {/* x-axis labels */}
      {xLabels.map((label, i) =>
        label ? (
          <SvgText
            key={i}
            x={CHART_PADDING.left + i * stepX}
            y={bottomY + 14}
            fontSize="9"
            fill={isDark ? "#64748b" : "#94a3b8"}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ) : null,
      )}
    </Svg>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────

interface Props {
  aiData: HealthInsightResponse | undefined;
  weeklyData: DailyHealthDTO[] | undefined;
  isLoading: boolean;
}

export default function AIPredictionWidget({ aiData, weeklyData, isLoading }: Props) {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const prediction: PredictionBlock | null = aiData?.insight?.prediction ?? null;
  const analytics = aiData?.analytics;

  // Build actual 7-day steps values (sorted oldest → newest)
  const actual7 = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) return Array(7).fill(0);
    const sorted = [...weeklyData].sort((a, b) =>
      (a.date_string ?? "").localeCompare(b.date_string ?? ""),
    );
    const last7 = sorted.slice(-7);
    while (last7.length < 7) last7.unshift({ metrics: { steps: 0 } } as any);
    return last7.map((d) => Number(d.metrics?.steps ?? 0));
  }, [weeklyData]);

  // Build forecast 7-day based on prediction + trend
  const forecast7 = useMemo(() => {
    const avg = analytics?.stats?.steps_avg_7d ?? 0;
    const riskMultiplier =
      prediction?.weight_change_risk === "HIGH"   ? 0.82 :
      prediction?.weight_change_risk === "MEDIUM" ? 0.94 : 1.06;

    const activityMultiplier =
      prediction?.expected_activity_level === "VERY_ACTIVE"      ? 1.12 :
      prediction?.expected_activity_level === "MODERATELY_ACTIVE" ? 1.04 :
      prediction?.expected_activity_level === "LIGHTLY_ACTIVE"    ? 0.90 : 0.75;

    const base = avg > 0 ? avg : (actual7[actual7.length - 1] || 3000);
    return Array.from({ length: 7 }, (_, i) => {
      const noise = 1 + (Math.sin(i * 1.3) * 0.08);
      return Math.round(base * riskMultiplier * activityMultiplier * noise);
    });
  }, [actual7, analytics, prediction]);

  const riskCfg = prediction
    ? RISK_CONFIG[prediction.weight_change_risk] ?? RISK_CONFIG.LOW
    : RISK_CONFIG.LOW;
  const activityColor =
    ACTIVITY_COLORS[prediction?.expected_activity_level ?? "UNKNOWN"] ?? "#94a3b8";
  const activityLabel =
    ACTIVITY_LABELS[prediction?.expected_activity_level ?? "UNKNOWN"] ?? "Unknown";

  if (isLoading) {
    return (
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 20,
          borderRadius: 20,
          height: 200,
          backgroundColor: isDark ? "#1e293b" : "#f8fafc",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#e2e8f0",
        }}
      >
        <MaterialCommunityIcons name="chart-timeline-variant-shimmer" size={32} color={isDark ? "#475569" : "#cbd5e1"} />
        <Text style={{ color: isDark ? "#475569" : "#94a3b8", fontSize: 13, marginTop: 8 }}>
          Analyzing your health trends…
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push("/(tabs)/analysis")}
      style={{
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: isDark ? "#000" : "#0369a1",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.3 : 0.12,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View
        style={{
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#e2e8f0",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <LinearGradient
          colors={isDark ? ["#1e293b", "#1e2e47"] : ["#f0f9ff", "#e0f2fe"]}
          style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <MaterialCommunityIcons name="brain" size={14} color="#a855f7" />
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#a855f7", letterSpacing: 0.5 }}>
                  AI PREDICTIONS
                </Text>
              </View>
              <Text style={{ fontSize: 17, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
                Multi-metric Health
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                Vital Trends · Next 7 Days
              </Text>
            </View>

            {/* Legend */}
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 14, height: 3, backgroundColor: "#3b82f6", borderRadius: 2 }} />
                <Text style={{ fontSize: 10, color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}>Actual</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 14, height: 3, backgroundColor: "#a855f7", borderRadius: 2, opacity: 0.8 }} />
                <Text style={{ fontSize: 10, color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}>Predicted</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Chart */}
        <View style={{ paddingHorizontal: 0, paddingTop: 4, paddingBottom: 4 }}>
          <MultiLineChart
            actualValues={actual7}
            forecastValues={forecast7}
            isDark={isDark}
          />
        </View>

        {/* Footer badges */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingBottom: 14,
            paddingTop: 4,
            gap: 8,
          }}
        >
          {/* Risk badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: isDark ? riskCfg.color + "22" : riskCfg.bg,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              flex: 1,
            }}
          >
            <MaterialCommunityIcons name="shield-check-outline" size={14} color={riskCfg.color} />
            <View>
              <Text style={{ fontSize: 9, color: riskCfg.color, fontWeight: "700" }}>WEIGHT RISK</Text>
              <Text style={{ fontSize: 12, color: riskCfg.color, fontWeight: "800" }}>{riskCfg.label}</Text>
            </View>
          </View>

          {/* Activity badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: isDark ? activityColor + "22" : activityColor + "18",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              flex: 1,
            }}
          >
            <MaterialCommunityIcons name="run-fast" size={14} color={activityColor} />
            <View>
              <Text style={{ fontSize: 9, color: activityColor, fontWeight: "700" }}>ACTIVITY</Text>
              <Text style={{ fontSize: 12, color: activityColor, fontWeight: "800" }}>{activityLabel}</Text>
            </View>
          </View>

          {/* Confidence badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: isDark ? "#0ea5e922" : "#e0f2fe",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Ionicons name="analytics-outline" size={14} color="#0ea5e9" />
            <View>
              <Text style={{ fontSize: 9, color: "#0ea5e9", fontWeight: "700" }}>CONF.</Text>
              <Text style={{ fontSize: 12, color: "#0ea5e9", fontWeight: "800" }}>
                {prediction?.confidence ?? "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
