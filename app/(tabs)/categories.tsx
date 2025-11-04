import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCategories } from '@/hooks/useFirestore';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  language: string;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, language, onPress }) => {
  // Keep "Sab Market" in English always
  const categoryName = (typeof category.name === 'object' && (category.name.en === 'Sab Market' || category.name.ar === 'ساب ماركت'))
    ? 'Sab Market'
    : (typeof category.name === 'object' 
      ? (language === 'ar' ? category.name.ar : category.name.en)
      : category.name
    );

  const subcategoryCount = category.subcategories?.length || 0;

  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.categoryImageContainer}>
        <Image 
          source={{ uri: category.image || 'https://via.placeholder.com/150/E8F4FD/333?text=No+Image' }} 
          style={styles.categoryImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle} numberOfLines={2}>
          {categoryName}
        </Text>
        {subcategoryCount > 0 && (
          <Text style={styles.subcategoryCount}>
            {subcategoryCount} {language === 'ar' ? 'فئة فرعية' : 'subcategories'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Loading skeleton component
const CategorySkeleton = () => (
  <View style={styles.categoryCard}>
    <View style={[styles.categoryImageContainer, styles.skeletonImage]} />
    <View style={styles.categoryContent}>
      <View style={[styles.skeletonText, { width: '80%' }]} />
      <View style={[styles.skeletonText, { width: '60%', height: 12 }]} />
    </View>
  </View>
);

export default function Categories() {
  const [language, setLanguage] = useState('ar');
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, loading, error, refetch } = useCategories();

  const filteredCategories = searchQuery 
    ? categories.filter(category => {
        // Keep "Sab Market" in English always
        const name = (typeof category.name === 'object' && (category.name.en === 'Sab Market' || category.name.ar === 'ساب ماركت'))
          ? 'Sab Market'
          : (typeof category.name === 'object' 
            ? (language === 'ar' ? category.name.ar : category.name.en)
            : category.name
          );
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : categories;

  const handleCategoryPress = (category: Category) => {
    console.log('Category pressed:', category.name);
    // Navigate to category subcategories page
    router.push(`/category/${category.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar - Amazon Style */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'ar' ? 'ابحث في SABSTORE' : 'Search SABSTORE'}
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <MaterialIcons name="camera-alt" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header with Language Toggle */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'ar' ? 'تسوق حسب الفئة' : 'Shop by category'}
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
          <View style={styles.categoriesGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <CategorySkeleton key={item} />
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
        ) : (
          // Categories Grid
          <View style={styles.categoriesGrid}>
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                language={language}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
            
            {filteredCategories.length === 0 && (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {language === 'ar' ? 'لا توجد فئات' : 'No categories found'}
                </Text>
              </View>
            )}
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
  // Amazon Search Bar Style
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  cameraButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
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
  // Amazon Grid Style - 2 columns for consistency
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
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
  categoryImageContainer: {
    height: 120, // Same height as subcategories
    backgroundColor: '#E8F4FD', // Light blue like Amazon
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryContent: {
    padding: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    lineHeight: 18,
  },
  subcategoryCount: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  // Loading skeleton styles
  skeletonImage: {
    backgroundColor: '#E0E0E0',
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});