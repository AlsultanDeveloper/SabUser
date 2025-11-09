# 🔢 وحدات القياس ومحدد الكمية - Unit & Quantity Selector

## التاريخ: 3 نوفمبر 2025

---

## 🎯 الميزات المضافة

### 1. ✅ عرض وحدة القياس (Unit)
- عرض الوحدة في قسم المواصفات (كيلو، حبة، علبة، لتر، إلخ)
- دعم جميع أنواع الوحدات المستخدمة في المنتجات

### 2. ✅ محدد الكمية (Quantity Selector)
- أزرار **+** و **-** لزيادة/تقليل الكمية
- عرض الكمية الحالية
- عرض الوحدة أسفل الكمية
- حد أدنى: 1
- حد أقصى: حسب المخزون المتاح

---

## 📱 التصميم

### Footer الجديد:
```
┌─────────────────────────────────────────┐
│  [−]   3 حبة   [+]   │ إضافة للسلة 🛒 │
│                        │                 │
└─────────────────────────────────────────┘
```

### وحدة القياس في المواصفات:
```
┌─────────────────────────┐
│ 📋 المواصفات             │
│ 👥 الجنس: Unisex        │
│ ☀️ الموسم: All-Season   │
│ 📦 المادة: Cotton       │
│ 🏆 العلامة: Nike        │
│ 📂 الفئة: Clothing      │
│ 📋 الفئة الفرعية: Shirts│
│ 📦 الوحدة: حبة          │  ← جديد!
└─────────────────────────┘
```

---

## 🔧 التعديلات التقنية

### 1. تحديث Product Interface

**الملف**: `types/index.ts`

```typescript
export interface Product {
  // ... existing fields
  
  // Product specifications
  material?: string;
  careInstructions?: string;
  features?: string[];
  reviewsCount?: number;
  
  // ✅ NEW: Unit field
  unit?: string; // e.g. "kg", "gram", "piece", "liter", "bottle", "box", "pack"
}
```

---

### 2. إضافة State للكمية

**الملف**: `app/product/[id].tsx`

```typescript
import React, { useState } from 'react';

export default function ProductDetailsScreen() {
  // ... existing code
  
  // ✅ NEW: Quantity state
  const [quantity, setQuantity] = useState(1);
  
  // ... rest of the code
}
```

---

### 3. عرض Unit في المواصفات

**الملف**: `app/product/[id].tsx`

```tsx
{/* Unit */}
{product.unit && (
  <View style={styles.specRow}>
    <Feather name="box" size={16} color={Colors.text.secondary} />
    <Text style={styles.specLabel}>
      {language === 'ar' ? 'الوحدة:' : 'Unit:'}
    </Text>
    <Text style={styles.specValue}>{product.unit}</Text>
  </View>
)}
```

---

### 4. Quantity Selector UI

**الملف**: `app/product/[id].tsx`

```tsx
{/* Footer with Quantity Selector and Add to Cart */}
<View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
  {/* Quantity Selector */}
  <View style={styles.quantityContainer}>
    {/* Minus Button */}
    <TouchableOpacity 
      style={styles.quantityButton}
      onPress={() => setQuantity(Math.max(1, quantity - 1))}
      disabled={quantity <= 1}
    >
      <Feather 
        name="minus" 
        size={18} 
        color={quantity <= 1 ? Colors.gray[300] : Colors.text.primary} 
      />
    </TouchableOpacity>
    
    {/* Quantity Display */}
    <View style={styles.quantityDisplay}>
      <Text style={styles.quantityText}>{quantity}</Text>
      {product.unit && (
        <Text style={styles.unitText}>{product.unit}</Text>
      )}
    </View>
    
    {/* Plus Button */}
    <TouchableOpacity 
      style={styles.quantityButton}
      onPress={() => {
        const maxQuantity = product.stock || 999;
        setQuantity(Math.min(maxQuantity, quantity + 1));
      }}
      disabled={product.stock ? quantity >= product.stock : false}
    >
      <Feather 
        name="plus" 
        size={18} 
        color={product.stock && quantity >= product.stock 
          ? Colors.gray[300] 
          : Colors.text.primary
        } 
      />
    </TouchableOpacity>
  </View>

  {/* Add to Cart Button */}
  <TouchableOpacity 
    style={[
      styles.addToCartButton,
      product.inStock === false && styles.addToCartButtonDisabled
    ]}
    onPress={() => {
      if (product.inStock !== false) {
        addToCart(product, quantity); // ← الآن يمرر الكمية المختارة
        router.back();
      }
    }}
    disabled={product.inStock === false}
  >
    <Feather name="shopping-cart" size={20} color={Colors.white} />
    <Text style={styles.addToCartText}>
      {language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
    </Text>
  </TouchableOpacity>
</View>
```

---

### 5. الأنماط (Styles)

**الملف**: `app/product/[id].tsx`

```typescript
const styles = StyleSheet.create({
  // ... existing styles
  
  // ✅ Updated footer to use flexDirection: 'row'
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.white,
    flexDirection: 'row',        // ← جديد
    alignItems: 'center',        // ← جديد
    gap: Spacing.md,             // ← جديد
  },
  
  // ✅ NEW: Quantity selector styles
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    gap: Spacing.xs,
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
  },
  quantityDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingHorizontal: Spacing.sm,
  },
  quantityText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  unitText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  
  // ✅ Updated Add to Cart button to use flex: 1
  addToCartButton: {
    flex: 1,                     // ← جديد (لملء المساحة المتبقية)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
});
```

---

## 📊 أنواع الوحدات المدعومة

### الوحدات الشائعة:

| العربية | English | الأيقونة |
|---------|---------|----------|
| حبة | piece | 📦 |
| كيلو | kg | ⚖️ |
| جرام | gram | ⚖️ |
| لتر | liter | 🥤 |
| ملليلتر | ml | 💧 |
| علبة | box | 📦 |
| عبوة | pack | 📦 |
| زجاجة | bottle | 🍾 |
| كيس | bag | 👜 |
| دزينة | dozen | 🔢 |
| سنتيمتر | cm | 📏 |
| متر | meter | 📐 |
| مجموعة | set | 🎁 |
| وحدة | unit | 📦 |

---

## 🎨 منطق الكمية

### 1. الحد الأدنى:
```typescript
setQuantity(Math.max(1, quantity - 1))
```
- لا يمكن أن تقل الكمية عن 1
- زر **−** يصبح معطلاً عند 1

### 2. الحد الأقصى:
```typescript
const maxQuantity = product.stock || 999;
setQuantity(Math.min(maxQuantity, quantity + 1));
```
- الحد الأقصى = `product.stock` (إذا متوفر)
- إذا لم يكن هناك `stock`، الحد الأقصى = 999
- زر **+** يصبح معطلاً عند الوصول للحد الأقصى

### 3. عرض الوحدة:
```typescript
{product.unit && (
  <Text style={styles.unitText}>{product.unit}</Text>
)}
```
- يظهر أسفل الكمية فقط إذا كان `product.unit` متوفر
- بخط صغير ولون ثانوي

---

## 🔥 أمثلة على المنتجات

### مثال 1: عصير (بوحدة "زجاجة")
```json
{
  "id": "juice001",
  "name": { "ar": "عصير برتقال", "en": "Orange Juice" },
  "price": 5.99,
  "unit": "bottle",
  "stock": 50,
  "inStock": true
}
```

**العرض**:
```
[−]  3 bottle  [+]   [إضافة للسلة]
```

---

### مثال 2: أرز (بوحدة "كيلو")
```json
{
  "id": "rice001",
  "name": { "ar": "أرز بسمتي", "en": "Basmati Rice" },
  "price": 12.50,
  "unit": "kg",
  "stock": 100,
  "inStock": true
}
```

**العرض**:
```
[−]  5 kg  [+]   [إضافة للسلة]
```

---

### مثال 3: قميص (بوحدة "حبة")
```json
{
  "id": "shirt001",
  "name": { "ar": "قميص قطني", "en": "Cotton Shirt" },
  "price": 49.99,
  "unit": "piece",
  "stock": 20,
  "inStock": true
}
```

**العرض**:
```
[−]  2 piece  [+]   [إضافة للسلة]
```

---

## 🔧 كيفية إضافة Unit في Firebase

### من Firebase Console:

1. افتح **Firestore Database**
2. اذهب إلى **products collection**
3. اختر المنتج
4. اضغط **Add field**

```
Field Name: unit
Type: string
Value: "kg" أو "piece" أو "bottle" إلخ
```

### أمثلة حسب نوع المنتج:

#### 🍎 Food & Beverages:
- **فواكه/خضروات**: `"kg"`, `"gram"`, `"piece"`
- **عصائر/مشروبات**: `"liter"`, `"ml"`, `"bottle"`
- **أرز/حبوب**: `"kg"`, `"gram"`, `"bag"`
- **علب محفوظة**: `"can"`, `"box"`

#### 👕 Clothing:
- **ملابس**: `"piece"`
- **أحذية**: `"pair"`
- **جوارب**: `"pack"`, `"pair"`

#### 🧸 Toys & Baby:
- **لعب**: `"piece"`, `"set"`
- **حفاضات**: `"pack"`, `"box"`
- **زجاجات رضاعة**: `"piece"`

#### 🏠 Home & Kitchen:
- **أطباق**: `"set"`, `"piece"`
- **أكواب**: `"piece"`, `"set"`
- **أدوات**: `"piece"`, `"set"`

#### 📱 Electronics:
- **هواتف/أجهزة**: `"piece"`, `"unit"`
- **سماعات**: `"piece"`, `"pair"`
- **كابلات**: `"piece"`, `"meter"`

---

## ✅ الفوائد

### 1. تجربة مستخدم أفضل:
- ✅ العميل يرى الوحدة بوضوح (كيلو، حبة، إلخ)
- ✅ يختار الكمية المناسبة قبل الإضافة للسلة
- ✅ لا حاجة للعودة للسلة لتعديل الكمية

### 2. وضوح في المواصفات:
- ✅ قسم المواصفات يعرض الوحدة
- ✅ يفهم العميل بماذا يشتري

### 3. حماية من الأخطاء:
- ✅ لا يمكن طلب أقل من 1
- ✅ لا يمكن طلب أكثر من المخزون
- ✅ الأزرار تصبح معطلة عند الحدود

### 4. مرونة:
- ✅ يدعم أي نوع من الوحدات
- ✅ سهل الإضافة في Firebase
- ✅ اختياري (إذا لم يكن unit متوفر، يعمل بدونه)

---

## 🎯 حالات الاستخدام

### 1. منتج بدون unit:
```json
{
  "name": "قميص",
  "price": 49.99
  // no unit field
}
```
**العرض**: `[−] 3 [+]` (بدون نص الوحدة)

---

### 2. منتج مع unit:
```json
{
  "name": "عصير",
  "price": 5.99,
  "unit": "bottle"
}
```
**العرض**: `[−] 3 bottle [+]`

---

### 3. منتج مع stock محدود:
```json
{
  "name": "قميص نادر",
  "price": 99.99,
  "unit": "piece",
  "stock": 5
}
```
**السلوك**:
- يمكن اختيار من 1 إلى 5
- عند الوصول لـ 5، زر + يصبح معطلاً

---

### 4. منتج غير متوفر:
```json
{
  "name": "حذاء",
  "price": 79.99,
  "inStock": false
}
```
**السلوك**:
- زر "إضافة للسلة" معطل
- Quantity Selector لا يزال يعمل (للإطلاع فقط)

---

## 📱 الشاشة الكاملة

```
┌─────────────────────────────────────┐
│  ← | قميص قطني              | 🔗  │  Header
├─────────────────────────────────────┤
│                                     │
│        [صورة المنتج الكبيرة]        │
│              -20%                   │
│                                     │
├─────────────────────────────────────┤
│ Nike                                │
│ قميص قطني أنيق                      │
│ ⭐⭐⭐⭐⭐ 4.5 (120)               │
│ $39.99  $49.99                      │
│ ✅ متوفر (50 قطعة)                  │
│ 🚚 التوصيل خلال: 2-3 أيام          │
│                                     │
│ 📝 الوصف                            │
│ قميص قطني عالي الجودة...            │
│                                     │
│ 📋 المواصفات                        │
│ 👥 الجنس: Men                      │
│ ☀️ الموسم: Summer                  │
│ 📦 المادة: 100% Cotton             │
│ 🏆 العلامة: Nike                   │
│ 📂 الفئة: Clothing                 │
│ 📦 الوحدة: piece              ← جديد│
│                                     │
│ ... (باقي الأقسام)                 │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [−]  3 piece  [+] │ إضافة للسلة 🛒 │  Footer
└─────────────────────────────────────┘
```

---

## 🚀 الاختبار

### 1. اختبر منتج بدون unit:
- افتح منتج ليس له حقل `unit`
- ✅ يجب أن يعرض الكمية فقط بدون نص الوحدة

### 2. اختبر منتج مع unit:
- افتح منتج له حقل `unit` = "kg"
- ✅ يجب أن يعرض "3 kg" مثلاً

### 3. اختبر الأزرار:
- اضغط − حتى تصل لـ 1
- ✅ زر − يجب أن يصبح باهت (معطل)
- اضغط + حتى تصل للحد الأقصى
- ✅ زر + يجب أن يصبح باهت (معطل)

### 4. اختبر الإضافة للسلة:
- اختر كمية 5
- اضغط "إضافة للسلة"
- ✅ يجب إضافة 5 قطع (وليس 1)

### 5. اختبر عرض Unit في المواصفات:
- افتح منتج له unit
- ✅ يجب أن يظهر في قسم المواصفات مع أيقونة 📦

---

## ✅ الخلاصة

الآن التطبيق يدعم:
- ✅ عرض **وحدة القياس** (Unit) في المواصفات
- ✅ **محدد الكمية** بأزرار + و - في Footer
- ✅ عرض الوحدة أسفل الكمية
- ✅ حدود ذكية (حد أدنى 1، حد أقصى = stock)
- ✅ تمرير الكمية المختارة لـ addToCart()
- ✅ تصميم جميل ومتناسق

**كل شيء جاهز! 🎉**

---

**آخر تحديث**: 3 نوفمبر 2025
**الحالة**: ✅ مكتمل وجاهز للاستخدام
