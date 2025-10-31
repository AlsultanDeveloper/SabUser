/**
 * Firebase Cloud Functions v2
 */

const {onDocumentUpdated, onDocumentCreated} = require('firebase-functions/v2/firestore');
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
