/**
 * Firebase Cloud Functions للتطبيق
 * Firebase Cloud Functions for the App
 * 
 * هذا الملف يحتوي على دوال سحابية تعمل تلقائياً عند حدوث أحداث معينة
 * This file contains cloud functions that run automatically on certain events
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * إرسال إشعار عند الرد على رسالة دعم
 * Send notification when replying to a support message
 * 
 * يتم تشغيل هذه الدالة تلقائياً عند تحديث أي مستند في collection supportMessages
 * This function triggers automatically when any document in supportMessages is updated
 */
exports.onSupportMessageReply = functions.firestore
  .document('supportMessages/{messageId}')
  .onUpdate(async (change, context) => {
    const messageId = context.params.messageId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    console.log(`Support message ${messageId} updated`);
    
    // تحقق إذا تم إضافة رد جديد
    // Check if a new reply was added
    if (!beforeData.reply && afterData.reply) {
      try {
        const userId = afterData.userId;
        
        // إذا لم يكن هناك userId (رسالة من ضيف)، لا نرسل إشعار
        // If there's no userId (guest message), skip notification
        if (!userId) {
          console.log('No userId associated with message, skipping notification');
          return null;
        }
        
        // احصل على معلومات المستخدم
        // Get user information
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(userId)
          .get();
        
        if (!userDoc.exists) {
          console.log('User not found:', userId);
          return null;
        }
        
        const pushToken = userDoc.data()?.pushToken;
        
        if (!pushToken) {
          console.log('No push token found for user:', userId);
          return null;
        }
        
        // جهز رسالة الإشعار
        // Prepare notification message
        const notificationMessage = {
          to: pushToken,
          sound: 'default',
          title: '💬 رد من فريق الدعم | Support Reply',
          body: afterData.reply.length > 100 
            ? afterData.reply.substring(0, 97) + '...' 
            : afterData.reply,
          data: {
            type: 'support_reply',
            supportMessageId: messageId,
          },
          priority: 'high',
          channelId: 'default',
        };
        
        // أرسل الإشعار عبر Expo Push Notification Service
        // Send notification via Expo Push Notification Service
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationMessage),
        });
        
        const result = await response.json();
        
        if (result.data?.status === 'error') {
          console.error('Push notification error:', result.data.message);
        } else {
          console.log('✅ Support reply notification sent successfully to user:', userId);
        }
        
        return null;
      } catch (error) {
        console.error('❌ Error sending support reply notification:', error);
        return null;
      }
    }
    
    return null;
  });

/**
 * إرسال إشعار عند إنشاء طلب جديد (للإدارة)
 * Send notification to admin when a new order is created
 * 
 * يمكنك استخدام هذه الدالة لإرسال إشعار لفريق الإدارة عند إنشاء طلب جديد
 * You can use this function to notify admin team when a new order is created
 */
exports.onNewOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const orderId = context.params.orderId;
    const orderData = snapshot.data();
    
    console.log(`New order created: ${orderId}`);
    
    try {
      // احصل على جميع المستخدمين الإداريين
      // Get all admin users
      const adminsSnapshot = await admin.firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .where('pushToken', '!=', null)
        .get();
      
      if (adminsSnapshot.empty) {
        console.log('No admin users with push tokens found');
        return null;
      }
      
      const adminTokens = adminsSnapshot.docs
        .map(doc => doc.data().pushToken)
        .filter(token => token);
      
      if (adminTokens.length === 0) {
        console.log('No valid admin push tokens found');
        return null;
      }
      
      // جهز رسالة الإشعار للإدارة
      // Prepare admin notification message
      const notificationMessages = adminTokens.map(token => ({
        to: token,
        sound: 'default',
        title: '🛒 طلب جديد | New Order',
        body: `Order ${orderData.orderNumber} - Total: $${orderData.total.toFixed(2)}`,
        data: {
          type: 'new_order',
          orderId: orderId,
          orderNumber: orderData.orderNumber,
        },
        priority: 'high',
        channelId: 'default',
      }));
      
      // أرسل الإشعارات
      // Send notifications
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationMessages),
      });
      
      console.log(`✅ New order notification sent to ${adminTokens.length} admins`);
      
      return null;
    } catch (error) {
      console.error('❌ Error sending new order notification:', error);
      return null;
    }
  });

/**
 * تنظيف الإشعارات القديمة (تشغيل مجدول)
 * Clean up old notifications (scheduled function)
 * 
 * تعمل هذه الدالة يومياً في منتصف الليل لحذف الإشعارات الأقدم من 30 يوم
 * This function runs daily at midnight to delete notifications older than 30 days
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule('0 0 * * *') // كل يوم في منتصف الليل | Every day at midnight
  .timeZone('Asia/Riyadh')
  .onRun(async (context) => {
    console.log('Starting cleanup of old notifications...');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const oldNotifications = await admin.firestore()
        .collection('notifications')
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();
      
      if (oldNotifications.empty) {
        console.log('No old notifications to delete');
        return null;
      }
      
      // حذف الإشعارات القديمة
      // Delete old notifications
      const batch = admin.firestore().batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`✅ Deleted ${oldNotifications.size} old notifications`);
      return null;
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
      return null;
    }
  });

/**
 * إرسال إشعار ترحيبي للمستخدمين الجدد
 * Send welcome notification to new users
 * 
 * يتم تشغيل هذه الدالة عند إنشاء مستخدم جديد
 * This function triggers when a new user is created
 */
exports.onNewUser = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    
    console.log(`New user created: ${userId}`);
    
    // انتظر قليلاً حتى يتم تسجيل push token
    // Wait a bit for push token to be registered
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      // احصل على push token المحدث
      // Get updated push token
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      const pushToken = userDoc.data()?.pushToken;
      
      if (!pushToken) {
        console.log('No push token found for new user yet');
        return null;
      }
      
      // أرسل رسالة ترحيبية
      // Send welcome message
      const welcomeMessage = {
        to: pushToken,
        sound: 'default',
        title: '🎉 مرحباً بك في متجر صاب | Welcome to Sab Store!',
        body: 'نحن سعداء بانضمامك! استكشف منتجاتنا واستمتع بالتسوق معنا.',
        data: {
          type: 'welcome',
        },
        priority: 'high',
        channelId: 'default',
      };
      
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(welcomeMessage),
      });
      
      console.log('✅ Welcome notification sent to new user:', userId);
      
      return null;
    } catch (error) {
      console.error('❌ Error sending welcome notification:', error);
      return null;
    }
  });
