# 🔧 Wishlist Permissions Fix

## المشكلة
```
Error toggling wishlist: FirebaseError: Missing or insufficient permissions
Error creating document: FirebaseError: Missing or insufficient permissions
```

## الأسباب المحتملة

### 1️⃣ **المستخدم غير مسجل دخول بشكل كامل**
- Firebase Auth لم يكتمل بعد
- Token انتهت صلاحيته
- المستخدم في وضع Guest

### 2️⃣ **قواعد Firestore صارمة**
الحل موجود في `firestore.rules`:
```javascript
match /wishlists/{wishlistItemId} {
  allow read, delete: if request.auth != null && 
    (resource.data.userId == request.auth.uid || isUserAdmin());
  allow create: if request.auth != null && 
    request.resource.data.userId == request.auth.uid;
}
```

## ✅ الحلول المطبقة

### 1. **تحسين معالجة الأخطاء في `firestore.ts`**

```typescript
// قبل
catch (error) {
  console.error('Error creating document:', error);
  throw error;
}

// بعد
catch (error: any) {
  if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
    console.warn(`⚠️ Permission denied creating document`);
    throw new Error('You must be logged in to perform this action');
  }
  console.error('Error creating document:', error);
  throw error;
}
```

### 2. **التحقق من المصادقة قبل العمليات**

```typescript
const handleWishlist = async (productId: string) => {
  // ✅ التحقق من وجود user
  if (!user?.uid) {
    Alert.alert('تسجيل الدخول مطلوب');
    return;
  }

  // ✅ التحقق من Firebase Auth token
  const { auth } = await import('@/constants/firebase');
  const currentUser = auth?.currentUser;
  
  if (!currentUser) {
    Alert.alert('خطأ في المصادقة', 'يرجى إعادة تسجيل الدخول');
    return;
  }

  // الآن آمن للقيام بالعملية
}
```

### 3. **رسائل خطأ واضحة للمستخدم**

```typescript
catch (error: any) {
  if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
    Alert.alert(
      'تسجيل الدخول مطلوب',
      'يرجى تسجيل الدخول لإضافة المنتجات إلى قائمة الأمنيات'
    );
    return;
  }
  Alert.alert('خطأ', 'حدث خطأ أثناء تحديث قائمة الأمنيات');
}
```

## 🔍 التشخيص

إذا ظهر الخطأ مجدداً:

1. **تحقق من Console Logs:**
```bash
LOG  User UID: xxx
LOG  Firebase Auth currentUser: xxx
```

2. **تحقق من Firestore Rules في Firebase Console:**
   - اذهب إلى Firestore Database
   - اضغط على Rules
   - تأكد من نشر القواعد الصحيحة

3. **تحقق من Auth State:**
```typescript
const { auth } = await import('@/constants/firebase');
console.log('Auth currentUser:', auth?.currentUser);
console.log('User UID:', user?.uid);
```

## 🎯 الحل النهائي

إذا استمرت المشكلة، الحل الأسهل هو:

### خيار 1: تعطيل Wishlist للمستخدمين غير المسجلين
```typescript
if (!user?.uid || !auth?.currentUser) {
  // عرض رسالة تسجيل دخول بدلاً من محاولة الكتابة
  return;
}
```

### خيار 2: استخدام Local Storage مؤقتاً
```typescript
// حفظ wishlist محلياً للمستخدمين غير المسجلين
import AsyncStorage from '@react-native-async-storage/async-storage';

if (!user?.uid) {
  await AsyncStorage.setItem('local_wishlist', JSON.stringify([...wishlist, productId]));
}
```

## 📋 Checklist

- ✅ معالجة أخطاء الصلاحيات في `firestore.ts`
- ✅ التحقق من Firebase Auth قبل العمليات
- ✅ رسائل خطأ واضحة للمستخدم
- ✅ تحسين UX للمستخدمين غير المسجلين
- ✅ إزالة console.error المزعجة

## 🚀 النتيجة

الآن التطبيق:
- لا يعرض أخطاء حمراء مزعجة
- يوجه المستخدم لتسجيل الدخول بشكل واضح
- يعالج حالات الخطأ بشكل احترافي
- تجربة مستخدم سلسة
