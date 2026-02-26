import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SESSION_SAMPLE } from "@/constants/sessions";
import { SAMPLE_USER_DATA } from "@/constants/users";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

export default function SettingsScreen() {
  const user = SAMPLE_USER_DATA;
  const session = SESSION_SAMPLE;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#ECEFF1", dark: "#121314" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText>{user.profile.full_name}</ThemedText>
        <ThemedText>Email: {user.email}</ThemedText>
        <ThemedText>
          Gender: {user.profile.gender} • {user.profile.height_cm}cm /{" "}
          {user.profile.weight_kg}kg
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Privacy</ThemedText>
        <ThemedText>
          Data Sharing: {user.privacy_settings.data_sharing ? "On" : "Off"}
        </ThemedText>
        <ThemedText>
          Marketing Emails:{" "}
          {user.privacy_settings.marketing_emails ? "On" : "Off"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Emergency Contacts</ThemedText>
        {user.emergency_contacts.map((c, i) => (
          <ThemedText key={i}>
            • {c.name} ({c.priority}) — {c.phone} {c.verified ? "✅" : ""}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Session</ThemedText>
        <ThemedText>
          Status: {session.revoked ? "Revoked" : "Active"}
        </ThemedText>
        <ThemedText>
          Expires: {new Date(session.expires_at).toLocaleString()}
        </ThemedText>
        <ThemedText>Device: {session.device_info.user_agent}</ThemedText>
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
