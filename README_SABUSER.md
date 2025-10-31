# 🛒 SabUser - Multi-Vendor E-Commerce App
## تطبيق ساب ستور للتسوق الإلكتروني

[![Version](https://img.shields.io/badge/version-1.0.14-blue.svg)](https://github.com/AlsultanDeveloper/SabUser)
[![Expo](https://img.shields.io/badge/Expo-54.0-black.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.4-orange.svg)](https://firebase.google.com)

---

## 📱 نظرة عامة | Overview

**SabUser** هو تطبيق تسوق إلكتروني متكامل متعدد البائعين مبني بأحدث التقنيات. يوفر تجربة تسوق سلسة على iOS و Android والويب.

**SabUser** is a full-featured multi-vendor e-commerce application built with cutting-edge technologies, providing a seamless shopping experience across iOS, Android, and Web.

### ✨ المميزات الرئيسية | Key Features

- 🏪 **Multi-Vendor Support** - دعم متعدد البائعين
- 🌍 **Multilingual** - دعم العربية والإنجليزية مع RTL
- 💳 **Multiple Payment Methods** - طرق دفع متعددة
- 📦 **Order Tracking** - تتبع الطلبات في الوقت الفعلي
- 🔔 **Push Notifications** - إشعارات فورية
- 🔐 **Secure Authentication** - مصادقة آمنة (Google, Apple, Email)
- 📍 **Location Services** - خدمات الموقع للتوصيل
- ⭐ **Wishlist & Favorites** - قائمة المفضلات
- 🎨 **Modern UI/UX** - واجهة مستخدم عصرية
- 🚀 **Optimized Performance** - أداء محسّن

---

## 🏗️ البنية التقنية | Tech Stack

### Frontend
- **React Native 0.81** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform
- **Expo Router 6** - File-based routing
- **TypeScript 5.9** - Type-safe JavaScript
- **React Query 5** - Server state management
- **Zustand 5** - Client state management

### Backend & Services
- **Firebase 12.4** - Backend services
  - Authentication (Google, Apple, Email/OTP)
  - Firestore Database
  - Cloud Storage
  - Cloud Functions
  - Cloud Messaging
- **i18n-js** - Internationalization
- **Expo Notifications** - Push notifications

### UI & Styling
- **NativeWind 4** - Tailwind for React Native
- **Expo Linear Gradient** - Gradient effects
- **Lucide React Native** - Beautiful icons
- **React Native Gesture Handler** - Advanced gestures
- **React Native Toast Message** - Toast notifications

---

## 📂 هيكل المشروع | Project Structure

```
sabuser/
├── app/                          # Expo Router screens
│   ├── (tabs)/                  # Tab navigation
│   │   ├── home.tsx            # 🏠 Home screen
│   │   ├── categories.tsx      # 📁 Categories
│   │   ├── cart.tsx            # 🛒 Shopping cart
│   │   ├── orders.tsx          # 📦 Orders history
│   │   ├── brands.tsx          # 🏷️ Brands
│   │   └── account.tsx         # 👤 User account
│   ├── auth/                    # Authentication screens
│   │   └── login.tsx           # 🔐 Login screen
│   ├── product/                 # Product screens
│   │   └── [id].tsx            # 📱 Product details
│   ├── category/                # Category screens
│   │   └── [id].tsx            # 📂 Category products
│   ├── order/                   # Order screens
│   │   └── [id].tsx            # 📋 Order details
│   ├── checkout.tsx            # 💳 Checkout
│   ├── wishlist.tsx            # ⭐ Wishlist
│   ├── notifications.tsx       # 🔔 Notifications
│   └── _layout.tsx             # Root layout
│
├── components/                  # Reusable components
│   ├── SafeImage.tsx           # ✅ Optimized image component
│   ├── SkeletonLoader.tsx      # ✅ Loading placeholders
│   └── OrderSuccessModal.tsx   # Order success modal
│
├── contexts/                    # React contexts
│   ├── AppContext.tsx          # App-wide state
│   ├── AuthContext.tsx         # Authentication state
│   ├── OrderContext.tsx        # Order management
│   └── NotificationContext.tsx # Notifications
│
├── hooks/                       # Custom hooks
│   └── useFirestore.ts         # Firebase queries
│
├── constants/                   # App constants
│   ├── firebase.ts             # Firebase config
│   ├── theme.ts                # Design tokens
│   ├── i18n.ts                 # Translations
│   └── notifications.ts        # Notification config
│
├── types/                       # TypeScript types
│   └── index.ts                # Type definitions
│
├── utils/                       # Utility functions
│   ├── notifications.ts        # Notification helpers
│   └── admin-notifications.ts  # Admin notifications
│
├── functions/                   # Firebase Cloud Functions
│   ├── index.js                # Function definitions
│   └── package.json            # Function dependencies
│
├── assets/                      # Static assets
│   └── images/                 # App images
│
├── android/                     # Android native code
├── ios/                         # iOS native code (if exists)
│
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── firebase.json               # Firebase config
├── firestore.rules             # Firestore security rules
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
│
└── Documentation/              # 📚 Documentation
    ├── IMPROVEMENTS_SUMMARY.md  # ✅ Recent improvements
    ├── TODO_IMPROVEMENTS.md     # 📋 Future enhancements
    ├── BEST_PRACTICES.md        # 📖 Coding standards
    └── FIRESTORE_STRUCTURE.md   # Database structure
```

---

## 🚀 البدء السريع | Quick Start

### المتطلبات | Prerequisites

- Node.js 18+ ([تثبيت Node.js](https://nodejs.org))
- Bun ([تثبيت Bun](https://bun.sh))
- Expo CLI
- Git

### التثبيت | Installation

```bash
# 1. Clone the repository
git clone https://github.com/AlsultanDeveloper/SabUser.git
cd sabuser

# 2. Install dependencies
bun install

# 3. Configure Firebase
# أضف ملف google-services.json (Android) و GoogleService-Info.plist (iOS)

# 4. Start development server
bun start

# 5. Run on specific platform
bun start -- --ios          # iOS
bun start -- --android      # Android
bun run start-web           # Web
```

### إعدادات Firebase | Firebase Setup

1. أنشئ مشروع Firebase في [Firebase Console](https://console.firebase.google.com)
2. فعّل Authentication (Google, Apple, Email/Password)
3. أنشئ Firestore Database
4. فعّل Cloud Storage
5. أضف Firebase config إلى `app.json`:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_FIREBASE_API_KEY": "your-api-key",
      "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
      "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id",
      // ... other config
    }
  }
}
```

---

## 🎨 التحسينات الأخيرة | Recent Improvements

تم تطبيق مجموعة شاملة من التحسينات في **31 أكتوبر 2025**:

### ✅ Performance Optimizations
- **SafeImage Component**: إضافة caching وloading states
- **SkeletonLoader**: تأثير shimmer احترافي
- **Home Screen**: pull-to-refresh وmemoization محسّن
- **React Query**: استراتيجية caching محسّنة

### ✅ Code Quality
- TypeScript types محسّنة
- React.memo للمكونات
- useCallback و useMemo محسّنة
- Error handling أفضل

### ✅ Documentation
- 📄 `IMPROVEMENTS_SUMMARY.md` - ملخص التحسينات
- 📋 `TODO_IMPROVEMENTS.md` - خارطة الطريق
- 📖 `BEST_PRACTICES.md` - معايير البرمجة

**اقرأ المزيد:** [ملخص التحسينات الكامل](./IMPROVEMENTS_SUMMARY.md)

---

## 📱 اختبار التطبيق | Testing the App

### على الهاتف | On Device
```bash
# 1. ابدأ development server
bun start

# 2. امسح QR code باستخدام:
# iOS: Expo Go app أو كاميرا الآيفون
# Android: Expo Go app
```

### في المتصفح | In Browser
```bash
bun run start-web
# افتح http://localhost:8081 في المتصفح
```

### في المحاكي | In Simulator
```bash
# iOS Simulator (يتطلب macOS + Xcode)
bun start -- --ios

# Android Emulator (يتطلب Android Studio)
bun start -- --android
```

---

## 🔧 البناء والنشر | Build & Deploy

### بناء التطبيق | Building

```bash
# تثبيت EAS CLI
npm install -g @expo/eas-cli

# تسجيل الدخول
eas login

# تهيئة المشروع
eas build:configure

# بناء iOS
eas build --platform ios --profile production

# بناء Android
eas build --platform android --profile production

# بناء كلاهما
eas build --platform all --profile production
```

### النشر | Deployment

#### App Store (iOS)
```bash
eas submit --platform ios
```

#### Google Play (Android)
```bash
eas submit --platform android
```

#### الويب | Web
```bash
# بناء للويب
eas build --platform web

# نشر على EAS Hosting
eas hosting:configure
eas hosting:deploy
```

---

## 🔐 الأمان | Security

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - read for all, write for admins only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null 
                   && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - users can only read/create their own
    match /orders/{orderId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
    }
    
    // Cart - users can only access their own
    match /users/{userId}/cart/{itemId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
  }
}
```

### Best Practices
- ✅ Firebase keys في environment variables فقط
- ✅ استخدام Firebase App Check
- ✅ تشفير البيانات الحساسة
- ✅ Validation على الـ client والـ server
- ✅ Rate limiting على Cloud Functions

**اقرأ المزيد:** [دليل أفضل الممارسات](./BEST_PRACTICES.md)

---

## 📊 الميزات المخططة | Planned Features

### أولوية عالية | High Priority
- [ ] 🖼️ Image optimization مع expo-image
- [ ] 🔍 Algolia search integration
- [ ] 📱 Offline support
- [ ] 📊 Firebase Analytics & Crashlytics

### أولوية متوسطة | Medium Priority
- [ ] 🌙 Dark mode
- [ ] 🔐 Biometric authentication
- [ ] 🎨 Enhanced animations
- [ ] 💬 Live chat support

### Nice to Have
- [ ] 🤖 AI recommendations
- [ ] 🎁 Gamification (points, badges)
- [ ] 🌐 More languages
- [ ] 📈 Advanced analytics

**اقرأ الخطة الكاملة:** [قائمة التحسينات المستقبلية](./TODO_IMPROVEMENTS.md)

---

## 🤝 المساهمة | Contributing

نرحب بالمساهمات! يرجى اتباع هذه الخطوات:

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

**تأكد من:**
- ✅ اتباع [معايير البرمجة](./BEST_PRACTICES.md)
- ✅ كتابة tests للميزات الجديدة
- ✅ توثيق التغييرات
- ✅ اختبار على iOS و Android

---

## 🐛 الإبلاغ عن المشاكل | Bug Reports

واجهت مشكلة؟ أنشئ [issue جديد](https://github.com/AlsultanDeveloper/SabUser/issues) مع:

- 📱 نظام التشغيل (iOS/Android/Web)
- 📋 الخطوات لإعادة إنتاج المشكلة
- 🎯 السلوك المتوقع
- 📸 Screenshots (إن أمكن)
- 📝 Error logs

---

## 📚 الوثائق | Documentation

- 📄 [ملخص التحسينات](./IMPROVEMENTS_SUMMARY.md) - التحسينات الأخيرة
- 📋 [قائمة المهام](./TODO_IMPROVEMENTS.md) - الميزات المخططة
- 📖 [أفضل الممارسات](./BEST_PRACTICES.md) - معايير البرمجة
- 🗂️ [هيكل Firestore](./FIRESTORE_STRUCTURE.md) - بنية قاعدة البيانات
- 🔔 [دليل الإشعارات](./NOTIFICATIONS_GUIDE.md) - إعداد الإشعارات
- 🚀 [دليل النشر](./DEPLOY_CLOUD_FUNCTIONS.md) - نشر Cloud Functions

---

## 🔗 روابط مفيدة | Useful Links

### الموارد الرسمية
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### المجتمع
- [Expo Discord](https://chat.expo.dev)
- [React Native Community](https://reactnative.dev/community/overview)
- [Firebase Community](https://firebase.google.com/community)

---

## 📄 الترخيص | License

هذا المشروع مرخص تحت MIT License - انظر ملف [LICENSE](./LICENSE) للتفاصيل.

---

## 👥 الفريق | Team

**Developer:** AlsultanDeveloper  
**Organization:** Rork  
**Project:** SabUser Multi-Vendor E-Commerce Platform

---

## 🙏 شكر خاص | Acknowledgments

- [Expo Team](https://expo.dev) - Amazing development platform
- [Firebase Team](https://firebase.google.com) - Powerful backend services
- [React Native Community](https://reactnative.dev) - Great ecosystem
- All contributors and testers

---

## 📞 الدعم | Support

هل تحتاج مساعدة؟

- 📧 Email: support@sabstore.com
- 💬 Discord: [Join our community](#)
- 🐦 Twitter: [@SabStore](#)
- 📱 In-app support: Contact Support في قسم Account

---

**النسخة:** 1.0.14  
**آخر تحديث:** 31 أكتوبر 2025  
**الحالة:** ✅ Production Ready

---

<div align="center">
  <p>صُنع بـ ❤️ في لبنان | Made with ❤️ in Lebanon</p>
  <p>© 2025 SabUser. All rights reserved.</p>
</div>
