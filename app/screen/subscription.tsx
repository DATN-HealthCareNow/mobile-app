import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import {
  useSubscriptionStatus,
  useCreateSubscriptionOrder,
  useVerifyOrder,
} from "../../hooks/useSubscription";
import { useLanguage } from "../../context/LanguageContext";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const queryStatus = useSubscriptionStatus();
  const createOrderMutation = useCreateSubscriptionOrder();
  const verifyOrderMutation = useVerifyOrder();

  const [showWebView, setShowWebView] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [currentOrderCode, setCurrentOrderCode] = useState<number | null>(null);

  const sub = queryStatus.data;
  const isPremium = sub?.is_premium;

  const styles = createStyles(colors, isDark);

  const handleUpgradePress = () => {
    if (isPremium) {
      Alert.alert(
        t("common.already_premium", "Already Premium"),
        t("common.already_premium_msg", "You are already a Premium member! 🎉"),
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await createOrderMutation.mutateAsync({
        plan: "PREMIUM",
        amount: 10000,
        return_url: "https://healthcarenow.app/success",
        cancel_url: "https://healthcarenow.app/cancel",
      });
      const payload: any = (response as any)?.data ?? response;

      if (payload?.checkout_url) {
        setCheckoutUrl(payload.checkout_url);
        setCurrentOrderCode(payload.order_code);
        setShowConfirmModal(false);
        setShowWebView(true);
      }
    } catch (error: any) {
      Alert.alert(
        t("auth.common.error", "Error"),
        error?.response?.data?.message ||
          t("common.failed_create_order", "Failed to create payment order."),
      );
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url.includes("success")) {
      setShowWebView(false);
      Alert.alert(
        t("auth.verify_register.success_title", "Success"),
        t(
          "common.payment_success",
          "Payment successful! Your account is being upgraded.",
        ),
      );
      queryStatus.refetch();
    } else if (navState.url.includes("cancel")) {
      setShowWebView(false);
      Alert.alert(
        t("common.cancelled", "Cancelled"),
        t("common.payment_cancelled", "Payment was cancelled."),
      );
    }
  };

  if (queryStatus.isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}></Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {t("subscription.plans", "Subscription Plans")}
          </Text>
          <Text style={styles.subtitle}>
            {t(
              "subscription.plans_subtitle",
              "Unlock your full health potential with Premium.",
            )}
          </Text>

          <View
            style={[
              styles.statusPill,
              isPremium && {
                backgroundColor: isDark ? "rgba(66, 133, 244, 0.1)" : "#EBF4FF",
                borderColor: "transparent",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isPremium ? "#4285F4" : "#F59E0B" },
              ]}
            />
            <Text
              style={[styles.statusText, isPremium && { color: "#4285F4" }]}
            >
              {t("subscription.current", "Current")}:{" "}
              {isPremium
                ? t("subscription.premium", "Premium")
                : t("subscription.free", "Free")}
            </Text>
          </View>
        </View>

        {/* FREE PLAN CARD */}
        {!isPremium && (
          <View style={styles.planCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.planLabel}>
                {t("subscription.free", "Free")}
              </Text>
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>
                  {t("subscription.current", "CURRENT")}
                </Text>
              </View>
            </View>

            <Text style={styles.priceText}>
              {t("subscription.price_free", "$0")}{" "}
              <Text style={styles.priceSub}>{t("subscription.forever", "/ forever")}</Text>
            </Text>

            <View style={styles.featuresList}>
              <FeatureItem
                styles={styles}
                icon="checkmark-circle-outline"
                text={t(
                  "subscription.feature_basic_tracking",
                  "Basic Activity Tracking",
                )}
              />
              <FeatureItem
                styles={styles}
                icon="checkmark-circle-outline"
                text={t(
                  "subscription.feature_limited_insights",
                  "Limited Health Insights",
                )}
              />
              <FeatureItem
                styles={styles}
                icon="checkmark-circle-outline"
                text={t(
                  "subscription.feature_standard_support",
                  "Standard Support",
                )}
              />
            </View>
          </View>
        )}
        <View
          style={[
            styles.planCard,
            styles.premiumCard,
            isPremium && styles.activePremiumCard,
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.planLabel, { color: "#4285F4" }]}>
              {t("subscription.premium", "Premium")}
            </Text>
            {isPremium ? (
              <View style={styles.activeBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: "#4285F4",
                      marginRight: 6,
                      width: 6,
                      height: 6,
                    },
                  ]}
                />
                <Text style={styles.activeBadgeText}>
                  {t("subscription.active_plan", "ACTIVE PLAN")}
                </Text>
              </View>
            ) : (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>
                  {t("subscription.recommended", "RECOMMENDED")}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.priceText}>
            {t("subscription.price_premium", "10,000đ")}{" "}
            <Text style={styles.priceSub}>{t("subscription.one_time", "/ one-time")}</Text>
          </Text>
          <Text style={styles.saveText}>
            {isPremium
              ? t("subscription.lifetime_unlocked", "Lifetime access unlocked")
              : t("subscription.pay_once", "Pay once, use forever")}
          </Text>

          <View style={styles.featuresList}>
            <FeatureItem
              styles={styles}
              icon="sparkles-outline"
              text={t(
                "subscription.feature_analysis",
                "Unlimited AI Health Analysis",
              )}
              active={isPremium}
            />
            <FeatureItem
              styles={styles}
              icon="restaurant-outline"
              text={t(
                "subscription.feature_meals",
                "Unlimited AI Meals & Diet Plans",
              )}
              active={isPremium}
            />
            <FeatureItem
              styles={styles}
              icon="chatbubble-ellipses-outline"
              text={t(
                "subscription.feature_chat",
                "Unlimited AI Health Chat",
              )}
              active={isPremium}
            />
            <FeatureItem
              styles={styles}
              icon="document-text-outline"
              text={t(
                "subscription.feature_scans",
                "Unlimited Medical Record Scans",
              )}
              active={isPremium}
            />
            <FeatureItem
              styles={styles}
              icon="analytics-outline"
              text={t(
                "subscription.feature_reports",
                "Advanced Biometric Reports",
              )}
              active={isPremium}
            />
          </View>

          {!isPremium ? (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={handleUpgradePress}
            >
              <Text style={styles.upgradeBtnText}>
                {t("subscription.upgrade", "Upgrade to Premium")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFF"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.premiumActiveFooter}>
              <Ionicons
                name="checkmark-done-circle"
                size={24}
                color="#4285F4"
              />
              <Text style={styles.premiumActiveText}>
                {t(
                  "subscription.all_features_active",
                  "All features are activated",
                )}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* CONFIRM UPGRADE MODAL (MATCHING DESIGN) */}
      <Modal
        visible={showConfirmModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmHeader}>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.confirmHeaderTitle}>
                {t("subscription.complete_upgrade", "Complete Upgrade")}
              </Text>
              <View style={styles.userAvatarSmall}>
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color={colors.textSecondary}
                />
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryIconBox}>
                  <Ionicons name="star" size={24} color="#4285F4" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.summaryPlanName}>
                    {t("subscription.premium_lifetime", "Premium Lifetime Plan")}
                  </Text>
                  <Text style={styles.summaryPlanDesc}>{t("subscription.billed_once", "Billed once")}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.summaryPrice}>
                    {t("subscription.price_premium", "10,000đ")}
                  </Text>
                  <Text style={styles.summaryPeriod}>
                    /{t("subscription.life_period", "LIFE")}
                  </Text>
                </View>
              </View>

              <Text style={styles.methodSectionTitle}>
                {t("subscription.select_payment", "Select Payment Method")}
              </Text>

              <View style={styles.methodRow}>
                <TouchableOpacity style={styles.methodBtn}>
                  <Ionicons name="logo-apple" size={20} color={colors.text} />
                  <Text style={styles.methodBtnText}>{t("subscription.apple_pay", "Apple Pay")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.methodBtn}>
                  <Ionicons name="logo-google" size={20} color={colors.text} />
                  <Text style={styles.methodBtnText}>{t("subscription.google_pay", "Google Pay")}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardMethodBox}>
                <View style={styles.cardMethodHeader}>
                  <View style={styles.radioButtonActive}>
                    <View style={styles.radioInner} />
                  </View>
                  <Text style={styles.cardMethodTitle}>
                    {t("subscription.payos_method", "PayOS (QR / Bank Transfer)")}
                  </Text>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>

                <View style={styles.fakeForm}>
                  <View style={styles.fakeInput}>
                    <Text style={styles.fakePlaceholder}>
                      {t("subscription.secure_gateway", "Fast & Secure Payment Gateway")}
                    </Text>
                  </View>
                  <View style={styles.fakeFormRow}>
                    <View style={[styles.fakeInput, { flex: 2 }]}>
                      <Text style={styles.fakePlaceholder}>
                        {t("subscription.all_vn_banks", "All Vietnamese Banks")}
                      </Text>
                    </View>
                    <View
                      style={[styles.fakeInput, { flex: 1, marginLeft: 12 }]}
                    >
                      <Text style={styles.fakePlaceholder}>{t("subscription.vietqr", "VietQR")}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.secureNotice}>
                <Ionicons name="lock-closed" size={14} color="#4285F4" />
                <Text style={styles.secureText}>{t("subscription.secure_ssl", "SECURE SSL ENCRYPTION")}</Text>
              </View>

              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={handleConfirmPayment}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.confirmPayBtnText}>{t("subscription.confirm_pay", "Confirm & Pay")}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFF"
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PAYMENT WEBVIEW MODAL */}
      <Modal visible={showWebView} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
          <View style={styles.webviewHeader}>
            <TouchableOpacity
              onPress={() => setShowWebView(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.webviewTitle}>{t("subscription.payos_checkout", "PayOS Checkout")}</Text>
            <TouchableOpacity
              onPress={() => queryStatus.refetch()}
              style={styles.refreshBtn}
            >
              <Ionicons name="refresh" size={20} color="#4285F4" />
            </TouchableOpacity>
          </View>
          {checkoutUrl &&
            (() => {
              let WebViewComponent: any = null;
              try {
                // dynamic require to avoid crashing on environments without native module
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const mod = require("react-native-webview");
                WebViewComponent = mod?.WebView ?? null;
              } catch (e) {
                WebViewComponent = null;
              }

              if (WebViewComponent) {
                return (
                  <WebViewComponent
                    source={{ uri: checkoutUrl }}
                    onNavigationStateChange={handleNavigationStateChange}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View style={styles.webviewLoading}>
                        <ActivityIndicator size="large" color="#4285F4" />
                      </View>
                    )}
                  />
                );
              }

              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 24,
                  }}
                >
                  <Text style={{ marginBottom: 12, textAlign: "center" }}>
                    {t("subscription.browser_unavailable", "Internal browser unavailable in this environment.")}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#4285F4",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                    }}
                    onPress={() => Linking.openURL(checkoutUrl)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {t("subscription.open_browser", "Open in Browser")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function FeatureItem({
  icon,
  text,
  styles,
  active,
}: {
  icon: any;
  text: string;
  styles: any;
  active?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={20} color="#4285F4" />
      <Text
        style={[
          styles.featureText,
          { color: colors.textSecondary, fontWeight: active ? "600" : "400" },
        ]}
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
    header: {
      paddingTop: Platform.OS === "ios" ? 50 : 40,
      paddingBottom: 15,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#FFF" : "#1A237E",
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 10,
    },
    titleSection: {
      alignItems: "center",
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 22,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8F9FA",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    planCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    premiumCard: {
      borderWidth: 0,
      borderColor: "transparent",
      shadowOpacity: 0,
      elevation: 0,
      backgroundColor: isDark ? "rgba(66, 133, 244, 0.08)" : "#F0F7FF",
    },
    activePremiumCard: {
      borderWidth: 0,
      borderColor: "transparent",
      shadowOpacity: 0,
      elevation: 0,
      backgroundColor: isDark ? "rgba(66, 133, 244, 0.1)" : "#EBF4FF",
    },
    activeBadge: {
      backgroundColor: "#EBF4FF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    activeBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#4285F4",
    },
    premiumActiveFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },
    premiumActiveText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#4285F4",
      marginLeft: 10,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    planLabel: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
    },
    currentBadge: {
      backgroundColor: isDark ? "#334155" : "#F1F5F9",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    currentBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.textSecondary,
    },
    recommendedBadge: {
      backgroundColor: "#EBF4FF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    recommendedText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#4285F4",
    },
    priceText: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.text,
    },
    priceSub: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.textSecondary,
    },
    saveText: {
      fontSize: 13,
      color: "#4285F4",
      fontWeight: "600",
      marginTop: 2,
      marginBottom: 20,
    },
    featuresList: {
      marginTop: 10,
      marginBottom: 10,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    featureText: {
      fontSize: 15,
      marginLeft: 12,
    },
    upgradeBtn: {
      backgroundColor: "#4285F4",
      height: 56,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      shadowColor: "#4285F4",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    upgradeBtnText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
    },
    webviewHeader: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#EEE",
    },
    webviewTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#333",
    },
    closeBtn: {
      padding: 4,
    },
    refreshBtn: {
      padding: 8,
    },
    webviewLoading: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#FFF",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    confirmModalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      height: "85%",
      padding: 24,
    },
    confirmHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    confirmHeaderTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    userAvatarSmall: {
      width: 32,
      height: 32,
      borderRadius: 16,
      overflow: "hidden",
    },
    summaryCard: {
      backgroundColor: isDark ? "rgba(66, 133, 244, 0.05)" : "#F8FAFC",
      borderRadius: 20,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? "rgba(66, 133, 244, 0.2)" : "#E2E8F0",
    },
    summaryIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? "rgba(66, 133, 244, 0.2)" : "#EBF4FF",
      justifyContent: "center",
      alignItems: "center",
    },
    summaryPlanName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    summaryPlanDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    summaryPrice: {
      fontSize: 18,
      fontWeight: "800",
      color: "#4285F4",
    },
    summaryPeriod: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    methodSectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    methodRow: {
      flexDirection: "row",
      marginBottom: 16,
    },
    methodBtn: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 6,
      backgroundColor: colors.card,
    },
    methodBtnText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
    },
    cardMethodBox: {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: "#4285F4",
      padding: 16,
      backgroundColor: isDark ? "rgba(66, 133, 244, 0.03)" : "#FFF",
      marginBottom: 24,
    },
    cardMethodHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    radioButtonActive: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#4285F4",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#4285F4",
    },
    cardMethodTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
    },
    fakeForm: {
      marginTop: 8,
    },
    fakeInput: {
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
      justifyContent: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    fakeFormRow: {
      flexDirection: "row",
    },
    fakePlaceholder: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    secureNotice: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    secureText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#4285F4",
      marginLeft: 6,
      letterSpacing: 0.5,
    },
    confirmPayBtn: {
      backgroundColor: "#4285F4",
      height: 60,
      borderRadius: 18,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#4285F4",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
      marginBottom: 30,
    },
    confirmPayBtnText: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "700",
    },
  });


