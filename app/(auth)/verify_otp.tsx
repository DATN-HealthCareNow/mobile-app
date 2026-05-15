import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import OtpInput from "../../components/OtpInput";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useRequestForgotPasswordOtp } from "../../hooks/useAuth";

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestOtpMutation = useRequestForgotPasswordOtp();

  // Countdown timer for resend
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (!canResend || !email) return;
    requestOtpMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setOtp("");
          startCountdown();
          Alert.alert(
            t("auth.verify.resend_success_title"),
            t("auth.verify.resend_success_message"),
          );
        },
        onError: (err: any) => {
          Alert.alert(
            t("auth.verify.resend_failed_title"),
            err?.response?.data?.message ||
              t("auth.verify.resend_failed_message"),
          );
        },
      },
    );
  };

  const handleVerify = () => {
    if (!otp || otp.length < 6) {
      Alert.alert(t("auth.common.error"), t("auth.verify.invalid_otp"));
      return;
    }
    // Navigate to reset_password with email and otp
    router.push({
      pathname: "/(auth)/reset_password",
      params: { email, otp },
    } as any);
  };

  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>{t("auth.verify.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.verify.subtitle")}</Text>
          <Text style={styles.emailHighlight}>{email}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.otpSection}>
            <Text style={styles.label}>{t("auth.verify.enter_code")}</Text>
            <OtpInput value={otp} onChange={setOtp} length={6} />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              otp.length < 6 && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otp.length < 6}
          >
            <Text style={styles.buttonText}>{t("auth.verify.confirm")}</Text>
          </TouchableOpacity>

          {/* Resend section */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>
              {t("auth.verify.not_received")}
            </Text>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={requestOtpMutation.isPending}
              >
                {requestOtpMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.resendLink}>
                    {t("auth.verify.resend")}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdownText}>
                {t("auth.verify.resend_after", "Resend after")} {countdown}s
              </Text>
            )}
          </View>

          {/* Security note */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              {t("auth.verify.security_note")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 24,
      paddingTop: Platform.OS === "ios" ? 60 : 40,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
    },
    header: {
      marginBottom: 40,
      alignItems: "center",
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark
        ? "rgba(59,130,246,0.15)"
        : "rgba(59,130,246,0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    emailHighlight: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primary,
      marginTop: 4,
      textAlign: "center",
    },
    form: {
      width: "100%",
    },
    otpSection: {
      marginBottom: 32,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    primaryButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
    },
    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
    },
    resendLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    resendLink: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
    },
    countdownText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
      borderRadius: 12,
      padding: 12,
      marginTop: 32,
      gap: 8,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
