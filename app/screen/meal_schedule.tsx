import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SAMPLE_AI_MEAL_PLAN } from "../../constants/meals";
import { useTheme } from "../../context/ThemeContext";

export default function MealScheduleScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([
    {
      id: "1",
      sender: "ai",
      type: "text",
      text: "Hello! I am your AI Dietitian 🥗. To design your meals, tell me your goal, current weight, and any food allergies.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      type: "text",
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate AI thinking and generating a meal plan
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          type: "text",
          text: "Analyzing your metrics... Here is a personalized meal schedule designed just for you!",
        },
        {
          id: (Date.now() + 2).toString(),
          sender: "ai",
          type: "plan",
          plan: SAMPLE_AI_MEAL_PLAN,
        },
      ]);
    }, 1500);
  };

  const styles = createStyles(colors, isDark);

  const renderMessage = (msg: any) => {
    if (msg.sender === "user") {
      return (
        <View key={msg.id} style={styles.userMsgBlock}>
          <View style={styles.userMsgBubble}>
            <Text style={styles.userMsgText}>{msg.text}</Text>
          </View>
        </View>
      );
    }

    if (msg.type === "text") {
      return (
        <View key={msg.id} style={styles.aiMsgBlock}>
          <View style={styles.aiIconWrapper}>
            <Ionicons name="nutrition" size={20} color="#fff" />
          </View>
          <View style={styles.aiMsgBubble}>
            <Text style={styles.aiMsgText}>{msg.text}</Text>
          </View>
        </View>
      );
    }

    if (msg.type === "plan") {
      const p = msg.plan;
      return (
        <View key={msg.id} style={styles.planCard}>
          <Text style={styles.planTitle}>✨ Personalized Plan</Text>
          <View style={styles.macrosRow}>
            <MacroBox val={p.target_calories} lbl="Kcal" colors={colors} styles={styles} />
            <MacroBox val={`${p.target_protein}g`} lbl="Protein" colors={colors} styles={styles} />
            <MacroBox val={`${p.target_carbs}g`} lbl="Carbs" colors={colors} styles={styles} />
          </View>

          {p.meals.map((meal: any, idx: number) => (
            <View key={idx} style={styles.mealItem}>
              <View style={styles.mealHeaderRow}>
                <Text style={styles.mealType}>{meal.type}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealName}>
                {meal.name}{" "}
                <Text style={[styles.mealKcal, { color: colors.secondary }]}>({meal.calories} kcal)</Text>
              </Text>
              <Text style={styles.mealDesc}>{meal.description}</Text>
            </View>
          ))}
          <View style={styles.planNoteBox}>
            <Text style={styles.planNoteText}>💡 {p.ai_note}</Text>
          </View>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.applyBtnText}>Apply to Schedule</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>AI Meal Planner</Text>
          <Text style={styles.subtitle}>Powered by Healthcare AI</Text>
        </View>
        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="I weigh 70kg, want to build muscle..."
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          selectionColor={colors.secondary}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const MacroBox = ({ val, lbl, colors, styles }: any) => (
  <View style={[styles.macroBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
    <Text style={[styles.macroVal, { color: colors.secondary }]}>{val}</Text>
    <Text style={[styles.macroLbl, { color: colors.secondary }]}>{lbl}</Text>
  </View>
);

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: "700",
    letterSpacing: 1,
  },
  chatArea: {
    flex: 1,
  },
  userMsgBlock: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  userMsgBubble: {
    backgroundColor: colors.secondary,
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 5,
    maxWidth: "80%",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userMsgText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  aiMsgBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  aiIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  aiMsgBubble: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    maxWidth: "75%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiMsgText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    marginLeft: 46,
    borderWidth: 1,
    borderColor: colors.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 16,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  macroBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  macroVal: {
    fontSize: 16,
    fontWeight: "800",
  },
  macroLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  mealItem: {
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    paddingLeft: 16,
    marginBottom: 20,
  },
  mealHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  mealType: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mealTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  mealKcal: {
    fontSize: 13,
    fontWeight: "bold",
  },
  mealDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  planNoteBox: {
    backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  planNoteText: {
    fontSize: 13,
    color: colors.success,
    lineHeight: 20,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    height: 52,
    backgroundColor: colors.card,
    borderRadius: 26,
    paddingHorizontal: 20,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});
