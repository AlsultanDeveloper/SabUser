# 📸 دليل إضافة البانرات في Firebase

## 🏗️ بنية البانرات في Firestore

### المجموعة: `banners`

كل بانر هو مستند (document) في مجموعة `banners` بالبنية التالية:

```json
{
  "title": {
    "en": "Summer Sale",
    "ar": "تخفيضات الصيف"
  },
  "subtitle": {
    "en": "Up to 50% off",
    "ar": "خصم يصل إلى 50%"
  },
  "image": "https://images.unsplash.com/photo-...",
  "order": 1
}
```

---

## 📋 خطوات إضافة البانرات

### الخطوة 1: فتح Firebase Console

1. اذهب إلى: https://console.firebase.google.com/
2. اختر المشروع: `sab-store-9b947`
3. من القائمة الجانبية، اختر **Firestore Database**

### الخطوة 2: إنشاء مجموعة البانرات

1. إذا لم تكن موجودة، انقر على **Start collection**
2. في حقل **Collection ID**، اكتب: `banners`
3. انقر **Next**

### الخطوة 3: إضافة البانر الأول

أدخل البيانات التالية:

#### **Document ID**
يمكنك:
- استخدام **Auto-ID** (الخيار الأفضل)
- أو استخدام ID مخصص مثل: `banner-1`, `summer-sale`, الخ

#### **الحقول (Fields)**

| Field | Type | Value (مثال) |
|-------|------|--------------|
| `title` | map | |
| `title.en` | string | "Summer Collection" |
| `title.ar` | string | "مجموعة الصيف" |
| `subtitle` | map | |
| `subtitle.en` | string | "Up to 50% off" |
| `subtitle.ar` | string | "خصم يصل إلى 50%" |
| `image` | string | "https://images.unsplash.com/photo-1441986300917-64674bd600d8" |
| `order` | number | 1 |

---

## 📸 كيفية إضافة الحقول في Firebase Console

### إضافة حقل `title` (نوع Map):

1. انقر **Add field**
2. **Field name**: `title`
3. **Type**: اختر `map` من القائمة المنسدلة
4. انقر **Add field** مرة أخرى (داخل الـ map)
   - **Field name**: `en`
   - **Type**: `string`
   - **Value**: `"Summer Collection"`
5. انقر **Add field** مرة أخرى (داخل نفس الـ map)
   - **Field name**: `ar`
   - **Type**: `string`
   - **Value**: `"مجموعة الصيف"`

### إضافة حقل `subtitle` (نوع Map):

نفس الخطوات السابقة:
- `subtitle.en` = "Up to 50% off"
- `subtitle.ar` = "خصم يصل إلى 50%"

### إضافة حقل `image` (نوع String):

1. انقر **Add field**
2. **Field name**: `image`
3. **Type**: `string`
4. **Value**: ضع رابط الصورة هنا (شاهد الأمثلة أدناه)

### إضافة حقل `order` (نوع Number):

1. انقر **Add field**
2. **Field name**: `order`
3. **Type**: `number`
4. **Value**: `1` (للبانر الأول، `2` للثاني، الخ)

---

## 🖼️ أمثلة على روابط صور للبانرات

يمكنك استخدام صور من **Unsplash** (مجانية):

### أمثلة لمتجر إلكتروني:

```
Fashion/Shopping:
https://images.unsplash.com/photo-1441986300917-64674bd600d8

Electronics:
https://images.unsplash.com/photo-1498049794561-7780e7231661

Home & Kitchen:
https://images.unsplash.com/photo-1556909212-d5b604d0c90d

Beauty Products:
https://images.unsplash.com/photo-1596462502278-27bfdc403348

Sale Banner:
https://images.unsplash.com/photo-1607083206968-13611e3d76db

New Arrivals:
https://images.unsplash.com/photo-1483985988355-763728e1935b

Sports & Fitness:
https://images.unsplash.com/photo-1517836357463-d25dfeac3438
```

### كيفية الحصول على رابط صورة من Unsplash:

1. اذهب إلى: https://unsplash.com/
2. ابحث عن الصورة التي تريدها (مثلاً: "shopping", "sale", "fashion")
3. افتح الصورة
4. انقر بالزر الأيمن على الصورة → **Copy image address**
5. الصق الرابط في حقل `image`

---

## 📝 أمثلة كاملة لبانرات جاهزة

### بانر 1: تخفيضات الصيف

```json
{
  "title": {
    "en": "Summer Sale",
    "ar": "تخفيضات الصيف"
  },
  "subtitle": {
    "en": "Up to 50% off on selected items",
    "ar": "خصم حتى 50% على منتجات مختارة"
  },
  "image": "https://images.unsplash.com/photo-1607083206968-13611e3d76db",
  "order": 1
}
```

### بانر 2: وصول جديد

```json
{
  "title": {
    "en": "New Arrivals",
    "ar": "وصل حديثاً"
  },
  "subtitle": {
    "en": "Discover the latest trends",
    "ar": "اكتشف أحدث الصيحات"
  },
  "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  "order": 2
}
```

### بانر 3: إلكترونيات

```json
{
  "title": {
    "en": "Electronics Deals",
    "ar": "عروض الإلكترونيات"
  },
  "subtitle": {
    "en": "Latest tech at best prices",
    "ar": "أحدث التقنيات بأفضل الأسعار"
  },
  "image": "https://images.unsplash.com/photo-1498049794561-7780e7231661",
  "order": 3
}
```

### بانر 4: أزياء

```json
{
  "title": {
    "en": "Fashion Collection",
    "ar": "مجموعة الأزياء"
  },
  "subtitle": {
    "en": "Style that speaks",
    "ar": "أناقة تتحدث عن نفسها"
  },
  "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
  "order": 4
}
```

### بانر 5: منتجات المنزل

```json
{
  "title": {
    "en": "Home Essentials",
    "ar": "أساسيات المنزل"
  },
  "subtitle": {
    "en": "Make your home beautiful",
    "ar": "اجعل منزلك جميلاً"
  },
  "image": "https://images.unsplash.com/photo-1556909212-d5b604d0c90d",
  "order": 5
}
```

---

## 🎯 نصائح مهمة

### حجم الصور
- **الأبعاد المثالية**: 1200 × 600 بكسل (نسبة 2:1)
- أو استخدم نسبة 16:9 للعرض الأفقي
- تأكد من أن الصورة واضحة وعالية الجودة

### ترتيب البانرات
- حقل `order` يحدد ترتيب ظهور البانرات
- البانر ذو الرقم الأقل يظهر أولاً
- مثال: `order: 1` يظهر قبل `order: 2`

### النصوص
- احرص على أن تكون النصوص قصيرة وجذابة
- استخدم عبارات تشجع على الشراء
- تأكد من إضافة الترجمة العربية والإنجليزية

---

## 🔒 قواعد Firebase (تم ضبطها بالفعل)

البانرات يمكن قراءتها من قبل الجميع:

```javascript
match /banners/{bannerId} {
  allow read: if true;  // ✅ يمكن للجميع قراءة البانرات
  allow write: if request.auth != null && 
    exists(/databases/$(database)/documents/admins/$(request.auth.uid));
  // ✅ فقط المدراء يمكنهم الإضافة/التعديل/الحذف
}
```

---

## ✅ كيفية التحقق من عمل البانرات

بعد إضافة البانرات:

1. افتح التطبيق
2. اذهب إلى الصفحة الرئيسية
3. يجب أن ترى البانرات في الأعلى
4. تأكد من أنها تتحرك تلقائياً كل 4 ثوانٍ
5. تأكد من ظهور النقاط السفلية التي تشير للبانر الحالي

---

## 🛠️ استكشاف الأخطاء

### البانرات لا تظهر؟

1. **تحقق من Console في التطبيق**:
   - إذا ظهر: `❌ Error loading banners: Missing or insufficient permissions`
   - **الحل**: تأكد من أن قواعد Firebase تسمح بالقراءة (راجع القسم أعلاه)

2. **تحقق من البيانات في Firestore**:
   - افتح Firebase Console
   - تأكد من وجود مجموعة `banners`
   - تأكد من أن كل بانر يحتوي على جميع الحقول المطلوبة

3. **تحقق من روابط الصور**:
   - انسخ رابط الصورة والصقه في المتصفح
   - تأكد من أن الصورة تفتح بدون مشاكل
   - بعض الروابط قد تنتهي صلاحيتها

### البانرات تظهر فارغة؟

- تأكد من أن حقل `image` يحتوي على رابط صحيح
- تأكد من أن الحقل اسمه `image` بالضبط (حساس لحالة الأحرف)

### البانرات بترتيب خاطئ؟

- تحقق من قيم حقل `order`
- الرقم الأقل يظهر أولاً

---

## 📸 لقطات شاشة توضيحية

### كيف يجب أن تبدو البانرات في Firebase Console:

```
📁 banners (Collection)
  ├─ 📄 banner-1
  │   ├─ title (map)
  │   │   ├─ en: "Summer Sale"
  │   │   └─ ar: "تخفيضات الصيف"
  │   ├─ subtitle (map)
  │   │   ├─ en: "Up to 50% off"
  │   │   └─ ar: "خصم حتى 50%"
  │   ├─ image: "https://..."
  │   └─ order: 1
  │
  ├─ 📄 banner-2
  │   └─ ... (نفس البنية)
  │
  └─ 📄 banner-3
      └─ ... (نفس البنية)
```

---

## 🚀 الخطوة التالية

بعد إضافة البانرات:

1. يمكنك إضافة روابط للبانرات (لفتح فئة معينة أو منتج)
2. يمكنك إضافة تواريخ بداية ونهاية لعرض البانر
3. يمكنك إضافة زر للبانر يؤدي إلى صفحة معينة

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. تحقق من Console في التطبيق
2. تحقق من Firebase Console
3. راجع هذا الدليل
4. تواصل مع الدعم

---

**آخر تحديث**: 2025-10-26  
**Firebase Project**: sab-store-9b947
