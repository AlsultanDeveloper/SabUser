import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SafeImage from './SafeImage';
import { getProductImageUrl } from '@/utils/imageHelper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 16px margin on each side + 16px gap

interface AmazonStyleProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language?: string;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
  onAddToCart?: (product: any) => void;
}

const AmazonStyleProductCard = memo(function AmazonStyleProductCard({
  product,
  onPress,
  formatPrice,
  language = 'en',
  onToggleWishlist,
  isInWishlist = false,
  onAddToCart,
}: AmazonStyleProductCardProps) {
  
  // Early return if product is invalid
  if (!product || typeof product !== 'object') {
    console.warn('Invalid product data:', product);
    return null;
  }
  
  // Debug log to see what's in the product - only log once per render
  if (Math.random() < 0.05) { // Log 5% of products to avoid spam
    console.log('\n🔍 Product Image Debug:');
    console.log('  Product ID:', product.id);
    console.log('  Product name:', product.name);
    console.log('  product.image:', product.image);
    console.log('  product.images:', product.images);
    console.log('  product.imageUrl:', product.imageUrl);
    console.log('  Final URL:', getProductImageUrl(product, 400));
  }
  
  const handleWishlistPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleWishlist?.(product.id);
  };

  const handleAddToCart = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onAddToCart?.(product);
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  // استخراج اسم المنتج حسب اللغة
  const getProductName = () => {
    if (!product) return 'Product Name';
    
    if (typeof product.name === 'object' && product.name !== null) {
      // البنية الجديدة: {en: "...", ar: "..."}
      const nameByLanguage = language === 'ar' ? product.name.ar : product.name.en;
      return typeof nameByLanguage === 'string' && nameByLanguage.trim() ? nameByLanguage : 'Product Name';
    } else if (typeof product.name === 'string' && product.name.trim()) {
      // البنية القديمة: nameAr منفصل
      return language === 'ar' ? (product.nameAr || product.name) : product.name;
    }
    return 'Product Name';
  };

  // حساب السعر بعد الخصم
  const hasDiscount = product?.discount && 
    typeof product.discount === 'number' && 
    !isNaN(product.discount) && 
    product.discount > 0;
    
  const basePrice = typeof product?.price === 'number' && 
    !isNaN(product.price) && 
    product.price > 0 ? product.price : 0;
    
  const discountedPrice = hasDiscount 
    ? basePrice * (1 - product.discount / 100) 
    : basePrice;
  
  // حساب المدخرات
  const savings = hasDiscount ? basePrice - discountedPrice : 0;

  // دالة آمنة لتنسيق السعر
  const safeFormatPrice = (price: number): string => {
    try {
      const result = formatPrice(price);
      // تأكد من أن النتيجة string وليست undefined أو null
      return typeof result === 'string' && result.length > 0 ? result : '$0.00';
    } catch {
      return '$0.00';
    }
  };

  // عرض النجوم
  const renderStars = () => {
    const rating = typeof product?.rating === 'number' && 
      !isNaN(product.rating) && 
      product.rating >= 0 ? product.rating : 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Feather
          key={i}
          name="star"
          size={12}
          color={i <= rating ? '#FFA41B' : '#E5E5E5'}
          style={{ marginRight: 1 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
        <View style={styles.imageContainer}>
          <SafeImage 
            uri={getProductImageUrl(product, 400)} 
            style={styles.productImage}
            fallbackIconSize={60}
            fallbackIconName="image"
            showLoader={true}
            resizeMode="cover"
          />
          
          {(hasDiscount && typeof product?.discount === 'number') ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{`-${Math.round(product.discount)}%`}</Text>
            </View>
          ) : null}

          {onToggleWishlist ? (
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleWishlistPress}
              activeOpacity={0.7}
            >
              <Feather
                name="heart"
                size={16}
                color={isInWishlist ? '#FF6B6B' : '#666'}
                style={{ opacity: isInWishlist ? 1 : 0.7 }}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.productInfo}>
          {((product?.brandName && typeof product.brandName === 'string' && product.brandName.trim()) || 
            (product?.brand && typeof product.brand === 'string' && product.brand.trim())) ? (
            <Text style={styles.brandText} numberOfLines={1}>
              {(product.brandName && product.brandName.trim()) || (product.brand && product.brand.trim()) || ''}
            </Text>
          ) : null}

          <Text style={styles.productName} numberOfLines={2}>
            {getProductName()}
          </Text>

          {(product?.rating && typeof product.rating === 'number' && !isNaN(product.rating) && product.rating > 0) ? (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              <Text style={styles.ratingText}>
                {typeof product.rating === 'number' && !isNaN(product.rating) 
                  ? product.rating.toFixed(1) 
                  : '0.0'}
              </Text>
              {(product.reviews || product.reviewsCount) && (
                <Text style={styles.reviewsText}>
                  ({typeof (product.reviews || product.reviewsCount) === 'number' 
                    ? (product.reviews || product.reviewsCount).toLocaleString() 
                    : '0'})
                </Text>
              )}
            </View>
          ) : null}

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              {hasDiscount ? (
                <Text style={styles.originalPrice}>
                  {safeFormatPrice(basePrice)}
                </Text>
              ) : null}
              <Text style={styles.currentPrice}>
                {safeFormatPrice(discountedPrice)}
              </Text>
              {(savings > 0) ? (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>
                    {`${language === 'ar' ? 'وفر' : 'Save'} ${safeFormatPrice(savings)}`}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.shippingRow}>
              <View style={styles.shippingContainer}>
                <Feather name="truck" size={12} color="#007185" />
                <Text style={styles.shippingText}>
                  {language === 'ar' ? 'شحن مجاني' : 'FREE Shipping'}
                </Text>
              </View>
              
              {/* Add to Cart Button */}
              {onAddToCart && (
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="shopping-cart" size={16} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8, // تقليل المسافة السفلية
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#B12704',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 8,
  },
  brandText: {
    color: '#007185',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  productName: {
    color: '#0F1111',
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 4,
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  ratingText: {
    color: '#007185',
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
  },
  reviewsText: {
    color: '#007185',
    fontSize: 11,
    fontWeight: '400',
  },
  priceSection: {
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  originalPrice: {
    color: '#565959',
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginRight: 6,
    marginBottom: 2,
  },
  currentPrice: {
    color: '#B12704',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  savingsBadge: {
    backgroundColor: '#FFD814',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  savingsText: {
    color: '#0F1111',
    fontSize: 9,
    fontWeight: '600',
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shippingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingText: {
    color: '#007185',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 3,
  },
  addToCartButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D5D9D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AmazonStyleProductCard;