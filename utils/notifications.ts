// notifications.ts - dummy content
import { getDocument, getDocuments, collections, where } from '@/constants/firestore';
import { sendPushNotification, sendBulkPushNotifications } from './notifications';

export async function notifyUserAboutOrderUpdate(
  orderId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
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
