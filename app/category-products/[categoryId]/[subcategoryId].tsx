import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useProducts, useCategory } from '@/hooks/useFirestore';
import { db } from '@/constants/firebase';
import { collection, getDocs } from 'firebase/firestore';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';

export default function CategoryProductsScreen() {
  const { categoryId, subcategoryId } = useLocalSearchParams<{
    categoryId: string;
    subcategoryId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, formatPrice: appFormatPrice } = useApp();
  
  // State for nested subcategories
  const [nestedSubcategories, setNestedSubcategories] = useState<any[]>([]);
  const [loadingNested, setLoadingNested] = useState(true);
  const [hasNestedSubcategories, setHasNestedSubcategories] = useState(false);

  // دالة آمنة لتنسيق السعر
  const formatPrice = useCallback((price: number): string => {
    try {
      const result = appFormatPrice(price);
      return typeof result === 'string' && result.length > 0 ? result : '$0.00';
    } catch {
      return '$0.00';
    }
  }, [appFormatPrice]);

  // جلب معلومات الفئة للحصول على اسم الفئة الفرعية
  const { category } = useCategory(categoryId || '');
  
  // جلب المنتجات باستخدام subcategoryId بدلاً من subcategoryName
  const { products, loading, error, refetch } = useProducts({
    categoryId: categoryId,
    subcategoryId: subcategoryId, // استخدام ID مباشرة
  });

  // الحصول على اسم الفئة الفرعية
  const subcategoryName = useMemo(() => {
    if (!category?.subcategories || !subcategoryId) return '';
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return '';
    
    let name = '';
    if (typeof subcategory.name === 'object' && subcategory.name !== null) {
      name = language === 'ar' ? subcategory.name.ar : subcategory.name.en;
    } else if (typeof subcategory.name === 'string') {
      name = subcategory.name;
    }
    
    return typeof name === 'string' && name.trim() ? name.trim() : '';
  }, [category, subcategoryId, language]);

  // Fetch nested subcategories
  useEffect(() => {
    const fetchNestedSubcategories = async () => {
      if (!categoryId || !subcategoryId || !db) {
        setLoadingNested(false);
        return;
      }

      try {
        setLoadingNested(true);
        const nestedRef = collection(db, 'categories', categoryId, 'subcategory', subcategoryId, 'subcategory');
        const nestedSnapshot = await getDocs(nestedRef);
        
        if (nestedSnapshot.size > 0) {
          console.log(`✅ Found ${nestedSnapshot.size} nested subcategories in ${subcategoryId}`);
          const nested = nestedSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              nameEn: data.nameEn || data.name || 'Unknown',
              nameAr: data.nameAr || data.name || 'غير معروف',
              image: data.image || '',
            };
          });
          console.log('📦 Nested subcategories:', nested);
          setNestedSubcategories(nested);
          setHasNestedSubcategories(true);
        } else {
          console.log(`ℹ️ No nested subcategories found in ${subcategoryId}, showing products`);
          setHasNestedSubcategories(false);
        }
      } catch (error) {
        console.error('❌ Error fetching nested subcategories:', error);
        setHasNestedSubcategories(false);
      } finally {
        setLoadingNested(false);
      }
    };

    fetchNestedSubcategories();
  }, [categoryId, subcategoryId]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleNestedSubcategoryPress = useCallback((nestedSubId: string) => {
    console.log('Nested subcategory pressed:', nestedSubId);
    // Navigate to products with the nested subcategory ID
    router.push({
      pathname: '/category-products/[categoryId]/[subcategoryId]',
      params: {
        categoryId: categoryId,
        subcategoryId: nestedSubId,
      },
    });
  }, [router, categoryId]);

  const renderProductItem = useCallback(({ item }: { item: any }) => {
    // Validate item before rendering
    if (!item || typeof item !== 'object' || !item.id) {
      return null;
    }
    
    return (
      <View style={styles.productContainer}>
        <AmazonStyleProductCard 
          product={item} 
          onPress={() => router.push(`/product/${item.id}` as any)}
          formatPrice={formatPrice}
          language={language}
        />
      </View>
    );
  }, [formatPrice, language, router]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Feather name="package" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>
        {language === 'ar' ? 'لا توجد منتجات' : 'No Products Found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {language === 'ar' 
          ? 'لم نتمكن من العثور على منتجات في هذه الفئة'
          : 'We couldn\'t find any products in this category'
        }
      </Text>
    </View>
  ), [language]);

  const renderLoadingSkeleton = useCallback(() => (
    <FlatList
      data={Array(6).fill(null)}
      renderItem={() => (
        <View style={styles.productContainer}>
          <ProductCardSkeleton />
        </View>
      )}
      keyExtractor={(_, index) => `skeleton-${index}`}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  ), []);

  // عنوان الصفحة
  const pageTitle = useMemo(() => {
    const name = subcategoryName || (language === 'ar' ? 'المنتجات' : 'Products');
    return typeof name === 'string' && name.trim() ? name : (language === 'ar' ? 'المنتجات' : 'Products');
  }, [subcategoryName, language]);

  // Filter valid products
  const validProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter(p => p && typeof p === 'object' && p.id);
  }, [products]);
  
  const productsCount = validProducts?.length || 0;

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: pageTitle,
            headerShown: false 
          }} 
        />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather 
                name={language === 'ar' ? 'chevron-right' : 'chevron-left'} 
                size={24} 
                color="#0F172A" 
              />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>{pageTitle}</Text>
            
            <View style={styles.placeholder} />
          </View>

          {renderLoadingSkeleton()}
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: pageTitle,
            headerShown: false 
          }} 
        />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather 
                name={language === 'ar' ? 'chevron-right' : 'chevron-left'} 
                size={24} 
                color="#0F172A" 
              />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>{pageTitle}</Text>
            
            <View style={styles.placeholder} />
          </View>

          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={64} color="#DC2626" />
            <Text style={styles.errorTitle}>
              {language === 'ar' ? 'حدث خطأ' : 'Something went wrong'}
            </Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>
                {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: pageTitle,
          headerShown: false 
        }} 
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather 
              name={language === 'ar' ? 'chevron-right' : 'chevron-left'} 
              size={24} 
              color="#0F172A" 
            />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{pageTitle}</Text>
          
          <View style={styles.placeholder} />
        </View>

      {/* Products Count or Subcategories Count */}
      {!loadingNested && !hasNestedSubcategories && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {language === 'ar' 
              ? `${productsCount} منتج` 
              : `${productsCount} product${productsCount !== 1 ? 's' : ''}`
            }
          </Text>
        </View>
      )}

      {/* Show nested subcategories if they exist */}
      {loadingNested ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      ) : hasNestedSubcategories && nestedSubcategories.length > 0 ? (
        <FlatList
          data={nestedSubcategories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.nestedSubcategoryCard}
              onPress={() => handleNestedSubcategoryPress(item.id)}
              activeOpacity={0.7}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.nestedSubcategoryImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Feather name="package" size={40} color="#9CA3AF" />
                </View>
              )}
              <Text style={styles.nestedSubcategoryName} numberOfLines={2}>
                {language === 'ar' ? item.nameAr : item.nameEn}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.nestedSubcategoryRow}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : validProducts && validProducts.length > 0 ? (
        <FlatList
          data={validProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={['#7C3AED']}
              tintColor={'#7C3AED'}
            />
          }
        />
        ) : (
          renderEmptyState()
        )}
      </View>
    </>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  countText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  listContainer: {
    padding: 8,
  },
  productContainer: {
    flex: 1,
    margin: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 12,
  },
  nestedSubcategoryRow: {
    justifyContent: 'space-between',
  },
  nestedSubcategoryCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  nestedSubcategoryImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8F4FD',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nestedSubcategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    lineHeight: 18,
    padding: 12,
  },
});