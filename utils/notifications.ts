// notifications.ts - dummy content
import { getDocument, getDocuments, collections, where } from '@/constants/firestore';
import { auth } from '@/constants/firebase';

/**
 * Send a push notification to a single device
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high' as const,
      channelId: 'default',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data?.status === 'error') {
      console.error('Push notification error:', result.data.message);
      return false;
    }

    console.log('✅ Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return false;
  }
}

/**
 * Send push notifications to multiple devices
 */
export async function sendBulkPushNotifications(
  expoPushTokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    const messages = expoPushTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high' as const,
      channelId: 'default',
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    await response.json();
    console.log('✅ Bulk push notifications sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending bulk push notifications:', error);
    return false;
  }
}

export async function notifyUserAboutOrderUpdate(
  orderId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    // ✅ التحقق من تسجيل الدخول
    if (!auth.currentUser) {
      console.warn('⚠️ User not authenticated - cannot access user data');
      return false;
    }

    const order = await getDocument(collections.orders, orderId);
    
    if (!order) {
      console.error('Order not found:', orderId);
      return false;
    }

    const userId = order.userId;
    const userProfile = await getDocument(collections.users, userId as string);
    
    if (!userProfile?.pushToken) {
      console.log('No push token found for user');
      return false;
    }

    await sendPushNotification(
      userProfile.pushToken as string,
      title,
      body,
      {
        type: 'admin_update',
        orderId,
        orderNumber: order.orderNumber,
      }
    );

    console.log('✅ Admin notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return false;
  }
}

export async function sendBulkNotificationToAllUsers(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    // ✅ التحقق من تسجيل الدخول
    if (!auth.currentUser) {
      console.warn('⚠️ User not authenticated - cannot access user data');
      return false;
    }

    const users = await getDocuments(collections.users, [
      where('pushToken', '!=', null),
    ]);

    const tokens = users
      .map(user => user.pushToken)
      .filter(token => token && typeof token === 'string') as string[];

    if (tokens.length === 0) {
      console.log('No users with push tokens found');
      return false;
    }

    await sendBulkPushNotifications(tokens, title, body, data);

    console.log(`✅ Bulk notification sent to ${tokens.length} users`);
    return true;
  } catch (error) {
    console.error('❌ Error sending bulk notification:', error);
    return false;
  }
}

export async function sendNotificationToUsersWithOrders(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    // ✅ التحقق من تسجيل الدخول
    if (!auth.currentUser) {
      console.warn('⚠️ User not authenticated - cannot access user data');
      return false;
    }

    const orders = await getDocuments(collections.orders, [
      where('status', 'in', ['pending', 'processing', 'shipped', 'out_for_delivery']),
    ]);

    const userIds = [...new Set(orders.map(order => order.userId))];

    const tokens: string[] = [];
    for (const userId of userIds) {
      const userProfile = await getDocument(collections.users, userId as string);
      if (userProfile?.pushToken) {
        tokens.push(userProfile.pushToken as string);
      }
    }

    if (tokens.length === 0) {
      console.log('No users with active orders and push tokens found');
      return false;
    }

    await sendBulkPushNotifications(tokens, title, body, data);

    console.log(`✅ Notification sent to ${tokens.length} users with active orders`);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification to users with orders:', error);
    return false;
  }
}

/**
 * Send notification to user when support replies to their message
 * This should be called from the admin panel when a support message is replied to
 */
export async function notifySupportMessageReply(
  supportMessageId: string,
  replyText: string
): Promise<boolean> {
  try {
    // ✅ التحقق من تسجيل الدخول
    if (!auth.currentUser) {
      console.warn('⚠️ User not authenticated - cannot access user data');
      return false;
    }

    // Get the support message
    const supportMessage = await getDocument(collections.supportMessages, supportMessageId);
    
    if (!supportMessage) {
      console.error('Support message not found:', supportMessageId);
      return false;
    }

    const userId = supportMessage.userId;
    
    // If no userId (guest message), we can't send push notification
    if (!userId) {
      console.log('No userId associated with support message, skipping notification');
      return false;
    }

    // Get user profile to get push token
    const userProfile = await getDocument(collections.users, userId as string);
    
    if (!userProfile?.pushToken) {
      console.log('No push token found for user');
      return false;
    }

    // Send push notification
    await sendPushNotification(
      userProfile.pushToken as string,
      '💬 رد من فريق الدعم | Support Reply',
      replyText.length > 100 ? replyText.substring(0, 97) + '...' : replyText,
      {
        type: 'support_reply',
        supportMessageId,
      }
    );

    console.log('✅ Support reply notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending support reply notification:', error);
    return false;
  }
}
