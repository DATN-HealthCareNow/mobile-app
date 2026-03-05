import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Image
              source={require("@/assets/images/logo.jpg")}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
          </View>
          <Text style={styles.title}>PHOENIX HEALTH</Text>
        </View>
      </View>

      {/* QUICK MANAGEMENT */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Tracking</Text>
      </View>

      <View style={styles.managementGrid}>
        {/* SLEEP MANAGEMENT */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/sleep")}
        >
          <View style={[styles.iconBox, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
            <Ionicons name="moon" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.manageCardTitle}>Sleep</Text>
          <Text style={styles.manageCardSub}>8h Goal</Text>
        </TouchableOpacity>

        {/* HYDRATION MANAGEMENT */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/hydration")}
        >
          <View style={[styles.iconBox, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
            <Ionicons name="water" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.manageCardTitle}>Hydration</Text>
          <Text style={styles.manageCardSub}>2.5L Goal</Text>
        </TouchableOpacity>

        {/* MEAL SCHEDULE & AI */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/meal_schedule")}
        >
          <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
            <MaterialIcons name="restaurant" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.manageCardTitle}>Meals</Text>
          <Text style={styles.manageCardSub}>AI Planner</Text>
        </TouchableOpacity>
      </View>

      {/* REMINDER SECTION */}
      <LinearGradient
        colors={["#1e3a8a", "#1e40af"]}
        style={styles.reminderContainer}
      >
        <Text style={styles.reminderTitle}>UPCOMING TASKS</Text>

        <View style={styles.reminderCard}>
          <View style={styles.reminderIconBox}>
            <Ionicons name="medical" size={20} color="#60a5fa" />
          </View>
          <View>
            <Text style={styles.reminderHeading}>Take Medication</Text>
            <Text style={styles.reminderSub}>
              8:00 AM - Blood Pressure Meds
            </Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderIconBox}>
            <MaterialIcons name="directions-run" size={20} color="#60a5fa" />
          </View>
          <View>
            <Text style={styles.reminderHeading}>Workout Session</Text>
            <Text style={styles.reminderSub}>5:00 PM - Cardio</Text>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f8fafc",
    letterSpacing: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#f8fafc",
    letterSpacing: 1,
  },
  managementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  manageCard: {
    width: "31%",
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  manageCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  manageCardSub: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
  },
  reminderContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 24,
    padding: 20,
    marginBottom: 120,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  reminderTitle: {
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 2,
  },
  reminderCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  reminderIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  reminderHeading: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f8fafc",
  },
  reminderSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
});
