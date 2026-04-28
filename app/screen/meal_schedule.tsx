import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../hooks/useUser";
import { useSession } from "../../hooks/useAuth";
import { useDailyHealthMetric } from "../../hooks/useDailyHealthMetric";
import { useHealthScoreToday } from "../../hooks/useHealthScore";
import { axiosClient } from "../../api/axiosClient";
import { Typography } from "../../constants/typography";

const { width } = Dimensions.get("window");

const ACTIVITIES = [
    { id: "RUN", label: "Running", icon: "run" },
    { id: "WALK", label: "Walking", icon: "walk" },
    { id: "YOGA", label: "Yoga", icon: "yoga" },
    { id: "GYM", label: "Gym/Weights", icon: "weight-lifter" },
    { id: "CYCLING", label: "Cycling", icon: "bicycle" },
];

export default function MealScheduleScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
    const { token, userId } = useSession();
  const { data: profile } = useProfile(token);
  
  const vietnamDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
  const { data: healthData } = useDailyHealthMetric(vietnamDate);
  const { data: healthSummary } = useHealthScoreToday();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(1);
    const [selectedActivities, setSelectedActivities] = useState<string[]>(["RUN"]);
  const [stepCount, setStepCount] = useState("0");
  const [distance, setDistance] = useState("0");

  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
    const [mealHistory, setMealHistory] = useState<any[]>([]);
  // Danh sách thức ăn cấm tổng hợp (profile + tất cả medical records)
  const [allForbiddenFoods, setAllForbiddenFoods] = useState<string[]>([]);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const styles = createStyles(colors, isDark);

  useEffect(() => {
    if (profile) {
      setWeight(profile.weight?.toString() || "70");
      setHeight(profile.height?.toString() || "170");
      setAge(profile.age?.toString() || "25");
      setGender(profile.gender === "FEMALE" ? 0 : 1);
    }
  }, [profile]);

  useEffect(() => {
    if (healthData?.metrics) {
        setStepCount(healthData.metrics.steps?.toString() || "0");
        const m = healthData.metrics as any;
        const dist = Number(m.distance_meters ?? m.distanceMeters ?? 0) + Number(m.google_distance_meters ?? m.googleDistanceMeters ?? 0);
        setDistance((dist / 1000).toFixed(1));
    }
  }, [healthData]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: mealPlan ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [mealPlan]);
  // Preload danh sách thức ăn cấm khi profile load xong
  useEffect(() => {
    const loadAllForbiddenFoods = async () => {
      const profileFoods: string[] = profile?.forbidden_foods || [];
      let medicalFoods: string[] = [];
      try {
        const res: any = await axiosClient.get("/api/v1/medical-records/active");
        const records: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        records.forEach((r: any) => {
          const foods: string[] = r.forbiddenFoods || r.forbidden_foods || [];
          medicalFoods = [...medicalFoods, ...foods];
        });
      } catch (_) {}

      const seen = new Set<string>();
      const merged = [...profileFoods, ...medicalFoods].filter((f) => {
        if (!f?.trim()) return false;
        const k = f.trim().toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setAllForbiddenFoods(merged);
    };
    if (profile) loadAllForbiddenFoods();
  }, [profile]);

    const historyStorageKey = userId ? `aiMealHistory_${userId}` : "aiMealHistory_guest";
    const activePlanKey    = userId ? `aiActivePlan_${userId}`  : "aiActivePlan_guest";

    // Load lịch sử và plan đang hiển thị khi mount
    useEffect(() => {
        const init = async () => {
            try {
                // Load history
                const rawHistory = await SecureStore.getItemAsync(historyStorageKey);
                if (rawHistory) {
                    const parsed = JSON.parse(rawHistory);
                    setMealHistory(Array.isArray(parsed) ? parsed : []);
                }

                // Restore plan đang active
                const rawPlan = await SecureStore.getItemAsync(activePlanKey);
                if (rawPlan) {
                    setMealPlan(JSON.parse(rawPlan));
                }
            } catch (err) {
                console.warn("[MealSchedule] Failed to load from SecureStore", err);
            }
        };
        init();
    }, [historyStorageKey, activePlanKey]);

    const saveHistory = async (history: any[]) => {
        setMealHistory(history);
        try {
            await SecureStore.setItemAsync(historyStorageKey, JSON.stringify(history));
        } catch (err) {
            console.warn("[MealSchedule] Failed to save history", err);
        }
    };

    // Wrapper: lưu cả active plan và cập nhật state
    const applyAndCachePlan = async (plan: any) => {
        setMealPlan(plan);
        try {
            if (plan) {
                await SecureStore.setItemAsync(activePlanKey, JSON.stringify(plan));
            } else {
                await SecureStore.deleteItemAsync(activePlanKey);
            }
        } catch (err) {
            console.warn("[MealSchedule] Failed to cache active plan", err);
        }
    };

    const handleDeleteHistoryItem = (id: string) => {
        Alert.alert("Delete History", "Delete this meal plan from history?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const nextHistory = mealHistory.filter((item) => item.id !== id);
                    await saveHistory(nextHistory);
                },
            },
        ]);
    };

    const handleClearAllHistory = () => {
        Alert.alert("Clear All", "Delete all saved AI meal history?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Clear",
                style: "destructive",
                onPress: async () => {
                    await saveHistory([]);
                },
            },
        ]);
    };

    const toggleActivity = (activityId: string) => {
        setSelectedActivities((prev) => {
            if (prev.includes(activityId)) {
                return prev.filter((id) => id !== activityId);
            }
            return [...prev, activityId];
        });
    };

  const handleGenerate = async () => {
        if (selectedActivities.length === 0) {
            Alert.alert("Choose Activity", "Please select at least one activity.");
            return;
        }

    setIsLoading(true);
    try {
        // ── Gộp forbidden foods từ profile + tất cả medical records ──────────
        const profileFoods: string[] = profile?.forbidden_foods || [];

        let medicalRecordFoods: string[] = [];
        try {
            const recordsResponse: any = await axiosClient.get("/api/v1/medical-records/active");
            const records: any[] = Array.isArray(recordsResponse)
                ? recordsResponse
                : Array.isArray(recordsResponse?.data)
                ? recordsResponse.data
                : [];

            records.forEach((record: any) => {
                const foods: string[] =
                    record.forbiddenFoods || record.forbidden_foods || [];
                medicalRecordFoods = [...medicalRecordFoods, ...foods];
            });
        } catch (recordErr) {
            console.warn("[MealSchedule] Could not fetch medical records for forbidden foods:", recordErr);
        }

        // Deduplicate (case-insensitive) và lọc rỗng
        const allFoods = [...profileFoods, ...medicalRecordFoods];
        const seen = new Set<string>();
        const forbiddenFoods = allFoods.filter((food) => {
            if (!food || !food.trim()) return false;
            const key = food.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        console.log("[MealSchedule] Combined forbidden foods:", forbiddenFoods);

        const payload = {
            steps: parseFloat(stepCount) || 0,
            age: parseInt(age) || 25,
            weight: parseFloat(weight) || 70,
            height: parseFloat(height) || 170,
            gender: gender,
            distance: parseFloat(distance) || 0,
            activities: selectedActivities,
            activity: selectedActivities[0],
            forbidden_foods: forbiddenFoods,
        };

        const response: any = await axiosClient.post("/ai/predict", payload);
        await applyAndCachePlan(response);

                const historyItem = {
                    id: `${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    activities: selectedActivities,
                    plan: response,
                    totalCalories: response?.summary?.total_tdee ?? 0,
                };
                const nextHistory = [historyItem, ...mealHistory].slice(0, 15);
                await saveHistory(nextHistory);
    } catch (error) {
        console.error("Meal Generation Failed", error);
        Alert.alert("Error", "Could not connect to AI service. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const [showHistory, setShowHistory] = useState(false);

  return (
    <View style={styles.container}>
      {/* ── HISTORY MODAL ──────────────────────────────────────────── */}
      {showHistory && (
        <View style={styles.historyModal}>
          {/* Backdrop - Move to first to be behind content */}
          <TouchableOpacity
            style={styles.historyBackdrop}
            activeOpacity={1}
            onPress={() => setShowHistory(false)}
          />

          <View style={styles.historyModalContent}>
            {/* Handle bar */}
            <View style={styles.historyHandle} />

            {/* Header */}
            <View style={styles.historyModalHeader}>
              <View>
                <Text style={styles.historyModalTitle}>Meal Plan History</Text>
                <Text style={styles.historyModalSub}>
                  {mealHistory.length} saved plan{mealHistory.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {mealHistory.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearAllBtn}
                    onPress={() => {
                      setShowHistory(false);
                      setTimeout(handleClearAllHistory, 300);
                    }}
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.historyCloseBtn}
                  onPress={() => setShowHistory(false)}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* List */}
            {mealHistory.length === 0 ? (
              <View style={styles.historyEmpty}>
                <MaterialCommunityIcons name="food-off" size={48} color={colors.textSecondary} />
                <Text style={styles.historyEmptyText}>No saved meal plans yet</Text>
                <Text style={styles.historyEmptyDesc}>
                  Generate a plan and it will appear here automatically
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1, minHeight: 300 }}>
                <ScrollView 
                  showsVerticalScrollIndicator={false} 
                  contentContainerStyle={{ paddingBottom: 40 }}
                >
                  {mealHistory.map((entry, index) => {
                    const dateObj = entry.createdAt ? new Date(entry.createdAt) : new Date();
                    const displayDate = isNaN(dateObj.getTime()) ? "Past Plan" : dateObj.toLocaleDateString(undefined, { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    const displayTime = isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });

                    return (
                      <View key={entry.id || index} style={styles.historyModalItem}>
                        <View style={styles.historyModalItemLeft}>
                          <View style={{ 
                            width: 44, 
                            height: 44, 
                            borderRadius: 12, 
                            backgroundColor: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            marginRight: 14
                          }}>
                            <MaterialCommunityIcons
                              name="calendar-clock"
                              size={22}
                              color="#0284c7"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.historyTitle, { fontSize: 15 }]} numberOfLines={1}>
                              {displayDate} {displayTime ? `• ${displayTime}` : ""}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                              <Ionicons name="flame" size={12} color="#f59e0b" style={{ marginRight: 4 }} />
                              <Text style={styles.historySubtitle}>
                                {entry.totalCalories || entry.plan?.summary?.total_tdee || 0} kcal
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.historyModalActions}>
                          <TouchableOpacity
                            style={[styles.historyViewBtn, { height: 36, paddingHorizontal: 12 }]}
                            onPress={async () => {
                              setShowHistory(false);
                              setTimeout(() => {
                                applyAndCachePlan(entry.plan);
                              }, 300);
                            }}
                          >
                            <Ionicons name="eye" size={16} color={colors.primary} />
                            <Text style={[styles.historyViewText, { marginLeft: 6 }]}>View</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.historyDeleteBtn, { width: 36, height: 36 }]}
                            onPress={() => handleDeleteHistoryItem(entry.id)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>AI Nutritionist</Text>
          <Text style={styles.headerSubtitle}>Scientific Diet Planning</Text>
        </View>
        {/* ── History Button ── */}
        <TouchableOpacity
          style={[styles.circleBtn, mealHistory.length > 0 && { borderColor: colors.primary }]}
          onPress={() => setShowHistory(true)}
        >
          <Ionicons
            name="time-outline"
            size={22}
            color={mealHistory.length > 0 ? colors.primary : colors.textSecondary}
          />
          {mealHistory.length > 0 && (
            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>
                {mealHistory.length > 9 ? "9+" : mealHistory.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {!mealPlan ? (
          <View style={styles.inputPhase}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Physical Metrics</Text>
              <Text style={styles.sectionDesc}>Update your stats for precision</Text>
            </View>

            <View style={styles.gridRow}>
              <MetricInput label="Weight (kg)" value={weight} onChange={setWeight} icon="weight-kilogram" colors={colors} isDark={isDark} styles={styles} />
              <MetricInput label="Height (cm)" value={height} onChange={setHeight} icon="human-male-height" colors={colors} isDark={isDark} styles={styles} />
            </View>

            <View style={styles.gridRow}>
              <MetricInput label="Age" value={age} onChange={setAge} icon="calendar-account" colors={colors} isDark={isDark} styles={styles} />
              <View style={styles.genderToggle}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 1 && styles.genderBtnActive]}
                    onPress={() => setGender(1)}
                  >
                    <Ionicons name="male" size={18} color={gender === 1 ? "#fff" : colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 0 && styles.genderBtnActiveFemale]}
                    onPress={() => setGender(0)}
                  >
                    <Ionicons name="female" size={18} color={gender === 0 ? "#fff" : colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Today&apos;s Activities</Text>
            <View style={styles.activityScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ACTIVITIES.map((act) => (
                        <TouchableOpacity
                            key={act.id}
                            style={[styles.activityChip, selectedActivities.includes(act.id) && styles.activityChipActive]}
                            onPress={() => toggleActivity(act.id)}
                        >
                            <MaterialCommunityIcons
                                name={act.icon as any}
                                size={24}
                                color={selectedActivities.includes(act.id) ? "#fff" : colors.primary}
                            />
                            <Text style={[styles.activityLabel, selectedActivities.includes(act.id) && { color: "#fff" }]}>{act.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.gridRow}>
                <MetricInput label="Steps" value={stepCount} onChange={setStepCount} icon="shoe-print" colors={colors} isDark={isDark} styles={styles} />
                <MetricInput label="Distance (km)" value={distance} onChange={setDistance} icon="map-marker-distance" colors={colors} isDark={isDark} styles={styles} />
            </View>

            {allForbiddenFoods.length > 0 && (
                <View style={styles.warningCard}>
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.warningTitle}>
                            Restricted Ingredients ({allForbiddenFoods.length})
                        </Text>
                        <Text style={styles.warningText}>
                            AI will exclude: {allForbiddenFoods.join(", ")}
                        </Text>
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[styles.generateBtn, isLoading && { opacity: 0.8 }]}
                onPress={handleGenerate}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.generateBtnText}>Generate Meal Plan</Text>
                        <Ionicons name="sparkles" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                )}
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={[styles.resultPhase, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={isDark ? ["#1e293b", "#0f172a"] : ["#0ea5e9", "#0284c7"]}
                style={styles.summaryCard}
            >
                <View style={styles.summaryHeader}>
                    <View>
                        <Text style={styles.summaryLabel}>Total Daily Energy (TDEE)</Text>
                        <Text style={styles.summaryValue}>{mealPlan.summary.total_tdee} <Text style={{ fontSize: 16 }}>kcal</Text></Text>
                    </View>
                    <View style={styles.bmrBadge}>
                        <Text style={styles.bmrText}>BMR: {mealPlan.summary.bmr}</Text>
                    </View>
                </View>

                <View style={styles.macroGrid}>
                    <MacroStat label="Protein" val={`${mealPlan.summary.macros_target.protein_g}g`} color="#f87171" styles={styles} />
                    <MacroStat label="Carbs" val={`${mealPlan.summary.macros_target.carb_g}g`} color="#60a5fa" styles={styles} />
                    <MacroStat label="Fat" val={`${mealPlan.summary.macros_target.fat_g}g`} color="#fbbf24" styles={styles} />
                </View>
            </LinearGradient>

            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Quantified Meals</Text>
                {mealPlan.meals.map((meal: any, idx: number) => (
                    <MealCard key={idx} meal={meal} colors={colors} isDark={isDark} styles={styles} />
                ))}
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={() => applyAndCachePlan(null)}>
                <Text style={styles.resetBtnText}>Recalculate Metrics</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const MetricInput = ({ label, value, onChange, icon, colors, isDark, styles }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[styles.inputBox, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc" }]}>
            <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
            <TextInput
                style={[styles.field, { color: colors.text }]}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94a3b8"
            />
        </View>
    </View>
);

const MacroStat = ({ label, val, color, styles }: any) => (
    <View style={styles.macroStatItem}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <View>
            <Text style={styles.macroStatLabel}>{label}</Text>
            <Text style={styles.macroStatVal}>{val}</Text>
        </View>
    </View>
);

const MealCard = ({ meal, colors, isDark, styles }: any) => {
    const getIcon = (type: string) => {
        switch(type) {
            case 'BREAKFAST': return 'coffee';
            case 'LUNCH': return 'food-apple';
            case 'DINNER': return 'weather-night';
            default: return 'food';
        }
    };

    const getBg = (type: string) => {
        if (isDark) return 'rgba(255,255,255,0.03)';
        switch(type) {
            case 'BREAKFAST': return '#fff7ed';
            case 'LUNCH': return '#f0fdf4';
            case 'DINNER': return '#eff6ff';
            default: return '#fff';
        }
    };

    return (
        <View style={[styles.mealCard, { backgroundColor: getBg(meal.meal_type) }]}>
            <View style={styles.mealCardHeader}>
                <View style={styles.mealTypeBadge}>
                    <MaterialCommunityIcons name={getIcon(meal.meal_type)} size={18} color={colors.primary} />
                    <Text style={styles.mealTypeText}>{meal.meal_type}</Text>
                </View>
                <Text style={styles.mealTotalCals}>{meal.total_meal_calories} kcal</Text>
            </View>

            {meal.foods.map((food: any, i: number) => (
                <View key={i} style={styles.foodItem}>
                    <View style={styles.foodInfo}>
                        <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
                        <Text style={styles.foodQuantity}>{food.quantity_g}{food.unit} • {food.total_metrics.calories} kcal</Text>
                    </View>
                    <View style={styles.foodMacros}>
                        <Text style={styles.macroTag}>P: {food.total_metrics.protein}g</Text>
                        <Text style={styles.macroTag}>C: {food.total_metrics.carb}g</Text>
                        <Text style={styles.macroTag}>F: {food.total_metrics.fat}g</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 60, marginBottom: 20 },
    circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border },
    headerTitle: { fontSize: 20, fontWeight: "900", color: colors.text },
    headerSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
    
    inputPhase: { paddingHorizontal: 20 },
    sectionHeader: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 4 },
    sectionDesc: { fontSize: 13, color: colors.textSecondary },

    gridRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    inputGroup: { flex: 1, marginHorizontal: 4 },
    inputLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 8, marginLeft: 4 },
    inputBox: { flexDirection: "row", alignItems: "center", height: 52, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border },
    field: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: "600" },

    genderToggle: { width: 100, marginLeft: 12 },
    genderRow: { flexDirection: "row", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", borderRadius: 12, padding: 4 },
    genderBtn: { flex: 1, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    genderBtnActive: { backgroundColor: "#3b82f6" },
    genderBtnActiveFemale: { backgroundColor: "#ec4899" },

    activityScroll: { marginBottom: 20 },
    activityChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, backgroundColor: colors.card, marginRight: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border },
    activityChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    activityLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginTop: 4 },

    warningCard: { flexDirection: "row", backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#fffbeb", padding: 16, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#fef3c7" },
    warningTitle: { fontSize: 14, fontWeight: "800", color: isDark ? "#fbbf24" : "#92400e" },
    warningText: { fontSize: 12, color: isDark ? "#fcd34d" : "#b45309", marginTop: 2 },

    generateBtn: { backgroundColor: colors.primary, height: 60, borderRadius: 20, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    generateBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

    // RESULT PHASE
    resultPhase: { flex: 1 },
    summaryCard: { marginHorizontal: 20, borderRadius: 30, padding: 24, shadowColor: "#0284c7", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
    summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },
    summaryValue: { color: "#fff", fontSize: 36, fontWeight: "900", marginTop: 4 },
    bmrBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    bmrText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    
    macroGrid: { flexDirection: "row", justifyContent: "space-between" },
    macroStatItem: { flexDirection: "row", alignItems: "center" },
    macroDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    macroStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600" },
    macroStatVal: { color: "#fff", fontSize: 14, fontWeight: "800" },

    mealCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    mealCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 },
    mealTypeBadge: { flexDirection: "row", alignItems: "center" },
    mealTypeText: { fontSize: 14, fontWeight: "900", color: colors.text, marginLeft: 8 },
    mealTotalCals: { fontSize: 16, fontWeight: "800", color: "#0284c7" },
    
    foodItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    foodInfo: { flex: 1 },
    foodName: { fontSize: 15, fontWeight: "700" },
    foodQuantity: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    foodMacros: { alignItems: "flex-end" },
    macroTag: { fontSize: 10, fontWeight: "700", color: colors.textSecondary },

    resetBtn: { marginHorizontal: 20, paddingVertical: 16, alignItems: "center" },
    resetBtnText: { color: colors.textSecondary, fontWeight: "700", textDecorationLine: "underline" },

        historySection: { marginTop: 8, paddingHorizontal: 20, paddingBottom: 16 },
        historyHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        historyActions: { marginLeft: 12 },
        clearAllBtn: {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(239,68,68,0.35)",
            paddingHorizontal: 8,
            paddingVertical: 5,
        },
        clearAllText: { color: "#ef4444", fontSize: 11, fontWeight: "700", marginLeft: 4 },
        historyItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            marginTop: 10,
        },
        historyIconBtn: {
            width: 28,
            height: 28,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 8,
            marginRight: 2,
        },
        historyTitle: { fontSize: 13, fontWeight: "700", color: colors.text },
        historySubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

    macroStatLabelDark: { color: "#fff" },
    macroStatValDark: { color: "#fff" },

    // ── History badge on header button ──
    historyBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: colors.primary,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 3,
    },
    historyBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

    // ── History bottom-sheet modal ──
    historyModal: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999,
        justifyContent: "flex-end",
    },
    historyBackdrop: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    historyModalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingBottom: 40,
        height: "75%", // Tăng chiều cao cố định để giống Bottom Sheet
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 20,
    },
    historyHandle: {
        width: 40, height: 4,
        backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 20,
    },
    historyModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    historyModalTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
    historyModalSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    historyCloseBtn: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        justifyContent: "center",
        alignItems: "center",
    },
    historyModalItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    historyModalItemLeft: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },

    // Action buttons inside history modal items
    historyModalActions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 8,
        gap: 6,
    },
    historyViewBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? "rgba(96,165,250,0.12)" : "rgba(14,165,233,0.08)",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: isDark ? "rgba(96,165,250,0.25)" : "rgba(14,165,233,0.2)",
    },
    historyViewText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "700",
        marginLeft: 4,
    },
    historyDeleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)",
        borderWidth: 1,
        borderColor: isDark ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.15)",
    },

    historyEmpty: {
        alignItems: "center",
        paddingVertical: 40,
    },
    historyEmptyText: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 12 },
    historyEmptyDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: "center" },
});
