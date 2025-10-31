# 🚀 دليل سريع: استخدام Development Build

## ✅ ما لديك الآن

- ✅ `expo-dev-client` مثبت
- ✅ Development build جاهز (تم بناؤه في 29 أكتوبر)
- ✅ Metro bundler يعمل على port 8085
- ✅ الكود جاهز للاختبار

---

## 📱 تثبيت التطبيق (مرة واحدة فقط)

### تحميل APK:
```
https://expo.dev/artifacts/eas/xmMXsYQfPdJeXKxZJejuVU.apk
```

### خطوات التثبيت:
1. افتح الرابط على جهاز Android
2. حمّل الـ APK
3. ثبّته (قد تحتاج: Settings → Security → Allow unknown sources)
4. سيظهر تطبيق اسمه "Sab Store"

---

## 🔄 الاستخدام اليومي

### في الكمبيوتر (PowerShell):

```powershell
# انتقل للمجلد
cd C:\Users\adamd\Project\SabUser

# ابدأ Metro
npx expo start --dev-client
```

### في الجهاز:

**الطريقة 1: QR Code**
- افتح التطبيق
- اضغط "Scan QR Code"
- امسح الكود الظاهر في Terminal

**الطريقة 2: رابط مباشر**
- افتح متصفح على الجهاز
- اكتب: `exp+sab-store://expo-development-client/?url=http://192.168.100.21:8085`
- اضغط Enter
- سيفتح التطبيق تلقائياً

---

## 🎯 اختبار Google Sign-In

### على الجهاز:
1. ✅ افتح التطبيق المثبت (من الخطوات أعلاه)
2. ✅ اضغط "Sign in with Google"
3. ✅ اختر حساب Google
4. ✅ سيعمل! 🎉

### على الويب (للمقارنة):
```powershell
npx expo start --web
```
- افتح: http://localhost:8085
- Google Sign-In يعمل أيضاً ✅

---

## 🔍 Console Logs

لمشاهدة logs من الجهاز:

### في Terminal:
```powershell
# ستظهر logs تلقائياً في Terminal بعد فتح التطبيق
```

### في React Native Debugger:
```powershell
# اضغط 'j' في Terminal لفتح debugger
```

---

## ⚡ Hot Reload

**التحديث التلقائي يعمل!**

عند تعديل أي ملف:
- ✅ حفظ الملف (Ctrl+S)
- ✅ التطبيق يتحدث تلقائياً خلال ثوانٍ
- ✅ لا تحتاج إعادة فتح التطبيق

---

## 🔄 متى تحتاج Build جديد؟

**لا تحتاج build جديد** عند:
- ✅ تعديل JavaScript/TypeScript
- ✅ تعديل Styles
- ✅ إضافة Screens
- ✅ تعديل Logic

**تحتاج build جديد** فقط عند:
- ❌ إضافة native module جديد
- ❌ تعديل app.json (permissions, plugins)
- ❌ تعديل native code (android/, ios/)

---

## 🆘 حل المشاكل

### المشكلة: "Cannot connect to Metro"

**الحل 1**: تحقق من الشبكة
```powershell
# تأكد من أن الجهازين على نفس WiFi
ipconfig
```

**الحل 2**: استخدم Tunnel
```powershell
npx expo start --dev-client --tunnel
```

**الحل 3**: استخدم USB (أسرع)
```powershell
# وصّل الجهاز بـ USB
# فعّل USB Debugging في الجهاز
adb devices  # تحقق من الاتصال
npx expo start --dev-client --localhost
```

### المشكلة: "Google Sign-In لا يعمل"

**الحل**: تحقق من SHA fingerprints

```powershell
# احصل على SHA من EAS
eas credentials

# تأكد من إضافته في Google Cloud Console:
# https://console.cloud.google.com/apis/credentials
```

### المشكلة: "Build قديم"

**الحل**: بناء build جديد
```powershell
eas build --profile development --platform android
```

مدة البناء: 10-15 دقيقة

---

## 📊 معلومات Build الحالي

```
Build ID: fdf27ed4-b8cb-40b1-92a3-5d7a0a4197c6
Status: finished ✅
Profile: development
SDK Version: 54.0.0
Runtime Version: 1.0.14
تاريخ البناء: 29 أكتوبر 2025
```

---

## 🎉 مقارنة: Expo Go vs Development Build

| الميزة | Expo Go | Development Build |
|--------|---------|-------------------|
| Google Sign-In | ❌ لا يعمل | ✅ يعمل |
| Apple Sign-In | ❌ لا يعمل | ✅ يعمل |
| Custom Native Modules | ❌ لا يعمل | ✅ يعمل |
| Hot Reload | ✅ يعمل | ✅ يعمل |
| سرعة التطوير | ✅ سريع | ✅ سريع |
| تثبيت | ✅ من Store | يدوي (مرة واحدة) |

**الخلاصة**: Development Build أفضل لمشروعك! ✅

---

## 📱 الخطوة التالية

1. ✅ حمّل APK: https://expo.dev/artifacts/eas/xmMXsYQfPdJeXKxZJejuVU.apk
2. ✅ ثبّته على الجهاز
3. ✅ Metro يعمل بالفعل (port 8085)
4. ✅ افتح التطبيق وامسح QR Code
5. ✅ جرّب Google Sign-In!

**تطوير سعيد!** 🚀
