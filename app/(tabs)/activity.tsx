import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    manualActivity,
    sampleActivity,
    updatedActivity,
} from "@/constants/iot";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function ActivityScreen() {
  const gps = sampleActivity;
  const manual = manualActivity;
  const track = updatedActivity;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E0F7FA", dark: "#0A3440" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText type="title">GPS Tracking</ThemedText>
        <ThemedText>
          Type: {gps.activity_type} | Status: {gps.status}
        </ThemedText>
        <ThemedText>
          Distance: {gps.metrics.distance_km} km | Pace(avg):{" "}
          {gps.metrics.avg_speed_kmh} km/h
        </ThemedText>
        <ThemedText>
          Duration: {Math.round(gps.duration_sec / 60)} min | Elevation:{" "}
          {gps.metrics.elevation_gain_m} m
        </ThemedText>
        <View style={styles.row}>
          <Pill label="Start" />
          <Pill label="Pause" />
          <Pill label="Resume" />
          <Pill label="Stop" />
        </View>
        <ThemedText type="subtitle" style={{ marginTop: 8 }}>
          Recent Track Points
        </ThemedText>
        {track.coordinates.slice(0, 3).map((p, i) => (
          <ThemedText key={i}>
            • {p.lat.toFixed(5)}, {p.lng.toFixed(5)} @ {p.timestamp}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Manual Activity</ThemedText>
        <ThemedText>
          Type: {manual.activity_type} | Intensity:{" "}
          {manual.manual_data.intensity}
        </ThemedText>
        <ThemedText>
          Sets x Reps x Weight: {manual.manual_data.sets} x{" "}
          {manual.manual_data.reps} x {manual.manual_data.weight_kg}kg
        </ThemedText>
        <ThemedText>
          Calories: {manual.metrics.calories_burned} kcal | Time:{" "}
          {Math.round(manual.duration_sec / 60)} min
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6, marginBottom: 16 },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e6f3ff",
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
