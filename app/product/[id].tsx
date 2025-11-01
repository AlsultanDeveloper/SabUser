// [id].tsx - dummy content
import React, { useState, useCallback, useEffect } from 'react';
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
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';
import { useProduct } from '@/hooks/useFirestore';

const { width, height } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t, language, formatPrice, addToCart } = useApp();
  // helper to safely render localized or string fields
  const getText = (val: any) => {
    if (!val && val !== 0) return '';
    return typeof val === 'string'
      ? val
      : (val?.[language] || val?.en || val?.ar || '');
  };
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ar: string; en: string; hex: string} | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string>('');
  const { product, loading } = useProduct(typeof id === 'string' ? id : '');

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          await Location.getCurrentPositionAsync({});
          // Just use a default city based on coordinates region
          // Since reverseGeocode is removed in SDK 49
          setUserLocation(language === 'ar' ? 'الرياض' : 'Riyadh');
        } else {
          setUserLocation(language === 'ar' ? 'الرياض' : 'Riyadh');
        }
      } catch (error) {
        console.log('Error getting location:', error);
        // Default to a city if location fails
        setUserLocation(language === 'ar' ? 'الرياض' : 'Riyadh');
      }
    })();
  }, [language]);

  const finalPrice = product && product.discount
    ? product.price * (1 - product.discount / 100)
    : product?.price || 0;

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    
    // Validation: Check if size is required and selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      alert(language === 'ar' ? 'الرجاء اختيار المقاس' : 'Please select a size');
      return;
    }
    
    // Validation: Check if color is required and selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      alert(language === 'ar' ? 'الرجاء اختيار اللون' : 'Please select a color');
      return;
    }
    
    // Validation: Check if age range is required and selected
    if (product.ageRange && product.ageRange.length > 0 && !selectedAge) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      alert(language === 'ar' ? 'الرجاء اختيار الفئة العمرية' : 'Please select an age range');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Add product with selected options (quantity is always 1)
    await addToCart(product, 1, {
      size: selectedSize,
      color: selectedColor,
      age: selectedAge,
    });
    router.back();
  }, [product, selectedSize, selectedColor, selectedAge, addToCart, router, language]);

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
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
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

          <Text style={styles.productName}>{getText(product.name)}</Text>
          
          {/* Rating and Reviews Section */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              <Text style={styles.ratingText}>⭐ {product.rating || 0}</Text>
            </View>
            <Text style={styles.reviewsCount}>
              ({product.reviewsCount || product.reviews || 0} {language === 'ar' ? 'تقييم' : 'Reviews'})
            </Text>
          </View>
          
          {/* Brand Name - Simple Display */}
          {(product.brandName || product.brand) && (
            <Text style={styles.brandText}>{getText(product.brandName || product.brand)}</Text>
          )}
          
          {/* Category Badges */}
          {(product.categoryName || product.subcategoryName) && (
            <View style={styles.categorySection}>
              {product.categoryName && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{getText(product.categoryName)}</Text>
                </View>
              )}
              {product.subcategoryName && (
                <View style={styles.subcategoryBadge}>
                  <Text style={styles.subcategoryBadgeText}>{getText(product.subcategoryName)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Price Section - Amazon Style */}
          <View style={styles.priceSection}>
            <View style={styles.priceDetails}>
              {product.discount && (
                <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
              )}
              <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
            </View>
            {product.discount && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  {language === 'ar' ? 'وفر ' : 'Save '}{formatPrice(product.price - finalPrice)}
                </Text>
              </View>
            )}
          </View>

          {/* Free Returns & Delivery Info */}
          <View style={styles.deliverySection}>
            <View style={styles.deliveryRow}>
              <Feather name="rotate-ccw" size={18} color="#007185" />
              <Text style={styles.freeReturnsText}>
                {language === 'ar' ? 'إرجاع مجاني' : 'FREE Returns'}
              </Text>
            </View>
            <Text style={styles.vatText}>
              {language === 'ar' ? 'تشمل جميع الأسعار ضريبة القيمة المضافة' : 'All prices include VAT.'}
            </Text>
            {product.deliveryTime && (
              <>
                <Text style={styles.deliveryMainText}>
                  {language === 'ar' 
                    ? `توصيل مجاني ${product.deliveryTime}` 
                    : `FREE delivery ${product.deliveryTime}`}
                </Text>
                <TouchableOpacity style={styles.locationButton}>
                  <Feather name="map-pin" size={16} color="#007185" />
                  <Text style={styles.locationText}>
                    {language === 'ar' 
                      ? `التوصيل إلى ${userLocation || 'الرياض'}` 
                      : `Deliver to ${userLocation || 'Riyadh'}`}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Sizes Section - BEFORE Description */}
          {product.sizes && product.sizes.length > 0 && (
            <>
              <View style={styles.section}>
                <View style={styles.sizeHeader}>
                  <Text style={styles.sectionTitle}>
                    {language === 'ar' ? `المقاس: ` : 'Size: '}
                    <Text style={styles.selectedSizeText}>
                      {selectedSize || (language === 'ar' ? 'اختر' : 'Select')}
                    </Text>
                  </Text>
                  <TouchableOpacity>
                    <Text style={styles.sizeGuideLink}>
                      {language === 'ar' ? 'دليل المقاسات' : 'Size guide'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Size Recommendation - Amazon Style */}
                {product.sizes.length > 0 && (
                  <View style={styles.sizeRecommendation}>
                    <Feather name="user" size={20} color={Colors.text.secondary} />
                    <Text style={styles.recommendationText}>
                      {language === 'ar'
                        ? `${product.sizes[product.sizes.length - 1]} هو المقاس الموصى به بناءً على ملايين الطلبات`
                        : `${product.sizes[product.sizes.length - 1]} is your recommended size based on millions of customer orders.`}
                    </Text>
                    <Feather name="chevron-right" size={20} color={Colors.text.secondary} />
                  </View>
                )}

                <View style={styles.sizesContainer}>
                  {product.sizes.map((size: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sizeButton,
                        selectedSize === size && styles.sizeButtonSelected
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setSelectedSize(size);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.sizeText,
                        selectedSize === size && styles.sizeTextSelected
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.description') || (language === 'ar' ? 'الوصف' : 'Description')}</Text>
            <Text style={styles.descriptionText}>{getText(product.description)}</Text>
          </View>

          {/* Colors Section */}
          {product.colors && product.colors.length > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {language === 'ar' ? 'الألوان المتاحة' : 'Available Colors'}
                  {selectedColor && (
                    <Text style={styles.selectedLabel}>
                      {' '}({language === 'ar' ? selectedColor.ar : selectedColor.en})
                    </Text>
                  )}
                </Text>
                <View style={styles.colorsContainer}>
                  {product.colors.map((color: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorItem,
                        selectedColor?.hex === color.hex && styles.colorItemSelected
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setSelectedColor(color);
                      }}
                      activeOpacity={0.7}
                    >
                      <View 
                        style={[
                          styles.colorCircle, 
                          { backgroundColor: color.hex || '#000' },
                          selectedColor?.hex === color.hex && styles.colorCircleSelected
                        ]} 
                      />
                      <Text style={[
                        styles.colorText,
                        selectedColor?.hex === color.hex && styles.colorTextSelected
                      ]}>
                        {language === 'ar' ? color.ar : color.en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Shoe Sizes Section */}
          {product.shoeSizes && product.shoeSizes.length > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{language === 'ar' ? 'مقاسات الأحذية' : 'Shoe Sizes'}</Text>
                <View style={styles.sizesContainer}>
                  {product.shoeSizes.map((size: string, index: number) => (
                    <View key={index} style={styles.sizeButton}>
                      <Text style={styles.sizeText}>{size}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Age Range Section */}
          {product.ageRange && product.ageRange.length > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {language === 'ar' ? 'الفئة العمرية' : 'Age Range'}
                  {selectedAge && <Text style={styles.selectedLabel}> ({selectedAge})</Text>}
                </Text>
                <View style={styles.ageContainer}>
                  {product.ageRange.map((age: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.ageBadge,
                        selectedAge === age && styles.ageBadgeSelected
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setSelectedAge(age);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.ageText,
                        selectedAge === age && styles.ageTextSelected
                      ]}>
                        {age}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Gender Section */}
          {product.gender && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{language === 'ar' ? 'الجنس' : 'Gender'}</Text>
                <View style={styles.genderBadge}>
                  <Text style={styles.genderText}>
                    {language === 'ar' 
                      ? (product.gender === 'Boy' ? 'أولاد' : 
                         product.gender === 'Girl' ? 'بنات' : 
                         product.gender === 'Unisex-Kids' ? 'للجنسين (أطفال)' :
                         product.gender === 'Men' ? 'رجال' :
                         product.gender === 'Women' ? 'نساء' :
                         product.gender === 'Unisex' ? 'للجنسين' : product.gender)
                      : product.gender}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Season Section */}
          {product.season && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{language === 'ar' ? 'الموسم' : 'Season'}</Text>
                <View style={styles.seasonBadge}>
                  <Text style={styles.seasonText}>
                    {language === 'ar'
                      ? (product.season === 'Summer' ? 'صيفي' : 
                         product.season === 'Winter' ? 'شتوي' : 
                         product.season === 'All-Season' ? 'جميع المواسم' : product.season)
                      : product.season}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Material Section */}
          {product.material && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>
                🧵 {language === 'ar' ? 'الخامة' : 'Material Composition'}
              </Text>
              <Text style={styles.detailValue}>{product.material}</Text>
            </View>
          )}

          {/* Care Instructions Section */}
          {product.careInstructions && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>
                🧼 {language === 'ar' ? 'تعليمات العناية' : 'Care Instructions'}
              </Text>
              <Text style={styles.detailValue}>{product.careInstructions}</Text>
            </View>
          )}

          {/* Features Section */}
          {product.features && product.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>
                ✨ {language === 'ar' ? 'مميزات المنتج' : 'Product Features'}
              </Text>
              {product.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Delivery Time Section */}
          {product.deliveryTime && (
            <View style={styles.deliveryInfo}>
              <Feather name="truck" size={20} color="#2E7D32" />
              <Text style={styles.deliveryText}>
                {language === 'ar' ? 'التوصيل: ' : 'Delivery: '}{product.deliveryTime}
              </Text>
            </View>
          )}

          {/* Stock Warning - Amazon Style */}
          {product.stock && product.stock <= 5 && (
            <Text style={styles.stockWarning}>
              {language === 'ar' 
                ? `بقي ${product.stock} فقط في المخزون - اطلب الآن`
                : `Only ${product.stock} left in stock - order soon.`}
            </Text>
          )}

          {/* Action Buttons - Amazon Style */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Text style={styles.addToCartText}>
                {language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={() => {
                handleAddToCart();
                // Navigate to checkout
                router.push('/checkout');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buyNowText}>
                {language === 'ar' ? 'اشتر الآن' : 'Buy Now'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Shop with Confidence - Amazon Style */}
          <View style={styles.confidenceSection}>
            <Text style={styles.confidenceTitle}>
              {language === 'ar' ? 'تسوق بثقة' : 'Shop with confidence'}
            </Text>
            <View style={styles.confidenceGrid}>
              <View style={styles.confidenceItem}>
                <Feather name="rotate-ccw" size={20} color={Colors.primary} />
                <Text style={styles.confidenceText}>
                  {language === 'ar' ? 'إرجاع مجاني' : 'FREE Returns'}
                </Text>
              </View>
              <View style={styles.confidenceItem}>
                <Feather name="truck" size={20} color={Colors.primary} />
                <Text style={styles.confidenceText}>
                  {language === 'ar' ? 'توصيل مجاني' : 'Free Delivery'}
                </Text>
              </View>
              <View style={styles.confidenceItem}>
                <Feather name="shield" size={20} color={Colors.primary} />
                <Text style={styles.confidenceText}>
                  {language === 'ar' ? 'ضمان 30 يوم' : '30 days Returnable'}
                </Text>
              </View>
              <View style={styles.confidenceItem}>
                <Feather name="check-circle" size={20} color={Colors.primary} />
                <Text style={styles.confidenceText}>
                  {language === 'ar' ? 'دفع عند الاستلام' : 'Cash on Delivery'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mainImage: {
    width: width,
    height: height * 0.5,
    backgroundColor: Colors.gray[50],
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.xl + 40,
    right: Spacing.md,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: 'bold' as const,
  },
  thumbnailScroll: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  thumbnailContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  thumbnailActive: {
    borderColor: Colors.primary,
    borderWidth: 2.5,
  },
  contentSection: {
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: '#F59E0B',
  },
  reviewsCount: {
    fontSize: FontSizes.sm,
    color: '#007185',
    fontWeight: '500' as const,
  },
  reviewsText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  stockBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  stockText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },
  productName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 28,
  },
  brandText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    fontWeight: '600' as const,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  brandLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  brandValue: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'bold' as const,
  },
  categorySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600' as const,
  },
  subcategoryBadge: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  subcategoryBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.gray[300],
  },
  colorText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
  colorItemSelected: {
    backgroundColor: Colors.primary + '08',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  colorCircleSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  colorTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold' as const,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  sizeButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    minWidth: 50,
    alignItems: 'center',
  },
  sizeButtonSelected: {
    backgroundColor: Colors.primary + '08',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  sizeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  sizeTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold' as const,
  },
  selectedLabel: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: 'bold' as const,
    marginLeft: 4,
  },
  ageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  ageBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFA726',
  },
  ageText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600' as const,
  },
  ageBadgeSelected: {
    backgroundColor: Colors.primary + '08',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  ageTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold' as const,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#CE93D8',
  },
  genderText: {
    fontSize: 13,
    color: '#7B1FA2',
    fontWeight: '600' as const,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#66BB6A',
  },
  seasonText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600' as const,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#81C784',
  },
  deliveryText: {
    fontSize: FontSizes.sm,
    color: '#2E7D32',
    fontWeight: '600' as const,
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceDetails: {
    flex: 1,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#B12704',
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 13,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  vatText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: '#F0F2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
    color: '#B12704',
  },
  deliverySection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeReturnsText: {
    fontSize: FontSizes.sm,
    color: '#007185',
    fontWeight: '600' as const,
  },
  deliveryMainText: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  deliverySubText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: FontSizes.sm,
    color: '#007185',
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[100],
    marginVertical: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  selectedSizeText: {
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  sizeGuideLink: {
    fontSize: FontSizes.sm,
    color: '#007185',
    fontWeight: '500' as const,
  },
  sizeRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  descriptionText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginTop: 4,
  },
  stockWarning: {
    color: '#B12704',
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  actionButtons: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addToCartButton: {
    backgroundColor: '#FFD814',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: '#0F1111',
  },
  buyNowButton: {
    backgroundColor: '#FFA41C',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyNowText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: '#0F1111',
  },
  confidenceSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  confidenceTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  confidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  confidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
  },
  confidenceText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    flex: 1,
  },
  detailSection: {
    backgroundColor: '#F9FAFB',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  detailLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: FontSizes.md,
    color: '#1F2937',
    lineHeight: 22,
  },
  featuresSection: {
    backgroundColor: '#F3F4F6',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  featureBullet: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    marginRight: Spacing.sm,
    fontWeight: 'bold' as const,
  },
  featureText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#374151',
    lineHeight: 20,
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
