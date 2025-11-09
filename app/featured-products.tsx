import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';
import { useFeaturedProducts } from '@/hooks/useFirestore';
import { useApp } from '@/contexts/AppContext';

export default function FeaturedProducts() {
  const router = useRouter();
  const { language, formatPrice: appFormatPrice } = useApp();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [displayLimit, setDisplayLimit] = useState(20);
  
  // جلب المنتجات المميزة من Firebase
  const { data: allProducts = [], isLoading } = useFeaturedProducts(100); // جلب 100 منتج
  
  const formatPrice = (price: number) => {
    try {
      const result = appFormatPrice(price);
      return typeof result === 'string' && result.length > 0 ? result : '$0.00';
    } catch {
      return '$0.00';
    }
  };

  const handleProductPress = (product: any) => {
    console.log('Product pressed:', product.name);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getFilteredProducts = () => {
    let filtered = allProducts;
    
    switch (sortBy) {
      case 'featured':
        filtered = allProducts.filter(product => product.rating >= 4.0);
        break;
      case 'newest':
        filtered = allProducts.slice().reverse(); // عكس الترتيب للحصول على الأحدث
        break;
      case 'popular':
        filtered = allProducts.filter(product => product.reviews >= 10);
        break;
      case 'discounted':
        filtered = allProducts.filter(product => product.discount && product.discount > 0);
        break;
      default:
        filtered = allProducts;
    }
    
    // عرض فقط displayLimit منتج
    return filtered.slice(0, displayLimit);
  };
  
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  const renderProductsGrid = () => {
    const filteredProducts = getFilteredProducts();
    const rows = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      rows.push(
        <View key={i} style={styles.productsRow}>
          <AmazonStyleProductCard
            product={filteredProducts[i]}
            onPress={() => handleProductPress(filteredProducts[i])}
            formatPrice={formatPrice}
            language={language}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={wishlist.includes(filteredProducts[i].id)}
          />
          {filteredProducts[i + 1] && (
            <AmazonStyleProductCard
              product={filteredProducts[i + 1]}
              onPress={() => handleProductPress(filteredProducts[i + 1])}
              formatPrice={formatPrice}
              language={language}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={wishlist.includes(filteredProducts[i + 1].id)}
            />
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ar' ? 'منتجاتنا المميزة' : 'Featured Products'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['featured', 'newest', 'popular', 'discounted'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              style={[styles.filterButton, sortBy === filter && styles.filterButtonActive]}
              onPress={() => setSortBy(filter)}
            >
              <Text style={[styles.filterText, sortBy === filter && styles.filterTextActive]}>
                {language === 'ar' 
                  ? {featured: 'مميز', newest: 'جديد', popular: 'رائج', discounted: 'خصم'}[filter]
                  : {featured: 'Featured', newest: 'Newest', popular: 'Popular', discounted: 'Sale'}[filter]
                }
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </Text>
          </View>
        ) : allProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color={Colors.gray[400]} />
            <Text style={styles.emptyText}>
              {language === 'ar' ? 'لا توجد منتجات مميزة' : 'No featured products'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.productsContainer}>
              {renderProductsGrid()}
            </View>
            
            {/* زر عرض المزيد */}
            {getFilteredProducts().length < allProducts.length && (
              <View style={styles.loadMoreContainer}>
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                >
                  <Text style={styles.loadMoreText}>
                    {language === 'ar' ? 'عرض المزيد' : 'Load More'}
                  </Text>
                  <Feather name="chevron-down" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {language === 'ar' 
                  ? `عرض ${getFilteredProducts().length} من ${allProducts.length} منتج`
                  : `Showing ${getFilteredProducts().length} of ${allProducts.length} products`
                }
              </Text>
            </View>
          </>
        )}
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  langButton: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
  },
  filterBar: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.surface,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: FontWeights.bold,
  },
  scrollView: {
    flex: 1,
  },
  productsContainer: {
    padding: Spacing.md,
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  footer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loadMoreText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
    marginRight: 8,
  },
});