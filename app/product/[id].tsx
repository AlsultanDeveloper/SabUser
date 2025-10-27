// [id].tsx - dummy content
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';
import { useProduct } from '@/hooks/useFirestore';

const { width, height } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, language, formatPrice, addToCart } = useApp();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { product, loading } = useProduct(typeof id === 'string' ? id : '');

  const finalPrice = product && product.discount
    ? product.price * (1 - product.discount / 100)
    : product?.price || 0;

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await addToCart(product, quantity);
    router.back();
  }, [product, quantity, addToCart, router]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setQuantity(newQuantity);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Feather name="package" size={64} color={Colors.gray[300]} />
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backToHomeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.headerContainer, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageSection}>
          <SafeImage
            uri={product.images[selectedImage]}
            style={styles.mainImage}
          />
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          {product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
              contentContainerStyle={styles.thumbnailContent}
            >
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  activeOpacity={0.7}
                >
                  <SafeImage
                    uri={image}
                    style={[
                      styles.thumbnail,
                      selectedImage === index && styles.thumbnailActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.contentSection}>
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={16} color={Colors.warning} />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewsText}>({product.reviews} {t('product.reviews')})</Text>
            </View>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: product.inStock ? Colors.success + '20' : Colors.error + '20' },
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  { color: product.inStock ? Colors.success : Colors.error },
                ]}
              >
                {product.inStock ? t('product.inStock') : t('product.outOfStock')}
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name[language]}</Text>
          <Text style={styles.brandText}>{product.brand}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
            {product.discount && (
              <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.description')}</Text>
            <Text style={styles.descriptionText}>{product.description[language]}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.quantity')}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
              >
                <Feather name="minus" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(quantity + 1)}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={styles.totalLabel}>{t('common.total')}</Text>
            <Text style={styles.totalPrice}>{formatPrice(finalPrice * quantity)}</Text>
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Feather name="shopping-cart" size={20} color={Colors.white} />
              <Text style={styles.addToCartText}>{t('common.addToCart')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    backgroundColor: Colors.white,
  },
  mainImage: {
    width: width,
    height: height * 0.5,
    backgroundColor: Colors.gray[100],
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.xl + 40,
    right: Spacing.md,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  thumbnailScroll: {
    paddingVertical: Spacing.md,
  },
  thumbnailContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  contentSection: {
    padding: Spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  stockBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  stockText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },
  productName: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  brandText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  price: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    minWidth: 60,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  addToCartButton: {
    flex: 1,
    marginLeft: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  addToCartText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontWeight: '600' as const,
  },
  backToHomeButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  backToHomeText: {
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: 'bold' as const,
  },
});
