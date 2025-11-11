// SAB Market Home Page - Complete Grocery Shopping Experience
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { ChevronLeft, Search, ShoppingCart } from 'lucide-react-native';

import { useMarket } from '@/contexts/MarketContext';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CATEGORY_WIDTH = (width - 64) / 2;

// Category icons and colors mapping
const CATEGORY_ICONS: { [key: string]: { image: string; color: string } } = {
  'Fruits & Vegetables': { image: '🥬', color: '#10B981' },
  'Kitchen Pantry': { image: '🍝', color: '#F59E0B' },
  'Bakery': { image: '🥐', color: '#D97706' },
  'Deli Dairy & Eggs': { image: '🥛', color: '#3B82F6' },
  'Snaks & Candy': { image: '🍭', color: '#EC4899' },
  'Snacks & Candy': { image: '🍭', color: '#EC4899' },  // Added for Firebase name
  'Beverages': { image: '🧃', color: '#8B5CF6' },
  ' Beverages': { image: '🧃', color: '#8B5CF6' },  // Added for Firebase name with space
  'Frozen Food': { image: '🧊', color: '#06B6D4' },
  'Cleaning & Household': { image: '🧹', color: '#10B981' },
};

export default function MarketHome() {
  const { language, isRTL, marketCartCount } = useMarket();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Animation for the tagline glow effect
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for the delivery banner
  const deliveryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a pulsing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
    
    // Create delivery banner shake animation every 10 seconds
    const deliveryInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(deliveryAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deliveryAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deliveryAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deliveryAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deliveryAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 10000);

    return () => clearInterval(deliveryInterval);
  }, []);
  
  // Load subcategories from Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const { db } = await import('@/constants/firebase');
        
        if (!db) {
          console.log('Firebase not initialized, using fallback categories');
          setCategories(getFallbackCategories());
          setLoading(false);
          return;
        }

        // Subcategories are stored as subcollection under categories/{categoryId}/subcategory
        const { doc } = await import('firebase/firestore');
        const categoryDoc = doc(db, 'categories', 'cwt28D5gjoLno8SFqoxQ');
        const subcategoriesRef = collection(categoryDoc, 'subcategory');
        
        const snapshot = await getDocs(subcategoriesRef);
        const loadedCategories = snapshot.docs.map(doc => {
          const data = doc.data();
          // Use nameEn and nameAr fields (not nested name.en / name.ar)
          const nameEn = data.nameEn || data.name?.en || data.name;
          const nameAr = data.nameAr || data.name?.ar || data.name;
          const icon = CATEGORY_ICONS[nameEn] || { image: '🛒', color: '#10B981' };
          
          return {
            id: doc.id,
            name: { en: nameEn, ar: nameAr },
            image: icon.image,
            color: icon.color,
          };
        });
        
        if (loadedCategories.length > 0) {
          setCategories(loadedCategories);
        } else {
          // No categories found, use fallback
          setCategories(getFallbackCategories());
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Use fallback categories on error
        setCategories(getFallbackCategories());
        setLoading(false);
      }
    };

    loadCategories();
  }, []);
  
  const getFallbackCategories = () => {
    return [
      { id: 'fb1', name: { en: 'Fruits & Vegetables', ar: 'فواكه وخضروات' }, image: '🥬', color: '#10B981' },
      { id: 'fb2', name: { en: 'Kitchen Pantry', ar: 'مخزن المطبخ' }, image: '🍝', color: '#F59E0B' },
      { id: 'fb3', name: { en: 'Bakery', ar: 'مخبوزات' }, image: '🥐', color: '#D97706' },
      { id: 'fb4', name: { en: 'Deli Dairy & Eggs', ar: 'ألبان وبيض' }, image: '🥛', color: '#3B82F6' },
      { id: 'fb5', name: { en: 'Snaks & Candy', ar: 'وجبات خفيفة وحلويات' }, image: '🍭', color: '#EC4899' },
      { id: 'fb6', name: { en: 'Beverages', ar: 'مشروبات' }, image: '🧃', color: '#8B5CF6' },
      { id: 'fb7', name: { en: 'Frozen Food', ar: 'أطعمة مجمدة' }, image: '🧊', color: '#06B6D4' },
      { id: 'fb8', name: { en: 'Cleaning & Household', ar: 'تنظيف ومنزل' }, image: '🧹', color: '#10B981' },
    ];
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const handleCategoryPress = (category: any) => {
    // Navigate to category products
    router.push(`/market/category/${category.id}` as any);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results with query
      router.push(`/search?query=${encodeURIComponent(searchQuery)}&marketOnly=true` as any);
    }
  };

  const handleBackToStore = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FF4500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleBackToStore} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors.white} />
              <Text style={styles.backText}>
                {isRTL ? 'SAB Store' : 'SAB Store'}
              </Text>
            </TouchableOpacity>

            <View style={styles.topRight}>
              <TouchableOpacity 
                style={styles.cartButton}
                onPress={() => router.push('/market/cart' as any)}
              >
                <ShoppingCart size={22} color={Colors.white} />
                {marketCartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{marketCartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>SAB Market</Text>
            <View style={styles.taglineContainer}>
              <Animated.View style={[styles.taglineGlow, { opacity: glowOpacity }]} />
              <LinearGradient
                colors={['#FFE5D9', '#FFECD0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.taglineGradient}
              >
                <Text style={styles.taglineIcon}>🚪</Text>
                <Text style={styles.taglineText}>
                  {isRTL ? 'نجلب السوق إلى بابك - بنقرة واحدة' : 'We Bring the market to your door - just a tap away'}
                </Text>
                <Text style={styles.taglineIcon}>✨</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={isRTL ? 'ابحث في المواد الغذائية...' : 'Search for groceries...'}
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Delivery Banner */}
        <Animated.View style={[
          styles.deliveryBanner,
          { transform: [{ translateX: deliveryAnim }] }
        ]}>
          <Text style={styles.deliveryIcon}>⚡</Text>
          <View style={styles.deliveryTextContainer}>
            <Text style={styles.deliveryTitle}>
              {isRTL ? 'توصيل سريع' : 'Quick Delivery'}
            </Text>
            <Text style={styles.deliverySubtitle}>
              {isRTL ? 'استلم طلبك في 25 دقيقة' : 'Get your order in 25 minutes'}
            </Text>
          </View>
        </Animated.View>

        {/* Categories Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>
              {isRTL ? 'جاري التحميل...' : 'Loading categories...'}
            </Text>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { borderColor: category.color }]}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Text style={styles.categoryEmoji}>{category.image}</Text>
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {isRTL ? category.name.ar : category.name.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Special Offers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isRTL ? '🔥 عروض خاصة' : '🔥 Special Offers'}
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>
              {isRTL ? 'عرض الكل' : 'See All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Placeholder for offers */}
        <View style={styles.offersPlaceholder}>
          <Text style={styles.placeholderText}>
            {isRTL ? 'العروض قريباً...' : 'Offers coming soon...'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  topRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: 0,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  taglineContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  taglineGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  taglineGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    gap: 6,
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#D84315',
  },
  taglineIcon: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderLeftWidth: 5,
    borderLeftColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  deliveryIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 3,
  },
  deliverySubtitle: {
    fontSize: 14,
    color: '#78350F',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  seeAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoryCard: {
    width: CATEGORY_WIDTH,
    height: 160,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryEmoji: {
    fontSize: 42,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  offersPlaceholder: {
    backgroundColor: Colors.gray[100],
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
