import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Chat() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle} />
            <View>
              <Text style={styles.title}>HealthCare Now</Text>
              <Text style={styles.online}>● AI Assistant Online</Text>
            </View>
          </View>
          <Ionicons name="ellipsis-horizontal" size={22} color="#64748b" />
        </View>

        {/* TIME */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>Today, 9:41 AM</Text>
        </View>

        {/* AI MESSAGE */}
        <View style={styles.aiBubble}>
          <Text style={styles.messageText}>
            Good morning! I've analyzed your sleep patterns from last night.
            It looks like you had 6 hours of deep sleep. How are you feeling?
          </Text>
        </View>
        <Text style={styles.smallTime}>9:41 AM</Text>

        {/* USER MESSAGE */}
        <View style={styles.userBubble}>
          <Text style={styles.userText}>
            I feel a bit groggy actually. Is there anything I should change in
            my routine?
          </Text>
        </View>
        <Text style={[styles.smallTime, { alignSelf: "flex-end" }]}>
          9:42 AM ✓✓
        </Text>

        {/* AI SUGGESTIONS */}
        <View style={styles.aiBubble}>
          <Text style={styles.messageText}>
            Based on your metrics, here are a few quick suggestions:
          </Text>

          <View style={styles.suggestionRow}>
            <View style={styles.sunIcon}>
              <Ionicons name="sunny" size={18} color="#f97316" />
            </View>
            <Text style={styles.suggestionText}>
              Get 10 mins of sunlight now
            </Text>
          </View>

          <View style={styles.suggestionRow}>
            <View style={styles.waterIcon}>
              <Ionicons name="water" size={18} color="#3b82f6" />
            </View>
            <Text style={styles.suggestionText}>
              Drink 500ml of water
            </Text>
          </View>
        </View>

        <Text style={styles.smallTime}>Just now</Text>
      </ScrollView>

      {/* INPUT BAR */}
      <View style={styles.inputBar}>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={28} color="#94a3b8" />
        </TouchableOpacity>

        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity>
          <Ionicons name="mic" size={22} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0ea5e9",
    marginRight: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  online: {
    fontSize: 12,
    color: "#22c55e",
    marginTop: 2,
  },

  timeContainer: {
    alignSelf: "center",
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },

  timeText: {
    fontSize: 12,
    color: "#475569",
  },

  aiBubble: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 20,
    marginBottom: 8,
  },

  messageText: {
    fontSize: 15,
    color: "#0f172a",
    lineHeight: 22,
  },

  userBubble: {
    backgroundColor: "#0ea5e9",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: "flex-end",
  },

  userText: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
  },

  smallTime: {
    fontSize: 12,
    color: "#94a3b8",
    marginHorizontal: 25,
    marginBottom: 15,
  },

  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  sunIcon: {
    backgroundColor: "#fed7aa",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },

  waterIcon: {
    backgroundColor: "#bfdbfe",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },

  suggestionText: {
    fontSize: 14,
    color: "#0f172a",
  },

  inputBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    width: "100%",
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  sendButton: {
    backgroundColor: "#0ea5e9",
    padding: 10,
    borderRadius: 20,
    marginLeft: 5,
  },
});