// 🛒 PROFESSIONAL CART - عربة تسوق احترافية مثل أمازون ونون

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ShoppingCart, 
  Store, 
  ShoppingBag, 
  Truck, 
  Trash2, 
  Plus, 
  Minus,
  Package,
  Heart,
  Tag,
  Shield,
  Clock,
  ChevronRight,
  Gift,
  Percent,
  ArrowLeft,
} from 'lucide-react-native';

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';
import { getProductImageUrl } from '@/utils/imageHelper';
import type { CartItem } from '@/types';

const { width } = Dimensions.get('window');

// Shipping & Promo constants
const SAB_MARKET_SHIPPING = 5.00;
const OTHER_SHIPPING = 8.00;
const FREE_SHIPPING_THRESHOLD = 100.00;

export default function ProfessionalCartScreen() {
  const router = useRouter();
  const { 
    sabMarketCart, 
    otherCart, 
    formatPrice, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart,
    t, 
    isRTL 
  } = useApp();
  const { isAuthenticated } = useAuth();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  // Determine which cart has items
  const currentCart = sabMarketCart.length > 0 ? sabMarketCart : otherCart;
  const cartType: 'sab-market' | 'other' = sabMarketCart.length > 0 ? 'sab-market' : 'other';
  const isSabMarket = cartType === 'sab-market';

  // Calculate totals
  const subtotal = currentCart.reduce((total, item) => {
    const price = item.product.finalPrice || item.product.price;
    return total + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (isSabMarket ? SAB_MARKET_SHIPPING : OTHER_SHIPPING);
  const discount = appliedPromo ? (subtotal * appliedPromo.discount) : 0;
  const tax = subtotal * 0.00; // No tax for now
  const total = currentCart.length > 0 ? subtotal + shipping - discount + tax : 0;
  
  // Savings
  const itemsSavings = currentCart.reduce((savings, item) => {
    if (item.product.discount && item.product.discount > 0) {
      const originalPrice = item.product.price / (1 - item.product.discount / 100);
      return savings + ((originalPrice - item.product.price) * item.quantity);
    }
    return savings;
  }, 0);
  
  const totalSavings = itemsSavings + discount;

  // UI styling
  const cartColor = isSabMarket ? '#10B981' : '#0EA5E9';
  const CartIcon = isSabMarket ? Store : ShoppingBag;
  const cartTitle = isSabMarket
    ? (isRTL ? 'سلة Sab Market' : 'Sab Market Cart')
    : (isRTL ? 'سلة التسوق' : 'Shopping Cart');
  
  // Apply promo code
  const applyPromoCode = () => {
    const validCodes: { [key: string]: number } = {
      'SAVE10': 0.10,
      'SAVE20': 0.20,
      'WELCOME': 0.15,
      'FIRST': 0.25,
    };
    
    const upperCode = promoCode.toUpperCase();
    if (validCodes[upperCode]) {
      setAppliedPromo({ code: upperCode, discount: validCodes[upperCode] });
      Alert.alert(
        isRTL ? '✅ تم التطبيق' : '✅ Applied',
        isRTL ? `تم تطبيق كود الخصم ${upperCode}` : `Promo code ${upperCode} applied successfully`
      );
    } else {
      Alert.alert(
        isRTL ? '❌ خطأ' : '❌ Error',
        isRTL ? 'كود الخصم غير صالح' : 'Invalid promo code'
      );
    }
  };
  
  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      isRTL ? 'حذف المنتج' : 'Remove Item',
      isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to remove this item?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: isRTL ? 'حذف' : 'Remove', 
          onPress: () => removeFromCart(productId, cartType), 
          style: 'destructive' 
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      isRTL ? 'مسح السلة' : 'Clear Cart',
      isRTL ? 'هل أنت متأكد من مسح جميع المنتجات؟' : 'Are you sure you want to clear all items?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { 
          text: isRTL ? 'مسح' : 'Clear', 
          onPress: () => clearCart(cartType), 
          style: 'destructive' 
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        isRTL ? 'تسجيل الدخول مطلوب' : 'Login Required',
        isRTL ? 'يرجى تسجيل الدخول لإتمام عملية الشراء' : 'Please login to proceed with checkout',
        [
          { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
          { 
            text: isRTL ? 'تسجيل الدخول' : 'Login', 
            onPress: () => router.push('/auth/login' as any) 
          },
        ]
      );
      return;
    }
    
    router.push(`/checkout-details?cartType=${cartType}` as any);
  };

  // Empty cart state
  if (currentCart.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modernHeader}
        >
          <View style={[styles.headerContent, isRTL && styles.rowReverse]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
              {isRTL ? 'عربة التسوق' : 'Shopping Cart'}
            </Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <ShoppingCart size={80} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'عربتك فارغة!' : 'Your cart is empty!'}
          </Text>
          <Text style={[styles.emptySubtitle, isRTL && styles.rtlText]}>
            {isRTL 
              ? 'أضف منتجات رائعة إلى عربتك وابدأ التسوق الآن' 
              : 'Add amazing products to your cart and start shopping now'}
          </Text>
          
          <TouchableOpacity
            style={styles.startShoppingButton}
            onPress={() => router.push('/(tabs)/home' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradient.start, Colors.gradient.middle]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startShoppingGradient}
            >
              <Package size={22} color="#fff" />
              <Text style={styles.startShoppingText}>
                {isRTL ? 'ابدأ التسوق' : 'Start Shopping'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Cart with items
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={[styles.headerView, isRTL && styles.rowReverse]}>
            <View style={styles.headerPlaceholder} />
            <Text style={[styles.gradientHeaderTitle, isRTL && styles.rtlText]}>
              {isRTL ? 'السلة' : 'Cart'}
            </Text>
            <TouchableOpacity 
              onPress={handleClearCart}
              style={styles.clearAllButton}
            >
              <Trash2 size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cartSection}>
          {/* Cart Header */}
          <View style={[styles.sectionHeader, isRTL && styles.rowReverse]}>
            <View style={[styles.sectionIconContainer, { backgroundColor: cartColor + '20' }]}>
              <CartIcon size={24} color={cartColor} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
                {cartTitle}
              </Text>
              <Text style={[styles.sectionSubtitle, isRTL && styles.rtlText]}>
                {`${currentCart.length} ${isRTL ? 'منتج' : 'item'}${currentCart.length > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>

          {/* Cart Items */}
          {currentCart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <View style={[styles.cartItemContent, isRTL && styles.rowReverse]}>
                <View style={styles.imageContainer}>
                  <SafeImage
                    uri={getProductImageUrl(item.product)}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, isRTL && styles.rtlText]} numberOfLines={2}>
                    {item.product.name 
                      ? (isRTL ? (item.product.name.ar || item.product.name.en || 'منتج') : (item.product.name.en || item.product.name.ar || 'Product'))
                      : (isRTL ? 'منتج' : 'Product')
                    }
                  </Text>
                  
                  {!isSabMarket && item.product.vendorName && (
                    <Text style={[styles.vendorName, isRTL && styles.rtlText]}>
                      {isRTL ? 'البائع: ' : 'Vendor: '}{item.product.vendorName}
                    </Text>
                  )}

                  <View style={[styles.priceQuantityRow, isRTL && styles.rowReverse]}>
                    <Text style={styles.itemPrice}>
                      {formatPrice((item.product.finalPrice || item.product.price) * item.quantity)}
                    </Text>
                    
                    <View style={[styles.quantityControl, isRTL && styles.rowReverse]}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateCartItemQuantity(item.product.id, item.quantity - 1, cartType)}
                      >
                        <Minus size={16} color={Colors.text.primary} />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateCartItemQuantity(item.product.id, item.quantity + 1, cartType)}
                      >
                        <Plus size={16} color={Colors.text.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => handleRemoveItem(item.product.id)}
                  style={styles.removeButton}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Summary */}
          <View style={styles.summary}>
            <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
              <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>
                {isRTL ? 'المجموع الفرعي' : 'Subtotal'}
              </Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            
            <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
              <View style={[styles.summaryLabelContainer, isRTL && styles.rowReverse]}>
                <Truck size={16} color={Colors.text.secondary} />
                <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>
                  {isRTL ? 'رسوم التوصيل' : 'Shipping'}
                </Text>
              </View>
              <Text style={styles.summaryValue}>{formatPrice(shipping)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelBold, isRTL && styles.rtlText]}>
                {isRTL ? 'المجموع الكلي' : 'Total'}
              </Text>
              <Text style={[styles.summaryValue, styles.summaryValueBold]}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[cartColor, cartColor]}
              style={styles.checkoutGradient}
            >
              <Package size={20} color="#fff" />
              <Text style={styles.checkoutText}>
                {isRTL ? 'إتمام الطلب' : 'Checkout'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
  
  // Header
  gradientHeader: {
    paddingBottom: Spacing.lg,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerPlaceholder: {
    width: 40,
  },
  gradientHeaderTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: '#fff',
  },
  clearAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl * 2,
  },
  shopButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.xl * 1.5,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },

  // Cart Section
  cartSection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Cart Item
  cartItem: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[50],
    padding: Spacing.md,
  },
  cartItemContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  vendorName: {
    fontSize: FontSizes.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  itemPrice: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  removeButton: {
    padding: Spacing.sm,
  },

  // Summary
  summary: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  summaryLabelBold: {
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  summaryValue: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  summaryValueBold: {
    fontWeight: FontWeights.extrabold,
    fontSize: FontSizes.lg,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.sm,
  },

  // Checkout Button
  checkoutButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.md,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
  },
  checkoutText: {
    color: '#fff',
    fontSize: FontSizes.md,
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
