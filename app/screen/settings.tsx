import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from "../../context/ThemeContext";
import { useLogout, useSession } from "../../hooks/useAuth";
import { useProfile, useUploadAvatar } from "../../hooks/useUser";

export default function Settings() {
  const router = useRouter();
  const logout = useLogout();
  const { colors, isDark, toggleTheme } = useTheme();
  const { token } = useSession();
  const { data: profile } = useProfile(token);
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

  const getAvatarSource = () => {
    if (profile?.avatar_url) {
      return { uri: profile.avatar_url };
    }
    if (profile?.gender === 'Male') {
      return require("../../assets/images/avatar_male.png");
    }
    return require("../../assets/images/avatar_female.png");
  };

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* PROFILE */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
                source={getAvatarSource()}
                style={styles.avatarMini}
            />
            <View style={styles.activeDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || "New User"}</Text>
            <Text style={styles.profileSub}>Premium Member</Text>
          </View>
          <TouchableOpacity
              style={styles.editBtn}
              onPress={handlePickImage}
              disabled={uploadAvatarMutation.isPending}
          >
            {uploadAvatarMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
            ) : (
                <Ionicons name="create-outline" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingItem icon="person-outline" title="Personal Info" colors={colors} styles={styles} isDark={isDark} />
          <Divider colors={colors} styles={styles} />
          <SettingItem icon="notifications-outline" title="Notifications" colors={colors} styles={styles} isDark={isDark} />
          <Divider colors={colors} styles={styles} />
          <SettingItem icon="shield-checkmark-outline" title="Security & Privacy" colors={colors} styles={styles} isDark={isDark} />
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="moon" size={18} color={colors.primary} />
              </View>
              <Text style={styles.itemText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#E2E8F0", true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
          <Divider colors={colors} styles={styles} />
          <SettingItem icon="globe-outline" title="Language" rightText="English" colors={colors} styles={styles} isDark={isDark} />
        </View>

        {/* DEVICE */}
        <Text style={styles.sectionTitle}>DEVICE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.itemText}>Apple iPhone</Text>
                <Text style={styles.itemSubText}>
                  <Text style={{ color: colors.success, fontSize: 10 }}>● </Text>
                  Active - Health Kit
                </Text>
              </View>
            </View>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v2.4.0 (Healthcare Now)</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
  );
}

function SettingItem({ icon, title, rightText, colors, styles, isDark }: any) {
  return (
    <TouchableOpacity style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.itemText}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function Divider({ colors, styles }: any) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarMini: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
  },
  activeDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  profileSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 25,
    marginBottom: 12,
    letterSpacing: 1,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  itemSubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  logoutBtn: {
    marginTop: 32,
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 24,
  },
});