import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const handleSubscribe = () => {
    Alert.alert(
      "Upgrade to Premium",
      "Payment gateway integration is pending. This feature will be available soon!",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plan</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.currentPlanBox}>
          <Text style={styles.currentPlanTitle}>Current Plan</Text>
          <Text style={styles.planName}>Free Tier</Text>
          <Text style={styles.planDesc}>Basic health tracking and daily metrics.</Text>
        </View>

        <Text style={styles.sectionTitle}>Upgrade your plan</Text>

        <View style={[styles.premiumCard, { borderColor: colors.primary }]}>
          <View style={styles.premiumHeader}>
            <Text style={styles.premiumTitle}>PREMIUM</Text>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
          </View>
          
          <Text style={styles.price}>
            $4.99 <Text style={styles.pricePeriod}>/ month</Text>
          </Text>

          <View style={styles.featureList}>
            <FeatureItem text="Unlimited AI Health Analysis" colors={colors} />
            <FeatureItem text="Advanced Sleep & Diet Tracking" colors={colors} />
            <FeatureItem text="Connect 5+ Wearable Devices" colors={colors} />
            <FeatureItem text="No Advertisements" colors={colors} />
            <FeatureItem text="Direct support from Doctors" colors={colors} />
          </View>

          <TouchableOpacity style={[styles.subscribeBtn, { backgroundColor: colors.primary }]} onPress={handleSubscribe}>
            <Text style={styles.subscribeText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ text, colors }: { text: string, colors: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginRight: 12 }} />
      <Text style={{ color: colors.text, fontSize: 15 }}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  currentPlanBox: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  currentPlanTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  planName: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  premiumCard: {
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.05)' : '#f8fafc',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  popularBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 24,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  featureList: {
    marginBottom: 32,
  },
  subscribeBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  subscribeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
