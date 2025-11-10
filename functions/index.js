/**
 * Firebase Cloud Functions v2
 */

const {onDocumentUpdated, onDocumentCreated} = require('firebase-functions/v2/firestore');
const {onCall} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2');
const admin = require('firebase-admin');

// Initialize with default credentials and ignore restrictions
admin.initializeApp({
  databaseURL: `https://sab-store-9b947.firebaseio.com`,
  projectId: 'sab-store-9b947'
});

// Disable Firestore settings that might cause issues
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

setGlobalOptions({maxInstances: 10});

exports.onSupportMessageReply = onDocumentUpdated('supportMessages/{messageId}', async (event) => {
  const messageId = event.params.messageId;
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  
  console.log('Support message updated:', messageId);
  
  if (!beforeData.reply && afterData.reply) {
    try {
      const userId = afterData.userId;
      if (!userId) {
        console.log('No userId found');
        return null;
      }
      
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.log('User not found');
        return null;
      }
      
      const pushToken = userDoc.data()?.pushToken;
      if (!pushToken) {
        console.log('No push token');
        return null;
      }
      
      const message = {
        to: pushToken,
        sound: 'default',
        title: 'رد من فريق الدعم',
        body: afterData.reply.substring(0, 100),
        data: {type: 'support_reply', supportMessageId: messageId},
        priority: 'high',
        channelId: 'default',
      };
      
      // حفظ الإشعار في userNotifications
      await admin.firestore().collection('userNotifications').add({
        userId: userId,
        type: 'support_reply',
        title: 'رد على رسالة الدعم | Support Reply',
        message: {
          ar: 'تم الرد على رسالتك',
          en: 'Your support message has been replied'
        },
        replyText: afterData.reply,
        supportMessageId: messageId,
        originalMessage: afterData.message || '',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(message),
      });
      
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  return null;
});

exports.onNewOrder = onDocumentCreated('orders/{orderId}', async (event) => {
  const orderId = event.params.orderId;
  const orderData = event.data.data();
  
  console.log('New order:', orderId);
  
  try {
    const admins = await admin.firestore()
      .collection('users')
      .where('role', '==', 'admin')
      .where('pushToken', '!=', null)
      .get();
    
    if (admins.empty) {
      console.log('No admins found');
      return null;
    }
    
    const tokens = admins.docs.map(doc => doc.data().pushToken).filter(t => t);
    if (tokens.length === 0) return null;
    
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: 'طلب جديد',
      body: 'Order ' + orderData.orderNumber,
      data: {type: 'new_order', orderId},
      priority: 'high',
      channelId: 'default',
    }));
    
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(messages),
    });
    
    console.log('Admin notifications sent');
  } catch (error) {
    console.error('Error:', error);
  }
  
  return null;
});

// إشعار المستخدم عند تحديث حالة الطلب
exports.onOrderStatusUpdate = onDocumentUpdated('orders/{orderId}', async (event) => {
  const orderId = event.params.orderId;
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  
  console.log('Order updated:', orderId);
  
  // تحقق إذا تغيرت الحالة
  if (beforeData.status !== afterData.status) {
    try {
      const userId = afterData.userId;
      if (!userId) {
        console.log('No userId found');
        return null;
      }
      
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.log('User not found');
        return null;
      }
      
      const pushToken = userDoc.data()?.pushToken;
      if (!pushToken) {
        console.log('No push token');
        return null;
      }
      
      // رسائل حسب الحالة
      const statusMessages = {
        'pending': 'طلبك قيد المراجعة',
        'processing': 'جاري تحضير طلبك',
        'shipped': 'تم شحن طلبك',
        'delivered': 'تم توصيل طلبك',
        'cancelled': 'تم إلغاء طلبك',
      };
      
      const statusMessage = statusMessages[afterData.status] || 'تحديث على طلبك';
      const orderNumber = afterData.orderNumber || orderId.substring(0, 8);
      
      const message = {
        to: pushToken,
        sound: 'default',
        title: `تحديث الطلب #${orderNumber} | Order Update`,
        body: statusMessage,
        data: {type: 'order_update', orderId: orderId},
        priority: 'high',
        channelId: 'default',
      };
      
      // حفظ الإشعار في userNotifications
      await admin.firestore().collection('userNotifications').add({
        userId: userId,
        type: 'order_update',
        title: `تحديث الطلب #${orderNumber} | Order Update`,
        message: {
          ar: statusMessage,
          en: `Your order has been ${afterData.status}`
        },
        orderId: orderId,
        orderStatus: afterData.status,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(message),
      });
      
      console.log('Order update notification sent');
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  return null;
});

// ============================================
// 🔐 Phone OTP Authentication System
// ============================================

/**
 * توليد كود OTP مكون من 6 أرقام وإرساله عبر Push Notification
 */
exports.sendPhoneOTP = onCall(async (request) => {
  try {
    const { phoneNumber, pushToken } = request.data;
    
    console.log('📱 Sending OTP to phone:', phoneNumber);
    
    // التحقق من البيانات
    if (!phoneNumber || !pushToken) {
      console.error('❌ Missing required fields');
      throw new Error('Phone number and push token are required');
    }
    
    // توليد كود OTP عشوائي من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 Generated OTP:', otp);
    
    // حفظ OTP في Firestore مع مدة صلاحية 5 دقائق
    const otpDoc = {
      phoneNumber: phoneNumber,
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 5 * 60 * 1000) // 5 دقائق
      ),
      verified: false,
      attempts: 0,
    };
    
    await admin.firestore()
      .collection('phoneOTPs')
      .doc(phoneNumber)
      .set(otpDoc);
    
    console.log('💾 OTP saved to Firestore');
    
    // إرسال Push Notification مع الكود
    const message = {
      to: pushToken,
      sound: 'default',
      title: 'رمز التحقق | Verification Code',
      body: `رمز التحقق الخاص بك: ${otp}\nYour verification code: ${otp}`,
      data: {
        type: 'phone_otp',
        otp: otp,
        phoneNumber: phoneNumber,
      },
      priority: 'high',
      channelId: 'default',
    };
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(message),
    });
    
    const result = await response.json();
    console.log('✅ Push notification sent:', result);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes in seconds
    };
    
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
});

/**
 * التحقق من كود OTP المدخل
 */
exports.verifyPhoneOTP = onCall(async (request) => {
  try {
    const { phoneNumber, otp } = request.data;
    
    console.log('🔍 Verifying OTP for phone:', phoneNumber);
    
    // التحقق من البيانات
    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP are required');
    }
    
    // جلب OTP من Firestore
    const otpDoc = await admin.firestore()
      .collection('phoneOTPs')
      .doc(phoneNumber)
      .get();
    
    if (!otpDoc.exists) {
      console.error('❌ No OTP found for this phone');
      throw new Error('No OTP found. Please request a new code.');
    }
    
    const otpData = otpDoc.data();
    
    // التحقق من عدد المحاولات
    if (otpData.attempts >= 5) {
      console.error('❌ Too many attempts');
      throw new Error('Too many attempts. Please request a new code.');
    }
    
    // التحقق من انتهاء الصلاحية
    const now = admin.firestore.Timestamp.now();
    if (now.toMillis() > otpData.expiresAt.toMillis()) {
      console.error('❌ OTP expired');
      await admin.firestore()
        .collection('phoneOTPs')
        .doc(phoneNumber)
        .delete();
      throw new Error('OTP expired. Please request a new code.');
    }
    
    // التحقق من الكود
    if (otpData.otp !== otp) {
      console.error('❌ Invalid OTP');
      
      // زيادة عدد المحاولات
      await admin.firestore()
        .collection('phoneOTPs')
        .doc(phoneNumber)
        .update({
          attempts: admin.firestore.FieldValue.increment(1)
        });
      
      throw new Error('Invalid OTP. Please try again.');
    }
    
    // الكود صحيح! تحديث الحالة
    await admin.firestore()
      .collection('phoneOTPs')
      .doc(phoneNumber)
      .update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    
    console.log('✅ OTP verified successfully');
    
    // البحث عن المستخدم أو إنشاء حساب جديد
    let userDoc = await admin.firestore()
      .collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();
    
    let userId;
    let isNewUser = false;
    
    if (userDoc.empty) {
      // إنشاء مستخدم جديد
      console.log('📝 Creating new user');
      isNewUser = true;
      
      const newUserRef = admin.firestore().collection('users').doc();
      userId = newUserRef.id;
      
      await newUserRef.set({
        uid: userId,
        phoneNumber: phoneNumber,
        phoneVerified: true,
        signInMethod: 'phone',
        displayName: phoneNumber,
        fullName: '',
        email: '',
        emailVerified: false,
        photoURL: '',
        
        preferences: {
          language: 'ar',
          currency: 'USD',
          notifications: {
            push: true,
            email: false,
            sms: true,
            orders: true,
            promotions: true,
          },
          theme: 'auto',
        },
        
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          wishlistCount: 0,
          loyaltyPoints: 0,
          membershipLevel: 'bronze',
        },
        
        status: {
          isActive: true,
          isVerified: true,
          isBlocked: false,
          twoFactorEnabled: false,
        },
        
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        
        metadata: {
          registrationSource: 'phone_otp',
          deviceInfo: {
            platform: 'mobile',
          },
        },
      });
      
      console.log('✅ New user created:', userId);
    } else {
      // تحديث آخر تسجيل دخول
      const existingUser = userDoc.docs[0];
      userId = existingUser.id;
      
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          phoneVerified: true,
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      
      console.log('✅ Existing user updated:', userId);
    }
    
    // حذف OTP بعد التحقق الناجح
    await admin.firestore()
      .collection('phoneOTPs')
      .doc(phoneNumber)
      .delete();
    
    return {
      success: true,
      message: 'Phone verified successfully',
      userId: userId,
      isNewUser: isNewUser,
      phoneNumber: phoneNumber,
    };
    
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    throw new Error(error.message || 'Failed to verify OTP');
  }
});

