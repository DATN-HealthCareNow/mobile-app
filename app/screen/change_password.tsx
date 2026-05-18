import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import OtpInput from "../../components/OtpInput";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import {
  useConfirmChangePassword,
  useRequestChangePasswordOtp,
  useSession,
} from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useUser";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const { token } = useSession();
  const { data: profile, isLoading: isProfileLoading } = useProfile(token);

  const requestOtpMutation = useRequestChangePasswordOtp();
  const confirmMutation = useConfirmChangePassword();

  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(60);
  };

  const handleRequestOtp = () => {
    if (!currentPassword) {
      Alert.alert(
        t("change_password.error"),
        t("change_password.enter_current"),
      );
      return;
    }

    if (!profile?.email) {
      Alert.alert(
        t("change_password.error"),
        t("change_password.profile_not_found"),
      );
      return;
    }

    requestOtpMutation.mutate(
      { email: profile.email, current_password: currentPassword },
      {
        onSuccess: () => {
          setStep(2);
          startCountdown();
        },
        onError: (err: any) => {
          Alert.alert(
            t("change_password.error"),
            err?.response?.data?.message ||
              t("change_password.send_otp_failed"),
          );
        },
      },
    );
  };

  const handleResendOtp = () => {
    if (countdown > 0 || !profile?.email) return;
    requestOtpMutation.mutate(
      { email: profile.email, current_password: currentPassword },
      {
        onSuccess: () => {
          Alert.alert(
            t("change_password.success"),
            t("change_password.resend_success"),
          );
          startCountdown();
        },
        onError: (err: any) => {
          Alert.alert(
            t("change_password.error"),
            err?.response?.data?.message || t("change_password.resend_failed"),
          );
        },
      },
    );
  };

  const handleChangePassword = () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert(
        t("change_password.error"),
        t("change_password.fill_all_fields"),
      );
      return;
    }

    if (!profile?.email) {
      Alert.alert(
        t("change_password.error"),
        t("change_password.profile_not_loaded"),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("change_password.error"),
        t("change_password.passwords_not_match"),
      );
      return;
    }

    confirmMutation.mutate(
      {
        email: profile.email,
        current_password: currentPassword,
        otp,
        new_password: newPassword,
      },
      {
        onSuccess: () => {
          Alert.alert(
            t("change_password.success"),
            t("change_password.success_message"),
            [{ text: t("change_password.ok"), onPress: () => router.back() }],
          );
        },
        onError: (err: any) => {
          Alert.alert(
            t("change_password.error"),
            err?.response?.data?.message || t("change_password.change_failed"),
          );
        },
      },
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === 3) setStep(2);
            else if (step === 2) setStep(1);
            else router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("change_password.title")}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          {step === 1
            ? t("change_password.step1_subtitle")
            : step === 2
              ? t("change_password.step2_subtitle")
              : t("change_password.step3_subtitle")}
        </Text>

        {step === 1 ? (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t("change_password.current_password")}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("change_password.password_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 20 }}
              onPress={() => router.push("/(auth)/forgot_password")}
            >
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                {t("change_password.forgot_password")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                (requestOtpMutation.isPending || isProfileLoading) && { opacity: 0.7 }
              ]}
              onPress={handleRequestOtp}
              disabled={requestOtpMutation.isPending || isProfileLoading}
            >
              {requestOtpMutation.isPending || isProfileLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.actionBtnText}>
                  {t("change_password.send_otp")}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : step === 2 ? (
          <>
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <Text
                style={[styles.headerTitle, { fontSize: 24, marginBottom: 8 }]}
              >
                {t("change_password.verify_identity")}
              </Text>
              <Text style={[styles.subtitle, { textAlign: "center" }]}>
                {t("change_password.enter_code")}&nbsp;
                <Text style={{ fontWeight: "700", color: colors.text }}>
                  {profile?.email}
                </Text>
              </Text>
            </View>

            <View style={{ marginVertical: 20 }}>
              <OtpInput value={otp} onChange={setOtp} />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <Text style={styles.resendText}>
                {t("change_password.resend_code_in")}
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {Math.floor(countdown / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(countdown % 60).toString().padStart(2, "0")}
              </Text>
            </View>

            {countdown === 0 && (
              <TouchableOpacity
                onPress={handleResendOtp}
                style={{ marginTop: 10, alignItems: "center" }}
              >
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {t("change_password.resend_otp")}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 40 }]}
              onPress={() => {
                if (otp.length === 6) setStep(3);
                else
                  Alert.alert(
                    t("change_password.error"),
                    t("change_password.invalid_otp"),
                  );
              }}
            >
              <Text style={styles.actionBtnText}>
                {t("change_password.verify_now")}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t("change_password.new_password")}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("change_password.password_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t("change_password.confirm_password")}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("change_password.password_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 40 }]}
              onPress={handleChangePassword}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.actionBtnText}>
                  {t("change_password.update_password")}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    content: {
      padding: 24,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 30,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: colors.text,
    },
    actionBtn: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
    },
    actionBtnText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "bold",
    },
    resendText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });
