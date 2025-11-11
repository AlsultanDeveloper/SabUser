// Simple Fast Search - بحث بسيط وسريع
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMarket } from '@/contexts/MarketContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import type { Product } from '@/types';
import { Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language, formatPrice } = useApp();
  const { user } = useAuth();
  const { addToMarketCart, marketCartCount } = useMarket();
  
  const [searchQuery, setSearchQuery] = useState(params.query ? String(params.query) : '');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketOnly] = useState(params.marketOnly === 'true');
  const displayLimit = 20; // ثابت - نعرض 20 منتج دائماً
  
  // ✅ OPTIMIZED: بحث مباشر في Firebase بدون تحميل كل المنتجات
  useEffect(() => {
    // Need at least 2 characters to search
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Debounce: انتظر 300ms قبل البحث
    const timer = setTimeout(async () => {
      try {
        const { collection, getDocs, query, where, limit } = await import('firebase/firestore');
        const { db } = await import('@/constants/firebase');
        
        if (!db) {
          setLoading(false);
          return;
        }

        const queryTrimmed = searchQuery.trim();
        const queryLower = queryTrimmed.toLowerCase();
        
        console.log(`🔎 Searching Firebase directly for: "${queryTrimmed}"`);
        
        // ✅ OPTIMIZED: نجلب أول 1000 منتج من Sab Market للبحث الشامل
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ'),
          limit(1000) // جلب 1000 منتج للبحث فيهم (من أصل 26,000)
        );
        
        const snapshot = await getDocs(q);
        
        // Client-side filtering للبحث في الاسم والوصف
        const results: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          const nameEn = typeof data.name === 'object' ? (data.name.en || '') : (data.name || '');
          const nameAr = typeof data.name === 'object' ? (data.name.ar || '') : '';
          const brand = (data.brand || '').trim();
          
          const matchesEnglish = nameEn.toLowerCase().includes(queryLower);
          const matchesArabic = nameAr.includes(queryTrimmed);
          const matchesBrand = brand.toLowerCase().includes(queryLower);
          
          if (matchesEnglish || matchesArabic || matchesBrand) {
            results.push({
              id: doc.id,
              ...data,
              image: data.image || data.images?.[0] || '',
            } as Product);
          }
        });
        
        console.log(`✅ Found ${results.length} results from ${snapshot.size} products`);
        
        // عرض أول 20 منتج
        setSearchResults(results.slice(0, displayLimit));
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Search error:', error);
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, displayLimit]);

  // ✅ REMOVED: Load more - لن نحتاجه لأننا نجلب 100 منتج فقط
  // المستخدم يمكنه تحسين البحث بكلمات أكثر دقة

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <LinearGradient
        colors={marketOnly ? ['#FF6B35', '#F7931E', '#FF4500'] : ['#0EA5E9', '#0284C7', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder={marketOnly 
                  ? (language === 'ar' ? 'ابحث في المواد الغذائية...' : 'Search for groceries...') 
                  : (language === 'ar' ? 'ابحث عن المنتجات...' : 'Search for products...')
                }
                placeholderTextColor={Colors.gray[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={20} color={Colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Market Badge */}
      {marketOnly && (
        <View style={styles.marketBadge}>
          <Text style={styles.marketBadgeText}>
            🛒 {language === 'ar' ? 'البحث في SAB Market فقط' : 'Searching in SAB Market only'}
          </Text>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
          </Text>
        </View>
      ) : searchQuery.length < 2 ? (
        <View style={styles.center}>
          <Feather name="search" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>
            {language === 'ar' ? 'ابحث عن المنتجات' : 'Search for products'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {language === 'ar' ? 'اكتب حرفين على الأقل' : 'Type at least 2 characters'}
          </Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>
            {language === 'ar' ? 'لا توجد نتائج' : 'No results'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {language === 'ar' 
              ? `لم نجد نتائج لـ "${searchQuery}"`
              : `No results found for "${searchQuery}"`
            }
          </Text>
          <Text style={styles.emptyHint}>
            {language === 'ar' 
              ? 'جرب البحث بكلمات مختلفة أو تأكد من الإملاء'
              : 'Try different keywords or check spelling'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const productName = typeof item.name === 'object' 
              ? (language === 'ar' && item.name.ar ? item.name.ar : item.name.en || item.name.ar || 'Product')
              : (item.name || 'Product');
            
            const imageUrl = item.image || item.images?.[0] || '';
            const weightText = (item as any).weight ? String((item as any).weight) + ((item as any).unit ? ' ' + (item as any).unit : '') : '';
            
            const originalPrice = item.price || 0;
            const discount = item.discount || 0;
            const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
            
            const finalPriceText = '$' + finalPrice.toFixed(2);
            const originalPriceText = discount > 0 ? '$' + originalPrice.toFixed(2) : '';
            const hasDiscount = discount > 0;
            const discountText = hasDiscount ? '-' + String(Math.round(discount)) + '%' : '';

            return (
              <TouchableOpacity 
                style={styles.productCard}
                onPress={() => router.push(`/product/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.imageContainer}>
                  {imageUrl ? (
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>🍎</Text>
                    </View>
                  )}
                  
                  {hasDiscount ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discountText}</Text>
                    </View>
                  ) : null}
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
                  {weightText ? <Text style={styles.productWeight}>{weightText}</Text> : null}
                  
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.productPrice}>{finalPriceText}</Text>
                      {hasDiscount ? (
                        <Text style={styles.originalPrice}>{originalPriceText}</Text>
                      ) : null}
                    </View>

                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => addToMarketCart(item)}
                    >
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={
            searchResults.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={styles.count}>
                  {language === 'ar' 
                    ? `${searchResults.length} منتج`
                    : `${searchResults.length} products`
                  }
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            searchResults.length >= 20 ? (
              <View style={styles.endMessage}>
                <Text style={styles.endMessageText}>
                  {language === 'ar' 
                    ? 'اكتب كلمات أكثر دقة لنتائج أفضل'
                    : 'Use more specific keywords for better results'
                  }
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  emptyTitle: {
    marginTop: Spacing.xl,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  emptySubtitle: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyHint: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.sm,
    color: Colors.gray[400],
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  list: {
    padding: 16,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  productWeight: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  endMessageText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  marketBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  marketBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#92400E',
  },
});
