// notifications.ts - Enhanced for background notifications
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ✅ إعداد معالج الإشعارات - يعمل حتى عند إغلاق التطبيق
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // ✅ عرض التنبيه
    shouldPlaySound: true,       // ✅ تشغيل الصوت
    shouldSetBadge: true,        // ✅ عرض badge على الأيقونة
    shouldShowBanner: true,      // ✅ عرض البانر (iOS)
    shouldShowList: true,        // ✅ عرض في قائمة الإشعارات
  }),
});

// ✅ إعداد القناة الافتراضية لـ Android (مهم للإشعارات في الخلفية)
async function setupAndroidNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'الإشعارات الافتراضية',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0EA5E9',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    // قناة للطلبات
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'إشعارات الطلبات',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#10B981',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    // قناة للعروض
    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'العروض والتخفيضات',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#F59E0B',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  // Skip on web
  if (Platform.OS === 'web') {
    console.log('⚠️ Push notifications not supported on web');
    return;
  }

  // Skip on Expo Go (development)
  if (!Device.isDevice) {
    console.log('⚠️ Push notifications require a physical device or standalone build');
    return;
  }

  // ✅ إعداد قنوات Android أولاً
  await setupAndroidNotificationChannel();

  // طلب الصلاحيات
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: false,
        provideAppNotificationSettings: true,
        allowProvisional: false,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('⚠️ Push notification permissions not granted');
    return;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) {
      console.log('⚠️ Project ID not found. Push notifications will not work.');
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log('✅ Push notification token:', token);
    console.log('✅ Notifications enabled (including when app is closed)');
  } catch (error: any) {
    // Silently handle errors in development
    if (__DEV__) {
      console.log('⚠️ Push notifications not available in Expo Go');
      console.log('💡 Use: eas build --profile development --platform android');
    } else {
      console.error('❌ Error getting push token:', error);
    }
    return undefined;
  }

  return token;
}

export async function schedulePushNotification(title: string, body: string, data?: any, channelId: string = 'default') {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      vibrate: [0, 250, 250, 250],
      badge: 1,
      ...(Platform.OS === 'android' && {
        channelId, // ✅ استخدام القناة المناسبة
      }),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });
}

// ✅ دالة لإرسال إشعار فوري (للاختبار)
export async function sendTestNotification() {
  await schedulePushNotification(
    'Sab Store',
    'مرحباً! هذا إشعار تجريبي. الإشعارات تعمل بشكل صحيح! ✅',
    { screen: 'home' },
    'default'
  );
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}
