import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function PremiumUpgradeModal({ visible, onClose, featureName = "AI Feature" }: PremiumUpgradeModalProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleUpgrade = () => {
    onClose();
    router.push('/screen/subscription');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Gradient */}
          <LinearGradient
            colors={['#1e3a8a', '#2563eb', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headerTitle}>{t('premium.limit_reached')}</Text>
          </LinearGradient>

          {/* Body with ScrollView */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.description}>
              {t('premium.description', `Bạn đã đạt đến giới hạn số lần sử dụng cho ${featureName}. Nâng cấp lên Premium để mở khóa không giới hạn và cải thiện hành trình sức khỏe của bạn.`).replace('{featureName}', featureName)}
            </Text>

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#e0f2fe' }]}>
                  <Ionicons name="bar-chart" size={22} color="#2563eb" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{t('premium.feature_ai_analysis')}</Text>
                  <Text style={styles.featureSubtitle}>{t('premium.feature_ai_analysis_sub')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#ede9fe' }]}>
                  <Ionicons name="chatbubbles" size={22} color="#7c3aed" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{t('premium.feature_ai_assistant')}</Text>
                  <Text style={styles.featureSubtitle}>{t('premium.feature_ai_assistant_sub')}</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: '#fce7f3' }]}>
                  <Ionicons name="calendar" size={22} color="#db2777" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{t('premium.feature_health_plans')}</Text>
                  <Text style={styles.featureSubtitle}>{t('premium.feature_health_plans_sub')}</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.8} onPress={handleUpgrade}>
              <Text style={styles.upgradeBtnText}>{t('premium.upgrade_now')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
              <Text style={styles.laterBtnText}>{t('premium.later')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    padding: 15,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  featuresList: {
    width: '100%',
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  upgradeBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  laterBtn: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  laterBtnText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});

