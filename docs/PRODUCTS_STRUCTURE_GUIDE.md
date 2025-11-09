# 📦 دليل بنية المنتجات في Firebase

## 🏗️ البنية الكاملة

```
Firebase Firestore
├── categories (مجموعة الفئات الرئيسية)
│   ├── {categoryId} (مثال: 2qhztjWrtdHZBl9BFtTo)
│   │   ├── name: { ar: "قطع سيارات", en: "Auto Parts" }
│   │   ├── image: "url..."
│   │   └── subcategory (مجموعة فرعية)
│   │       ├── {subcategoryId} (مثال: GXakfwzrVqoStlGav7gR)
│   │       │   ├── name: { ar: "حقائب", en: "Bags" }
│   │       │   └── image: "url..."
│   │       └── {subcategoryId}...
│   └── {categoryId}...
│
└── products (مجموعة المنتجات)
    ├── {productId}
    │   ├── name: { ar: "اسم المنتج", en: "Product Name" }
    │   ├── price: 100
    │   ├── categoryId: "2qhztjWrtdHZBl9BFtTo" ⚠️ مهم جداً
    │   ├── subcategoryId: "GXakfwzrVqoStlGav7gR" ⚠️ مهم جداً
    │   └── ... (باقي الحقول)
    └── {productId}...
```

## ✅ كيفية إضافة منتج جديد بشكل صحيح

### 1. الحقول الإلزامية

عند إضافة منتج جديد في Firebase، تأكد من إضافة هذه الحقول:

```javascript
{
  // الحقول الأساسية
  "name": {
    "ar": "اسم المنتج بالعربية",
    "en": "Product Name in English"
  },
  "description": {
    "ar": "وصف المنتج بالعربية",
    "en": "Product description in English"
  },
  "price": 100.00,
  "image": "https://...", // الصورة الرئيسية
  "images": [
    "https://image1.jpg",
    "https://image2.jpg"
  ],
  
  // 🔴 الحقول المهمة جداً لربط المنتج بالفئات
  "categoryId": "2qhztjWrtdHZBl9BFtTo", // معرف الفئة الرئيسية
  "subcategoryId": "GXakfwzrVqoStlGav7gR", // معرف الفئة الفرعية
  
  // حقول إضافية
  "brand": "Brand Name",
  "rating": 4.5,
  "reviews": 120,
  "inStock": true,
  "discount": 10, // نسبة الخصم (10%)
  "stock": 50,
  "createdAt": "2025-11-02T00:00:00Z"
}
```

### 2. كيفية الحصول على `categoryId` و `subcategoryId`

#### الطريقة 1: من Firebase Console
1. افتح Firebase Console
2. اذهب إلى Firestore
3. افتح `categories` collection
4. انسخ الـ **Document ID** للفئة الرئيسية (مثال: `2qhztjWrtdHZBl9BFtTo`)
5. ادخل على الفئة واذهب للـ `subcategory` subcollection
6. انسخ الـ **Document ID** للفئة الفرعية (مثال: `GXakfwzrVqoStlGav7gR`)

#### الطريقة 2: من التطبيق
1. افتح التطبيق
2. افتح Developer Console
3. عند الضغط على فئة فرعية، سترى في الـ Console:
   ```
   Subcategory pressed: { id: "GXakfwzrVqoStlGav7gR", ... }
   ```

### 3. مثال كامل لإضافة منتج

```javascript
// منتج: حقيبة يد جلدية
{
  "name": {
    "ar": "حقيبة يد جلدية فاخرة",
    "en": "Premium Leather Handbag"
  },
  "description": {
    "ar": "حقيبة يد مصنوعة من الجلد الطبيعي بتصميم عصري",
    "en": "Handbag made of genuine leather with modern design"
  },
  "price": 150.00,
  "image": "https://example.com/bag1.jpg",
  "images": [
    "https://example.com/bag1.jpg",
    "https://example.com/bag2.jpg",
    "https://example.com/bag3.jpg"
  ],
  
  // ربط المنتج بالفئات
  "categoryId": "2qhztjWrtdHZBl9BFtTo", // قطع سيارات وإكسسوارات
  "subcategoryId": "GXakfwzrVqoStlGav7gR", // حقائب وإكسسوارات
  "categoryName": "Auto Parts & Accessories",
  "subcategoryName": "Bags & Accessories", // اختياري (للتوافق القديم)
  
  // معلومات إضافية
  "brand": "Luxury Brand",
  "brandId": "brand123",
  "brandName": "Luxury Brand",
  "rating": 4.8,
  "reviews": 230,
  "inStock": true,
  "discount": 15,
  "stock": 25,
  "available": true,
  
  // خيارات المنتج
  "colors": [
    { "ar": "أسود", "en": "Black", "hex": "#000000" },
    { "ar": "بني", "en": "Brown", "hex": "#8B4513" }
  ],
  "sizes": ["Small", "Medium", "Large"],
  "gender": "Women",
  
  // تواريخ
  "createdAt": "2025-11-02T00:00:00Z",
  "updatedAt": "2025-11-02T00:00:00Z"
}
```

## 🔍 كيفية التحقق من أن المنتج مرتبط بشكل صحيح

### في Firebase Console:
1. افتح `products` collection
2. اختر أي منتج
3. تأكد من وجود:
   - ✅ `categoryId` (يجب أن يكون Document ID صحيح من categories)
   - ✅ `subcategoryId` (يجب أن يكون Document ID صحيح من subcategory)

### في التطبيق:
1. شغل التطبيق
2. افتح Developer Console
3. ابحث عن هذه الرسائل:
   ```
   📦 جاري جلب المنتجات من Firebase...
   📊 عدد المنتجات المسترجعة: 4362
   ✅ تم تحميل 4362 منتج بنجاح من Firebase
   ```

## 🐛 حل المشاكل الشائعة

### المشكلة: المنتجات لا تظهر في الصفحة الرئيسية
**الحل:**
- تأكد من أن المنتجات لديها حقل `createdAt` بتاريخ صحيح
- تأكد من أن Firebase قواعد الأمان تسمح بالقراءة

### المشكلة: المنتجات لا تظهر عند اختيار فئة فرعية
**الحل:**
- تأكد من أن `subcategoryId` في المنتج يطابق **بالضبط** الـ Document ID في subcategory
- تأكد من أن `categoryId` موجود ويطابق الفئة الرئيسية

### المشكلة: الصور لا تظهر
**الحل:**
- تأكد من أن رابط الصورة صحيح وقابل للوصول
- تأكد من أن Firebase Storage Rules تسمح بالقراءة

## 📊 بنية المنتج الكاملة (جميع الحقول الممكنة)

```typescript
interface Product {
  // الحقول الأساسية (إلزامية)
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  image: string;
  images: string[];
  
  // ربط الفئات (إلزامي للفلترة)
  categoryId: string; // ⚠️ مهم
  subcategoryId: string; // ⚠️ مهم
  categoryName?: string;
  subcategoryName?: string;
  
  // معلومات البراند
  brand: string;
  brandId?: string;
  brandName?: string;
  
  // التقييمات
  rating: number;
  reviews: number;
  
  // التوفر والمخزون
  inStock: boolean;
  stock?: number;
  available?: boolean;
  
  // الخصم
  discount?: number; // نسبة مئوية (0-100)
  
  // خيارات المنتج
  colors?: Array<{ ar: string; en: string; hex: string }>;
  sizes?: string[];
  shoeSizes?: string[];
  ageRange?: string[];
  gender?: 'Boy' | 'Girl' | 'Unisex-Kids' | 'Men' | 'Women' | 'Unisex';
  season?: 'Summer' | 'Winter' | 'All-Season';
  
  // معلومات إضافية
  deliveryTime?: string;
  material?: string;
  careInstructions?: string;
  features?: string[];
  
  // تواريخ
  createdAt?: string;
  updatedAt?: string;
}
```

## 🚀 نصائح للأداء الأفضل

1. **استخدم Indexes في Firestore**
   - أضف index على `categoryId`
   - أضف index على `subcategoryId`
   - أضف composite index على `(categoryId, createdAt)`

2. **حجم الصور**
   - استخدم صور مضغوطة (WebP)
   - الحجم المثالي: 800x800 بكسل
   - احفظ الصور في Firebase Storage

3. **التخزين المؤقت**
   - التطبيق يستخدم React Query للتخزين المؤقت
   - البيانات تبقى لمدة 5 دقائق

## 📝 ملاحظات مهمة

1. **لا تستخدم `subcategoryName` فقط** - استخدم `subcategoryId` للضمان
2. **تأكد من صحة الـ IDs** - انسخها مباشرة من Firebase Console
3. **اختبر في التطبيق** - تأكد من ظهور المنتجات بعد الإضافة
4. **راقب Console logs** - للتأكد من عدد المنتجات المحملة

## 🎯 الخطوات التالية

1. ✅ تأكد من أن جميع المنتجات لديها `categoryId` و `subcategoryId`
2. ✅ اختبر التطبيق وتأكد من ظهور المنتجات
3. ✅ إذا كانت المنتجات القديمة بدون `subcategoryId`، قم بتحديثها
4. ✅ استخدم Admin Panel لإضافة المنتجات الجديدة بسهولة

---

**آخر تحديث:** 2 نوفمبر 2025
