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
  Modal,
  FlatList,
  Share,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import * as Location from 'expo-location';
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
  RotateCcw,
  ChevronDown,
  Check,
  Minus,
  Plus,
  MapPin,
} from 'lucide-react-native';

// Contexts & Hooks
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProduct } from '@/hooks/useFirestore';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import MapPicker from '@/components/MapPicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.35;

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { language, formatPrice, addToCart, t, isRTL } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { product, loading, error } = useProduct(id as string);

  // Check if product is from SAB MARKET (Grocery)
  const isGroceryProduct = product?.category === 'cwt28D5gjoLno8SFqoxQ';

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(0.5); // للمنتجات بالوزن
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null); // سيتم الحصول عليه من الموقع الحقيقي فقط
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [isSizeGuideVisible, setIsSizeGuideVisible] = useState(false);
  const [isProductNameExpanded, setIsProductNameExpanded] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');

  // Animations
  const scrollY = useSharedValue(0);

  // Auto-select first available option
  useEffect(() => {
    if (product) {
      // Set initial weight for weight-based products
      if (product.soldByWeight && product.minWeight) {
        setWeight(product.minWeight);
      }
      
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

  // Get user's current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // لا نضع موقع افتراضي - المستخدم يجب أن يختار موقعه يدوياً
          console.log('Location permission denied - user must select location manually');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Reverse geocode to get city name
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode && geocode.length > 0) {
          const city = geocode[0].city || geocode[0].region || geocode[0].subregion || geocode[0].country;
          setCurrentLocation(city || null);
        }
      } catch (error) {
        console.log('Error getting location:', error);
        // لا نضع موقع افتراضي عند حدوث خطأ - المستخدم يجب أن يختار
      }
    })();
  }, []);

  // Calculate delivery date (25-30 days from today)
  const getDeliveryDateRange = () => {
    const today = new Date();
    const minDays = 25;
    const maxDays = 30;
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + minDays);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + maxDays);
    
    const formatDate = (date: Date) => {
      const months = isRTL 
        ? ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

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

    // Validation for required options (Skip for Grocery Products)
    if (!isGroceryProduct && product.sizes && product.sizes.length > 0 && !selectedSize) {
      Toast.show({
        type: 'error',
        text1: isRTL ? 'الرجاء اختيار المقاس' : 'Please select a size',
        position: 'top',
      });
      return;
    }

    if (!isGroceryProduct && product.colors && product.colors.length > 0 && !selectedColor) {
      Toast.show({
        type: 'error',
        text1: isRTL ? 'الرجاء اختيار اللون' : 'Please select a color',
        position: 'top',
      });
      return;
    }

    if (!isGroceryProduct && product.ageRange && product.ageRange.length > 0 && !selectedAge) {
      Toast.show({
        type: 'error',
        text1: isRTL ? 'الرجاء اختيار العمر' : 'Please select an age',
        position: 'top',
      });
      return;
    }

    // Use weight or quantity based on product type
    const finalQuantity = product.soldByWeight ? weight : quantity;

    addToCart(product, finalQuantity, {
      size: selectedSize,
      color: selectedColor,
      age: selectedAge,
    });

    const displayText = product.soldByWeight 
      ? `${weight.toFixed(1)} ${product.unit === 'kg' ? (isRTL ? 'كيلو' : 'kg') : product.unit}`
      : `${quantity}`;

    Toast.show({
      type: 'success',
      text1: isRTL ? 'تمت الإضافة إلى السلة' : 'Added to cart',
      text2: `${typeof product.name === 'object' ? (isRTL ? product.name.ar : product.name.en) : product.name} × ${displayText}`,
      position: 'top',
    });
  }, [product, quantity, weight, selectedSize, selectedColor, selectedAge, addToCart, isRTL]);

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
  
  // Calculate price based on weight or quantity
  let basePrice = product.soldByWeight && product.pricePerUnit 
    ? product.pricePerUnit 
    : (product.price || 0);
  
  const finalPrice = hasDiscount ? basePrice * (1 - product.discount! / 100) : basePrice;
  
  // Total price calculation
  const totalPrice = product.soldByWeight 
    ? finalPrice * weight 
    : finalPrice * quantity;

  // Share handler
  const handleShare = async () => {
    try {
      // روابط التطبيق
      const appStoreLink = 'https://apps.apple.com/app/sab-store/id123456789'; // استبدل بالرابط الحقيقي
      const playStoreLink = 'https://play.google.com/store/apps/details?id=com.sabstore.app'; // استبدل بالرابط الحقيقي
      
      const message = isRTL 
        ? `${productName}\n${formatPrice(finalPrice)}\n\n🛍️ تسوق الآن على ساب ستور!\n\n📱 حمّل التطبيق:\n🍎 iOS: ${appStoreLink}\n🤖 Android: ${playStoreLink}`
        : `${productName}\n${formatPrice(finalPrice)}\n\n🛍️ Shop now on Sab Store!\n\n📱 Download the app:\n🍎 iOS: ${appStoreLink}\n🤖 Android: ${playStoreLink}`;

      const result = await Share.share({
        message: message,
        title: productName,
      });

      if (result.action === Share.sharedAction) {
        Toast.show({
          type: 'success',
          text1: isRTL ? 'تمت المشاركة بنجاح' : 'Shared successfully',
          position: 'top',
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
      Toast.show({
        type: 'error',
        text1: isRTL ? 'فشلت المشاركة' : 'Share failed',
        position: 'top',
      });
    }
  };

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
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setSelectedImageIndex(index);
            }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => setIsImageModalVisible(true)}
                style={{ width: SCREEN_WIDTH }}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradient}
            pointerEvents="none"
          />

          {/* Floating Actions (Top) */}
          <SafeAreaView edges={['top']} style={styles.topActions} pointerEvents="box-none">
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
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isRTL && styles.rtlText]} numberOfLines={isProductNameExpanded ? undefined : 1}>
              {isProductNameExpanded 
                ? productName 
                : productName.length > 30 
                  ? `${productName.substring(0, 30)}...` 
                  : productName}
            </Text>
            {productName.length > 30 && (
              <TouchableOpacity 
                onPress={() => setIsProductNameExpanded(!isProductNameExpanded)}
                style={styles.expandButton}
              >
                <ChevronDown 
                  size={20} 
                  color={Colors.text.secondary}
                  style={{
                    transform: [{ rotate: isProductNameExpanded ? '180deg' : '0deg' }]
                  }}
                />
              </TouchableOpacity>
            )}
          </View>

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
            <View style={styles.priceWrapper}>
              <View style={[styles.priceRow, isRTL && styles.rowReverse]}>
                <Text style={[styles.currencySymbol, isRTL && styles.rtlText]}>$</Text>
                <Text style={[styles.price, isRTL && styles.rtlText]}>
                  {finalPrice.toFixed(2)}
                </Text>
              </View>
              {product.soldByWeight && product.unit ? (
                <Text style={[styles.priceUnit, isRTL && styles.rtlText]}>
                  {`/${product.unit === 'kg' ? (isRTL ? 'كيلو' : 'kg') : product.unit}`}
                </Text>
              ) : null}
            </View>
            {hasDiscount ? (
              <View style={[styles.oldPriceContainer, isRTL && styles.rowReverse]}>
                <Text style={[styles.oldPrice, isRTL && styles.rtlText]}>
                  {formatPrice(product.price || 0)}
                </Text>
                <View style={styles.discountPercentageBadge}>
                  <Text style={styles.discountPercentageText}>
                    -{product.discount}%
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* TVA Notice */}
          <Text style={[styles.tvaNotice, isRTL && styles.rtlText]}>
            {isRTL ? 'جميع الأسعار تشمل ضريبة القيمة المضافة' : 'All prices include TVA.'}
          </Text>

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

          {/* Weight Info for weight-based products */}
          {product.soldByWeight && product.minWeight ? (
            <View style={styles.weightInfo}>
              <Text style={[styles.weightInfoText, isRTL && styles.rtlText]}>
                {isRTL 
                  ? `الحد الأدنى للطلب: ${product.minWeight} ${product.unit === 'kg' ? 'كيلو' : product.unit}`
                  : `Minimum order: ${product.minWeight} ${product.unit || 'kg'}`
                }
              </Text>
            </View>
          ) : null}

          {/* Color Selection - Hidden for Grocery Products */}
          {!isGroceryProduct && product.colors && Array.isArray(product.colors) && product.colors.length > 0 ? (
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

          {/* Size Selection - Hidden for Grocery Products */}
          {!isGroceryProduct && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 ? (
            <View style={styles.optionSection}>
              <View style={[styles.optionLabelContainer, isRTL && styles.rowReverse]}>
                <View style={[styles.optionLabelLeft, isRTL && styles.rowReverse]}>
                  <Text style={[styles.optionLabel, isRTL && styles.rtlText]}>
                    {isRTL ? 'المقاس' : 'Size'}
                  </Text>
                  <TouchableOpacity onPress={() => setIsSizeGuideVisible(true)}>
                    <Text style={[styles.sizeGuideLink, isRTL && styles.rtlText]}>
                      {isRTL ? 'دليل المقاسات' : 'Size Guide'}
                    </Text>
                  </TouchableOpacity>
                </View>
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

          {/* Divider */}
          <View style={styles.dividerNoMargin} />

          {/* Delivery Date */}
          <View style={styles.deliveryDateContainer}>
            <Truck size={18} color={Colors.primary} />
            <Text style={[styles.deliveryDateText, isRTL && styles.rtlText]}>
              {isRTL ? 'التوصيل ' : 'Delivery '}
              <Text style={styles.deliveryDateRange}>{getDeliveryDateRange()}</Text>
            </Text>
          </View>

          {/* Divider - 1px */}
          <View style={styles.thinDivider} />

          {/* Location */}
          <View style={[styles.locationContainer, isRTL && styles.rowReverse]}>
            <View style={[styles.locationLeft, isRTL && styles.rowReverse]}>
              <MapPin size={18} color={currentLocation ? Colors.primary : Colors.text.secondary} />
              <Text style={[styles.locationText, isRTL && styles.rtlText]}>
                {currentLocation ? (
                  <>
                    {isRTL ? 'التوصيل إلى ' : 'Delivering to '}
                    <Text style={styles.locationCity}>{currentLocation}</Text>
                  </>
                ) : (
                  <Text style={styles.noLocationText}>
                    {isRTL ? 'اختر موقع التوصيل' : 'Select delivery location'}
                  </Text>
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsMapPickerVisible(true)}>
              <Text style={styles.updateLocationText}>
                {currentLocation 
                  ? (isRTL ? 'تحديث' : 'Update')
                  : (isRTL ? 'اختر' : 'Select')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quantity Selection */}
          <ExpandableSection
            title={isRTL ? 'الكمية' : 'Quantity'}
            expanded={expandedSection === 'quantity'}
            onToggle={() => setExpandedSection(expandedSection === 'quantity' ? null : 'quantity')}
            isRTL={isRTL}
          >
            <View style={styles.quantityGrid}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.quantityOption,
                    quantity === num && styles.quantityOptionSelected,
                  ]}
                  onPress={() => setQuantity(num)}
                >
                  <Text style={[
                    styles.quantityOptionText,
                    quantity === num && styles.quantityOptionTextSelected,
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.quantityNote, isRTL && styles.rtlText]}>
              {isRTL 
                ? 'لطلب كمية أكبر، يرجى التواصل مع فريق الدعم'
                : 'For larger quantities, please contact our support team'}
            </Text>
          </ExpandableSection>

          {/* Shipped and Sold by */}
          <View style={[styles.shippedByContainer, isRTL && styles.rowReverse]}>
            <Text style={[styles.shippedByLabel, isRTL && styles.rtlText]}>
              {isRTL ? 'الشحن والبيع بواسطة' : 'Shipped and Sold by'}
            </Text>
            <Text style={[styles.shippedByValue, isRTL && styles.rtlText]}>
              Sab-Store.com
            </Text>
          </View>

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

          {/* Age Range Selection - Hidden for Grocery Products */}
          {!isGroceryProduct && product.ageRange && Array.isArray(product.ageRange) && product.ageRange.length > 0 ? (
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

          {/* Cash on Delivery Notice */}
          <View style={[styles.noticeItem, isRTL && styles.rowReverse]}>
            <View style={styles.noticeBullet} />
            <Text style={[styles.noticeText, isRTL && styles.rtlText]}>
              {isRTL 
                ? 'الدفع عند الاستلام متاح، قد يزيد السعر'
                : 'Cash on Delivery is accepted, price may increase'}
            </Text>
          </View>

          {/* Delivery by Sab Store */}
          <View style={[styles.noticeItem, isRTL && styles.rowReverse]}>
            <View style={styles.noticeBullet} />
            <Text style={[styles.noticeText, isRTL && styles.rtlText]}>
              {isRTL ? 'التوصيل بواسطة ساب ستور' : 'Delivery by Sab Store'}
            </Text>
          </View>

          {/* Return Policy */}
          <View style={[styles.noticeItem, isRTL && styles.rowReverse]}>
            <View style={styles.noticeBullet} />
            <Text style={[styles.noticeText, isRTL && styles.rtlText]}>
              {isRTL 
                ? 'جودة مضمونة. الإرجاع متاح للمنتجات المعيبة فقط. يرجى التأكد من أن اختيارك يناسب احتياجاتك حيث لا نقبل الإرجاع بناءً على تفضيلات المشتري.'
                : 'High-quality guaranteed. Returns accepted for defective items only. Please ensure your selection matches your needs as returns for buyer preferences are not accepted.'}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

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

          {/* Your Way to Pay */}
          <View style={styles.paymentSection}>
            <Text style={[styles.paymentTitle, isRTL && styles.rtlText]}>
              {isRTL ? 'طرق الدفع المتاحة' : 'Your Way to Pay'}
            </Text>
            <View style={[styles.paymentMethods, isRTL && styles.rowReverse]}>
              {/* Cash */}
              <View style={styles.paymentCard}>
                <Text style={styles.paymentCardText}>Cash</Text>
              </View>
              
              {/* Visa */}
              <View style={styles.paymentCard}>
                <Image 
                  source={require('@/assets/images/payment/card-logo.png')} 
                  style={styles.paymentLogo}
                  resizeMode="contain"
                />
              </View>
              
              {/* OMT */}
              <View style={styles.paymentCard}>
                <Image 
                  source={require('@/assets/images/payment/omt-logo.png')} 
                  style={styles.paymentLogo}
                  resizeMode="contain"
                />
              </View>
              
              {/* Whish Money */}
              <View style={styles.paymentCard}>
                <Image 
                  source={require('@/assets/images/payment/whish-logo.png')} 
                  style={styles.paymentLogo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Write a Review Section */}
          <TouchableOpacity 
            style={styles.writeReviewContainer}
            onPress={() => {
              if (!isAuthenticated) {
                // Show toast message and redirect to login
                Toast.show({
                  type: 'info',
                  text1: isRTL ? 'تسجيل الدخول مطلوب' : 'Login Required',
                  text2: isRTL ? 'يجب تسجيل الدخول لكتابة تقييم' : 'Please login to write a review',
                  position: 'top',
                });
                // Redirect to login page after a short delay
                setTimeout(() => {
                  router.push('/auth/login');
                }, 1500);
              } else {
                setIsReviewModalVisible(true);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.writeReviewText, isRTL && styles.rtlText]}>
              {isRTL ? 'اكتب تقييمك' : 'Write a review'}
            </Text>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          {/* Welcome Message */}
          <View style={styles.welcomeMessage}>
            <Text style={[styles.welcomeText, isRTL && styles.rtlText]}>
              {isRTL 
                ? '🌟 شكراً لاختيارك ساب ستور! نحن سعداء بخدمتك وتقديم أفضل المنتجات لك 🌟'
                : '🌟 Thank you for choosing Sab Store! We are happy to serve you and provide the best products 🌟'}
            </Text>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <BlurView intensity={90} tint="light" style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[styles.addToCartButton, !product.inStock && styles.addToCartButtonDisabled]}
            onPress={handleAddToCart}
            disabled={!product.inStock}
            activeOpacity={0.8}
          >
            <Text style={styles.addToCartText}>
              {product.inStock 
                ? (isRTL ? 'أضف إلى السلة' : 'Add to Cart')
                : (isRTL ? 'غير متوفر' : 'Out of Stock')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Image Zoom Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          {/* Swipeable Images */}
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setSelectedImageIndex(index);
            }}
            keyExtractor={(item, index) => `modal-${index}`}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: item }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {selectedImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <MapPicker
        visible={isMapPickerVisible}
        onClose={() => setIsMapPickerVisible(false)}
        onLocationSelected={async (location) => {
          // Update current location display
          if (location.address) {
            // Extract city from address
            const addressParts = location.address.split(',');
            const city = addressParts[addressParts.length - 2]?.trim() || addressParts[0]?.trim() || 'Location';
            setCurrentLocation(city);
          } else {
            // Use reverse geocoding to get city name
            try {
              const geocode = await Location.reverseGeocodeAsync({
                latitude: location.latitude,
                longitude: location.longitude,
              });
              if (geocode && geocode.length > 0) {
                const city = geocode[0].city || geocode[0].region || 'Location';
                setCurrentLocation(city);
              }
            } catch (error) {
              console.log('Error getting city name:', error);
              setCurrentLocation('Location');
            }
          }
        }}
      />

      {/* Size Guide Modal */}
      <Modal
        visible={isSizeGuideVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSizeGuideVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.sizeGuideModal}>
            {/* Header */}
            <View style={[styles.sizeGuideHeader, isRTL && styles.rowReverse]}>
              <Text style={[styles.sizeGuideTitle, isRTL && styles.rtlText]}>
                {isRTL ? 'دليل المقاسات' : 'Size Guide'}
              </Text>
              <TouchableOpacity onPress={() => setIsSizeGuideVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Size Chart Table */}
            <ScrollView style={styles.sizeGuideContent}>
              {/* Header Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.tableHeaderCell]}>
                  <Text style={styles.tableHeaderText}>EU</Text>
                </View>
                <View style={[styles.tableCell, styles.tableHeaderCell]}>
                  <Text style={styles.tableHeaderText}>UK</Text>
                </View>
                <View style={[styles.tableCell, styles.tableHeaderCell]}>
                  <Text style={styles.tableHeaderText}>{isRTL ? 'المقاس' : 'Brand Size'}</Text>
                </View>
              </View>

              {/* Size Rows */}
              {[
                { eu: '44', uk: '34', brand: 'XS' },
                { eu: '46', uk: '36', brand: 'S' },
                { eu: '48', uk: '38', brand: 'M' },
                { eu: '50', uk: '40', brand: 'L' },
                { eu: '52', uk: '42', brand: 'XL' },
                { eu: '54', uk: '44', brand: 'XXL' },
                { eu: '56', uk: '46', brand: 'XXXL' },
                { eu: '58', uk: '48', brand: '4XL' },
                { eu: '60', uk: '50', brand: '5XL' },
                { eu: '62', uk: '52', brand: '6XL' },
                { eu: '64', uk: '54', brand: '7XL' },
                { eu: '66', uk: '56', brand: '8XL' },
                { eu: '68', uk: '58', brand: '9XL' },
                { eu: '70', uk: '60', brand: '10XL' },
              ].map((row, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellText}>{row.eu}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellText}>{row.uk}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellText}>{row.brand}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsReviewModalVisible(false)}
        statusBarTranslucent={false}
      >
        <SafeAreaView style={styles.reviewModal} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={[styles.reviewModalHeader, isRTL && styles.rowReverse]}>
            <TouchableOpacity 
              onPress={() => setIsReviewModalVisible(false)}
              style={styles.reviewCloseButton}
            >
              <ChevronLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.reviewHeaderCenter}>
              <Image
                source={{ uri: images[0] }}
                style={styles.reviewProductImage}
                resizeMode="cover"
              />
              <View style={styles.reviewHeaderTextContainer}>
                <Text style={[styles.reviewHeaderTitle, isRTL && styles.rtlText]} numberOfLines={1}>
                  {isRTL ? 'كيف كان المنتج؟' : 'How was the item?'}
                </Text>
                <Text style={[styles.reviewProductName, isRTL && styles.rtlText]} numberOfLines={2}>
                  {productName}
                </Text>
              </View>
            </View>
          </View>

          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView 
              style={styles.reviewModalContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Star Rating */}
              <View style={styles.starRatingContainer}>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setReviewRating(star)}
                      activeOpacity={0.7}
                    >
                      <Star
                        size={50}
                        color={star <= reviewRating ? '#FFA500' : '#D1D5DB'}
                        fill={star <= reviewRating ? '#FFA500' : 'transparent'}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Review Text */}
              <View style={styles.reviewInputSection}>
                <Text style={[styles.reviewInputLabel, isRTL && styles.rtlText]}>
                  {isRTL ? 'اكتب تقييمك' : 'Write a review'}
                </Text>
                <TextInput
                  style={[
                    styles.reviewTextInputContainer,
                    isRTL && { textAlign: 'right', writingDirection: 'rtl' }
                  ]}
                  placeholder={isRTL ? 'ماذا يجب أن يعرف العملاء الآخرون؟' : 'What should other customers know?'}
                  placeholderTextColor={Colors.text.tertiary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={reviewText}
                  onChangeText={setReviewText}
                />
              </View>

              {/* Review Title */}
              <View style={styles.reviewInputSection}>
                <Text style={[styles.reviewInputLabel, isRTL && styles.rtlText]}>
                  {isRTL ? 'عنوان تقييمك' : 'Title your review'} 
                  <Text style={styles.requiredText}> ({isRTL ? 'مطلوب' : 'required'})</Text>
                </Text>
                <TextInput
                  style={[
                    styles.reviewTitleInputContainer,
                    isRTL && { textAlign: 'right', writingDirection: 'rtl' }
                  ]}
                  placeholder={isRTL ? 'ما هو الأهم للمعرفة؟' : "What's most important to know?"}
                  placeholderTextColor={Colors.text.tertiary}
                  value={reviewTitle}
                  onChangeText={setReviewTitle}
                />
              </View>

              {/* Bottom Spacing */}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.reviewSubmitContainer}>
              <TouchableOpacity
                style={[
                  styles.reviewSubmitButton,
                  reviewRating === 0 && styles.reviewSubmitButtonDisabled
                ]}
                disabled={reviewRating === 0}
                onPress={() => {
                  Toast.show({
                    type: 'success',
                    text1: isRTL ? 'شكراً لك!' : 'Thank you!',
                    text2: isRTL ? 'تم إرسال تقييمك بنجاح' : 'Your review has been submitted',
                    position: 'top',
                  });
                  setIsReviewModalVisible(false);
                  setReviewRating(0);
                  setReviewText('');
                  setReviewTitle('');
                }}
              >
                <Text style={styles.reviewSubmitButtonText}>
                  {isRTL ? 'إرسال' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
      <View style={styles.expandableSectionInner}>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    lineHeight: FontSizes.xl * 1.3,
  },
  expandButton: {
    padding: 4,
    marginTop: -4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
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
    marginBottom: 0,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currencySymbol: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginRight: Spacing.xs,
    marginTop: Spacing.xs,
  },
  price: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.text.primary,
    marginRight: Spacing.md,
  },
  priceUnit: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    marginRight: Spacing.md,
  },
  oldPrice: {
    fontSize: FontSizes.lg,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginRight: Spacing.sm,
  },
  oldPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  discountPercentageBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountPercentageText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  tvaNotice: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 0,
    marginBottom: 0,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
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
  weightInfo: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  weightInfoText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dividerNoMargin: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginTop: 0,
    marginBottom: 0,
  },
  deliveryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  deliveryDateText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
  },
  deliveryDateRange: {
    color: Colors.text.primary,
    fontWeight: FontWeights.semibold,
  },
  thinDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  locationText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
  },
  locationCity: {
    color: Colors.text.primary,
    fontWeight: FontWeights.semibold,
  },
  noLocationText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
    fontStyle: 'italic',
  },
  updateLocationText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    textDecorationLine: 'underline',
  },
  quantityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quantityOption: {
    width: 50,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  quantityOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  quantityOptionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text.primary,
  },
  quantityOptionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  quantityNote: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  // Options
  optionSection: {
    marginBottom: Spacing.lg,
  },
  optionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  optionLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  sizeGuideLink: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    textDecorationLine: 'underline',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: Spacing.sm,
  },
  sizeOption: {
    minWidth: 48,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
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
    fontSize: FontSizes.sm,
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
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  noticeBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  noticeText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  shippedByContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  shippedByLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  shippedByValue: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '600',
  },

  // Expandable Sections
  expandableSection: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[50],
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.gray[600],
    padding: 2,
  },
  expandableSectionInner: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    overflow: 'hidden',
    backgroundColor: Colors.gray[50],
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  expandableTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  expandableContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1,
    marginTop: 0,
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
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
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 60,
    justifyContent: 'center',
    gap: 4,
  },
  weightUnit: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.text.secondary,
  },
  addToCartButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  addToCartButtonDisabled: {
    backgroundColor: Colors.gray[400],
    opacity: 0.6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },

  // Image Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '300',
  },
  modalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },

  // Size Guide Modal
  sizeGuideModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: SCREEN_HEIGHT * 0.85,
    width: SCREEN_WIDTH,
    marginTop: 'auto',
  },
  sizeGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  sizeGuideTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.text.secondary,
    fontWeight: '300',
  },
  sizeGuideContent: {
    padding: Spacing.lg,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tableRowEven: {
    backgroundColor: Colors.gray[50],
  },
  tableCell: {
    flex: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderCell: {
    backgroundColor: Colors.primary,
  },
  tableHeaderText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: '#fff',
  },
  tableCellText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
  },

  // Payment Section
  paymentSection: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: Spacing.xs,
  },
  paymentTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  paymentCard: {
    width: 70,
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  paymentCardText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  paymentLogo: {
    width: 60,
    height: 40,
  },

  // Write Review
  writeReviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.gray[300],
    ...Shadows.sm,
  },
  writeReviewText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text.primary,
  },

  // Welcome Message
  welcomeMessage: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.5,
  },

  // Review Modal
  reviewModal: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    gap: Spacing.md,
    backgroundColor: Colors.white,
  },
  reviewCloseButton: {
    padding: Spacing.xs,
  },
  reviewHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reviewProductImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray[100],
  },
  reviewHeaderTextContainer: {
    flex: 1,
  },
  reviewHeaderTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  reviewProductName: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  reviewModalContent: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  reviewModalContentContainer: {
    paddingBottom: Spacing.xl,
  },
  starRatingContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  reviewInputSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  reviewInputLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  requiredText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeights.regular,
  },
  reviewTextInputContainer: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  reviewTitleInputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  reviewSubmitContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.white,
  },
  reviewSubmitButton: {
    backgroundColor: '#FFD814',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  reviewSubmitButtonDisabled: {
    backgroundColor: Colors.gray[300],
    opacity: 0.6,
  },
  reviewSubmitButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
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
