import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Trash2, Plus, Minus, Info, ArrowLeft, ArrowRight } from '@/components/lucide-shim';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';
import type { CartItem as CartItemType } from '@/types';
import * as Location from 'expo-location';
import { calculateShipping, getDefaultShipping } from '@/utils/shippingCalculator';

interface CartItemCardProps {
  item: CartItemType;
  language: string;
  formatPrice: (price: number) => string;
  onRemove: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  isRTL: boolean;
}

function CartItemCard({ item, language, formatPrice, onRemove, onQuantityChange, isRTL }: CartItemCardProps) {
  const finalPrice = item.product.discount
    ? item.product.price * (1 - item.product.discount / 100)
    : item.product.price;

  const hasVariants = item.product.colors || item.product.sizes || item.product.ageRange || item.product.unit;

  return (
    <View style={styles.cartItem}>
      <View style={styles.cartItemContent}>
        <View style={styles.imageContainer}>
          <SafeImage 
            uri={item.product.image || item.product.images?.[0] || ''} 
            style={styles.productImage} 
          />
          {(item.product.discount ?? 0) > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.product.discount}%</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.product.name[language as 'en' | 'ar']}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
                onRemove(item.product.id);
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color={Colors.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {item.product.brand && (
            <Text style={styles.brandText} numberOfLines={1}>
              {item.product.brand}
            </Text>
          )}

          {hasVariants && (
            <View style={styles.variantsContainer}>
              {item.product.colors && item.product.colors.length > 0 && (
                <View style={styles.variantChip}>
                  <View style={[styles.colorDot, { backgroundColor: item.product.colors[0].hex }]} />
                  <Text style={styles.variantText} numberOfLines={1}>
                    {item.product.colors[0][language as 'en' | 'ar']}
                  </Text>
                </View>
              )}
              {item.product.sizes && item.product.sizes.length > 0 && (
                <View style={styles.variantChip}>
                  <Text style={styles.variantText}>{item.product.sizes[0]}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              {(item.product.discount ?? 0) > 0 && (
                <Text style={styles.originalPrice}>
                  {formatPrice(item.product.price)}
                </Text>
              )}
              <Text style={styles.productPrice}>{formatPrice(finalPrice)}</Text>
            </View>

            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityBtn, item.quantity <= 1 && styles.quantityBtnDisabled]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onQuantityChange(item.product.id, item.quantity - 1);
                }}
                activeOpacity={0.7}
                disabled={item.quantity <= 1}
              >
                <Minus 
                  size={14} 
                  color={item.quantity <= 1 ? Colors.text.tertiary : Colors.text.primary} 
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onQuantityChange(item.product.id, item.quantity + 1);
                }}
                activeOpacity={0.7}
              >
                <Plus size={14} color={Colors.text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { t, cart, cartTotal, formatPrice, updateCartItemQuantity, removeFromCart, language, isRTL } = useApp();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Shipping state
  const [shippingCost, setShippingCost] = useState(5);
  const [estimatedDays, setEstimatedDays] = useState('2-3');
  const [loadingShipping, setLoadingShipping] = useState(true);
  const [shippingDistance, setShippingDistance] = useState<number | null>(null);

  // Floating animation for empty cart icon
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create floating animation
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    floating.start();

    return () => floating.stop();
  }, [floatingAnim]);

  // Calculate shipping based on location
  useEffect(() => {
    const calculateShippingCost = async () => {
      if (cart.length === 0) {
        setLoadingShipping(false);
        return;
      }

      try {
        setLoadingShipping(true);
        
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const shipping = await calculateShipping(
            location.coords.latitude,
            location.coords.longitude,
            cartTotal
          );
          
          setShippingCost(shipping.cost);
          setEstimatedDays(shipping.estimatedDays);
          setShippingDistance(shipping.distance);
        } else {
          // Use default shipping if no location permission
          const defaultShipping = await getDefaultShipping(cartTotal);
          setShippingCost(defaultShipping.cost);
          setEstimatedDays(defaultShipping.estimatedDays);
        }
      } catch (error) {
        console.log('Error calculating shipping:', error);
        // Use default shipping on error
        const defaultShipping = await getDefaultShipping(cartTotal);
        setShippingCost(defaultShipping.cost);
        setEstimatedDays(defaultShipping.estimatedDays);
      } finally {
        setLoadingShipping(false);
      }
    };

    calculateShippingCost();
  }, [cartTotal, cart.length]);

  const FREE_SHIPPING_THRESHOLD = 100;

  const subtotal = cartTotal;
  const total = subtotal + shippingCost;

  const handleRemove = useCallback((productId: string) => {
    removeFromCart(productId);
  }, [removeFromCart]);

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    updateCartItemQuantity(productId, newQuantity);
  }, [updateCartItemQuantity]);

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <View style={styles.headerPlaceholder} />
              <Text style={styles.headerTitle}>
                {language === 'ar' ? 'سلة التسوق' : 'My Cart'}
              </Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          {/* Animated Icon Container */}
          <Animated.View 
            style={[
              styles.emptyIconWrapper,
              {
                transform: [{ translateY: floatingAnim }],
              },
            ]}
          >
            <View style={styles.emptyIconContainer}>
              <Image
                source={require('@/assets/images/empty-cart.png')}
                style={styles.emptyCartImage}
                resizeMode="contain"
              />
            </View>
            {/* Decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
          </Animated.View>

          <Text style={styles.emptyTitle}>
            {language === 'ar' ? 'انو بعدا فاضية "عبيا"' : 'Eno Ba3da Fadieh "3abia'}
          </Text>
          <Text style={styles.emptyDescription}>
            {language === 'ar' 
              ? 'أضف بعض المنتجات للبدء في التسوق' 
              : 'Add some products to get started'}
          </Text>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push('/(tabs)/home' as any);
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              {isRTL ? (
                <ArrowRight size={20} color={Colors.white} strokeWidth={2.5} />
              ) : (
                <ArrowLeft size={20} color={Colors.white} strokeWidth={2.5} />
              )}
              <Text style={styles.continueButtonText}>
                {language === 'ar' ? 'ابدأ التسوق' : 'Continue Shopping'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Links */}
          <View style={styles.quickLinksContainer}>
            <Text style={styles.quickLinksTitle}>
              {language === 'ar' ? 'تصفح سريع' : 'Quick Browse'}
            </Text>
            <View style={styles.quickLinksRow}>
              <TouchableOpacity 
                style={styles.quickLinkItem}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/(tabs)/categories' as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.quickLinkIconImage}>
                  <Image
                    source={require('@/assets/images/categories-icon.png')}
                    style={styles.quickLinkImageStyle}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.quickLinkText}>
                  {language === 'ar' ? 'الفئات' : 'Categories'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickLinkItem}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  // Navigate to SAB Market
                  router.push('/market' as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.quickLinkIconImage}>
                  <Image
                    source={require('@/assets/images/SAB-MARKET.png')}
                    style={styles.quickLinkImageStyle}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.quickLinkText}>
                  SAB
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              activeOpacity={0.7}
            >
              {isRTL ? (
                <ArrowRight size={24} color={Colors.white} strokeWidth={2} />
              ) : (
                <ArrowLeft size={24} color={Colors.white} strokeWidth={2} />
              )}
            </TouchableOpacity>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>
                {language === 'ar' ? 'سلة التسوق' : 'My Cart'}
              </Text>
            </View>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCount}>
                {cart.length}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cartItemsContainer}>
          {cart.map((item, index) => {
            // Create a unique key combining product id, variant info, and index as fallback
            const variantKey = [
              item.product.colors?.[0]?.hex || '',
              item.product.sizes?.[0] || '',
              item.product.ageRange || '',
              item.product.unit || ''
            ].filter(Boolean).join('-');
            const uniqueKey = `${item.product.id}-${variantKey || index}`;
            
            return (
              <CartItemCard
                key={uniqueKey}
                item={item}
                language={language}
                formatPrice={formatPrice}
                onRemove={handleRemove}
                onQuantityChange={handleQuantityChange}
                isRTL={isRTL}
              />
            );
          })}
        </View>

        {subtotal < FREE_SHIPPING_THRESHOLD && shippingCost > 0 && !loadingShipping && (
          <View style={styles.shippingProgressCard}>
            <View style={styles.shippingProgressHeader}>
              <Info size={16} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.shippingProgressText}>
                {language === 'ar' 
                  ? `${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} للشحن المجاني`
                  : `${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} to free shipping`
                }
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
            </Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {language === 'ar' ? 'الشحن' : 'Shipping'}
              {shippingDistance && (
                <Text style={styles.distanceText}>
                  {' '}({shippingDistance}km)
                </Text>
              )}
            </Text>
            {loadingShipping ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : shippingCost === 0 ? (
              <Text style={styles.freeShippingValue}>
                {language === 'ar' ? 'مجاناً' : 'Free'}
              </Text>
            ) : (
              <View style={styles.shippingCostContainer}>
                <Text style={styles.summaryValue}>{formatPrice(shippingCost)}</Text>
                {estimatedDays && (
                  <Text style={styles.estimatedDaysText}>
                    {estimatedDays} {language === 'ar' ? 'أيام' : 'days'}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {language === 'ar' ? 'المجموع' : 'Total'}
            </Text>
            <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
          </View>

          {/* Price includes TVA notice */}
          <View style={styles.vatNoticeContainer}>
            <Text style={styles.vatNotice}>
              {language === 'ar' ? 'الأسعار تشمل ضريبة القيمة المضافة' : 'Prices include TVA'}
            </Text>
          </View>
        </View>

        <View style={styles.spacing} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkoutButton} 
          activeOpacity={0.85}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            
            if (!isAuthenticated) {
              router.push('/auth/login' as any);
              return;
            }
            
            router.push('/checkout-details' as any);
          }}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButtonGradient}
          >
            <View style={styles.checkoutButtonContent}>
              <Text style={styles.checkoutButtonText}>
                {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
              </Text>
              <View style={styles.checkoutButtonRight}>
                <Text style={styles.checkoutButtonAmount}>{formatPrice(total)}</Text>
                {isRTL ? (
                  <ArrowLeft size={18} color={Colors.white} strokeWidth={2.5} />
                ) : (
                  <ArrowRight size={18} color={Colors.white} strokeWidth={2.5} />
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },

  gradientHeader: {
    paddingBottom: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerPlaceholder: {
    width: 40,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.xl,
  },

  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  cartTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },

  itemCountBadge: {
    backgroundColor: Colors.white,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  itemCount: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '700' as const,
  },

  cartItemsContainer: {
    paddingTop: Spacing.sm,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },

  emptyIconWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },

  emptyIconContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyCartImage: {
    width: 200,
    height: 200,
    tintColor: undefined, // تأكد من عدم وجود لون
  },

  decorativeCircle1: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary + '20',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: 10,
    left: -5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: Colors.accent + '30',
  },

  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    textAlign: 'center' as const,
  },

  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center' as const,
    lineHeight: 22,
    maxWidth: 280,
  },

  continueButton: {
    marginTop: Spacing.xl,
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.md,
  },

  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl + 8,
    gap: Spacing.sm,
  },

  continueButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },

  quickLinksContainer: {
    marginTop: Spacing.xl + Spacing.md,
    width: '100%',
    maxWidth: 320,
  },

  quickLinksTitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.tertiary,
    textAlign: 'center' as const,
    marginBottom: Spacing.md,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },

  quickLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },

  quickLinkItem: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 100,
  },

  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  quickLinkIconImage: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },

  quickLinkImageStyle: {
    width: 94,
    height: 94,
    borderRadius: 42.5,
    alignSelf: 'center',
  },

  quickLinkText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  cartItem: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  cartItemRTL: {
    flexDirection: 'row-reverse',
  },

  itemTouchable: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  cartItemContent: {
    flexDirection: 'row',
    padding: Spacing.sm,
  },

  imageContainer: {
    position: 'relative',
    marginRight: Spacing.sm,
  },

  imageContainerRTL: {
    marginRight: 0,
    marginLeft: Spacing.md,
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
  },

  productInfo: {
    flex: 1,
  },

  productInfoRTL: {
    alignItems: 'flex-end',
  },

  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },

  productName: {
    flex: 1,
    fontSize: FontSizes.sm + 1,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    lineHeight: 18,
  },

  removeButton: {
    padding: 4,
    marginLeft: 8,
    opacity: 0.7,
  },

  brandText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginBottom: 4,
  },

  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },

  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  variantText: {
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },

  variantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  variantLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },

  variantValue: {
    fontSize: FontSizes.xs,
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },

  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },

  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: Spacing.sm,
  },

  stockText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: '600' as const,
  },

  outOfStockBadge: {
    opacity: 1,
  },

  outOfStockText: {
    color: Colors.error,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  productPrice: {
    fontSize: FontSizes.md + 1,
    fontWeight: '700' as const,
    color: Colors.primary,
  },

  originalPrice: {
    fontSize: FontSizes.xs,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 4,
    paddingHorizontal: 4,
  },

  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },

  quantityBtnDisabled: {
    opacity: 0.5,
  },

  quantity: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    minWidth: 24,
    textAlign: 'center' as const,
  },

  promoSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  promoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  promoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    backgroundColor: Colors.gray[50],
  },

  promoInputRTL: {
    textAlign: 'right',
  },

  applyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  applyButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
  },

  promoError: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 48,
  },

  appliedPromoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
    padding: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },

  appliedPromoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  sparkleContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  appliedPromoText: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: '700' as const,
  },

  appliedPromoDiscount: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    fontWeight: '600' as const,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  removePromoBtn: {
    padding: 4,
  },

  shippingProgressCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  shippingProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  shippingProgressText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500' as const,
  },

  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  summarySection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  summaryLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },

  summaryValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },

  shippingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  freeShippingValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.success,
  },

  shippingCostContainer: {
    alignItems: 'flex-end',
  },

  distanceText: {
    fontSize: FontSizes.xs,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },

  estimatedDaysText: {
    fontSize: FontSizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },

  shippingInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },

  shippingInfoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500' as const,
  },

  discountLabel: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: '500' as const,
  },

  discountValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.success,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },

  totalAmount: {
    fontSize: FontSizes.xl,
    fontWeight: '700' as const,
    color: Colors.primary,
  },

  vatNoticeContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },

  vatNotice: {
    fontSize: FontSizes.xs,
    color: Colors.text.tertiary,
    textAlign: 'center' as const,
    fontStyle: 'italic',
  },

  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },

  checkoutButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadows.md,
  },

  checkoutButtonGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },

  checkoutButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  checkoutButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700' as const,
  },

  checkoutButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkoutButtonAmount: {
    color: Colors.white,
    fontSize: FontSizes.md + 1,
    fontWeight: '700' as const,
  },

  spacing: {
    height: 80,
  },
});