// GlassyGradientCartFAB.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import {
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  count?: number;           // عدد عناصر السلة
  onPress?: () => void;     // فتح شاشة السلة
  position?: 'start' | 'end'; // محاذاة مع دعم RTL
  bottomOffset?: number;    // المسافة من الأسفل
  size?: number;            // قطر الزر (افتراضي 64)
  draggable?: boolean;      // تفعيل السحب
};

export default function GlassyGradientCartFAB({
  count = 0,
  onPress,
  position = 'end',
  bottomOffset = 28,
  size = 64,
  draggable = true,
}: Props) {
  const isRTL = I18nManager.isRTL;
  const isStart = position === 'start';
  const alignToStart = isRTL ? !isStart : isStart;
  const r = useMemo(() => size / 2, [size]);

  // الموقع الافتراضي
  const defaultRight = 20;
  const defaultBottom = bottomOffset;

  // أنيميشن الموقع للسحب
  const pan = useRef(
    new Animated.ValueXY({
      x: alignToStart ? -(SCREEN_WIDTH - size - defaultRight) : 0,
      y: 0,
    })
  ).current;

  // أنيميشن دخول الزر
  const enter = useRef(new Animated.Value(0)).current;

  // أنيميشن البادج/الرقم
  const badgeScale = useRef(new Animated.Value(1)).current;
  const numberOpacity = useRef(new Animated.Value(1)).current;
  const numberTranslateY = useRef(new Animated.Value(0)).current;

  // تتبع القيمة السابقة لتحديد الزيادة
  const prevCount = useRef(count);

  // تتبع حركة السحب
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);

  // PanResponder للسحب
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // السماح بالسحب فقط إذا تحرك الإصبع أكثر من 5 بكسل
        return draggable && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        dragStartTime.current = Date.now();
        // Haptic عند بدء السحب
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const dragDuration = Date.now() - dragStartTime.current;
        const totalMovement = Math.abs(gesture.dx) + Math.abs(gesture.dy);
        
        // إذا كانت حركة صغيرة وسريعة، اعتبرها نقرة
        if (totalMovement < 10 && dragDuration < 200) {
          isDragging.current = false;
          pan.flattenOffset();
          // سيتم التعامل معها كنقرة في handlePress
          return;
        }

        pan.flattenOffset();
        
        // التأكد من بقاء الزر داخل الشاشة
        const maxX = SCREEN_WIDTH - size - 20;
        const maxY = SCREEN_HEIGHT - size - defaultBottom;
        
        let finalX = (pan.x as any)._value;
        let finalY = (pan.y as any)._value;

        // تقييد الحركة داخل حدود الشاشة
        finalX = Math.max(-maxX, Math.min(0, finalX));
        finalY = Math.max(-maxY, Math.min(0, finalY));

        // أنيميشن سلس للموقع النهائي
        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();

        // Haptic عند الإفلات
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // إعادة تعيين حالة السحب بعد فترة قصيرة
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      },
    })
  ).current;

  useEffect(() => {
    // أنيميشن الدخول - بدون native driver لأن pan يستخدم false
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: false,
      friction: 7,
      tension: 60,
    }).start();
  }, [enter]);

  useEffect(() => {
    // تشغيل أنيميشن/صوت فقط عند زيادة العدد
    if (count > prevCount.current) {
      // نبضة البادج + حركة الرقم
      Animated.parallel([
        Animated.sequence([
          Animated.spring(badgeScale, {
            toValue: 1.18,
            useNativeDriver: true,
            friction: 6,
            tension: 140,
          }),
          Animated.spring(badgeScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
            tension: 120,
          }),
        ]),
        Animated.sequence([
          Animated.timing(numberOpacity, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(numberOpacity, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.spring(numberTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              friction: 6,
              tension: 120,
            }),
          ]),
        ]),
      ]).start();

      // Haptics عند الزيادة
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (count !== prevCount.current) {
      // تغيّر بدون زيادة (نقصان مثلاً) – حركة خفيفة بدون صوت
      Animated.sequence([
        Animated.timing(numberOpacity, {
          toValue: 0.6,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(numberOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // تحديث القيمة السابقة
    prevCount.current = count;

    // إعداد لحركة الرقم (ابتداءً من نزول بسيط)
    numberTranslateY.setValue(-6);
  }, [count, badgeScale, numberOpacity, numberTranslateY]);

  const handlePress = () => {
    // لا تنفذ النقرة إذا كان المستخدم يسحب
    if (isDragging.current) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  // نص الرقم النهائي
  const countLabel = count > 99 ? '99+' : String(count);

  return (
    <Animated.View
      {...(draggable ? panResponder.panHandlers : {})}
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: defaultBottom,
          [isRTL ? 'left' : 'right']: defaultRight,
          opacity: enter,
          transform: [
            { translateX: pan.x },
            { 
              translateY: Animated.add(
                pan.y,
                enter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                })
              )
            },
          ],
        } as any,
      ]}
      accessibilityIgnoresInvertColors
    >
      <Pressable
        onPress={handlePress}
        android_ripple={{
          color: 'rgba(255,255,255,0.12)',
          borderless: true,
          radius: r,
        }}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size, borderRadius: r },
          pressed && { transform: [{ scale: 0.985 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="سلة التسوق"
        accessibilityHint={`افتح السلة، عدد المنتجات ${count}`}
      >
        {/* Container للمحتوى مع overflow hidden */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: r, overflow: 'hidden' }]}>
          {/* خلفية تدرّج برتقالي → أحمر */}
          <LinearGradient
            colors={['#FF8A00', '#FF3B2F']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* طبقة زجاجية خفيفة لِمَعان */}
          <BlurView
            intensity={Platform.OS === 'ios' ? 20 : 10}
            tint="light"
            style={[StyleSheet.absoluteFill, { opacity: 0.2 }]}
          />

          {/* لمعة علوية لزيادة الإحساس ثلاثي الأبعاد */}
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 0.7 }}
            style={{
              position: 'absolute',
              top: 3,
              left: 3,
              right: 3,
              height: size * 0.36,
              borderTopLeftRadius: r,
              borderTopRightRadius: r,
            }}
          />

          {/* لمعة جانبية خفيفة */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'transparent']}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 1, y: 0.6 }}
            style={{
              position: 'absolute',
              left: 2,
              top: size * 0.25,
              bottom: size * 0.1,
              width: size * 0.18,
              borderRadius: r,
            }}
          />
        </View>

        {/* الرقم في المنتصف - كبير وواضح */}
        <Animated.View style={styles.centerContent}>
          <Animated.Text
            style={[
              styles.mainCountText,
              {
                opacity: numberOpacity,
                transform: [
                  { scale: badgeScale },
                  { translateY: numberTranslateY },
                ],
              },
            ]}
          >
            {countLabel}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 100 },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    // ظلال 3D للزر
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCountText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
    lineHeight: 28,
    marginTop: 2,
  },
});
