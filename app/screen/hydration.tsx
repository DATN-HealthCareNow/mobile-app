import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useWaterProgress, useLogWater } from "../../hooks/useWaterIntake";

export default function Hydration() {
  const router = useRouter();
  const { data: progressData, isLoading } = useWaterProgress();
  const { mutate: logWater } = useLogWater();

  const percent = progressData?.progress_percent || 0;
  const current = progressData?.total_today_ml || 0;
  const goal = progressData?.goal_ml || 2500;

  const handleQuickAdd = (amount: number) => {
    logWater({ amount_ml: amount, adjustment_reason: "Quick Add" });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.brandText}>PHOENIX HEALTH</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="water" size={16} color="#3b82f6" />
              <Text style={styles.title}> Hydration</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* DATE */}
        <View style={styles.datePill}>
          <Text style={styles.dateText}>Today, 14 Oct</Text>
        </View>

        {/* WATER TANK */}
        <View style={styles.tankWrapper}>
          <View style={styles.tankGlow} />
          <View style={styles.tank}>
            <View style={[styles.waterFill, { height: `${percent}%` }]}>
              <LinearGradient
                colors={["#60a5fa", "#2563eb"]}
                style={StyleSheet.absoluteFill}
              />
              <Svg
                width="100%"
                height="100"
                viewBox="0 0 400 100"
                style={styles.wave}
              >
                <Path
                  d="M0 50 Q 100 20 200 50 T 400 50 V100 H0 Z"
                  fill="#3b82f6"
                  opacity={0.7}
                />
              </Svg>
            </View>
            <View style={styles.percentOverlay}>
                <Text style={styles.percentText}>{percent}<Text style={{fontSize: 24}}>%</Text></Text>
            </View>
          </View>
        </View>

        {/* AMOUNT */}
        <Text style={styles.amount}>
          {current.toLocaleString()}{" "}
          <Text style={styles.ml}>ml</Text>
        </Text>
        <Text style={styles.goal}>Goal: {goal.toLocaleString()} ml</Text>

        {/* QUICK ADD */}
        <Text style={styles.sectionTitle}>QUICK ADD</Text>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => handleQuickAdd(250)}>
            <Ionicons name="water-outline" size={20} color="#94a3b8" />
            <Text style={styles.quickText}>+ 250ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCardPrimary} onPress={() => handleQuickAdd(500)}>
            <Ionicons name="water" size={24} color="#fff" />
            <Text style={styles.quickTextPrimary}>+ 500ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard}>
            <Ionicons name="add" size={20} color="#94a3b8" />
            <Text style={styles.quickText}>Custom</Text>
          </TouchableOpacity>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={styles.activityContainer}>
            {[
            { title: "Water", time: "10:30 AM", amount: "+ 250ml", icon: "water" },
            { title: "Glass of Water", time: "08:15 AM", amount: "+ 250ml", icon: "beaker" },
            { title: "Tea", time: "07:00 AM", amount: "+ 200ml", icon: "cafe" },
            ].map((item, index) => (
            <View key={index} style={styles.activityCard}>
                <View style={styles.activityLeft}>
                    <View style={styles.activityIcon}>
                        <Ionicons name={item.icon as any} size={18} color="#60a5fa" />
                    </View>
                    <View>
                        <Text style={styles.activityTitle}>{item.title}</Text>
                        <Text style={styles.activityTime}>{item.time}</Text>
                    </View>
                </View>
                <Text style={styles.activityAmount}>{item.amount}</Text>
            </View>
            ))}
        </View>
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  datePill: {
    alignSelf: "center",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  dateText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "600",
  },
  tankWrapper: {
    alignItems: "center",
    marginTop: 40,
    position: "relative",
  },
  tankGlow: {
    position: "absolute",
    width: 220,
    height: 380,
    borderRadius: 110,
    backgroundColor: "#2563eb",
    opacity: 0.15,
    shadowColor: "#2563eb",
    shadowRadius: 50,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  tank: {
    width: 220,
    height: 380,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "flex-end",
  },
  waterFill: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  wave: {
    position: "absolute",
    top: -25,
  },
  percentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  percentText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#fff",
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#fff",
    marginTop: 30,
  },
  ml: {
    fontSize: 18,
    color: "#94a3b8",
  },
  goal: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 4,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: "#64748b",
    marginBottom: 15,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  quickCardPrimary: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#3b82f6",
    shadowRadius: 15,
    shadowOpacity: 0.4,
    elevation: 5,
  },
  quickText: {
    color: "#cbd5e1",
    marginTop: 8,
    fontWeight: "600",
  },
  quickTextPrimary: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "bold",
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAll: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 13,
  },
  activityContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginTop: 10,
  },
  activityCard: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f8fafc",
  },
  activityTime: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  activityAmount: {
    color: "#60a5fa",
    fontWeight: "bold",
  },
});