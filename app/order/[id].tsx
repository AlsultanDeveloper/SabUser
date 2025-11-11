// [id].tsx - dummy content
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, formatPrice, language } = useApp();
  const { getOrderById } = useOrders();

  const order = getOrderById(id || '');

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.headerContainer} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('order.orderDetails')}</Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('pages.orderNotFound')}</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string | Date | any) => {
    try {
      let date: Date;
      
      // Handle Firestore Timestamp
      if (dateString && typeof dateString === 'object' && 'toDate' in dateString) {
        date = dateString.toDate();
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${order.address.phoneNumber}`);
  };

  const handleTrackOrder = () => {
    router.push(`/order/track/${order.id}` as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
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
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('order.orderDetails')}</Text>
            <View style={styles.backButton} />
          </View>

          {/* Order Info Card */}
          <View style={styles.orderInfoCard}>
            <View style={styles.orderInfoRow}>
              <View>
                <Text style={styles.orderLabel}>{t('order.orderNumber')}</Text>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(order as any).isSabMarket && (
                  <View style={styles.sabMarketBadge}>
                    <Text style={styles.sabMarketText}>SAB Market</Text>
                  </View>
                )}
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {order.status === 'pending' && (language === 'ar' ? 'جديد' : 'New')}
                    {order.status === 'delivered' && (language === 'ar' ? 'تم التوصيل' : 'Delivered')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.orderMetaRow}>
              <View style={styles.metaItem}>
                <Feather name="clock" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{formatDate(order.createdAt)}</Text>
              </View>
              {order.trackingNumber && (
                <View style={styles.metaItem}>
                  <Feather name="hash" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{order.trackingNumber}</Text>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Products Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="shopping-bag" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>{t('order.products')}</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={index} style={styles.productRow}>
              <SafeImage
                uri={item.product.image}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {(() => {
                    if (typeof item.product.name === 'string') {
                      return item.product.name;
                    }
                    if (typeof item.product.name === 'object' && item.product.name !== null) {
                      const localizedName = item.product.name[language] || item.product.name.en;
                      return typeof localizedName === 'string' ? localizedName : 'Product';
                    }
                    return 'Product';
                  })()}
                </Text>
                
                {/* Product Details Badges */}
                {((item as any).selectedSize || (item as any).selectedColor || (item as any).selectedAge) && (
                  <View style={styles.productBadges}>
                    {(item as any).selectedSize && (
                      <View style={styles.badge}>
                        <Feather name="maximize-2" size={10} color={Colors.primary} />
                        <Text style={styles.badgeText}>{(item as any).selectedSize}</Text>
                      </View>
                    )}
                    {(item as any).selectedColor && (
                      <View style={styles.badge}>
                        {(item as any).selectedColor?.hex && (
                          <View style={[styles.colorDot, { backgroundColor: (item as any).selectedColor.hex }]} />
                        )}
                        <Text style={styles.badgeText}>
                          {typeof (item as any).selectedColor === 'object'
                            ? ((item as any).selectedColor[language] || (item as any).selectedColor.en)
                            : (item as any).selectedColor}
                        </Text>
                      </View>
                    )}
                    {(item as any).selectedAge && (
                      <View style={styles.badge}>
                        <Feather name="user" size={10} color={Colors.primary} />
                        <Text style={styles.badgeText}>{(item as any).selectedAge}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.productMeta}>
                  <Text style={styles.productQty}>{t('pages.qty')}: {item.quantity}</Text>
                  <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{language === 'ar' ? 'الإجمالي' : 'Total'}</Text>
            <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {/* Delivery Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>{t('order.deliveryInfo')}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>{order.address.fullName}</Text>
            <Text style={styles.infoText}>{order.address.address}</Text>
            <Text style={styles.infoText}>{order.address.city}, {order.address.country || 'Saudi Arabia'}</Text>
            <Text style={styles.infoText}>📱 {order.address.phoneNumber}</Text>
          </View>
          {order.estimatedDelivery && (
            <View style={styles.deliveryEstimate}>
              <Feather name="clock" size={16} color="#F59E0B" />
              <Text style={styles.deliveryText}>
                {(order as any).isSabMarket 
                  ? (language === 'ar' ? '⚡ توصيل سريع: 30 دقيقة' : '⚡ Express Delivery: 30 Minutes')
                  : `${language === 'ar' ? 'التوصيل المتوقع' : 'Est. Delivery'}: ${formatDate(order.estimatedDelivery)}`
                }
              </Text>
            </View>
          )}
        </View>

        {/* Payment Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="credit-card" size={20} color="#F59E0B" />
            <Text style={styles.cardTitle}>{t('order.paymentInfo')}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.infoText}>{t('order.cash')}</Text>
            <View style={[
              styles.paymentStatusBadge,
              { backgroundColor: order.paymentStatus === 'paid' ? '#DEF7EC' : '#FEF3C7' }
            ]}>
              <Text style={[
                styles.paymentStatusText,
                { color: order.paymentStatus === 'paid' ? '#03543F' : '#92400E' }
              ]}>
                {order.paymentStatus === 'paid' ? (language === 'ar' ? 'مدفوع' : 'Paid') : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]} 
          onPress={handleCallSupport}
        >
          <Feather name="phone" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>{language === 'ar' ? 'اتصل بالدعم' : 'Call Support'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.trackButton]} 
          onPress={handleTrackOrder}
        >
          <Feather name="navigation" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>{language === 'ar' ? 'تتبع الطلب' : 'Track Order'}</Text>
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
    paddingBottom: 20,
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
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  orderInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 3,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  sabMarketBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8,
  },
  sabMarketText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  orderMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  headerContainer: {
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  trackingText: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[200],
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  productQuantity: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  productPrice: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoCardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  paymentStatusLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  paymentStatus: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  buttonsContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: '#111827',
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productQty: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: '#111827',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  infoBlock: {
    gap: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  deliveryText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600' as const,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  trackButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
});
