import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  shimmer?: boolean;
}

const SkeletonLoader = memo(function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = BorderRadius.sm, 
  style,
  shimmer = true 
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (shimmer) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shimmer animation
      Animated.loop(
        Animated.timing(translateX, {
          toValue: 100,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animatedValue, translateX, shimmer]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  if (!shimmer) {
    return (
      <View
        style={[
          styles.skeleton,
          {
            width,
            height,
            borderRadius,
          } as ViewStyle,
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.skeletonContainer,
        {
          width,
          height,
          borderRadius,
        } as ViewStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.skeleton,
          {
            width: '100%',
            height: '100%',
            borderRadius,
            opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
});

export { SkeletonLoader };

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
  skeletonContainer: {
    overflow: 'hidden',
    backgroundColor: Colors.gray[100],
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '30%',
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
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
