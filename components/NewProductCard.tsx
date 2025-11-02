import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';

interface ProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language: string;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

const NewProductCard = React.memo(function NewProductCard({ 
  product, 
  onPress, 
  formatPrice, 
  language, 
  onToggleWishlist, 
  isInWishlist 
}: ProductCardProps) {

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleWishlistPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleWishlist?.(product.id);
  }, [product.id, onToggleWishlist]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

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

  // عرض النجوم
  const renderStars = () => {
    const rating = product.rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Feather
          key={i}
          name="star"
          size={12}
          color={i <= rating ? '#FFD700' : '#E5E5E5'}
          style={{ marginRight: 1 }}
        />
      );
    }
    return stars;
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        {/* حاوي الصورة */}
        <View style={styles.imageContainer}>
          <SafeImage 
            uri={product.image || product.imageUrl || 'https://via.placeholder.com/200'} 
            style={styles.image} 
          />
          
          {/* شارة العلامة التجارية */}
          {(product.brandName || product.brand) && (
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText} numberOfLines={1}>
                {product.brandName || product.brand}
              </Text>
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
                name="heart"
                size={18}
                color={isInWishlist ? Colors.error : Colors.text.secondary}
                style={{ opacity: isInWishlist ? 1 : 0.7 }}
              />
            </TouchableOpacity>
          )}

          {/* شارة الخصم */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* معلومات المنتج */}
        <View style={styles.infoContainer}>
          {/* العلامة التجارية */}
          {(product.brandName || product.brand) && (
            <Text style={styles.brandText} numberOfLines={1}>
              {product.brandName || product.brand}
            </Text>
          )}

          {/* اسم المنتج */}
          <Text style={styles.nameText} numberOfLines={2}>
            {language === 'ar' ? (product.nameAr || product.name) : (product.name || product.nameAr)}
          </Text>

          {/* الفئة */}
          {product.category && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {language === 'ar' ? (product.categoryAr || product.category) : (product.category || product.categoryAr)}
            </Text>
          )}

          {/* التقييم */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              {renderStars()}
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              {product.reviewsCount && (
                <Text style={styles.reviewsText}>({product.reviewsCount})</Text>
              )}
            </View>
          )}

          {/* الأسعار */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {formatPrice(discountedPrice)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPriceText}>
                {formatPrice(product.price)}
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
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
  },
  brandBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    maxWidth: 80,
  },
  brandBadgeText: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm + 40,
    left: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
  infoContainer: {
    padding: Spacing.md,
  },
  brandText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
    marginBottom: 2,
  },
  nameText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: FontSizes.xs,
    color: Colors.text.primary,
    fontWeight: FontWeights.medium,
    marginLeft: 2,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  originalPriceText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
});

export default NewProductCard;