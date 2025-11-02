import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useProducts } from '@/hooks/useFirestore';

export default function DebugProductsScreen() {
  const { products, loading, error } = useProducts({ limit: 10 });
  const { products: featuredProducts } = useProducts({ featured: true, limit: 5 });

  useEffect(() => {
    console.log('🔍 Products loading state:', loading);
    console.log('📦 Total products:', products?.length || 0);
    console.log('⭐ Featured products:', featuredProducts?.length || 0);
    
    if (error) {
      console.error('❌ Products error:', error);
    }
    
    if (products && products.length > 0) {
      console.log('✅ First product:', {
        id: products[0].id,
        name: products[0].name,
        price: products[0].price,
        featured: products[0].discount ? 'Has discount' : 'No discount'
      });
    }
  }, [products, loading, error, featuredProducts]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔄 جاري التحقق من المنتجات...</Text>
        <Text style={styles.subtitle}>Loading products from Firebase...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>❌ خطأ في Firebase</Text>
        <Text style={styles.error}>Error: {error}</Text>
        <Text style={styles.subtitle}>تحقق من إعدادات Firebase أو الاتصال</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 تقرير المنتجات</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إجمالي المنتجات</Text>
        <Text style={styles.count}>{products?.length || 0} منتج</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المنتجات المميزة</Text>
        <Text style={styles.count}>{featuredProducts?.length || 0} منتج مميز</Text>
      </View>

      {products && products.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أول 3 منتجات:</Text>
          {products.slice(0, 3).map((product, index) => (
            <View key={product.id} style={styles.productItem}>
              <Text style={styles.productName}>
                {index + 1}. {typeof product.name === 'object' ? product.name.ar || product.name.en : product.name}
              </Text>
              <Text style={styles.productDetails}>
                السعر: ${product.price} | الفئة: {product.category}
              </Text>
              {product.discount && product.discount > 0 && (
                <Text style={styles.discount}>خصم: {product.discount}%</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.noProducts}>❌ لا توجد منتجات في Firebase!</Text>
          <Text style={styles.help}>
            يجب إضافة منتجات إلى collection products في Firestore
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>توصيات:</Text>
        <Text style={styles.recommendation}>
          • تأكد من وجود منتجات في Firestore{'\n'}
          • تأكد من أن الحقل featured موجود للمنتجات المميزة{'\n'}
          • تحقق من أن أسماء الحقول صحيحة (name, price, categoryId){'\n'}
          • تأكد من صحة Firebase configuration
        </Text>
      </View>
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
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007185',
  },
  count: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007185',
    textAlign: 'center',
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
  discount: {
    fontSize: 12,
    color: '#e47911',
    fontWeight: 'bold',
    marginTop: 4,
  },
  noProducts: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  help: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  error: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  recommendation: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});