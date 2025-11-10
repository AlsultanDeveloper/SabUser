import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import type { OrderStatus } from '@/types';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useApp();
  const { getOrderById } = useOrders();

  const order = getOrderById(id || '');

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('order.orderTracking')}</Text>
              <View style={styles.backButton} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'delivered':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      case 'out_for_delivery':
      case 'shipped':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const getStatusIcon = (status: OrderStatus): keyof typeof Feather.glyphMap => {
    switch (status) {
      case 'delivered':
        return 'check-circle';
      case 'cancelled':
        return 'x-circle';
      case 'out_for_delivery':
        return 'truck';
      case 'shipped':
        return 'package';
      case 'processing':
        return 'loader';
      default:
        return 'clock';
    }
  };

  const currentStatusIndex = order.statusHistory.length - 1;
  const expectedDeliveryTime = order.estimatedDelivery 
    ? `${t('order.estimatedDelivery')}: ${formatDate(order.estimatedDelivery)}`
    : '';

  const handleContactSupport = () => {
    Linking.openURL(`tel:${order.address.phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('order.orderTracking')}</Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="navigation" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>{t('order.trackingNumber')}</Text>
          </View>
          <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('order.orderNumber')}</Text>
            <Text style={styles.infoValue}>{order.orderNumber}</Text>
          </View>
          {expectedDeliveryTime && (
            <View style={[styles.badge, styles.deliveryBadge]}>
              <Feather name="clock" size={14} color="#854D0E" />
              <Text style={styles.deliveryText}>{expectedDeliveryTime}</Text>
            </View>
          )}
        </View>

        {/* Status Timeline Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="activity" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>{t('order.status')}</Text>
          </View>
          <View style={styles.timeline}>
            {order.statusHistory.map((statusUpdate, index) => {
              const isLast = index === currentStatusIndex;
              const isCompleted = index <= currentStatusIndex;
              const statusColor = getStatusColor(statusUpdate.status);
              const statusIcon = getStatusIcon(statusUpdate.status);

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineIcon,
                        {
                          backgroundColor: isCompleted ? statusColor + '20' : '#F3F4F6',
                          borderColor: isCompleted ? statusColor : '#D1D5DB',
                        },
                      ]}
                    >
                      <Feather
                        name={statusIcon}
                        size={20}
                        color={isCompleted ? statusColor : '#9CA3AF'}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: isCompleted ? statusColor : '#E5E7EB',
                          },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.statusTitle,
                        { 
                          color: isCompleted ? '#1F2937' : '#6B7280',
                          fontWeight: isCompleted ? '600' : '400',
                        },
                      ]}
                    >
                      {statusUpdate.description[language]}
                    </Text>
                    <View style={styles.statusTimeContainer}>
                      <Text style={styles.statusDate}>
                        {formatDate(statusUpdate.timestamp)}
                      </Text>
                      <Text style={styles.statusDot}>•</Text>
                      <Text style={styles.statusTime}>
                        {formatTime(statusUpdate.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>{t('order.deliveryAddress')}</Text>
          </View>
          <Text style={styles.addressName}>{order.address.fullName}</Text>
          <Text style={styles.addressText}>{order.address.address}</Text>
          <Text style={styles.addressText}>
            {order.address.city}, {order.address.country || 'Lebanon'}
          </Text>
          <Text style={styles.phoneText}>
            <Feather name="phone" size={14} color="#6B7280" /> {order.address.phoneNumber}
          </Text>
        </View>

        {/* Products Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="package" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>{t('order.products')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('common.items')}:</Text>
            <Text style={styles.summaryValue}>
              {order.items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('common.total')}:</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <Feather name="phone" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>{t('order.contactSupport')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push(`/order/${order.id}` as any)}
            activeOpacity={0.8}
          >
            <Feather name="file-text" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>{t('order.viewOrderDetails')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  
  // Card Styles
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  
  // Tracking Info
  trackingNumber: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoLabel: {
    fontSize: FontSizes.xs,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  deliveryBadge: {
    backgroundColor: '#FEF3C7',
  },
  deliveryText: {
    fontSize: FontSizes.xs,
    color: '#854D0E',
    fontWeight: '600' as const,
  },
  
  // Timeline
  timeline: {
    marginTop: Spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: Spacing.md,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  timelineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 3,
    flex: 1,
    marginTop: Spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 6,
  },
  statusTitle: {
    fontSize: FontSizes.sm,
    marginBottom: 4,
  },
  statusTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDate: {
    fontSize: FontSizes.xs,
    color: '#10B981',
    fontWeight: '500' as const,
  },
  statusDot: {
    fontSize: FontSizes.xs,
    color: '#9CA3AF',
  },
  statusTime: {
    fontSize: FontSizes.xs,
    color: '#6B7280',
  },
  
  // Address
  addressName: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  addressText: {
    fontSize: FontSizes.xs,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 2,
  },
  phoneText: {
    fontSize: FontSizes.xs,
    color: '#6B7280',
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  // Products Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  totalLabel: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  
  // Action Buttons
  actionButtons: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: '#6B7280',
  },
});
