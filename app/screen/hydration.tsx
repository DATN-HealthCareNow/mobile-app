import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

export default function Hydration() {
  const router = useRouter();

  const percent = 60;
  const current = 1500;
  const goal = 2500;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Text style={styles.icon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Hydration</Text>

        <TouchableOpacity style={styles.circleBtn}>
          <Text style={styles.icon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* DATE */}
      <View style={styles.datePill}>
        <View style={styles.dot} />
        <Text style={styles.dateText}>Today, 14 Oct</Text>
      </View>

      {/* WATER TANK */}
      <View style={styles.tankWrapper}>
        <View style={styles.tank}>
          
          {/* Water */}
          <View style={[styles.waterFill, { height: `${percent}%` }]}>
            <LinearGradient
              colors={["#6EA8FF", "#2F6BFF"]}
              style={StyleSheet.absoluteFill}
            />

            {/* Wave */}
            <Svg
              width="100%"
              height="100"
              viewBox="0 0 400 100"
              style={styles.wave}
            >
              <Path
                d="M0 50 Q 100 20 200 50 T 400 50 V100 H0 Z"
                fill="#5D95FF"
                opacity={0.7}
              />
            </Svg>

            <Text style={styles.percentText}>{percent}%</Text>
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
        <TouchableOpacity style={styles.quickCard}>
          <Text style={styles.quickText}>+ 250ml</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCardPrimary}>
          <Text style={styles.quickTextPrimary}>+ 500ml</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard}>
          <Text style={styles.quickText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* RECENT ACTIVITY */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      {[
        { title: "Water", time: "10:30 AM", amount: "+ 250ml" },
        { title: "Glass of Water", time: "08:15 AM", amount: "+ 250ml" },
        { title: "Tea", time: "07:00 AM", amount: "+ 200ml" },
      ].map((item, index) => (
        <View key={index} style={styles.activityCard}>
          <View>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
          <Text style={styles.activityAmount}>{item.amount}</Text>
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F8",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },

  circleBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  icon: {
    fontSize: 18,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
  },

  datePill: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#5D95FF",
    borderRadius: 4,
    marginRight: 8,
  },

  dateText: {
    color: "#555",
  },

  tankWrapper: {
    alignItems: "center",
    marginTop: 30,
  },

  tank: {
    width: 260,
    height: 420,
    borderRadius: 130,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#E6ECF5",
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
    top: -30,
  },

  percentText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },

  amount: {
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
  },

  ml: {
    fontSize: 22,
    color: "#2F6BFF",
  },

  goal: {
    textAlign: "center",
    color: "#888",
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 14,
    letterSpacing: 1,
    color: "#8A97A8",
    marginBottom: 15,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
  },

  quickCardPrimary: {
    flex: 1,
    backgroundColor: "#2F6BFF",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
  },

  quickText: {
    color: "#333",
  },

  quickTextPrimary: {
    color: "#fff",
    fontWeight: "600",
  },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewAll: {
    color: "#2F6BFF",
  },

  activityCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  activityTime: {
    color: "#888",
    marginTop: 4,
  },

  activityAmount: {
    color: "#2F6BFF",
    fontWeight: "600",
  },
});