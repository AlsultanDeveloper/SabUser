import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SafeImage from './SafeImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 16px margin on each side + 16px gap

interface AmazonStyleProductCardProps {
  product: any;
  onPress: () => void;
  formatPrice: (price: number) => string;
  language?: string;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

const AmazonStyleProductCard = memo(function AmazonStyleProductCard({
  product,
  onPress,
  formatPrice,
  language = 'en',
  onToggleWishlist,
  isInWishlist = false,
}: AmazonStyleProductCardProps) {
  
  // Product cards are hidden - بطاقات المنتجات مخفية
  return null;
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F8F8F8',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#B12704',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    maxWidth: CARD_WIDTH * 0.6,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '500',
  },
  productInfo: {
    padding: 8,
  },
  brandText: {
    color: '#007185',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  productName: {
    color: '#0F1111',
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 4,
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  ratingText: {
    color: '#007185',
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
  },
  reviewsText: {
    color: '#007185',
    fontSize: 11,
    fontWeight: '400',
  },
  priceSection: {
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  originalPrice: {
    color: '#565959',
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginRight: 6,
    marginBottom: 2,
  },
  currentPrice: {
    color: '#B12704',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  savingsBadge: {
    backgroundColor: '#FFD814',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  savingsText: {
    color: '#0F1111',
    fontSize: 9,
    fontWeight: '600',
  },
  shippingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingText: {
    color: '#007185',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 3,
  },
});

export default AmazonStyleProductCard;