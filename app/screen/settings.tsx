import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Settings() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <LinearGradient
      colors={["#0D5B8C", "#009DE0"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.headerRightBtn}>
            <Ionicons name="settings" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PROFILE */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("@/assets/images/logo.jpg")}
              style={styles.avatar}
            />
            <View style={styles.activeDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sarah Jenkins</Text>
            <Text style={styles.profileSub}>Premium Member</Text>
          </View>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingItem icon="person-outline" title="Personal Info" />
          <Divider />
          <SettingItem icon="notifications-outline" title="Notifications" />
          <Divider />
          <SettingItem icon="shield-checkmark-outline" title="Security & Privacy" />
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="moon" size={18} color="#fff" />
              </View>
              <Text style={styles.itemText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "rgba(255,255,255,0.3)", true: "rgba(255,255,255,0.8)" }}
              thumbColor={darkMode ? "#fff" : "#f1f5f9"}
            />
          </View>
          <Divider />
          <SettingItem icon="globe-outline" title="Language" rightText="English" />
        </View>

        {/* DEVICE */}
        <Text style={styles.sectionTitle}>DEVICE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.itemText}>Apple iPhone</Text>
                <Text style={styles.itemSubText}>
                  <Text style={{ color: "#34d399", fontSize: 10 }}>● </Text>
                  Active - Health Kit
                </Text>
              </View>
            </View>
            <Ionicons name="settings" size={20} color="rgba(255,255,255,0.6)" />
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>HealthCare Now App v2.4.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

function SettingItem({ icon, title, rightText }: any) {
  return (
    <TouchableOpacity style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={18} color="#fff" />
        </View>
        <Text style={styles.itemText}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerRightBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "#fff",
  },
  activeDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#34d399",
    borderWidth: 2,
    borderColor: "#0D5B8C",
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  profileSub: {
    fontSize: 14,
    color: "#bae6fd",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 25,
    marginBottom: 10,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  itemSubText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  rightText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginLeft: 50, // offset to align with text
  },
  logoutBtn: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 20,
  },
});