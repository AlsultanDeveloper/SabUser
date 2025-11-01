// 🛒 NEW CLEAN CART - بدون مشاكل Text Nodes
// ✨ Simple, Clean, and Error-Free Design

import React from 'react';
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

export default function NewCartScreen() {
  const router = useRouter();
  const { cart, cartTotal, formatPrice, removeFromCart, updateCartItemQuantity, t } = useApp();
  const { isAuthenticated } = useAuth();

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
      <SafeAreaView style={styles.container} edges={[]}>
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
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.shopButtonText}>{t('common.shopNow')}</Text>
              <Feather name="shopping-bag" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="cart" size={28} color="#8B5CF6" />
            <Text style={styles.headerTitle}>{t('cart.title')}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.itemCount}>{cart.length} {cart.length === 1 ? t('common.item') : t('common.items')}</Text>
          </View>
        </View>

        {/* Cart Items - بطاقات المنتجات محذوفة */}
        <View style={styles.itemsContainer}>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <View style={styles.itemDetails}>
                <Text style={styles.productName}>
                  {t('cart.itemInCart')} {/* منتج في السلة */}
                </Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>
                    {formatPrice(item.product.price)}
                  </Text>
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

        {/* Spacer between items and summary */}
        <View style={{ height: 32 }} />

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('cart.orderTotal')}</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.shipping')}</Text>
            <Text style={styles.summaryValue}>{t('cart.free')}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('cart.orderTotal')}</Text>
            <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Checkout Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>{t('common.total')}</Text>
            <Text style={styles.bottomTotal}>{formatPrice(cartTotal)}</Text>
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
              <Text style={styles.checkoutButtonText}>{t('cart.proceedToCheckout')}</Text>
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
    shadowColor: '#8B5CF6',
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontWeight: '600',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
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
    marginBottom: 4,
  },
  priceContainer: {
    marginBottom: 10,
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 32,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  deleteButton: {
    padding: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 6,
  },
  brandText: {
    fontSize: 11,
    color: '#8B5CF6',
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  bottomTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    gap: 10,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});