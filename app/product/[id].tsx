// Product Details Screen - تفاصيل المنتج
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useProduct } from '@/hooks/useFirestore';
import SafeImage from '@/components/SafeImage';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { language, formatPrice, addToCart } = useApp();
  const insets = useSafeAreaInsets();
  const { product, loading } = useProduct(typeof id === 'string' ? id : '');
  
  // Quantity state
  const [quantity, setQuantity] = useState(1);

  const getProductName = () => {
    if (!product) return '';
    if (typeof product.name === 'object' && product.name !== null) {
      const nameByLanguage = language === 'ar' ? product.name.ar : product.name.en;
      return typeof nameByLanguage === 'string' && nameByLanguage.trim() ? nameByLanguage : 'Product';
    }
    return 'Product';
  };

  const getProductDescription = () => {
    if (!product) return '';
    if (typeof product.description === 'object' && product.description !== null) {
      const descByLanguage = language === 'ar' ? product.description.ar : product.description.en;
      return typeof descByLanguage === 'string' && descByLanguage.trim() ? descByLanguage : '';
    }
    return language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available';
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFoundContainer}>
          <Feather name="package" size={64} color={Colors.gray[300]} />
          <Text style={styles.notFoundText}>{language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{language === 'ar' ? 'العودة' : 'Go Back'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hasDiscount = product.discount && product.discount > 0;
  const basePrice = typeof product.price === 'number' ? product.price : 0;
  const discountedPrice = hasDiscount ? basePrice * (1 - (product.discount || 0) / 100) : basePrice;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backIconButton}
        >
          <Feather 
            name={language === 'ar' ? 'chevron-right' : 'chevron-left'} 
            size={24} 
            color={Colors.text.primary} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {getProductName()}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Feather name="share-2" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <SafeImage 
            uri={product.image || 'https://picsum.photos/800/800'} 
            style={styles.productImage}
            fallbackIconSize={100}
            fallbackIconName="image"
            showLoader={true}
            resizeMode="cover"
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{`-${product.discount}%`}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Brand */}
          {((typeof product.brandName === 'string' && product.brandName) || 
            (typeof product.brand === 'string' && product.brand)) && (
            <Text style={styles.brandText}>
              {product.brandName || product.brand}
            </Text>
          )}

          {/* Product Name */}
          <Text style={styles.productTitle}>
            {getProductName()}
          </Text>

          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={16}
                    color={star <= product.rating ? '#FFA41B' : '#E5E5E5'}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)}
              </Text>
              {(product.reviews || product.reviewsCount) && (
                <Text style={styles.reviewsText}>
                  {`(${product.reviews || product.reviewsCount} ${language === 'ar' ? 'تقييم' : 'reviews'})`}
                </Text>
              )}
            </View>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              {formatPrice(discountedPrice)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatPrice(basePrice)}
              </Text>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <Feather 
              name={product.inStock !== false ? 'check-circle' : 'x-circle'} 
              size={18} 
              color={product.inStock !== false ? '#10B981' : '#EF4444'} 
            />
            <Text style={[
              styles.stockText,
              { color: product.inStock !== false ? '#10B981' : '#EF4444' }
            ]}>
              {product.inStock !== false 
                ? (language === 'ar' ? 'متوفر في المخزون' : 'In Stock')
                : (language === 'ar' ? 'غير متوفر' : 'Out of Stock')
              }
            </Text>
            {product.stock && product.stock > 0 && typeof product.stock === 'number' && (
              <Text style={styles.stockCount}>
                {` (${product.stock} ${language === 'ar' ? 'قطعة' : 'items'})`}
              </Text>
            )}
          </View>

          {/* Delivery Time */}
          {product.deliveryTime && typeof product.deliveryTime === 'string' && (
            <View style={styles.deliveryContainer}>
              <Feather name="truck" size={18} color={Colors.primary} />
              <Text style={styles.deliveryText}>
                {language === 'ar' ? 'التوصيل خلال: ' : 'Delivery: '}
                <Text style={styles.deliveryTime}>{product.deliveryTime}</Text>
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'الوصف' : 'Description'}
            </Text>
            <Text style={styles.descriptionText}>
              {getProductDescription()}
            </Text>
          </View>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'الألوان المتاحة' : 'Available Colors'}
              </Text>
              <View style={styles.colorsContainer}>
                {product.colors.map((color, index) => (
                  <View key={index} style={styles.colorItem}>
                    <View 
                      style={[
                        styles.colorCircle, 
                        { backgroundColor: color.hex || '#CCC' }
                      ]} 
                    />
                    <Text style={styles.colorText}>
                      {language === 'ar' 
                        ? (typeof color.ar === 'string' ? color.ar : 'Color') 
                        : (typeof color.en === 'string' ? color.en : 'Color')
                      }
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'المقاسات المتاحة' : 'Available Sizes'}
              </Text>
              <View style={styles.sizesContainer}>
                {product.sizes.map((size, index) => (
                  <View key={index} style={styles.sizeChip}>
                    <Text style={styles.sizeText}>
                      {typeof size === 'string' || typeof size === 'number' ? String(size) : 'Size'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Shoe Sizes */}
          {product.shoeSizes && product.shoeSizes.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'مقاسات الأحذية' : 'Shoe Sizes'}
              </Text>
              <View style={styles.sizesContainer}>
                {product.shoeSizes.map((size, index) => (
                  <View key={index} style={styles.sizeChip}>
                    <Text style={styles.sizeText}>
                      {typeof size === 'string' || typeof size === 'number' ? String(size) : 'Size'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Age Range */}
          {product.ageRange && product.ageRange.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'الفئة العمرية' : 'Age Range'}
              </Text>
              <View style={styles.sizesContainer}>
                {product.ageRange.map((age, index) => (
                  <View key={index} style={styles.sizeChip}>
                    <Text style={styles.sizeText}>
                      {typeof age === 'string' || typeof age === 'number' ? String(age) : 'Age'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Specifications */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'المواصفات' : 'Specifications'}
            </Text>
            <View style={styles.specsContainer}>
              {/* Gender */}
              {product.gender && typeof product.gender === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="users" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specLabel}>
                    {language === 'ar' ? 'الجنس:' : 'Gender:'}
                  </Text>
                  <Text style={styles.specValue}>{product.gender}</Text>
                </View>
              )}

              {/* Season */}
              {product.season && typeof product.season === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="sun" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specLabel}>
                    {language === 'ar' ? 'الموسم:' : 'Season:'}
                  </Text>
                  <Text style={styles.specValue}>{product.season}</Text>
                </View>
              )}

              {/* Material */}
              {product.material && typeof product.material === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="package" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specLabel}>
                    {language === 'ar' ? 'المادة:' : 'Material:'}
                  </Text>
                  <Text style={styles.specValue}>{product.material}</Text>
                </View>
              )}

              {/* Brand */}
              {((typeof product.brandName === 'string' && product.brandName) || 
                (typeof product.brand === 'string' && product.brand)) && (
                <View style={styles.specRow}>
                  <Feather name="award" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specLabel}>
                    {language === 'ar' ? 'العلامة التجارية:' : 'Brand:'}
                  </Text>
                  <Text style={styles.specValue}>{product.brandName || product.brand}</Text>
                </View>
              )}

              {/* Category */}
              {product.categoryName && typeof product.categoryName === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="grid" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specLabel}>
                    {language === 'ar' ? 'الفئة:' : 'Category:'}
                  </Text>
                  <Text style={styles.specValue}>{product.categoryName}</Text>
                </View>
              )}

              {/* Subcategory */}
              {product.subcategoryName && typeof product.subcategoryName === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="list" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specLabel}>
                    {language === 'ar' ? 'الفئة الفرعية:' : 'Subcategory:'}
                  </Text>
                  <Text style={styles.specValue}>{product.subcategoryName}</Text>
                </View>
              )}

              {/* Unit */}
              {product.unit && typeof product.unit === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="box" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specLabel}>
                    {language === 'ar' ? 'الوحدة:' : 'Unit:'}
                  </Text>
                  <Text style={styles.specValue}>{product.unit}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Care Instructions */}
          {product.careInstructions && typeof product.careInstructions === 'string' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'تعليمات العناية' : 'Care Instructions'}
              </Text>
              <View style={styles.careContainer}>
                <Feather name="info" size={16} color="#3B82F6" />
                <Text style={styles.careText}>{product.careInstructions}</Text>
              </View>
            </View>
          )}

          {/* Features */}
          {product.features && Array.isArray(product.features) && product.features.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'المميزات' : 'Features'}
              </Text>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Feather name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>
                    {typeof feature === 'string' ? feature : 'Feature'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer with Quantity Selector and Add to Cart */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Feather 
              name="minus" 
              size={18} 
              color={quantity <= 1 ? Colors.gray[300] : Colors.text.primary} 
            />
          </TouchableOpacity>
          
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{quantity}</Text>
            {product.unit && typeof product.unit === 'string' && (
              <Text style={styles.unitText}>{product.unit}</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => {
              const maxQuantity = product.stock || 999;
              setQuantity(Math.min(maxQuantity, quantity + 1));
            }}
            disabled={product.stock ? quantity >= product.stock : false}
          >
            <Feather 
              name="plus" 
              size={18} 
              color={product.stock && quantity >= product.stock ? Colors.gray[300] : Colors.text.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            product.inStock === false && styles.addToCartButtonDisabled
          ]}
          onPress={() => {
            if (product.inStock !== false) {
              addToCart(product, quantity);
              router.back();
            }
          }}
          disabled={product.inStock === false}
        >
          <Feather 
            name="shopping-cart" 
            size={20} 
            color={Colors.white} 
          />
          <Text style={styles.addToCartText}>
            {language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.white,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: Colors.gray[50],
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#B12704',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: Spacing.lg,
  },
  brandText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  productTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: Spacing.xs,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  reviewsText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B12704',
    marginRight: Spacing.sm,
  },
  originalPrice: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  descriptionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stockText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  stockCount: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  deliveryText: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  deliveryTime: {
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  colorItem: {
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border.light,
    marginBottom: Spacing.xs,
  },
  colorText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  sizeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sizeText: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  specsContainer: {
    borderTopWidth: 0,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  specLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    minWidth: 100,
    marginLeft: Spacing.sm,
  },
  specValue: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
  careContainer: {
    flexDirection: 'row',
    backgroundColor: '#3B82F610',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  careText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginLeft: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  featureText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    lineHeight: 22,
    marginLeft: Spacing.sm,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    marginRight: Spacing.md,
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xs,
  },
  quantityDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingHorizontal: Spacing.sm,
  },
  quantityText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  unitText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  addToCartButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  addToCartText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    fontSize: FontSizes.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
});
