import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, FontSizes, FontWeights } from '@/constants/theme';
import { useBrands } from '@/hooks/useFirestore';
import SafeImage from '@/components/SafeImage';

export default function BrandsScreen() {
  const { t, language } = useApp();
  const { brands, loading, error, refetch } = useBrands();

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('tabs.brands')}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('brands.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('tabs.brands')}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        
        <View style={styles.centered}>
          <Feather name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>{t('brands.error')}</Text>
          <Text style={styles.errorText}>{t('brands.errorLoadingBrands')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Feather name="refresh-cw" size={20} color={Colors.white} />
            <Text style={styles.retryButtonText}>{t('brands.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (brands.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('tabs.brands')}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonContent}>
            {/* Gift Icon with Gradient */}
            <LinearGradient
              colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Feather name="gift" size={48} color={Colors.white} />
            </LinearGradient>

            <Text style={styles.comingSoonTitle}>🎉 Coming Soon! 🎉</Text>
            <Text style={styles.comingSoonText}>
              We&apos;re preparing something special. Stay tuned for new brands!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('tabs.brands')}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.brandCard}
                onPress={() => router.push(`/brand/${brand.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.imageContainer}>
                  <SafeImage uri={brand.image} style={styles.brandImage} />
                  {brand.logo && (
                    <View style={styles.logoContainer}>
                      <SafeImage uri={brand.logo} style={styles.logoImage} />
                    </View>
                  )}
                </View>
                <View style={styles.brandInfo}>
                  <Text style={styles.brandName}>{brand.name[language]}</Text>
                  {brand.description && brand.description[language] && (
                    <Text style={styles.brandDescription} numberOfLines={2}>
                      {brand.description[language]}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Coming Soon Section - Always Visible */}
          <View style={styles.comingSoonSection}>
            <Text style={styles.comingSoonSectionTitle}>🎉 Coming Soon! 🎉</Text>
            <Text style={styles.comingSoonSectionText}>
              We&apos;re preparing something special. Stay tuned for new brands!
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: Spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.lg,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: '#F9FAFB',
  },
  comingSoonContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  comingSoonTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: FontWeights.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  brandCard: {
    width: '50%',
    padding: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.gray[100],
    aspectRatio: 1,
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  brandInfo: {
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  brandDescription: {
    fontSize: 12,
    color: Colors.gray[500],
    lineHeight: 16,
  },
  comingSoonSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSectionText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: FontWeights.medium,
  },
  bottomSpacer: {
    height: 20,
  },
});
