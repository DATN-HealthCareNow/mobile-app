import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "../../hooks/useAuth";
import { useSubscriptionStatus } from "../../hooks/useSubscription";
import { iotService } from "../../api/services/iotService";

type SectionItem = {
  icon: string;
  iconLib?: "ion" | "mci";
  titleKey: string;
  subtitleKey: string;
  type: "toggle" | "action" | "link";
  toggleKey?: string;
  danger?: boolean;
  actionKey?: string;
};

const SECTIONS: { titleKey: string; items: SectionItem[] }[] = [
  {
    titleKey: "security.account_auth_section",
    items: [
      {
        icon: "key-outline",
        titleKey: "security.change_password",
        subtitleKey: "security.change_password_subtitle",
        type: "link",
        actionKey: "change_password",
      },
      {
        icon: "mail-outline",
        titleKey: "security.change_email",
        subtitleKey: "security.change_email_subtitle",
        type: "link",
        actionKey: "change_email",
      },
      {
        icon: "sync-circle-outline",
        titleKey: "security.auto_google_fit",
        subtitleKey: "security.auto_google_fit_subtitle",
        type: "toggle",
        toggleKey: "autoConnectGoogleFit",
      },
    ],
  },
  {
    titleKey: "security.security_alerts_section",
    items: [
      {
        icon: "notifications-outline",
        titleKey: "security.login_alert",
        subtitleKey: "security.login_alert_subtitle",
        type: "toggle",
        toggleKey: "loginAlert",
      },
    ],
  },
  {
    titleKey: "security.data_account_section",
    items: [
      {
        icon: "download-outline",
        titleKey: "security.export_google_fit",
        subtitleKey: "security.export_google_fit_subtitle",
        type: "action",
        actionKey: "export_google_fit",
      },
      {
        icon: "document-text-outline",
        titleKey: "security.privacy_policy",
        subtitleKey: "security.privacy_policy_subtitle",
        type: "action",
        actionKey: "privacy_policy",
      },
      {
        icon: "trash-outline",
        titleKey: "security.delete_account",
        subtitleKey: "security.delete_account_subtitle",
        type: "action",
        danger: true,
        actionKey: "delete_account",
      },
    ],
  },
];

export default function SecurityPrivacyScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors, isDark);
  const { userId, authProvider } = useSession();
  const { data: subscription } = useSubscriptionStatus();

  const filteredSections = SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.actionKey === 'change_password' && authProvider === 'google') {
        return false;
      }
      return true;
    })
  }));

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    autoConnectGoogleFit: false,
    loginAlert: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;
      const autoConnect = await SecureStore.getItemAsync(
        `autoConnectGoogleFit_${userId}`,
      );
      const biometric = await SecureStore.getItemAsync(`biometric_${userId}`);
      const loginAlert = await SecureStore.getItemAsync(`loginAlert_${userId}`);

      setToggles({
        autoConnectGoogleFit: autoConnect === "true",
        loginAlert: loginAlert !== "false", // Default to true
      });
    };
    loadSettings();
  }, [userId]);

  const handleToggle = async (key: string) => {
    const newValue = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: newValue }));
    if (userId) {
      await SecureStore.setItemAsync(`${key}_${userId}`, String(newValue));
      if (key === "autoConnectGoogleFit") {
        Alert.alert(
          t("security.notification"),
          newValue
            ? t("security.auto_fit_enabled")
            : t("security.auto_fit_disabled"),
        );
      }
    }
  };

  const handleExportData = async (format: "json" | "xml") => {
    try {
      const today = new Date().toISOString().split("T")[0];

      if (!subscription?.is_premium && userId) {
        const lastExportDate = await SecureStore.getItemAsync(`lastExportDate_${userId}`);
        if (lastExportDate === today) {
          Alert.alert(
            t("premium.limit_reached", "Đã đạt giới hạn"),
            t("premium.description", "Bạn đã đạt đến giới hạn số lần sử dụng cho {featureName}.")
              .replace("{featureName}", t("security.export_google_fit", "Xuất dữ liệu"))
          );
          return;
        }
      }

      // Get last 30 days of data
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const metrics = await iotService.getWeeklyReport(startDate, endDate);

      if (!metrics || metrics.length === 0) {
        Alert.alert(t("security.notification"), t("security.error_no_data"));
        return;
      }

      let fileContent = "";
      let fileName = `HealthMetrics_${startDate}_to_${endDate}`;

      if (format === "json") {
        fileContent = JSON.stringify(metrics, null, 2);
        fileName += ".json";
      } else {
        fileContent = '<?xml version="1.0" encoding="UTF-8"?>\n<HealthMetrics>\n';
        metrics.forEach((item: any) => {
          fileContent += "  <Day>\n";
          fileContent += `    <Date>${item.date_string}</Date>\n`;
          if (item.metrics) {
            Object.keys(item.metrics).forEach((key) => {
              fileContent += `    <${key}>${item.metrics[key]}</${key}>\n`;
            });
          }
          fileContent += "  </Day>\n";
        });
        fileContent += "</HealthMetrics>";
        fileName += ".xml";
      }
  
      // Force cast to any to bypass broken TS definitions in the environment
      const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
      const fileUri = docDir + fileName;
      
      // Force cast to any to bypass broken TS definitions
      await (FileSystem as any).writeAsStringAsync(fileUri, fileContent);
  
      if (!subscription?.is_premium && userId) {
        await SecureStore.setItemAsync(`lastExportDate_${userId}`, today);
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(t("security.notification"), t("security.sharing_unavailable"));
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      Alert.alert(t("security.error"), error.message || "Export failed");
    }
  };

  const handleAction = (actionKey?: string) => {
    if (actionKey === "delete_account") {
      Alert.alert(
        t("security.delete_confirm_title"),
        t("security.delete_confirm_message"),
        [
          { text: t("security.cancel"), style: "cancel" },
          {
            text: t("security.delete_confirm_button"),
            style: "destructive",
            onPress: () =>
              Alert.alert(
                t("security.notification"),
                t("security.delete_success_message"),
              ),
          },
        ],
      );
    } else if (actionKey === "export_google_fit") {
      Alert.alert(
        t("security.export_format_title"),
        t("security.export_format_message"),
        [
          {
            text: t("security.export_json"),
            onPress: () => handleExportData("json"),
          },
          {
            text: t("security.export_xml"),
            onPress: () => handleExportData("xml"),
          },
          { text: t("security.cancel"), style: "cancel" },
        ],
      );
    } else if (actionKey === "privacy_policy") {
      Alert.alert(t("security.policy_title"), t("security.policy_content"));
    } else if (actionKey === "change_email") {
      router.push("/screen/change_email" as any);
    } else if (actionKey === "change_password") {
      router.push("/screen/change_password" as any);
    } else {
      Alert.alert(t("security.notification"), t("security.feature_developing"));
    }
  };

  const renderItem = (item: SectionItem, isLast: boolean) => {
    const iconColor = item.danger ? "#ef4444" : colors.primary;
    const iconBg = item.danger
      ? isDark
        ? "rgba(239,68,68,0.12)"
        : "rgba(239,68,68,0.08)"
      : isDark
        ? "rgba(96,165,250,0.1)"
        : "rgba(59,130,246,0.1)";

    return (
      <View key={item.titleKey}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={item.type === "toggle" ? 1 : 0.7}
          onPress={() => {
            if (item.type === "toggle" && item.toggleKey) {
              handleToggle(item.toggleKey);
            } else {
              handleAction(item.actionKey);
            }
          }}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={item.icon as any} size={19} color={iconColor} />
          </View>
          <View style={styles.rowContent}>
            <Text
              style={[styles.rowTitle, item.danger && { color: "#ef4444" }]}
            >
              {t(item.titleKey)}
            </Text>
            <Text style={styles.rowSub}>{t(item.subtitleKey)}</Text>
          </View>
          {item.type === "toggle" && item.toggleKey ? (
            <Switch
              value={toggles[item.toggleKey]}
              onValueChange={() => handleToggle(item.toggleKey!)}
              trackColor={{ false: "#cbd5e1", true: colors.primary }}
              thumbColor="#fff"
            />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={item.danger ? "#ef4444" : colors.textSecondary}
            />
          )}
        </TouchableOpacity>
        {!isLast && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isDark ? ["#0d1c2e", "#12263d"] : ["#b9dbf5", "#d7ebfa", "#e7f2fb"]
        }
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("security.title")}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HERO BADGE */}
        <View style={styles.heroBadge}>
          <LinearGradient
            colors={["#2563eb", "#0ea5e9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBadgeGradient}
          >
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroBadgeTitle}>
              {t("security.hero_title")}
            </Text>
            <Text style={styles.heroBadgeSub}>
              {t("security.hero_subtitle")}
            </Text>
          </View>
        </View>

        {/* SECTIONS */}
        {filteredSections.map((section) => (
          <View key={section.titleKey}>
            <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) =>
                renderItem(item, idx === section.items.length - 1),
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 12,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
    },
    scroll: {
      paddingHorizontal: 16,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      gap: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#0b3f64",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.2 : 0.07,
      shadowRadius: 10,
      elevation: 3,
    },
    heroBadgeGradient: {
      width: 60,
      height: 60,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    heroBadgeTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    heroBadgeSub: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 17,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      color: colors.textSecondary,
      marginTop: 24,
      marginBottom: 10,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      gap: 12,
    },
    iconCircle: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    rowContent: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    rowSub: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 50,
    },
  });
