import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';

const sampleProducts = [
  {
    name: { ar: "سماعات لاسلكية", en: "Wireless Headphones" },
    description: { ar: "سماعات عالية الجودة مع إلغاء الضوضاء", en: "High-quality headphones with noise cancellation" },
    price: 99.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400"
    ],
    brand: "TechPro",
    brandName: "TechPro",
    categoryId: "electronics",
    categoryName: "إلكترونيات",
    subcategoryName: "سماعات",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    stock: 50,
    available: true,
    discount: 20,
    featured: true,
    deliveryTime: "2-3 أيام",
    colors: [
      { ar: "أسود", en: "Black", hex: "#000000" },
      { ar: "أبيض", en: "White", hex: "#FFFFFF" }
    ],
    gender: "Unisex",
    season: "All-Season",
    createdAt: new Date().toISOString()
  },
  {
    name: { ar: "قميص أطفال صيفي", en: "Kids Summer T-Shirt" },
    description: { ar: "قميص قطني مريح للأطفال", en: "Comfortable cotton t-shirt for kids" },
    price: 25.00,
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400",
    images: [
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400",
      "https://images.unsplash.com/photo-1519235106638-30cc49b5dbc5?w=400"
    ],
    brand: "SAB",
    brandName: "SAB",
    categoryId: "fashion",
    categoryName: "ملابس أطفال",
    subcategoryName: "قمصان أولاد",
    rating: 4.3,
    reviews: 89,
    inStock: true,
    stock: 100,
    available: true,
    discount: 15,
    featured: true,
    deliveryTime: "1-2 أيام",
    colors: [
      { ar: "أحمر", en: "Red", hex: "#FF0000" },
      { ar: "أزرق", en: "Blue", hex: "#0000FF" },
      { ar: "أخضر", en: "Green", hex: "#00FF00" }
    ],
    sizes: ["S", "M", "L", "XL"],
    ageRange: ["2-3 years", "4-5 years", "6-7 years"],
    gender: "Boy",
    season: "Summer",
    createdAt: new Date().toISOString()
  },
  {
    name: { ar: "ساعة ذكية", en: "Smart Watch" },
    description: { ar: "ساعة ذكية مع مراقبة الصحة", en: "Smart watch with health monitoring" },
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400"
    ],
    brand: "SmartTech",
    brandName: "SmartTech",
    categoryId: "electronics",
    categoryName: "إلكترونيات",
    subcategoryName: "ساعات ذكية",
    rating: 4.8,
    reviews: 456,
    inStock: true,
    stock: 25,
    available: true,
    discount: 0,
    featured: true,
    deliveryTime: "3-5 أيام",
    colors: [
      { ar: "أسود", en: "Black", hex: "#000000" },
      { ar: "فضي", en: "Silver", hex: "#C0C0C0" }
    ],
    gender: "Unisex",
    season: "All-Season",
    createdAt: new Date().toISOString()
  },
  {
    name: { ar: "حقيبة ظهر", en: "Backpack" },
    description: { ar: "حقيبة ظهر عملية للمدرسة", en: "Practical backpack for school" },
    price: 45.00,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400"
    ],
    brand: "BagPro",
    brandName: "BagPro",
    categoryId: "accessories",
    categoryName: "إكسسوارات",
    subcategoryName: "حقائب",
    rating: 4.2,
    reviews: 234,
    inStock: true,
    stock: 75,
    available: true,
    discount: 10,
    featured: true,
    deliveryTime: "2-3 أيام",
    colors: [
      { ar: "أسود", en: "Black", hex: "#000000" },
      { ar: "كحلي", en: "Navy", hex: "#000080" },
      { ar: "رمادي", en: "Gray", hex: "#808080" }
    ],
    gender: "Unisex",
    season: "All-Season",
    createdAt: new Date().toISOString()
  },
  {
    name: { ar: "كوب قهوة", en: "Coffee Mug" },
    description: { ar: "كوب قهوة سيراميك أنيق", en: "Elegant ceramic coffee mug" },
    price: 15.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400",
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400"
    ],
    brand: "CafePro",
    brandName: "CafePro",
    categoryId: "kitchen",
    categoryName: "مطبخ",
    subcategoryName: "أكواب",
    rating: 4.0,
    reviews: 123,
    inStock: true,
    stock: 200,
    available: true,
    discount: 0,
    featured: true,
    deliveryTime: "1-2 أيام",
    colors: [
      { ar: "أبيض", en: "White", hex: "#FFFFFF" },
      { ar: "بني", en: "Brown", hex: "#8B4513" }
    ],
    gender: "Unisex",
    season: "All-Season",
    createdAt: new Date().toISOString()
  }
];

export default function AddSampleProductsScreen() {
  const [loading, setLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const addSampleProducts = async () => {
    if (!db) {
      Alert.alert('خطأ', 'Firebase غير متصل');
      return;
    }

    setLoading(true);
    setAddedCount(0);

    try {
      const productsRef = collection(db, 'products');
      
      for (const product of sampleProducts) {
        await addDoc(productsRef, product);
        setAddedCount(prev => prev + 1);
        console.log(`✅ تم إضافة منتج: ${product.name.ar}`);
      }

      Alert.alert(
        '✅ نجح!', 
        `تم إضافة ${sampleProducts.length} منتج إلى Firebase!\n\nيمكنك الآن رؤية المنتجات في الصفحة الرئيسية.`,
        [
          { text: 'موافق', style: 'default' }
        ]
      );
    } catch (error) {
      console.error('❌ خطأ في إضافة المنتجات:', error);
      Alert.alert('خطأ', `فشل في إضافة المنتجات:\n${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛒 إضافة منتجات تجريبية</Text>
      
      <Text style={styles.description}>
        سيتم إضافة {sampleProducts.length} منتجات تجريبية إلى Firebase لاختبار التطبيق.
      </Text>

      <View style={styles.productsList}>
        <Text style={styles.sectionTitle}>المنتجات التي سيتم إضافتها:</Text>
        {sampleProducts.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Text style={styles.productName}>
              {index + 1}. {product.name.ar}
            </Text>
            <Text style={styles.productDetails}>
              السعر: ${product.price} | الفئة: {product.categoryName}
            </Text>
            {product.featured && (
              <Text style={styles.featured}>⭐ منتج مميز</Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={addSampleProducts}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? `جاري الإضافة... (${addedCount}/${sampleProducts.length})` : '🚀 إضافة المنتجات إلى Firebase'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        ملاحظة: هذه العملية ستضيف منتجات جديدة ولن تحذف المنتجات الموجودة.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#007185',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007185',
  },
  productsList: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productItem: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007185',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
  },
  featured: {
    fontSize: 12,
    color: '#e47911',
    fontWeight: 'bold',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007185',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});