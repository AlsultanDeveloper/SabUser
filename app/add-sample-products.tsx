import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';

// تم حذف المنتجات الوهمية - مصفوفة فارغة
const sampleProducts: any[] = [];

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