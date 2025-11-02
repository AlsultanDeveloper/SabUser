import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';

// منتجات أكثر للعرض - 15 منتج متنوع
const allProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    nameAr: 'سماعات لاسلكية',
    price: 99.99,
    discount: 20,
    image: 'https://via.placeholder.com/200/4F46E5/FFFFFF?text=Headphones',
    brand: 'TechBrand',
    rating: 4.5,
    reviewsCount: 128,
    freeShipping: true,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Summer Dress',
    nameAr: 'فستان صيفي',
    price: 45.00,
    discount: 30,
    image: 'https://via.placeholder.com/200/EC4899/FFFFFF?text=Dress',
    brand: 'FashionBrand',
    rating: 4.3,
    reviewsCount: 89,
    freeShipping: true,
    category: 'Fashion',
  },
  {
    id: '3',
    name: 'Smart Watch',
    nameAr: 'ساعة ذكية',
    price: 199.99,
    image: 'https://via.placeholder.com/200/10B981/FFFFFF?text=Watch',
    brand: 'SmartTech',
    rating: 4.8,
    reviewsCount: 456,
    freeShipping: true,
    category: 'Electronics',
  },
  {
    id: '4',
    name: 'Gaming Mouse',
    nameAr: 'فأرة ألعاب',
    price: 79.99,
    discount: 15,
    image: 'https://via.placeholder.com/200/6366F1/FFFFFF?text=Mouse',
    brand: 'GameGear',
    rating: 4.6,
    reviewsCount: 234,
    isNew: true,
    category: 'Electronics',
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    nameAr: 'سماعة بلوتوث',
    price: 89.99,
    discount: 25,
    image: 'https://via.placeholder.com/200/8B5CF6/FFFFFF?text=Speaker',
    brand: 'AudioMax',
    rating: 4.4,
    reviewsCount: 312,
    freeShipping: true,
    category: 'Electronics',
  },
  {
    id: '6',
    name: 'Laptop Stand',
    nameAr: 'حامل لابتوب',
    price: 39.99,
    image: 'https://via.placeholder.com/200/F59E0B/FFFFFF?text=Stand',
    brand: 'DeskPro',
    rating: 4.7,
    reviewsCount: 189,
    freeShipping: true,
    category: 'Office',
  },
  {
    id: '7',
    name: 'Phone Case',
    nameAr: 'غطاء هاتف',
    price: 24.99,
    discount: 40,
    image: 'https://via.placeholder.com/200/EF4444/FFFFFF?text=Case',
    brand: 'ProtectPro',
    rating: 4.2,
    reviewsCount: 567,
    category: 'Accessories',
  },
  {
    id: '8',
    name: 'Coffee Mug',
    nameAr: 'كوب قهوة',
    price: 19.99,
    image: 'https://via.placeholder.com/200/8B4513/FFFFFF?text=Mug',
    brand: 'CafePro',
    rating: 4.0,
    reviewsCount: 123,
    isNew: true,
    category: 'Kitchen',
  },
  {
    id: '9',
    name: 'Fitness Tracker',
    nameAr: 'متتبع اللياقة',
    price: 129.99,
    discount: 20,
    image: 'https://via.placeholder.com/200/16A34A/FFFFFF?text=Fitness',
    brand: 'HealthTech',
    rating: 4.5,
    reviewsCount: 891,
    freeShipping: true,
    category: 'Sports',
  },
  {
    id: '10',
    name: 'Desk Lamp',
    nameAr: 'مصباح مكتب',
    price: 59.99,
    discount: 10,
    image: 'https://via.placeholder.com/200/F97316/FFFFFF?text=Lamp',
    brand: 'LightMax',
    rating: 4.3,
    reviewsCount: 234,
    freeShipping: true,
    category: 'Home',
  },
  {
    id: '11',
    name: 'Wireless Charger',
    nameAr: 'شاحن لاسلكي',
    price: 49.99,
    discount: 30,
    image: 'https://via.placeholder.com/200/6366F1/FFFFFF?text=Charger',
    brand: 'PowerMax',
    rating: 4.4,
    reviewsCount: 445,
    isNew: true,
    category: 'Electronics',
  },
  {
    id: '12',
    name: 'Backpack',
    nameAr: 'حقيبة ظهر',
    price: 79.99,
    image: 'https://via.placeholder.com/200/374151/FFFFFF?text=Backpack',
    brand: 'TravelPro',
    rating: 4.6,
    reviewsCount: 332,
    freeShipping: true,
    category: 'Fashion',
  },
  {
    id: '13',
    name: 'Wireless Earbuds',
    nameAr: 'سماعات أذن لاسلكية',
    price: 149.99,
    discount: 25,
    image: 'https://via.placeholder.com/200/DC2626/FFFFFF?text=Earbuds',
    brand: 'SoundMax',
    rating: 4.7,
    reviewsCount: 778,
    freeShipping: true,
    category: 'Electronics',
  },
  {
    id: '14',
    name: 'Plant Pot',
    nameAr: 'إناء نبات',
    price: 29.99,
    image: 'https://via.placeholder.com/200/059669/FFFFFF?text=Plant',
    brand: 'GreenLife',
    rating: 4.1,
    reviewsCount: 156,
    category: 'Home',
  },
  {
    id: '15',
    name: 'Keyboard',
    nameAr: 'لوحة مفاتيح',
    price: 109.99,
    discount: 20,
    image: 'https://via.placeholder.com/200/1F2937/FFFFFF?text=Keyboard',
    brand: 'TypePro',
    rating: 4.5,
    reviewsCount: 623,
    freeShipping: true,
    category: 'Electronics',
  },
];

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