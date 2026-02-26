import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SAMPLE_MEDICAL_RECORD_VI } from "@/constants/medical_records";
import { SAMPLE_PRESCRIPTION } from "@/constants/perscription";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

export default function RecordsScreen() {
  const record = SAMPLE_MEDICAL_RECORD_VI;
  const rx = SAMPLE_PRESCRIPTION;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#F3E5F5", dark: "#2B1D31" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText type="title">Medical Record</ThemedText>
        <ThemedText>{record.title}</ThemedText>
        <ThemedText>
          Doctor: {record.metadata.doctor_name} @ {record.metadata.clinic}
        </ThemedText>
        <ThemedText>Notes: {record.clinical_notes}</ThemedText>
        <ThemedText type="subtitle" style={{ marginTop: 6 }}>
          Files
        </ThemedText>
        {record.files.map((f, i) => (
          <ThemedText key={i}>
            • {f.filename} • {f.file_type} • {Math.round(f.size_bytes / 1024)}{" "}
            KB
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Prescription</ThemedText>
        <ThemedText>
          Code: {rx.prescription_code} • Status: {rx.status}
        </ThemedText>
        {rx.medications.map((m, i) => (
          <ThemedText key={i}>
            • {m.name} {m.dosage} — {m.frequency} ({m.duration_days} days)
          </ThemedText>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6, marginBottom: 16 },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
