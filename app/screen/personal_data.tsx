import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useDailyHealthMetric } from '../../hooks/useDailyHealthMetric';

export default function PersonalDataScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Lấy ngày hôm nay dưới format YYYY-MM-DD
  const todayDateString = useMemo(() => {
    const d = new Date();
    // Offset múi giờ để đảm bảo lấy đúng ngày ở local
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - offset).toISOString().split('T')[0];
    return localISOTime;
  }, []);

  const { data: healthData, isLoading, isError } = useDailyHealthMetric(todayDateString);

  const styles = createStyles(colors, isDark);

  const m: any = healthData?.metrics || {};

  const steps = Number(m.steps ?? 0);
  const distanceMeters = Number(m.distance_meters ?? m.distanceMeters ?? 0) + Number(m.google_distance_meters ?? m.googleDistanceMeters ?? 0);
  const activeCalories = Number(m.active_calories ?? m.activeCalories ?? 0) + Number(m.google_active_calories ?? m.googleActiveCalories ?? 0);
  const totalCalories = Number(m.total_calories ?? m.totalCalories ?? 0);
  const sleepMinutes = Number(m.sleep_minutes ?? m.sleepMinutes ?? 0);
  const heartRate = Number(m.heart_rate ?? m.heartRate ?? 0);
  const restingHeartRate = Number(m.resting_heart_rate ?? m.restingHeartRate ?? 0);
  const movementMinutes = Number(
    m.google_exercise_minutes ??
      m.googleExerciseMinutes ??
      0,
  ) + Number(m.exercise_minutes ?? m.exerciseMinutes ?? 0);

  // Formatter thời gian ngủ
  const formatSleepMinutes = (minutes = 0) => {
    if (minutes === 0) return '--';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const formatDistance = (meters = 0) => {
    if (meters <= 0) return '--';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  return (
    <View style={styles.container}>
      {!isDark && (
        <LinearGradient
          colors={["#b9dbf5", "#e7f2fb", colors.background]}
          style={StyleSheet.absoluteFill}
        />
      )}
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Data</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Below is your synced Google Fit data for today ({todayDateString}).
            This section uses movement time from Google Fit and does not depend on in-app exercise logs.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading health metrics...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.text }]}>Failed to load health data.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {/* STEPS */}
            <MetricCard
              icon={<FontAwesome5 name="shoe-prints" size={20} color="#3b82f6" />}
              label="Steps"
              value={steps > 0 ? steps.toLocaleString() : '--'}
              unit="steps"
              colors={colors}
              styles={styles}
            />

            {/* DISTANCE */}
            <MetricCard
              icon={<MaterialCommunityIcons name="map-marker-distance" size={24} color="#0ea5e9" />}
              label="Distance"
              value={formatDistance(distanceMeters)}
              unit=""
              colors={colors}
              styles={styles}
            />

            {/* HEART RATE */}
            <MetricCard
              icon={<Ionicons name="heart" size={24} color="#ef4444" />}
              label="Heart Rate"
              value={heartRate > 0 ? heartRate.toString() : '--'}
              unit="bpm"
              colors={colors}
              styles={styles}
            />

            {/* RESTING HEART RATE */}
            <MetricCard
              icon={<MaterialCommunityIcons name="heart-pulse" size={24} color="#dc2626" />}
              label="Resting HR"
              value={restingHeartRate > 0 ? restingHeartRate.toString() : '--'}
              unit="bpm"
              colors={colors}
              styles={styles}
            />

            {/* ACTIVE CALORIES */}
            <MetricCard
              icon={<MaterialCommunityIcons name="fire" size={28} color="#f97316" />}
              label="Active Calories"
              value={activeCalories > 0 ? activeCalories.toString() : '--'}
              unit="kcal"
              colors={colors}
              styles={styles}
            />

            {/* TOTAL CALORIES */}
            <MetricCard
              icon={<MaterialCommunityIcons name="fire-off" size={24} color="#8b5cf6" />}
              label="Total Energy"
              value={totalCalories > 0 ? totalCalories.toString() : '--'}
              unit="kcal"
              colors={colors}
              styles={styles}
            />

            {/* SLEEP */}
            <MetricCard
              icon={<Ionicons name="moon" size={22} color="#6366f1" />}
              label="Sleep Duration"
              value={formatSleepMinutes(sleepMinutes)}
              unit=""
              colors={colors}
              styles={styles}
            />

            {/* MOVEMENT TIME (GOOGLE FIT) */}
            <MetricCard
              icon={<MaterialCommunityIcons name="run-fast" size={26} color="#10b981" />}
              label="Movement Time"
              value={movementMinutes > 0 ? movementMinutes.toString() : '--'}
              unit="min"
              colors={colors}
              styles={styles}
            />
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function MetricCard({ icon, label, value, unit, colors, styles }: any) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.background }]}>{icon}</View>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text style={[styles.cardValue, { color: colors.text }]}>{value}</Text>
        {unit ? <Text style={styles.cardUnit}> {unit}</Text> : null}
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  infoBox: {
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.16)' : '#e6f3ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: isDark ? '#93c5fd' : '#2563eb', // Blue toned info
    lineHeight: 22,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#0b3f64",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.12 : 0.06,
    shadowRadius: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  cardUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 2,
  },
});
