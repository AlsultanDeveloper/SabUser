// notifications.tsx - dummy content
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getDocument, getDocuments, collections, where, orderBy } from '@/constants/firestore';
import { registerForPushNotificationsAsync } from '@/constants/notifications';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'order' | 'promotion' | 'system';
}

export default function NotificationsScreen() {
  const { t } = useApp();
  const { user } = useAuth();
  const { expoPushToken, savePushTokenToUser } = useNotifications();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    orders: true,
    promotions: true,
    system: true,
  });

  // جلب الإشعارات من Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userNotifs = await getDocuments(collections.userNotifications, [
          where('userId', '==', user.uid),
          orderBy('createdAt', 'asc'),
        ]);

        const formattedNotifs: Notification[] = userNotifs.reverse().map((notif: any) => ({
          id: notif.id,
          title: notif.title || 'إشعار',
          message: notif.replyText || notif.message?.ar || notif.message?.en || '',
          timestamp: notif.createdAt?.toDate() || new Date(),
          read: notif.read || false,
          type: notif.type === 'support_reply' ? 'system' : 'order',
        }));

        setNotifications(formattedNotifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // التحقق من Push Token
  const handleCheckPushToken = async () => {
    if (!user?.uid) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      // احصل على push token من Context
      const currentToken = expoPushToken;
      
      // احصل على push token من Firestore
      const userProfile = await getDocument(collections.users, user.uid);
      const savedToken = userProfile?.pushToken;
      
      let message = `معرف المستخدم: ${user.uid}\n\n`;
      message += `📱 Push Token الحالي:\n${currentToken || 'غير متوفر'}\n\n`;
      message += `💾 Token المحفوظ في Firestore:\n${savedToken || 'غير موجود'}\n\n`;
      
      if (currentToken && savedToken && currentToken === savedToken) {
        message += '✅ الحالة: Token مُسجل بنجاح!';
      } else if (currentToken && !savedToken) {
        message += '⚠️ الحالة: Token موجود لكن غير محفوظ!\nسيتم حفظه الآن...';
        await savePushTokenToUser(user.uid, currentToken);
        message += '\n✅ تم الحفظ!';
      } else if (!currentToken) {
        message += '❌ الحالة: لم يتم الحصول على Token\nتأكد من منح صلاحيات الإشعارات';
      } else {
        message += '⚠️ الحالة: Token مختلف، سيتم التحديث...';
        if (currentToken) {
          await savePushTokenToUser(user.uid, currentToken);
          message += '\n✅ تم التحديث!';
        }
      }
      
      Alert.alert('معلومات Push Token', message);
    } catch (error) {
      console.error('Error checking push token:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء التحقق من Token');
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    if (notification.type === 'order') {
      router.push('/(tabs)/orders' as any);
    }
  };

  const handleMarkAllAsRead = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setNotifications([]);
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
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

        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('notifications.settingsTitle')}</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="package" size={20} color={Colors.primary} />
                <Text style={styles.settingLabel}>{t('notifications.orderUpdates')}</Text>
              </View>
              <Switch
                value={settings.orders}
                onValueChange={() => handleToggleSetting('orders')}
                trackColor={{ false: Colors.gray[300], true: Colors.primary + '80' }}
                thumbColor={settings.orders ? Colors.primary : Colors.gray[100]}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="tag" size={20} color={Colors.accent} />
                <Text style={styles.settingLabel}>{t('notifications.promotions')}</Text>
              </View>
              <Switch
                value={settings.promotions}
                onValueChange={() => handleToggleSetting('promotions')}
                trackColor={{ false: Colors.gray[300], true: Colors.primary + '80' }}
                thumbColor={settings.promotions ? Colors.primary : Colors.gray[100]}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="info" size={20} color={Colors.secondary} />
                <Text style={styles.settingLabel}>{t('notifications.systemUpdates')}</Text>
              </View>
              <Switch
                value={settings.system}
                onValueChange={() => handleToggleSetting('system')}
                trackColor={{ false: Colors.gray[300], true: Colors.primary + '80' }}
                thumbColor={settings.system ? Colors.primary : Colors.gray[100]}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
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
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: Colors.white,
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
  settingsSection: {
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  debugButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  retryButton: {
    backgroundColor: Colors.secondary + '10',
    borderColor: Colors.secondary + '30',
  },
  settingsButton: {
    backgroundColor: Colors.accent + '10',
    borderColor: Colors.accent + '30',
  },
  debugButtonText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
});
