import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef } from "react";
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Typography } from "../../constants/typography";
import {
  useHealthInsights, useHealthChat,
  ChatMessage, HealthInsightResponse,
} from "../../hooks/useHealthInsights";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TREND_ICON: Record<string, string> = {
  INCREASING: "↗", DECREASING: "↘", STABLE: "→", INSUFFICIENT_DATA: "–",
};

const TREND_COLOR = (t: string, colors: any) => {
  if (t === "INCREASING") return "#22c55e";
  if (t === "DECREASING") return "#ef4444";
  if (t === "STABLE") return colors.primary;
  return colors.textSecondary;
};

const RISK_COLOR: Record<string, string> = {
  HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#22c55e",
};

const ACT_LABEL: Record<string, string> = {
  SEDENTARY: "Ít vận động", LIGHTLY_ACTIVE: "Nhẹ nhàng",
  MODERATELY_ACTIVE: "Vừa phải", VERY_ACTIVE: "Năng động", UNKNOWN: "Chưa rõ",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[pillStyles.wrap, { borderColor: color + "44" }]}>
      <Text style={[pillStyles.value, { color }]}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1, minWidth: 80 },
  value: { fontSize: 18, fontWeight: "700" },
  label: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
});

function TrendRow({ label, trend, colors }: { label: string; trend: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: TREND_COLOR(trend, colors), fontWeight: "700" }}>
        {TREND_ICON[trend] ?? "–"} {trend.replace("_", " ")}
      </Text>
    </View>
  );
}

function InsightCard({ data, colors, isDark }: { data: HealthInsightResponse; colors: any; isDark: boolean }) {
  const { analytics, insight } = data;

  return (
    <>
      {/* Biometric Pills */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }}>
        <MetricPill label="BMI" value={analytics.bmi?.toFixed(1) ?? "--"} color={colors.primary} />
        <MetricPill label="BMR" value={analytics.bmr ? `${analytics.bmr} kcal` : "--"} color={colors.accent} />
        <MetricPill label="TDEE" value={analytics.tdee ? `${analytics.tdee} kcal` : "--"} color={colors.secondary} />
      </View>

      {/* Activity level */}
      <View style={[cardStyles.section, { backgroundColor: isDark ? "#ffffff08" : "#f1f5f9", borderRadius: 12, padding: 12, marginBottom: 12 }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>MỨC ĐỘ VẬN ĐỘNG</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
          {ACT_LABEL[analytics.activity_level] ?? analytics.activity_level}
        </Text>
        {analytics.stats.steps_avg_7d != null && (
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            TB {Math.round(analytics.stats.steps_avg_7d).toLocaleString()} bước/ngày
            {analytics.stats.activity_consistency != null
              ? ` · ${Math.round(analytics.stats.activity_consistency * 100)}% ngày hoạt động`
              : ""}
          </Text>
        )}
      </View>

      {/* Trends */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>XU HƯỚNG 7 NGÀY</Text>
        <TrendRow label="Bước chân" trend={analytics.trends.steps} colors={colors} />
        <TrendRow label="Lượng calo" trend={analytics.trends.calories} colors={colors} />
        {data.mode === "ADVANCED" && (
          <>
            <TrendRow label="Giấc ngủ" trend={analytics.trends.sleep} colors={colors} />
            <TrendRow label="Nhịp tim" trend={analytics.trends.heart_rate} colors={colors} />
          </>
        )}
      </View>

      {/* Advanced stats */}
      {data.mode === "ADVANCED" && analytics.advanced && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {analytics.advanced.sleep_avg_hours != null && (
            <MetricPill label="Giấc ngủ TB" value={`${analytics.advanced.sleep_avg_hours}h`} color={colors.accent} />
          )}
          {analytics.advanced.heart_rate_avg != null && (
            <MetricPill label="Nhịp tim TB" value={`${analytics.advanced.heart_rate_avg} bpm`} color="#ef4444" />
          )}
          {analytics.advanced.recovery_score != null && (
            <MetricPill label="Recovery" value={`${analytics.advanced.recovery_score}%`} color="#22c55e" />
          )}
        </View>
      )}

      {/* AI Insight */}
      {insight && (
        <>
          <View style={[cardStyles.section, { backgroundColor: colors.primary + "18", borderRadius: 12, padding: 14, marginBottom: 12 }]}>
            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 12, marginBottom: 6 }}>✨ AI NHẬN XÉT</Text>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{insight.summary}</Text>
          </View>

          {insight.insights.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              {insight.insights.map((ins, i) => (
                <View key={i} style={{ flexDirection: "row", marginBottom: 6 }}>
                  <Text style={{ color: colors.primary, marginRight: 6 }}>•</Text>
                  <Text style={{ color: colors.text, fontSize: 13, flex: 1, lineHeight: 18 }}>{ins}</Text>
                </View>
              ))}
            </View>
          )}

          {insight.risks.length > 0 && (
            <View style={[cardStyles.section, { backgroundColor: "#ef444418", borderRadius: 12, padding: 12, marginBottom: 12 }]}>
              <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 12, marginBottom: 6 }}>⚠️ RỦI RO</Text>
              {insight.risks.map((r, i) => (
                <Text key={i} style={{ color: colors.text, fontSize: 13, marginBottom: 3 }}>• {r}</Text>
              ))}
            </View>
          )}

          {insight.prediction && (
            <View style={[cardStyles.section, { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 12 }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6 }}>DỰ ĐOÁN 7 NGÀY TỚI</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Mức hoạt động</Text>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{ACT_LABEL[insight.prediction.expected_activity_level] ?? insight.prediction.expected_activity_level}</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Nguy cơ cân nặng</Text>
                  <Text style={{ color: RISK_COLOR[insight.prediction.weight_change_risk] ?? colors.text, fontWeight: "700" }}>{insight.prediction.weight_change_risk}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Độ tin cậy</Text>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{insight.prediction.confidence}</Text>
                </View>
              </View>
              {insight.prediction.notes && (
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>{insight.prediction.notes}</Text>
              )}
            </View>
          )}

          {insight.recommendations.length > 0 && (
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>KHUYẾN NGHỊ</Text>
              {insight.recommendations.map((r, i) => (
                <View key={i} style={[cardStyles.section, { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#22c55e12", borderRadius: 10, padding: 10, marginBottom: 6 }]}>
                  <Text style={{ color: "#22c55e", marginRight: 8, marginTop: 1 }}>✓</Text>
                  <Text style={{ color: colors.text, fontSize: 13, flex: 1, lineHeight: 18 }}>{r}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </>
  );
}

const cardStyles = StyleSheet.create({ section: {} });

// ── Chat Section ──────────────────────────────────────────────────────────────

function ChatSection({
  insightData, colors, isDark,
}: { insightData: HealthInsightResponse; colors: any; isDark: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const { mutate: sendChat, isPending } = useHealthChat();

  const handleSend = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput("");

    const updated: ChatMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);

    sendChat(
      {
        user_profile: {
          age: 25, gender: 1, height_cm: 170, weight_kg: 65, language: "vi",
        },
        analytics_context: insightData.analytics as any,
        conversation_history: updated,
        message: msg,
      },
      {
        onSuccess: (res) => {
          setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        },
      }
    );
  };

  const suggested = messages.length === 0
    ? ["Tôi nên cải thiện gì trước tiên?", "Mức vận động của tôi có ổn không?", "Tôi nên ăn bao nhiêu calo?"]
    : [];

  return (
    <View style={{ marginTop: 20, marginBottom: 120 }}>
      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 12 }}>
        💬 Hỏi AI Coach
      </Text>

      {/* Message list */}
      <ScrollView ref={scrollRef} style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
        {messages.length === 0 && (
          <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: "center", marginVertical: 16 }}>
            Hỏi AI về dữ liệu sức khỏe 7 ngày của bạn
          </Text>
        )}
        {messages.map((m, i) => (
          <View
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: m.role === "user" ? colors.primary : (isDark ? "#1e293b" : "#f1f5f9"),
              borderRadius: 14,
              padding: 12,
              maxWidth: "82%",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: m.role === "user" ? "#fff" : colors.text, fontSize: 13, lineHeight: 19 }}>
              {m.content}
            </Text>
          </View>
        ))}
        {isPending && (
          <View style={{ alignSelf: "flex-start", padding: 12, marginBottom: 8 }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>

      {/* Suggested questions */}
      {suggested.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {suggested.map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSend(q)}
              style={{ backgroundColor: colors.primary + "22", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: colors.primary + "44" }}
            >
              <Text style={{ color: colors.primary, fontSize: 12 }}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Hỏi về sức khỏe của bạn..."
          placeholderTextColor={colors.textSecondary}
          style={{
            flex: 1, backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
            borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
            color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border,
          }}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim() || isPending}
          style={{ backgroundColor: colors.primary, borderRadius: 24, padding: 12 }}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AnalysisScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: rawData, isLoading, isError, refetch } = useHealthInsights();
  const data = rawData as HealthInsightResponse | undefined;

  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={isDark ? ["#0d1c2e", "#12263d"] : ["#b9dbf5", "#d7ebfa", "#e7f2fb"]}
          style={styles.heroBg}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image source={require("../../assets/images/logo.png")} style={styles.logoImage} resizeMode="contain" />
            <View>
              <Text style={styles.title}>
                <Text style={{ color: "#0f3f67" }}>HealthCare </Text>
                <Text style={{ color: "#1497dd" }}>Now</Text>
              </Text>
              <Text style={styles.subtitle}>AI insights · 7 ngày</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => refetch()}>
              <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/screen/settings" as any)}>
              <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading state */}
        {isLoading && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 13 }}>
              AI đang phân tích dữ liệu 7 ngày...
            </Text>
          </View>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <View style={[styles.card, { alignItems: "center", paddingVertical: 32 }]}>
            <MaterialIcons name="error-outline" size={40} color="#ef4444" />
            <Text style={{ color: colors.text, marginTop: 12, fontWeight: "700" }}>Không tải được phân tích</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: "center" }}>
              Vui lòng đồng bộ dữ liệu sức khỏe và thử lại
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main content */}
        {data && !isLoading && (
          <>
            {/* Mode badge */}
            <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 12, gap: 8 }}>
              <View style={{ backgroundColor: data.mode === "ADVANCED" ? "#22c55e22" : colors.primary + "22", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: data.mode === "ADVANCED" ? "#22c55e" : colors.primary, fontSize: 11, fontWeight: "700" }}>
                  {data.mode === "ADVANCED" ? "⌚ ADVANCED MODE" : "📱 BASIC MODE"}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Chất lượng dữ liệu: {data.data_quality}</Text>
            </View>

            {/* Analysis card */}
            <View style={styles.card}>
              {data.error && (
                <View style={{ backgroundColor: "#f59e0b18", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                  <Text style={{ color: "#f59e0b", fontSize: 12 }}>⚠️ {data.error}</Text>
                </View>
              )}
              <InsightCard data={data} colors={colors} isDark={isDark} />
            </View>

            {/* Chat section */}
            <View style={styles.card}>
              <ChatSection insightData={data} colors={colors} isDark={isDark} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroBg: { position: "absolute", left: 0, right: 0, top: 0, height: 360 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  logoWrap: { flexDirection: "row", alignItems: "center" },
  logoImage: { width: 38, height: 38, marginRight: 10 },
  title: { ...Typography.brandTitle, fontSize: 20, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: "#0b3f64", shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.2 : 0.07, shadowRadius: 14, elevation: 4 },
});
