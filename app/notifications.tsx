// notifications.tsx - dummy content
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
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
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [settings, setSettings] = useState({
    orders: true,
    promotions: true,
    system: true,
  });

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
                    size={20}
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

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('notifications.settingsTitle')}</Text>
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
    padding: Spacing.md,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  notificationCardUnread: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '05',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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
    fontSize: FontSizes.md,
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
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  notificationTime: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  settingsSection: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
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
