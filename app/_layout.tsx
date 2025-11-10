import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { 
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '@/constants/notifications';
import { autoCheckForUpdates, logUpdateInfo } from '@/utils/updateManager';

// Ignore Firebase WebChannel warnings - they are normal and Firebase reconnects automatically
LogBox.ignoreLogs([
  '@firebase/firestore: Firestore',
  'WebChannelConnection',
  'transport errored',
  'RPC',
  'stream',
  'Firestore (12.4.0): WebChannelConnection',
  'Unable to activate keep awake', // خطأ تطويري فقط - لا يؤثر على التطبيق
]);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="checkout-details"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Checkout',
          headerStyle: {
            backgroundColor: '#FFF',
          },
          headerTintColor: '#1F2937',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
          },
          headerShadowVisible: true,
        }}
      />
      <Stack.Screen
        name="addresses"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    SplashScreen.hideAsync();
    
    // طباعة معلومات التحديث
    logUpdateInfo();
    
    // التحقق التلقائي من التحديثات عند فتح التطبيق
    if (Platform.OS !== 'web') {
      autoCheckForUpdates().catch(error => {
        console.error('❌ Auto-update check failed:', error);
      });
    }
    
    if (Platform.OS === 'web') {
      return;
    }

    // Register for push notifications with error handling
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          console.log('✅ Push token registered:', token);
        } else {
          console.log('⚠️ Push token not available - notifications disabled');
        }
      })
      .catch(error => {
        console.error('❌ Failed to register push notifications:', error);
        // Don't crash the app, just log the error
      });

    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    responseListener.current = addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
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



  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <OrderProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
                <Toast />
              </GestureHandlerRootView>
            </OrderProvider>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

