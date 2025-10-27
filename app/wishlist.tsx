// wishlist.tsx - dummy content
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: Date;
}

export default function WishlistScreen() {
  const { t, language, addToCart, formatPrice } = useApp();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const wishlistProducts: any[] = [];

  const handleRemoveFromWishlist = (itemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
          },
        },
      ]
    );
  };

  const handleAddToCart = (productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Success', t('product.addedToCart'));
  };

  const handleProductPress = (productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/product/${productId}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('account.wishlist')}</Text>
        <View style={styles.placeholder} />
      </View>

      {wishlistProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={80} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptyDescription}>
            Add products you love to your wishlist and shop them later
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.itemsCount}>
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
          </Text>
          {wishlistProducts.map((product, index) => {
            if (!product) return null;
            const wishlistItem = wishlistItems[index];
            const finalPrice = product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price;

            return (
              <View key={wishlistItem.id} style={styles.productCard}>
                <TouchableOpacity
                  onPress={() => handleProductPress(product.id)}
                  activeOpacity={0.7}
                  style={styles.productContent}
                >
                  <SafeImage uri={product.image} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name[language]}
                    </Text>
                    {product.brand && (
                      <Text style={styles.productBrand}>{product.brand}</Text>
                    )}
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        {formatPrice(finalPrice)}
                      </Text>
                      {product.discount && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>-{product.discount}%</Text>
                        </View>
                      )}
                    </View>
                    {product.discount && (
                      <Text style={styles.originalPrice}>
                        {formatPrice(product.price)}
                      </Text>
                    )}
                    <View style={styles.ratingRow}>
                      <Feather name="star" size={14} color={Colors.warning} />
                      <Text style={styles.ratingText}>{product.rating}</Text>
                      <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFromWishlist(wishlistItem.id)}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={20} color={Colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart(product.id)}
                    activeOpacity={0.8}
                  >
                    <Feather name="shopping-cart" size={18} color={Colors.white} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
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
    padding: Spacing.md,
    gap: Spacing.md,
  },
  removeButton: {
    flex: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
  },
});
