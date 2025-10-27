import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import type { Order } from '@/types';

export default function OrdersScreen() {
  const router = useRouter();
  const { t, formatPrice, language } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { orders, isLoading } = useOrders();

  const userOrders = useMemo(() => {
    if (!user?.uid) return [];
    return orders
      .filter(order => order.userId === user.uid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, user?.uid]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const itemsCount = item.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/order/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Feather name="package" size={24} color={Colors.primary} />
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Feather name="package" size={14} color={Colors.primary} />
            <Text style={styles.statusText}>{t('order.new')}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('common.date')}:</Text>
            <Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('common.items')}:</Text>
            <Text style={styles.infoValue}>{itemsCount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('common.total')}:</Text>
            <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => router.push(`/order/${item.id}` as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDetailsText}>{t('order.viewDetails')}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="package" size={64} color={Colors.gray[300]} />
            </View>
            <Text style={styles.emptyTitle}>{t('pages.signInRequired')}</Text>
            <Text style={styles.emptyText}>{t('pages.pleaseSignInToViewOrders')}</Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/auth/login' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>{t('account.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('pages.loading')}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (userOrders.length === 0) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="package" size={64} color={Colors.gray[300]} />
            </View>
            <Text style={styles.emptyTitle}>{t('pages.noOrdersYet')}</Text>
            <Text style={styles.emptyText}>
              {t('pages.noOrdersDescription')}
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)/home' as any)}
              activeOpacity={0.8}
            >
              <Feather name="shopping-bag" size={20} color={Colors.white} />
              <Text style={styles.shopButtonText}>{t('order.startShopping')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={userOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  listContent: {
    padding: Spacing.md,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  orderNumber: {
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  orderInfo: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
  totalValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  viewDetailsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
});
