# 🛍️ دليل بطاقات المنتجات - Product Cards Guide

هذا الدليل يوضح كيفية استخدام بطاقات المنتجات المختلفة في التطبيق، مع أمثلة وتصاميم مشابهة لـ Amazon و Shein.

## 📦 البطاقات المتاحة

### 1. 🟠 AmazonStyleProductCard
بطاقة منتج بتصميم مشابه لـ Amazon مع تركيز على المعلومات والوضوح.

**المميزات:**
- ✅ تصميم نظيف ومرتب
- ✅ عرض التقييمات بالنجوم
- ✅ شارات الخصم والعلامة التجارية
- ✅ معلومات الشحن المجاني
- ✅ زر المفضلة
- ✅ حساب المدخرات

**متى تستخدمها:**
- للمنتجات التي تحتوي على تقييمات
- عندما تريد التركيز على المعلومات التفصيلية
- للتطبيقات التجارية الرسمية

### 2. 💗 SheinStyleProductCard
بطاقة منتج بتصميم مشابه لـ Shein مع تركيز على الجاذبية البصرية.

**المميزات:**
- ✅ صور متعددة مع مؤشرات
- ✅ تصميم جذاب وحديث
- ✅ عرض الألوان المتاحة
- ✅ شارات "جديد" و "رائج"
- ✅ معلومات المبيعات
- ✅ شحن سريع

**متى تستخدمها:**
- للمنتجات التي لديها صور متعددة
- للمنتجات الأزياء والجمال
- عندما تريد جذب انتباه المستخدمين بصرياً

### 3. ⭐ NewProductCard
بطاقة منتج محدثة ومحسّنة مع تأثيرات حركية.

**المميزات:**
- ✅ تأثيرات حركية متطورة
- ✅ تصميم حديث وأنيق
- ✅ استجابة لللمس مع Haptic Feedback
- ✅ دعم كامل للغتين العربية والإنجليزية

### 4. 🚀 ModernProductCard
بطاقة منتج عصرية ومتطورة مع إضافات جديدة.

**المميزات:**
- ✅ تصميم عصري جداً
- ✅ معاينة سريعة للألوان
- ✅ معلومات إضافية (عدد المبيعات، شحن مجاني)
- ✅ تأثيرات بصرية متقدمة

## 🔧 كيفية الاستخدام

### 1. استيراد البطاقة المطلوبة

```tsx
// بطاقة Amazon
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';

// بطاقة Shein
import SheinStyleProductCard from '@/components/SheinStyleProductCard';

// بطاقة محدثة
import NewProductCard from '@/components/NewProductCard';

// بطاقة عصرية
import ModernProductCard from '@/components/ModernProductCard';
```

### 2. استخدام البطاقة في التطبيق

```tsx
import React from 'react';
import { View, FlatList } from 'react-native';
import { useApp } from '@/hooks/useApp';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';

export default function ProductsScreen() {
  const { language, formatPrice, addToWishlist } = useApp();
  const [wishlist, setWishlist] = useState<string[]>([]);

  const handleProductPress = (product: any) => {
    // التنقل إلى صفحة تفاصيل المنتج
    router.push(`/product/${product.id}`);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderProduct = ({ item }: { item: any }) => (
    <AmazonStyleProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      formatPrice={formatPrice}
      language={language}
      onToggleWishlist={handleToggleWishlist}
      isInWishlist={wishlist.includes(item.id)}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}
```

## 📊 Props المطلوبة لكل بطاقة

### Props أساسية (مشتركة)

```tsx
interface BaseProductCardProps {
  product: Product;                          // بيانات المنتج
  onPress: () => void;                       // دالة عند الضغط
  formatPrice: (price: number) => string;    // دالة تنسيق السعر
  language: string;                          // اللغة ('ar' | 'en')
  onToggleWishlist?: (id: string) => void;   // دالة إضافة/إزالة من المفضلة
  isInWishlist?: boolean;                    // هل المنتج في المفضلة؟
}
```

### بنية بيانات المنتج المطلوبة

```tsx
interface Product {
  id: string;                    // معرف المنتج
  name: string;                  // اسم المنتج (إنجليزي)
  nameAr?: string;               // اسم المنتج (عربي)
  price: number;                 // السعر الأساسي
  discount?: number;             // نسبة الخصم (0-100)
  image: string;                 // رابط الصورة الرئيسية
  images?: string[];             // صور إضافية (لبطاقة Shein)
  
  // معلومات العلامة التجارية
  brand?: string;                // العلامة التجارية
  brandName?: string;            // اسم العلامة التجارية
  
  // التقييم والمراجعات
  rating?: number;               // التقييم (1-5)
  reviewsCount?: number;         // عدد المراجعات
  
  // الفئة
  category?: string;             // الفئة (إنجليزي)
  categoryAr?: string;           // الفئة (عربي)
  
  // معلومات إضافية
  colors?: string[];             // الألوان المتاحة
  soldCount?: number;            // عدد المبيعات
  isNew?: boolean;               // منتج جديد؟
  isTrending?: boolean;          // منتج رائج؟
  fastShipping?: boolean;        // شحن سريع؟
  freeShipping?: boolean;        // شحن مجاني؟
}
```

## 🎨 أمثلة للاستخدام المختلف

### 1. مع FlatList (شبكة)

```tsx
<FlatList
  data={products}
  renderItem={({ item }) => (
    <AmazonStyleProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      formatPrice={formatPrice}
      language={language}
    />
  )}
  numColumns={2}
  ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
  contentContainerStyle={{ padding: 16 }}
  columnWrapperStyle={{ justifyContent: 'space-between' }}
/>
```

### 2. مع ScrollView الأفقي

```tsx
<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 16 }}
>
  {products.map((product) => (
    <SheinStyleProductCard
      key={product.id}
      product={product}
      onPress={() => handleProductPress(product)}
      formatPrice={formatPrice}
      language={language}
      style={{ marginRight: 12 }}
    />
  ))}
</ScrollView>
```

### 3. كمكون مفرد

```tsx
<View style={{ padding: 16 }}>
  <ModernProductCard
    product={featuredProduct}
    onPress={() => handleProductPress(featuredProduct)}
    formatPrice={formatPrice}
    language={language}
    onToggleWishlist={handleToggleWishlist}
    isInWishlist={wishlist.includes(featuredProduct.id)}
  />
</View>
```

## 🛠️ تخصيص التصميم

### تغيير حجم البطاقة

```tsx
// في ملف البطاقة، يمكنك تعديل:
const CARD_WIDTH = (width - 48) / 2; // للشبكة ثنائية العمود
const CARD_WIDTH = (width - 64) / 3; // للشبكة ثلاثية العمود
const CARD_WIDTH = width * 0.8;     // للعرض الأفقي
```

### إضافة أنماط مخصصة

```tsx
<AmazonStyleProductCard
  product={product}
  // ...باقي الـ props
  style={{
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }}
/>
```

## 🔍 أمثلة لبيانات المنتجات

### منتج بسيط

```tsx
const simpleProduct = {
  id: '1',
  name: 'Wireless Headphones',
  nameAr: 'سماعات لاسلكية',
  price: 99.99,
  image: 'https://example.com/headphones.jpg',
  brand: 'TechBrand',
  rating: 4.5,
  reviewsCount: 128,
};
```

### منتج مع خصم وميزات إضافية

```tsx
const premiumProduct = {
  id: '2',
  name: 'Premium Smartphone',
  nameAr: 'هاتف ذكي فاخر',
  price: 899.99,
  discount: 15,
  images: [
    'https://example.com/phone1.jpg',
    'https://example.com/phone2.jpg',
    'https://example.com/phone3.jpg',
  ],
  image: 'https://example.com/phone1.jpg',
  brand: 'TechCorp',
  brandName: 'TechCorp',
  rating: 4.8,
  reviewsCount: 2341,
  category: 'Electronics',
  categoryAr: 'إلكترونيات',
  colors: ['#000000', '#FFFFFF', '#0066CC'],
  soldCount: 1523,
  isNew: true,
  fastShipping: true,
  freeShipping: true,
};
```

### منتج أزياء (مناسب لبطاقة Shein)

```tsx
const fashionProduct = {
  id: '3',
  name: 'Summer Dress',
  nameAr: 'فستان صيفي',
  price: 45.00,
  discount: 30,
  images: [
    'https://example.com/dress1.jpg',
    'https://example.com/dress2.jpg',
    'https://example.com/dress3.jpg',
    'https://example.com/dress4.jpg',
  ],
  image: 'https://example.com/dress1.jpg',
  brand: 'FashionBrand',
  rating: 4.3,
  reviewsCount: 89,
  colors: ['#FF69B4', '#00CED1', '#FFD700', '#FF6347'],
  soldCount: 456,
  isTrending: true,
  fastShipping: true,
};
```

## 🚀 نصائح للأداء الأفضل

### 1. استخدام React.memo
جميع البطاقات تستخدم `React.memo` لتحسين الأداء.

### 2. تحسين الصور
```tsx
// استخدم SafeImage للصور المحسّنة
<SafeImage 
  uri={product.image} 
  style={styles.image}
  placeholder="https://via.placeholder.com/200"
/>
```

### 3. Haptic Feedback
جميع البطاقات تدعم Haptic Feedback على iOS لتحسين تجربة المستخدم.

### 4. تحسين FlatList
```tsx
<FlatList
  data={products}
  renderItem={renderProduct}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

## 🎯 اختيار البطاقة المناسبة

| نوع التطبيق | البطاقة المناسبة | السبب |
|-------------|------------------|--------|
| متجر إلكتروني عام | AmazonStyleProductCard | معلومات واضحة ومفصلة |
| تطبيق أزياء | SheinStyleProductCard | تصميم جذاب وصور متعددة |
| تطبيق حديث | ModernProductCard | تصميم عصري ومتطور |
| تطبيق مخصص | NewProductCard | مرونة في التخصيص |

## 🔧 استكشاف الأخطاء

### المشكلة: البطاقات لا تظهر
```tsx
// تأكد من:
1. استيراد البطاقة بشكل صحيح
2. تمرير الـ props المطلوبة
3. وجود بيانات في مصفوفة المنتجات
```

### المشكلة: الصور لا تظهر
```tsx
// استخدم SafeImage مع placeholder:
<SafeImage 
  uri={product.image || 'https://via.placeholder.com/200'} 
  style={styles.image} 
/>
```

### المشكلة: التنسيق غير صحيح
```tsx
// تأكد من تمرير دالة formatPrice:
const formatPrice = (price: number) => `$${price.toFixed(2)}`;
```

---

## 📞 للمساعدة

إذا واجهت أي مشاكل أو تحتاج لتخصيصات إضافية، يمكنك:

1. 📖 مراجعة الكود المصدري للبطاقات
2. 🔧 تعديل الأنماط حسب احتياجاتك
3. 💡 إنشاء بطاقة مخصصة جديدة باستخدام الأمثلة أعلاه

---

**تم إنشاء هذا الدليل بواسطة GitHub Copilot 🤖**