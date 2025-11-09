/**
 * Firebase Cloud Functions for Push Notifications
 * 
 * This file contains example Cloud Functions that automatically send
 * push notifications when orders are updated in Firestore.
 * 
 * SETUP:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Initialize functions: firebase init functions
 * 4. Copy this code to functions/index.js
 * 5. Deploy: firebase deploy --only functions
 * 
 * IMPORTANT: Install dependencies in functions directory:
 * cd functions && npm install node-fetch
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

/**
 * Send notification when order status changes
 * Triggers: When any document in 'orders' collection is updated
 */
exports.notifyOrderStatusChange = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      
      // Only send if status actually changed
      if (beforeData.status === afterData.status) {
        console.log('Status unchanged, skipping notification');
        return null;
      }
      
      const orderId = context.params.orderId;
      const userId = afterData.userId;
      const newStatus = afterData.status;
      const orderNumber = afterData.orderNumber;
      
      console.log(`Order ${orderNumber} status changed: ${beforeData.status} → ${newStatus}`);
      
      // Get user's push token
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (!userDoc.exists) {
        console.error('User not found:', userId);
        return null;
      }
      
      const pushToken = userDoc.data().pushToken;
      
      if (!pushToken) {
        console.log('No push token for user:', userId);
        return null;
      }
      
      // Status descriptions
      const statusMessages = {
        pending: 'Order received and is being processed',
        processing: 'We are preparing your items for shipment',
        shipped: 'Your order is on its way to you',
        out_for_delivery: 'Your order is out for delivery',
        delivered: 'Your order has been delivered successfully',
        cancelled: 'Your order has been cancelled'
      };
      
      const statusEmojis = {
        pending: '⏳',
        processing: '📦',
        shipped: '🚚',
        out_for_delivery: '🛵',
        delivered: '✅',
        cancelled: '❌'
      };
      
      // Construct notification message
      const message = {
        to: pushToken,
        sound: 'default',
        title: `${statusEmojis[newStatus]} Order ${newStatus.replace('_', ' ').toUpperCase()}`,
        body: `Order ${orderNumber}: ${statusMessages[newStatus]}`,
        data: {
          orderId: orderId,
          orderNumber: orderNumber,
          status: newStatus,
          type: 'order_updated',
          timestamp: new Date().toISOString()
        },
        priority: 'high',
        channelId: 'default'
      };
      
      // Send notification via Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });
      
      const result = await response.json();
      
      if (result.data && result.data.status === 'error') {
        console.error('Notification error:', result.data.message);
        
        // If token is invalid, remove it from user profile
        if (result.data.message.includes('is not a registered push notification recipient')) {
          await admin.firestore()
            .collection('users')
            .doc(userId)
            .update({ pushToken: null });
          console.log('Removed invalid push token from user');
        }
        
        return null;
      }
      
      console.log('✅ Notification sent successfully:', result);
      
      // Log notification in Firestore for tracking
      await admin.firestore()
        .collection('notifications')
        .add({
          userId: userId,
          orderId: orderId,
          title: message.title,
          body: message.body,
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          pushNotificationId: result.data?.id
        });
      
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

/**
 * Send welcome notification when new user is created
 * Triggers: When a new document is created in 'users' collection
 */
exports.sendWelcomeNotification = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    try {
      const userData = snap.data();
      const pushToken = userData.pushToken;
      
      if (!pushToken) {
        console.log('No push token for new user');
        return null;
      }
      
      const message = {
        to: pushToken,
        sound: 'default',
        title: '🎉 Welcome to Sab Store!',
        body: 'Thank you for joining us. Start shopping and enjoy exclusive deals!',
        data: {
          type: 'welcome',
          userId: context.params.userId
        },
        priority: 'normal'
      };
      
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });
      
      const result = await response.json();
      console.log('Welcome notification sent:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return null;
    }
  });

/**
 * Send notification to all users (admin triggered)
 * Call via: functions.httpsCallable('sendBulkNotification')
 */
exports.sendBulkNotification = functions.https.onCall(async (data, context) => {
  // Verify admin authorization
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can send bulk notifications'
    );
  }
  
  try {
    const { title, body, dataPayload } = data;
    
    if (!title || !body) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Title and body are required'
      );
    }
    
    // Get all users with push tokens
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('pushToken', '!=', null)
      .get();
    
    const tokens = usersSnapshot.docs
      .map(doc => doc.data().pushToken)
      .filter(token => token);
    
    if (tokens.length === 0) {
      return { success: false, message: 'No users with push tokens found' };
    }
    
    console.log(`Sending bulk notification to ${tokens.length} users`);
    
    // Create notification messages
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: dataPayload || { type: 'bulk_notification' },
      priority: 'normal'
    }));
    
    // Send in batches of 100 (Expo's recommended batch size)
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch)
      });
      
      const result = await response.json();
      results.push(result);
      
      console.log(`Batch ${i / batchSize + 1} sent`);
    }
    
    return {
      success: true,
      message: `Notification sent to ${tokens.length} users`,
      results: results
    };
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Send custom notification to specific user (admin triggered)
 * Call via: functions.httpsCallable('sendNotificationToUser')
 */
exports.sendNotificationToUser = functions.https.onCall(async (data, context) => {
  // Verify admin authorization
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can send notifications'
    );
  }
  
  try {
    const { userId, title, body, dataPayload } = data;
    
    if (!userId || !title || !body) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userId, title, and body are required'
      );
    }
    
    // Get user's push token
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const pushToken = userDoc.data().pushToken;
    
    if (!pushToken) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User does not have a push token'
      );
    }
    
    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: dataPayload || { type: 'custom_notification' },
      priority: 'high'
    };
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });
    
    const result = await response.json();
    console.log('Notification sent to user:', result);
    
    return {
      success: true,
      message: 'Notification sent successfully',
      result: result
    };
  } catch (error) {
    console.error('Error sending notification to user:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Scheduled function: Send daily digest to users with pending orders
 * Runs every day at 9 AM UTC
 */
exports.sendDailyOrderDigest = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Running daily order digest');
      
      // Get all orders that are not delivered
      const ordersSnapshot = await admin.firestore()
        .collection('orders')
        .where('status', 'in', ['pending', 'processing', 'shipped', 'out_for_delivery'])
        .get();
      
      // Group orders by user
      const userOrders = {};
      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (!userOrders[order.userId]) {
          userOrders[order.userId] = [];
        }
        userOrders[order.userId].push(order);
      });
      
      // Send notification to each user
      const promises = Object.entries(userOrders).map(async ([userId, orders]) => {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(userId)
          .get();
        
        if (!userDoc.exists || !userDoc.data().pushToken) {
          return null;
        }
        
        const orderCount = orders.length;
        const message = {
          to: userDoc.data().pushToken,
          sound: 'default',
          title: '📦 Order Update',
          body: `You have ${orderCount} active order${orderCount > 1 ? 's' : ''}. Tap to view details.`,
          data: {
            type: 'daily_digest',
            orderCount: orderCount
          },
          priority: 'normal'
        };
        
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message)
        });
        
        return response.json();
      });
      
      const results = await Promise.all(promises);
      console.log(`Daily digest sent to ${results.filter(r => r).length} users`);
      
      return null;
    } catch (error) {
      console.error('Error sending daily digest:', error);
      return null;
    }
  });

/**
 * Clean up old notifications (runs weekly)
 * Removes notifications older than 30 days
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule('0 0 * * 0')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const oldNotifications = await admin.firestore()
        .collection('notifications')
        .where('sentAt', '<', thirtyDaysAgo)
        .get();
      
      const batch = admin.firestore().batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`Deleted ${oldNotifications.size} old notifications`);
      return null;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      return null;
    }
  });
