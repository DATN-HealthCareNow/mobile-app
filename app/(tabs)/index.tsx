import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  DAILY_STEPS_SAMPLE,
  SLEEP_SESSION_SAMPLE,
} from "@/constants/daily_sleep";
import { HealthScore } from "@/constants/health";
import { SAMPLE_WATER_INTAKE } from "@/constants/water";

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export default function HomeScreen() {
  const hs = HealthScore;
  const steps = DAILY_STEPS_SAMPLE;
  const water = SAMPLE_WATER_INTAKE;
  const sleep = SLEEP_SESSION_SAMPLE;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.card}>
        <ThemedText type="title">Health Score</ThemedText>
        <ThemedText>
          {hs.health_score.value}/{hs.health_score.max} —{" "}
          {hs.health_score.level}
        </ThemedText>
        <ThemedText>
          BMI {hs.bmi} ({bmiLabel(hs.bmi)}) • TDEE {hs.tdee} kcal
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="title">Steps</ThemedText>
        <ThemedText>
          {steps.steps} / {steps.goal_steps} —{" "}
          {Math.round(steps.progress_percent)}%
        </ThemedText>
        <ThemedText>Source: {steps.source}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="title">Hydration</ThemedText>
        <ThemedText>
          {water.total_today_ml} / {water.goal_ml} ml —{" "}
          {Math.round(water.progress_percent)}%
        </ThemedText>
        <ThemedText>
          Last: +{water.amount_ml} ml at{" "}
          {new Date(water.timestamp).toLocaleTimeString()}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="title">Sleep</ThemedText>
        <ThemedText>
          {sleep.duration_hours} hrs • Efficiency {sleep.efficiency_percent}%
        </ThemedText>
        <ThemedText>
          Deep {sleep.stages.deep_minutes}m • REM {sleep.stages.rem_minutes}m
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6, marginBottom: 12 },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
