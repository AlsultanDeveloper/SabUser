import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import SafeImage from '@/components/SafeImage';

interface ProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language: string;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

const NewProductCard = React.memo(function NewProductCard({ 
  product, 
  onPress, 
  formatPrice, 
  language, 
  onToggleWishlist, 
  isInWishlist 
}: ProductCardProps) {

  // Product cards are hidden - بطاقات المنتجات مخفية
  return null;
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: Colors.gray[50],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  brandBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    maxWidth: 80,
  },
  brandBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm + 40,
    left: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
  infoContainer: {
    padding: Spacing.md,
  },
  brandText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeights.medium,
    marginBottom: 2,
  },
  nameText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: FontSizes.xs,
    color: Colors.text.primary,
    fontWeight: FontWeights.medium,
    marginLeft: 2,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  originalPriceText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
});

export default NewProductCard;