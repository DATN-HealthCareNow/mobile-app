import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ANALYSIS_EXAMPLE, ML_MODEL_SAMPLE } from "@/constants/ai_analyses";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

export default function AIScreen() {
  const analysis = ANALYSIS_EXAMPLE;
  const model = ML_MODEL_SAMPLE;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E8F5E9", dark: "#0F2A14" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText type="title">AI Analysis</ThemedText>
        <ThemedText>
          Type: {analysis.analysis_type} • Status: {analysis.status}
        </ThemedText>
        <ThemedText>
          Consent: {analysis.consent_snapshot.granted ? "Granted" : "Denied"} •
          Scope: {analysis.consent_snapshot.scope.join(", ")}
        </ThemedText>
        <ThemedText type="subtitle" style={{ marginTop: 6 }}>
          Findings
        </ThemedText>
        {analysis.results.findings.map((f, i) => (
          <ThemedText key={i}>
            • {f.key}: {f.value}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Model</ThemedText>
        <ThemedText>
          {model.model_name} ({model.version}) — {model.deployment_status}
        </ThemedText>
        <ThemedText>
          Acc {Math.round(model.performance_metrics.accuracy * 100)}% • Prec{" "}
          {Math.round(model.performance_metrics.precision * 100)}% • Rec{" "}
          {Math.round(model.performance_metrics.recall * 100)}%
        </ThemedText>
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
