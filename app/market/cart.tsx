// SAB Market Cart Screen
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
import { ShoppingBag, Trash2, Plus, Minus, Info, ArrowLeft, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useMarket } from '@/contexts/MarketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Stack } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';
import * as Location from 'expo-location';
import { calculateShipping, getDefaultShipping } from '@/utils/shippingCalculator';

interface MarketCartItem {
  id: string;
  name: any;
  price: number;
  image: string;
  weight?: string;
  quantity: number;
  discount?: number;
}

interface CartItemCardProps {
  item: MarketCartItem;
  language: string;
  onRemove: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  isRTL: boolean;
}

function CartItemCard({ item, language, onRemove, onQuantityChange, isRTL }: CartItemCardProps) {
  const finalPrice = item.discount
    ? item.price * (1 - item.discount / 100)
    : item.price;

  const productName = typeof item.name === 'string' 
    ? item.name 
    : item.name?.[language as 'en' | 'ar'] || item.name?.en || 'Product';

  return (
    <View style={styles.cartItem}>
      <View style={styles.cartItemContent}>
        <View style={styles.imageContainer}>
          <SafeImage uri={item.image} style={styles.productImage} />
          {(item.discount ?? 0) > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
                onRemove(item.id);
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color={Colors.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {item.weight && (
            <Text style={styles.brandText} numberOfLines={1}>
              {item.weight}
            </Text>
          )}

          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              {(item.discount ?? 0) > 0 && (
                <Text style={styles.originalPrice}>
                  ${item.price.toFixed(2)}
                </Text>
              )}
              <Text style={styles.productPrice}>${finalPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityBtn, item.quantity <= 1 && styles.quantityBtnDisabled]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onQuantityChange(item.id, item.quantity - 1);
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
                  onQuantityChange(item.id, item.quantity + 1);
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

export default function MarketCartScreen() {
  const { marketCart, marketCartTotal, updateMarketCartQuantity, removeFromMarketCart, language } = useMarket();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isRTL = language === 'ar';

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
      if (marketCart.length === 0) {
        setLoadingShipping(false);
        return;
      }

      try {
        setLoadingShipping(true);
        
        // Check if free shipping threshold is met
        if (marketCartTotal >= 30) {
          setShippingCost(0);
          setEstimatedDays('2-3');
          setShippingDistance(null);
          setLoadingShipping(false);
          return;
        }
        
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const shipping = await calculateShipping(
            location.coords.latitude,
            location.coords.longitude,
            marketCartTotal
          );
          
          setShippingCost(shipping.cost);
          setEstimatedDays(shipping.estimatedDays);
          setShippingDistance(shipping.distance);
        } else {
          // Use default shipping if no location permission
          const defaultShipping = await getDefaultShipping(marketCartTotal);
          setShippingCost(defaultShipping.cost);
          setEstimatedDays(defaultShipping.estimatedDays);
        }
      } catch (error) {
        console.log('Error calculating shipping:', error);
        // Use default shipping on error
        const defaultShipping = await getDefaultShipping(marketCartTotal);
        setShippingCost(defaultShipping.cost);
        setEstimatedDays(defaultShipping.estimatedDays);
      } finally {
        setLoadingShipping(false);
      }
    };

    calculateShippingCost();
  }, [marketCartTotal, marketCart.length]);

  const FREE_SHIPPING_THRESHOLD = 30;

  // Ensure valid numbers
  const safeCartTotal = typeof marketCartTotal === 'number' && !isNaN(marketCartTotal) ? marketCartTotal : 0;
  const safeShippingCost = typeof shippingCost === 'number' && !isNaN(shippingCost) ? shippingCost : 0;
  
  const subtotal = safeCartTotal;
  const total = subtotal + safeShippingCost;

  const handleRemove = useCallback((productId: string) => {
    removeFromMarketCart(productId);
  }, [removeFromMarketCart]);

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    updateMarketCartQuantity(productId, newQuantity);
  }, [updateMarketCartQuantity]);

  if (marketCart.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
      {/* Gradient Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA95F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerPlaceholder} />
            <Text style={styles.headerTitle}>
              {language === 'ar' ? 'سلة SAB Market' : 'SAB Market Cart'}
            </Text>
            <TouchableOpacity 
              style={styles.backToStoreButtonHeader}
              onPress={() => router.push('/' as any)}
            >
              <Text style={styles.backToStoreTextHeader}>Store</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>        <View style={styles.emptyContainer}>
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
            {language === 'ar' ? 'السلة فارغة' : 'Cart is Empty'}
          </Text>
          <Text style={styles.emptyDescription}>
            {language === 'ar' 
              ? 'أضف بعض المنتجات من SAB Market للبدء' 
              : 'Add some products from SAB Market to get started'}
          </Text>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push('/market' as any);
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#E63946']}
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
                {language === 'ar' ? 'تصفح SAB Market' : 'Browse SAB Market'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Gradient Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA95F']}
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
                {language === 'ar' ? 'سلة SAB Market' : 'SAB Market Cart'}
              </Text>
            </View>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCount}>
                {marketCart.length}
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
          {marketCart.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              language={language}
              onRemove={handleRemove}
              onQuantityChange={handleQuantityChange}
              isRTL={isRTL}
            />
          ))}
        </View>

        {subtotal < FREE_SHIPPING_THRESHOLD && shippingCost > 0 && !loadingShipping && (
          <View style={styles.shippingProgressCard}>
            <View style={styles.shippingProgressHeader}>
              <Info size={16} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.shippingProgressText}>
                {language === 'ar' 
                  ? `$${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} للشحن المجاني`
                  : `$${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} to free shipping`
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
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
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
            ) : safeShippingCost === 0 ? (
              <Text style={styles.freeShippingValue}>
                {language === 'ar' ? 'مجاناً' : 'Free'}
              </Text>
            ) : (
              <View style={styles.shippingCostContainer}>
                <Text style={styles.summaryValue}>${safeShippingCost.toFixed(2)}</Text>
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
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
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
            
            router.push('/market/checkout-details' as any);
          }}
        >
          <LinearGradient
            colors={['#FF6B35', '#E63946']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButtonGradient}
          >
            <View style={styles.checkoutButtonContent}>
              <Text style={styles.checkoutButtonText}>
                {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
              </Text>
              <View style={styles.checkoutButtonRight}>
                <Text style={styles.checkoutButtonAmount}>${total.toFixed(2)}</Text>
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

  backToStoreButtonHeader: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },

  backToStoreTextHeader: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
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

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
    color: '#FF6B35',
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
    tintColor: undefined,
  },

  decorativeCircle1: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C4220',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: 10,
    left: -5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#E6394630',
  },

  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
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

  cartItem: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  cartItemContent: {
    flexDirection: 'row',
    padding: Spacing.sm,
  },

  imageContainer: {
    position: 'relative',
    marginRight: Spacing.sm,
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
    color: '#FF6B35',
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
    backgroundColor: '#E63946',
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
    textAlign: 'center',
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
    color: '#FF6B35',
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
    backgroundColor: '#FF6B35',
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
    fontStyle: 'italic' as const,
  },

  estimatedDaysText: {
    fontSize: FontSizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
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
    color: '#FF6B35',
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
    textAlign: 'center',
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
