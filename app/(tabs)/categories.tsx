import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCategories } from '@/hooks/useFirestore';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  language: string;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, language, onPress }) => {
  // Keep "Sab Market" in English always
  const categoryName = (typeof category.name === 'object' && (category.name.en === 'Sab Market' || category.name.ar === 'ساب ماركت'))
    ? 'Sab Market'
    : (typeof category.name === 'object' 
      ? (language === 'ar' ? category.name.ar : category.name.en)
      : category.name
    );

  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.categoryImageContainer}>
        <Image 
          source={{ uri: category.image || 'https://via.placeholder.com/150/E8F4FD/333?text=No+Image' }} 
          style={styles.categoryImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle} numberOfLines={2}>
          {categoryName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Loading skeleton component
const CategorySkeleton = () => (
  <View style={styles.categoryCard}>
    <View style={[styles.categoryImageContainer, styles.skeletonImage]} />
    <View style={styles.categoryContent}>
      <View style={[styles.skeletonText, { width: '80%' }]} />
      <View style={[styles.skeletonText, { width: '60%', height: 12 }]} />
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

export default function Categories() {
  const { language, t } = useApp();
  const { categories, loading, error, refetch } = useCategories();

  // Filter out "Sab Market" category since we have a dedicated floating button for it
  const filteredCategories = categories.filter(category => {
    const categoryNameEn = typeof category.name === 'object' ? category.name.en : category.name;
    const categoryNameAr = typeof category.name === 'object' ? category.name.ar : category.name;
    // Exclude Sab Market
    return categoryNameEn !== 'Sab Market' && categoryNameAr !== 'ساب ماركت';
  });

  const handleCategoryPress = (category: Category) => {
    console.log('Category pressed:', category.name);
    
    // Check if this category should show products directly
    const categoryNameEn = typeof category.name === 'object' ? category.name.en : category.name;
    const shouldShowProductsDirectly = CATEGORIES_WITHOUT_SUBCATEGORIES.includes(categoryNameEn);
    
    if (shouldShowProductsDirectly) {
      // Navigate directly to products page
      console.log('📦 Navigating directly to products for:', categoryNameEn);
      router.push({
        pathname: '/category-products/[categoryId]/[subcategoryId]',
        params: {
          categoryId: category.id,
          subcategoryId: 'all',
        },
      });
    } else {
      // Navigate to category subcategories page
      router.push(`/category/${category.id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerPlaceholder} />
            <Text style={styles.headerTitle}>
              {language === 'ar' ? 'تسوق حسب الفئة' : 'Shop by category'}
            </Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={[styles.scrollContainer, language === 'ar' && { direction: 'rtl' as any }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          // Loading State
          <View style={styles.categoriesGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <CategorySkeleton key={item} />
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
        ) : (
          // Categories Grid
          <View style={styles.categoriesGrid}>
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                language={language}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
            
            {filteredCategories.length === 0 && (
              <View style={styles.emptyContainer}>
                <Feather name="inbox" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {language === 'ar' ? 'لا توجد فئات' : 'No categories found'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  // Amazon Grid Style - 2 columns for consistency
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%', // 2 columns with gap
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    // Amazon card shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryImageContainer: {
    height: 160, // ارتفاع 160
    backgroundColor: '#E8F4FD', // Light blue like Amazon
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryContent: {
    padding: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Loading skeleton styles
  skeletonImage: {
    backgroundColor: '#E0E0E0',
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  // Search results styles
  searchSection: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    width: '100%',
  },
  productsGrid: {
    width: '100%',
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#E8F4FD',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});