import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const formatDate = (dateString: string | Date | any) => {
    try {
      let date: Date;
      
      // Handle Firestore Timestamp
      if (dateString && typeof dateString === 'object' && 'toDate' in dateString) {
        date = dateString.toDate();
      } 
      // Handle Date object
      else if (dateString instanceof Date) {
        date = dateString;
      } 
      // Handle string
      else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
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
            <Feather name="package" size={22} color={Colors.primary} />
            <Text style={styles.orderNumber} numberOfLines={1}>{item.orderNumber}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Feather name="package" size={12} color={Colors.primary} />
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
              <View style={styles.headerPlaceholder} />
              <Text style={styles.headerTitle}>{t('tabs.orders')}</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <SafeAreaView style={styles.content} edges={['bottom']}>
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
              <View style={styles.headerPlaceholder} />
              <Text style={styles.headerTitle}>{t('tabs.orders')}</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <SafeAreaView style={styles.content} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('pages.loading')}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (userOrders.length === 0) {
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
              <View style={styles.headerPlaceholder} />
              <Text style={styles.headerTitle}>{t('tabs.orders')}</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <SafeAreaView style={styles.content} edges={['bottom']}>
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
            <View style={styles.headerPlaceholder} />
            <Text style={styles.headerTitle}>{t('tabs.orders')}</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.content} edges={['bottom']}>
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderNumber: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  orderInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  viewDetailsText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: '#FFF',
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
