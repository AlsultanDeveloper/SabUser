// SkeletonLoader.tsx - dummy content
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = BorderRadius.sm, style }: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonLoader width="100%" height={150} borderRadius={BorderRadius.lg} />
      <View style={styles.productInfo}>
        <SkeletonLoader width="60%" height={14} />
        <SkeletonLoader width="80%" height={16} style={{ marginTop: 6 }} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: 6 }} />
        <SkeletonLoader width="50%" height={18} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function CategoryCardSkeleton() {
  return (
    <View style={styles.categoryItem}>
      <SkeletonLoader width={80} height={80} borderRadius={16} />
      <SkeletonLoader width={70} height={12} style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

export function BannerSkeleton({ width }: { width: number }) {
  return (
    <SkeletonLoader width={width} height={220} borderRadius={BorderRadius.xl} />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.gray[200],
  },
  productCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  productInfo: {
    padding: Spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 90,
  },
});
