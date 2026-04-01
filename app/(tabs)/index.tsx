import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "../../hooks/useAuth";
import { useHealthData } from "../../hooks/useHealthData";
import { useWaterProgress } from "../../hooks/useWaterIntake";
import { useProfile } from "../../hooks/useUser";
import { useScheduleStore, isScheduleToday } from "../../store/scheduleStore";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { token } = useSession();
  const { data: profile } = useProfile(token);
  const { data: waterProgress } = useWaterProgress();
  const { isSyncing, syncData, authorize, hasToken } = useHealthData();
  const { schedules, loadSchedules } = useScheduleStore();
  const todayCount = schedules.filter(s => s.isActive && isScheduleToday(s)).length;
  const todaySchedules = schedules.filter(s => s.isActive && isScheduleToday(s));
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [weatherText, setWeatherText] = useState("Loading...");
  const [showAllTodaySchedules, setShowAllTodaySchedules] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const weatherCodeMap: Record<number, string> = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=10.8231&longitude=106.6297&current=temperature_2m,weather_code"
        );
        const data = await response.json();
        const temp = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;

        if (typeof temp === "number") {
          setWeatherTemp(Math.round(temp));
        }
        if (typeof code === "number") {
          setWeatherText(weatherCodeMap[code] || "Weather");
        } else {
          setWeatherText("Weather");
        }
      } catch {
        setWeatherTemp(null);
        setWeatherText("Weather unavailable");
      }
    };

    fetchWeather();
  }, []);

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>HEALTHCARE</Text>
            <Text style={styles.brandSubtitle}>NOW</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.text}
          />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      {/* WELCOME SECTION */}
      <View style={styles.welcomeSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.greeting}>
              Hello,{" "}
              {(profile?.fullName || profile?.full_name || "User").split(" ")[0]}!
              👋
            </Text>
            <Text style={styles.statsSummary}>You have {todayCount} workout{todayCount !== 1 ? 's' : ''} for today.</Text>
          </View>
          
          <TouchableOpacity style={styles.weatherBadge}>
            <Ionicons name="partly-sunny" size={22} color={isDark ? "#fbbf24" : "#d97706"} />
            <View style={{ marginLeft: 6 }}>
                <Text style={styles.weatherTemp}>{weatherTemp !== null ? `${weatherTemp}°C` : "--°C"}</Text>
                <Text style={styles.weatherDesc}>HCMC, {weatherText}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* QUICK MANAGEMENT */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Tracking</Text>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={() => {
            if (!hasToken) {
              authorize(); // Yêu cầu login nếu chưa có token
            } else {
              syncData();
            }
          }}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons
                name={hasToken ? "sync" : "log-in-outline"}
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.syncBtnText, { color: colors.primary }]}>
                {hasToken ? "Sync Now" : "Connect Fit"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.managementGrid}>
        {/* SLEEP MANAGEMENT */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/sleep")}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(139, 92, 246, 0.15)" },
            ]}
          >
            <Ionicons name="moon" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.manageCardTitle}>Sleep</Text>
          <Text style={styles.manageCardSub}>{profile?.settings?.sleepGoal || "8"}h Goal</Text>
        </TouchableOpacity>

        {/* HYDRATION MANAGEMENT */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/hydration")}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(59, 130, 246, 0.15)" },
            ]}
          >
            <Ionicons name="water" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.manageCardTitle}>Water</Text>
          <Text style={styles.manageCardSub}>
            {(Number(waterProgress?.goal_ml ?? waterProgress?.goalMl ?? 2500) / 1000).toFixed(1)}L Goal
          </Text>
        </TouchableOpacity>

        {/* MEAL SCHEDULE & AI */}
        <TouchableOpacity
          style={styles.manageCard}
          onPress={() => router.push("/screen/meal_schedule")}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(245, 158, 11, 0.15)" },
            ]}
          >
            <MaterialIcons name="restaurant" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.manageCardTitle}>AI Meals</Text>
          <Text style={styles.manageCardSub}>Planner</Text>
        </TouchableOpacity>
      </View>

      {/* REMINDER SECTION */}
      <LinearGradient
        colors={isDark ? ["#1e3a8a", "#1e40af"] : ["#3b82f6", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.reminderContainer}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.reminderTitle, { marginBottom: 0 }]}>TODAY&apos;S SCHEDULES</Text>
          <TouchableOpacity onPress={() => router.push("/screen/schedule_manage" as any)}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>Manage</Text>
          </TouchableOpacity>
        </View>

        {todaySchedules.length === 0 ? (
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>No workouts scheduled for today. Rest day! 🎉</Text>
        ) : (
          <>
            {todaySchedules.slice(0, showAllTodaySchedules ? todaySchedules.length : 3).map(schedule => (
              <View key={schedule.id} style={styles.reminderCard}>
                <View style={styles.reminderIconBox}>
                  <Ionicons
                    name="barbell"
                    size={20}
                    color={isDark ? "#60a5fa" : "#3b82f6"}
                  />
                </View>
                <View>
                  <Text style={styles.reminderHeading}>{schedule.type}</Text>
                  <Text style={styles.reminderSub}>
                    {schedule.time} - {schedule.goal}
                  </Text>
                </View>
              </View>
            ))}
            {todaySchedules.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllTodaySchedules((prev) => !prev)}>
                <Text style={{ color: '#dbeafe', fontWeight: '700', marginTop: 8 }}>
                  {showAllTodaySchedules ? 'Thu gon' : `Xem them (${todaySchedules.length - 3})`}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </LinearGradient>
    </ScrollView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    logoImage: {
      width: 48,
      height: 48,
      marginRight: 10,
    },
    brandTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: 2,
      lineHeight: 20,
    },
    brandSubtitle: {
      fontSize: 9,
      fontWeight: "700",
      color: colors.primary,
      letterSpacing: 1,
    },
    notificationBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.background,
    },
    welcomeSection: {
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 24,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    statsSummary: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    weatherBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    weatherTemp: {
      fontSize: 14,
      fontWeight: "800",
      color: isDark ? "#fbbf24" : "#d97706",
    },
    weatherDesc: {
      fontSize: 9,
      fontWeight: "600",
      color: isDark ? "#fbbf24" : "#d97706",
      opacity: 0.8,
      marginTop: 2,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      marginTop: 10,
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      letterSpacing: 0.5,
    },
    syncBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.15)"
        : "rgba(59, 130, 246, 0.1)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    syncBtnText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    managementGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    manageCard: {
      width: "31%",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    manageCardTitle: {
      fontSize: 13,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },
    manageCardSub: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },
    reminderContainer: {
      marginHorizontal: 20,
      marginTop: 32,
      borderRadius: 28,
      padding: 24,
      marginBottom: 120,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    reminderTitle: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 11,
      fontWeight: "900",
      marginBottom: 20,
      letterSpacing: 2,
    },
    reminderCard: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 20,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    reminderIconBox: {
      width: 44,
      height: 44,
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    reminderHeading: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    reminderSub: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 12,
      marginTop: 4,
    },
  });
