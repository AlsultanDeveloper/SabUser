import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';

interface CartItemCardProps {
  item: any;
  language: string;
  formatPrice: (price: number) => string;
  onRemove: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
}

function CartItemCard({ item, language, formatPrice, onRemove, onQuantityChange }: CartItemCardProps) {
  const finalPrice = item.product.discount
    ? item.product.price * (1 - item.product.discount / 100)
    : item.product.price;

  return (
    <View style={styles.cartItem}>
      <SafeImage uri={item.product.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product.name[language]}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(finalPrice)}</Text>
        {item.product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.product.discount}%</Text>
          </View>
        )}
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            onRemove(item.product.id);
          }}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={18} color={Colors.accent} />
        </TouchableOpacity>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => onQuantityChange(item.product.id, item.quantity - 1)}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={16} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => onQuantityChange(item.product.id, item.quantity + 1)}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={16} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { t, cart, cartTotal, formatPrice, updateCartItemQuantity, removeFromCart, language } = useApp();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleRemove = useCallback((productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    removeFromCart(productId);
  }, [removeFromCart]);

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateCartItemQuantity(productId, newQuantity);
  }, [updateCartItemQuantity]);

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="shopping-bag" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
          <Text style={styles.emptyDescription}>{t('cart.emptyDescription')}</Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              <Feather name="arrow-left" size={20} color={Colors.white} />
              <Text style={styles.continueButtonText}>{t('common.continueShopping')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cart.map((item) => (
          <CartItemCard
            key={item.product.id}
            item={item}
            language={language}
            formatPrice={formatPrice}
            onRemove={handleRemove}
            onQuantityChange={handleQuantityChange}
          />
        ))}
        <View style={styles.spacing} />
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.promoContainer}>
          <Feather name="tag" size={20} color={Colors.primary} />
          <Text style={styles.promoText}>{t('cart.freeDelivery')}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('cart.orderTotal')}</Text>
          <Text style={styles.totalAmount}>{formatPrice(cartTotal)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton} 
          activeOpacity={0.8}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            
            if (!isAuthenticated) {
              router.push('/auth/login' as any);
              return;
            }
            
            router.push('/checkout' as any);
          }}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButtonGradient}
          >
            <Feather name="check-circle" size={20} color={Colors.white} />
            <Text style={styles.checkoutButtonText}>{t('cart.proceedToCheckout')}</Text>
          </LinearGradient>
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

  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  continueButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  discountBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold' as const,
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    padding: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  quantityBtn: {
    padding: 8,
  },
  quantity: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  promoText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600' as const,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  totalAmount: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  checkoutButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  checkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
  },
  spacing: {
    height: Spacing.xl,
  },
});
