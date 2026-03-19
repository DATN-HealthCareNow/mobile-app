import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useWaterProgress, useLogWater } from "../../hooks/useWaterIntake";
import { useTheme } from "../../context/ThemeContext";

export default function Hydration() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: progressData, isLoading } = useWaterProgress();
  const { mutate: logWater } = useLogWater();

  const percent = progressData?.progress_percent || 0;
  const current = progressData?.total_today_ml || 0;
  const goal = progressData?.goal_ml || 2500;

  const handleQuickAdd = (amount: number) => {
    logWater({ amount_ml: amount, adjustment_reason: "Quick Add" });
  };

  const styles = createStyles(colors, isDark);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoSmall}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandText}>HEALTHCARE NOW</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="water" size={14} color={colors.primary} />
                <Text style={styles.title}> Hydration</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
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
                colors={["#60a5fa", colors.primary]}
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
                  fill={isDark ? colors.background : "#FFF"}
                  opacity={0.2}
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
            <Ionicons name="water-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.quickText}>+ 250ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCardPrimary} onPress={() => handleQuickAdd(500)}>
            <Ionicons name="water" size={24} color="#fff" />
            <Text style={styles.quickTextPrimary}>+ 500ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard}>
            <Ionicons name="add" size={20} color={colors.textSecondary} />
            <Text style={styles.quickText}>Custom</Text>
          </TouchableOpacity>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
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
                        <Ionicons name={item.icon as any} size={18} color={colors.primary} />
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
        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  logoSmall: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  brandText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  datePill: {
    alignSelf: "center",
    backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.1)",
  },
  dateText: {
    color: isDark ? "#bfdbfe" : colors.primary,
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
    backgroundColor: colors.primary,
    opacity: 0.1,
    shadowColor: colors.primary,
    shadowRadius: 50,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  tank: {
    width: 200,
    height: 340,
    borderRadius: 100,
    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
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
    color: isDark ? "#fff" : colors.text,
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    marginTop: 30,
  },
  ml: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  goal: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: 16,
    marginLeft: 4,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickCardPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  quickText: {
    color: colors.text,
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
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  activityContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },
  activityCard: {
    padding: 16,
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
    borderRadius: 14,
    backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  activityTime: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  activityAmount: {
    color: colors.primary,
    fontWeight: "700",
  },
});