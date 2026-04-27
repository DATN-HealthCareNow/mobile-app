import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useTheme } from "../../context/ThemeContext";
import { useConfirmForgotPassword } from "../../hooks/useAuth";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const confirmMutation = useConfirmForgotPassword();

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: "Yếu", color: "#ef4444", width: "25%" };
    if (pwd.length < 8) return { label: "Trung bình", color: "#f59e0b", width: "55%" };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))
      return { label: "Rất mạnh", color: "#10b981", width: "100%" };
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd))
      return { label: "Mạnh", color: "#3b82f6", width: "80%" };
    return { label: "Trung bình", color: "#f59e0b", width: "55%" };
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    confirmMutation.mutate(
      { email: email ?? "", otp: otp ?? "", new_password: newPassword },
      {
        onSuccess: () => {
          Alert.alert(
            "Thành công! 🎉",
            "Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại.",
            [
              {
                text: "Đăng nhập",
                onPress: () => router.replace("/(auth)/login"),
              },
            ]
          );
        },
        onError: (err: any) => {
          Alert.alert(
            "Đặt lại thất bại",
            err?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn."
          );
        },
      }
    );
  };

  const strength = getPasswordStrength(newPassword);
  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="key" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Đặt mật khẩu mới</Text>
          <Text style={styles.subtitle}>
            Tạo mật khẩu mới cho tài khoản của bạn. Hãy chọn mật khẩu mạnh và dễ nhớ.
          </Text>
        </View>

        <View style={styles.form}>
          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Password strength bar */}
            {strength && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBg}>
                  <View
                    style={[
                      styles.strengthBar,
                      { width: strength.width as any, backgroundColor: strength.color },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={[
              styles.inputWrapper,
              confirmPassword.length > 0 && newPassword !== confirmPassword
                ? styles.inputError
                : confirmPassword.length > 0 && newPassword === confirmPassword
                ? styles.inputSuccess
                : null,
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text style={styles.errorHint}>Mật khẩu không khớp</Text>
            )}
          </View>

          {/* Requirements */}
          <View style={styles.requirementBox}>
            <Text style={styles.requirementTitle}>Yêu cầu mật khẩu:</Text>
            <RequirementItem
              met={newPassword.length >= 6}
              text="Ít nhất 6 ký tự"
              colors={colors}
            />
            <RequirementItem
              met={/[A-Z]/.test(newPassword)}
              text="Có chữ hoa (khuyến khích)"
              colors={colors}
            />
            <RequirementItem
              met={/[0-9]/.test(newPassword)}
              text="Có chữ số (khuyến khích)"
              colors={colors}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (confirmMutation.isPending || newPassword.length < 6 || newPassword !== confirmPassword)
                && styles.buttonDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={
              confirmMutation.isPending ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
            }
          >
            {confirmMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Xác nhận đặt lại mật khẩu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RequirementItem({
  met,
  text,
  colors,
}: {
  met: boolean;
  text: string;
  colors: any;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 }}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={met ? "#10b981" : colors.textSecondary}
      />
      <Text
        style={{
          fontSize: 13,
          color: met ? "#10b981" : colors.textSecondary,
          fontWeight: met ? "600" : "400",
        }}
      >
        {text}
      </Text>
    </View>
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
      marginBottom: 32,
      alignItems: "center",
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 21,
      textAlign: "center",
    },
    form: {
      width: "100%",
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      marginLeft: 4,
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
    inputError: {
      borderColor: "#ef4444",
    },
    inputSuccess: {
      borderColor: "#10b981",
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      marginLeft: 12,
    },
    strengthContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 10,
    },
    strengthBarBg: {
      flex: 1,
      height: 4,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
      borderRadius: 2,
      overflow: "hidden",
    },
    strengthBar: {
      height: 4,
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: "600",
      minWidth: 60,
      textAlign: "right",
    },
    errorHint: {
      fontSize: 12,
      color: "#ef4444",
      marginTop: 6,
      marginLeft: 4,
    },
    requirementBox: {
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      borderRadius: 14,
      padding: 14,
      marginBottom: 24,
    },
    requirementTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      flexDirection: "row",
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
  });
