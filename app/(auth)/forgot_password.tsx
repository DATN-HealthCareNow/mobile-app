import { Ionicons } from "@expo/vector-icons";
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
import { useTheme } from "../../context/ThemeContext";
import { useRequestForgotPasswordOtp } from "../../hooks/useAuth";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState("");
  const requestOtpMutation = useRequestForgotPasswordOtp();

  const handleRequestOtp = () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    requestOtpMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          router.push({
            pathname: "/(auth)/verify_otp",
            params: { email: email.trim() },
          } as any);
        },
        onError: (err: any) => {
          Alert.alert(
            "Gửi mã thất bại",
            err?.response?.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại."
          );
        },
      }
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã xác nhận đến email của bạn.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Địa chỉ Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, requestOtpMutation.isPending && styles.buttonDisabled]}
            onPress={handleRequestOtp}
            disabled={requestOtpMutation.isPending}
          >
            {requestOtpMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Gửi mã xác nhận</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
            <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
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
      backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
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
      lineHeight: 22,
      textAlign: "center",
    },
    form: {
      width: "100%",
    },
    inputContainer: {
      marginBottom: 24,
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
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      marginLeft: 12,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
    },
    backToLoginBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
      gap: 6,
    },
    backToLoginText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
  });
