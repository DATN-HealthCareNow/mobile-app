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
import Svg, { Circle, Path } from "react-native-svg";
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
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </View>
          <Text style={styles.title}>HealthCare Now</Text>
        </View>

        {/* <Feather name="settings" size={22} color="#0369a1" /> */}
      </View>

      {/* AI CARD */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.aiLabel}>✨ AI PREDICTIONS</Text>
          <Text style={styles.smallText}>● RLt.   ○ Mir.</Text>
        </View>

        <Text style={styles.cardTitle}>Multi-metric Health</Text>
        <Text style={styles.subTitle}>Vital Trends</Text>

        {/* Line Chart */}
        <Svg height="140" width="100%">
          <Path
            d="M10 100 Q 60 120 100 80 T 200 90 T 300 60"
            stroke="#0ea5e9"
            strokeWidth="3"
            fill="none"
          />
        </Svg>

        {/* Bottom stats */}
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.sectionTitle}>Sleep Quality</Text>
            <View style={styles.barRow}>
              <View style={[styles.bar, { height: 60 }]} />
              <View style={[styles.barLight, { height: 40 }]} />
              <View style={[styles.barMid, { height: 70 }]} />
              <View style={[styles.barLight, { height: 90 }]} />
            </View>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Stress Level</Text>
            <View style={styles.gauge}>
              <Text style={styles.gaugeText}>Low</Text>
            </View>
          </View>
        </View>
      </View>

      {/* REMINDER SECTION */}
      <LinearGradient
        colors={["#1d9bd1", "#0e7490"]}
        style={styles.reminderContainer}
      >
        <Text style={styles.reminderTitle}>REMINDERS</Text>

        <View style={styles.reminderCard}>
          <View style={styles.iconBox}>
            <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
          </View>
          <View>
            <Text style={styles.reminderHeading}>Take Medication</Text>
            <Text style={styles.reminderSub}>
              8:00 AM - Blood Pressure Meds
            </Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.iconBox}>
            <MaterialIcons name="directions-run" size={24} color="#0ea5e9" />
          </View>
          <View>
            <Text style={styles.reminderHeading}>Workout Session</Text>
            <Text style={styles.reminderSub}>
              5:00 PM - Cardio
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ===== SECOND PART ===== */}

      {/* STEPS */}
      <View style={styles.metricCard}>
        <CardHeader icon="directions-walk" title="Steps" subtitle="Last 7 Days" />
        <View style={styles.barRowLarge}>
          {renderBars([40, 70, 85, 55, 100, 80, 45], "#0ea5e9")}
        </View>
      </View>

      {/* SLEEP ANALYSIS */}
      <View style={styles.metricCard}>
        <CardHeader icon="bedtime" title="Sleep Analysis" subtitle="AI Prediction" />
        <Svg height="140" width="100%">
          <Path
            d="M10 100 Q 60 120 100 80 T 200 70 T 300 90"
            stroke="#7c3aed"
            strokeWidth="3"
            fill="none"
          />
          <Circle cx="200" cy="70" r="5" fill="#7c3aed" />
        </Svg>
      </View>

      {/* HYDRATION */}
      <TouchableOpacity 
        style={styles.metricCard}
        onPress={() => router.push("/screen/hydration")}
      >
        <CardHeader icon="water-drop" title="Hydration" subtitle="Daily Goal: 2.5L" />
        <View style={styles.barRowLarge}>
          {renderBars([40, 60, 90, 65, 80, 95, 45], "#14b8a6")}
        </View>
      </TouchableOpacity>

      {/* KCAL */}
      <View style={[styles.metricCard, { marginBottom: 120 }]}>
        <CardHeader icon="local-fire-department" title="Kcal Burned" subtitle="Goal: 2,400" />
        <View style={styles.barRowLarge}>
          {renderBars([50, 90, 80, 65, 110, 85, 45], "#f97316")}
        </View>
      </View>
    </ScrollView>
  );
}

/* REUSABLE HEADER */
const CardHeader = ({ icon, title, subtitle }: any) => (
  <View style={styles.metricHeader}>
    <MaterialIcons name={icon} size={22} color="#0ea5e9" />
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricSub}>{subtitle}</Text>
    </View>
  </View>
);

/* BAR GENERATOR */
const renderBars = (data: number[], color: string) =>
  data.map((h, i) => (
    <View
      key={i}
      style={[
        styles.largeBar,
        { height: h, backgroundColor: color },
      ]}
    />
  ));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf3f8",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0369a1",
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  aiLabel: {
    color: "#0ea5e9",
    fontWeight: "600",
  },

  smallText: {
    color: "#94a3b8",
    fontSize: 12,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    color: "#1e293b",
  },

  subTitle: {
    marginTop: 12,
    marginBottom: 10,
    color: "#64748b",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },

  barRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
  },

  bar: {
    width: 14,
    backgroundColor: "#0ea5e9",
    borderRadius: 6,
    marginRight: 6,
  },

  barLight: {
    width: 14,
    backgroundColor: "#bae6fd",
    borderRadius: 6,
    marginRight: 6,
  },

  barMid: {
    width: 14,
    backgroundColor: "#38bdf8",
    borderRadius: 6,
    marginRight: 6,
  },

  gauge: {
    marginTop: 12,
    width: 120,
    height: 60,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    backgroundColor: "#bae6fd",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },

  gaugeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },

  reminderContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 30,
    padding: 20,
  },

  reminderTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  reminderCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#e0f2fe",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  reminderHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },

  reminderSub: {
    color: "#64748b",
    marginTop: 4,
  },

  /* SECOND PART */
  metricCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 30,
    padding: 20,
  },

  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  metricTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },

  metricSub: {
    fontSize: 13,
    color: "#38bdf8",
    marginTop: 4,
  },

  barRowLarge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },

  largeBar: {
    width: 20,
    borderRadius: 12,
  },
});