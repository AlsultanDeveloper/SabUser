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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('order.orderDetails')}</Text>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Feather name="clock" size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>{formatDate(order.createdAt)}</Text>
          </View>
          {order.trackingNumber && (
            <View style={styles.infoRow}>
              <Feather name="file-text" size={20} color={Colors.text.secondary} />
              <Text style={styles.infoText}>
                {t('order.trackingNumber')}: <Text style={styles.trackingText}>{order.trackingNumber}</Text>
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.products')}</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.productCard}>
              <SafeImage
                uri={item.product.image}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.product.name[language]}
                </Text>
                <Text style={styles.productQuantity}>
                  {t('pages.qty')}: {item.quantity}
                </Text>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.deliveryInfo')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Feather name="map-pin" size={20} color={Colors.primary} />
              <Text style={styles.infoCardTitle}>{t('pages.customAddress')}</Text>
            </View>
            <Text style={styles.addressText}>{order.address.fullName}</Text>
            <Text style={styles.addressText}>{order.address.address}</Text>
            <Text style={styles.addressText}>
              {order.address.city}, {order.address.country || 'Riyadh Region'}
            </Text>
          </View>

          {order.estimatedDelivery && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Feather name="clock" size={20} color={Colors.warning} />
                <Text style={styles.infoCardTitle}>{t('order.estimatedDelivery')}</Text>
              </View>
              <Text style={styles.addressText}>{formatDate(order.estimatedDelivery)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.paymentInfo')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Feather name="credit-card" size={20} color={Colors.success} />
              <Text style={styles.infoCardTitle}>{t('order.paymentMethod')}</Text>
            </View>
            <Text style={styles.addressText}>{t('order.cash')}</Text>
          </View>

          <View style={styles.paymentStatusContainer}>
            <Text style={styles.paymentStatusLabel}>{t('order.paymentStatus')}</Text>
            <Text style={[styles.paymentStatus, { color: Colors.warning }]}>
              {t('order.pending')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.contactInfo')}</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Feather name="phone" size={20} color={Colors.primary} />
              <Text style={styles.infoCardTitle}>{t('order.phone')}</Text>
            </View>
            <Text style={styles.addressText}>{order.address.phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={handleCallSupport}
            activeOpacity={0.8}
          >
            <Feather name="phone" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>{t('order.contactSupport')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.trackButton]}
            onPress={handleTrackOrder}
            activeOpacity={0.8}
          >
            <Feather name="map-pin" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>{t('order.viewOrderDetails')}</Text>
          </TouchableOpacity>
        </View>
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    flex: 1,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  callButton: {
    backgroundColor: Colors.success,
  },
  trackButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.white,
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
