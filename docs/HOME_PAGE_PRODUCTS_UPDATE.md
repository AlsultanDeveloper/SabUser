# تحديث المنتجات في الصفحة الرئيسية - Home Page Products Update

## 📋 نظرة عامة | Overview

تم تحديث نظام عرض المنتجات في الصفحة الرئيسية لعرض 10 منتجات موزعة بشكل متساوٍ عبر 5 فئات رئيسية، مع تغيير عشوائي للمنتجات في كل مرة يتم فيها فتح التطبيق.

## 🎯 المتطلبات | Requirements

**المنتجات المعروضة:**
- ✅ إجمالي: **10 منتجات**
- ✅ التوزيع: **2 منتج من كل فئة**

**الفئات الخمس:**
1. 🛒 **SAB MARKET** - 2 منتجات
2. 👗 **WOMEN TOPS** - 2 منتجات (subcategory)
3. 👔 **MEN FASHION** - 2 منتجات
4. 👜 **BAGS** - 2 منتجات
5. 👶 **KIDS** - 2 منتجات

**السلوك:**
- ✅ المنتجات تتغير عشوائياً في كل مرة يفتح المستخدم التطبيق
- ✅ جلب 50 منتج من كل فئة واختيار 2 عشوائياً
- ✅ خلط المنتجات النهائية للعرض العشوائي
- ✅ التأكد من وجود صور لجميع المنتجات

## 🔧 التغييرات التقنية | Technical Changes

### 1. تحديث `useFeaturedProducts` Hook
**الملف:** `hooks/useFirestore.ts`

**قبل التحديث:**
```typescript
// كان يجلب 10 منتجات من SAB MARKET فقط
const q = query(
  productsRef,
  where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ'), // Sab Market فقط
  limit(10)
);
```

**بعد التحديث:**
```typescript
// الآن يجلب 2 منتجات من كل فئة (5 فئات مختلفة)
// استخدام subcategoryId لـ Women Tops وcategoryId للباقي
const categories = [
  { name: 'SAB MARKET', type: 'category', id: 'cwt28D5gjoLno8SFqoxQ' },
  { name: 'WOMEN TOPS', type: 'subcategory', id: 'PQMIdt0RsQU1zv0NvTIH' },
  { name: 'MEN FASHION', type: 'category', id: 'rQHqjYp40tLDCCPzGTgL' },
  { name: 'BAGS', type: 'category', id: 'l2OsNMzQ7z5u66E5Y0xK' },
  { name: 'KIDS', type: 'category', id: 'RdnhFj3MlvHY1Ee1xQ4t' }
];

// حلقة على كل فئة
for (const category of categories) {
  // استخدام الحقل المناسب (categoryId أو subcategoryId)
  const fieldName = category.type === 'subcategory' ? 'subcategoryId' : 'categoryId';
  
  const q = query(productsRef, where(fieldName, '==', category.id), limit(100));
  
  // اختيار 2 عشوائياً
  const shuffled = categoryProducts.sort(() => Math.random() - 0.5);
  const selectedProducts = shuffled.slice(0, 2);
}

// خلط نهائي للمنتجات
const finalProducts = allProducts.sort(() => Math.random() - 0.5);
```

### 2. إضافة Logging في الصفحة الرئيسية
**الملف:** `app/(tabs)/home.tsx`

```typescript
useEffect(() => {
  if (featuredProducts && featuredProducts.length > 0) {
    console.log('🏠 Home Page - Featured Products Loaded:');
    console.log(`📊 Total: ${featuredProducts.length} products`);
    
    // عد المنتجات حسب الفئة
    const categoryCounts: { [key: string]: number } = {};
    featuredProducts.forEach((product: any) => {
      const category = product.categoryName || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    console.log('📦 Products by Category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} products`);
    });
  }
}, [featuredProducts]);
```

### 3. تحديث Cache Settings
**قبل:**
```typescript
staleTime: 5 * 60 * 1000, // 5 دقائق
refetchOnMount: false, // لا يتم التحديث عند mount
```

**بعد:**
```typescript
staleTime: 2 * 60 * 1000, // 2 دقيقة - تحديث أسرع
refetchOnMount: true, // ✅ تحديث عند mount للحصول على منتجات جديدة
```

## 📊 معرفات الفئات | Category IDs

| الفئة | Type | ID |
|------|------|-----|
| SAB MARKET | category | `cwt28D5gjoLno8SFqoxQ` |
| WOMEN TOPS | subcategory | `PQMIdt0RsQU1zv0NvTIH` |
| MEN FASHION | category | `rQHqjYp40tLDCCPzGTgL` |
| BAGS | category | `l2OsNMzQ7z5u66E5Y0xK` |
| KIDS | category | `RdnhFj3MlvHY1Ee1xQ4t` |

## 🎨 تأثير على واجهة المستخدم | UI Impact

### العرض في الصفحة الرئيسية:
```
┌─────────────────────────────────────┐
│  Welcome - Sab Store                │
│  Shop premium quality products      │
├─────────────────────────────────────┤
│  [Exchange Rate Banner]             │
│  [Search Bar]                       │
│  [Category Banner - SAB MARKET]     │
├─────────────────────────────────────┤
│  Popular Categories                 │
│  [Category Icons Row]               │
├─────────────────────────────────────┤
│  Scroll to see our products         │
│                                     │
│  Row 1: [Product 1] [Product 2]    │ ← قد تكون من فئات مختلفة
│  Row 2: [Product 3] [Product 4]    │
│  Row 3: [Product 5] [Product 6]    │
│  Row 4: [Product 7] [Product 8]    │
│  Row 5: [Product 9] [Product 10]   │
│                                     │
│  إجمالي: 10 منتجات                │
│  2 من كل فئة (عشوائياً)           │
└─────────────────────────────────────┘
```

## 🔄 سلوك التحديث | Refresh Behavior

1. **عند فتح التطبيق:**
   - يتم جلب منتجات جديدة عشوائياً
   - المنتجات تتغير في كل مرة

2. **Pull to Refresh:**
   - يمكن للمستخدم سحب للتحديث
   - يتم جلب مجموعة جديدة من المنتجات

3. **Cache:**
   - مدة الكاش: 2 دقيقة
   - بعدها يتم جلب منتجات جديدة تلقائياً

## 📝 Console Output مثال | Example Console Output

عند تحميل الصفحة الرئيسية، سترى:

```
⚡ Total featured products: 10 (2 from each category)
✅ SAB MARKET: fetched 2 products (from 50 available)
✅ WOMEN TOPS: fetched 2 products (from 50 available)
✅ MEN FASHION: fetched 2 products (from 50 available)
✅ BAGS: fetched 2 products (from 50 available)
✅ KIDS: fetched 2 products (from 50 available)

🏠 Home Page - Featured Products Loaded:
📊 Total: 10 products
📦 Products by Category:
   - SAB MARKET: 2 products
   - WOMEN TOPS: 2 products
   - MEN FASHION: 2 products
   - BAGS: 2 products
   - KIDS: 2 products
```

## ✅ ضمان الجودة | Quality Assurance

### تحققات تلقائية:
- ✅ التأكد من وجود صورة لكل منتج
- ✅ عدم تجاوز 10 منتجات
- ✅ معالجة الأخطاء لكل فئة بشكل منفصل
- ✅ Fallback للصور المفقودة

### كود التحقق من الصور:
```typescript
// تأكد من وجود صورة
if (data.image || data.images?.[0]) {
  categoryProducts.push({ 
    id: docSnap.id, 
    ...data,
    image: data.image || data.images?.[0] || '',
    categoryName: categoryName,
  });
}
```

## 🚀 الأداء | Performance

### تحسينات الأداء:
1. **جلب انتقائي:** جلب 50 منتج من كل فئة (250 منتج إجمالاً) بدلاً من آلاف المنتجات
2. **اختيار محلي:** الاختيار العشوائي يتم في الجهاز لتقليل حمل الشبكة
3. **معالجة خطأ آمنة:** إذا فشلت فئة، تستمر الفئات الأخرى
4. **Cache ذكي:** تحديث كل دقيقتين للتوازن بين الأداء والمحتوى الجديد

## 📅 التاريخ | History

- **2025-11-10:** التحديث الأولي - توزيع المنتجات على 5 فئات
- **السابق:** عرض 10 منتجات من SAB MARKET فقط

## 🔗 الملفات المتأثرة | Affected Files

1. `hooks/useFirestore.ts` - تحديث `useFeaturedProducts` function
2. `app/(tabs)/home.tsx` - إضافة logging للمنتجات المحملة
3. `docs/HOME_PAGE_PRODUCTS_UPDATE.md` - هذا الملف (التوثيق)

---

**ملاحظة:** هذا التحديث يضمن تنوع المنتجات المعروضة ويحسّن تجربة المستخدم من خلال عرض منتجات من مختلف الفئات بدلاً من فئة واحدة فقط.
