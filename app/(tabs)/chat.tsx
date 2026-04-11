import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Typography } from "../../constants/typography";

export default function Chat() {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ["#0d1c2e", "#12263d"] : ["#f5faff", colors.background]}
        style={styles.heroBg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.title}>
                <Text style={{ color: "#0f3f67" }}>HealthCare </Text>
                <Text style={{ color: "#1497dd" }}>Now</Text>
              </Text>
              <Text style={styles.online}>● AI Assistant Online</Text>
            </View>
          </View>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
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
          placeholderTextColor={colors.textSecondary}
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

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  heroBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 180,
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

  logoImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },

  title: {
    ...Typography.brandTitle,
    fontSize: 20,
    fontWeight: "700",
  },

  online: {
    fontSize: 12,
    color: isDark ? "#6bd1a2" : "#22c55e",
    marginTop: 2,
  },

  timeContainer: {
    alignSelf: "center",
    backgroundColor: isDark ? "#1a334d" : "#eaf1f8",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },

  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  aiBubble: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  messageText: {
    ...Typography.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },

  userBubble: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 24,
    marginBottom: 8,
    alignSelf: "flex-end",
    maxWidth: "82%",
  },

  userText: {
    ...Typography.body,
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
  },

  smallTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 25,
    marginBottom: 15,
  },

  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  sunIcon: {
    backgroundColor: isDark ? "rgba(245, 158, 11, 0.18)" : "#ffedd5",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },

  waterIcon: {
    backgroundColor: isDark ? "rgba(59, 130, 246, 0.18)" : "#dbeafe",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },

  suggestionText: {
    fontSize: 14,
    color: colors.text,
  },

  inputBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: isDark ? "#1a334d" : "#f3f8fd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: colors.text,
  },

  sendButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
    marginLeft: 5,
  },
});