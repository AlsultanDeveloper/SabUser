import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCategory } from '@/hooks/useFirestore';
import type { Subcategory } from '@/types';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  language: string;
  onPress: () => void;
}

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ subcategory, language, onPress }) => {
  const subcategoryName = typeof subcategory.name === 'object' 
    ? (language === 'ar' ? subcategory.name.ar : subcategory.name.en)
    : subcategory.name;

  return (
    <TouchableOpacity style={styles.subcategoryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.subcategoryImageContainer}>
        <Image 
          source={{ uri: subcategory.image || 'https://via.placeholder.com/150/E8F4FD/333?text=No+Image' }} 
          style={styles.subcategoryImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.subcategoryContent}>
        <Text style={styles.subcategoryTitle} numberOfLines={2}>
          {subcategoryName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Loading skeleton component
const SubcategorySkeleton = () => (
  <View style={styles.subcategoryCard}>
    <View style={[styles.subcategoryImageContainer, styles.skeletonImage]} />
    <View style={styles.subcategoryContent}>
      <View style={[styles.skeletonText, { width: '80%' }]} />
    </View>
  </View>
);

export default function CategoryDetails() {
  const [language, setLanguage] = useState('ar');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { category, loading, error, refetch } = useCategory(id || '');

  const categoryName: string = (() => {
    if (!category?.name) return 'Category';
    if (typeof category.name === 'string') return category.name;
    return language === 'ar' ? category.name.ar : category.name.en;
  })();

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    console.log('Subcategory pressed:', subcategory.name);
    // Navigate to subcategory products using subcategory ID
    router.push({
      pathname: '/category-products/[categoryId]/[subcategoryId]',
      params: {
        categoryId: id,
        subcategoryId: subcategory.id, // استخدام ID بدلاً من الاسم
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryName || 'Category'}
        </Text>
        <TouchableOpacity onPress={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}>
          <Text style={styles.langButton}>
            {language === 'ar' ? 'EN' : 'عربي'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          // Loading State
          <View style={styles.subcategoriesGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SubcategorySkeleton key={item} />
            ))}
          </View>
        ) : error ? (
          // Error State
          <View style={styles.errorContainer}>
            <Feather name="wifi-off" size={64} color="#666" />
            <Text style={styles.errorTitle}>
              {language === 'ar' ? 'خطأ في التحميل' : 'Loading Error'}
            </Text>
            <Text style={styles.errorText}>
              {language === 'ar' ? 'تحقق من اتصال الإنترنت' : 'Check your internet connection'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Feather name="refresh-cw" size={20} color="#fff" />
              <Text style={styles.retryText}>
                {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : category?.subcategories && category.subcategories.length > 0 ? (
          // Subcategories Grid
          <View>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'الفئات الفرعية' : 'Subcategories'}
            </Text>
            <View style={styles.subcategoriesGrid}>
              {category.subcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  language={language}
                  onPress={() => handleSubcategoryPress(subcategory)}
                />
              ))}
            </View>
          </View>
        ) : (
          // No subcategories
          <View style={styles.emptyContainer}>
            <Feather name="package" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {language === 'ar' ? 'لا توجد فئات فرعية' : 'No subcategories found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {language === 'ar' ? 'سيتم إضافة المنتجات قريباً' : 'Products will be added soon'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  langButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007185',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#E3F2FD',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  // Subcategories Grid - 2 columns for better visibility
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subcategoryCard: {
    width: '48%', // 2 columns with gap
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    // Amazon card shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subcategoryImageContainer: {
    height: 120, // Taller than main categories
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
  },
  subcategoryContent: {
    padding: 12,
  },
  subcategoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Loading skeleton styles
  skeletonImage: {
    backgroundColor: '#E0E0E0',
  },
  skeletonText: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007185',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
