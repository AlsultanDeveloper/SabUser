import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function TabLayout() {
  const { t, cartItemsCount } = useApp();
  const router = useRouter();
  
  // Animation for bounce effect
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce animation every 10 seconds
    const bounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15, // Move up
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0, // Back to normal
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: -10, // Small bounce
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0, // Back to normal
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Start first bounce after 2 seconds
    const firstTimeout = setTimeout(bounceAnimation, 2000);
    
    // Repeat every 10 seconds
    const interval = setInterval(bounceAnimation, 10000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [bounceAnim]);

  const handleSabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Navigate to Sab Market category
    router.push('/category/cwt28D5gjoLno8SFqoxQ' as any);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray[400],
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: Colors.text.primary,
          },
          headerShadowVisible: true,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.gray[200],
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600' as const,
          },
          // Performance optimizations
          lazy: true, // Load screens lazily for faster initial load
          tabBarHideOnKeyboard: true,
        }}
      >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('tabs.categories'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="grid" color={color} size={size} />,
        }}
      />
      
      {/* Placeholder for SAB button in the middle */}
      <Tabs.Screen
        name="sab-placeholder"
        options={{
          tabBarButton: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      
      <Tabs.Screen
        name="brands"
        options={{
          title: t('tabs.brands'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="tag" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.account'),
          headerTitle: t('tabs.account'),
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />
      
      {/* Hidden screens */}
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          headerTitle: t('tabs.orders'),
          href: null,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('account.wishlist'),
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
    
    {/* Floating SAB Button with Bounce Animation */}
    <Animated.View 
      style={[
        styles.fabContainer,
        {
          transform: [{ translateY: bounceAnim }],
        },
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={handleSabPress}
        style={{ width: '100%', height: '100%' }}
      >
        <LinearGradient
          colors={['#0056D2', '#5B3A9D', '#C8102E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Image 
            source={require('@/assets/images/sab-logo.png')} 
            style={styles.fabImage} 
            resizeMode="cover"
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -10,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold' as const,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 15, // تحريك للأسفل (كان 25)
    left: '50%',
    marginLeft: -30, // Half of width to center (60/2 = 30)
    width: 60, // تصغير من 70 إلى 60
    height: 60, // تصغير من 70 إلى 60
    zIndex: 1000,
  },
  fabGradient: {
    width: 60, // تصغير من 70 إلى 60
    height: 60, // تصغير من 70 إلى 60
    borderRadius: 30, // تصغير من 35 إلى 30
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0, // إزالة الحدود البيضاء
    overflow: 'hidden', // قص أي محتوى خارج الحدود
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FF6B35',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  fabImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30, // تصغير من 35 إلى 30 (نفس borderRadius للزر)
  },
});
