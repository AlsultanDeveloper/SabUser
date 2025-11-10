// 🛒 NEW CLEAN CART - بدون مشاكل Text Nodes
// ✨ Simple, Clean, and Error-Free Design

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { Colors } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';
import { getProductImageUrl } from '@/utils/imageHelper';

export default function NewCartScreen() {
  const router = useRouter();
  const { cart, cartTotal, formatPrice, removeFromCart, updateCartItemQuantity, t, language } = useApp();
  const { isAuthenticated } = useAuth();
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(productId), style: 'destructive' },
      ]
    );
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('auth.signInRequired'),
        'Please sign in to proceed with checkout',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('auth.signIn'), onPress: () => router.push('/auth/login' as any) },
        ]
      );
      return;
    }
    router.push('/checkout-details' as any);
  };

  // Empty Cart State
  if (!cart || cart.length === 0) {
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
            <View style={styles.headerView}>
              <View style={styles.headerPlaceholder} />
              <Text style={styles.gradientHeaderTitle}>{t('cart.title')}</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-outline" size={120} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
          <Text style={styles.emptySubtitle}>{t('cart.emptyDescription')}</Text>
          
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.shopButtonText}>{t('common.shopNow')}</Text>
              <Feather name="shopping-bag" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
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
          <View style={styles.headerView}>
            <View style={styles.headerPlaceholder} />
            <Text style={styles.gradientHeaderTitle}>{t('cart.title')}</Text>
            <View style={styles.headerRight}>
              <Text style={styles.itemCountBadge}>{cart.length}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              {/* Product Image */}
              <SafeImage
                uri={getProductImageUrl(item.product, 200)}
                style={styles.productImage}
                fallbackIconSize={30}
                fallbackIconName="image"
                showLoader={true}
                resizeMode="cover"
              />
              
              <View style={styles.itemDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {(() => {
                    const displayName = (item.product as any).displayName;
                    if (displayName && typeof displayName === 'string') {
                      return displayName;
                    }
                    if (typeof item.product.name === 'object' && item.product.name !== null) {
                      const localizedName = language === 'ar' ? item.product.name.ar : item.product.name.en;
                      return typeof localizedName === 'string' ? localizedName : 'Product';
                    }
                    if (typeof item.product.name === 'string') {
                      return item.product.name;
                    }
                    return 'Product';
                  })()}
                </Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>
                    {formatPrice((item.product as any).finalPrice || item.product.price)}
                  </Text>
                  {/* Show weight or pieces info */}
                  {(item.product as any).selectedWeight && (
                    <Text style={styles.unitInfo}>
                      {(item.product as any).selectedWeight} {language === 'ar' ? 'كغ' : 'kg'}
                    </Text>
                  )}
                  {(item.product as any).selectedPieces && (
                    <Text style={styles.unitInfo}>
                      {(item.product as any).selectedPieces} {language === 'ar' ? 'قطعة' : 'pcs'}
                    </Text>
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
                    <Feather name="minus" size={12} color="#6B7280" />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Feather name="plus" size={12} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveItem(item.product.id)}
              >
                <Feather name="trash-2" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom: Order Summary + Checkout Button */}
      <View style={styles.bottomContainer}>
        {/* Order Summary - قابل للطي */}
        {isOrderSummaryExpanded && (
          <View style={styles.expandedSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.shipping')}</Text>
              <Text style={styles.summaryValue}>{t('cart.free')}</Text>
            </View>

            <View style={styles.divider} />
          </View>
        )}

        {/* Order Total - قابل للضغط */}
        <TouchableOpacity 
          style={styles.summaryHeader}
          onPress={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('cart.orderTotal')}</Text>
            <Feather 
              name={isOrderSummaryExpanded ? 'chevron-up' : 'chevron-down'} 
              size={18} 
              color="#6B7280" 
            />
          </View>
          <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
        </TouchableOpacity>

        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checkoutGradient}
          >
            <Text style={styles.checkoutButtonText}>{t('cart.proceedToCheckout')}</Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: 12,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerPlaceholder: {
    width: 40,
  },
  gradientHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  itemCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold' as const,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 32,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  shopButton: {
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    gap: 12,
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 3,
  },
  priceContainer: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitInfo: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFF',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 2,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 24,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  deleteButton: {
    padding: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 6,
  },
  brandText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  separator: {
    fontSize: 11,
    color: '#D1D5DB',
    marginHorizontal: 5,
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
    marginBottom: 6,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  expandedSummary: {
    paddingBottom: 8,
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 12,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 100,
  },
});