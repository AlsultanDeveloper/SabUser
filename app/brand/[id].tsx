// [id].tsx - dummy content
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';
import { useBrand, useProducts } from '@/hooks/useFirestore';
import SafeImage from '@/components/SafeImage';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - 48) / 2;

export default function BrandDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, formatPrice, addToCart } = useApp();
  const insets = useSafeAreaInsets();

  const { brand, loading: brandLoading } = useBrand(id || '');
  const { products: brandProducts, loading: productsLoading } = useProducts();
  
  const filteredBrandProducts = useMemo(
    () => brandProducts.filter((p) => p.brandId === id),
    [brandProducts, id]
  );
  
  const loading = brandLoading || productsLoading;

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: t('tabs.brands') }} />
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      </>
    );
  }

  if (!brand) {
    return (
      <>
        <Stack.Screen options={{ title: t('tabs.brands') }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {language === 'ar' ? 'العلامة التجارية غير موجودة' : 'Brand not found'}
          </Text>
        </View>
      </>
    );
  }

  const BackIcon = language === 'ar' ? ChevronRight : ChevronLeft;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <BackIcon size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <SafeImage uri={brand.image} style={styles.heroImage} />
            <View style={styles.heroOverlay} />
            <View style={styles.brandLogoWrapper}>
              <View style={styles.brandLogoContainer}>
                <SafeImage uri={brand.logo} style={styles.brandLogo} />
              </View>
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.brandName}>{brand.name[language]}</Text>
            {brand.description && (
              <Text style={styles.brandDescription}>
                {brand.description[language]}
              </Text>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{filteredBrandProducts.length}</Text>
                <Text style={styles.statLabel}>
                  {language === 'ar' ? 'منتج' : 'Products'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </Text>

            {filteredBrandProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {language === 'ar'
                    ? 'لا توجد منتجات لهذه العلامة التجارية حالياً'
                    : 'No products available for this brand'}
                </Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {filteredBrandProducts.map((product) => {
                  const finalPrice = product.discount
                    ? product.price * (1 - product.discount / 100)
                    : product.price;

                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.productCard}
                      onPress={() => router.push(`/product/${product.id}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.productImageContainer}>
                        <SafeImage
                          uri={product.image}
                          style={styles.productImage}
                        />
                        {product.discount && product.discount > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              -{product.discount}%
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.name[language]}
                        </Text>

                        <View style={styles.priceContainer}>
                          {product.discount && product.discount > 0 ? (
                            <>
                              <Text style={styles.originalPrice}>
                                {formatPrice(product.price)}
                              </Text>
                              <Text style={styles.discountedPrice}>
                                {formatPrice(finalPrice)}
                              </Text>
                            </>
                          ) : (
                            <Text style={styles.price}>
                              {formatPrice(product.price)}
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => {
                            addToCart(product);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.addButtonText}>
                            {t('common.addToCart')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray[500],
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray[500],
  },
  customHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    position: 'relative',
    height: 280,
    backgroundColor: Colors.gray[100],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  brandLogoWrapper: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandLogoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  brandLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  contentSection: {
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  brandDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  productsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  productCard: {
    width: PRODUCT_WIDTH,
    marginHorizontal: 8,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: Colors.gray[100],
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
    minHeight: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.gray[400],
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.accent,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
