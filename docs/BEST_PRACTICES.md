# 📚 Best Practices Guide
## دليل أفضل الممارسات لمشروع SabUser

---

## 🎨 1. Component Best Practices

### ✅ استخدام React.memo بحكمة
```tsx
// ✓ جيد - مكون يعتمد على props فقط
const ProductCard = memo(({ product, onPress }) => {
  return <TouchableOpacity onPress={onPress}>...</TouchableOpacity>;
});

// ✗ سيء - مكون يستخدم hooks كثيرة
const ComplexComponent = memo(() => {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  // ... كثير من الـ hooks
  // memo غير مفيد هنا
});
```

### ✅ استخدام useCallback و useMemo
```tsx
// ✓ جيد - callbacks للمكونات الفرعية
const handlePress = useCallback((id) => {
  navigation.navigate('Product', { id });
}, [navigation]);

// ✓ جيد - حسابات معقدة
const filteredProducts = useMemo(() => {
  return products.filter(p => p.price < maxPrice);
}, [products, maxPrice]);

// ✗ سيء - استخدام غير ضروري
const simpleValue = useMemo(() => count + 1, [count]); // مبالغة
```

### ✅ تنظيم المكونات
```tsx
// البنية المثالية للمكون:

import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 1. Types/Interfaces
interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

// 2. المكون الرئيسي
const ProductCard = memo(function ProductCard({ product, onPress }: ProductCardProps) {
  // 3. Hooks
  const [liked, setLiked] = useState(false);
  
  // 4. Callbacks
  const handleLike = useCallback(() => {
    setLiked(prev => !prev);
  }, []);
  
  // 5. Effects
  useEffect(() => {
    // side effects
  }, []);
  
  // 6. Render
  return (
    <View style={styles.container}>
      <Text>{product.name}</Text>
    </View>
  );
});

// 7. Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

// 8. Export
export default ProductCard;
```

---

## 🔥 2. Firebase Best Practices

### ✅ Query Optimization
```tsx
// ✓ جيد - استخدام indexes و limits
const q = query(
  collection(db, 'products'),
  where('category', '==', categoryId),
  where('inStock', '==', true),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// ✗ سيء - جلب كل البيانات
const allProducts = await getDocs(collection(db, 'products'));
// ثم الفلترة في JavaScript
```

### ✅ Real-time Listeners
```tsx
// ✓ جيد - cleanup مناسب
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'orders', orderId),
    (doc) => setOrder(doc.data())
  );
  
  return () => unsubscribe(); // ✓ cleanup
}, [orderId]);

// ✗ سيء - no cleanup
useEffect(() => {
  onSnapshot(doc(db, 'orders', orderId), (doc) => {
    setOrder(doc.data());
  });
  // ✗ memory leak!
}, [orderId]);
```

### ✅ Batch Operations
```tsx
// ✓ جيد - batch writes
const batch = writeBatch(db);
products.forEach(product => {
  const ref = doc(db, 'products', product.id);
  batch.set(ref, product);
});
await batch.commit();

// ✗ سيء - multiple writes
for (const product of products) {
  await setDoc(doc(db, 'products', product.id), product);
}
```

---

## 🎯 3. State Management

### ✅ Context Pattern
```tsx
// ✓ جيد - context منظم
interface AppContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const changeLanguage = useCallback(async (lang: Language) => {
    await AsyncStorage.setItem('language', lang);
    setLanguage(lang);
  }, []);
  
  const value = useMemo(() => ({
    language,
    changeLanguage,
  }), [language, changeLanguage]);
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```

### ✅ React Query Pattern
```tsx
// ✓ جيد - استخدام React Query
export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: () => fetchProducts(categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

// في المكون:
const { data: products, isLoading, error, refetch } = useProducts(categoryId);
```

---

## 🚀 4. Performance Optimization

### ✅ Image Optimization
```tsx
// ✓ جيد - استخدام SafeImage مع caching
<SafeImage
  uri={product.image}
  style={styles.image}
  showLoader={true}
  resizeMode="cover"
/>

// ✗ سيء - image بدون caching أو error handling
<Image source={{ uri: product.image }} />
```

### ✅ List Optimization
```tsx
// ✓ جيد - FlatList مع optimization
<FlatList
  data={products}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <ProductCard product={item} />}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// ✗ سيء - ScrollView مع map
<ScrollView>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</ScrollView>
```

### ✅ Bundle Size
```tsx
// ✓ جيد - dynamic imports
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✓ جيد - conditional imports
const ImagePicker = Platform.select({
  ios: () => require('./ImagePicker.ios'),
  android: () => require('./ImagePicker.android'),
})();

// ✗ سيء - import كل شيء
import * as Icons from '@expo/vector-icons';
```

---

## 🔐 5. Security Best Practices

### ✅ API Keys
```tsx
// ✓ جيد - استخدام expo-constants
const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY;

// ✗ سيء - hardcoded keys
const apiKey = 'AIzaSyCqeIKe6itUxPXTLHCYxIaxnl-wsCmcIYY';
```

### ✅ Data Validation
```tsx
// ✓ جيد - استخدام Zod
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  image: z.string().url(),
});

try {
  const validProduct = ProductSchema.parse(productData);
} catch (error) {
  // handle validation error
}
```

### ✅ Firestore Rules
```
// ✓ جيد - قواعد محكمة
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.token.admin == true;
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 📱 6. Platform-Specific Code

### ✅ Platform Detection
```tsx
// ✓ جيد - platform-specific styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
});

// ✓ جيد - platform-specific components
if (Platform.OS === 'ios') {
  return <AppleSignInButton />;
}
```

---

## 🧪 7. Testing Best Practices

### ✅ Unit Tests
```tsx
// ✓ جيد - test مكون
import { render, fireEvent } from '@testing-library/react-native';

describe('ProductCard', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ProductCard product={mockProduct} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('product-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### ✅ Integration Tests
```tsx
// ✓ جيد - test flow كامل
describe('Checkout Flow', () => {
  it('should complete order', async () => {
    const { getByText, getByTestId } = render(<App />);
    
    // Add to cart
    fireEvent.press(getByText('Add to Cart'));
    
    // Go to checkout
    fireEvent.press(getByTestId('checkout-button'));
    
    // Fill form
    fireEvent.changeText(getByTestId('address-input'), '123 Main St');
    
    // Submit
    fireEvent.press(getByText('Place Order'));
    
    // Verify success
    await waitFor(() => {
      expect(getByText('Order Placed Successfully')).toBeTruthy();
    });
  });
});
```

---

## 📝 8. Code Documentation

### ✅ Component Documentation
```tsx
/**
 * ProductCard - عرض بطاقة منتج مع الصورة والسعر
 * 
 * @param {Product} product - بيانات المنتج
 * @param {() => void} onPress - callback عند الضغط
 * @param {boolean} showFavorite - إظهار زر المفضلة
 * 
 * @example
 * <ProductCard
 *   product={product}
 *   onPress={() => navigate('Product', { id: product.id })}
 *   showFavorite={true}
 * />
 */
export const ProductCard = memo(function ProductCard({
  product,
  onPress,
  showFavorite = false,
}: ProductCardProps) {
  // ...
});
```

### ✅ Function Documentation
```tsx
/**
 * حساب السعر النهائي بعد الخصم
 * 
 * @param price - السعر الأصلي
 * @param discount - نسبة الخصم (0-100)
 * @returns السعر النهائي
 * 
 * @throws {Error} إذا كانت نسبة الخصم غير صحيحة
 */
function calculateFinalPrice(price: number, discount: number): number {
  if (discount < 0 || discount > 100) {
    throw new Error('Invalid discount percentage');
  }
  return price * (1 - discount / 100);
}
```

---

## 🎨 9. Styling Best Practices

### ✅ Theme Usage
```tsx
// ✓ جيد - استخدام theme constants
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    color: Colors.text.primary,
  },
});

// ✗ سيء - hardcoded values
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});
```

---

## 🔄 10. Error Handling

### ✅ Error Boundaries
```tsx
// ✓ جيد - error boundary
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to analytics
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### ✅ Async Error Handling
```tsx
// ✓ جيد - proper error handling
const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await fetchProducts();
    setProducts(data);
  } catch (error) {
    console.error('Error loading products:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to load products',
    });
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Checklist للمراجعة

قبل commit، تأكد من:

- [ ] لا توجد `console.log` غير ضرورية
- [ ] TypeScript types محددة بوضوح
- [ ] Components لها مemoization مناسب
- [ ] Cleanup في useEffect
- [ ] Error handling موجود
- [ ] Loading states واضحة
- [ ] Styles تستخدم theme constants
- [ ] Platform-specific code محدد بوضوح
- [ ] Tests موجودة (إن أمكن)
- [ ] Documentation موجودة

---

**آخر تحديث:** 31 أكتوبر 2025  
**الإصدار:** 1.0
