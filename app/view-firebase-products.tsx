import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../constants/firebase';

interface FirebaseProduct {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description?: {
    en: string;
    ar: string;
  };
  price: number;
  image: string;
  images?: string[];
  brand?: string;
  brandName?: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryName?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  featured?: boolean;
  inStock?: boolean;
  createdAt?: string;
}

export default function ViewFirebaseProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      console.log('🔍 جاري تحميل المنتجات من Firebase...');
      
      const productsCollection = collection(db, 'products');
      const snapshot = await getDocs(productsCollection);
      
      const productsData: FirebaseProduct[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 منتج:', doc.id, data);
        
        productsData.push({
          id: doc.id,
          ...data,
        } as FirebaseProduct);
      });
      
      console.log(`✅ تم تحميل ${productsData.length} منتج من Firebase`);
      setProducts(productsData);
      
    } catch (error) {
      console.error('❌ خطأ في تحميل المنتجات:', error);
      Alert.alert('خطأ', 'فشل في تحميل المنتجات من Firebase');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  const getProductName = (product: FirebaseProduct, language: 'ar' | 'en' = 'ar') => {
    if (typeof product.name === 'object' && product.name) {
      return language === 'ar' ? product.name.ar : product.name.en;
    }
    return product.name || 'اسم غير متوفر';
  };

  const renderProduct = (product: FirebaseProduct) => (
    <View key={product.id} style={styles.productCard}>
      {/* الصورة */}
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            onError={() => console.log('❌ فشل تحميل الصورة:', product.image)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Feather name="image" size={40} color="#9CA3AF" />
          </View>
        )}
        
        {/* شارة المميز */}
        {product.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>مميز</Text>
          </View>
        )}
        
        {/* شارة الخصم */}
        {product.discount && product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </View>

      {/* معلومات المنتج */}
      <View style={styles.productInfo}>
        <Text style={styles.productId}>ID: {product.id}</Text>
        
        <Text style={styles.productName} numberOfLines={2}>
          🇸🇦 {getProductName(product, 'ar')}
        </Text>
        
        <Text style={styles.productNameEn} numberOfLines={2}>
          🇺🇸 {getProductName(product, 'en')}
        </Text>

        {/* العلامة التجارية */}
        {(product.brandName || product.brand) && (
          <Text style={styles.brand}>
            🏷️ {product.brandName || product.brand}
          </Text>
        )}

        {/* الفئة */}
        {product.categoryName && (
          <Text style={styles.category}>
            📁 {product.categoryName}
            {product.subcategoryName && ` > ${product.subcategoryName}`}
          </Text>
        )}

        {/* السعر */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.discount && product.discount > 0 && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.price / (1 - product.discount / 100))}
            </Text>
          )}
        </View>

        {/* التقييم */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Feather name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{product.rating}</Text>
            {product.reviews && (
              <Text style={styles.reviews}>({product.reviews} مراجعة)</Text>
            )}
          </View>
        )}

        {/* الحالة */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: product.inStock !== false ? '#10B981' : '#EF4444' }]}>
            <Text style={styles.statusText}>
              {product.inStock !== false ? '✅ متوفر' : '❌ غير متوفر'}
            </Text>
          </View>
        </View>

        {/* تاريخ الإنشاء */}
        {product.createdAt && (
          <Text style={styles.createdAt}>
            📅 {new Date(product.createdAt).toLocaleDateString('ar-SA')}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-right" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>منتجات Firebase</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Feather name="refresh-cw" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* عداد المنتجات */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          📦 عدد المنتجات: {products.length}
        </Text>
        {loading && <Text style={styles.loadingText}>🔄 جاري التحميل...</Text>}
      </View>

      {/* قائمة المنتجات */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {products.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Feather name="package" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>لا توجد منتجات</Text>
            <Text style={styles.emptySubtitle}>لم يتم العثور على أي منتجات في Firebase</Text>
          </View>
        ) : (
          products.map(renderProduct)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  counterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    gap: 8,
  },
  productId: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  productNameEn: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'left',
  },
  brand: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: '#059669',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviews: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  createdAt: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});