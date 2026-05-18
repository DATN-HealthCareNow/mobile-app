import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  useConfirmChangeEmail,
  useRequestChangeEmailOtp,
  useSession,
} from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useUser";

export default function ChangeEmailScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const { token, authProvider } = useSession();
  const { data: profile, isLoading: isProfileLoading } = useProfile(token);

  const requestOtpMutation = useRequestChangeEmailOtp();
  const confirmMutation = useConfirmChangeEmail();

  const [step, setStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  const handleRequestOtp = () => {
    if (!newEmail) {
      Alert.alert(t("change_email.error"), t("change_email.invalid_email"));
      return;
    }

    if (authProvider === "password" && !password) {
      Alert.alert(t("change_email.error"), t("change_email.enter_password"));
      return;
    }

    requestOtpMutation.mutate(
      {
        current_email: profile?.email || "",
        new_email: newEmail,
        password: authProvider === "password" ? password : undefined,
      },
      {
        onSuccess: () => {
          setStep(2);
        },
        onError: (err: any) => {
          Alert.alert(
            t("change_email.error"),
            err?.response?.data?.message || t("change_email.send_otp_failed"),
          );
        },
      },
    );
  };

  const handleConfirmChange = () => {
    if (otp.length !== 6) {
      Alert.alert(t("change_email.error"), t("change_password.invalid_otp"));
      return;
    }

    confirmMutation.mutate(
      {
        current_email: profile?.email || "",
        new_email: newEmail,
        otp: otp,
      },
      {
        onSuccess: () => {
          Alert.alert(t("change_email.success"), t("change_email.success_message"), [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert(
            t("change_email.error"),
            err?.response?.data?.message || t("change_email.change_failed"),
          );
        },
      },
    );
  };

  const handleGoogleChange = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const newGoogleEmail = userInfo.data?.user.email || (userInfo as any).user?.email;

      if (newGoogleEmail) {
        // For Google users, we just update the email directly if they re-authenticated
        // We can reuse the confirmChangeEmail logic but maybe we need a specific Google endpoint?
        // Actually, the user said "api đã làm rồi" for password but not for email.
        // My implementation of confirmChangeEmail requires an OTP.
        // For Google, we might want to bypass OTP if we have a valid token.
        
        // Let's just use the same OTP flow for now to keep it simple, 
        // or just update it if we have a special endpoint.
        
        // Since I added confirmChangeEmail with OTP, I'll stick to that or 
        // I can add a direct update for Google.
        
        setNewEmail(newGoogleEmail);
        // Automatically request OTP for the new Google email to verify it's theirs
        requestOtpMutation.mutate(
            {
              current_email: profile?.email || "",
              new_email: newGoogleEmail,
            },
            {
              onSuccess: () => {
                setStep(2);
              },
              onError: (err: any) => {
                Alert.alert(
                  t("change_email.error"),
                  err?.response?.data?.message || t("change_email.send_otp_failed"),
                );
              },
            }
          );
      }
    } catch (error: any) {
      if (error.code !== "SIGN_IN_CANCELLED") {
        Alert.alert(t("change_email.error"), error.message);
      }
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("change_email.title")}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {authProvider === "google" && step === 1 ? (
          <View style={styles.googleContainer}>
            <Ionicons name="logo-google" size={48} color="#DB4437" />
            <Text style={styles.googleTitle}>{t("change_email.google_title")}</Text>
            <Text style={styles.googleSubtitle}>{t("change_email.google_subtitle")}</Text>
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleChange}>
              <Text style={styles.googleBtnText}>{t("change_email.google_btn")}</Text>
            </TouchableOpacity>
          </View>
        ) : step === 1 ? (
          <>
            <Text style={styles.subtitle}>{t("change_email.step1_subtitle")}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("change_email.new_email")}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder={t("change_email.email_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("change_email.current_password")}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder={t("change_email.password_placeholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

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
                <Text style={styles.actionBtnText}>{t("change_email.send_otp")}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>{t("change_email.step2_subtitle")}</Text>
            <View style={{ marginVertical: 30 }}>
              <OtpInput value={otp} onChange={setOtp} />
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleConfirmChange}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.actionBtnText}>{t("change_email.verify_now")}</Text>
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
      marginTop: 20,
    },
    actionBtnText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "bold",
    },
    googleContainer: {
      alignItems: "center",
      marginTop: 40,
    },
    googleTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    googleSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 30,
    },
    googleBtn: {
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderColor: "#DDD",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    googleBtnText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#555",
    },
  });
