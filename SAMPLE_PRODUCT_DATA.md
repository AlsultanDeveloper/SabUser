# 📦 مثال بيانات منتج كامل للاختبار

## كيفية الاستخدام:
1. افتح Firebase Console
2. اذهب إلى Firestore Database
3. افتح أي منتج موجود
4. أضف/حدّث الحقول التالية

---

## 🎯 البيانات الكاملة (JSON)

انسخ والصق في Firebase Console:

```json
{
  "name": {
    "ar": "قميص أطفال صيفي",
    "en": "Kids Summer T-Shirt"
  },
  "description": {
    "ar": "قميص قطني مريح للأطفال، مثالي للصيف. مصنوع من قطن عالي الجودة.",
    "en": "Comfortable cotton t-shirt for kids, perfect for summer. Made from high-quality cotton."
  },
  "price": 25,
  "image": "https://example.com/product-image.jpg",
  "images": [
    "https://example.com/product-image-1.jpg",
    "https://example.com/product-image-2.jpg",
    "https://example.com/product-image-3.jpg"
  ],
  "brand": "SAB",
  "brandId": "sab-brand-id-123",
  "brandName": "SAB",
  "categoryId": "fashion-kids-id",
  "categoryName": "ملابس أطفال",
  "subcategoryName": "قمصان أولاد",
  "rating": 4.5,
  "reviews": 120,
  "inStock": true,
  "stock": 50,
  "available": true,
  "discount": 20,
  "featured": true,
  "deliveryTime": "2-3 أيام",
  "colors": [
    {
      "ar": "أحمر",
      "en": "Red",
      "hex": "#FF0000"
    },
    {
      "ar": "أزرق",
      "en": "Blue",
      "hex": "#0000FF"
    },
    {
      "ar": "أخضر",
      "en": "Green",
      "hex": "#00FF00"
    },
    {
      "ar": "أبيض",
      "en": "White",
      "hex": "#FFFFFF"
    }
  ],
  "sizes": ["S", "M", "L", "XL", "2XL"],
  "ageRange": ["2-3 years", "3-4 years", "5-6 years"],
  "gender": "Boy",
  "season": "Summer",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## 📝 شرح الحقول الجديدة

### 1️⃣ **معلومات العلامة التجارية والفئة**
```json
"brandName": "SAB",           // اسم العلامة التجارية (يظهر في Badge)
"categoryName": "ملابس أطفال", // اسم الفئة
"subcategoryName": "قمصان أولاد" // اسم الفئة الفرعية
```

### 2️⃣ **الألوان (Colors)**
```json
"colors": [
  {
    "ar": "أحمر",    // الاسم بالعربية
    "en": "Red",     // الاسم بالإنجليزية
    "hex": "#FF0000" // كود اللون Hex
  }
]
```

### 3️⃣ **المقاسات (Sizes)**
```json
"sizes": ["S", "M", "L", "XL", "2XL"]
```

### 4️⃣ **مقاسات الأحذية (Shoe Sizes)**
```json
"shoeSizes": ["35", "36", "37", "38", "39", "40"]
```

### 5️⃣ **الفئة العمرية (Age Range)**
```json
"ageRange": ["2-3 years", "3-4 years", "5-6 years"]
```

### 6️⃣ **الجنس (Gender)**
قيم مسموحة:
- `"Boy"` - أولاد
- `"Girl"` - بنات
- `"Unisex-Kids"` - للجنسين (أطفال)
- `"Men"` - رجال
- `"Women"` - نساء
- `"Unisex"` - للجنسين (كبار)

```json
"gender": "Boy"
```

### 7️⃣ **الموسم (Season)**
قيم مسموحة:
- `"Summer"` - صيفي
- `"Winter"` - شتوي
- `"All-Season"` - جميع المواسم

```json
"season": "Summer"
```

### 8️⃣ **مدة التوصيل (Delivery Time)**
```json
"deliveryTime": "2-3 أيام"
```

### 9️⃣ **المخزون (Stock)**
```json
"stock": 50,        // عدد القطع المتاحة
"available": true,  // متوفر/غير متوفر
"inStock": true     // في المخزن
```

---

## 🎨 أمثلة إضافية

### مثال 1: حذاء رياضي
```json
{
  "name": {
    "ar": "حذاء رياضي للأطفال",
    "en": "Kids Sports Shoes"
  },
  "brandName": "Nike",
  "categoryName": "أحذية",
  "subcategoryName": "أحذية رياضية",
  "shoeSizes": ["30", "31", "32", "33", "34", "35"],
  "colors": [
    {"ar": "أسود", "en": "Black", "hex": "#000000"},
    {"ar": "أبيض", "en": "White", "hex": "#FFFFFF"}
  ],
  "ageRange": ["5-7 years", "8-10 years"],
  "gender": "Unisex-Kids",
  "season": "All-Season",
  "deliveryTime": "3-5 أيام"
}
```

### مثال 2: فستان بنات
```json
{
  "name": {
    "ar": "فستان صيفي للبنات",
    "en": "Girls Summer Dress"
  },
  "brandName": "SAB",
  "categoryName": "ملابس أطفال",
  "subcategoryName": "فساتين بنات",
  "sizes": ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
  "colors": [
    {"ar": "وردي", "en": "Pink", "hex": "#FFC0CB"},
    {"ar": "أزرق فاتح", "en": "Light Blue", "hex": "#ADD8E6"}
  ],
  "ageRange": ["4-6 years", "7-9 years", "10-12 years"],
  "gender": "Girl",
  "season": "Summer",
  "deliveryTime": "2-3 أيام"
}
```

### مثال 3: جاكيت شتوي
```json
{
  "name": {
    "ar": "جاكيت شتوي للأولاد",
    "en": "Boys Winter Jacket"
  },
  "brandName": "SAB",
  "categoryName": "ملابس أطفال",
  "subcategoryName": "جواكت",
  "sizes": ["S", "M", "L", "XL"],
  "colors": [
    {"ar": "أسود", "en": "Black", "hex": "#000000"},
    {"ar": "كحلي", "en": "Navy", "hex": "#000080"}
  ],
  "ageRange": ["5-7 years", "8-10 years", "11-13 years"],
  "gender": "Boy",
  "season": "Winter",
  "deliveryTime": "2-4 أيام"
}
```

---

## 🔄 كيفية التطبيق على منتج موجود

### الطريقة 1: تحديث في Firebase Console
1. افتح Firebase Console
2. Firestore Database > products
3. اختر منتج موجود
4. اضغط "Add field" أو "Edit"
5. أضف الحقول الجديدة واحداً تلو الآخر

### الطريقة 2: استيراد JSON (أسرع)
إذا كنت تستخدم Firebase Admin SDK أو Postman:
```javascript
// مثال باستخدام Firebase Admin SDK
const admin = require('firebase-admin');
const db = admin.firestore();

const productId = 'YOUR_PRODUCT_ID';
const updatedData = {
  brandName: "SAB",
  categoryName: "ملابس أطفال",
  colors: [
    {ar: "أحمر", en: "Red", hex: "#FF0000"},
    {ar: "أزرق", en: "Blue", hex: "#0000FF"}
  ],
  sizes: ["S", "M", "L", "XL"],
  gender: "Boy",
  season: "Summer",
  deliveryTime: "2-3 أيام"
};

await db.collection('products').doc(productId).update(updatedData);
console.log('✅ Product updated successfully!');
```

---

## ✅ Checklist للتحقق

بعد إضافة البيانات:
- [ ] `brandName` موجود
- [ ] `categoryName` موجود
- [ ] `colors` موجود ومصفوفة (Array)
- [ ] كل لون له `ar`, `en`, `hex`
- [ ] `sizes` أو `shoeSizes` موجود
- [ ] `gender` موجود وقيمته صحيحة
- [ ] `season` موجود وقيمته صحيحة
- [ ] `deliveryTime` موجود

---

## 🎯 النتيجة المتوقعة

بعد إضافة هذه البيانات وإعادة تحميل التطبيق:
- ✅ Brand Badge يظهر على صورة المنتج
- ✅ اسم الفئة يظهر في البطاقة
- ✅ جميع التفاصيل تظهر في صفحة المنتج

---

## 💡 نصائح

1. **ابدأ بمنتج واحد** للتجربة
2. **استخدم Firebase Console** للتعديل اليدوي أولاً
3. **تحقق من النتيجة** قبل تطبيقه على باقي المنتجات
4. **يمكنك نسخ البيانات** من منتج لآخر

---

✅ **جاهز للاستخدام!**
