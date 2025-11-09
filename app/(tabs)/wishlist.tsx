// wishlist.tsx - dummy content
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { getDocuments, collections, where, deleteDocument, getDocument } from '@/constants/firestore';
import SafeImage from '@/components/SafeImage';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: any;
}

export default function WishlistScreen() {
  const { t, language, formatPrice, addToCart } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist function
  const fetchWishlist = useCallback(async () => {
    if (!user?.uid) {
      setWishlistItems([]);
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching wishlist for user:', user.uid);
      
      // Get wishlist items
      const items = await getDocuments(collections.wishlists, [
        where('userId', '==', user.uid),
      ]);

      console.log('📦 Wishlist items found:', items.length);
      setWishlistItems(items as WishlistItem[]);

      // Fetch product details for each wishlist item
      const productsPromises = items.map((item: any) => 
        getDocument(collections.products, item.productId)
      );
      const products = await Promise.all(productsPromises);
      const validProducts = products.filter(p => p !== null);
      
      console.log('📦 Wishlist products loaded:', validProducts.length);
      validProducts.forEach((p: any, i: number) => {
        const firstImage = p.images?.[0];
        console.log(`Product ${i + 1}:`, {
          id: p.id,
          name: p.name,
          hasImages: !!p.images,
          imagesLength: p.images?.length || 0,
          firstImageType: typeof firstImage,
          firstImagePreview: typeof firstImage === 'string' 
            ? firstImage.substring(0, 50) + '...' 
            : 'Not a string',
        });
      });
      
      setWishlistProducts(validProducts);
    } catch (error) {
      // Silently handle permission errors
      console.warn('Could not fetch wishlist:', error);
      setWishlistItems([]);
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload wishlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('👀 Wishlist screen focused - reloading data');
      fetchWishlist();
    }, [fetchWishlist])
  );

  const handleRemoveFromWishlist = async (itemId: string, productName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    try {
      await deleteDocument(collections.wishlists, itemId);
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      setWishlistProducts(prev => prev.filter(p => {
        const item = wishlistItems.find(i => i.id === itemId);
        return p.id !== item?.productId;
      }));

      Toast.show({
        type: 'info',
        text1: '💔 ' + t('wishlist.removed'),
        text2: productName,
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 100,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error') || 'Error',
        text2: 'Failed to remove item',
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 100,
      });
    }
  };

  const handleAddToCart = async (product: any, productName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await addToCart(product, 1);
      
      Toast.show({
        type: 'success',
        text1: '🛒 ' + (language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to Cart'),
        text2: productName,
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 100,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error') || 'Error',
        text2: language === 'ar' ? 'فشل إضافة المنتج للسلة' : 'Failed to add product to cart',
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 100,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('account.wishlist')}</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.emptyTitle, { marginTop: 16 }]}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      ) : wishlistProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={80} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>{t('wishlist.empty')}</Text>
          <Text style={styles.emptyDescription}>
            {t('wishlist.emptyDescription')}
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.shopButtonText}>{t('wishlist.startShopping')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.itemsCount}>
            {`${wishlistProducts.length} ${wishlistProducts.length === 1 ? 'item' : 'items'}`}
          </Text>
          {wishlistProducts.map((product, index) => {
            if (!product) return null;
            const wishlistItem = wishlistItems[index];
            
            // Debug log
            console.log('🖼️ Rendering product:', {
              id: product.id,
              name: typeof product.name === 'string' ? product.name : product.name?.en,
              hasImages: !!product.images,
              imagesArray: product.images,
              firstImageType: typeof product.images?.[0],
              firstImage: product.images?.[0],
            });
            
            // Get product name based on language
            const productName = typeof product.name === 'string'
              ? product.name
              : (product.name?.[language] || product.name?.en || product.name?.ar || t('wishlist.savedItem'));
            
            const finalPrice = product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price;

            return (
              <TouchableOpacity
                key={wishlistItem.id}
                style={styles.productCard}
                onPress={() => router.push(`/product/${product.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.productContent}>
                  {/* Product Image */}
                  <View style={styles.imageContainer}>
                    {product.images && product.images.length > 0 && typeof product.images[0] === 'string' ? (
                      <SafeImage
                        uri={product.images[0]}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productImage, styles.placeholderImage]}>
                        <Feather name="image" size={32} color={Colors.gray[300]} />
                      </View>
                    )}
                  </View>

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {productName}
                    </Text>
                    
                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{product.discount}%</Text>
                      </View>
                    )}
                    
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        {formatPrice(finalPrice)}
                      </Text>
                      {product.discount > 0 && (
                        <Text style={styles.originalPrice}>
                          {formatPrice(product.price)}
                        </Text>
                      )}
                    </View>
                    
                    {/* Rating */}
                    {product.rating && (
                      <View style={styles.ratingRow}>
                        <Feather name="star" size={14} color="#FFB800" fill="#FFB800" />
                        <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                        {product.reviews && (
                          <Text style={styles.reviewsText}>({product.reviews})</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>

                {/* Product Actions */}
                <View style={styles.productActions}>
                  {/* Remove Button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(wishlistItem.id, productName);
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={18} color={Colors.error} />
                  </TouchableOpacity>
                  
                  {/* Add to Cart Button */}
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product, productName);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="plus" size={18} color={Colors.white} />
                    <Text style={styles.addToCartText}>
                      {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* View Product Button */}
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product.id}` as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="eye" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.md,
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 12,
    paddingLeft: 2,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
  },
  productContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  discountBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    gap: 8,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 6,
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
