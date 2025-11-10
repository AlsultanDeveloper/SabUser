// notifications.tsx - dummy content
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDocuments, collections, where, orderBy, updateDocument, deleteDocument } from '@/constants/firestore';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';


interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'order' | 'promotion' | 'system';
  orderId?: string;
  supportMessageId?: string;
}

export default function NotificationsScreen() {
  const { t } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الإشعارات من Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      // ✅ CRITICAL CHECK: Only fetch if user is authenticated
      if (!user?.uid) {
        console.log('ℹ️ User not authenticated, skipping notifications fetch');
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 Fetching notifications for user:', user.uid);
        
        const userNotifs = await getDocuments(collections.userNotifications, [
          where('userId', '==', user.uid),
          orderBy('createdAt', 'asc'),
        ]);

        console.log(`✅ Fetched ${userNotifs.length} notifications`);

        const formattedNotifs: Notification[] = userNotifs.reverse().map((notif: any) => ({
          id: notif.id,
          title: notif.title || 'إشعار',
          message: notif.replyText || notif.message?.ar || notif.message?.en || '',
          timestamp: notif.createdAt?.toDate() || new Date(),
          read: notif.read || false,
          type: notif.type === 'support_reply' ? 'system' : 'order',
          orderId: notif.orderId,
          supportMessageId: notif.supportMessageId,
        }));

        setNotifications(formattedNotifs);
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleNotificationPress = async (notification: Notification) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Update read status in Firestore
    try {
      await updateDocument(collections.userNotifications, notification.id, {
        read: true,
      });
      console.log('✅ Notification marked as read in Firestore:', notification.id);
    } catch (error) {
      console.error('❌ Error updating notification in Firestore:', error);
    }

    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    
    // توجيه حسب نوع الإشعار
    if (notification.type === 'order' && notification.orderId) {
      // فتح صفحة تفاصيل الطلب المحدد
      router.push(`/order/${notification.orderId}` as any);
    } else if (notification.type === 'system' && notification.supportMessageId) {
      // فتح صفحة الدعم (يمكنك تعديل هذا حسب الحاجة)
      router.push('/contact-support' as any);
    } else if (notification.type === 'order') {
      // إذا لم يكن هناك orderId، اذهب لقائمة الطلبات
      router.push('/(tabs)/orders' as any);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Update all notifications in Firestore
    try {
      const updatePromises = notifications
        .filter(n => !n.read)
        .map(n => updateDocument(collections.userNotifications, n.id, { read: true }));
      
      await Promise.all(updatePromises);
      console.log('✅ All notifications marked as read in Firestore');
    } catch (error) {
      console.error('❌ Error marking all as read in Firestore:', error);
    }

    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Delete all notifications from Firestore
    try {
      const deletePromises = notifications.map(n => 
        deleteDocument(collections.userNotifications, n.id)
      );
      
      await Promise.all(deletePromises);
      console.log('✅ All notifications deleted from Firestore');
    } catch (error) {
      console.error('❌ Error deleting notifications from Firestore:', error);
    }

    // Clear local state
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ${t('notifications.ago')}`;
    } else if (hours < 24) {
      return `${hours}h ${t('notifications.ago')}`;
    } else {
      return `${days}d ${t('notifications.ago')}`;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'package';
      case 'promotion':
        return 'tag';
      case 'system':
        return 'info';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return Colors.primary;
      case 'promotion':
        return Colors.accent;
      case 'system':
        return Colors.secondary;
      default:
        return Colors.gray[400];
    }
  };

  return (
    <View style={styles.container}>
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
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('account.notifications')}</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.emptyTitle, { marginTop: 16 }]}>جاري التحميل...</Text>
          </View>
        ) : (
          <>
            {notifications.length > 0 && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleMarkAllAsRead}
                  activeOpacity={0.7}
                >
                  <Feather name="check-circle" size={18} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>{t('notifications.markAllRead')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleClearAll}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={18} color={Colors.error} />
                  <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                    {t('notifications.clearAll')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="bell-off" size={80} color={Colors.gray[300]} />
                <Text style={styles.emptyTitle}>{t('notifications.noNotifications')}</Text>
                <Text style={styles.emptyDescription}>
                  {t('notifications.noNotificationsDesc')}
                </Text>
              </View>
            ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationCardUnread,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type) + '20' },
                  ]}
                >
                  <Feather
                    name={getNotificationIcon(notification.type) as any}
                    size={18}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  gradientHeader: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  unreadBadge: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: 'bold' as const,
  },
  scrollView: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
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
  notificationsList: {
    padding: Spacing.sm,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  notificationCardUnread: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '05',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginLeft: Spacing.xs,
  },
  notificationMessage: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
});
