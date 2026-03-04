import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Settings() {
  const router = useRouter();
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        <View style={styles.rightCircle}>
          <Ionicons name="play" size={18} color="#fff" />
        </View>
      </View>

      {/* ACCOUNT */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>

      <View style={styles.card}>
        <SettingItem icon="shield-checkmark" title="Security" />
        <Divider />
        <SettingItem icon="notifications" title="Notifications" />
      </View>

      {/* APP */}
      <Text style={styles.sectionLabel}>APP</Text>

      <View style={styles.card}>
        <SettingItem
          icon="globe-outline"
          title="Language"
          rightText="English"
        />
        <Divider />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconCircle, { backgroundColor: "#d1fae5" }]}>
              <Ionicons name="moon" size={18} color="#059669" />
            </View>
            <Text style={styles.itemText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#cbd5e1", true: "#0ea5e9" }}
          />
        </View>
      </View>

      {/* DEVICES */}
      <Text style={styles.sectionLabel}>DEVICES</Text>

      <View style={styles.card}>
        <SettingItem
          icon="watch-outline"
          title="IoT Watch"
          rightText="Connected"
          rightColor="#16a34a"
        />
        <Divider />
        <SettingItem
          icon="scale-outline"
          title="Smart Scale"
          rightText="Not Paired"
        />
      </View>

      {/* SUPPORT */}
      <Text style={styles.sectionLabel}>SUPPORT</Text>

      <View style={styles.card}>
        <SettingItem icon="help-circle-outline" title="Help Center" />
      </View>
    </ScrollView>
  );
}

/* COMPONENTS */

function SettingItem({
  icon,
  title,
  rightText,
  rightColor,
}: any) {
  return (
    <TouchableOpacity style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={18} color="#0ea5e9" />
        </View>
        <Text style={styles.itemText}>{title}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {rightText && (
          <Text style={[styles.rightText, rightColor && { color: rightColor }]}>
            {rightText}
          </Text>
        )}
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#94a3b8"
        />
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  rightCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionLabel: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  itemText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },

  rightText: {
    marginRight: 8,
    fontSize: 14,
    color: "#64748b",
  },

  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
});