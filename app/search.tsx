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
  const [initialLoading, setInitialLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [allSabMarketProducts, setAllSabMarketProducts] = useState<Product[]>([]);
  const [allFilteredResults, setAllFilteredResults] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  
  // Load all Sab Market products once when component mounts
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setInitialLoading(true);
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const { db } = await import('@/constants/firebase');
        
        if (!db) {
          setInitialLoading(false);
          return;
        }
        
        // Load all Sab Market products at once using categoryId
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ'));
        const snapshot = await getDocs(q);
        
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        console.log(`✅ Loaded ${products.length} Sab Market products`);
        setAllSabMarketProducts(products);
        setInitialLoading(false);
        
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setInitialLoading(false);
      }
    };
    
    loadAllProducts();
  }, []);
  
  // Search with debounce - البحث مع التأخير (now searches in cached products)
  useEffect(() => {
    // Reset display limit when search query changes
    setDisplayLimit(20);
    
    // Need at least 1 character to search
    if (!searchQuery || searchQuery.trim().length < 1) {
      setSearchResults([]);
      setAllFilteredResults([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Search in cached products (much faster!)
        const queryTrimmed = searchQuery.trim();
        const queryLower = queryTrimmed.toLowerCase();
        
        console.log(`🔎 Query: "${queryTrimmed}" | Lower: "${queryLower}"`);
        console.log(`🔍 Searching in ${allSabMarketProducts.length} cached products...`);
        
        const filtered = allSabMarketProducts.filter((product: Product) => {
          // English search (case-insensitive)
          const nameEn = typeof product.name === 'object' ? (product.name.en || '') : (product.name || '');
          const nameEnLower = nameEn.toLowerCase().trim();
          
          // Arabic search (case-sensitive for better matching)
          const nameAr = typeof product.name === 'object' ? (product.name.ar || '') : '';
          
          // Categories
          const category = (product.categoryName || '').trim();
          const categoryLower = category.toLowerCase();
          
          const subcategory = (product.subcategoryName || '').trim();
          const subcategoryLower = subcategory.toLowerCase();
          
          // Brand search
          const brand = (product.brand || '').trim();
          const brandLower = brand.toLowerCase();
          
          // Description search
          const descEn = typeof product.description === 'object' ? (product.description.en || '') : '';
          const descEnLower = descEn.toLowerCase().trim();
          const descAr = typeof product.description === 'object' ? (product.description.ar || '') : '';
          
          // English search (check if any field contains the query)
          const matchesEnglish = nameEnLower.includes(queryLower) || 
                                categoryLower.includes(queryLower) ||
                                subcategoryLower.includes(queryLower) ||
                                brandLower.includes(queryLower) ||
                                descEnLower.includes(queryLower);
          
          // Arabic search (use original case)
          const matchesArabic = nameAr.includes(queryTrimmed) || 
                               category.includes(queryTrimmed) ||
                               subcategory.includes(queryTrimmed) ||
                               brand.includes(queryTrimmed) ||
                               descAr.includes(queryTrimmed);
          
          const matches = matchesEnglish || matchesArabic;
          
          // Debug logging for products that match "co" but not "coc"
          if (queryLower === 'coc' && nameEnLower.includes('co')) {
            console.log(`🐛 Debug: "${nameEn}" | Lower: "${nameEnLower}" | Includes "coc": ${nameEnLower.includes('coc')}`);
          }
          
          return matches;
        });
        
        console.log(`✅ Found ${filtered.length} results`);
        
        // Store all results
        setAllFilteredResults(filtered);
        
        // Display only first 20 results
        setSearchResults(filtered.slice(0, displayLimit));
        setHasMore(filtered.length > displayLimit);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Search error:', error);
        setLoading(false);
      }
    }, 300); // Reduced debounce time from 400ms to 300ms

    return () => clearTimeout(timer);
  }, [searchQuery, displayLimit, allSabMarketProducts]);

  // Load more products - تحميل المزيد من المنتجات
  const loadMore = () => {
    const newLimit = displayLimit + 20;
    setDisplayLimit(newLimit);
    setSearchResults(allFilteredResults.slice(0, newLimit));
    setHasMore(allFilteredResults.length > newLimit);
  };

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
      {initialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : searchQuery.length === 0 ? (
        <View style={styles.center}>
          <Feather name="search" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>
            {language === 'ar' ? 'ابحث عن المنتجات' : 'Search for products'}
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
            <View style={styles.resultsHeader}>
              <Text style={styles.count}>
                {language === 'ar' 
                  ? `عرض ${searchResults.length} من ${allFilteredResults.length} منتج`
                  : `Showing ${searchResults.length} of ${allFilteredResults.length} products`
                }
              </Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={loadMore}
              >
                <Text style={styles.loadMoreText}>
                  {language === 'ar' ? 'تحميل المزيد' : 'Load More'}
                </Text>
                <Feather name="chevron-down" size={20} color={Colors.primary} />
              </TouchableOpacity>
            ) : searchResults.length > 0 ? (
              <View style={styles.endMessage}>
                <Text style={styles.endMessageText}>
                  {language === 'ar' 
                    ? `تم عرض جميع المنتجات (${allFilteredResults.length})`
                    : `All products shown (${allFilteredResults.length})`
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
