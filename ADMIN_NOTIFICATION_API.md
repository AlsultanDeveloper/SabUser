# 🔔 Admin Notification API Reference

Quick reference for sending push notifications from your admin dashboard.

## 📡 Direct Expo Push API

### Endpoint
```
POST https://exp.host/--/api/v2/push/send
```

### Headers
```json
{
  "Accept": "application/json",
  "Accept-encoding": "gzip, deflate",
  "Content-Type": "application/json"
}
```

### Single Notification Body
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxx]",
  "sound": "default",
  "title": "Order Shipped",
  "body": "Your order #ORD-123456 has been shipped",
  "data": {
    "orderId": "order_123",
    "orderNumber": "ORD-123456",
    "type": "order_updated"
  },
  "priority": "high",
  "channelId": "default"
}
```

### Bulk Notification Body
```json
[
  {
    "to": "ExponentPushToken[user1_token]",
    "title": "Flash Sale",
    "body": "50% off today only!",
    "sound": "default"
  },
  {
    "to": "ExponentPushToken[user2_token]",
    "title": "Flash Sale",
    "body": "50% off today only!",
    "sound": "default"
  }
]
```

## 🔥 Using Firebase Cloud Functions

### Install Dependencies
```bash
npm install firebase-functions firebase-admin
```

### Function: Auto-notify on Order Update
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.notifyOrderUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Only send if status changed
    if (beforeData.status === afterData.status) {
      return null;
    }
    
    const orderId = context.params.orderId;
    const userId = afterData.userId;
    const newStatus = afterData.status;
    const orderNumber = afterData.orderNumber;
    
    // Get user's push token
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (!userDoc.exists) {
      console.log('User not found');
      return null;
    }
    
    const pushToken = userDoc.data().pushToken;
    
    if (!pushToken) {
      console.log('No push token for user');
      return null;
    }
    
    // Status messages
    const statusMessages = {
      pending: 'Your order has been received',
      processing: 'We are preparing your items',
      shipped: 'Your order is on its way',
      out_for_delivery: 'Your order is out for delivery',
      delivered: 'Your order has been delivered',
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
    
    // Send notification
    const message = {
      to: pushToken,
      sound: 'default',
      title: `${statusEmojis[newStatus]} Order ${newStatus.toUpperCase()}`,
      body: `Order ${orderNumber}: ${statusMessages[newStatus]}`,
      data: {
        orderId: orderId,
        orderNumber: orderNumber,
        status: newStatus,
        type: 'order_updated'
      },
      priority: 'high',
      channelId: 'default'
    };
    
    try {
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
      console.log('Notification sent:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });
```

### Deploy Function
```bash
firebase deploy --only functions
```

## 🌐 Using REST API from Admin Dashboard

### Node.js Example
```javascript
const fetch = require('node-fetch');

async function sendOrderNotification(orderId) {
  // Get order from Firestore
  const orderDoc = await db.collection('orders').doc(orderId).get();
  const order = orderDoc.data();
  
  // Get user from Firestore
  const userDoc = await db.collection('users').doc(order.userId).get();
  const user = userDoc.data();
  
  if (!user.pushToken) {
    console.log('No push token');
    return;
  }
  
  // Send notification
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: user.pushToken,
      title: `Order ${order.status}`,
      body: `Your order ${order.orderNumber} is now ${order.status}`,
      data: { orderId, orderNumber: order.orderNumber }
    })
  });
  
  const result = await response.json();
  console.log('Notification result:', result);
}
```

### PHP Example
```php
<?php
function sendPushNotification($pushToken, $title, $body, $data = []) {
    $message = [
        'to' => $pushToken,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => $data,
        'priority' => 'high',
        'channelId' => 'default'
    ];
    
    $ch = curl_init('https://exp.host/--/api/v2/push/send');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Usage
$result = sendPushNotification(
    'ExponentPushToken[xxxxxxxxxxxxxx]',
    'Order Shipped',
    'Your order #ORD-123456 has been shipped',
    ['orderId' => 'order_123']
);
?>
```

### Python Example
```python
import requests
import json

def send_push_notification(push_token, title, body, data=None):
    url = 'https://exp.host/--/api/v2/push/send'
    
    message = {
        'to': push_token,
        'sound': 'default',
        'title': title,
        'body': body,
        'data': data or {},
        'priority': 'high',
        'channelId': 'default'
    }
    
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, json=message, headers=headers)
    return response.json()

# Usage
result = send_push_notification(
    'ExponentPushToken[xxxxxxxxxxxxxx]',
    'Order Shipped',
    'Your order #ORD-123456 has been shipped',
    {'orderId': 'order_123'}
)
print(result)
```

## 🎯 Common Use Cases

### 1. Notify User When Order Status Changes
```javascript
// Update order in Firestore
await db.collection('orders').doc(orderId).update({
  status: 'shipped',
  updatedAt: new Date()
});

// Get user's push token
const order = await db.collection('orders').doc(orderId).get();
const user = await db.collection('users').doc(order.data().userId).get();

// Send notification
await sendNotification(user.data().pushToken, {
  title: '🚚 Order Shipped',
  body: `Your order ${order.data().orderNumber} is on its way!`
});
```

### 2. Send Promotional Notification to All Users
```javascript
// Get all users with push tokens
const usersSnapshot = await db.collection('users')
  .where('pushToken', '!=', null)
  .get();

const tokens = usersSnapshot.docs.map(doc => doc.data().pushToken);

// Send bulk notification
const messages = tokens.map(token => ({
  to: token,
  title: '🎉 Flash Sale',
  body: '50% off all items for the next 24 hours!',
  sound: 'default'
}));

await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(messages)
});
```

### 3. Notify Users with Active Orders
```javascript
// Get orders that are not delivered
const ordersSnapshot = await db.collection('orders')
  .where('status', 'in', ['pending', 'processing', 'shipped'])
  .get();

// Get unique user IDs
const userIds = [...new Set(ordersSnapshot.docs.map(doc => doc.data().userId))];

// Get push tokens
const tokens = [];
for (const userId of userIds) {
  const userDoc = await db.collection('users').doc(userId).get();
  if (userDoc.data().pushToken) {
    tokens.push(userDoc.data().pushToken);
  }
}

// Send notification
const messages = tokens.map(token => ({
  to: token,
  title: '📦 Delivery Update',
  body: 'Track your order in real-time!',
  sound: 'default'
}));

await sendBulkNotification(messages);
```

## 📊 Response Format

### Success Response
```json
{
  "data": {
    "status": "ok",
    "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
  }
}
```

### Error Response
```json
{
  "data": {
    "status": "error",
    "message": "\"ExponentPushToken[...]\" is not a registered push notification recipient"
  }
}
```

## ⚠️ Important Notes

1. **Push Token Format**: Must start with `ExponentPushToken[`
2. **Rate Limits**: Expo recommends max 100 notifications per batch
3. **Token Expiry**: Tokens can expire, handle gracefully
4. **Priority**: Use `"high"` for important notifications
5. **Sound**: Use `"default"` or omit for device default sound
6. **Data**: Additional data for deep linking when notification tapped

## 🔒 Security Best Practices

1. **Never expose push tokens** in client-side code
2. **Validate user permissions** before sending notifications
3. **Rate limit** notification sending to prevent spam
4. **Log notification delivery** for debugging and analytics
5. **Handle failures gracefully** with retry logic

## 📈 Testing

### Test Single Notification
```bash
curl -X POST "https://exp.host/--/api/v2/push/send" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
    "title": "Test Notification",
    "body": "This is a test",
    "sound": "default"
  }'
```

## 🆘 Troubleshooting

### Notification Not Delivered
- ✅ Verify push token is valid and starts with `ExponentPushToken[`
- ✅ Check Expo Push API response for error messages
- ✅ Ensure device has internet connection
- ✅ Verify notification permissions are granted

### Token Invalid or Expired
- ✅ App should refresh token on login
- ✅ Remove invalid tokens from database
- ✅ Implement token rotation logic

## 📚 Resources

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push API Reference](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
