// [id].tsx - dummy content
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useCategory } from '@/hooks/useFirestore';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows, FontWeights } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';

const { width } = Dimensions.get('window');

export default function SubcategoryScreen() {
  const { t, language } = useApp();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { category, loading } = useCategory(id || '');

  if (loading || !category) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const categoryName = category.name?.[language] || category.name?.en || 'Category';
  const subcategories = category.subcategories || [];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {subcategories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="layers" size={64} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>{t('categories.noSubcategories')}</Text>
              <Text style={styles.emptyDescription}>
                {t('pages.noSubcategoriesAvailable')}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {subcategories.map((subcategory, index) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  language={language}
                  index={index}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

interface SubcategoryCardProps {
  subcategory: { id: string; name: { en: string; ar: string }; image?: string };
  language: 'en' | 'ar';
  index: number;
}

function SubcategoryCard({ subcategory, language, index }: SubcategoryCardProps) {
  const { t } = useApp();
  const displayName = (() => {
    if (typeof subcategory.name === 'string') {
      return subcategory.name;
    }

    if (subcategory.name && typeof subcategory.name === 'object') {
      const name = subcategory.name[language] || subcategory.name.en || subcategory.name.ar;
      if (name) return name;
    }

    console.error('❌ Invalid subcategory name structure:', subcategory);
    return t('pages.unnamedSubcategory');
  })();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    console.log('📱 Navigating to subcategory:', { 
      id: subcategory.id, 
      name: displayName 
    });
    
    // Navigate to category-products with subcategory name
    router.push({
      pathname: '/category-products',
      params: {
        subcategoryId: subcategory.id,
        subcategoryName: displayName,
      },
    });
  };

  const hasImage = subcategory.image && subcategory.image.trim().length > 0;


  return (
    <TouchableOpacity
      style={styles.subcategoryCard}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {hasImage ? (
        <View style={styles.subcategoryImageContainer}>
          <SafeImage 
            uri={subcategory.image || 'https://via.placeholder.com/200'} 
            style={styles.subcategoryImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.subcategoryOverlay}
          >
            <Text style={styles.subcategoryNameOverlay} numberOfLines={2}>
              {displayName}
            </Text>
            <View style={styles.arrowIcon}>
              <Feather name="arrow-right" size={18} color={Colors.white} />
            </View>
          </LinearGradient>
        </View>
      ) : (
        <LinearGradient
          colors={[Colors.primary + '10', Colors.secondary + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.subcategoryGradient}
        >
          <View style={styles.subcategoryIconContainer}>
            <Feather name="tag" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.subcategoryName} numberOfLines={2}>
            {displayName}
          </Text>
          <View style={styles.arrowContainer}>
            <Feather name="arrow-right" size={20} color={Colors.primary} />
          </View>
        </LinearGradient>
      )}
    </TouchableOpacity>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 3,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  subcategoryCard: {
    width: (width - Spacing.md * 3) / 2,
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  subcategoryImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  subcategoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  subcategoryNameOverlay: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.sm,
  },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  subcategoryGradient: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  subcategoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  subcategoryName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    ...Shadows.sm,
  },
});
