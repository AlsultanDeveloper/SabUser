import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  Platform,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows, FontWeights } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';
import { useCategories } from '@/hooks/useFirestore';
import type { Category, Language } from '@/types';

export default function CategoriesScreen() {
  const { t, language } = useApp();
  const { openCategory } = useLocalSearchParams<{ openCategory?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, loading, error, refetch } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [cachedCategories, setCachedCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCachedCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      cacheCategories(categories);
      setCachedCategories(categories);
    }
  }, [categories]);

  const loadCachedCategories = async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_categories');
      if (cached) {
        setCachedCategories(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading cached categories:', error);
    }
  };

  const cacheCategories = async (cats: Category[]) => {
    try {
      await AsyncStorage.setItem('cached_categories', JSON.stringify(cats));
    } catch (error) {
      console.error('Error caching categories:', error);
    }
  };

  const displayCategories = useMemo(() => {
    return categories.length > 0 ? categories : cachedCategories;
  }, [categories, cachedCategories]);

  useEffect(() => {
    if (openCategory && displayCategories.length > 0) {
      const category = displayCategories.find(c => c.id === openCategory);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [openCategory, displayCategories]);

  const filteredCategories = searchQuery
    ? displayCategories.filter((cat) => {
        const name = typeof cat.name === 'string' ? cat.name : (cat.name?.[language] || cat.name?.en || '');
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : displayCategories;

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={Colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Feather name="x-circle" size={18} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && cachedCategories.length === 0 ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </View>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>{t('common.error')}</Text>
          <Text style={styles.errorText}>{t('categories.errorLoadingCategories')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Feather name="refresh-cw" size={20} color={Colors.white} />
            <Text style={styles.retryButtonText}>{t('categories.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {filteredCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                language={language}
                index={index}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </View>

          {filteredCategories.length === 0 && (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={64} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>{t('categories.noProducts')}</Text>
              <Text style={styles.emptyDescription}>{t('categories.tryDifferentKeywords')}</Text>
            </View>
          )}
        </ScrollView>
      )}

      <SubcategoryModal
        visible={!!selectedCategory}
        category={selectedCategory}
        language={language}
        onClose={() => setSelectedCategory(null)}
      />
    </View>
  );
}

interface CategoryCardProps {
  category: Category;
  language: Language;
  index: number;
  onPress: () => void;
}

function SkeletonCard() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonTextContainer}>
        <View style={styles.skeletonText} />
        <View style={styles.skeletonTextSmall} />
      </View>
    </Animated.View>
  );
}

function CategoryCard({ category, language, index, onPress }: CategoryCardProps) {
  const { t } = useApp();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, scaleAnim]);

  const handlePressIn = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <Animated.View
      style={[
        styles.categoryCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View style={styles.imageContainer}>
          <SafeImage 
            uri={category.image || 'https://via.placeholder.com/300'} 
            style={styles.categoryImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.categoryOverlay}
          >
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName} numberOfLines={2}>
                {typeof category.name === 'string' ? category.name : (category.name?.[language] || category.name?.en || 'Category')}
              </Text>
              {category.subcategories && category.subcategories.length > 0 && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {category.subcategories.length} {category.subcategories.length === 1 ? t('categories.subcategory') : t('categories.subcategories')}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.arrowButton} activeOpacity={0.8}>
              <Feather name="arrow-right" size={20} color={Colors.white} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface SubcategoryModalProps {
  visible: boolean;
  category: Category | null;
  language: Language;
  onClose: () => void;
}

function SubcategoryModal({ visible, category, language, onClose }: SubcategoryModalProps) {
  const { t } = useApp();
  if (!category) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalDragIndicator} />
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>
                {typeof category.name === 'string' ? category.name : (category.name?.[language] || category.name?.en || 'Category')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.subcategoryList}
            showsVerticalScrollIndicator={false}
          >
            {category.subcategories && category.subcategories.length > 0 ? (
              category.subcategories.map((subcategory) => (
                <TouchableOpacity
                  key={subcategory.id}
                  style={styles.subcategoryItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    const subName = typeof subcategory.name === 'string' ? subcategory.name : (subcategory.name?.[language] || subcategory.name?.en || '');
                    const catName = typeof category.name === 'string' ? category.name : (category.name?.[language] || category.name?.en || '');
                    
                    // Navigate to products page with category and subcategory filters
                    router.push({
                      pathname: '/category-products',
                      params: {
                        categoryId: category.id,
                        categoryName: catName,
                        subcategoryId: subcategory.id,
                        subcategoryName: subName,
                      },
                    });
                    
                    onClose();
                  }}
                >
                  <View style={styles.subcategoryIconContainer}>
                    <Feather name="tag" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.subcategoryName}>
                    {typeof subcategory.name === 'string' ? subcategory.name : (subcategory.name?.[language] || subcategory.name?.en || '')}
                  </Text>
                  <Feather name="chevron-right" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptySubcategories}>
                <Feather name="layers" size={48} color={Colors.gray[300]} />
                <Text style={styles.emptySubcategoriesText}>{t('categories.noSubcategoriesAvailable')}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBarContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.xl,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: FontWeights.medium,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  grid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: Spacing.sm,
  },
  categoryCard: {
  width: '48%',
  aspectRatio: 0.85,
  borderRadius: BorderRadius.xl,
  overflow: 'hidden',
  marginBottom: Spacing.sm,
  ...Shadows.lg,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryName: {
    color: Colors.white,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    backdropFilter: 'blur(10px)',
  },
  categoryBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  skeletonContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  skeletonCard: {
    width: '48%',
    aspectRatio: 0.85,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.gray[200],
    overflow: 'hidden',
  },
  skeletonImage: {
    flex: 1,
    backgroundColor: Colors.gray[300],
  },
  skeletonTextContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  skeletonText: {
    height: 16,
    backgroundColor: Colors.gray[300],
    borderRadius: 4,
    marginBottom: Spacing.xs,
    width: '70%',
  },
  skeletonTextSmall: {
    height: 12,
    backgroundColor: Colors.gray[300],
    borderRadius: 4,
    width: '40%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...Shadows.xl,
  },
  modalHeader: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  subcategoryList: {
    padding: Spacing.lg,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  subcategoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  subcategoryName: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
  },
  emptySubcategories: {
    paddingVertical: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySubcategoriesText: {
    marginTop: Spacing.lg,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
  },
});
