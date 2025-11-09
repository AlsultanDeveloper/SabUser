# دليل إشعارات الدعم | Support Notifications Guide

## نظرة عامة | Overview

هذا الدليل يشرح كيفية إرسال إشعارات للمستخدمين عند الرد على رسائلهم في الدعم الفني.

This guide explains how to send notifications to users when replying to their support messages.

---

## البنية الأساسية | Basic Structure

### رسائل الدعم في Firestore

تُخزن رسائل الدعم في collection اسمه `supportMessages` بالهيكل التالي:

```json
{
  "id": "message_123",
  "userId": "user_456",  // معرف المستخدم
  "name": "Ahmed Mohammed",
  "email": "ahmed@example.com",
  "message": "لدي مشكلة في الطلب رقم ORD-12345",
  "status": "pending",  // pending | replied | resolved
  "read": false,
  "createdAt": "2025-10-31T10:00:00Z",
  "updatedAt": "2025-10-31T10:00:00Z",
  "reply": "تم الرد على استفسارك...",  // يُضاف عند الرد
  "repliedAt": "2025-10-31T12:00:00Z"  // يُضاف عند الرد
}
```

---

## كيفية إرسال الإشعار | How to Send Notification

### الطريقة 1: من Firebase Functions (موصى بها)

استخدم Firebase Cloud Functions للاستماع لتحديثات رسائل الدعم وإرسال الإشعارات تلقائياً:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// استمع لتحديثات رسائل الدعم
exports.onSupportMessageReply = functions.firestore
  .document('supportMessages/{messageId}')
  .onUpdate(async (change, context) => {
    const messageId = context.params.messageId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // تحقق إذا تم إضافة رد جديد
    if (!beforeData.reply && afterData.reply) {
      try {
        // احصل على معلومات المستخدم
        const userId = afterData.userId;
        
        if (!userId) {
          console.log('No userId, skipping notification');
          return null;
        }
        
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(userId)
          .get();
          
        const pushToken = userDoc.data()?.pushToken;
        
        if (!pushToken) {
          console.log('No push token found');
          return null;
        }
        
        // أرسل الإشعار
        const message = {
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
        
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        
        console.log('✅ Support reply notification sent');
        return null;
      } catch (error) {
        console.error('Error sending notification:', error);
        return null;
      }
    }
    
    return null;
  });
```

**نشر Firebase Function:**
```bash
firebase deploy --only functions:onSupportMessageReply
```

---

### الطريقة 2: من لوحة التحكم (Admin Panel)

إذا كان لديك لوحة تحكم للإدارة، يمكنك استدعاء الدالة مباشرة:

```typescript
import { notifySupportMessageReply } from '@/utils/notifications';

async function handleReplyToSupport(messageId: string, replyText: string) {
  try {
    // حدّث رسالة الدعم في Firestore
    await updateDocument(collections.supportMessages, messageId, {
      status: 'replied',
      reply: replyText,
      repliedAt: new Date().toISOString(),
    });
    
    // أرسل الإشعار للمستخدم
    const notificationSent = await notifySupportMessageReply(messageId, replyText);
    
    if (notificationSent) {
      console.log('✅ Reply saved and notification sent');
    } else {
      console.log('⚠️ Reply saved but notification not sent');
    }
  } catch (error) {
    console.error('❌ Error handling support reply:', error);
  }
}
```

---

### الطريقة 3: من HTTP API

يمكنك إنشاء API endpoint لإرسال الإشعارات:

```typescript
// api/support/reply.ts
import { notifySupportMessageReply } from '@/utils/notifications';
import { updateDocument, collections } from '@/constants/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { messageId, replyText } = req.body;
  
  try {
    // حدّث الرسالة
    await updateDocument(collections.supportMessages, messageId, {
      status: 'replied',
      reply: replyText,
      repliedAt: new Date().toISOString(),
    });
    
    // أرسل الإشعار
    const sent = await notifySupportMessageReply(messageId, replyText);
    
    return res.status(200).json({ 
      success: true, 
      notificationSent: sent 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

**استخدام الـ API:**
```bash
curl -X POST https://your-api.com/api/support/reply \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "message_123",
    "replyText": "شكراً على تواصلك. تم حل المشكلة..."
  }'
```

---

## معالجة الإشعار في التطبيق | Handling Notification in App

عند استلام الإشعار، يمكن توجيه المستخدم لشاشة الدعم:

```typescript
// في NotificationContext.tsx أو App.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

function App() {
  const router = useRouter();
  
  useEffect(() => {
    // استمع للنقر على الإشعارات
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        if (data.type === 'support_reply') {
          // انتقل لشاشة الدعم أو عرض الرد
          router.push('/contact-support');
        }
      }
    );
    
    return () => subscription.remove();
  }, []);
  
  return <YourApp />;
}
```

---

## إضافة شاشة عرض الردود | Adding Replies View Screen

يمكنك إنشاء شاشة لعرض رسائل الدعم والردود:

```typescript
// app/support-messages.tsx
import { useEffect, useState } from 'react';
import { getDocuments, collections, where } from '@/constants/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function SupportMessagesScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    loadMessages();
  }, []);
  
  const loadMessages = async () => {
    if (!user?.uid) return;
    
    const userMessages = await getDocuments(collections.supportMessages, [
      where('userId', '==', user.uid),
    ]);
    
    setMessages(userMessages);
  };
  
  return (
    <ScrollView>
      {messages.map(msg => (
        <View key={msg.id}>
          <Text>رسالتك: {msg.message}</Text>
          {msg.reply && (
            <View style={styles.replyBox}>
              <Text>رد الدعم: {msg.reply}</Text>
              <Text>{new Date(msg.repliedAt).toLocaleString()}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
```

---

## اختبار النظام | Testing the System

### 1. إرسال رسالة دعم من التطبيق

```typescript
// في contact-support.tsx (موجود بالفعل)
await createDocument('supportMessages', {
  name: 'Test User',
  email: 'test@example.com',
  message: 'اختبار رسالة دعم',
  userId: user?.uid || null,
  status: 'pending',
  read: false,
});
```

### 2. الرد من Firebase Console

1. افتح Firebase Console
2. اذهب لـ Firestore Database
3. افتح collection `supportMessages`
4. اختر الرسالة المطلوبة
5. أضف الحقول:
   - `reply`: "نص الرد هنا"
   - `status`: "replied"
   - `repliedAt`: التاريخ الحالي

### 3. اختبار يدوي للدالة

```typescript
import { notifySupportMessageReply } from '@/utils/notifications';

// اختبار إرسال إشعار
await notifySupportMessageReply('message_123', 'شكراً على تواصلك!');
```

---

## ملاحظات مهمة | Important Notes

### العربية:
- ✅ تأكد من أن المستخدم لديه `pushToken` في ملفه الشخصي
- ✅ الإشعارات تعمل فقط على الأجهزة الفعلية (ليس المحاكي)
- ✅ يجب منح صلاحيات الإشعارات في التطبيق
- ⚠️ الرسائل من الضيوف (بدون userId) لن تحصل على إشعارات
- 🔒 تأكد من تأمين Firebase Rules لحماية البيانات

### English:
- ✅ Ensure user has `pushToken` in their profile
- ✅ Notifications only work on physical devices (not simulator)
- ✅ App must have notification permissions granted
- ⚠️ Guest messages (without userId) won't receive notifications
- 🔒 Ensure Firebase Rules are secured to protect data

---

## Firebase Security Rules

تأكد من تطبيق هذه القواعد:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // رسائل الدعم
    match /supportMessages/{messageId} {
      // السماح بالقراءة فقط لصاحب الرسالة
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // السماح بالإنشاء للجميع (للضيوف أيضاً)
      allow create: if true;
      
      // السماح بالتحديث للإدارة فقط
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## دعم فني | Support

للمزيد من المساعدة، راجع:
- `NOTIFICATIONS_GUIDE.md` - دليل الإشعارات الشامل
- `FIRESTORE_STRUCTURE.md` - هيكل قاعدة البيانات
- Firebase Documentation: https://firebase.google.com/docs

---

**تاريخ آخر تحديث:** 31 أكتوبر 2025
