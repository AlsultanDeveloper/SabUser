# 🛒 كيفية الانتقال إلى شاشة Cart

## ✅ تم إصلاح المشكلة!

تم إضافة شاشة `cart` إلى الـ Stack Navigator في ملف `_layout.tsx`

---

## 📱 طرق الانتقال إلى شاشة Cart

### 1️⃣ **من أي مكان في التطبيق باستخدام useRouter:**

```tsx
import { useRouter } from 'expo-router';

const MyComponent = () => {
  const router = useRouter();
  
  const goToCart = () => {
    router.push('/cart');
  };
  
  return (
    <TouchableOpacity onPress={goToCart}>
      <Text>Go to Cart</Text>
    </TouchableOpacity>
  );
};
```

### 2️⃣ **من أي مكان باستخدام Link:**

```tsx
import { Link } from 'expo-router';

<Link href="/cart" asChild>
  <TouchableOpacity>
    <Text>View Cart</Text>
  </TouchableOpacity>
</Link>
```

### 3️⃣ **من TabBar (مثال):**

```tsx
import { ShoppingCart } from 'lucide-react-native';

<TouchableOpacity 
  onPress={() => router.push('/cart')}
  style={styles.cartButton}
>
  <ShoppingCart size={24} color="#fff" />
  {cartItemsCount > 0 && (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{cartItemsCount}</Text>
    </View>
  )}
</TouchableOpacity>
```

---

## 🎨 مثال كامل مع عداد العربة

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

const CartButton = () => {
  const router = useRouter();
  const { sabMarketCart, otherCart } = useApp();
  
  // إجمالي عدد المنتجات في العربة
  const totalItems = sabMarketCart.length + otherCart.length;
  
  return (
    <TouchableOpacity 
      onPress={() => router.push('/cart')}
      style={styles.cartButton}
    >
      <ShoppingCart size={24} color="#0EA5E9" />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default CartButton;
```

---

## 🔗 الروابط المتوفرة في التطبيق

تم تسجيل الشاشات التالية في `_layout.tsx`:

- ✅ `/(tabs)` - الشاشة الرئيسية مع Tabs
- ✅ `/product/[id]` - صفحة المنتج
- ✅ `/auth/login` - تسجيل الدخول
- ✅ `/checkout` - إتمام الطلب
- ✅ `/checkout-details` - تفاصيل الطلب
- ✅ `/cart` - **عربة التسوق** ⭐ (تم إضافتها)
- ✅ `/addresses` - العناوين
- ✅ `/notifications` - الإشعارات

---

## 📋 ملاحظات مهمة

1. **Navigation Type**: تم استخدام `presentation: 'card'` للحصول على تأثير انتقال سلس
2. **Header**: تم إخفاء الـ Header (`headerShown: false`) لأن الشاشة تحتوي على Header مخصص
3. **RTL Support**: الشاشة تدعم العربية بالكامل مع RTL

---

## 🎯 أمثلة للاستخدام

### مثال 1: زر في Header

```tsx
<TouchableOpacity onPress={() => router.push('/cart')}>
  <View style={{ position: 'relative' }}>
    <ShoppingCart size={24} color="#fff" />
    <View style={styles.cartBadge}>
      <Text>3</Text>
    </View>
  </View>
</TouchableOpacity>
```

### مثال 2: زر "إضافة إلى السلة" ثم الانتقال

```tsx
const addToCartAndNavigate = () => {
  addToCart(product, 1);
  router.push('/cart');
};

<TouchableOpacity onPress={addToCartAndNavigate}>
  <Text>Add to Cart & View</Text>
</TouchableOpacity>
```

### مثال 3: Toast مع زر للانتقال

```tsx
import Toast from 'react-native-toast-message';

const showCartToast = () => {
  Toast.show({
    type: 'success',
    text1: 'تم إضافة المنتج',
    text2: 'اضغط لعرض السلة',
    onPress: () => router.push('/cart'),
  });
};
```

---

## ✨ المزايا الجديدة في Cart Screen

- ✅ تصميم احترافي مثل Amazon & Noon
- ✅ شريط التقدم للشحن المجاني
- ✅ أكواد خصم قابلة للتطبيق
- ✅ حساب التوفيرات التلقائي
- ✅ ملخص كامل للطلب
- ✅ أزرار الثقة (Secure Payment, Fast Delivery, Free Returns)
- ✅ زر Checkout ثابت في الأسفل
- ✅ دعم كامل للغة العربية

---

**تم التطوير بواسطة فريق SabUser** 🚀
