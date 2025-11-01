import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Platform,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows, FontWeights } from '@/constants/theme';
import { useCategories, useProducts, useBrands } from '@/hooks/useFirestore';
import SafeImage from '@/components/SafeImage';
import { CategoryCardSkeleton, ProductCardSkeleton } from '@/components/SkeletonLoader';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - Spacing.md * 2;

export default function HomeScreen() {
  const { t, language, formatPrice, changeLanguage } = useApp();
  const router = useRouter();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts({ featured: true, limit: 6 });
  const { brands, loading: brandsLoading, refetch: refetchBrands } = useBrands();

  // Hardcoded banners with memoization for performance
  const hardcodedBanners = useMemo(() => [
    {
      id: 'YByfRqFBV1qfqzN5M4PG',
      image: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/Banners%2FSab%20Market.png?alt=media&token=a9bfbcc4-55d7-4d74-a29f-d042b618d4c9',
      title: { ar: 'ساب ماركت', en: 'Sab Market' },
      subtitle: { ar: 'تسوق الآن', en: 'Shop Now' },
      link: { type: 'category', id: 'cwt28D5gjoLno8SFqoxQ' },
      isActive: true,
      order: 1,
    },
  ], []);

  const activeBanners = useMemo(() => 
    hardcodedBanners.filter(b => b.isActive), 
    [hardcodedBanners]
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchCategories(),
        refetchProducts(),
        refetchBrands(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories, refetchProducts, refetchBrands]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / BANNER_WIDTH);
    setActiveSlide(index);
  };

  const handleProductPress = useCallback((productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/product/${productId}` as any);
  }, [router]);

  const handleBannerPress = useCallback((banner: typeof hardcodedBanners[0]) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (banner.link?.type === 'category' && banner.link?.id) {
      router.push(`/category/${banner.link.id}` as any);
    }
  }, [router]);

  const handleLanguageSelect = async (newLanguage: 'en' | 'ar') => {
    if (newLanguage === language) {
      setShowLanguageModal(false);
      return;
    }

    setShowLanguageModal(false);

    if (Platform.OS === 'web') {
      await changeLanguage(newLanguage);
      window.location.reload();
    } else {
      Alert.alert(
        language === 'en' ? 'Restart Required' : 'يتطلب إعادة تشغيل',
        language === 'en' 
          ? 'The app will restart to apply language changes.' 
          : 'سيتم إعادة تشغيل التطبيق لتطبيق تغييرات اللغة.',
        [
          {
            text: language === 'en' ? 'Cancel' : 'إلغاء',
            style: 'cancel',
          },
          {
            text: language === 'en' ? 'OK' : 'حسناً',
            onPress: async () => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              await changeLanguage(newLanguage);
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    if (activeBanners.length === 0) return;
    
    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % activeBanners.length;
        scrollViewRef.current?.scrollTo({
          x: next * (BANNER_WIDTH + Spacing.md),
          animated: true,
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#A78BFA', '#C4B5FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + Spacing.sm, paddingBottom: Spacing.sm }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
            <Text style={styles.storeTitle}>{t('home.storeTitle')}</Text>
            <Text style={styles.storeSubtitle}>{t('home.storeSubtitle')}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.languageButton}
              activeOpacity={0.7}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowLanguageModal(true);
              }}
            >
              <Feather name="globe" size={20} color={Colors.white} />
              <Text style={styles.languageButtonText}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.notificationButton}
              activeOpacity={0.7}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push('/notifications' as any);
              }}
            >
              <Feather name="bell" size={20} color={Colors.white} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBarContainer}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Feather name="x" size={18} color={Colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {activeBanners.length > 0 && (
          <View style={styles.bannerSection}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={BANNER_WIDTH + Spacing.md}
              contentContainerStyle={styles.bannerScrollContent}
            >
              {activeBanners.map((banner) => (
              <TouchableOpacity
                key={banner.id}
                style={styles.bannerCard}
                activeOpacity={0.95}
                onPress={() => handleBannerPress(banner)}
              >
                <SafeImage uri={banner.image} style={styles.bannerImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.bannerOverlay}
                >
                  <Text style={styles.bannerTitle}>{banner.title[language]}</Text>
                  {banner.subtitle && (
                    <Text style={styles.bannerSubtitle}>{banner.subtitle[language]}</Text>
                  )}
                  <View style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>{t('common.shopNow')}</Text>
                    <Feather name="arrow-right" size={16} color={Colors.white} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              ))}
            </ScrollView>
            {activeBanners.length > 1 && (
              <View style={styles.pagination}>
                {activeBanners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeSlide && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('home.popularCategories')}</Text>
              <Text style={styles.sectionSubtitle}>{t('home.shopByCategory')}</Text>
            </View>
          </View>
          {categoriesLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push(`/category/${category.id}` as any);
                }}
              >
                <View style={styles.categoryIconContainer}>
                  <SafeImage 
                    uri={category.image || 'https://via.placeholder.com/150'} 
                    style={styles.categoryIcon} 
                  />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {typeof category.name === 'string' ? category.name : (category.name?.[language] || category.name?.en || 'Category')}
                </Text>
              </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Special Deals Section */}
        <View style={styles.dealsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{language === 'ar' ? 'عروض حصرية' : 'Special Deals'}</Text>
              <Text style={styles.sectionSubtitle}>{language === 'ar' ? 'وفّر حتى 70%' : 'Save up to 70%'}</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
              <Feather name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {productsLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsScroll}
            >
              {[1, 2].map((i) => (
                <View key={i} style={styles.dealCardSkeleton}>
                  <ProductCardSkeleton />
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsScroll}
            >
              {products.filter(p => p.discount && p.discount > 20).slice(0, 3).map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.dealCard}
                  activeOpacity={0.9}
                  onPress={() => handleProductPress(product.id)}
                >
                  <View style={styles.dealImageContainer}>
                    <SafeImage uri={product.image} style={styles.dealImage} />
                    <LinearGradient
                      colors={['#FF6B6B', '#EE5A6F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.dealBadge}
                    >
                      <Text style={styles.dealBadgeText}>-{String(product.discount)}%</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.dealInfo}>
                    <Text style={styles.dealBrand} numberOfLines={1}>
                      {String(product.brandName || product.brand || 'Brand')}
                    </Text>
                    <Text style={styles.dealName} numberOfLines={2}>
                      {typeof product.name === 'string' ? product.name : (product.name?.[language] || product.name?.en || 'Product')}
                    </Text>
                    <View style={styles.dealPriceRow}>
                      <Text style={styles.dealPrice}>
                        {formatPrice(product.price * (1 - (product.discount || 0) / 100))}
                      </Text>
                      <Text style={styles.dealOriginalPrice}>{formatPrice(product.price)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('home.featuredProducts')}</Text>
              <Text style={styles.sectionSubtitle}>{t('home.specialForYou')}</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
              <Feather name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {productsLoading ? (
            <View style={styles.productsGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={{ width: (width - Spacing.md * 3) / 2 }}>
                  <ProductCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product.id)}
                  formatPrice={formatPrice}
                  language={language}
                />
              ))}
            </View>
          )}
        </View>

        {/* Best Sellers Section */}
        <View style={styles.bestSellersSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{language === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}</Text>
              <Text style={styles.sectionSubtitle}>{language === 'ar' ? 'منتجات الأكثر طلباً' : 'Most Popular Products'}</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
              <Feather name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {productsLoading ? (
            <View style={styles.bestSellersGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={{ width: (width - Spacing.md * 3) / 2 }}>
                  <ProductCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.bestSellersGrid}>
              {products.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product.id)}
                  formatPrice={formatPrice}
                  language={language}
                />
              ))}
            </View>
          )}
        </View>

        {/* Featured Brands Section */}
        <View style={styles.brandsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{language === 'ar' ? 'ماركات مميزة' : 'Featured Brands'}</Text>
              <Text style={styles.sectionSubtitle}>{language === 'ar' ? 'تسوق من علاماتك المفضلة' : 'Shop from your favorite brands'}</Text>
            </View>
          </View>
          {brandsLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsScroll}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.brandCardSkeleton}>
                  <CategoryCardSkeleton />
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsScroll}
            >
              {brands.slice(0, 10).map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.brandCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push(`/brand/${brand.id}` as any);
                  }}
                >
                  <View style={styles.brandLogoContainer}>
                    <SafeImage 
                      uri={brand.logo || brand.image || 'https://via.placeholder.com/150'} 
                      style={styles.brandLogo} 
                    />
                  </View>
                  <Text style={styles.brandName} numberOfLines={1}>
                    {typeof brand.name === 'string' ? brand.name : (brand.name?.[language] || brand.name?.en || 'Brand')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('account.selectLanguage')}</Text>
            
            <TouchableOpacity
              style={[styles.modalOption, language === 'en' && styles.modalOptionSelected]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalOptionText, language === 'en' && styles.modalOptionTextSelected]}>
                English
              </Text>
              {language === 'en' && (
                <Feather name="check" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalOption, language === 'ar' && styles.modalOptionSelected]}
              onPress={() => handleLanguageSelect('ar')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalOptionText, language === 'ar' && styles.modalOptionTextSelected]}>
                العربية
              </Text>
              {language === 'ar' && (
                <Feather name="check" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

interface ProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language: string;
}

function ProductCard({ product, onPress, formatPrice, language }: ProductCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <Animated.View style={[styles.productCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.productImageContainer}>
          <SafeImage uri={product.image} style={styles.productImage} />
          {product.discount && (
            <LinearGradient
              colors={[Colors.accent, Colors.accentLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>-{String(product.discount)}%</Text>
            </LinearGradient>
          )}
          {(product.brandName || product.brand) && (
            <View style={styles.productBrandBadge}>
              <Text style={styles.productBrandBadgeText}>
                {String(product.brandName || product.brand || 'Brand')}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
            <Feather name="heart" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>
            {String(product.brandName || product.brand || 'Brand')}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {typeof product.name === 'string' ? product.name : (product.name?.[language] || product.name?.en || 'Product')}
          </Text>
          {product.subcategoryName && (
            <Text style={styles.productCategory} numberOfLines={1}>
              {typeof product.subcategoryName === 'string' ? product.subcategoryName : 
               (product.subcategoryName?.[language] || product.subcategoryName?.en || '')}
            </Text>
          )}
          <View style={styles.ratingContainer}>
            <Feather name="star" size={13} color={Colors.warning} style={{ marginRight: 2 }} />
            <Text style={styles.ratingText}>{String(product.rating || 0)}</Text>
            <Text style={styles.reviewsText}>({String(product.reviews || 0)})</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
            {product.discount > 0 && (
              <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {},
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: FontWeights.medium,
    marginBottom: 2,
    opacity: 0.95,
  },
  storeTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.white,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  storeSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: FontWeights.medium,
    opacity: 0.9,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  languageButton: {
    height: 36,
    paddingHorizontal: Spacing.sm,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  languageButtonText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.xl,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    height: 40,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: FontWeights.medium,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  bannerSection: {
    marginTop: 0,
    marginBottom: Spacing.sm,
  },
  bannerScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 140,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  bannerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bannerButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray[300],
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  categoriesSection: {
    marginBottom: Spacing.sm,
  },
  dealsSection: {
    marginBottom: Spacing.sm,
  },
  dealsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  dealCardSkeleton: {
    width: 240,
  },
  dealCard: {
    width: 240,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  dealImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: Colors.gray[50],
  },
  dealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dealBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  dealBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
  },
  dealInfo: {
    padding: Spacing.md,
  },
  dealBrand: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.semibold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dealName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    minHeight: 44,
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dealPrice: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
  dealOriginalPrice: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
    fontWeight: FontWeights.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 1,
    fontWeight: FontWeights.medium,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 75,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 10,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: FontWeights.semibold,
    lineHeight: 14,
  },
  productsSection: {
    paddingHorizontal: Spacing.md,
  },
  bestSellersSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  bestSellersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  brandsSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  brandsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  brandCardSkeleton: {
    width: 90,
  },
  brandCard: {
    width: 90,
    alignItems: 'center',
  },
  brandLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  brandLogo: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: 11,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: FontWeights.semibold,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  productCard: {
    width: (width - Spacing.md * 3) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: Colors.gray[50],
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  discountText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  productInfo: {
    padding: Spacing.md,
  },
  productBrand: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.semibold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productBrandBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    zIndex: 10,
    maxWidth: 100,
  },
  productBrandBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.3,
  },
  productCategory: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: FontWeights.medium,
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: 6,
    minHeight: 38,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginLeft: 2,
  },
  reviewsText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginLeft: 4,
    fontWeight: FontWeights.medium,
  },
  priceContainer: {},
  price: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
    fontWeight: FontWeights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  modalOptionSelected: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  modalOptionText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  modalOptionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
});
