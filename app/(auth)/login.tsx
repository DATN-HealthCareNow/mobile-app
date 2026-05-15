import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { userService } from "../../api/services/userService";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useGoogleLogin, useLogin } from "../../hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(t("auth.common.error"), t("auth.login.validation_missing"));
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.replace("/(tabs)");
        },
        onError: (err: any) => {
          Alert.alert(
            t("auth.login.failed_title"),
            err?.response?.data?.message || t("auth.login.failed_message"),
          );
        },
      },
    );
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      try {
        // Force account picker every time by signing out of the previous cached session
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore if not previously signed in
      }
      const userInfo = await GoogleSignin.signIn();
      await GoogleSignin.getTokens(); // Ensure tokens are retrieved

      const idToken =
        (userInfo as any).data?.idToken || (userInfo as any).idToken;
      if (idToken) {
        googleLoginMutation.mutate(
          { id_token: idToken },
          {
            onSuccess: async (data: any) => {
              if (data?.is_new_user || data?.isNewUser) {
                router.replace("/screen/metric_entry");
                return;
              }

              // Fallback: some backends do not return is_new_user for Google login.
              try {
                const profile = await userService.get_profile();
                const hasWeight = Number(profile?.weight) > 0;
                const hasHeight = Number(profile?.height) > 0;
                if (!hasWeight || !hasHeight) {
                  router.replace("/screen/metric_entry");
                  return;
                }
              } catch (profileErr) {
                console.warn(
                  "Failed to check profile completeness after Google login:",
                  profileErr,
                );
              }

              router.replace("/(tabs)");
            },
            onError: (err: any) =>
              Alert.alert(
                t("auth.login.google_failed_title"),
                err?.response?.data?.message ||
                  err?.message ||
                  t("auth.common.try_again"),
              ),
          },
        );
      } else {
        Alert.alert(t("auth.common.error"), t("auth.login.google_token_error"));
      }
    } catch (error: any) {
      if (error.code !== "SIGN_IN_CANCELLED") {
        console.error("Google login error", error);
        Alert.alert(t("auth.login.google_error_title"), error.message);
      }
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Healthcare Now</Text>
          <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("auth.login.email_label")}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder={t("auth.login.email_placeholder")}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("auth.login.password_label")}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
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
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>
                {t("auth.login.sign_in")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push("/(auth)/forgot_password")}
          >
            <Text style={styles.forgotText}>
              {t("auth.login.forgot_password")}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("auth.login.or")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={googleLoginMutation.isPending}
          >
            {googleLoginMutation.isPending ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#DB4437"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.googleButtonText}>
                  {t("auth.login.continue_google")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("auth.login.no_account")}</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.signUpText}>{t("auth.login.sign_up")}</Text>
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
    inner: {
      flexGrow: 1,
      padding: 24,
      paddingBottom: 60,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 48,
    },
    logoImage: {
      width: 100,
      height: 100,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      letterSpacing: 2,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
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
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      marginLeft: 12,
    },
    loginButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    loginButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
    },
    forgotBtn: {
      alignItems: "center",
      marginTop: 16,
    },
    forgotText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "500",
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 24,
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 16,
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
    },
    googleButton: {
      flexDirection: "row",
      backgroundColor: colors.card,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    googleButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 40,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    signUpText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
  });
