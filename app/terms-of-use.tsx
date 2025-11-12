// terms-of-use.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors, Spacing, FontSizes } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function TermsOfUseScreen() {
  const { t, language } = useApp();

  return (
    <>
      <Stack.Screen 
        options={{
          title: t('account.termsOfUse'),
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={[styles.scrollView, language === 'ar' && { direction: 'rtl' as any }]} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('termsOfUse.title')}</Text>
          <Text style={styles.updateDate}>{t('termsOfUse.lastUpdated')}</Text>

          <Text style={styles.paragraph}>{t('termsOfUse.intro')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.acceptance')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.acceptanceDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.eligibility')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.eligibilityDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.account')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.accountDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.orders')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.ordersDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.shipping')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.shippingDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.returns')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.returnsDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.prohibited')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.prohibitedDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.intellectual')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.intellectualDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.limitation')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.limitationDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.termination')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.terminationDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.changes')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.changesDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.governing')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.governingDesc')}</Text>

          <Text style={styles.sectionTitle}>{t('termsOfUse.contact')}</Text>
          <Text style={styles.paragraph}>{t('termsOfUse.contactDesc')}</Text>

          <Text style={styles.footer}>{t('termsOfUse.footer')}</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  updateDate: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  paragraph: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.6,
    marginBottom: Spacing.md,
  },
  footer: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
});
