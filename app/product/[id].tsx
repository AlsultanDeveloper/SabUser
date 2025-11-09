// Product Details Screen - تفاصيل المنتج
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useProduct } from '@/hooks/useFirestore';
import SafeImage from '@/components/SafeImage';
import { getProductImageUrl } from '@/utils/imageHelper';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { language, formatPrice, addToCart, cart } = useApp();
  const insets = useSafeAreaInsets();
  const { product, loading } = useProduct(typeof id === 'string' ? id : '');
  
  // Quantity state
  const [quantity, setQuantity] = useState(1);
  
  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Selection states for product options
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedShoeSize, setSelectedShoeSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  
  // Weight state for vegetables/fruits (in kg)
  const [selectedWeight, setSelectedWeight] = useState(0.5);
  
  // Piece count state for items sold by piece
  const [selectedPieces, setSelectedPieces] = useState(1);
  
  // Common weight options - only 0.5 and 1 kg
  const weightOptions = [0.5, 1];
  
  // Common piece options
  const pieceOptions = [1, 2, 3, 4, 5, 6];

  const getProductName = () => {
    if (!product) return '';
    
    // إذا الاسم object (bilingual)
    if (typeof product.name === 'object' && product.name !== null) {
      const nameByLanguage = language === 'ar' ? product.name.ar : product.name.en;
      return typeof nameByLanguage === 'string' && nameByLanguage.trim() ? nameByLanguage : 'Product';
    }
    
    // إذا الاسم string عادي
    if (typeof product.name === 'string') {
      const nameStr = product.name as string;
      return nameStr.trim() ? nameStr : 'Product';
    }
    
    return 'Product';
  };

  const getProductDescription = () => {
    if (!product) return '';
    if (typeof product.description === 'object' && product.description !== null) {
      const descByLanguage = language === 'ar' ? product.description.ar : product.description.en;
      return typeof descByLanguage === 'string' && descByLanguage.trim() ? descByLanguage : '';
    }
    if (typeof product.description === 'string') {
      const descStr = product.description as string;
      return descStr.trim() ? descStr : '';
    }
    return '';
  };

  // Check if product is vegetable/fruit (needs weight selection)
  const isWeightBasedProduct = () => {
    if (!product) return false;
    
    // PRIORITY CHECK: If unit is explicitly set to 'pc' or 'piece', it's NOT weight-based
    const unit = typeof product.unit === 'string' 
      ? product.unit.toLowerCase() 
      : '';
    
    if (unit === 'pc' || unit === 'piece' || unit === 'قطعة' || unit === 'pcs' || unit === 'ea' || unit === 'each') {
      return false;  // Explicitly sold by piece
    }
    
    // Check category name
    const categoryName = typeof product.categoryName === 'string' 
      ? product.categoryName.toLowerCase() 
      : '';
    
    // Check subcategory name
    const subcategoryName = typeof product.subcategoryName === 'string'
      ? product.subcategoryName.toLowerCase()
      : '';
    
    // Keywords to check - vegetables, fruits, dairy (bulk items only)
    const keywords = [
      'vegetable', 'fruit', 'vegetables', 'fruits',
      'خضار', 'فواكه', 'خضروات',
      'cheese', 'butter',  // Only bulk dairy items, not packaged yogurt/milk
      'جبن', 'زبدة',
      'egg', 'eggs', 'بيض'
    ];
    
    // Check if any keyword exists in category or subcategory
    return keywords.some(keyword => 
      categoryName.includes(keyword) || subcategoryName.includes(keyword)
    );
  };

  // Check if product is sold by piece (pc)
  const isPieceBasedProduct = () => {
    if (!product) return false;
    
    // Don't show pieces if it's weight-based
    if (isWeightBasedProduct()) return false;
    
    // Check unit field
    const unit = typeof product.unit === 'string' 
      ? product.unit.toLowerCase() 
      : '';
    
    // Check if unit is "pc", "piece", "قطعة", "pcs"
    if (unit === 'pc' || unit === 'piece' || unit === 'قطعة' || unit === 'pcs') {
      return true;
    }
    
    // Check category/subcategory for items typically sold by piece
    const categoryName = typeof product.categoryName === 'string' 
      ? product.categoryName.toLowerCase() 
      : '';
    const subcategoryName = typeof product.subcategoryName === 'string'
      ? product.subcategoryName.toLowerCase()
      : '';
    
    // Items typically sold by piece - drinks, snacks, candies, packaged dairy
    const pieceKeywords = [
      'drink', 'beverage', 'soda', 'juice', 'water', 'cola', 'pepsi',
      'مشروب', 'مشروبات', 'عصير', 'ماء', 'كولا',
      'candy', 'chocolate', 'snack', 'chips', 'biscuit', 'cookie',
      'حلوى', 'شوكولا', 'شوكولاتة', 'بسكويت', 'شيبس',
      'yogurt', 'milk', 'yoghurt', 'dairy',  // Packaged dairy products
      'زبادي', 'حليب', 'لبن', 'ألبان'
    ];
    
    return pieceKeywords.some(keyword => 
      categoryName.includes(keyword) || subcategoryName.includes(keyword)
    );
  };

  // Calculate final price based on weight or pieces
  const getFinalPrice = () => {
    const pricePerUnit = hasDiscount ? discountedPrice : basePrice;
    
    if (isWeightBasedProduct()) {
      return pricePerUnit * selectedWeight;
    } else if (isPieceBasedProduct()) {
      return pricePerUnit * selectedPieces;
    }
    
    return pricePerUnit;
  };

  // Check if user can add to cart (all required options selected)
  const canAddToCart = () => {
    if (!product) return false;
    
    // Only enforce selection for Fashion/Clothing and Market products
    const requiresSelection = isFashionOrMarketProduct();
    
    if (!requiresSelection) {
      return true; // No selection required for furniture, electronics, etc.
    }
    
    // Check if sizes are required and selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return false;
    }
    
    // Check if shoe sizes are required and selected
    if (product.shoeSizes && product.shoeSizes.length > 0 && !selectedShoeSize) {
      return false;
    }
    
    // Check if colors are required and selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      return false;
    }
    
    // Check if age range is required and selected
    if (product.ageRange && product.ageRange.length > 0 && !selectedAge) {
      return false;
    }
    
    return true;
  };

  // Check if product is Fashion or Market category (requires selection)
  const isFashionOrMarketProduct = () => {
    if (!product) return false;
    
    const categoryName = typeof product.categoryName === 'string' 
      ? product.categoryName.toLowerCase() 
      : '';
    
    const subcategoryName = typeof product.subcategoryName === 'string'
      ? product.subcategoryName.toLowerCase()
      : '';
    
    // Fashion/Clothing keywords
    const fashionKeywords = [
      'fashion', 'clothing', 'clothes', 'apparel', 'wear',
      'shirt', 'pants', 'dress', 'shoes', 'jacket', 'coat',
      'ملابس', 'أزياء', 'قميص', 'بنطال', 'فستان', 'حذاء', 'جاكيت',
      'men', 'women', 'kids', 'baby',
      'رجال', 'نساء', 'أطفال', 'بيبي'
    ];
    
    // Market/Food keywords
    const marketKeywords = [
      'market', 'food', 'grocery', 'fresh',
      'vegetable', 'fruit', 'dairy', 'meat', 'fish',
      'سوق', 'طعام', 'بقالة', 'طازج',
      'خضار', 'فواكه', 'ألبان', 'لحوم', 'سمك'
    ];
    
    const allKeywords = [...fashionKeywords, ...marketKeywords];
    
    return allKeywords.some(keyword => 
      categoryName.includes(keyword) || subcategoryName.includes(keyword)
    );
  };

  // Check if product is from SAB MARKET (local Lebanese products)
  const isSabMarketProduct = (productToCheck?: any) => {
    const prod = productToCheck || product;
    if (!prod) return false;
    
    const categoryName = typeof prod.categoryName === 'string' 
      ? prod.categoryName.toLowerCase() 
      : '';
    
    const subcategoryName = typeof prod.subcategoryName === 'string'
      ? prod.subcategoryName.toLowerCase()
      : '';
    
    // Check for SAB MARKET keywords
    const sabMarketKeywords = ['sab market', 'sabmarket', 'سوق ساب', 'ساب ماركت'];
    
    return sabMarketKeywords.some(keyword => 
      categoryName.includes(keyword) || subcategoryName.includes(keyword)
    );
  };

  // Check if cart can accept this product (no mixing SAB MARKET with others)
  const canMixWithCart = () => {
    if (cart.length === 0) return true; // Empty cart = can add anything
    
    const currentProductIsSabMarket = isSabMarketProduct();
    const cartHasSabMarket = cart.some(item => isSabMarketProduct(item.product));
    
    // If current product is SAB MARKET and cart has non-SAB products, reject
    if (currentProductIsSabMarket && !cartHasSabMarket) {
      return false;
    }
    
    // If current product is NOT SAB MARKET and cart has SAB products, reject
    if (!currentProductIsSabMarket && cartHasSabMarket) {
      return false;
    }
    
    return true;
  };

  // Get list of missing required options
  const getMissingOptions = () => {
    if (!product) return [];
    
    const missing: string[] = [];
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      missing.push(language === 'ar' ? 'المقاس' : 'Size');
    }
    
    if (product.shoeSizes && product.shoeSizes.length > 0 && !selectedShoeSize) {
      missing.push(language === 'ar' ? 'مقاس الحذاء' : 'Shoe Size');
    }
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      missing.push(language === 'ar' ? 'اللون' : 'Color');
    }
    
    if (product.ageRange && product.ageRange.length > 0 && !selectedAge) {
      missing.push(language === 'ar' ? 'الفئة العمرية' : 'Age Range');
    }
    
    return missing;
  };

  // Handle Share Product
  const handleShare = async () => {
    try {
      const productName = getProductName();
      const price = formatPrice(getFinalPrice());
      const message = `${productName}\n${price}\n\nCheck out this product on SAB!`;
      
      const result = await Share.share({
        message,
        title: productName,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        } else {
          console.log('Product shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share product');
      console.error('Share error:', error);
    }
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
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Feather name="share-2" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image Gallery */}
        <View style={styles.imageContainer}>
          {/* Main Image Display */}
          <SafeImage 
            uri={
              product.images && Array.isArray(product.images) && product.images.length > 0
                ? typeof product.images[currentImageIndex] === 'string'
                  ? product.images[currentImageIndex]
                  : getProductImageUrl(product, 800)
                : getProductImageUrl(product, 800)
            }
            style={styles.productImage}
            fallbackIconSize={100}
            fallbackIconName="image"
            showLoader={true}
            resizeMode="cover"
          />
          
          {/* Image Counter Badge */}
          {product.images && Array.isArray(product.images) && product.images.length > 1 && (
            <View style={styles.imageCountBadge}>
              <Feather name="image" size={14} color="#FFF" />
              <Text style={styles.imageCountText}>
                {currentImageIndex + 1}/{product.images.length}
              </Text>
            </View>
          )}
          
          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{`-${product.discount}%`}</Text>
            </View>
          )}
          
          {/* Navigation Arrows (if multiple images) */}
          {product.images && Array.isArray(product.images) && product.images.length > 1 && (
            <>
              {/* Previous Button */}
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.imageNavButtonLeft]}
                  onPress={() => setCurrentImageIndex(prev => prev - 1)}
                >
                  <Feather name="chevron-left" size={24} color="#FFF" />
                </TouchableOpacity>
              )}
              
              {/* Next Button */}
              {currentImageIndex < product.images.length - 1 && (
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.imageNavButtonRight]}
                  onPress={() => setCurrentImageIndex(prev => prev + 1)}
                >
                  <Feather name="chevron-right" size={24} color="#FFF" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Image Thumbnails */}
        {product.images && Array.isArray(product.images) && product.images.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  currentImageIndex === index && styles.thumbnailActive,
                ]}
                onPress={() => setCurrentImageIndex(index)}
              >
                <SafeImage
                  uri={typeof image === 'string' ? image : getProductImageUrl(product, 200)}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Brand */}
          {(typeof product.brandName === 'string' && product.brandName) || 
           (typeof product.brand === 'string' && product.brand) ? (
            <Text style={styles.brandText}>
              {product.brandName || product.brand}
            </Text>
          ) : null}

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
              {formatPrice(getFinalPrice())}
              {isWeightBasedProduct() && (
                <Text style={styles.priceUnit}>
                  {language === 'ar' ? ' للكيلو' : ' /kg'}
                </Text>
              )}
              {isPieceBasedProduct() && (
                <Text style={styles.priceUnit}>
                  {language === 'ar' ? ' للقطعة' : ' /pc'}
                </Text>
              )}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatPrice(
                  isWeightBasedProduct() 
                    ? basePrice * selectedWeight 
                    : isPieceBasedProduct()
                      ? basePrice * selectedPieces
                      : basePrice
                )}
              </Text>
            )}
          </View>

          {/* Weight Selection for Vegetables/Fruits */}
          {isWeightBasedProduct() && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'اختر الوزن' : 'Select Weight'}
              </Text>
              <View style={styles.weightContainer}>
                {weightOptions.map((weight) => (
                  <TouchableOpacity
                    key={weight}
                    style={[
                      styles.weightOption,
                      selectedWeight === weight && styles.weightOptionSelected
                    ]}
                    onPress={() => setSelectedWeight(weight)}
                  >
                    <Text style={[
                      styles.weightText,
                      selectedWeight === weight && styles.weightTextSelected
                    ]}>
                      {weight} {language === 'ar' ? 'كغ' : 'kg'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.totalWeightPrice}>
                {language === 'ar' ? 'السعر الإجمالي: ' : 'Total Price: '}
                <Text style={styles.totalWeightPriceAmount}>
                  {formatPrice(getFinalPrice())}
                </Text>
              </Text>
            </View>
          )}

          {/* Piece Selection for items sold by piece */}
          {isPieceBasedProduct() && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'اختر عدد القطع' : 'Select Pieces'}
              </Text>
              <View style={styles.weightContainer}>
                {pieceOptions.map((pieces) => (
                  <TouchableOpacity
                    key={pieces}
                    style={[
                      styles.weightOption,
                      selectedPieces === pieces && styles.weightOptionSelected
                    ]}
                    onPress={() => setSelectedPieces(pieces)}
                  >
                    <Text style={[
                      styles.weightText,
                      selectedPieces === pieces && styles.weightTextSelected
                    ]}>
                      {pieces} {language === 'ar' ? 'قطعة' : 'pc'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.totalWeightPrice}>
                {language === 'ar' ? 'السعر الإجمالي: ' : 'Total Price: '}
                <Text style={styles.totalWeightPriceAmount}>
                  {formatPrice(getFinalPrice())}
                </Text>
              </Text>
            </View>
          )}

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
            {/* Stock count hidden as per user request */}
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
          {getProductDescription() && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'الوصف' : 'Description'}
              </Text>
              <Text style={styles.descriptionText}>
                {getProductDescription()}
              </Text>
            </View>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'الألوان المتاحة' : 'Available Colors'}
                {isFashionOrMarketProduct() && !selectedColor && <Text style={styles.requiredStar}> *</Text>}
              </Text>
              <View style={styles.colorsContainer}>
                {product.colors.map((color, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.colorItem,
                      selectedColor === color && styles.colorItemSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <View 
                      style={[
                        styles.colorCircle, 
                        { backgroundColor: color.hex || '#CCC' },
                        selectedColor === color && styles.colorCircleSelected
                      ]} 
                    >
                      {selectedColor === color && (
                        <Feather name="check" size={16} color="#FFF" />
                      )}
                    </View>
                    <Text style={[
                      styles.colorText,
                      selectedColor === color && styles.colorTextSelected
                    ]}>
                      {language === 'ar' 
                        ? (typeof color.ar === 'string' ? color.ar : 'Color') 
                        : (typeof color.en === 'string' ? color.en : 'Color')
                      }
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'المقاسات المتاحة' : 'Available Sizes'}
                {isFashionOrMarketProduct() && !selectedSize && <Text style={styles.requiredStar}> *</Text>}
              </Text>
              <View style={styles.sizesContainer}>
                {product.sizes.map((size, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.sizeChip,
                      selectedSize === String(size) && styles.sizeChipSelected
                    ]}
                    onPress={() => setSelectedSize(String(size))}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedSize === String(size) && styles.sizeTextSelected
                    ]}>
                      {typeof size === 'string' || typeof size === 'number' ? String(size) : 'Size'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Shoe Sizes */}
          {product.shoeSizes && product.shoeSizes.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'مقاسات الأحذية' : 'Shoe Sizes'}
                {isFashionOrMarketProduct() && !selectedShoeSize && <Text style={styles.requiredStar}> *</Text>}
              </Text>
              <View style={styles.sizesContainer}>
                {product.shoeSizes.map((size, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.sizeChip,
                      selectedShoeSize === String(size) && styles.sizeChipSelected
                    ]}
                    onPress={() => setSelectedShoeSize(String(size))}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedShoeSize === String(size) && styles.sizeTextSelected
                    ]}>
                      {typeof size === 'string' || typeof size === 'number' ? String(size) : 'Size'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Age Range */}
          {product.ageRange && product.ageRange.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'الفئة العمرية' : 'Age Range'}
                {isFashionOrMarketProduct() && !selectedAge && <Text style={styles.requiredStar}> *</Text>}
              </Text>
              <View style={styles.sizesContainer}>
                {product.ageRange.map((age, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.sizeChip,
                      selectedAge === String(age) && styles.sizeChipSelected
                    ]}
                    onPress={() => setSelectedAge(String(age))}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedAge === String(age) && styles.sizeTextSelected
                    ]}>
                      {typeof age === 'string' || typeof age === 'number' ? String(age) : 'Age'}
                    </Text>
                  </TouchableOpacity>
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
                  <Text style={styles.specValue}>{product.gender}</Text>
                </View>
              )}

              {/* Season */}
              {product.season && typeof product.season === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="sun" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specValue}>{product.season}</Text>
                </View>
              )}

              {/* Material */}
              {product.material && typeof product.material === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="package" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specValue}>{product.material}</Text>
                </View>
              )}

              {/* Brand */}
              {((typeof product.brandName === 'string' && product.brandName) || 
                (typeof product.brand === 'string' && product.brand)) && (
                <View style={styles.specRow}>
                  <Feather name="award" size={16} color={Colors.text.secondary} />
                  <Text style={styles.specValue}>{product.brandName || product.brand}</Text>
                </View>
              )}

              {/* Subcategory */}
              {product.subcategoryName && typeof product.subcategoryName === 'string' && (
                <View style={styles.specRow}>
                  <Feather name="tag" size={16} color={Colors.text.secondary} />
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
            (product.inStock === false || !canAddToCart()) && styles.addToCartButtonDisabled
          ]}
          onPress={() => {
            // Check if cart mixing is allowed (SAB MARKET vs other products)
            if (!canMixWithCart()) {
              const currentProductIsSabMarket = isSabMarketProduct();
              
              Alert.alert(
                language === 'ar' ? 'لا يمكن دمج المنتجات' : 'Cannot Mix Products',
                currentProductIsSabMarket
                  ? language === 'ar' 
                    ? 'لا يمكن دمج منتجات SAB MARKET مع منتجات أخرى في نفس السلة.\n\nيرجى إفراغ السلة أولاً أو إكمال الطلب الحالي.'
                    : 'Cannot mix SAB MARKET products with other products in the same cart.\n\nPlease empty your cart first or complete your current order.'
                  : language === 'ar'
                    ? 'لا يمكن دمج منتجات أخرى مع SAB MARKET في نفس السلة.\n\nيرجى إفراغ السلة أولاً أو إكمال الطلب الحالي.'
                    : 'Cannot mix other products with SAB MARKET in the same cart.\n\nPlease empty your cart first or complete your current order.',
                [{ text: language === 'ar' ? 'حسناً' : 'OK' }]
              );
              return;
            }
            
            // Validation: Check if required selections are made
            if (!canAddToCart()) {
              const missingOptions = getMissingOptions();
              Alert.alert(
                language === 'ar' ? 'اختيار مطلوب' : 'Selection Required',
                language === 'ar' 
                  ? `الرجاء اختيار: ${missingOptions.join('، ')}`
                  : `Please select: ${missingOptions.join(', ')}`,
                [{ text: language === 'ar' ? 'حسناً' : 'OK' }]
              );
              return;
            }
            
            if (product.inStock !== false) {
              // Create product with weight/piece info if applicable
              let productToAdd: any = product;
              
              if (isWeightBasedProduct()) {
                productToAdd = {
                  ...product,
                  selectedWeight,
                  pricePerKg: hasDiscount ? discountedPrice : basePrice,
                  finalPrice: getFinalPrice(),
                  displayName: `${getProductName()} (${selectedWeight} ${language === 'ar' ? 'كغ' : 'kg'})`
                };
              } else if (isPieceBasedProduct()) {
                productToAdd = {
                  ...product,
                  selectedPieces,
                  pricePerPiece: hasDiscount ? discountedPrice : basePrice,
                  finalPrice: getFinalPrice(),
                  displayName: `${getProductName()} (${selectedPieces} ${language === 'ar' ? 'قطعة' : 'pcs'})`
                };
              }
              
              // Add selected options to product
              if (selectedSize) productToAdd.selectedSize = selectedSize;
              if (selectedShoeSize) productToAdd.selectedShoeSize = selectedShoeSize;
              if (selectedColor) productToAdd.selectedColor = selectedColor;
              if (selectedAge) productToAdd.selectedAge = selectedAge;
              
              addToCart(productToAdd, quantity);
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: 24,
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
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: '#B12704',
    marginRight: Spacing.sm,
  },
  originalPrice: {
    fontSize: FontSizes.md,
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
  weightContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  weightOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    backgroundColor: Colors.white,
    minWidth: 80,
    alignItems: 'center',
  },
  weightOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  weightText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  weightTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  totalWeightPrice: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  totalWeightPriceAmount: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: '400',
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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
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
    fontWeight: '600',
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
  // Image Gallery Styles
  imageCountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNavButtonLeft: {
    left: 16,
  },
  imageNavButtonRight: {
    right: 16,
  },
  thumbnailsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  thumbnailsContent: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  // Selection Styles
  requiredStar: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorItemSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#F3E8FF',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  colorTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sizeChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sizeTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
});
