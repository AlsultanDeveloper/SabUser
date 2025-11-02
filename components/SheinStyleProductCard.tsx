import React, { memo, useState } from 'react';
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 16px margin on each side + 16px gap

interface SheinStyleProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language?: string;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

const SheinStyleProductCard = memo(function SheinStyleProductCard({
  product,
  onPress,
  formatPrice,
  language = 'en',
  onToggleWishlist,
  isInWishlist = false,
}: SheinStyleProductCardProps) {
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleWishlistPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleWishlist?.(product.id);
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  // حساب السعر بعد الخصم
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  // الصور المتاحة (يمكن أن تكون مصفوفة أو صورة واحدة)
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image || product.imageUrl || 'https://via.placeholder.com/200'];

  const currentImage = images[currentImageIndex] || images[0];

  // تبديل الصور عند النقر على الصورة
  const handleImagePress = () => {
    if (images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      handlePress();
    }
  };

  return (
    <View style={styles.container}>
      {/* قسم الصورة */}
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handleImagePress} activeOpacity={0.95}>
          <SafeImage 
            uri={currentImage} 
            style={styles.productImage} 
          />
        </TouchableOpacity>
        
        {/* مؤشر الصور المتعددة */}
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: index === currentImageIndex ? '#FF6B6B' : 'rgba(255, 255, 255, 0.5)' }
                ]}
              />
            ))}
          </View>
        )}

        {/* شارة الخصم الكبيرة */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}

        {/* زر المفضلة */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleWishlistPress}
          activeOpacity={0.7}
        >
          <Feather
            name={isInWishlist ? "heart" : "heart"}
            size={18}
            color={isInWishlist ? '#FF6B6B' : '#FFF'}
            fill={isInWishlist ? '#FF6B6B' : 'transparent'}
          />
        </TouchableOpacity>

        {/* شارة "جديد" أو "رائج" */}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>
              {language === 'ar' ? 'جديد' : 'NEW'}
            </Text>
          </View>
        )}
        
        {product.isTrending && (
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingBadgeText}>
              {language === 'ar' ? 'رائج' : 'HOT'}
            </Text>
          </View>
        )}
      </View>

      {/* معلومات المنتج */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
        <View style={styles.productInfo}>
          {/* الأسعار */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              {formatPrice(discountedPrice)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.price)}
              </Text>
            )}
          </View>

          {/* اسم المنتج */}
          <Text style={styles.productName} numberOfLines={2}>
            {language === 'ar' ? (product.nameAr || product.name) : (product.name || product.nameAr)}
          </Text>

          {/* التقييم والمبيعات */}
          <View style={styles.ratingContainer}>
            {product.rating && (
              <>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Feather
                      key={star}
                      name="star"
                      size={12}
                      color={star <= (product.rating || 0) ? '#FFD700' : '#E5E5E5'}
                      style={{ marginRight: 1 }}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>({product.rating})</Text>
              </>
            )}
            
            {product.soldCount && (
              <Text style={styles.soldText}>
                {product.soldCount} {language === 'ar' ? 'مباع' : 'sold'}
              </Text>
            )}
          </View>

          {/* الألوان المتاحة */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.colorsContainer}>
              {product.colors.slice(0, 4).map((color: string, index: number) => (
                <View
                  key={index}
                  style={[styles.colorDot, { backgroundColor: color }]}
                />
              ))}
              {product.colors.length > 4 && (
                <Text style={styles.moreColors}>
                  +{product.colors.length - 4}
                </Text>
              )}
            </View>
          )}

          {/* شحن سريع */}
          {product.fastShipping && (
            <View style={styles.shippingBadge}>
              <Feather name="zap" size={10} color="#FF6B6B" />
              <Text style={styles.shippingText}>
                {language === 'ar' ? 'شحن سريع' : 'Fast Ship'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F8F8F8',
    height: CARD_WIDTH * 1.2,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 50,
    left: 8,
    backgroundColor: '#00C851',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  trendingBadge: {
    position: 'absolute',
    top: 70,
    left: 8,
    backgroundColor: '#FF8800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  currentPrice: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    color: '#999',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  productName: {
    color: '#333',
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 6,
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#666',
    fontSize: 11,
  },
  soldText: {
    color: '#999',
    fontSize: 10,
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  moreColors: {
    color: '#666',
    fontSize: 10,
    marginLeft: 2,
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shippingText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default SheinStyleProductCard;