# 📊 دليل بيانات المنتجات - Firebase و التطبيق

## 🔍 هيكل بيانات المنتج في Firestore

### البيانات المطلوبة في Firestore (كل منتج):

```json
{
  "name": {
    "en": "Wireless Headphones Pro",
    "ar": "سماعات لاسلكية برو"
  },
  "description": {
    "en": "Premium wireless headphones with active noise cancellation",
    "ar": "سماعات لاسلكية فاخرة مع إلغاء الضوضاء النشط"
  },
  "price": 199.99,
  "image": "https://images.unsplash.com/photo-1234567890",
  "images": [
    "https://images.unsplash.com/photo-1234567890",
    "https://images.unsplash.com/photo-0987654321",
    "https://images.unsplash.com/photo-1122334455"
  ],
  "categoryId": "electronics",
  "brandId": "brand-audiotech",
  "brand": "AudioTech",
  "rating": 4.8,
  "reviews": 342,
  "inStock": true,
  "discount": 15,
  "featured": true,
  "createdAt": "2025-10-26T12:00:00Z"
}
```

---

## 📋 البيانات التي تظهر في التطبيق

### 🏠 في الصفحة الرئيسية (Home Screen):

```
ProductCard يعرض:
├── 📸 image (صورة المنتج الرئيسية)
├── 🏷️ brand (اسم الماركة)
├── 📝 name[language] (اسم المنتج بالعربي/الإنجليزي)
├── ⭐ rating (التقييم - من 5)
├── 💬 reviews (عدد المراجعات)
├── 💰 price (السعر الأصلي)
├── 🏷️ discount (نسبة الخصم - اختياري)
├── 💵 finalPrice (السعر بعد الخصم)
└── ❤️ favorite button (زر الإضافة للمفضلة)
```

### 📱 صفحة تفاصيل المنتج (Product Detail):

```
يجب أن تعرض:
├── 📸 images[] (كل الصور - carousel)
├── 📝 name[language] (الاسم)
├── 📄 description[language] (الوصف الكامل)
├── 🏷️ brand (الماركة)
├── ⭐ rating + reviews
├── 💰 price (السعر)
├── 🏷️ discount (الخصم)
├── ✅ inStock (متوفر/غير متوفر)
├── 🛒 "Add to Cart" button
└── ❤️ "Add to Wishlist" button
```

---

## ⚠️ المشاكل المحتملة

### 1️⃣ بيانات ناقصة في Firestore

إذا لم تظهر كل التفاصيل، تحقق من:

```javascript
// ✅ البيانات الإلزامية (يجب أن تكون موجودة):
{
  "name": { "en": "...", "ar": "..." },  // ✓ مطلوب
  "description": { "en": "...", "ar": "..." },  // ✓ مطلوب
  "price": 199.99,  // ✓ مطلوب
  "image": "https://...",  // ✓ مطلوب
  "categoryId": "electronics",  // ✓ مطلوب
  "brand": "AudioTech",  // ✓ مطلوب
  "rating": 4.8,  // ✓ مطلوب
  "reviews": 342,  // ✓ مطلوب
  "inStock": true  // ✓ مطلوب
}

// ⚠️ البيانات الاختيارية:
{
  "images": [...],  // اختياري - لصفحة التفاصيل
  "discount": 15,  // اختياري - إذا كان هناك خصم
  "featured": true,  // اختياري - للمنتجات المميزة
  "brandId": "brand-1"  // اختياري - للربط مع مجموعة brands
}
```

### 2️⃣ تنسيق خاطئ للبيانات

```javascript
// ❌ خطأ - name كـ string
{
  "name": "Wireless Headphones"  // خطأ!
}

// ✅ صحيح - name كـ object
{
  "name": {
    "en": "Wireless Headphones",
    "ar": "سماعات لاسلكية"
  }
}
```

### 3️⃣ روابط الصور معطلة

```javascript
// ❌ خطأ - رابط محلي
{
  "image": "./assets/product.jpg"  // لن يعمل
}

// ✅ صحيح - رابط كامل
{
  "image": "https://images.unsplash.com/photo-1234567890"
}
```

---

## 🔧 كيفية إضافة منتج كامل في Firestore

### الطريقة 1: من Firebase Console

1. افتح Firebase Console: https://console.firebase.google.com/
2. اختر Project: **sab-store-9b947**
3. اذهب إلى **Firestore Database**
4. افتح collection: **products**
5. اضغط **"Add document"**
6. **Document ID**: اتركه auto-generated أو اكتب معرف مخصص
7. أضف الحقول التالية:

```
Field: name
Type: map
  ├── en (string): Wireless Headphones Pro
  └── ar (string): سماعات لاسلكية برو

Field: description
Type: map
  ├── en (string): Premium wireless headphones...
  └── ar (string): سماعات لاسلكية فاخرة...

Field: price
Type: number
Value: 199.99

Field: image
Type: string
Value: https://images.unsplash.com/photo-1505740420928-5e560c06d30e

Field: images
Type: array
  ├── 0 (string): https://images.unsplash.com/photo-1...
  ├── 1 (string): https://images.unsplash.com/photo-2...
  └── 2 (string): https://images.unsplash.com/photo-3...

Field: categoryId
Type: string
Value: electronics

Field: brand
Type: string
Value: AudioTech

Field: brandId
Type: string (optional)
Value: brand-audiotech

Field: rating
Type: number
Value: 4.8

Field: reviews
Type: number
Value: 342

Field: inStock
Type: boolean
Value: true

Field: discount
Type: number (optional)
Value: 15

Field: featured
Type: boolean (optional)
Value: true

Field: createdAt
Type: timestamp
Value: (اضغط "Use current timestamp")
```

### الطريقة 2: استخدام Firebase Admin SDK (للوحة التحكم)

```javascript
// في لوحة التحكم الخاصة بك
const admin = require('firebase-admin');
const db = admin.firestore();

async function addProduct(productData) {
  try {
    const docRef = await db.collection('products').add({
      name: {
        en: productData.nameEn,
        ar: productData.nameAr
      },
      description: {
        en: productData.descriptionEn,
        ar: productData.descriptionAr
      },
      price: parseFloat(productData.price),
      image: productData.image,
      images: productData.images || [productData.image],
      categoryId: productData.categoryId,
      brand: productData.brand,
      brandId: productData.brandId || null,
      rating: parseFloat(productData.rating) || 0,
      reviews: parseInt(productData.reviews) || 0,
      inStock: productData.inStock !== false,
      discount: parseInt(productData.discount) || 0,
      featured: productData.featured || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Product added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding product:', error);
    throw error;
  }
}

// مثال للاستخدام:
addProduct({
  nameEn: 'Wireless Headphones Pro',
  nameAr: 'سماعات لاسلكية برو',
  descriptionEn: 'Premium wireless headphones with active noise cancellation',
  descriptionAr: 'سماعات لاسلكية فاخرة مع إلغاء الضوضاء النشط',
  price: '199.99',
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944',
    'https://images.unsplash.com/photo-1545127398-14699f92334b'
  ],
  categoryId: 'electronics',
  brand: 'AudioTech',
  brandId: 'brand-audiotech',
  rating: '4.8',
  reviews: '342',
  inStock: true,
  discount: '15',
  featured: true
});
```

---

## 🎨 تحسين عرض المنتجات في التطبيق

إذا أردت إضافة المزيد من التفاصيل في عرض المنتج، يمكنك تعديل `ProductCard`:

### في `app/(tabs)/home.tsx`:

```tsx
function ProductCard({ product, onPress, formatPrice, language }: ProductCardProps) {
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <Animated.View style={[styles.productCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={onPress}>
        {/* الصورة */}
        <View style={styles.productImageContainer}>
          <SafeImage uri={product.image} style={styles.productImage} />
          
          {/* شارة الخصم */}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          
          {/* حالة المخزون */}
          {!product.inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>
                {language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
              </Text>
            </View>
          )}
        </View>

        {/* معلومات المنتج */}
        <View style={styles.productInfo}>
          {/* الماركة */}
          <Text style={styles.productBrand}>{product.brand}</Text>
          
          {/* الاسم */}
          <Text style={styles.productName} numberOfLines={2}>
            {product.name[language]}
          </Text>
          
          {/* التقييم */}
          <View style={styles.ratingContainer}>
            <Feather name="star" size={13} color={Colors.warning} />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({product.reviews})</Text>
          </View>
          
          {/* السعر */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
            {product.discount > 0 && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.price)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
```

---

## 🔍 التحقق من البيانات

### استخدم هذا الكود للتحقق من بيانات المنتجات:

```javascript
// في Firebase Console → Firestore → Rules Playground
// أو في متصفح Developer Tools عند تحميل التطبيق

// تحقق من كل منتج:
products.forEach(product => {
  console.log(`Checking product: ${product.id}`);
  
  // تحقق من الحقول المطلوبة
  if (!product.name?.en || !product.name?.ar) {
    console.error(`❌ Missing name translation for ${product.id}`);
  }
  if (!product.description?.en || !product.description?.ar) {
    console.warn(`⚠️ Missing description translation for ${product.id}`);
  }
  if (!product.price || product.price <= 0) {
    console.error(`❌ Invalid price for ${product.id}`);
  }
  if (!product.image) {
    console.error(`❌ Missing image for ${product.id}`);
  }
  if (!product.categoryId) {
    console.error(`❌ Missing categoryId for ${product.id}`);
  }
  if (!product.brand) {
    console.error(`❌ Missing brand for ${product.id}`);
  }
  if (product.rating < 0 || product.rating > 5) {
    console.warn(`⚠️ Invalid rating for ${product.id}`);
  }
  if (typeof product.inStock !== 'boolean') {
    console.warn(`⚠️ inStock should be boolean for ${product.id}`);
  }
});
```

---

## 📊 ملخص سريع

| الحقل | النوع | مطلوب؟ | يظهر في | ملاحظات |
|-------|-------|---------|---------|---------|
| `name.en` | string | ✅ نعم | الكل | الاسم بالإنجليزي |
| `name.ar` | string | ✅ نعم | الكل | الاسم بالعربي |
| `description.en` | string | ✅ نعم | التفاصيل | الوصف بالإنجليزي |
| `description.ar` | string | ✅ نعم | التفاصيل | الوصف بالعربي |
| `price` | number | ✅ نعم | الكل | السعر بالدولار |
| `image` | string | ✅ نعم | الكل | الصورة الرئيسية (URL) |
| `images` | array | ⚠️ موصى به | التفاصيل | صور إضافية |
| `categoryId` | string | ✅ نعم | - | معرف الفئة |
| `brand` | string | ✅ نعم | الكل | اسم الماركة |
| `brandId` | string | ❌ اختياري | - | معرف الماركة |
| `rating` | number | ✅ نعم | الكل | التقييم (0-5) |
| `reviews` | number | ✅ نعم | الكل | عدد المراجعات |
| `inStock` | boolean | ✅ نعم | الكل | متوفر؟ |
| `discount` | number | ❌ اختياري | الكل | نسبة الخصم |
| `featured` | boolean | ❌ اختياري | الرئيسية | منتج مميز؟ |

---

## 🚀 الخطوات التالية

1. ✅ تحقق من بيانات المنتجات في Firestore
2. ✅ تأكد من وجود كل الحقول المطلوبة
3. ✅ تأكد من تنسيق `name` و `description` (كـ objects)
4. ✅ تأكد من صحة روابط الصور
5. ✅ اختبر عرض المنتجات في التطبيق

**هل تريد أن أفحص منتج معين في Firestore لأرى ما هو المفقود؟** 🔍
