// Modern Order Details with Timeline
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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('order.orderDetails')}</Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Feather name="package" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyText}>{t('pages.orderNotFound')}</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${order.address.phoneNumber}`);
  };

  const handleTrackOrder = () => {
    router.push(`/order/track/${order.id}` as any);
  };

  // Order status steps
  const orderSteps = [
    { key: 'pending', label: language === 'ar' ? 'قيد المعالجة' : 'Processing', icon: 'clock' },
    { key: 'confirmed', label: language === 'ar' ? 'مؤكد' : 'Confirmed', icon: 'check-circle' },
    { key: 'shipping', label: language === 'ar' ? 'قيد التوصيل' : 'Shipping', icon: 'truck' },
    { key: 'delivered', label: language === 'ar' ? 'تم التوصيل' : 'Delivered', icon: 'package' },
  ];

  const currentStepIndex = orderSteps.findIndex(step => step.key === order.status);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {order.status === 'pending' && (language === 'ar' ? 'جديد' : 'New')}
                  {order.status === 'confirmed' && (language === 'ar' ? 'مؤكد' : 'Confirmed')}
                  {order.status === 'shipping' && (language === 'ar' ? 'قيد التوصيل' : 'Shipping')}
                  {order.status === 'delivered' && (language === 'ar' ? 'تم التوصيل' : 'Delivered')}
                </Text>
              </View>
            </View>
            <View style={styles.orderMetaRow}>
              <View style={styles.metaItem}>
                <Feather name="clock" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="hash" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{order.trackingNumber}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>{language === 'ar' ? 'حالة الطلب' : 'Order Status'}</Text>
          <View style={styles.timeline}>
            {orderSteps.map((step, index) => (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View style={[
                    styles.timelineIcon,
                    index <= currentStepIndex && styles.timelineIconActive
                  ]}>
                    <Feather 
                      name={step.icon as any} 
                      size={16} 
                      color={index <= currentStepIndex ? '#FFF' : '#9CA3AF'}
                    />
                  </View>
                  {index < orderSteps.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      index < currentStepIndex && styles.timelineLineActive
                    ]} />
                  )}
                </View>
                <Text style={[
                  styles.timelineLabel,
                  index <= currentStepIndex && styles.timelineLabelActive
                ]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Products */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="shopping-bag" size={20} color="#8B5CF6" />
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
                  {typeof item.product.name === 'string'
                    ? item.product.name
                    : (item.product.name?.[language] || item.product.name?.en || 'Product')}
                </Text>
                
                {/* Product Details Badges */}
                {((item as any).selectedSize || (item as any).selectedColor || (item as any).selectedAge) && (
                  <View style={styles.productBadges}>
                    {(item as any).selectedSize && (
                      <View style={styles.badge}>
                        <Feather name="maximize-2" size={10} color="#6366F1" />
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
                        <Feather name="user" size={10} color="#6366F1" />
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

        {/* Delivery Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>{t('order.deliveryInfo')}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>{order.address.fullName}</Text>
            <Text style={styles.infoText}>{order.address.address}</Text>
            <Text style={styles.infoText}>{order.address.city}, {order.address.country}</Text>
            <Text style={styles.infoText}>📱 {order.address.phoneNumber}</Text>
          </View>
          {order.estimatedDelivery && (
            <View style={styles.deliveryEstimate}>
              <Feather name="clock" size={16} color="#F59E0B" />
              <Text style={styles.deliveryText}>
                {language === 'ar' ? 'التوصيل المتوقع' : 'Est. Delivery'}: {formatDate(order.estimatedDelivery)}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Info */}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  orderInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  timeline: {
    marginTop: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#8B5CF6',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: '#8B5CF6',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timelineLabelActive: {
    color: '#111827',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  productBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  infoBlock: {
    gap: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  deliveryText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  trackButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
