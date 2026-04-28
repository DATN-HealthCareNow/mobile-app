import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { axiosClient } from "../../api/axiosClient";
import { Typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";
import { useHealthInsights, useHealthChat, HealthInsightResponse, ChatMessage } from "../../hooks/useHealthInsights";
import { useWeeklyReport } from "../../hooks/useDailyHealthMetric";
import { useProfile } from "../../hooks/useUser";
import { useSession } from "../../hooks/useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const CHAT_HISTORY_KEY = "ai_chat_history_v2";
const MAX_STORED_MESSAGES = 50;
const MAX_CONTEXT_TURNS = 10; // How many past turns we send to AI

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function buildAgeFromDob(dob?: string): number {
  if (!dob) return 25;
  const birth = new Date(dob);
  const age = new Date().getFullYear() - birth.getFullYear();
  return isNaN(age) ? 25 : Math.max(10, age);
}

// ── Bubble Components ─────────────────────────────────────────────────────────

function AiBubble({ text, timestamp, colors, isDark }: any) {
  return (
    <View style={{ marginBottom: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 16 }}>
        {/* Avatar */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDark ? "#1e3a5f" : "#e0f2fe",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <MaterialCommunityIcons name="brain" size={16} color="#0ea5e9" />
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 20,
            borderBottomLeftRadius: 6,
            padding: 14,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#e2e8f0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.15 : 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 15, color: isDark ? "#f1f5f9" : "#0f172a", lineHeight: 22, ...Typography.body }}>
            {text}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 60, marginTop: 4, paddingHorizontal: 16 }}>
        {formatTime(timestamp)}
      </Text>
    </View>
  );
}

function UserBubble({ text, timestamp, colors }: any) {
  return (
    <View style={{ marginBottom: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16 }}>
        <View
          style={{
            maxWidth: "80%",
            backgroundColor: "#1497dd",
            borderRadius: 20,
            borderBottomRightRadius: 6,
            padding: 14,
            shadowColor: "#1497dd",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 15, color: "#fff", lineHeight: 22, ...Typography.body }}>{text}</Text>
        </View>
      </View>
      <Text
        style={{ fontSize: 11, color: colors.textSecondary, textAlign: "right", marginTop: 4, paddingHorizontal: 16 }}
      >
        {formatTime(timestamp)} ✓✓
      </Text>
    </View>
  );
}

function TypingBubble({ isDark }: { isDark: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 16, marginBottom: 12 }}>
      <View
        style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: isDark ? "#1e3a5f" : "#e0f2fe",
          justifyContent: "center", alignItems: "center",
        }}
      >
        <MaterialCommunityIcons name="brain" size={16} color="#0ea5e9" />
      </View>
      <View
        style={{
          backgroundColor: isDark ? "#1e293b" : "#fff",
          borderRadius: 20, borderBottomLeftRadius: 6,
          padding: 14, borderWidth: 1, borderColor: isDark ? "#334155" : "#e2e8f0",
        }}
      >
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const { token } = useSession();
  const { data: profile } = useProfile(token);

  // ── Data for AI Context ───────────────────────────────────────────────────
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const sevenDaysAgo = (() => {
    const d = new Date(); d.setDate(d.getDate() - 6);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  })();

  const { data: rawInsight } = useHealthInsights();
  const aiData = rawInsight as HealthInsightResponse | undefined;
  const { data: weeklyData } = useWeeklyReport(sevenDaysAgo, today);

  // ── Local state ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Sức khỏe của tôi tuần này như thế nào?",
    "Tôi nên vận động bao nhiêu mỗi ngày?",
    "Nhịp tim trung bình của tôi có bình thường không?",
    "Tôi có đang đạt mục tiêu bước chân không?",
    "Tôi nên ăn gì để giảm cân hiệu quả?",
  ]);

  const flatListRef = useRef<FlatList>(null);
  const { mutateAsync: sendChat, isPending: isTyping } = useHealthChat();

  // ── Persist: load from SecureStore ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await SecureStore.getItemAsync(CHAT_HISTORY_KEY);
        if (raw) {
          const parsed: LocalMessage[] = JSON.parse(raw);
          setMessages(parsed.slice(-MAX_STORED_MESSAGES));
          // Load last suggested questions if any saved
        }
      } catch (e) {
        console.log("[Chat] Failed to load history:", e);
      }
    };
    load();
  }, []);

  // ── Persist: save to SecureStore ─────────────────────────────────────────
  const saveHistory = useCallback(async (msgs: LocalMessage[]) => {
    try {
      const trimmed = msgs.slice(-MAX_STORED_MESSAGES);
      await SecureStore.setItemAsync(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.log("[Chat] Failed to save history:", e);
    }
  }, []);

  // ── Build full analytics context for AI ──────────────────────────────────
  const analyticsContext = useMemo(() => {
    // Weekly metrics summary
    const weekSummary = weeklyData?.slice(-7).map((d) => ({
      date: d.date_string ?? d.date_string_local,
      steps: d.metrics?.steps ?? 0,
      calories: (Number(d.metrics?.active_calories ?? 0) + Number((d.metrics as any)?.google_active_calories ?? 0)),
      exercise_minutes: (Number(d.metrics?.exercise_minutes ?? 0) + Number(d.metrics?.google_exercise_minutes ?? 0)),
      heart_rate: d.metrics?.heart_rate ?? null,
      sleep_minutes: d.metrics?.sleep_minutes ?? null,
    })) ?? [];

    return {
      bmi: aiData?.analytics?.bmi ?? null,
      bmi_category: aiData?.analytics?.bmi_category ?? null,
      bmr: aiData?.analytics?.bmr ?? null,
      tdee: aiData?.analytics?.tdee ?? null,
      activity_level: aiData?.analytics?.activity_level ?? "UNKNOWN",
      trends: aiData?.analytics?.trends ?? null,
      stats: aiData?.analytics?.stats ?? null,
      advanced: aiData?.analytics?.advanced ?? null,
      weekly_data: weekSummary,
      prediction: aiData?.insight?.prediction ?? null,
      insight_summary: aiData?.insight?.summary ?? null,
      risks: aiData?.insight?.risks ?? [],
      recommendations: aiData?.insight?.recommendations ?? [],
    };
  }, [aiData, weeklyData]);

  // ── Fetch active medical records + recent meal macros ────────────────────
  const [medicalContext, setMedicalContext] = useState<any[]>([]);
  const [mealContext, setMealContext] = useState<any>(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [medRes, mealRes] = await Promise.allSettled([
          axiosClient.get("/api/v1/medical-records"),
          axiosClient.get("/api/v1/meals/macros"),
        ]);

        if (medRes.status === "fulfilled") {
          const list = Array.isArray(medRes.value) ? medRes.value : (medRes.value as any)?.data ?? [];
          const active = list.filter((r: any) => r.status !== "EXPIRED").map((r: any) => ({
            diagnosis: r.diagnosis || r.title || "Unknown",
            status: r.status ?? "ACTIVE",
            medications: (r.medications ?? []).map((m: any) => m.name).slice(0, 5),
          }));
          setMedicalContext(active);
        }

        if (mealRes.status === "fulfilled") {
          setMealContext(mealRes.value);
        }
      } catch (e) {
        console.log("[Chat] Context fetch error:", e);
      }
    };
    fetchContext();
  }, []);

  // ── Auto Scroll on new messages ──────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: LocalMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    try {
      // Build conversation history for AI (last N turns)
      const historyForAI: ChatMessage[] = newMessages
        .slice(-MAX_CONTEXT_TURNS * 2)
        .map((m) => ({ role: m.role, content: m.content }));

      const age = buildAgeFromDob(profile?.date_of_birth ?? profile?.dateOfBirth);
      const gender = profile?.gender === "MALE" || profile?.gender === "male" ? 1 : 0;

      const payload = {
        user_profile: {
          age,
          gender,
          height_cm: Number(profile?.height ?? profile?.heightCm ?? 170),
          weight_kg: Number(profile?.weight ?? profile?.weightKg ?? 65),
          language: "vi",
        },
        analytics_context: {
          ...analyticsContext,
          medical_records: medicalContext,
          recent_meal_macros: mealContext,
        },
        conversation_history: historyForAI.slice(0, -1),
        message: trimmed,
      };

      console.log("[Chat] Sending payload:", JSON.stringify({
        user_profile: payload.user_profile,
        bmi_in_context: (payload.analytics_context as any).bmi,
        weekly_data_count: (payload.analytics_context as any).weekly_data?.length,
        message: payload.message,
      }));

      const response = await sendChat(payload);

      console.log("[Chat] Got response:", response.reply?.substring(0, 100));


      const aiMsg: LocalMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: Date.now(),
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);

      if (response.suggested_questions?.length > 0) {
        setSuggestedQuestions(response.suggested_questions);
      }
    } catch (e: any) {
      console.error("[Chat] API error:", e?.response?.data ?? e?.message ?? e);
      const errDetail = e?.response?.data?.message || e?.message || "Unknown error";
      const errMsg: LocalMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: `Xin lỗi, có lỗi xảy ra: ${errDetail}\n\nVui lòng thử lại hoặc kiểm tra kết nối mạng nhé! 🙏`,
        timestamp: Date.now(),
      };
      const finalMessages = [...newMessages, errMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    }
  }, [messages, isTyping, profile, analyticsContext, medicalContext, mealContext, sendChat, saveHistory]);

  // ── Clear history ─────────────────────────────────────────────────────────
  const handleClearHistory = () => {
    Alert.alert("Clear Chat", "Xóa toàn bộ lịch sử chat?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setMessages([]);
          setSuggestedQuestions([
            "Sức khỏe của tôi tuần này như thế nào?",
            "Tôi nên vận động bao nhiêu mỗi ngày?",
            "Nhịp tim trung bình có bình thường không?",
            "Tôi có đang đạt mục tiêu bước chân không?",
            "Tôi nên ăn gì để giảm cân hiệu quả?",
          ]);
          await SecureStore.deleteItemAsync(CHAT_HISTORY_KEY);
        },
      },
    ]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // Group messages by date for date separators
  const grouped = useMemo(() => {
    const items: Array<{ type: "date"; label: string } | LocalMessage> = [];
    let lastDate = "";
    for (const msg of messages) {
      const d = formatDate(msg.timestamp);
      if (d !== lastDate) {
        items.push({ type: "date", label: d });
        lastDate = d;
      }
      items.push(msg);
    }
    return items;
  }, [messages]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item.type === "date") {
        return (
          <View style={{ alignSelf: "center", marginVertical: 12 }}>
            <View
              style={{
                backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#e2e8f0",
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: "600" }}>
                {item.label}
              </Text>
            </View>
          </View>
        );
      }
      if (item.role === "user") {
        return <UserBubble text={item.content} timestamp={item.timestamp} colors={colors} />;
      }
      return <AiBubble text={item.content} timestamp={item.timestamp} colors={colors} isDark={isDark} />;
    },
    [colors, isDark],
  );

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ["#0d1c2e", "#12263d"] : ["#f0f9ff", "#ffffff"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.aiBadge}>
            <MaterialCommunityIcons name="brain" size={20} color="#0ea5e9" />
          </View>
          <View>
            <Text style={styles.title}>
              <Text style={{ color: "#0f3f67" }}>AI </Text>
              <Text style={{ color: "#1497dd" }}>Health Coach</Text>
            </Text>
            <Text style={styles.online}>● Online · Powered by Gemini</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClearHistory} style={styles.menuBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* CHAT LIST - flex:1 fills space between header and inputArea */}
      <FlatList
        ref={flatListRef}
        data={grouped}
        keyExtractor={(item, i) => (item as any).id ?? `sep_${i}`}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LinearGradient
              colors={isDark ? ["#1e3a5f", "#1e293b"] : ["#e0f2fe", "#f0f9ff"]}
              style={styles.emptyIconBg}
            >
              <MaterialCommunityIcons name="chat-processing-outline" size={40} color="#0ea5e9" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Xin chào! Tôi là AI Health Coach</Text>
            <Text style={styles.emptySubtitle}>
              Tôi đã được trang bị toàn bộ dữ liệu sức khỏe của bạn.{"\n"}
              Hãy hỏi tôi bất cứ điều gì về sức khỏe của bạn!
            </Text>
            <View style={styles.featureRow}>
              {[
                { icon: "run", label: "Vận động" },
                { icon: "heart-pulse", label: "Nhịp tim" },
                { icon: "chart-line", label: "Xu hướng" },
                { icon: "medical-bag", label: "Sức khỏe" },
              ].map((f) => (
                <View key={f.label} style={[styles.featureChip, { backgroundColor: isDark ? "#1e3a5f" : "#e0f2fe" }]}>
                  <MaterialCommunityIcons name={f.icon as any} size={16} color="#0ea5e9" />
                  <Text style={{ fontSize: 11, color: "#0ea5e9", fontWeight: "600", marginTop: 4 }}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>
        }
        ListFooterComponent={isTyping ? <TypingBubble isDark={isDark} /> : null}
      />

      {/* INPUT AREA - absolute, floats above tab bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 104 : 0}
        style={styles.inputAreaWrapper}
      >
        <View style={styles.inputArea}>
          {/* Suggested Questions Chips */}
          {suggestedQuestions.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
              keyboardShouldPersistTaps="handled"
            >
              {suggestedQuestions.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, { backgroundColor: isDark ? "#1e3a5f" : "#e0f2fe" }]}
                  onPress={() => handleSend(q)}
                  disabled={isTyping}
                >
                  <Text style={[styles.chipText, { color: isDark ? "#38bdf8" : "#0369a1" }]} numberOfLines={1}>
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Hỏi về sức khỏe của bạn..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => handleSend(input)}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isTyping) && { opacity: 0.5 }]}
              onPress={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#1e293b" : "#e2e8f0",
    },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    aiBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "#1e3a5f" : "#e0f2fe",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      ...Typography.brandTitle,
      fontSize: 18,
      fontWeight: "700",
    },
    online: {
      fontSize: 12,
      color: "#22c55e",
      marginTop: 2,
      fontWeight: "600",
    },
    menuBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
      justifyContent: "center",
      alignItems: "center",
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 30,
      paddingVertical: 40,
      justifyContent: "center",
    },
    emptyIconBg: {
      width: 90,
      height: 90,
      borderRadius: 45,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    emptyTitle: {
      ...Typography.heading,
      fontSize: 20,
      fontWeight: "800",
      color: isDark ? "#f8fafc" : "#0f172a",
      textAlign: "center",
      marginBottom: 10,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },
    featureRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    featureChip: {
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      minWidth: 70,
    },
    inputAreaWrapper: {
      position: "absolute",
      bottom: 104, // Tab bar height (92) + margin (12)
      left: 0,
      right: 0,
    },
    inputArea: {
      borderTopWidth: 1,
      borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
      backgroundColor: isDark ? "#0d1b2acc" : "#ffffffee",
      paddingBottom: Platform.OS === "ios" ? 12 : 8,
    },
    chipsRow: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      flexDirection: "row",
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      maxWidth: 220,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "600",
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingTop: 4,
      gap: 8,
    },
    input: {
      flex: 1,
      backgroundColor: isDark ? "#1e293b" : "#f8fafc",
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      color: colors.text,
      fontSize: 15,
      maxHeight: 120,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#e2e8f0",
    },
    sendBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#1497dd",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#1497dd",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    },
  });