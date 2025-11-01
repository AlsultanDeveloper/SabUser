// Simplified Product Details Screen - تفاصيل المنتج مبسطة
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useProduct } from '@/hooks/useFirestore';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { language, formatPrice, addToCart } = useApp();
  const insets = useSafeAreaInsets();
  const { product, loading } = useProduct(typeof id === 'string' ? id : '');

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>{language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{language === 'ar' ? 'العودة' : 'Go Back'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>
            {language === 'ar' ? 'منتج متاح' : 'Available Product'}
          </Text>
          <Text style={styles.productPrice}>
            {formatPrice(product.price)}
          </Text>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => {
              addToCart(product, 1);
              router.back();
            }}
          >
            <Feather name="shopping-cart" size={20} color="#FFFFFF" />
            <Text style={styles.addToCartText}>
              {language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  productInfo: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  productTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  notFoundText: {
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
});