import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from "../../context/ThemeContext";
import { Typography } from "../../constants/typography";
import { useLogout, useSession } from "../../hooks/useAuth";
import { useProfile, useUploadAvatar } from "../../hooks/useUser";

export default function Profile() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const logout = useLogout();
  const { token } = useSession();
  const { data: profile, isLoading } = useProfile(token);
  const uploadAvatarMutation = useUploadAvatar();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      // @ts-ignore
      formData.append('file', { uri, name: filename, type });

      uploadAvatarMutation.mutate(formData, {
        onSuccess: () => {
          Alert.alert("Success", "Avatar updated successfully!");
        },
        onError: () => {
          Alert.alert("Error", "Failed to upload avatar.");
        }
      });
    }
  };

  const styles = createStyles(colors, isDark);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Helper to calculate age from DOB
  const calculateAge = (dobString?: string) => {
    if (!dobString) return "--";
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age.toString();
  };

  const getAvatarSource = () => {
    const avatar = profile?.avatarUrl || profile?.avatar_url;
    if (avatar) {
      return { uri: avatar };
    }
    if (profile?.gender === 'Male') {
      return require("../../assets/images/avatar_male.png");
    }
    return require("../../assets/images/avatar_female.png");
  };

  return (
    <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={isDark ? ["#0d1c2e", "#12263d"] : ["#b9dbf5", "#d7ebfa", "#e7f2fb"]}
        style={styles.heroBg}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={toggleTheme}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/screen/settings")}>
          <Ionicons name="settings-outline" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* AVATAR */}
      <View style={styles.avatarWrapper}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.avatarBorder}
        >
          <Image
            source={getAvatarSource()}
            style={styles.avatar}
          />
        </LinearGradient>

        <TouchableOpacity 
            style={styles.editBtn} 
            onPress={handlePickImage}
            disabled={uploadAvatarMutation.isPending}
        >
          {uploadAvatarMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
          ) : (
              <Ionicons name="pencil" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* NAME */}
      <Text style={styles.name}>{profile?.fullName || profile?.full_name || "New User"}</Text>

      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        <Text style={styles.badgeText}> Premium Member</Text>
      </View>

      {/* BODY METRICS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Body Metrics</Text>
        <TouchableOpacity onPress={() => router.push('/screen/metric_entry')}>
          <Text style={styles.updateText}>Update</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <MetricCard
          icon={<MaterialIcons name="height" size={24} color={colors.primary} />}
          label="Height"
          value={profile?.height?.toString() || "--"}
          unit="cm"
          colors={colors}
          styles={styles}
        />

        <MetricCard
          icon={<FontAwesome5 name="weight" size={20} color={colors.accent} />}
          label="Weight"
          value={profile?.weight?.toString() || "--"}
          unit="kg"
          colors={colors}
          styles={styles}
        />

        <MetricCard
          icon={<Ionicons name="gift" size={22} color="#a855f7" />}
          label="Age"
          value={calculateAge(profile?.dateOfBirth || profile?.date_of_birth)}
          unit="yrs"
          colors={colors}
          styles={styles}
        />

        <MetricCard
          icon={<Ionicons name="male-female" size={22} color="#6366f1" />}
          label="Gender"
          value={profile?.gender || "--"}
          colors={colors}
          styles={styles}
        />
      </View>

      {/* ACCOUNT */}
      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Account</Text>

      <AccountItem icon="person-outline" title="Personal Data" colors={colors} styles={styles} onPress={() => router.push('/screen/personal_data')} />
      <AccountItem icon="notifications-outline" title="Notifications" colors={colors} styles={styles} onPress={() => router.push('/screen/notifications')} />
      <AccountItem icon="card-outline" title="Subscription Plan" colors={colors} styles={styles} onPress={() => router.push('/screen/subscription')} />
      <AccountItem icon="log-out-outline" title="Logout" danger onPress={handleLogout} colors={colors} styles={styles} />
      
      <View style={{height: 120}} />
    </ScrollView>
  );
}

function MetricCard({ icon, label, value, unit, colors, styles }: any) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.background }]}>{icon}</View>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text style={[styles.cardValue, { color: colors.text }]}>{value}</Text>
        {unit && <Text style={styles.cardUnit}> {unit}</Text>}
      </View>
    </View>
  );
}

function AccountItem({ icon, title, danger, onPress, colors, styles }: any) {
  return (
    <TouchableOpacity style={[styles.accountItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <Ionicons
        name={icon}
        size={22}
        color={danger ? colors.error : colors.text}
      />
      <Text
        style={[
          styles.accountText,
          { color: colors.text },
          danger && { color: colors.error },
        ]}
      >
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  heroBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 420,
  },
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.card,
  },
  editBtn: {
    position: "absolute",
    bottom: 5,
    right: "35%",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.background,
  },
  name: {
    ...Typography.heading,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    color: colors.text,
  },
  badge: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
  },
  badgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  updateText: {
    color: colors.primary,
    fontWeight: "700",
  },
  grid: {
    marginTop: 16,
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
    shadowColor: "#0b3f64",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.12 : 0.06,
    shadowRadius: 10,
    elevation: 3,
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
    ...Typography.heading,
    fontSize: 26,
    fontWeight: "700",
  },
  cardUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 2,
  },
  accountItem: {
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    shadowColor: "#0b3f64",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.1 : 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  accountText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});