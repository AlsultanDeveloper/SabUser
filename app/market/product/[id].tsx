// SAB Market Product Details - Noon Style
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Heart, Share2, ShoppingCart } from 'lucide-react-native';
import { useMarket } from '@/contexts/MarketContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface Product {
  id: string;
  name: any;
  price: number;
  discount?: number;
  image: string;
  images?: string[];
  weight?: string;
  unit?: string;
  description?: any;
  inStock?: boolean;
  brand?: string;
  category?: string;
  productDetails?: string;
  dietaryNeeds?: string;
  sizeUnit?: string;
  storageRequirement?: string;
  countryOfOrigin?: string;
}

export default function MarketProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { marketCart, addToMarketCart, updateMarketCartQuantity, language } = useMarket();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Cart count
  const marketCartCount = marketCart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productRef = doc(db, 'products', id as string);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const data = productDoc.data();
        setProduct({
          id: productDoc.id,
          name: data.name,
          price: data.price || 0,
          discount: data.discount,
          image: data.image || data.images?.[0] || '',
          images: data.images || [],
          weight: data.weight,
          unit: data.unit,
          description: data.description,
          inStock: data.inStock !== false,
          brand: data.brand,
          category: data.category,
          productDetails: data.productDetails,
          dietaryNeeds: data.dietaryNeeds,
          sizeUnit: data.sizeUnit,
          storageRequirement: data.storageRequirement,
          countryOfOrigin: data.countryOfOrigin,
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Toast.show({
        type: 'error',
        text1: language === 'ar' ? 'خطأ في تحميل المنتج' : 'Error loading product',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToMarketCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
        quantity: 1,
        discount: product.discount,
      },
      1
    );

    Toast.show({
      type: 'success',
      text1: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart',
      visibilityTime: 2000,
    });
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      const productName = typeof product.name === 'string' 
        ? product.name 
        : product.name?.[language as 'en' | 'ar'] || product.name?.en || 'Product';

      const price = product.price || 0;
      const discount = product.discount || 0;
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

      const appStoreLink = 'https://apps.apple.com/app/sab-store/id123456789';
      const playStoreLink = 'https://play.google.com/store/apps/details?id=com.sabstore.app';
      
      const message = language === 'ar' 
        ? `${productName}\n$${finalPrice.toFixed(2)}\n\n🛍️ تسوق الآن على ساب ستور!\n\n📱 حمّل التطبيق:\n🍎 iOS: ${appStoreLink}\n🤖 Android: ${playStoreLink}`
        : `${productName}\n$${finalPrice.toFixed(2)}\n\n🛍️ Shop now on Sab Store!\n\n📱 Download the app:\n🍎 iOS: ${appStoreLink}\n🤖 Android: ${playStoreLink}`;

      const result = await Share.share({
        message: message,
        title: productName,
      });

      if (result.action === Share.sharedAction) {
        Toast.show({
          type: 'success',
          text1: language === 'ar' ? 'تمت المشاركة بنجاح' : 'Shared successfully',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
      Toast.show({
        type: 'error',
        text1: language === 'ar' ? 'فشلت المشاركة' : 'Share failed',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📦</Text>
          <Text style={styles.errorText}>
            {language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
          </Text>
        </View>
      </View>
    );
  }

  // Get product details
  const productName = typeof product.name === 'string' 
    ? product.name 
    : product.name?.[language as 'en' | 'ar'] || product.name?.en || 'Product';

  const description = typeof product.description === 'string'
    ? product.description
    : product.description?.[language as 'en' | 'ar'] || product.description?.en || '';

  const price = product.price || 0;
  const discount = product.discount || 0;
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const hasDiscount = discount > 0;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Simple Header - Black Icons */}
      <View style={styles.simpleHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backToStoreButton}
            onPress={() => router.push('/' as any)}
          >
            <Text style={styles.backToStoreText}>
              {language === 'ar' ? '← SAB Store' : 'SAB Store →'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              size={22} 
              color="#000" 
              fill={isFavorite ? "#000" : "none"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleShare}
          >
            <Share2 size={22} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => router.push('/market/cart' as any)}
          >
            <View>
              <ShoppingCart size={22} color="#000" />
              {marketCartCount > 0 && (
                <View style={styles.cartBadgeSimple}>
                  <Text style={styles.cartBadgeTextSimple}>{marketCartCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: images[selectedImage] }}
            style={styles.mainImage}
            resizeMode="contain"
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{Math.round(discount)}%</Text>
            </View>
          )}

          {/* Express Badge */}
          <View style={styles.expressBadge}>
            <Text style={styles.expressText}>⚡ {language === 'ar' ? '25 دقيقة' : '25 Minutes'}</Text>
          </View>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.thumbnailSelected
                  ]}
                  onPress={() => setSelectedImage(index)}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbnailImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info Card - Separate */}
        <View style={styles.productInfoCard}>
          {/* Brand */}
          {product.brand && (
            <View style={styles.brandContainer}>
              <Text style={styles.brandLabel}>{language === 'ar' ? 'الماركة:' : 'Brand:'}</Text>
              <Text style={styles.brandText}>{product.brand}</Text>
            </View>
          )}

          {/* Product Name */}
          <Text style={styles.productName}>{productName}</Text>

          {/* Weight & Unit */}
          {product.weight && product.unit && (
            <View style={styles.weightContainer}>
              <Text style={styles.weightIcon}>📦</Text>
              <Text style={styles.weightText}>
                {product.weight} {product.unit}
              </Text>
            </View>
          )}

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceColumn}>
              <View style={styles.priceRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.price}>{finalPrice.toFixed(2)}</Text>
              </View>

              {hasDiscount && (
                <View style={styles.discountRow}>
                  <Text style={styles.originalPrice}>${price.toFixed(2)}</Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>
                      {language === 'ar' ? 'وفّر' : 'Save'} ${(price - finalPrice).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.taxText}>
                {language === 'ar' ? 'جميع الأسعار تشمل ضريبة القيمة المضافة' : 'All prices include TVA'}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Information Card - Separate */}
        <View style={styles.productInformationCard}>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'معلومات المنتج' : 'Product Information'}
            </Text>
            <View style={styles.nutritionalList}>
              {/* First Row */}
              {(product.productDetails || product.dietaryNeeds) && (
                <View style={styles.nutritionalDoubleRow}>
                  {product.productDetails && (
                    <View style={styles.nutritionalRow}>
                      <Text style={styles.nutritionalBullet}>•</Text>
                      <Text style={styles.nutritionalLabel}>
                        {language === 'ar' ? 'تفاصيل: ' : 'Details: '}
                      </Text>
                      <Text style={styles.nutritionalValue}>{product.productDetails}</Text>
                    </View>
                  )}
                  {product.dietaryNeeds && (
                    <View style={styles.nutritionalRow}>
                      <Text style={styles.nutritionalBullet}>•</Text>
                      <Text style={styles.nutritionalLabel}>
                        {language === 'ar' ? 'احتياجات غذائية: ' : 'Dietary: '}
                      </Text>
                      <Text style={styles.nutritionalValue}>{product.dietaryNeeds}</Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Second Row */}
              {(product.sizeUnit || product.storageRequirement) && (
                <View style={styles.nutritionalDoubleRow}>
                  {product.sizeUnit && (
                    <View style={styles.nutritionalRow}>
                      <Text style={styles.nutritionalBullet}>•</Text>
                      <Text style={styles.nutritionalLabel}>
                        {language === 'ar' ? 'الحجم: ' : 'Size: '}
                      </Text>
                      <Text style={styles.nutritionalValue}>{product.sizeUnit}</Text>
                    </View>
                  )}
                  {product.storageRequirement && (
                    <View style={styles.nutritionalRow}>
                      <Text style={styles.nutritionalBullet}>•</Text>
                      <Text style={styles.nutritionalLabel}>
                        {language === 'ar' ? 'التخزين: ' : 'Storage: '}
                      </Text>
                      <Text style={styles.nutritionalValue}>{product.storageRequirement}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Third Row - Country of Origin */}
              {product.countryOfOrigin && (
                <View style={styles.nutritionalDoubleRow}>
                  <View style={styles.nutritionalRow}>
                    <Text style={styles.nutritionalBullet}>•</Text>
                    <Text style={styles.nutritionalLabel}>
                      {language === 'ar' ? 'بلد المنشأ: ' : 'Origin: '}
                    </Text>
                    <Text style={styles.nutritionalValue}>{product.countryOfOrigin}</Text>
                  </View>
                </View>
              )}
            </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar - Add to Cart */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.addToCartButton, !product.inStock && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Text style={styles.addToCartText}>
            {product.inStock 
              ? (language === 'ar' ? 'إضافة للسلة' : 'Add to Cart')
              : (language === 'ar' ? 'غير متوفر' : 'Out of Stock')
            }
          </Text>
          {product.inStock && (
            <Text style={styles.addToCartPrice}>
              ${finalPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Simple Header - Black Icons
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backToStoreButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backToStoreText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 4,
  },
  cartBadgeSimple: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeTextSimple: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width * 0.75,
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    left: 16,
    backgroundColor: '#FF3E3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  expressBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expressText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#FF6B35',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    backgroundColor: '#FFF',
    marginTop: 8,
    padding: 16,
  },
  // Product Info Card - Separate
  productInfoCard: {
    backgroundColor: '#FFF',
    marginTop: 8,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  // Product Information Card - Separate
  productInformationCard: {
    backgroundColor: '#FFF',
    marginTop: 8,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 6,
  },
  brandLabel: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  brandText: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '700',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 0,
    lineHeight: 22,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 6,
  },
  weightIcon: {
    fontSize: 16,
  },
  weightText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  starIcon: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: '#999',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 0,
    marginBottom: 0,
  },
  priceColumn: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 0,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    marginRight: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF6B35',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 0,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '700',
  },
  taxText: {
    fontSize: 11,
    color: '#999',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  inStock: {
    backgroundColor: '#10B981',
  },
  outOfStock: {
    backgroundColor: '#EF4444',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stockTextGreen: {
    color: '#10B981',
  },
  stockTextRed: {
    color: '#EF4444',
  },
  deliverySection: {
    backgroundColor: '#FFF9F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 0,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryIcon: {
    fontSize: 32,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 0,
  },
  deliveryText: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 0,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  nutritionalSection: {
    marginBottom: 0,
  },
  nutritionalList: {
    gap: 8,
  },
  nutritionalDoubleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  nutritionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nutritionalBullet: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    marginRight: 8,
  },
  nutritionalLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 0,
  },
  nutritionalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addToCartDisabled: {
    backgroundColor: '#CCC',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  addToCartPrice: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
