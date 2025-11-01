import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useProducts } from '@/hooks/useFirestore';

export default function CategoryProductsScreen() {
  const { t, language } = useApp();
  const params = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
    subcategoryId?: string;
    subcategoryName?: string;
  }>();

  const { loading, error, refetch } = useProducts({
    categoryId: params.categoryId,
    subcategoryName: params.subcategoryName,
    limit: 20, // تحميل 20 منتج فقط في البداية
  });

  const [selectedSort, setSelectedSort] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {params.subcategoryName || params.categoryName || t('products.allProducts')}
              </Text>
              {params.subcategoryName && params.categoryName && (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {params.categoryName}
                </Text>
              )}
            </View>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sortButton, selectedSort === 'newest' && styles.sortButtonActive]}
            onPress={() => setSelectedSort('newest')}
          >
            <Text style={[styles.sortText, selectedSort === 'newest' && styles.sortTextActive]}>
              {t('products.newest')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, selectedSort === 'popular' && styles.sortButtonActive]}
            onPress={() => setSelectedSort('popular')}
          >
            <Text style={[styles.sortText, selectedSort === 'popular' && styles.sortTextActive]}>
              {t('products.popular')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, selectedSort === 'price-low' && styles.sortButtonActive]}
            onPress={() => setSelectedSort('price-low')}
          >
            <Text style={[styles.sortText, selectedSort === 'price-low' && styles.sortTextActive]}>
              {t('products.priceLowToHigh')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, selectedSort === 'price-high' && styles.sortButtonActive]}
            onPress={() => setSelectedSort('price-high')}
          >
            <Text style={[styles.sortText, selectedSort === 'price-high' && styles.sortTextActive]}>
              {t('products.priceHighToLow')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>{t('common.error')}</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Feather name="refresh-cw" size={20} color={Colors.white} />
            <Text style={styles.retryButtonText}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>{language === 'ar' ? 'المنتجات غير متاحة للعرض' : 'Products not available for display'}</Text>
          <Text style={styles.emptyDescription}>{language === 'ar' ? 'عذراً، المنتجات مخفية حالياً' : 'Sorry, products are currently hidden'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientHeader: {
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as any,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sortContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[100],
    marginRight: Spacing.sm,
  },
  sortButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  sortText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    color: Colors.text.secondary,
  },
  sortTextActive: {
    color: Colors.white,
  },
  productList: {
    padding: Spacing.sm,
  },
  productCard: {
    flex: 1,
    margin: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  imageContainer: {
    aspectRatio: 1,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold as any,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold as any,
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold as any,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold as any,
    color: '#8B5CF6',
    marginRight: Spacing.sm,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    color: Colors.text.primary,
    marginRight: 4,
  },
  reviews: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as any,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold as any,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as any,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
