import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Analysis() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="analytics" size={50} color="#0ea5e9" />
      </View>

      <Text style={styles.title}>Analysis</Text>

      <Text style={styles.subtitle}>
        Detailed health insights and reports will appear here.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming Soon 🚀</Text>
        <Text style={styles.cardText}>
          We're preparing powerful analytics including:
        </Text>

        <Text style={styles.listItem}>• Sleep Quality Report</Text>
        <Text style={styles.listItem}>• Activity Performance</Text>
        <Text style={styles.listItem}>• Weekly Health Score</Text>
        <Text style={styles.listItem}>• AI-based Recommendations</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 30,
  },

  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#0f172a",
  },

  cardText: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 15,
  },

  listItem: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
  },
});