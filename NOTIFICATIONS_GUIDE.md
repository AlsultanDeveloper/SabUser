# 📬 Push Notifications Implementation Guide

## Overview

This application now has a complete push notification system that sends notifications when:
- A user places an order (order confirmation)
- An admin updates an order status (status updates)
- Admin sends custom notifications

## Architecture

### 1. **NotificationContext** (`contexts/NotificationContext.tsx`)
- Manages push token registration
- Handles notification listeners (foreground, background, tapped)
- Automatically saves push token to user profile in Firestore

### 2. **OrderContext** (`contexts/OrderContext.tsx`)
- Integrated with notification system
- Sends notification when order is created
- Sends notification when order status is updated
- Saves orders to Firestore for real-time sync

### 3. **Notification Utilities** (`utils/notifications.ts`)
- `sendPushNotification()` - Send notification to single device
- `sendBulkPushNotifications()` - Send notification to multiple devices

### 4. **Admin Utilities** (`utils/admin-notifications.ts`)
- `notifyUserAboutOrderUpdate()` - Notify specific user about order
- `sendBulkNotificationToAllUsers()` - Send to all users
- `sendNotificationToUsersWithOrders()` - Send to users with active orders

## How It Works

### On User Login/Signup
1. App requests notification permissions
2. Obtains Expo Push Token
3. Saves token to user profile in Firestore (`users/{userId}`)

### On Order Creation
1. Order is created and saved to AsyncStorage
2. Order is saved to Firestore (`orders/{orderId}`)
3. User's push token is retrieved from Firestore
4. Notification is sent: "🎉 Order Placed Successfully"

### On Order Status Update
1. Order status is updated in AsyncStorage
2. Order status is updated in Firestore
3. User's push token is retrieved from Firestore
4. Notification is sent with status emoji and description

### From Admin Dashboard
Admin can use the utility functions to:
- Update order status → triggers automatic notification
- Send custom notification to specific user
- Send bulk notifications to all users

## Testing Checklist

### ✅ Setup Requirements
- [ ] Physical Android/iOS device (Expo Go doesn't support push on emulators)
- [ ] Firebase configured with valid credentials
- [ ] App installed on device via Expo Go or dev build
- [ ] User logged in to save push token

### ✅ Test Scenarios

#### 1. Order Placement Notification
```typescript
// User places order
await createOrder(userId, items, total, address, paymentMethod);

// Expected: Notification appears
// Title: "🎉 Order Placed Successfully"
// Body: "Your order ORD-123456 has been received and is being processed."
```

#### 2. Order Status Update Notification
```typescript
// Admin updates order status
await updateOrderStatus(orderId, 'shipped');

// Expected: Notification appears
// Title: "🚚 Order SHIPPED"
// Body: "Order ORD-123456: Your order is on its way to you"
```

#### 3. Custom Admin Notification
```typescript
// Admin sends custom notification
import { notifyUserAboutOrderUpdate } from '@/utils/admin-notifications';

await notifyUserAboutOrderUpdate(
  orderId,
  '📦 Package Update',
  'Your package has arrived at the distribution center'
);
```

#### 4. Bulk Notification
```typescript
// Send to all users
import { sendBulkNotificationToAllUsers } from '@/utils/admin-notifications';

await sendBulkNotificationToAllUsers(
  '🎉 Flash Sale Alert!',
  '50% off on all electronics for the next 2 hours!'
);
```

## App States

### Foreground (App Open)
- Notification banner appears at top
- `NotificationContext` listener captures it
- Can navigate to relevant screen

### Background (App Minimized)
- Notification appears in notification tray
- User can tap to open app
- Response listener handles navigation

### Closed (App Not Running)
- Notification appears in notification tray
- User taps → App opens
- Response listener handles navigation

## Firestore Structure

### User Document (`users/{userId}`)
```json
{
  "email": "user@example.com",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxx]",
  "pushTokenUpdatedAt": "2025-01-15T10:30:00Z",
  ...
}
```

### Order Document (`orders/{orderId}`)
```json
{
  "id": "order_123",
  "orderNumber": "ORD-123456",
  "userId": "user_abc",
  "status": "shipped",
  "items": [...],
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": "2025-01-15T10:00:00Z",
      "description": {
        "en": "Order received and is being processed",
        "ar": "تم استلام طلبك وجاري معالجته"
      }
    },
    {
      "status": "shipped",
      "timestamp": "2025-01-15T12:00:00Z",
      "description": {
        "en": "Your order is on its way to you",
        "ar": "طلبك في طريقه إليك"
      }
    }
  ],
  ...
}
```

## Admin Dashboard Integration

### Option 1: Using Firebase Functions (Recommended)
Create a Cloud Function that listens for order updates:

```javascript
// Firebase Cloud Function
exports.sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newStatus = change.after.data().status;
    const userId = change.after.data().userId;
    
    // Get user's push token
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    const pushToken = userDoc.data().pushToken;
    
    if (pushToken) {
      // Send notification via Expo Push API
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: pushToken,
          title: `Order ${newStatus.toUpperCase()}`,
          body: `Your order status has been updated`,
          data: { orderId: context.params.orderId }
        })
      });
    }
  });
```

### Option 2: Direct API Call from Admin Panel
```javascript
// In your admin dashboard
async function updateOrderAndNotify(orderId, newStatus) {
  // Update order in Firestore
  await db.collection('orders').doc(orderId).update({
    status: newStatus,
    updatedAt: new Date().toISOString()
  });
  
  // Get user's push token
  const order = await db.collection('orders').doc(orderId).get();
  const user = await db.collection('users').doc(order.data().userId).get();
  
  if (user.data().pushToken) {
    // Send notification
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.data().pushToken,
        title: `Order ${newStatus.toUpperCase()}`,
        body: `Your order #${order.data().orderNumber} is now ${newStatus}`,
        data: { orderId }
      })
    });
  }
}
```

## Environment Variables

No additional environment variables needed! The system uses:
- Expo's built-in push notification service
- Firebase for storing push tokens
- Expo Push API for sending notifications

## Troubleshooting

### Push Token Not Obtained
- Check device permissions: Settings → App → Notifications → Allow
- Verify app is running on physical device (not simulator)
- Check console logs for permission errors

### Notifications Not Received
- Verify push token is saved in Firestore (`users/{userId}.pushToken`)
- Check notification is sent (console logs show ✅)
- Verify device has internet connection
- Check Expo Push API response for errors

### Notifications Work on One Platform, Not Another
- iOS: Ensure Apple Push Notification service is enabled
- Android: Ensure Firebase Cloud Messaging is configured
- Check platform-specific permissions in `app.json`

## Production Deployment

### For Standalone Apps (APK/IPA)
1. Build app with EAS Build
2. Configure FCM (Android) and APNs (iOS)
3. Update `app.json` with credentials
4. Test on production build

### Important Notes
- Expo Go has limitations with push notifications
- For full functionality, use EAS Build or bare React Native
- Push tokens expire - app auto-refreshes on login

## Best Practices

1. **Test on Physical Devices**: Emulators don't support push notifications
2. **Handle Errors Gracefully**: Network issues can prevent notifications
3. **Don't Spam Users**: Send meaningful notifications only
4. **Localization**: Support multiple languages (already implemented)
5. **Analytics**: Track notification delivery and engagement
6. **Rate Limiting**: Prevent sending too many notifications

## Next Steps

### Enhanced Features (Optional)
- [ ] Notification preferences in user settings
- [ ] Do Not Disturb hours
- [ ] Notification categories (orders, promotions, updates)
- [ ] Rich notifications (images, actions)
- [ ] Schedule notifications
- [ ] A/B testing notification content

### Analytics Integration
- [ ] Track notification open rate
- [ ] Track conversion from notification
- [ ] User engagement metrics

## Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
