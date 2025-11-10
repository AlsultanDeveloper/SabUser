import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/constants/theme';
import { useCategory } from '@/hooks/useFirestore';
import SafeImage from '@/components/SafeImage';
import type { Subcategory } from '@/types';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  language: string;
  onPress: () => void;
}

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ subcategory, language, onPress }) => {
  const subcategoryName = typeof subcategory.name === 'object' 
    ? (language === 'ar' ? subcategory.name.ar : subcategory.name.en)
    : subcategory.name;

  return (
    <TouchableOpacity style={styles.subcategoryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.subcategoryImageContainer}>
        <SafeImage 
          uri={subcategory.image} 
          style={styles.subcategoryImage}
          fallbackIconSize={40}
          fallbackIconName="image"
          showLoader={true}
          resizeMode="cover"
        />
      </View>
      <View style={styles.subcategoryContent}>
        <Text style={styles.subcategoryTitle} numberOfLines={2}>
          {subcategoryName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Loading skeleton component
const SubcategorySkeleton = () => (
  <View style={styles.subcategoryCard}>
    <View style={[styles.subcategoryImageContainer, styles.skeletonImage]} />
    <View style={styles.subcategoryContent}>
      <View style={[styles.skeletonText, { width: '80%' }]} />
    </View>
  </View>
);

// Categories that should show products directly (no subcategories)
const CATEGORIES_WITHOUT_SUBCATEGORIES = [
  'Bags & Luggage',
  'Toys & Dolls',
  'Office & School Supplies',
  'Cleaning & Household'
];

export default function CategoryDetails() {
  const { language, t } = useApp();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { category, loading, error, refetch } = useCategory(id || '');

  // Get category name with fallback
  const categoryName: string = React.useMemo(() => {
    if (!category?.name) return '';
    if (typeof category.name === 'string') return category.name;
    // Keep "Sab Market" in English always
    if (category.name.en === 'Sab Market' || category.name.ar === 'ساب ماركت') {
      return 'Sab Market';
    }
    return language === 'ar' ? category.name.ar : category.name.en;
  }, [category, language]);

  // Check if current category should show products directly
  const shouldShowProductsDirectly = React.useMemo(() => {
    if (!category?.name) return false;
    const nameEn = typeof category.name === 'object' ? category.name.en : category.name;
    return CATEGORIES_WITHOUT_SUBCATEGORIES.includes(nameEn);
  }, [category]);

  // If category should show products directly, navigate to products page immediately
  React.useEffect(() => {
    if (!loading && category && shouldShowProductsDirectly) {
      console.log('📦 Redirecting to products for category:', categoryName);
      // Navigate immediately
      router.replace({
        pathname: '/category-products/[categoryId]/[subcategoryId]',
        params: {
          categoryId: id,
          subcategoryId: 'all', // عرض جميع منتجات الفئة
        },
      });
    }
  }, [loading, category, shouldShowProductsDirectly, id, categoryName]);

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    console.log('Subcategory pressed:', subcategory.name);
    // Navigate to subcategory products using subcategory ID
    router.push({
      pathname: '/category-products/[categoryId]/[subcategoryId]',
      params: {
        categoryId: id,
        subcategoryId: subcategory.id, // استخدام ID بدلاً من الاسم
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            {loading ? (
              <View style={styles.headerTitleContainer}>
                <View style={styles.skeletonHeaderText} />
              </View>
            ) : (
              <Text style={styles.headerTitle} numberOfLines={1}>
                {categoryName}
              </Text>
            )}
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          // Loading State
          <View style={styles.subcategoriesGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SubcategorySkeleton key={item} />
            ))}
          </View>
        ) : error ? (
          // Error State
          <View style={styles.errorContainer}>
            <Feather name="wifi-off" size={64} color="#666" />
            <Text style={styles.errorTitle}>
              {language === 'ar' ? 'خطأ في التحميل' : 'Loading Error'}
            </Text>
            <Text style={styles.errorText}>
              {language === 'ar' ? 'تحقق من اتصال الإنترنت' : 'Check your internet connection'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Feather name="refresh-cw" size={20} color="#fff" />
              <Text style={styles.retryText}>
                {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : category?.subcategories && category.subcategories.length > 0 ? (
          // Subcategories Grid
          <View style={styles.subcategoriesGrid}>
            {category.subcategories.map((subcategory) => (
              <SubcategoryCard
                key={subcategory.id}
                subcategory={subcategory}
                language={language}
                onPress={() => handleSubcategoryPress(subcategory)}
              />
            ))}
          </View>
        ) : (
          // No subcategories
          <View style={styles.emptyContainer}>
            <Feather name="package" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {language === 'ar' ? 'لا توجد فئات فرعية' : 'No subcategories found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {language === 'ar' ? 'سيتم إضافة المنتجات قريباً' : 'Products will be added soon'}
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
  },
  skeletonHeaderText: {
    width: 120,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.sm,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 32,
  },
  // Subcategories Grid - 2 columns for better visibility
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subcategoryCard: {
    width: '48%',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subcategoryImageContainer: {
    height: 160,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
  },
  subcategoryContent: {
    padding: Spacing.sm,
  },
  subcategoryTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Loading skeleton styles
  skeletonImage: {
    backgroundColor: Colors.gray[200],
  },
  skeletonText: {
    height: 16,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.sm,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  retryText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
