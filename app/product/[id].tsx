import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';

// Icons
import { 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Share2, 
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronDown,
  Check,
  Minus,
  Plus,
} from 'lucide-react-native';

// Contexts & Hooks
import { useApp } from '@/contexts/AppContext';
import { useProduct } from '@/hooks/useFirestore';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { language, formatPrice, addToCart, t, isRTL } = useApp();
  const { product, loading, error } = useProduct(id as string);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Animations
  const scrollY = useSharedValue(0);

  // Auto-select first available option
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      if (product.ageRange && product.ageRange.length > 0 && !selectedAge) {
        setSelectedAge(product.ageRange[0]);
      }
    }
  }, [product]);

  // Animated header style
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    // Validation for required options
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      Toast.show({
        type: 'error',
        text1: isRTL ? 'الرجاء اختيار المقاس' : 'Please select a size',
        position: 'top',
      });
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      Toast.show({
        type: 'error',
        text1: isRTL ? 'الرجاء اختيار اللون' : 'Please select a color',
        position: 'top',
      });
      return;
    }

    if (product.ageRange && product.ageRange.length > 0 && !selectedAge) {
      Toast.show({
        type: 'error',
        text1: isRTL ? 'الرجاء اختيار العمر' : 'Please select an age',
        position: 'top',
      });
      return;
    }

    addToCart(product, quantity, {
      size: selectedSize,
      color: selectedColor,
      age: selectedAge,
    });

    Toast.show({
      type: 'success',
      text1: isRTL ? 'تمت الإضافة إلى السلة' : 'Added to cart',
      text2: `${typeof product.name === 'object' ? (isRTL ? product.name.ar : product.name.en) : product.name} × ${quantity}`,
      position: 'top',
    });
  }, [product, quantity, selectedSize, selectedColor, selectedAge, addToCart, isRTL]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    Toast.show({
      type: 'success',
      text1: !isFavorite 
        ? (isRTL ? 'تمت الإضافة إلى المفضلة' : 'Added to favorites')
        : (isRTL ? 'تمت الإزالة من المفضلة' : 'Removed from favorites'),
      position: 'top',
    });
  }, [isFavorite, isRTL]);

  const handleShare = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: isRTL ? 'قريباً' : 'Coming soon',
      text2: isRTL ? 'ميزة المشاركة قيد التطوير' : 'Share feature coming soon',
      position: 'top',
    });
  }, [isRTL]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, isRTL && styles.rtlText]}>
          {isRTL ? 'جاري التحميل...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, isRTL && styles.rtlText]}>
          {isRTL ? 'حدث خطأ في تحميل المنتج' : 'Error loading product'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>
            {isRTL ? 'العودة' : 'Go back'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Safe data extraction with fallbacks
  const productName = typeof product.name === 'object' 
    ? (isRTL ? (product.name.ar || product.name.en || '') : (product.name.en || product.name.ar || ''))
    : (product.name || 'Product');

  const productDescription = typeof product.description === 'object'
    ? (isRTL ? (product.description.ar || product.description.en || '') : (product.description.en || product.description.ar || ''))
    : (product.description || '');

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount! / 100) : (product.price || 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Floating Header */}
      <Animated.View style={[styles.floatingHeader, headerAnimatedStyle]}>
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <SafeAreaView edges={['top']} style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => router.back()}
            >
              {isRTL ? <ChevronRight size={24} color="#fff" /> : <ChevronLeft size={24} color="#fff" />}
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, isRTL && styles.rtlText]} numberOfLines={1}>
              {productName}
            </Text>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Share2 size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
                <Heart 
                  size={20} 
                  color="#fff" 
                  fill={isFavorite ? Colors.accent : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </BlurView>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradient}
          />

          {/* Floating Actions (Top) */}
          <SafeAreaView edges={['top']} style={styles.topActions}>
            <TouchableOpacity 
              style={styles.floatingButton} 
              onPress={() => router.back()}
            >
              {isRTL ? <ChevronRight size={24} color="#fff" /> : <ChevronLeft size={24} color="#fff" />}
            </TouchableOpacity>
            
            <View style={styles.topActionsRight}>
              <TouchableOpacity style={styles.floatingButton} onPress={handleShare}>
                <Share2 size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatingButton} onPress={toggleFavorite}>
                <Heart 
                  size={20} 
                  color="#fff" 
                  fill={isFavorite ? Colors.accent : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Discount Badge */}
          {hasDiscount && product.discount ? (
            <View style={[styles.discountBadge, isRTL && styles.discountBadgeRTL]}>
              <Text style={styles.discountText}>{`-${product.discount}%`}</Text>
            </View>
          ) : null}

          {/* Image Thumbnails */}
          {images.length > 1 ? (
            <View style={styles.thumbnailContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((img: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailActive,
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          {/* Brand & Category */}
          {(product.brandName || product.categoryName) ? (
            <View style={[styles.breadcrumb, isRTL && styles.rowReverse]}>
              {product.brandName ? (
                <Text style={[styles.breadcrumbText, isRTL && styles.rtlText]}>
                  {product.brandName}
                </Text>
              ) : null}
              {product.brandName && product.categoryName ? (
                <Text style={styles.breadcrumbSeparator}>•</Text>
              ) : null}
              {product.categoryName ? (
                <Text style={[styles.breadcrumbText, isRTL && styles.rtlText]}>
                  {product.categoryName}
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Title */}
          <Text style={[styles.title, isRTL && styles.rtlText]}>{productName}</Text>

          {/* Rating & Reviews */}
          <View style={[styles.ratingContainer, isRTL && styles.rowReverse]}>
            <View style={[styles.ratingStars, isRTL && styles.rowReverse]}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  color={Colors.warning}
                  fill={star <= Math.floor(product.rating || 0) ? Colors.warning : 'transparent'}
                  style={{ marginHorizontal: 1 }}
                />
              ))}
              <Text style={styles.ratingText}>{(product.rating || 0).toFixed(1)}</Text>
            </View>
            <Text style={[styles.reviewsText, isRTL && styles.rtlText]}>
              {`(${product.reviewsCount || product.reviews || 0}${' '}${isRTL ? 'تقييم' : 'reviews'})`}
            </Text>
          </View>

          {/* Price */}
          <View style={[styles.priceContainer, isRTL && styles.rowReverse]}>
            <Text style={[styles.price, isRTL && styles.rtlText]}>
              {formatPrice(finalPrice)}
            </Text>
            {hasDiscount ? (
              <Text style={[styles.oldPrice, isRTL && styles.rtlText]}>
                {formatPrice(product.price || 0)}
              </Text>
            ) : null}
          </View>

          {/* Stock Status */}
          <View style={[styles.stockContainer, isRTL && styles.rowReverse]}>
            <View style={[styles.stockDot, product.inStock ? styles.stockDotInStock : styles.stockDotOutOfStock]} />
            <Text style={[styles.stockText, !product.inStock && styles.stockTextOutOfStock, isRTL && styles.rtlText]}>
              {product.inStock 
                ? (isRTL ? 'متوفر في المخزون' : 'In Stock')
                : (isRTL ? 'غير متوفر' : 'Out of Stock')
              }
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 ? (
            <View style={styles.optionSection}>
              <View style={[styles.optionLabelContainer, isRTL && styles.rowReverse]}>
                <Text style={[styles.optionLabel, isRTL && styles.rtlText]}>
                  {isRTL ? 'اللون' : 'Color'}
                </Text>
                {selectedColor ? (
                  <Text style={styles.optionSelected}>
                    {isRTL ? selectedColor.ar : selectedColor.en}
                  </Text>
                ) : null}
              </View>
              <View style={[styles.colorOptions, isRTL && styles.rowReverse]}>
                {product.colors.map((color: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      selectedColor?.hex === color.hex && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <View style={[styles.colorSwatch, { backgroundColor: color.hex }]}>
                      {selectedColor?.hex === color.hex ? (
                        <Check size={16} color="#fff" strokeWidth={3} />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 ? (
            <View style={styles.optionSection}>
              <View style={[styles.optionLabelContainer, isRTL && styles.rowReverse]}>
                <Text style={[styles.optionLabel, isRTL && styles.rtlText]}>
                  {isRTL ? 'المقاس' : 'Size'}
                </Text>
                {selectedSize ? (
                  <Text style={styles.optionSelected}>{selectedSize}</Text>
                ) : null}
              </View>
              <View style={[styles.sizeOptions, isRTL && styles.rowReverse]}>
                {product.sizes.map((size: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sizeOption,
                      selectedSize === size && styles.sizeOptionSelected,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextSelected,
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Age Range Selection */}
          {product.ageRange && product.ageRange.length > 0 ? (
            <View style={styles.optionSection}>
              <View style={[styles.optionLabelContainer, isRTL && styles.rowReverse]}>
                <Text style={[styles.optionLabel, isRTL && styles.rtlText]}>
                  {isRTL ? 'العمر' : 'Age'}
                </Text>
                {selectedAge ? (
                  <Text style={styles.optionSelected}>{selectedAge}</Text>
                ) : null}
              </View>
              <View style={[styles.sizeOptions, isRTL && styles.rowReverse]}>
                {product.ageRange.map((age: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sizeOption,
                      selectedAge === age && styles.sizeOptionSelected,
                    ]}
                    onPress={() => setSelectedAge(age)}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedAge === age && styles.sizeTextSelected,
                    ]}>
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Features */}
          <View style={styles.featuresContainer}>
            <FeatureItem 
              icon={<Truck size={20} color={Colors.primary} />}
              title={isRTL ? 'توصيل مجاني' : 'Free Delivery'}
              subtitle={product.deliveryTime || (isRTL ? 'خلال 2-5 أيام' : 'Within 2-5 days')}
              isRTL={isRTL}
            />
            <FeatureItem 
              icon={<Shield size={20} color={Colors.primary} />}
              title={isRTL ? 'ضمان الجودة' : 'Quality Guarantee'}
              subtitle={isRTL ? '100% أصلي' : '100% Authentic'}
              isRTL={isRTL}
            />
            <FeatureItem 
              icon={<RotateCcw size={20} color={Colors.primary} />}
              title={isRTL ? 'إرجاع سهل' : 'Easy Returns'}
              subtitle={isRTL ? 'خلال 14 يوم' : 'Within 14 days'}
              isRTL={isRTL}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <ExpandableSection
            title={isRTL ? 'الوصف' : 'Description'}
            expanded={expandedSection === 'description'}
            onToggle={() => setExpandedSection(expandedSection === 'description' ? null : 'description')}
            isRTL={isRTL}
          >
            <Text style={[styles.descriptionText, isRTL && styles.rtlText]}>
              {productDescription}
            </Text>
          </ExpandableSection>

          {/* Material */}
          {product.material ? (
            <ExpandableSection
              title={isRTL ? 'المواد' : 'Material'}
              expanded={expandedSection === 'material'}
              onToggle={() => setExpandedSection(expandedSection === 'material' ? null : 'material')}
              isRTL={isRTL}
            >
              <Text style={[styles.descriptionText, isRTL && styles.rtlText]}>
                {product.material}
              </Text>
            </ExpandableSection>
          ) : null}

          {/* Care Instructions */}
          {product.careInstructions ? (
            <ExpandableSection
              title={isRTL ? 'تعليمات العناية' : 'Care Instructions'}
              expanded={expandedSection === 'care'}
              onToggle={() => setExpandedSection(expandedSection === 'care' ? null : 'care')}
              isRTL={isRTL}
            >
              <Text style={[styles.descriptionText, isRTL && styles.rtlText]}>
                {product.careInstructions}
              </Text>
            </ExpandableSection>
          ) : null}

          {/* Features List */}
          {product.features && product.features.length > 0 ? (
            <ExpandableSection
              title={isRTL ? 'المميزات' : 'Features'}
              expanded={expandedSection === 'features'}
              onToggle={() => setExpandedSection(expandedSection === 'features' ? null : 'features')}
              isRTL={isRTL}
            >
              {product.features.map((feature: string, index: number) => (
                <View key={index} style={[styles.featureItem, isRTL && styles.rowReverse]}>
                  <View style={styles.featureBullet} />
                  <Text style={[styles.featureText, isRTL && styles.rtlText]}>{feature}</Text>
                </View>
              ))}
            </ExpandableSection>
          ) : null}

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <BlurView intensity={90} tint="light" style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          {/* Quantity Selector */}
          <View style={[styles.quantityContainer, isRTL && styles.rowReverse]}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus size={18} color={quantity <= 1 ? Colors.gray[400] : Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Plus size={18} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[styles.addToCartButton, !product.inStock && styles.addToCartButtonDisabled]}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            <LinearGradient
              colors={product.inStock ? [Colors.primary, Colors.primaryDark] : [Colors.gray[400], Colors.gray[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addToCartGradient}
            >
              <View style={[styles.cartIconWrapper, isRTL && styles.cartIconWrapperRTL]}>
                <ShoppingCart size={20} color="#fff" />
              </View>
              <Text style={styles.addToCartText}>
                {product.inStock 
                  ? (isRTL ? 'أضف إلى السلة' : 'Add to Cart')
                  : (isRTL ? 'غير متوفر' : 'Out of Stock')
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

// Feature Item Component
function FeatureItem({ 
  icon, 
  title, 
  subtitle,
  isRTL 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.featureItemContainer, isRTL && styles.rowReverse]}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>{title}</Text>
        <Text style={[styles.featureSubtitle, isRTL && styles.rtlText]}>{subtitle}</Text>
      </View>
    </View>
  );
}

// Expandable Section Component
function ExpandableSection({ 
  title, 
  children, 
  expanded, 
  onToggle,
  isRTL 
}: { 
  title: string; 
  children: React.ReactNode; 
  expanded: boolean; 
  onToggle: () => void;
  isRTL: boolean;
}) {
  return (
    <View style={styles.expandableSection}>
      <TouchableOpacity 
        style={[styles.expandableHeader, isRTL && styles.rowReverse]} 
        onPress={onToggle}
      >
        <Text style={[styles.expandableTitle, isRTL && styles.rtlText]}>{title}</Text>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <ChevronDown size={20} color={Colors.text.secondary} />
        </View>
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.expandableContent}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.error,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },

  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // Image Container
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.gray[100],
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  topActionsRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: 80,
    left: Spacing.md,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  discountBadgeRTL: {
    left: undefined,
    right: Spacing.md,
  },
  discountText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#fff',
    ...Shadows.lg,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  // Content
  contentContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl * 1.5,
    borderTopRightRadius: BorderRadius.xl * 1.5,
    marginTop: -20,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  breadcrumbText: {
    fontSize: FontSizes.sm,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breadcrumbSeparator: {
    fontSize: FontSizes.sm,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    lineHeight: FontSizes.xxl * 1.3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  reviewsText: {
    fontSize: FontSizes.sm,
    color: Colors.text.tertiary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    marginRight: Spacing.md,
  },
  oldPrice: {
    fontSize: FontSizes.lg,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  stockDotInStock: {
    backgroundColor: Colors.success,
  },
  stockDotOutOfStock: {
    backgroundColor: Colors.error,
  },
  stockText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.success,
  },
  stockTextOutOfStock: {
    color: Colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.lg,
  },

  // Options
  optionSection: {
    marginBottom: Spacing.lg,
  },
  optionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  optionLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  optionSelected: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  colorOption: {
    padding: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: Colors.primary,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sizeOption: {
    minWidth: 60,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  sizeText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text.primary,
  },
  sizeTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },

  // Features
  featuresContainer: {
    gap: Spacing.md,
  },
  featureItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },

  // Expandable Sections
  expandableSection: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[50],
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  expandableTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  expandableContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
    marginRight: Spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.5,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    gap: Spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
  },
  cartIconWrapper: {
    marginRight: 8,
  },
  cartIconWrapperRTL: {
    marginRight: 0,
    marginLeft: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },

  // RTL Support
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
});
