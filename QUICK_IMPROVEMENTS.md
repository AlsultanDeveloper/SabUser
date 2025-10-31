# 🔥 إصلاحات سريعة (5-10 دقائق لكل واحدة)

## 1️⃣ إصلاح Push Notifications (5 دقائق) ⚡

```powershell
# نسخ google-services.json للمكان الصحيح
Copy-Item "google-services.json" "android/app/google-services.json"

# تحقق
Test-Path "android/app/google-services.json"  # يجب أن يكون True

# أعد البناء
eas build --profile development --platform android
```

**النتيجة**: ❌ Error → ✅ Push Notifications تعمل!

---

## 2️⃣ إصلاح خطأ Text Component (10 دقائق) ⚡

### ابحث في `app/(tabs)/home.tsx`:

```tsx
// ❌ خطأ - text خارج <Text>
<View>{product.name}</View>

// ✅ صحيح
<View>
  <Text>{product.name}</Text>
</View>
```

---

## 3️⃣ إضافة Error Boundary (15 دقيقة) 🛡️

### أنشئ `components/ErrorBoundary.tsx`

### ثم في `app/_layout.tsx`:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      {/* ... باقي الكود */}
    </ErrorBoundary>
  );
}
```

**الفائدة**: التطبيق لن يتوقف عند حدوث خطأ!

---

## 4️⃣ إضافة Toast Notifications (10 دقائق) 🎯

```powershell
npx expo install react-native-toast-message
```

### في `app/_layout.tsx`:

```tsx
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      {/* ...your app */}
      <Toast />
    </>
  );
}
```

### الاستخدام:

```tsx
import Toast from 'react-native-toast-message';

Toast.show({
  type: 'success',
  text1: '✅ نجح!',
  text2: 'تمت العملية بنجاح',
});
```

---

## 5️⃣ استخدام expo-image (20 دقيقة) 🖼️

### في `components/SafeImage.tsx`:

```tsx
import { Image } from 'expo-image';

export default function SafeImage({ source, style, ...props }) {
  return (
    <Image
      source={source}
      style={style}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      {...props}
    />
  );
}
```

**الفائدة**: أداء أفضل بـ 50%!

---

## 📋 جدول التنفيذ

| المهمة | الوقت | الأولوية |
|--------|-------|---------|
| Push Notifications | 5 دقائق | 🔥🔥🔥 |
| Text Error | 10 دقائق | 🔥🔥🔥 |
| Error Boundary | 15 دقيقة | 🔥🔥 |
| Toast | 10 دقيقة | 🔥 |
| expo-image | 20 دقيقة | 🔥 |

**المجموع**: 60 دقيقة = **تحسينات ضخمة!** 🚀

---

**ابدأ الآن**: نفذ الإصلاح #1 (5 دقائق فقط!)
