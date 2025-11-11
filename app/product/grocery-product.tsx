// Grocery Product Page - SAB MARKET
// Designed specifically for food & grocery items
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Modal,
  FlatList,
  Share as RNShare,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';
import { ChevronLeft, Heart, Share2, Star } from 'lucide-react-native';

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProduct } from '@/hooks/useFirestore';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function GroceryProductScreen() {
  const { id } = useLocalSearchParams();
  const { language, formatPrice, addToCart, isRTL } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { product, loading, error } = useProduct(id as string);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.images || [product.image];
  const productName = typeof product.name === 'object' 
    ? (isRTL ? product.name.ar : product.name.en)
    : product.name;
  
  const description = typeof product.description === 'object'
    ? (isRTL ? product.description.ar : product.description.en)
    : product.description;

  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

  // Handle Share
  const handleShare = async () => {
    try {
      await RNShare.share({
        message: `${productName}\n${formatPrice(finalPrice)}\n\n📱 Download SAB Store:\niOS: https://apps.apple.com/app/sab-store\nAndroid: https://play.google.com/store/apps/details?id=com.sabstore`,
        title: productName,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!product) return;

    // For weight-based products, check if weight is selected
    if (product.soldByWeight && !selectedWeight) {
      Toast.show({
        type: 'error',
        text1: isRTL ? 'الرجاء اختيار الوزن' : 'Please select weight',
        position: 'top',
      });
      return;
    }

    addToCart(product, quantity);
    Toast.show({
      type: 'success',
      text1: isRTL ? 'تمت الإضافة' : 'Added',
      text2: isRTL ? 'تمت إضافة المنتج إلى السلة' : 'Product added to cart',
      position: 'top',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={styles.headerButton}>
            {/* Search icon */}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setIsImageModalVisible(true)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.productImage}
            resizeMode="contain"
          />
          {images.length > 1 && (
            <View style={styles.imageDotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageDot,
                    index === selectedImageIndex && styles.imageDotActive
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          {/* Delivery Time Badge */}
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>⚡ 18 mins</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          </View>

          {/* Brand Name */}
          {product.brand && (
            <TouchableOpacity style={styles.brandContainer}>
              <Text style={styles.brandText}>{product.brand}</Text>
              <ChevronLeft size={16} color={Colors.text.secondary} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          )}

          {/* Product Name */}
          <Text style={styles.productName}>{productName}</Text>

          {/* Weight/Size */}
          {product.weight && (
            <Text style={styles.weightText}>{product.weight}</Text>
          )}

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{formatPrice(finalPrice)}</Text>
              {hasDiscount && (
                <>
                  <Text style={styles.oldPrice}>{formatPrice(product.price)}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{Math.round(product.discount)}% OFF</Text>
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => setIsFavorite(!isFavorite)}
                style={styles.iconButton}
              >
                <Heart 
                  size={24} 
                  color={isFavorite ? Colors.error : Colors.text.secondary}
                  fill={isFavorite ? Colors.error : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                <Share2 size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product details</Text>
            
            {/* Dietary Needs */}
            {product.dietaryNeeds && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dietary Needs</Text>
                <Text style={styles.detailValue}>{product.dietaryNeeds}</Text>
              </View>
            )}

            {/* Size Unit */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Size Unit</Text>
              <Text style={styles.detailValue}>grams</Text>
            </View>

            {/* Storage */}
            {product.storage && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Storage</Text>
                <Text style={styles.detailValue}>{product.storage}</Text>
              </View>
            )}

            {/* Country of Origin */}
            {product.countryOfOrigin && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country</Text>
                <View style={styles.countryValue}>
                  <Text style={styles.countryFlag}>{product.countryFlag || '🇸🇦'}</Text>
                  <Text style={styles.detailValue}>{product.countryOfOrigin}</Text>
                </View>
              </View>
            )}

            {/* Item Condition */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Item Condition</Text>
              <Text style={styles.detailValue}>New</Text>
            </View>
          </View>

          {/* Description */}
          {description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar - Add to Cart */}
      <BlurView intensity={100} tint="light" style={styles.bottomBar}>
        <SafeAreaView edges={['bottom']} style={styles.bottomBarContent}>
          <View style={styles.bottomPriceSection}>
            <Text style={styles.bottomPrice}>{formatPrice(finalPrice * quantity)}</Text>
            {product.weight && (
              <Text style={styles.bottomWeight}>
                {product.weight} • {hasDiscount && `${Math.round(product.discount)}% OFF`}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.addToCartText}>
              {isRTL ? 'أضف إلى السلة' : 'Add To Cart'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </BlurView>

      {/* Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setSelectedImageIndex(index);
            }}
            keyExtractor={(item, index) => `modal-${index}`}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: item }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageDotsContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  imageDotActive: {
    backgroundColor: Colors.text.primary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  deliveryText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.error,
  },
  newBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  newBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  brandText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  productName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  weightText: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currentPrice: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  oldPrice: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  detailLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    fontWeight: FontWeights.medium,
  },
  detailValue: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  countryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countryFlag: {
    fontSize: FontSizes.lg,
  },
  descriptionSection: {
    marginBottom: Spacing.lg,
  },
  descriptionText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  bottomPriceSection: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text.primary,
  },
  bottomWeight: {
    fontSize: FontSizes.sm,
    color: '#10B981',
  },
  addToCartButton: {
    backgroundColor: '#E1002B',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.lg,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '300',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
