// 🛒 Modern Cart & Checkout - Inspired by Amazon, SHEIN & Max Fashion
// ✨ Clean, Modern, and Feature-Rich Design
// 📱 Total: ~350 lines (vs 1052 in old version)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import SafeImage from '@/components/SafeImage';
import { useProducts } from '@/hooks/useFirestore';
import { useSettings } from '@/hooks/useSettings';

export default function ModernCartScreen() {
  const router = useRouter();
  const { cart, cartTotal, formatPrice, removeFromCart, updateCartItemQuantity, language, addToCart } = useApp();
  const { isAuthenticated } = useAuth();
  const { shippingCost, freeShippingThreshold } = useSettings();
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showCoupon, setShowCoupon] = useState(false);

  // Fetch featured products for recommendations
  const { products: featuredProducts } = useProducts({ featured: true, limit: 10 });

  // Calculate shipping progress
  const shippingProgress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - cartTotal, 0);

  // Handle remove item with animation
  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(productId)
        },
      ]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to continue with checkout',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }
    
    // Navigate to address/payment page
    router.push('/checkout-details' as any);
  };

  // Apply coupon
  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'save10') {
      setDiscount(cartTotal * 0.1);
      Alert.alert('Success', 'Coupon applied! 10% off');
    } else {
      Alert.alert('Error', 'Invalid coupon code');
    }
  };

  const finalTotal = cartTotal - discount;

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Empty Cart */}
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-outline" size={120} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Add items to get started!</Text>
          
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home' as any)}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
              <Feather name="arrow-right" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Item Count Badge */}
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 ? (
          <View style={styles.shippingCard}>
            <View style={styles.shippingHeader}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#8B5CF6" />
              <Text style={styles.shippingText}>
                Add <Text style={styles.shippingAmount}>{formatPrice(remainingForFreeShipping)}</Text> for FREE shipping
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${shippingProgress}%` }]} />
            </View>
          </View>
        ) : (
          <View style={styles.freeShippingBadge}>
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text style={styles.freeShippingText}>🎉 You&apos;ve got FREE Shipping!</Text>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cart.map((item, index) => (
            <View key={item.product.id} style={styles.cartItem}>
              {/* Product Image */}
              <View style={styles.imageContainer}>
                <SafeImage
                  uri={item.product.images?.[0] || ''}
                  style={styles.productImage}
                />
              </View>

              {/* Product Details */}
              <View style={styles.itemDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {typeof item.product.name === 'object' 
                    ? item.product.name[language] || item.product.name.en || item.product.name.ar
                    : item.product.name
                  }
                </Text>
                
                {/* Size and Color */}
                <View style={styles.variantsRow}>
                  {(item as any).selectedSize && (
                    <View style={styles.variantBadge}>
                      <Text style={styles.variantLabel}>Size:</Text>
                      <Text style={styles.variantValue}>{(item as any).selectedSize}</Text>
                    </View>
                  )}
                  {(item as any).selectedColor && (
                    <View style={styles.variantBadge}>
                      <Text style={styles.variantLabel}>Color:</Text>
                      <Text style={styles.variantValue}>
                        {typeof (item as any).selectedColor === 'object' 
                          ? ((item as any).selectedColor[language] || (item as any).selectedColor.en)
                          : (item as any).selectedColor
                        }
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Price with discount */}
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>
                    {formatPrice(item.product.discount 
                      ? item.product.price * (1 - item.product.discount / 100)
                      : item.product.price
                    )}
                  </Text>
                  {item.product.discount && item.product.discount > 0 && (
                    <>
                      <Text style={styles.originalPrice}>
                        {formatPrice(item.product.price)}
                      </Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.product.discount}%</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      if (item.quantity > 1) {
                        updateCartItemQuantity(item.product.id, item.quantity - 1);
                      }
                    }}
                  >
                    <Feather name="minus" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Feather name="plus" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveItem(item.product.id)}
              >
                <Feather name="trash-2" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Coupon Section */}
        <TouchableOpacity
          style={styles.couponToggle}
          onPress={() => setShowCoupon(!showCoupon)}
        >
          <View style={styles.couponToggleLeft}>
            <MaterialCommunityIcons name="ticket-percent" size={24} color="#F59E0B" />
            <Text style={styles.couponToggleText}>Have a coupon code?</Text>
          </View>
          <Feather name={showCoupon ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
        </TouchableOpacity>

        {showCoupon && (
          <View style={styles.couponContainer}>
            <View style={styles.couponInputRow}>
              <View style={styles.couponInput}>
                <TextInput
                  placeholder="Enter code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  style={styles.couponInputText}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity style={styles.applyButton} onPress={applyCoupon}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {discount > 0 && (
              <View style={styles.discountApplied}>
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text style={styles.discountAppliedText}>
                  Coupon applied! Saved {formatPrice(discount)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                -{formatPrice(discount)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: remainingForFreeShipping > 0 ? '#6B7280' : '#10B981' }]}>
              {remainingForFreeShipping > 0 ? formatPrice(shippingCost) : 'FREE'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(finalTotal + (remainingForFreeShipping > 0 ? shippingCost : 0))}
            </Text>
          </View>
        </View>

        {/* You May Also Like - Recommended Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
              <MaterialCommunityIcons name="star-circle-outline" size={24} color="#8B5CF6" />
              <Text style={styles.recommendedTitle}>You May Also Like</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedScroll}
            >
              {featuredProducts && featuredProducts.slice(0, 8).map((product) => {
                if (!product || !product.name) return null;
                
                const productName = typeof product.name === 'object' 
                  ? (product.name[language] || product.name.en || product.name.ar || '')
                  : (product.name || '');
                
                const finalPrice = product.discount 
                  ? product.price * (1 - product.discount / 100)
                  : product.price;

                // Ensure we have valid numbers
                if (!finalPrice || isNaN(finalPrice) || !product.price || isNaN(product.price)) {
                  console.warn('Invalid price data for product:', product.id);
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.recommendedCard}
                    onPress={() => router.push(`/product/${product.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recommendedImageContainer}>
                      <SafeImage
                        uri={product.images?.[0] || product.image || ''}
                        style={styles.recommendedImage}
                      />
                      {product.discount && product.discount > 0 && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedBadgeText}>
                            -{product.discount}%
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.recommendedInfo}>
                      <Text style={styles.recommendedName} numberOfLines={2}>
                        {productName}
                      </Text>
                      
                      <View style={styles.recommendedPriceRow}>
                        <Text style={styles.recommendedPrice}>
                          {formatPrice(finalPrice)}
                        </Text>
                        {product.discount && product.discount > 0 && (
                          <Text style={styles.recommendedOldPrice}>
                            {formatPrice(product.price)}
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.quickAddButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                          Alert.alert('Added to Cart', `${productName} has been added to your cart!`);
                        }}
                      >
                        <Feather name="shopping-cart" size={14} color="#8B5CF6" />
                        <Text style={styles.quickAddText}>Quick Add</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Checkout Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomTotal}>
              {formatPrice(finalTotal + (remainingForFreeShipping > 0 ? shippingCost : 0))}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Feather name="arrow-right" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  itemCountBadge: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  itemCountText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  cartHeader: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  shippingCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shippingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shippingText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  shippingAmount: {
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  freeShippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
  },
  freeShippingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  variantsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  variantLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  variantValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 16,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  couponToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  couponContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  couponInputText: {
    fontSize: 14,
    color: '#1F2937',
  },
  applyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  discountApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  discountAppliedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  // Recommended Products Styles
  recommendedSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  recommendedScroll: {
    paddingHorizontal: 16,
  },
  recommendedCard: {
    width: 150,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recommendedImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  recommendedInfo: {
    padding: 10,
  },
  recommendedName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 16,
  },
  recommendedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
    marginRight: 6,
  },
  recommendedOldPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 7,
    borderRadius: 8,
  },
  quickAddText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 0,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  bottomLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  bottomTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  checkoutButton: {
    flex: 1,
    marginLeft: 16,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  shopButton: {
    width: '100%',
    maxWidth: 300,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
});
