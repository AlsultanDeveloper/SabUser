import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';

// منتجات فارغة - تم حذف المنتجات الوهمية
const allProducts: any[] = [];

export default function FeaturedProducts() {
  const router = useRouter();
  const [language, setLanguage] = useState('ar');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  const formatPrice = (price: number) => {
    if (language === 'ar') {
      return `${price.toFixed(2)} ريال`;
    }
    return `$${price.toFixed(2)}`;
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
    switch (sortBy) {
      case 'featured':
        return allProducts.filter(product => product.rating >= 4.5);
      case 'newest':
        return allProducts.filter(product => product.isNew);
      case 'popular':
        return allProducts.filter(product => product.reviewsCount >= 300);
      case 'discounted':
        return allProducts.filter(product => product.discount);
      case 'electronics':
        return allProducts.filter(product => product.category === 'Electronics');
      case 'fashion':
        return allProducts.filter(product => product.category === 'Fashion');
      case 'home':
        return allProducts.filter(product => product.category === 'Home');
      default:
        return allProducts;
    }
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
        <TouchableOpacity onPress={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}>
          <Text style={styles.langButton}>
            {language === 'ar' ? 'EN' : 'عربي'}
          </Text>
        </TouchableOpacity>
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
        <View style={styles.productsContainer}>
          {renderProductsGrid()}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {language === 'ar' 
              ? `عرض ${allProducts.length} منتج من منتجاتنا المميزة`
              : `Showing ${allProducts.length} featured products`
            }
          </Text>
        </View>
        
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
});