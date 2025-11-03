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
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows, FontWeights } from '@/constants/theme';
import { useCategories } from '@/hooks/useFirestore';
import { getDocuments, collections, where } from '@/constants/firestore';
import SafeImage from '@/components/SafeImage';
import { CategoryCardSkeleton } from '@/components/SkeletonLoader';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - Spacing.md * 2;

// بيانات المنتجات التجريبية - 10 منتجات متنوعة
// كومبونت لعرض بطاقة Amazon فقط
const ProductCardDisplay = ({ product, language, formatPrice, router }: any) => {
  const handlePress = () => {
    console.log('Product pressed:', product.id);
    router.push(`/product/${product.id}`);
  };

  const handleWishlist = (productId: string) => {
    console.log('Wishlist toggled for:', productId);
  };

  return (
    <AmazonStyleProductCard
      product={product}
      onPress={handlePress}
      formatPrice={formatPrice}
      language={language}
      onToggleWishlist={handleWishlist}
      isInWishlist={false}
    />
  );
};

export default function HomeScreen() {
  const { language, changeLanguage, formatPrice: appFormatPrice } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();
  
  // State للمنتجات المتنوعة
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  // جلب منتجات متنوعة تشمل SAB Market - 60 منتج
  useEffect(() => {
    const fetchFashionProducts = async () => {
      try {
        setProductsLoading(true);
        
        // جلب جميع المنتجات من Firebase
        const allProducts = await getDocuments(collections.products);
        
        console.log('📦 Total products fetched:', allProducts.length);
        
        // فلترة المنتجات: Fashion فقط + SAB Market
        const fashionKeywords = [
          'fashion', 'clothing', 'ملابس', 'أزياء', 'ازياء',
          'shoes', 'أحذية', 'bags', 'حقائب', 'accessories', 
          'إكسسوارات', 'اكسسوارات', 'dress', 'فستان', 'shirt', 
          'قميص', 'pants', 'بنطال', 'kids', 'أطفال', 'اطفال',
          'men', 'رجالي', 'women', 'نسائي', 'baby', 'طفل',
          'sab', 'ساب', 'market', 'ماركت', 'grocery', 'بقالة'
        ];
        
        const fashionProducts = allProducts.filter((product: any) => {
          // فحص إذا كان المنتج من SAB MARKET
          if (product.categoryId === 'cwt28D5gjoLno8SFqoxQ') {
            console.log('✅ SAB Market product:', product.id, '- Category:', product.categoryName);
            return true; // إظهار منتجات SAB MARKET
          }
          
          // البحث في categoryName
          const categoryName = (product.categoryName || '').toLowerCase();
          const isFashion = fashionKeywords.some(keyword => 
            categoryName.includes(keyword.toLowerCase())
          );
          
          if (isFashion) {
            console.log('✅ Fashion product:', product.id, '- Category:', product.categoryName);
          }
          
          return isFashion;
        });
        
        console.log('✅ Fashion products found:', fashionProducts.length);
        
        // إذا لم يجد منتجات موضة، اعرض كل المنتجات
        if (fashionProducts.length === 0) {
          console.log('⚠️ No fashion products found! Showing all products');
          const shuffled = allProducts.sort(() => 0.5 - Math.random());
          setFeaturedProducts(shuffled.slice(0, 60));
          setProductsLoading(false);
          return;
        }
        
        // خلط المنتجات عشوائياً
        const shuffled = fashionProducts.sort(() => 0.5 - Math.random());
        
        // اختيار أول 60 منتج
        const selectedProducts = shuffled.slice(0, 60);
        
        console.log('🎯 Products to display (including SAB Market):', selectedProducts.length);
        setFeaturedProducts(selectedProducts);
      } catch (error) {
        console.error('❌ Error loading fashion products:', error);
        setFeaturedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    
    fetchFashionProducts();
  }, []);

  // دالة تنسيق السعر الآمنة
  const formatPrice = (price: number) => {
    try {
      const result = appFormatPrice(price);
      return typeof result === 'string' && result.length > 0 ? result : '$0.00';
    } catch {
      return '$0.00';
    }
  };

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

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

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.uid) {
        setUnreadNotificationsCount(0);
        return;
      }

      try {
        const notifications = await getDocuments(collections.userNotifications, [
          where('userId', '==', user.uid),
          where('read', '==', false),
        ]);
        setUnreadNotificationsCount(notifications.length);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchCategories();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / BANNER_WIDTH);
    setActiveSlide(index);
  };

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
            <Text style={styles.welcomeText}>{language === 'ar' ? 'مرحباً بك' : 'Welcome'}</Text>
            <Text style={styles.storeTitle}>{language === 'ar' ? 'متجر سب' : 'Sab Store'}</Text>
            <Text style={styles.storeSubtitle}>{language === 'ar' ? 'تسوق منتجات عالية الجودة' : 'Shop premium quality products'}</Text>
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
              {unreadNotificationsCount > 0 && (
                <View style={styles.notificationDot}>
                  <Text style={styles.notificationDotText}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBarContainer}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={language === 'ar' ? 'البحث عن المنتجات...' : 'Search products...'}
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
        // Performance optimizations
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
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
                  <Text style={styles.bannerTitle}>
                    {banner.title?.[language] || banner.title?.en || 'Shop Now'}
                  </Text>
                  {banner.subtitle && (
                    <Text style={styles.bannerSubtitle}>
                      {banner.subtitle?.[language] || banner.subtitle?.en || ''}
                    </Text>
                  )}
                  <View style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>{language === 'ar' ? 'تسوق الآن' : 'Shop Now'}</Text>
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
              <Text style={styles.sectionTitle}>{language === 'ar' ? 'الفئات الشائعة' : 'Popular Categories'}</Text>
              <Text style={styles.sectionSubtitle}>{language === 'ar' ? 'تسوق حسب الفئة' : 'Shop by category'}</Text>
            </View>
          </View>
          {categoriesLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
              removeClippedSubviews={true}
              scrollEventThrottle={16}
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
              removeClippedSubviews={true}
              scrollEventThrottle={16}
              decelerationRate="fast"
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

        {/* Products Section - قسم المنتجات */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'تصفح منتجاتنا المميزة' : 'Scroll to see our products'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/featured-products')}>
              <Text style={styles.viewAllText}>
                {language === 'ar' ? 'عرض الكل' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amazon Products Grid - المنتجات المميزة من Firebase */}
          <View style={styles.productsGrid}>
            {productsLoading ? (
              // عرض skeleton loading أثناء التحميل
              Array(5).fill(null).map((_, rowIndex) => (
                <View key={`skeleton-row-${rowIndex}`} style={styles.productsRow}>
                  {Array(2).fill(null).map((_, colIndex) => (
                    <View key={`skeleton-${rowIndex}-${colIndex}`} style={styles.productCardSkeleton}>
                      <View style={styles.skeletonImage} />
                      <View style={styles.skeletonContent}>
                        <View style={styles.skeletonText} />
                        <View style={[styles.skeletonText, { width: '60%' }]} />
                      </View>
                    </View>
                  ))}
                </View>
              ))
            ) : featuredProducts && featuredProducts.length > 0 ? (
              // عرض المنتجات من Firebase
              Array(Math.ceil(featuredProducts.slice(0, 20).length / 2)).fill(null).map((_, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.productsRow}>
                  {featuredProducts.slice(rowIndex * 2, (rowIndex + 1) * 2).map((product, index: number) => (
                    <ProductCardDisplay 
                      key={product.id}
                      product={product}
                      language={language}
                      formatPrice={formatPrice}
                      router={router}
                    />
                  ))}
                </View>
              ))
            ) : (
              // عرض رسالة عدم وجود منتجات
              <View style={styles.noProductsContainer}>
                <Feather name="package" size={64} color={Colors.gray[300]} />
                <Text style={styles.noProductsText}>
                  {language === 'ar' ? 'لا توجد منتجات حالياً' : 'No products available'}
                </Text>
                <Text style={styles.noProductsSubtext}>
                  {language === 'ar' ? 'يرجى إضافة منتجات من لوحة الإدارة' : 'Please add products from admin panel'}
                </Text>
              </View>
            )}
          </View>
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
            <Text style={styles.modalTitle}>{language === 'ar' ? 'اختر اللغة' : 'Select Language'}</Text>
            
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
    top: 6,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationDotText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
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
    gap: Spacing.xs, // مسافة أقل بين الصفوف
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs, // مسافة أقل بين الصفوف
    paddingHorizontal: 2, // مسافة صغيرة من الجانبين
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
  emptySearchContainer: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptySearchDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  // Skeleton loading styles
  productCardSkeleton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginHorizontal: Spacing.xs,
    ...Shadows.sm,
  },
  skeletonImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonText: {
    height: 12,
    backgroundColor: Colors.gray[200],
    borderRadius: 6,
    marginBottom: Spacing.xs,
  },
  // No products container
  noProductsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  noProductsText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
    marginTop: Spacing.md,
  },
  noProductsSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: FontWeights.regular,
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
});
