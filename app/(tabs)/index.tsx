import {
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    articleService,
    MobileArticle,
} from "../../api/services/articleService";
import { Typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "../../hooks/useAuth";
import { useHealthData } from "../../hooks/useHealthData";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { useProfile } from "../../hooks/useUser";
import { useWaterProgress } from "../../hooks/useWaterIntake";
import { isScheduleToday, useScheduleStore } from "../../store/scheduleStore";
import { useSleepStore } from "../../store/sleepStore";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { token, userId } = useSession();
  const { data: profile } = useProfile(token);
  const { data: waterProgress } = useWaterProgress();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { isSyncing, syncData, authorize, hasToken } = useHealthData();
  const { schedules, loadSchedules } = useScheduleStore();
  const { sleepGoal } = useSleepStore();
  const todayCount = schedules.filter(
    (s) => s.isActive && isScheduleToday(s),
  ).length;
  const todaySchedules = schedules.filter(
    (s) => s.isActive && isScheduleToday(s),
  );
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [weatherText, setWeatherText] = useState("Loading...");
  const [showAllTodaySchedules, setShowAllTodaySchedules] = useState(false);
  const [latestArticle, setLatestArticle] = useState<MobileArticle | null>(
    null,
  );
  const [selectedMedGroup, setSelectedMedGroup] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toTimeString().substring(0, 5),
  );
  const [showTutorial, setShowTutorial] = useState(false);
  const pulseScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkTutorial = async () => {
      if (!userId) return;

      try {
        const [isPending, hasSeen] = await Promise.all([
          SecureStore.getItemAsync(`fitTutorialPending:${userId}`),
          SecureStore.getItemAsync(`fitTutorialSeen:${userId}`),
        ]);

        if (isPending === "true" && !hasSeen && !hasToken) {
          setShowTutorial(true);
        } else if (hasToken) {
          await SecureStore.setItemAsync(`fitTutorialSeen:${userId}`, "true");
          await SecureStore.deleteItemAsync(`fitTutorialPending:${userId}`);
        }
      } catch (error) {}
    };

    checkTutorial();
  }, [hasToken, userId]);

  useEffect(() => {
    if (!showTutorial || hasToken) {
      pulseScale.stopAnimation();
      pulseScale.setValue(1);
      return;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.06,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    return () => {
      pulseAnimation.stop();
    };
  }, [showTutorial, hasToken, pulseScale]);

  const handleCloseTutorial = async () => {
    setShowTutorial(false);
    if (userId) {
      await SecureStore.setItemAsync(`fitTutorialSeen:${userId}`, "true");
      await SecureStore.deleteItemAsync(`fitTutorialPending:${userId}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toTimeString().substring(0, 5));
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const groupedTodaySchedules = React.useMemo(() => {
    // 1. Filter out past schedules
    const upcomingSchedules = todaySchedules.filter(
      (s) => s.time >= currentTime,
    );

    // 2. Separate normal and medical
    const normal = upcomingSchedules.filter((s) => s.type !== "Medical");
    const medical = upcomingSchedules.filter((s) => s.type === "Medical");

    // 3. For medical, group by sourceId to find the NEXT upcoming time slot
    const medicalBySource: Record<string, any[]> = {};
    medical.forEach((s) => {
      const key = s.sourceId || s.id; // Fallback to id if sourceId is missing
      if (!medicalBySource[key]) medicalBySource[key] = [];
      medicalBySource[key].push(s);
    });

    const nextMedicalSchedules: any[] = [];
    Object.values(medicalBySource).forEach((schedulesList) => {
      schedulesList.sort((a, b) => a.time.localeCompare(b.time));
      if (schedulesList.length > 0) {
        const nextTime = schedulesList[0].time;
        const nextSlotSchedules = schedulesList.filter(
          (s) => s.time === nextTime,
        );
        nextMedicalSchedules.push(...nextSlotSchedules);
      }
    });

    // 4. Group the selected next medical schedules by time for UI display
    const medicalGroups: Record<string, any[]> = {};
    nextMedicalSchedules.forEach((s) => {
      if (!medicalGroups[s.time]) medicalGroups[s.time] = [];
      medicalGroups[s.time].push(s);
    });

    const combined: any[] = [...normal];
    Object.keys(medicalGroups).forEach((time) => {
      combined.push({
        id: "med_group_" + time,
        isGroup: true,
        type: "Medical",
        time: time,
        items: medicalGroups[time],
      });
    });

    combined.sort((a, b) => a.time.localeCompare(b.time));
    return combined;
  }, [todaySchedules, currentTime]);

  useEffect(() => {
    loadSchedules();
    const fetchArticles = async () => {
      try {
        const data: any = await articleService.get_published();
        const list = Array.isArray(data)
          ? data
          : data.content || data.data || [];
        if (list && list.length > 0) {
          setLatestArticle(list[0]);
        }
      } catch (error) {
        console.log("Fetch articles failed", error);
      }
    };
    fetchArticles();
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
          "https://api.open-meteo.com/v1/forecast?latitude=10.8231&longitude=106.6297&current=temperature_2m,weather_code",
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
    <View style={styles.container}>
      <LinearGradient
        colors={
          isDark ? ["#0d1c2e", "#12263d"] : ["#b9dbf5", "#d7ebfa", "#e7f2fb"]
        }
        style={styles.heroBg}
      />

      <ScrollView
        style={styles.scrollSurface}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandTitle}>
                <Text style={{ color: "#0f3f67" }}>HealthCare </Text>
                <Text style={{ color: "#1497dd" }}>Now</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push("/screen/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
            {unreadCount > 0 && <View style={styles.dot} />}
          </TouchableOpacity>
        </View>

        {/* WELCOME SECTION */}
        <View style={styles.welcomeSection}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View>
              <Text style={styles.greeting}>
                Hello,{" "}
                {
                  (profile?.fullName || profile?.full_name || "User").split(
                    " ",
                  )[0]
                }
                !
              </Text>
              <Text style={styles.statsSummary}>
                You have {todayCount} workout{todayCount !== 1 ? "s" : ""} for
                today.
              </Text>
            </View>

            <TouchableOpacity style={styles.weatherBadge}>
              <Ionicons
                name="partly-sunny"
                size={22}
                color={isDark ? "#fbbf24" : "#d97706"}
              />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.weatherTemp}>
                  {weatherTemp !== null ? `${weatherTemp}°C` : "--°C"}
                </Text>
                <Text style={styles.weatherDesc}>HCMC, {weatherText}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* QUICK MANAGEMENT */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Tracking</Text>
          <Animated.View
            style={
              showTutorial && !hasToken
                ? { transform: [{ scale: pulseScale }] }
                : undefined
            }
          >
            <TouchableOpacity
              style={[
                styles.syncBtn,
                showTutorial && !hasToken && styles.syncBtnHighlight,
              ]}
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
          </Animated.View>
        </View>

        {showTutorial && !hasToken && (
          <View style={styles.fitTutorialBanner}>
            <View style={styles.fitTutorialIconWrap}>
              <Ionicons name="fitness" size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fitTutorialTitle}>
                Quick setup for new users
              </Text>
              <Text style={styles.fitTutorialText}>
                Tap the highlighted Connect Fit button to link Google Fit and
                sync your daily steps, distance, and calories automatically.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCloseTutorial}
              style={styles.fitTutorialDismissBtn}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

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
            <Text style={styles.manageCardSub}>{sleepGoal}h Goal</Text>
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
              {(
                Number(
                  waterProgress?.goal_ml ?? waterProgress?.goalMl ?? 2500,
                ) / 1000
              ).toFixed(1)}
              L Goal
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
          colors={isDark ? ["#0d7fbe", "#0f97d9"] : ["#0f9adf", "#138bd0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.reminderContainer}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={[styles.reminderTitle, { marginBottom: 0 }]}>
              TODAY&apos;S SCHEDULES
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/screen/schedule_manage" as any)}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "bold" }}>
                Manage
              </Text>
            </TouchableOpacity>
          </View>

          {groupedTodaySchedules.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              No schedules for today. 🎉
            </Text>
          ) : (
            <>
              {groupedTodaySchedules
                .slice(
                  0,
                  showAllTodaySchedules ? groupedTodaySchedules.length : 3,
                )
                .map((schedule) => {
                  if (schedule.isGroup) {
                    return (
                      <TouchableOpacity
                        key={schedule.id}
                        style={styles.reminderCard}
                        onPress={() => setSelectedMedGroup(schedule)}
                      >
                        <View style={styles.reminderIconBox}>
                          <Ionicons name="medical" size={20} color="#10b981" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reminderHeading}>Medication</Text>
                          <Text style={styles.reminderSub} numberOfLines={2}>
                            {schedule.time} - {schedule.items.length}{" "}
                            medications
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <View key={schedule.id} style={styles.reminderCard}>
                      <View style={styles.reminderIconBox}>
                        <Ionicons
                          name="barbell"
                          size={20}
                          color={isDark ? "#60a5fa" : "#3b82f6"}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reminderHeading}>
                          {schedule.type}
                        </Text>
                        <Text style={styles.reminderSub} numberOfLines={2}>
                          {schedule.time} - {schedule.goal}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              {groupedTodaySchedules.length > 3 && (
                <TouchableOpacity
                  onPress={() => setShowAllTodaySchedules((prev) => !prev)}
                >
                  <Text
                    style={{
                      color: "#dbeafe",
                      fontWeight: "700",
                      marginTop: 8,
                    }}
                  >
                    {showAllTodaySchedules
                      ? "Show less"
                      : `Show more (${groupedTodaySchedules.length - 3})`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </LinearGradient>

        {/* MEDICATION MODAL */}
        <Modal
          visible={!!selectedMedGroup}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedMedGroup(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Medication - {selectedMedGroup?.items.length} types
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    Time Slot: {selectedMedGroup?.time}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedMedGroup(null)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{ maxHeight: 450 }}
                showsVerticalScrollIndicator={false}
              >
                {selectedMedGroup?.items.map((item: any, idx: number) => {
                  // Calculate frequency and filter medications if list exists
                  const fullMedList = item.medications || [];
                  const currentSlotMeds = fullMedList.filter((m: any) => {
                    if (!m.schedules || m.schedules.length === 0) return true; // fallback to showing all if no specific schedule
                    return m.schedules.some((s: any) => s.time === item.time);
                  });

                  const displayList =
                    currentSlotMeds.length > 0 ? currentSlotMeds : fullMedList;

                  return (
                    <View key={item.id || idx}>
                      {displayList.map((med: any, medIdx: number) => {
                        const frequency = todaySchedules.filter(
                          (s) => s.type === "Medical" && s.goal === item.goal,
                        ).length;
                        return (
                          <View key={medIdx} style={styles.modalItem}>
                            <View style={styles.modalItemIcon}>
                              <MaterialCommunityIcons
                                name="pill"
                                size={24}
                                color="#10b981"
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.modalItemTitle,
                                  { color: colors.text },
                                ]}
                              >
                                {med.name}
                              </Text>
                              <View style={styles.modalItemMeta}>
                                <View style={styles.modalTag}>
                                  <Ionicons
                                    name="repeat"
                                    size={12}
                                    color="#10b981"
                                  />
                                  <Text style={styles.modalTagText}>
                                    {med.dosage || item.goal}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.modalTag,
                                    {
                                      backgroundColor:
                                        "rgba(14, 165, 233, 0.1)",
                                    },
                                  ]}
                                >
                                  <Ionicons
                                    name="time-outline"
                                    size={12}
                                    color="#0ea5e9"
                                  />
                                  <Text
                                    style={[
                                      styles.modalTagText,
                                      { color: "#0ea5e9" },
                                    ]}
                                  >
                                    {item.time}
                                  </Text>
                                </View>
                              </View>
                              {med.note && (
                                <Text
                                  style={{
                                    color: colors.textSecondary,
                                    fontSize: 12,
                                    marginTop: 8,
                                    fontStyle: "italic",
                                  }}
                                >
                                  Note: {med.note}
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* LATEST ARTICLES */}
        {latestArticle && (
          <View style={styles.articleSection}>
            <View style={[styles.sectionHeader, { marginTop: 0 }]}>
              <Text style={styles.sectionTitle}>Latest Articles</Text>
              <TouchableOpacity
                onPress={() => router.push("/screen/article_list" as any)}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.articleCard}
              onPress={() =>
                router.push({
                  pathname: "/screen/article_detail",
                  params: { id: latestArticle.id },
                } as any)
              }
            >
              <View style={styles.articleImageContainer}>
                <Image
                  source={{
                    uri:
                      latestArticle.coverImageUrl ||
                      "https://img.freepik.com/free-vector/healthy-lifestyle-concept-illustration_114360-6003.jpg",
                  }}
                  style={styles.articleImage}
                />
                <View style={styles.articleBadge}>
                  <View style={styles.articleBadgeDot} />
                  <Text style={styles.articleBadgeText}>
                    {latestArticle.category?.toUpperCase() || "HEALTH"}
                  </Text>
                </View>
              </View>
              <View style={styles.articleContent}>
                <Text style={styles.articleCardTitle} numberOfLines={2}>
                  {latestArticle.title}
                </Text>
                <Text style={styles.articleSummary} numberOfLines={2}>
                  {latestArticle.summary}
                </Text>
                <View style={styles.articleReadMore}>
                  <Text style={styles.articleReadMoreText}>Read Article</Text>
                  <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
      height: 420,
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
      width: 40,
      height: 40,
      marginRight: 12,
    },
    brandTitle: {
      ...Typography.brandTitle,
      fontSize: 22,
      lineHeight: 26,
    },
    notificationBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
      ...Typography.heading,
      fontSize: 24,
      fontWeight: "700",
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
      ...Typography.heading,
      fontSize: 16,
      fontWeight: "700",
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
    syncBtnHighlight: {
      borderColor: "#38bdf8",
      borderWidth: 2,
      shadowColor: "#38bdf8",
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 5,
    },
    fitTutorialBanner: {
      marginTop: -8,
      marginBottom: 14,
      padding: 12,
      borderRadius: 14,
      backgroundColor: isDark
        ? "rgba(14, 165, 233, 0.14)"
        : "rgba(14, 165, 233, 0.10)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(56, 189, 248, 0.45)"
        : "rgba(14, 165, 233, 0.25)",
      flexDirection: "row",
      alignItems: "flex-start",
    },
    fitTutorialIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#0ea5e9",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      marginTop: 2,
    },
    fitTutorialTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 3,
    },
    fitTutorialText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    fitTutorialDismissBtn: {
      marginLeft: 10,
      padding: 4,
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
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.12 : 0.05,
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
      ...Typography.heading,
      fontSize: 13,
      fontWeight: "700",
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
      marginBottom: 32,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.3 : 0.22,
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
    articleSection: {
      marginBottom: 100,
      paddingHorizontal: 20,
    },
    articleCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.15 : 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    articleImageContainer: {
      width: "100%",
      height: 160,
      backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
    },
    articleImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    articleBadge: {
      position: "absolute",
      top: 16,
      left: 16,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    articleBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#10b981",
      marginRight: 6,
    },
    articleBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#334155",
    },
    articleContent: {
      padding: 20,
    },
    articleCardTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
      lineHeight: 24,
    },
    articleSummary: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    articleReadMore: {
      flexDirection: "row",
      alignItems: "center",
    },
    articleReadMoreText: {
      color: "#3b82f6",
      fontWeight: "700",
      fontSize: 14,
      marginRight: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: "rgba(16, 185, 129, 0.05)",
      padding: 20,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(16, 185, 129, 0.1)",
    },
    modalItemIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    modalItemTitle: {
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 22,
      flexShrink: 1,
    },
    modalItemMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
    },
    modalTag: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    modalTagText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#10b981",
    },
    modalCloseBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(148,163,184,0.1)",
      justifyContent: "center",
      alignItems: "center",
    },
  });
