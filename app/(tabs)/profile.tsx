import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const router = useRouter();
export default function Profile() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons name="moon" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push({
            pathname: "/screen/settings",
          })}>
          <Ionicons name="settings-outline" size={26} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* AVATAR */}
      <View style={styles.avatarWrapper}>
        <LinearGradient
          colors={["#3b82f6", "#06b6d4"]}
          style={styles.avatarBorder}
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/6997/6997662.png",
            }}
            style={styles.avatar}
          />
        </LinearGradient>

        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* NAME */}
      <Text style={styles.name}>Nguyen Cong Danh</Text>

      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={16} color="#2563eb" />
        <Text style={styles.badgeText}> Premium Member</Text>
      </View>

      {/* BODY METRICS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Body Metrics</Text>
        <TouchableOpacity>
          <Text style={styles.updateText}>Update</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <MetricCard
          icon={<MaterialIcons name="height" size={24} color="#3b82f6" />}
          label="Height"
          value="175"
          unit="cm"
        />

        <MetricCard
          icon={<FontAwesome5 name="weight" size={20} color="#06b6d4" />}
          label="Weight"
          value="70"
          unit="kg"
        />

        <MetricCard
          icon={<Ionicons name="gift" size={22} color="#a855f7" />}
          label="Age"
          value="28"
          unit="yrs"
        />

        <MetricCard
          icon={<Ionicons name="male-female" size={22} color="#6366f1" />}
          label="Gender"
          value="Male"
        />
      </View>

      {/* ACCOUNT */}
      <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Account</Text>

      <AccountItem icon="person-outline" title="Personal Data" />
      <AccountItem icon="notifications-outline" title="Notifications" />
      <AccountItem icon="card-outline" title="Subscription Plan" />
      <AccountItem icon="log-out-outline" title="Logout" danger />
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function MetricCard({ icon, label, value, unit }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>{icon}</View>

      <Text style={styles.cardLabel}>{label}</Text>

      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text style={styles.cardValue}>{value}</Text>
        {unit && <Text style={styles.cardUnit}> {unit}</Text>}
      </View>
    </View>
  );
}

function AccountItem({ icon, title, danger }: any) {
  return (
    <TouchableOpacity style={styles.accountItem}>
      <Ionicons
        name={icon}
        size={22}
        color={danger ? "#ef4444" : "#334155"}
      />
      <Text
        style={[
          styles.accountText,
          danger && { color: "#ef4444" },
        ]}
      >
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  circleBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarWrapper: {
    alignItems: "center",
    marginTop: 20,
  },

  avatarBorder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 125,
    height: 125,
    borderRadius: 62,
    backgroundColor: "#fff",
  },

  editBtn: {
    position: "absolute",
    bottom: 10,
    right: 115,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 15,
    color: "#0f172a",
  },

  badge: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignItems: "center",
  },

  badgeText: {
    color: "#2563eb",
    fontWeight: "600",
  },

  sectionHeader: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  updateText: {
    color: "#0ea5e9",
    fontWeight: "600",
  },

  grid: {
    marginTop: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    elevation: 4,
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  cardLabel: {
    color: "#64748b",
    marginBottom: 5,
  },

  cardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },

  cardUnit: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },

  accountItem: {
    marginTop: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accountText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#334155",
  },
});