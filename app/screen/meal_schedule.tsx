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
  const { token } = useSession();
  const { data: profile } = useProfile(token);
  
  const vietnamDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
  const { data: healthData } = useDailyHealthMetric(vietnamDate);
  const { data: healthSummary } = useHealthScoreToday();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(1);
  const [activity, setActivity] = useState("RUN");
  const [stepCount, setStepCount] = useState("0");
  const [distance, setDistance] = useState("0");

  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  
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
        setDistance(((healthData.metrics.distance_meters || 0) / 1000).toFixed(1));
    }
  }, [healthData]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: mealPlan ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [mealPlan]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
        const forbiddenFoods = profile?.forbidden_foods || [];
        const payload = {
            steps: parseFloat(stepCount) || 0,
            age: parseInt(age) || 25,
            weight: parseFloat(weight) || 70,
            height: parseFloat(height) || 170,
            gender: gender,
            distance: parseFloat(distance) || 0,
            activity: activity,
            forbidden_foods: forbiddenFoods
        };

        const response: any = await axiosClient.post("/ai/predict", payload);
        setMealPlan(response);
    } catch (error) {
        console.error("Meal Generation Failed", error);
        Alert.alert("Error", "Could not connect to AI service. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>AI Nutritionist</Text>
          <Text style={styles.headerSubtitle}>Scientific Diet Planning</Text>
        </View>
        <View style={{ width: 44 }} />
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

            <Text style={styles.sectionTitle}>Today&apos;s Activity</Text>
            <View style={styles.activityScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ACTIVITIES.map((act) => (
                        <TouchableOpacity 
                            key={act.id} 
                            style={[styles.activityChip, activity === act.id && styles.activityChipActive]}
                            onPress={() => setActivity(act.id)}
                        >
                            <MaterialCommunityIcons 
                                name={act.icon as any} 
                                size={24} 
                                color={activity === act.id ? "#fff" : colors.primary} 
                            />
                            <Text style={[styles.activityLabel, activity === act.id && { color: "#fff" }]}>{act.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.gridRow}>
                <MetricInput label="Steps" value={stepCount} onChange={setStepCount} icon="shoe-print" colors={colors} isDark={isDark} styles={styles} />
                <MetricInput label="Distance (km)" value={distance} onChange={setDistance} icon="map-marker-distance" colors={colors} isDark={isDark} styles={styles} />
            </View>

            {profile?.forbidden_foods && profile.forbidden_foods.length > 0 && (
                <View style={styles.warningCard}>
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.warningTitle}>Restricted Ingredients</Text>
                        <Text style={styles.warningText}>
                            AI will exclude: {profile.forbidden_foods.join(", ")}
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

            <TouchableOpacity style={styles.resetBtn} onPress={() => setMealPlan(null)}>
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

    macroStatLabelDark: { color: "#fff" },
    macroStatValDark: { color: "#fff" },
});
