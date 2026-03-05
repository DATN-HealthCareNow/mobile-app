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

export default function MealScheduleScreen() {
  const router = useRouter();
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
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{p.target_calories}</Text>
              <Text style={styles.macroLbl}>Kcal</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{p.target_protein}g</Text>
              <Text style={styles.macroLbl}>Protein</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{p.target_carbs}g</Text>
              <Text style={styles.macroLbl}>Carbs</Text>
            </View>
          </View>

          {p.meals.map((meal: any, idx: number) => (
            <View key={idx} style={styles.mealItem}>
              <View style={styles.mealHeaderRow}>
                <Text style={styles.mealType}>{meal.type}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealName}>
                {meal.name}{" "}
                <Text style={styles.mealKcal}>({meal.calories} kcal)</Text>
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
          <Ionicons name="chevron-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>AI Meal Planner</Text>
          <Text style={styles.subtitle}>Powered by HealthCareNow</Text>
        </View>
        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#f8fafc" />
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
          placeholderTextColor="#64748b"
          value={input}
          onChangeText={setInput}
          selectionColor="#f59e0b"
          keyboardAppearance="dark"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
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
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
    letterSpacing: 1,
  },
  chatArea: {
    flex: 1,
  },
  userMsgBlock: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  userMsgBubble: {
    backgroundColor: "#f59e0b",
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 5,
    maxWidth: "80%",
  },
  userMsgText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  aiMsgBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  aiIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(244, 63, 94, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.5)",
  },
  aiMsgBubble: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    maxWidth: "75%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  aiMsgText: {
    color: "#f8fafc",
    fontSize: 15,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    marginLeft: 46,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
    marginBottom: 15,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  macroBox: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  macroVal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  macroLbl: {
    fontSize: 12,
    color: "#fcd34d",
  },
  mealItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#fbbf24",
    paddingLeft: 12,
    marginBottom: 16,
  },
  mealHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mealType: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  mealTime: {
    fontSize: 11,
    color: "#64748b",
  },
  mealName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 4,
  },
  mealKcal: {
    fontSize: 13,
    color: "#fbbf24",
    fontWeight: "bold",
  },
  mealDesc: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 18,
  },
  planNoteBox: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  planNoteText: {
    fontSize: 13,
    color: "#34d399",
    lineHeight: 20,
  },
  applyBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    paddingBottom: 30,
    backgroundColor: "#0B1120",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    height: 48,
    backgroundColor: "#1e293b",
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
