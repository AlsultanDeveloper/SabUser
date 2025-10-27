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
        <SafeAreaView style={styles.headerContainer} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('order.orderTracking')}</Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
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
    ? `${t('order.estimatedDelivery')}: ${formatDate(order.estimatedDelivery)} at ${formatTime(order.estimatedDelivery)}`
    : '';

  const handleContactSupport = () => {
    Linking.openURL(`tel:${order.address.phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('order.orderTracking')}</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.trackingHeader}>
            <Text style={styles.trackingLabel}>{t('order.trackingNumber')}</Text>
            <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
          </View>
          
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          {expectedDeliveryTime && (
            <Text style={styles.deliveryTime}>{expectedDeliveryTime}</Text>
          )}
        </View>

        <View style={styles.timelineContainer}>
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
                        backgroundColor: isCompleted ? statusColor + '20' : Colors.gray[100],
                        borderColor: isCompleted ? statusColor : Colors.gray[300],
                      },
                    ]}
                  >
                    <Feather
                      name={statusIcon}
                      size={20}
                      color={isCompleted ? statusColor : Colors.gray[400]}
                    />
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: isCompleted ? statusColor : Colors.gray[200],
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.statusTitle,
                      { color: isCompleted ? Colors.text.primary : Colors.text.secondary },
                    ]}
                  >
                    {statusUpdate.description[language]}
                  </Text>
                  <Text style={styles.statusDate}>
                    {formatDate(statusUpdate.timestamp)}
                  </Text>
                  <Text style={styles.statusTime}>
                    {formatTime(statusUpdate.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Feather name="map-pin" size={20} color={Colors.primary} />
            <Text style={styles.addressTitle}>{t('order.deliveryAddress')}</Text>
          </View>
          <Text style={styles.addressName}>{order.address.fullName}</Text>
          <Text style={styles.addressText}>{order.address.address}</Text>
          <Text style={styles.addressText}>
            {order.address.city}, {order.address.country || 'Lebanon'}
          </Text>
        </View>

        <View style={styles.productSection}>
          <View style={styles.productHeader}>
            <Feather name="package" size={20} color={Colors.primary} />
            <Text style={styles.productHeaderText}>{t('order.products')}</Text>
          </View>
          <Text style={styles.itemCount}>
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} {t('common.item')}
          </Text>
          <Text style={styles.totalPrice}>
            {t('common.total')}: ${order.total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactSupport}
          activeOpacity={0.8}
        >
          <Feather name="phone" size={20} color={Colors.white} />
          <Text style={styles.contactButtonText}>{t('order.contactSupport')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => router.push(`/order/${order.id}` as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDetailsText}>{t('order.viewOrderDetails')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerContainer: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trackingHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trackingLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  orderNumber: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  deliveryTime: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  timelineContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: Spacing.lg,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    paddingTop: Spacing.xs,
  },
  statusTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  statusDate: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    marginBottom: 2,
  },
  statusTime: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  addressSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addressTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  addressName: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  productSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  productHeaderText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  itemCount: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  contactButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  viewDetailsButton: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.xl,
  },
  viewDetailsText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.primary,
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
});
