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
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 16px margin on each side + 16px gap

interface AmazonStyleProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language?: string;
  onAddToCart?: (product: any) => void;
}

const AmazonStyleProductCard = memo(function AmazonStyleProductCard({
  product,
  onPress,
  formatPrice,
  language = 'ar',
  onAddToCart,
}: AmazonStyleProductCardProps) {
  
  // Early return if product is invalid
  if (!product || typeof product !== 'object') {
    return null;
  }

  // Calculate delivery date range (25-30 days from today)
  const getDeliveryDateRange = () => {
    const today = new Date();
    const minDays = 25;
    const maxDays = 30;
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minDays);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + maxDays);
    
    const formatDate = (date: Date) => {
      const months = language === 'ar'
        ? ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      return `${date.getDate()} ${months[date.getMonth()]}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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
        </View>

        <View style={styles.productInfo}>
          <View style={styles.contentSection}>
            {((product?.brandName && typeof product.brandName === 'string' && product.brandName.trim()) || 
              (product?.brand && typeof product.brand === 'string' && product.brand.trim())) ? (
              <Text style={styles.brandText} numberOfLines={1}>
                {product.brandName?.trim() || product.brand?.trim() || ''}
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
                  {(typeof product.rating === 'number' && !isNaN(product.rating) 
                    ? product.rating.toFixed(1) 
                    : '0.0')}
                </Text>
                {(product.reviews || product.reviewsCount) ? (
                  <Text style={styles.reviewsText}>
                    {`(${typeof (product.reviews || product.reviewsCount) === 'number' 
                      ? (product.reviews || product.reviewsCount).toLocaleString() 
                      : '0'})`}
                  </Text>
                ) : null}
              </View>
            ) : null}

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
          </View>

          <View style={styles.shippingRow}>
            <View style={styles.shippingContainer}>
              <Text style={styles.shippingText} numberOfLines={1}>
                {language === 'ar' ? 'التوصيل ' : 'Delivery '}
                <Text style={styles.shippingDate}>
                  {getDeliveryDateRange()}
                </Text>
              </Text>
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
  productInfo: {
    padding: 6,
    minHeight: 135,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contentSection: {
    flex: 1,
  },
  brandText: {
    color: '#007185',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 1,
  },
  productName: {
    color: '#0F1111',
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 2,
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
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
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  shippingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  shippingText: {
    color: '#007185',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  shippingDate: {
    color: '#007185',
    fontSize: 13,
    fontWeight: '400',
  },
});

export default AmazonStyleProductCard;