import React, { memo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ModernProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language: string;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
  style?: any;
}

const ModernProductCard = memo(function ModernProductCard({ 
  product, 
  onPress, 
  formatPrice, 
  language, 
  onToggleWishlist, 
  isInWishlist = false,
  style
}: ModernProductCardProps) {

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleWishlistPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleWishlist?.(product.id);
  }, [product.id, onToggleWishlist]);

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);

  // حساب السعر بعد الخصم
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  // حساب نسبة الوفر
  const savingsAmount = hasDiscount ? product.price - discountedPrice : 0;

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        { 
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* حاوي الصورة */}
        <View style={styles.imageContainer}>
          <SafeImage 
            uri={product.image || product.imageUrl || 'https://via.placeholder.com/200'} 
            style={styles.image} 
          />
          
          {/* شارة الخصم */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}

          {/* زر المفضلة */}
          {onToggleWishlist && (
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleWishlistPress}
              activeOpacity={0.7}
            >
              <Feather
                name={isInWishlist ? "heart" : "heart"}
                size={16}
                color={isInWishlist ? '#FF6B6B' : Colors.white}
                fill={isInWishlist ? '#FF6B6B' : 'transparent'}
              />
            </TouchableOpacity>
          )}

          {/* شارة "جديد" */}
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>
                {language === 'ar' ? 'جديد' : 'NEW'}
              </Text>
            </View>
          )}

          {/* معاينة سريعة للألوان */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.colorsPreview}>
              {product.colors.slice(0, 3).map((color: string, index: number) => (
                <View
                  key={index}
                  style={[styles.colorDot, { backgroundColor: color }]}
                />
              ))}
            </View>
          )}
        </View>

        {/* معلومات المنتج */}
        <View style={styles.infoContainer}>
          {/* اسم المنتج */}
          <Text style={styles.nameText} numberOfLines={2}>
            {language === 'ar' ? (product.nameAr || product.name) : (product.name || product.nameAr)}
          </Text>

          {/* العلامة التجارية */}
          {(product.brandName || product.brand) && (
            <Text style={styles.brandText} numberOfLines={1}>
              {product.brandName || product.brand}
            </Text>
          )}

          {/* التقييم */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={10}
                    color={star <= (product.rating || 0) ? '#FFD700' : '#E5E5E5'}
                    style={{ marginRight: 1 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>({product.rating})</Text>
            </View>
          )}

          {/* الأسعار */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              {formatPrice(discountedPrice)}
            </Text>
            {hasDiscount && (
              <View style={styles.originalPriceContainer}>
                <Text style={styles.originalPrice}>
                  {formatPrice(product.price)}
                </Text>
                <Text style={styles.savingsText}>
                  {language === 'ar' ? 'وفر' : 'Save'} {formatPrice(savingsAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* معلومات إضافية */}
          <View style={styles.extraInfo}>
            {product.freeShipping && (
              <View style={styles.shippingBadge}>
                <Feather name="truck" size={10} color={Colors.success} />
                <Text style={styles.shippingText}>
                  {language === 'ar' ? 'شحن مجاني' : 'Free Ship'}
                </Text>
              </View>
            )}
            
            {product.soldCount && (
              <Text style={styles.soldText}>
                {product.soldCount} {language === 'ar' ? 'مباع' : 'sold'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    marginBottom: Spacing.md,
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: Colors.gray[50],
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: Spacing.sm + 40,
    left: Spacing.sm,
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: FontWeights.bold,
  },
  colorsPreview: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.white,
    ...Shadows.sm,
  },
  infoContainer: {
    padding: Spacing.md,
  },
  nameText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  brandText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  priceContainer: {
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: FontWeights.medium,
  },
  extraInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shippingText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: FontWeights.medium,
  },
  soldText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
});

export default ModernProductCard;