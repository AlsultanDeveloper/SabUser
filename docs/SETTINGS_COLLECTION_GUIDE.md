# ⚙️ دليل Settings Collection في Firebase

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إنشاء واستخدام `settings` collection في Firestore لتخزين إعدادات التطبيق مثل تكلفة الشحن والحد الأدنى للشحن المجاني.

---

## 🔧 إنشاء Settings Collection

### الخطوة 1: إنشاء Collection في Firebase Console

1. افتح Firebase Console: https://console.firebase.google.com/
2. اختر المشروع: **sab-store-9b947**
3. اذهب إلى **Firestore Database**
4. اضغط **"Start collection"**
5. اكتب اسم Collection: `settings`
6. Document ID: `app`

---

## 📊 هيكل البيانات

### Document: `settings/app`

```json
{
  "shipping": {
    "cost": 15,
    "freeShippingThreshold": 100,
    "currency": "SAR",
    "enabled": true
  },
  "currency": {
    "default": "SAR",
    "supported": ["SAR", "USD", "AED"]
  },
  "tax": {
    "enabled": false,
    "rate": 0,
    "includeInPrice": false
  },
  "orderSettings": {
    "minOrderAmount": 0,
    "maxOrderAmount": 10000
  },
  "app": {
    "maintenanceMode": false,
    "version": "1.0.0",
    "forceUpdate": false
  }
}
```

---

## 🔥 إضافة البيانات يدوياً

### من Firebase Console:

1. في Firestore Database
2. Collection: `settings`
3. Document: `app`
4. أضف الحقول:

| Field | Type | Value |
|-------|------|-------|
| `shipping` | map | - |
| `shipping.cost` | number | 15 |
| `shipping.freeShippingThreshold` | number | 100 |
| `shipping.currency` | string | SAR |
| `shipping.enabled` | boolean | true |

---

## 💻 استخدام Settings في الكود

### 1. إنشاء Hook للإعدادات

```typescript
// hooks/useSettings.ts
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/constants/firebase';

interface ShippingSettings {
  cost: number;
  freeShippingThreshold: number;
  currency: string;
  enabled: boolean;
}

interface AppSettings {
  shipping: ShippingSettings;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'app'),
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as AppSettings);
        } else {
          // Default values if no settings found
          setSettings({
            shipping: {
              cost: 15,
              freeShippingThreshold: 100,
              currency: 'SAR',
              enabled: true,
            },
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading settings:', error);
        // Use default values on error
        setSettings({
          shipping: {
            cost: 15,
            freeShippingThreshold: 100,
            currency: 'SAR',
            enabled: true,
          },
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
```

### 2. استخدام Hook في Cart

```typescript
// app/(tabs)/cart.tsx
import { useSettings } from '@/hooks/useSettings';

export default function ModernCartScreen() {
  const { settings, loading: settingsLoading } = useSettings();
  
  // Get shipping values from Firebase or use defaults
  const SHIPPING_COST = settings?.shipping?.cost ?? 15;
  const FREE_SHIPPING_THRESHOLD = settings?.shipping?.freeShippingThreshold ?? 100;
  
  // ... rest of code
}
```

---

## 🎯 الفوائد

✅ **مركزي**: كل الإعدادات في مكان واحد  
✅ **Real-time**: التغييرات تظهر فوراً بدون إعادة نشر التطبيق  
✅ **Admin Control**: الأدمن يقدر يغير القيم من لوحة التحكم  
✅ **Flexible**: سهل إضافة إعدادات جديدة  
✅ **Safe Defaults**: إذا ما في إعدادات، يستخدم قيم افتراضية  

---

## 🔒 Firebase Rules

أضف هذه القواعد في `firestore.rules`:

```javascript
// في firestore.rules
match /settings/{document} {
  // الكل يقدر يقرأ الإعدادات
  allow read: if true;
  
  // فقط الأدمنز يقدرون يعدلون
  allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 🛠️ لوحة تحكم الأدمن

### إضافة صفحة Settings في Admin Panel

```typescript
// app/admin/settings.tsx
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';

export default function SettingsPage() {
  const [shippingCost, setShippingCost] = useState(15);
  const [threshold, setThreshold] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'settings', 'app'), {
        'shipping.cost': parseFloat(shippingCost),
        'shipping.freeShippingThreshold': parseFloat(threshold),
      });
      alert('Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Shipping Settings</h1>
      <div>
        <label>Shipping Cost (SAR)</label>
        <input
          type="number"
          value={shippingCost}
          onChange={(e) => setShippingCost(e.target.value)}
        />
      </div>
      <div>
        <label>Free Shipping Threshold (SAR)</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </div>
      <button onClick={handleSave} disabled={loading}>
        Save Settings
      </button>
    </div>
  );
}
```

---

## 📱 تطبيق في Cart

### قبل:
```typescript
const SHIPPING_COST = 15; // ❌ ثابت
const FREE_SHIPPING_THRESHOLD = 100; // ❌ ثابت
```

### بعد:
```typescript
const { settings } = useSettings();
const SHIPPING_COST = settings?.shipping?.cost ?? 15; // ✅ ديناميكي
const FREE_SHIPPING_THRESHOLD = settings?.shipping?.freeShippingThreshold ?? 100; // ✅ ديناميكي
```

---

## 🚀 الخطوات التالية

1. ✅ إنشاء `settings` collection في Firebase
2. ✅ إضافة document `app` مع الإعدادات
3. ✅ إنشاء `useSettings` hook
4. ✅ تطبيق في Cart
5. ⏳ إنشاء Settings page في Admin Panel
6. ⏳ إضافة Firebase Rules

---

## 💡 ملاحظات

- **Default Values**: الكود يستخدم قيم افتراضية (15 SAR, 100 SAR) إذا ما قدر يجيب الإعدادات من Firebase
- **Real-time Updates**: أي تغيير في Firebase Console يظهر فوراً في التطبيق
- **Admin Control**: الأدمن يقدر يغير الإعدادات بدون ما يحتاج يعيد نشر التطبيق
- **Scalable**: سهل إضافة إعدادات جديدة (tax, payment methods, etc.)

---

## 🔍 مثال كامل

### في Cart:
```typescript
const { settings, loading: settingsLoading } = useSettings();

if (settingsLoading) {
  return <LoadingIndicator />;
}

const shippingCost = settings?.shipping?.enabled 
  ? settings.shipping.cost 
  : 0;

const freeShippingThreshold = settings?.shipping?.freeShippingThreshold ?? 100;
```

---

هذا النظام يخليك **مرن** و**محترف** - تقدر تغير الإعدادات بأي وقت بدون ما تحتاج تعيد نشر التطبيق! 🚀
