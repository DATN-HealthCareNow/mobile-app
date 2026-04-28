import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { Typography } from "../../../constants/typography";
import { useDailyHealthMetric } from "../../../hooks/useDailyHealthMetric";

import { useGoalStore } from "../../../store/goalStore";

export default function Activity() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { stepsGoal, caloriesGoal, setStepsGoal, setCaloriesGoal } = useGoalStore();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [tempSteps, setTempSteps] = useState(stepsGoal.toString());
  const [tempCalories, setTempCalories] = useState(caloriesGoal.toString());

  const handleSaveGoals = () => {
    const s = parseInt(tempSteps, 10);
    const c = parseInt(tempCalories, 10);
    if (!isNaN(s) && s > 0) setStepsGoal(s);
    if (!isNaN(c) && c > 0) setCaloriesGoal(c);
    setIsGoalModalOpen(false);
  };

  const handleOpenModal = () => {
    setTempSteps(stepsGoal.toString());
    setTempCalories(caloriesGoal.toString());
    setIsGoalModalOpen(true);
  };

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const { data: dailyHealth, isLoading: dailyHealthLoading } = useDailyHealthMetric(today);

  const styles = createStyles(colors, isDark);

  if (dailyHealthLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const metrics = dailyHealth?.metrics;
  const stepsToday = Number(metrics?.steps ?? 0);
  const activeCalories = Number(
    metrics?.active_calories ??
      (metrics as any)?.activeCalories ??
      0,
  ) + Number(
    (metrics as any)?.google_active_calories ??
      (metrics as any)?.googleActiveCalories ??
      0,
  );
  const totalCalories = Number(
    metrics?.total_calories ??
      (metrics as any)?.totalCalories ??
      0,
  );

  const ActivityItem = ({ icon, title, sub, color, onPress, colors }: any) => {
    return (
      <TouchableOpacity style={styles.activityCard} onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySub}>{sub}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ["#0d1c2e", "#12263d"] : ["#b9dbf5", "#d7ebfa", "#e7f2fb"]}
        style={styles.heroBg}
      />

      <ScrollView style={styles.scrollSurface} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              <Text style={{ color: "#0f3f67" }}>Activity </Text>
              <Text style={{ color: "#1497dd" }}>Hub</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={handleOpenModal}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          {/* Steps Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: isDark ? "#1e3a8a" : "#eff6ff" }]}>
                <MaterialCommunityIcons name="walk" size={24} color="#3b82f6" />
              </View>
              <View style={[styles.cardBadge, { backgroundColor: isDark ? "#064e3b" : "#dcfce7" }]}>
                <Text style={[styles.cardBadgeText, { color: "#22c55e" }]}>
                  {Math.round((stepsToday / (stepsGoal || 1)) * 100)}%
                </Text>
              </View>
            </View>
            <Text style={styles.cardLabel}>STEPS</Text>
            <Text style={styles.cardValue}>{stepsToday.toLocaleString()}</Text>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: "#3b82f6", width: `${Math.min((stepsToday / (stepsGoal || 1)) * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>

          {/* Calories Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: isDark ? "#7c2d12" : "#fff7ed" }]}>
                <MaterialCommunityIcons name="fire" size={24} color="#ea580c" />
              </View>
              <View style={[styles.cardBadge, { backgroundColor: isDark ? "#334155" : "#f1f5f9" }]}>
                <Text style={[styles.cardBadgeText, { color: isDark ? "#cbd5e1" : "#64748b" }]}>
                  Target {caloriesGoal >= 1000 ? (caloriesGoal/1000).toFixed(1) + 'k' : caloriesGoal}
                </Text>
              </View>
            </View>
            <Text style={styles.cardLabel}>BURNED</Text>
            <Text style={styles.cardValue}>
              {activeCalories.toLocaleString()} <Text style={styles.cardUnit}>kcal</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: "#ea580c", width: `${Math.min((activeCalories / (caloriesGoal || 1)) * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* START ACTIVITY */}
        <View style={styles.startHeader}>
          <Text style={styles.startTitle}>Start Activity</Text>
          <TouchableOpacity>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <ActivityItem
            icon="run"
            title="Running"
            sub="Outdoor"
            color="#0ea5e9"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "running" },
              })
            }
            colors={colors}
          />

          <ActivityItem
            icon="dumbbell"
            title="Gym"
            sub="Indoor"
            color="#6366f1"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "gym" },
              })
            }
            colors={colors}
          />

     

          <ActivityItem
            icon="human-handsup"
            title="Stretching"
            sub="Indoor"
            color="#8b5cf6"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "stretching" },
              })
            }
            colors={colors}
          />

          <ActivityItem
            icon="yoga"
            title="Yoga"
            sub="Indoor"
            color="#0ea5e9"
            onPress={() =>
              router.push({
                pathname: "/activity/[type]",
                params: { type: "yoga" },
              })
            }
            colors={colors}
          />
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FLOATING ACTION BUTTON FOR ADD SCHEDULE */}
      <TouchableOpacity 
          style={styles.fabBtn} 
          onPress={() => router.push("/screen/schedule_new" as any)}
      >
          <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* GOAL MODAL */}
      <Modal
        visible={isGoalModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGoalModalOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsGoalModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={[styles.modalContent, isDark && { backgroundColor: "#1e293b", borderColor: "#334155" }]}
              >
                <Text style={styles.modalTitle}>Set Daily Goals</Text>
                
                <Text style={styles.inputLabel}>Steps Goal</Text>
                <TextInput
                  style={[styles.modalInput, isDark && { backgroundColor: "#0f172a", color: "#fff", borderColor: "#334155" }]}
                  keyboardType="numeric"
                  value={tempSteps}
                  onChangeText={setTempSteps}
                  placeholder="e.g. 10000"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Calories Goal (kcal)</Text>
                <TextInput
                  style={[styles.modalInput, isDark && { backgroundColor: "#0f172a", color: "#fff", borderColor: "#334155" }]}
                  keyboardType="numeric"
                  value={tempCalories}
                  onChangeText={setTempCalories}
                  placeholder="e.g. 500"
                  placeholderTextColor={colors.textSecondary}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: isDark ? "#334155" : "#f1f5f9" }]} 
                    onPress={() => setIsGoalModalOpen(false)}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSaveGoals}>
                    <Text style={[styles.modalBtnText, { color: "#fff" }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollSurface: {
      flex: 1,
      backgroundColor: "transparent",
    },
    heroBg: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoImage: {
      width: 40,
      height: 40,
      marginRight: 12,
    },
    title: {
      ...Typography.brandTitle,
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    card: {
      width: "48%",
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    cardIconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    cardBadgeText: {
      fontSize: 10,
      fontWeight: "700",
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    cardValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 16,
    },
    cardUnit: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    progressTrack: {
      height: 6,
      backgroundColor: isDark ? "#334155" : "#f1f5f9",
      borderRadius: 3,
      width: "100%",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    startHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      marginBottom: 16,
      alignItems: "center",
    },
    startTitle: {
      ...Typography.heading,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    edit: {
      color: colors.primary,
      fontWeight: "700",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    activityCard: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.12 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    activityTitle: {
      ...Typography.heading,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    activitySub: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    fabBtn: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.tabBar,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.34,
      shadowRadius: 10,
      elevation: 5,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "100%",
      backgroundColor: "#fff",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    modalTitle: {
      ...Typography.heading,
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 24,
      textAlign: "center",
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    modalInput: {
      backgroundColor: "#f8fafc",
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      marginBottom: 20,
      fontWeight: "600",
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    modalBtnText: {
      fontSize: 16,
      fontWeight: "700",
    }
  });
