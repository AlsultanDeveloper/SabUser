# 👤 بنية بيانات المستخدم في Firebase
## User Data Structure in Firestore

**التاريخ:** 31 أكتوبر 2025  
**الغرض:** توثيق البيانات المطلوبة عند تسجيل مستخدم جديد

---

## 🔍 الوضع الحالي | Current Structure

### البيانات المحفوظة حالياً:

```typescript
// عند التسجيل بالإيميل (signUpWithEmail)
{
  email: result.user.email,              // البريد الإلكتروني
  fullName: result.user.displayName || '', // الاسم الكامل (فارغ عادةً)
  signInMethod: 'email',                 // طريقة التسجيل
  createdAt: new Date().toISOString(),   // تاريخ الإنشاء
}
```

### ⚠️ المشاكل الحالية:

1. **fullName فارغ دائماً** - لأن Firebase Auth لا يحفظ displayName تلقائياً
2. **بيانات ناقصة** - لا يوجد رقم هاتف، عنوان، تفضيلات، إلخ
3. **لا يوجد profile image** - لا توجد صورة للمستخدم
4. **لا توجد language preference** - اللغة المفضلة

---

## ✅ البنية المقترحة | Recommended Structure

### 1. البيانات الأساسية (Required)

```typescript
interface UserBasicData {
  // معلومات المصادقة
  email: string;                    // ✅ موجود
  uid: string;                      // UID من Firebase Auth
  signInMethod: 'email' | 'google' | 'apple' | 'phone'; // ✅ موجود
  
  // معلومات شخصية
  fullName: string;                 // الاسم الكامل
  firstName: string;                // الاسم الأول
  lastName: string;                 // اسم العائلة
  
  // الصورة الشخصية
  photoURL?: string;                // رابط الصورة
  
  // التواريخ
  createdAt: string;                // ✅ موجود - تاريخ الإنشاء (ISO)
  updatedAt: string;                // تاريخ آخر تحديث
  lastLoginAt: string;              // آخر تسجيل دخول
}
```

### 2. معلومات الاتصال (Contact Info)

```typescript
interface UserContactData {
  // رقم الهاتف
  phoneNumber?: string;             // +961 70 XXX XXX
  phoneVerified: boolean;           // هل تم التحقق من الرقم؟
  
  // العنوان الافتراضي
  defaultAddress?: {
    id: string;                     // معرف العنوان
    label: string;                  // "Home", "Work", etc.
    fullAddress: string;            // العنوان الكامل
    city: string;                   // المدينة
    country: string;                // البلد
    postalCode?: string;            // الرمز البريدي
    coordinates?: {                 // الإحداثيات للتوصيل
      latitude: number;
      longitude: number;
    };
  };
}
```

### 3. التفضيلات (Preferences)

```typescript
interface UserPreferences {
  // اللغة والعملة
  language: 'ar' | 'en';            // اللغة المفضلة
  currency: 'USD' | 'LBP';          // العملة المفضلة
  
  // الإشعارات
  notifications: {
    push: boolean;                  // إشعارات Push
    email: boolean;                 // إشعارات Email
    sms: boolean;                   // إشعارات SMS
    orders: boolean;                // إشعارات الطلبات
    promotions: boolean;            // إشعارات العروض
  };
  
  // إعدادات أخرى
  theme: 'light' | 'dark' | 'auto'; // المظهر
}
```

### 4. بيانات التسوق (Shopping Data)

```typescript
interface UserShoppingData {
  // الإحصائيات
  totalOrders: number;              // عدد الطلبات الكلي
  totalSpent: number;               // المبلغ الكلي المنفق
  
  // المفضلات
  wishlistCount: number;            // عدد المنتجات في المفضلة
  cartItemsCount: number;           // عدد المنتجات في السلة
  
  // الولاء
  loyaltyPoints: number;            // نقاط الولاء
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // آخر نشاط
  lastOrderDate?: string;           // تاريخ آخر طلب
  lastViewedProducts?: string[];    // آخر المنتجات التي شاهدها
}
```

### 5. حالة الحساب (Account Status)

```typescript
interface UserAccountStatus {
  // الحالة
  isActive: boolean;                // الحساب نشط؟
  isVerified: boolean;              // البريد/الهاتف محقق؟
  isBlocked: boolean;               // محظور؟
  blockReason?: string;             // سبب الحظر
  
  // الأمان
  twoFactorEnabled: boolean;        // مصادقة ثنائية؟
  lastPasswordChange?: string;      // آخر تغيير كلمة مرور
}
```

---

## 📋 البنية الكاملة المقترحة | Complete Structure

```typescript
interface User {
  // ===== معلومات أساسية =====
  uid: string;                      // معرف المستخدم الفريد
  email: string;                    // البريد الإلكتروني
  emailVerified: boolean;           // هل البريد محقق؟
  
  // ===== الاسم =====
  fullName: string;                 // الاسم الكامل
  firstName: string;                // الاسم الأول
  lastName: string;                 // اسم العائلة
  displayName?: string;             // اسم العرض (اختياري)
  
  // ===== الصورة =====
  photoURL?: string;                // رابط الصورة
  
  // ===== المصادقة =====
  signInMethod: 'email' | 'google' | 'apple' | 'phone';
  
  // ===== الاتصال =====
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // ===== العنوان الافتراضي =====
  defaultAddressId?: string;        // معرف العنوان الافتراضي
  
  // ===== التفضيلات =====
  preferences: {
    language: 'ar' | 'en';
    currency: 'USD' | 'LBP';
    notifications: {
      push: boolean;
      email: boolean;
      sms: boolean;
      orders: boolean;
      promotions: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  
  // ===== الإحصائيات =====
  stats: {
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
    loyaltyPoints: number;
    membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  
  // ===== الحالة =====
  status: {
    isActive: boolean;
    isVerified: boolean;
    isBlocked: boolean;
    blockReason?: string;
    twoFactorEnabled: boolean;
  };
  
  // ===== التواريخ =====
  createdAt: string;                // ISO timestamp
  updatedAt: string;                // ISO timestamp
  lastLoginAt: string;              // ISO timestamp
  lastPasswordChange?: string;      // ISO timestamp
  
  // ===== بيانات إضافية =====
  metadata?: {
    registrationSource: 'web' | 'ios' | 'android';
    referralCode?: string;          // كود الإحالة
    referredBy?: string;            // من أحاله
    deviceInfo?: {
      platform: string;
      version: string;
    };
  };
}
```

---

## 🔧 التطبيق المقترح | Implementation

### 1. تحديث signUpWithEmail

```typescript
const signUpWithEmail = useCallback(async (
  email: string, 
  password: string,
  additionalData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    language?: 'ar' | 'en';
  }
) => {
  try {
    if (!isConfigured || !auth) {
      return { success: false, error: 'Firebase is not configured.' };
    }
    
    // إنشاء حساب في Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // تحديث الـ displayName
    await updateProfile(result.user, {
      displayName: `${additionalData.firstName} ${additionalData.lastName}`,
    });
    
    // حفظ البيانات في Firestore
    const db = getFirestore();
    const userDocRef = doc(db, 'users', result.user.uid);
    
    const userData: User = {
      // معلومات أساسية
      uid: result.user.uid,
      email: result.user.email!,
      emailVerified: result.user.emailVerified,
      
      // الاسم
      fullName: `${additionalData.firstName} ${additionalData.lastName}`,
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      displayName: result.user.displayName,
      
      // الصورة
      photoURL: result.user.photoURL || undefined,
      
      // المصادقة
      signInMethod: 'email',
      
      // الاتصال
      phoneNumber: additionalData.phoneNumber,
      phoneVerified: false,
      
      // التفضيلات
      preferences: {
        language: additionalData.language || 'en',
        currency: 'USD',
        notifications: {
          push: true,
          email: true,
          sms: false,
          orders: true,
          promotions: true,
        },
        theme: 'auto',
      },
      
      // الإحصائيات
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        loyaltyPoints: 0,
        membershipLevel: 'bronze',
      },
      
      // الحالة
      status: {
        isActive: true,
        isVerified: false,
        isBlocked: false,
        twoFactorEnabled: false,
      },
      
      // التواريخ
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      
      // Metadata
      metadata: {
        registrationSource: Platform.OS as any,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version.toString(),
        },
      },
    };
    
    await setDoc(userDocRef, userData);
    
    console.log('✅ User document created with complete data');
    
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('❌ Email sign up error:', error);
    return { success: false, error: error.message };
  }
}, []);
```

### 2. تحديث صفحة التسجيل (login.tsx)

```typescript
// في login.tsx - إضافة حقول جديدة للتسجيل

const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [phoneNumber, setPhoneNumber] = useState('');

// في JSX - إضافة الحقول
{isSignUp && (
  <>
    <View style={styles.inputContainer}>
      <Feather name="user" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={t('auth.firstName')}
        placeholderTextColor={Colors.gray[400]}
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
    </View>

    <View style={styles.inputContainer}>
      <Feather name="user" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={t('auth.lastName')}
        placeholderTextColor={Colors.gray[400]}
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
    </View>

    <View style={styles.inputContainer}>
      <Feather name="phone" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={t('auth.phoneNumber')}
        placeholderTextColor={Colors.gray[400]}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
    </View>
  </>
)}

// عند التسجيل
const handleEmailAuth = async () => {
  if (isSignUp) {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    
    const result = await signUpWithEmail(email, password, {
      firstName,
      lastName,
      phoneNumber,
      language,
    });
    
    if (result.success) {
      router.back();
    } else {
      Alert.alert('Error', result.error);
    }
  } else {
    // Sign in logic...
  }
};
```

---

## 📊 Collections في Firestore

### الهيكل المقترح:

```
firestore/
├── users/                          # Collection للمستخدمين
│   └── {userId}/                   # Document لكل مستخدم
│       ├── (بيانات المستخدم الكاملة)
│       │
│       ├── addresses/              # Sub-collection للعناوين
│       │   └── {addressId}/
│       │       ├── label
│       │       ├── fullAddress
│       │       ├── city
│       │       ├── country
│       │       └── isDefault
│       │
│       ├── orders/                 # Sub-collection للطلبات (reference)
│       │   └── {orderId}/
│       │       └── (reference to orders collection)
│       │
│       └── wishlist/               # Sub-collection للمفضلة
│           └── {productId}/
│               ├── addedAt
│               └── productData
│
├── orders/                         # Collection للطلبات
├── products/                       # Collection للمنتجات
└── categories/                     # Collection للتصنيفات
```

---

## 🔐 Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // يمكن للمستخدم قراءة وتعديل بياناته فقط
      allow read, update, delete: if request.auth != null 
                                   && request.auth.uid == userId;
      
      // يمكن إنشاء مستخدم جديد فقط عند التسجيل
      allow create: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.data.uid == userId
                    && request.resource.data.email == request.auth.token.email;
      
      // Addresses sub-collection
      match /addresses/{addressId} {
        allow read, write: if request.auth != null 
                           && request.auth.uid == userId;
      }
      
      // Wishlist sub-collection
      match /wishlist/{productId} {
        allow read, write: if request.auth != null 
                           && request.auth.uid == userId;
      }
    }
  }
}
```

---

## ✅ Checklist للتطبيق

### المرحلة 1: تحديث AuthContext
- [ ] إضافة interface User الكامل
- [ ] تحديث signUpWithEmail لقبول بيانات إضافية
- [ ] إضافة updateProfile من Firebase Auth
- [ ] حفظ البيانات الكاملة في Firestore

### المرحلة 2: تحديث UI
- [ ] إضافة حقول firstName و lastName
- [ ] إضافة حقل phoneNumber (اختياري)
- [ ] تحديث validation
- [ ] تحديث الترجمات في i18n

### المرحلة 3: Firestore Rules
- [ ] تحديث قواعد users collection
- [ ] إضافة قواعد addresses sub-collection
- [ ] إضافة قواعد wishlist sub-collection
- [ ] اختبار الأمان

### المرحلة 4: الاختبار
- [ ] اختبار التسجيل بالبيانات الكاملة
- [ ] التحقق من حفظ البيانات في Firestore
- [ ] اختبار قراءة البيانات
- [ ] اختبار تحديث البيانات

---

## 📝 أمثلة للاستخدام

### إنشاء مستخدم جديد:

```typescript
const result = await signUpWithEmail(
  'user@example.com',
  'password123',
  {
    firstName: 'محمد',
    lastName: 'أحمد',
    phoneNumber: '+961 70 123 456',
    language: 'ar',
  }
);
```

### قراءة بيانات المستخدم:

```typescript
const db = getFirestore();
const userDoc = await getDoc(doc(db, 'users', userId));
const userData = userDoc.data() as User;

console.log(userData.fullName);
console.log(userData.preferences.language);
console.log(userData.stats.totalOrders);
```

### تحديث بيانات المستخدم:

```typescript
await updateDoc(doc(db, 'users', userId), {
  'preferences.language': 'ar',
  'preferences.currency': 'LBP',
  updatedAt: new Date().toISOString(),
});
```

---

## 🎯 الفوائد | Benefits

1. **بيانات كاملة** - كل المعلومات المطلوبة محفوظة
2. **تخصيص أفضل** - تفضيلات اللغة والعملة
3. **تتبع النشاط** - آخر تسجيل دخول، آخر طلب
4. **الولاء** - نقاط ومستويات العضوية
5. **أمان محسّن** - حالة الحساب والتحقق
6. **تجربة أفضل** - بيانات شخصية كاملة

---

<div align="center">

**📋 دليل شامل لبنية بيانات المستخدم**

*جاهز للتطبيق*

</div>

---

**تم الإنشاء:** 31 أكتوبر 2025  
**الحالة:** 📋 موثّق - جاهز للتطبيق  
**المشروع:** SabUser
