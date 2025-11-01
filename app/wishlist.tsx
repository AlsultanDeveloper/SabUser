// wishlist.tsx - dummy content
import React, { useState, useEffect } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { getDocuments, collections, where, deleteDocument, getDocument } from '@/constants/firestore';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: any;
}

export default function WishlistScreen() {
  const { t, language, formatPrice } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist from Firestore
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get wishlist items
        const items = await getDocuments(collections.wishlists, [
          where('userId', '==', user.uid),
        ]);

        setWishlistItems(items as WishlistItem[]);

        // Fetch product details for each wishlist item
        const productsPromises = items.map((item: any) => 
          getDocument(collections.products, item.productId)
        );
        const products = await Promise.all(productsPromises);
        setWishlistProducts(products.filter(p => p !== null));
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

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
            const finalPrice = product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price;

            return (
              <View key={wishlistItem.id} style={styles.productCard}>
                <View style={styles.productContent}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {t('wishlist.savedItem')} {/* عنصر محفوظ */}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        {formatPrice(finalPrice)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      const productName = typeof product.name === 'string'
                        ? product.name
                        : (product.name?.[language] || product.name?.en || product.name?.ar || '');
                      handleRemoveFromWishlist(wishlistItem.id, productName);
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
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
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
  },
  productContent: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  productPrice: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  discountBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold' as const,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    marginLeft: 4,
    fontWeight: '600' as const,
  },
  reviewsText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  productActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
