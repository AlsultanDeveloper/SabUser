// NotificationContext.tsx - dummy content
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/constants/notifications';
import { updateDocument, collections } from '@/constants/firestore';
import { useAuth } from './AuthContext';

interface NotificationData {
  orderId?: string;
  orderNumber?: string;
  type?: 'order_placed' | 'order_updated' | 'general';
  [key: string]: any;
}

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return;
    }

    registerForPushNotificationsAsync()
      .then(token => {
        console.log('Push token obtained:', token);
        setExpoPushToken(token);
      })
      .catch(error => {
        console.error('Failed to get push token:', error);
      });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received in foreground:', notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      const data = response.notification.request.content.data as NotificationData;
      
      if (data.orderId) {
        console.log('Navigate to order:', data.orderId);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const savePushTokenToUser = useCallback(async (userId: string, token: string) => {
    try {
      console.log('💾 Saving push token to user profile:', userId);
      await updateDocument(collections.users, userId, {
        pushToken: token,
        pushTokenUpdatedAt: new Date().toISOString(),
      });
      console.log('✅ Push token saved successfully');
    } catch (error) {
      console.error('❌ Error saving push token:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.uid && expoPushToken) {
      savePushTokenToUser(user.uid, expoPushToken);
    }
  }, [user, expoPushToken, savePushTokenToUser]);

  const sendLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: NotificationData
  ) => {
    if (Platform.OS === 'web') {
      console.log('Local notifications not supported on web');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      console.log('✅ Local notification sent');
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }, []);

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
    savePushTokenToUser,
  };
});
