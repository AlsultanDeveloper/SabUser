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
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';
import type { Product } from '@/types';

export default function SearchScreen() {
  const router = useRouter();
  const { language, formatPrice } = useApp();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
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
        
        // ✅ OPTIMIZED: نجلب فقط أول 100 منتج من Sab Market
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ'),
          limit(100) // جلب 100 فقط للبحث فيهم
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

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.uid) return;

      try {
        const { getDocuments, collections, where } = await import('@/constants/firestore');
        const items = await getDocuments(collections.wishlists, [
          where('userId', '==', user.uid),
        ]);
        setWishlistItems(items);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleWishlist = async (productId: string) => {
    if (!user?.uid) return;
    
    try {
      const { createDocument, deleteDocument, getDocuments, collections, where } = await import('@/constants/firestore');
      
      const existingItems = await getDocuments(collections.wishlists, [
        where('userId', '==', user.uid),
        where('productId', '==', productId),
      ]);

      if (existingItems.length > 0) {
        await deleteDocument(collections.wishlists, existingItems[0].id);
      } else {
        await createDocument(collections.wishlists, {
          userId: user.uid,
          productId: productId,
          createdAt: new Date().toISOString(),
        });
      }

      const items = await getDocuments(collections.wishlists, [
        where('userId', '==', user.uid),
      ]);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'ar' ? 'ابحث عن المنتجات...' : 'Search for products...'}
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
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <AmazonStyleProductCard
                product={item}
                onPress={() => router.push(`/product/${item.id}` as any)}
                formatPrice={formatPrice}
                language={language}
                onToggleWishlist={() => handleWishlist(item.id)}
                isInWishlist={wishlistItems?.some((w: any) => w.productId === item.id) || false}
              />
            </View>
          )}
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
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
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
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  count: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  loadMoreText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  endMessageText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  productWrapper: {
    width: '48%',
  },
});
