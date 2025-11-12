import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function AboutUsScreen() {
  const { t } = useApp();

  return (
    <>
      <Stack.Screen 
        options={{
          title: t('account.about'),
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Image 
                source={require('@/assets/images/favicon.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{t('aboutUs.title')}</Text>
            <Text style={styles.subtitle}>{t('aboutUs.welcome')}</Text>
          </View>

          <View style={styles.descriptionCard}>
            <Text style={styles.description}>
              {t('aboutUs.description1')}
            </Text>
            <Text style={styles.description}>
              {t('aboutUs.description2')}
            </Text>
            <Text style={styles.description}>
              {t('aboutUs.description3')}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="target" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t('aboutUs.mission')}</Text>
            </View>
            <Text style={styles.paragraph}>
              {t('aboutUs.missionDesc')}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="users" size={24} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>{t('aboutUs.team')}</Text>
            </View>
            <Text style={styles.paragraph}>
              {t('aboutUs.teamDesc')}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={24} color={Colors.accent} />
              <Text style={styles.sectionTitle}>{t('aboutUs.values')}</Text>
            </View>
            <Text style={styles.paragraph}>
              {t('aboutUs.valuesDesc')}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="star" size={24} color={Colors.warning} />
              <Text style={styles.sectionTitle}>{t('aboutUs.whyChoose')}</Text>
            </View>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureBullet, { backgroundColor: Colors.primary + '20' }]}>
                  <Feather name="shopping-cart" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.featureText}>{t('aboutUs.feature1')}</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureBullet, { backgroundColor: Colors.secondary + '20' }]}>
                  <Feather name="zap" size={18} color={Colors.secondary} />
                </View>
                <Text style={styles.featureText}>{t('aboutUs.feature2')}</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureBullet, { backgroundColor: Colors.success + '20' }]}>
                  <Feather name="truck" size={18} color={Colors.success} />
                </View>
                <Text style={styles.featureText}>{t('aboutUs.feature3')}</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureBullet, { backgroundColor: Colors.orange + '20' }]}>
                  <Feather name="refresh-cw" size={18} color={Colors.orange} />
                </View>
                <Text style={styles.featureText}>{t('aboutUs.feature4')}</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureBullet, { backgroundColor: Colors.accent + '20' }]}>
                  <Feather name="shield" size={18} color={Colors.accent} />
                </View>
                <Text style={styles.featureText}>{t('aboutUs.feature5')}</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureBullet, { backgroundColor: Colors.warning + '20' }]}>
                  <Feather name="award" size={18} color={Colors.warning} />
                </View>
                <Text style={styles.featureText}>{t('aboutUs.feature6')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactSection}>
            <View style={styles.sectionHeader}>
              <Feather name="mail" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t('aboutUs.contact')}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Feather name="mail" size={18} color={Colors.text.secondary} />
              <Text style={styles.contactText}>{t('aboutUs.email')}</Text>
            </View>

            <View style={styles.contactItem}>
              <Feather name="map-pin" size={18} color={Colors.text.secondary} />
              <Text style={styles.contactText}>{t('aboutUs.location')}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('aboutUs.footer')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  heroSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.lg * 1.5,
  },
  descriptionCard: {
    backgroundColor: Colors.primary + '10',
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    lineHeight: FontSizes.md * 1.6,
    marginBottom: Spacing.md,
  },
  section: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  paragraph: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.6,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBullet: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    lineHeight: FontSizes.md * 1.4,
  },
  contactSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  footer: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
});
