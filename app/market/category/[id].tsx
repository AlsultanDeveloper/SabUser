import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useMarket } from '@/contexts/MarketContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';
import Toast from 'react-native-toast-message';
import { useSettings } from '@/hooks/useSettings';
import GlassyGradientCartFAB from '@/components/GlassyGradientCartFAB';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: { icon: string; color: string } } = {
  'Fruits & Vegetables': { icon: '🥬', color: '#10B981' },
  'Kitchen Pantry': { icon: '🍝', color: '#F59E0B' },
  'Bakery': { icon: '🥐', color: '#D97706' },
  'Deli Dairy & Eggs': { icon: '🥛', color: '#3B82F6' },
  'Snaks & Candy': { icon: '🍭', color: '#EC4899' },
  'Snacks & Candy': { icon: '🍭', color: '#EC4899' },  // Added for Firebase name
  'Beverages': { icon: '🧃', color: '#8B5CF6' },
  ' Beverages': { icon: '🧃', color: '#8B5CF6' },  // Added for Firebase name with space
  'Frozen Food': { icon: '🧊', color: '#06B6D4' },
  'Cleaning & Household': { icon: '🧹', color: '#10B981' },
};

interface Product {
  id: string;
  name: any;
  price: number;
  discount?: number;
  image: string;
  images?: string[];
  weight?: string;
  unit?: string;
  inStock?: boolean;
  category?: string;
}

export default function MarketCategoryScreen() {
  const { id } = useLocalSearchParams();
  const { marketCart, addToMarketCart, language } = useMarket();
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');
  const [categoryName, setCategoryName] = useState('Category');
  const [categoryIcon, setCategoryIcon] = useState('🛒');
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const PRODUCTS_PER_PAGE = 25;

  // Cart count
  const marketCartCount = useMemo(() => {
    return marketCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [marketCart]);

  // Load category info and products from Firebase
  useEffect(() => {
    loadCategoryAndProducts();
  }, [id]);

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Get subcategory info - it's stored as subcollection under categories/{categoryId}/subcategory/{subcategoryId}
      const subcategoryRef = doc(db, 'categories', 'cwt28D5gjoLno8SFqoxQ', 'subcategory', id as string);
      const subcategoryDoc = await getDoc(subcategoryRef);
      
      let subcategoryNameEn = '';
      let subcategorySearchName = '';
      
      if (subcategoryDoc.exists()) {
        const data = subcategoryDoc.data();
        // Use nameEn and nameAr fields for display
        const nameEn = data.nameEn || data.name?.en || data.name;
        const nameAr = data.nameAr || data.name?.ar || data.name;
        
        subcategoryNameEn = nameEn;
        setCategoryName(language === 'ar' ? nameAr : nameEn);
        
        // Get icon
        const iconData = CATEGORY_ICONS[nameEn] || CATEGORY_ICONS[data.name] || { icon: '🛒', color: '#10B981' };
        setCategoryIcon(iconData.icon);
        
        // IMPORTANT: Use the 'name' field for searching products, as products use this exact value in subcategoryName
        // Example: data.name = "Snacks & Candy" but data.nameEn = "Snacks & Sweets"
        subcategorySearchName = data.name || nameEn;
      }
      
      console.log('Searching for products with subcategoryName:', subcategorySearchName);
      
      // Query products by categoryId (SAB MARKET) AND subcategoryName
      const productsRef = collection(db, 'products');
      const { limit: firestoreLimit, orderBy } = await import('firebase/firestore');
      
      let q = query(
        productsRef,
        where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ'), // SAB MARKET only
        where('subcategoryName', '==', subcategorySearchName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        firestoreLimit(PRODUCTS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedProducts: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          name: data.name,
          price: data.price || 0,
          discount: data.discount,
          image: data.image || data.images?.[0] || '',
          images: data.images || [],
          weight: data.weight || undefined,
          unit: data.unit || 'kg',
          inStock: data.inStock !== false,
          category: data.category,
        });
      });

      console.log(`Found ${fetchedProducts.length} products for ${subcategorySearchName}`);
      setProducts(fetchedProducts);
      setHasMore(fetchedProducts.length === PRODUCTS_PER_PAGE);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
    } catch (error) {
      console.error('Error fetching products:', error);
      Toast.show({
        type: 'error',
        text1: language === 'ar' ? 'خطأ في تحميل المنتجات' : 'Error loading products',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);
      const { limit: firestoreLimit, orderBy, startAfter } = await import('firebase/firestore');
      
      // Get current category name for search
      const subcategoryRef = doc(db, 'categories', 'cwt28D5gjoLno8SFqoxQ', 'subcategory', id as string);
      const subcategoryDoc = await getDoc(subcategoryRef);
      
      if (!subcategoryDoc.exists()) return;
      
      const data = subcategoryDoc.data();
      const subcategorySearchName = data.name || data.nameEn || data.name?.en || data.name;
      
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ'),
        where('subcategoryName', '==', subcategorySearchName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        firestoreLimit(PRODUCTS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedProducts: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          name: data.name,
          price: data.price || 0,
          discount: data.discount,
          image: data.image || data.images?.[0] || '',
          images: data.images || [],
          weight: data.weight || undefined,
          unit: data.unit || 'kg',
          inStock: data.inStock !== false,
          category: data.category,
        });
      });

      setProducts([...products, ...fetchedProducts]);
      setHasMore(fetchedProducts.length === PRODUCTS_PER_PAGE);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceB - priceA;
      });
    }
    
    return sorted;
  }, [products, sortBy]);

  const handleBackPress = () => {
    router.back();
  };

  const handleCartPress = () => {
    router.push('/market/cart' as any);
  };

  const handleProductPress = (product: Product) => {
    router.push(`/market/product/${product.id}` as any);
  };

  const handleAddToCart = (product: Product) => {
    addToMarketCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
        quantity: 1,
        discount: product.discount,
      },
      1
    );

    Toast.show({
      type: 'success',
      text1: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart',
      text2: typeof product.name === 'string' 
        ? product.name 
        : product.name?.[language as 'en' | 'ar'] || product.name?.en || '',
      visibilityTime: 2000,
    });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    // Get product name safely
    let productName = 'Product';
    if (item && item.name) {
      if (typeof item.name === 'string') {
        productName = item.name;
      } else if (typeof item.name === 'object') {
        productName = item.name[language as 'en' | 'ar'] || item.name.en || 'Product';
      }
    }

    // Get price safely
    const price = (item && typeof item.price === 'number') ? item.price : 0;
    const discount = (item?.discount && typeof item.discount === 'number') ? item.discount : 0;
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
    
    const finalPriceText = '$' + finalPrice.toFixed(2);
    const originalPriceText = '$' + price.toFixed(2);
    
    // Format LBP price
    const USD_TO_LBP = 89700;
    const formatLBP = (usdPrice: number) => {
      const lbpAmount = usdPrice * USD_TO_LBP;
      
      // تقريب للألف الأقرب: إذا آخر 3 أرقام >= 500 نزيد، وإلا نرجع صفر
      const roundedAmount = Math.round(lbpAmount / 1000) * 1000;
      
      return 'LBP ' + roundedAmount.toLocaleString('en-US');
    };

    // Get image safely
    const imageUrl = item?.image || '';

    // Get weight safely
    let weightText = '';
    if (item?.weight) {
      weightText = String(item.weight);
      if (item.unit) {
        weightText = weightText + ' ' + String(item.unit);
      }
    }

    // Get discount safely
    const hasDiscount = discount > 0;
    const discountText = hasDiscount ? '-' + String(Math.round(discount)) + '%' : '';

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🛒</Text>
            </View>
          )}
          
          {/* Discount Badge - Noon Style */}
          {hasDiscount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountText}</Text>
            </View>
          ) : null}
          
          {/* Express Delivery Badge */}
          <View style={styles.expressBadge}>
            <Text style={styles.expressText}>⚡ {language === 'ar' ? '25 دقيقة' : '25 Min'}</Text>
          </View>
        </View>
        
        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
          
          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceColumn}>
              {/* USD Price */}
              <View style={styles.priceRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.productPrice}>{finalPrice.toFixed(2)}</Text>
              </View>
              
              {/* LBP Price + Add Button */}
              <View style={styles.lbpWithButtonRow}>
                <Text style={styles.lbpPrice}>{formatLBP(finalPrice)}</Text>
                
                {/* Add to Cart Button */}
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddToCart(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addButtonIcon}>+</Text>
                </TouchableOpacity>
              </View>
              
              {/* Original Price with Discount */}
              {hasDiscount ? (
                <View style={styles.discountRow}>
                  <Text style={styles.originalPrice}>{originalPriceText}</Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>
                      {language === 'ar' ? 'وفّر' : 'Save'} ${(price - finalPrice).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#FF6B35', '#F7931E', '#FF4500']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <ChevronLeft color="#FFF" size={24} />
              <Text style={styles.backButtonText}>
                {language === 'ar' ? 'الماركت' : 'Market'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FF4500']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <ChevronLeft color="#FFF" size={24} />
            <Text style={styles.backButtonText}>
              {language === 'ar' ? 'الماركت' : 'Market'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
        </View>
      </LinearGradient>

      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'default' && styles.sortButtonActive]}
          onPress={() => setSortBy('default')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'default' && styles.sortButtonTextActive]}>
            {language === 'ar' ? 'الافتراضي' : 'Default'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'price-low' && styles.sortButtonActive]}
          onPress={() => setSortBy('price-low')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'price-low' && styles.sortButtonTextActive]}>
            {language === 'ar' ? 'الأقل سعراً ↓' : 'Price: Low ↓'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'price-high' && styles.sortButtonActive]}
          onPress={() => setSortBy('price-high')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'price-high' && styles.sortButtonTextActive]}>
            {language === 'ar' ? 'الأعلى سعراً ↑' : 'Price: High ↑'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && sortedProducts.length > 0 ? (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={loadMoreProducts}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#FF6B35" />
              ) : (
                <Text style={styles.loadMoreText}>
                  {language === 'ar' ? 'تحميل المزيد' : 'Load More'}
                </Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Floating Cart Button */}
      {marketCartCount > 0 && (
        <GlassyGradientCartFAB
          count={marketCartCount}
          onPress={() => router.push('/market/checkout-details' as any)}
          size={56}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryHeader: {
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  productCount: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
    opacity: 0.85,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: '#FFFBF8',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5D9',
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE5D9',
  },
  sortButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  productsList: {
    padding: 16,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 4,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.0,
    position: 'relative',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: '100%',
    height: '100%',
    padding: 12,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.3,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3E3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#FF3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  expressBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expressText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 0,
    minHeight: 34,
    lineHeight: 17,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  weightIcon: {
    fontSize: 12,
  },
  productWeight: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 3,
  },
  starIcon: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },
  priceSection: {
    marginTop: 4,
  },
  priceColumn: {
    alignItems: 'flex-start',
  },
  priceWithButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
    width: '100%',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    direction: 'ltr',
    marginBottom: 2,
  },
  lbpWithButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
    marginRight: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF6B35',
  },
  lbpPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    direction: 'ltr',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    direction: 'ltr',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveText: {
    fontSize: 10,
    color: '#FF6B35',
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  loadMoreButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    marginHorizontal: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loadMoreText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  floatingCartButton: {
    position: 'absolute' as const,
    bottom: 24,
    right: 20,
    borderRadius: 32,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },
  floatingCartGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  pulseCircle: {
    position: 'absolute' as const,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  shimmerOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: -64,
    right: 0,
    bottom: 0,
    width: 128,
    height: 64,
  },
  floatingCartBadge: {
    position: 'absolute' as const,
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 15,
    minWidth: 30,
    height: 30,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: '#FF4500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingCartBadgeText: {
    color: '#FF4500',
    fontSize: 14,
    fontWeight: '900' as const,
    includeFontPadding: false,
    textAlign: 'center' as const,
  },
});
