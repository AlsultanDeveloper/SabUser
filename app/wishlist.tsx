// wishlist.tsx - dummy content
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { getDocuments, collections, where, deleteDocument, getDocument } from '@/constants/firestore';
import AmazonStyleProductCard from '@/components/AmazonStyleProductCard';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: any;
}

export default function WishlistScreen() {
  const { t, language, formatPrice } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist from Firestore
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get wishlist items
        const items = await getDocuments(collections.wishlists, [
          where('userId', '==', user.uid),
        ]);

        setWishlistItems(items as WishlistItem[]);

        // Fetch product details for each wishlist item
        const productsPromises = items.map((item: any) => 
          getDocument(collections.products, item.productId)
        );
        const products = await Promise.all(productsPromises);
        setWishlistProducts(products.filter(p => p !== null));
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    try {
      // Find wishlist item by productId
      const itemToRemove = wishlistItems.find(item => item.productId === productId);
      if (!itemToRemove) return;

      await deleteDocument(collections.wishlists, itemToRemove.id);
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      setWishlistProducts(prev => prev.filter(p => p.id !== productId));

      Toast.show({
        type: 'info',
        text1: '💔 ' + t('wishlist.removed'),
        text2: productName,
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 100,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error') || 'Error',
        text2: 'Failed to remove item',
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 100,
      });
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}` as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.ocean]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('account.wishlist')}</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.emptyTitle, { marginTop: 16 }]}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      ) : wishlistProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={80} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>{t('wishlist.empty')}</Text>
          <Text style={styles.emptyDescription}>
            {t('wishlist.emptyDescription')}
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.shopButtonText}>{t('wishlist.startShopping')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.itemsCount}>
            {`${wishlistProducts.length} ${wishlistProducts.length === 1 ? 'item' : 'items'}`}
          </Text>
          <FlatList
            data={wishlistProducts}
            renderItem={({ item: product }) => {
              if (!product) return null;
              
              // Get product name based on language
              const productName = typeof product.name === 'string'
                ? product.name
                : (product.name?.[language] || product.name?.en || product.name?.ar || t('wishlist.savedItem'));

              return (
                <View style={styles.cardWrapper}>
                  <AmazonStyleProductCard
                    product={product}
                    onPress={() => handleProductPress(product.id)}
                    formatPrice={formatPrice}
                    language={language}
                    onToggleWishlist={(productId: string) => handleRemoveFromWishlist(productId, productName)}
                    isInWishlist={true}
                  />
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold' as const,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  itemsCount: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
});
