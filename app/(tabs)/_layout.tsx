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
  const { t, cartItemsCount, language } = useApp();
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
    // Navigate to SAB Market (separate app experience)
    router.push('/market' as any);
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
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
            paddingHorizontal: 5,
            flexDirection: language === 'ar' ? 'row-reverse' : 'row',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600' as const,
            marginTop: 0,
          },
          tabBarIconStyle: {
            marginTop: 0,
            marginBottom: 2,
          },
          tabBarItemStyle: {
            paddingHorizontal: 2,
          },
          lazy: true,
          tabBarHideOnKeyboard: true,
        }}
      >
        {/* Tab 1: Home */}
        <Tabs.Screen
          name="home"
          options={{
            title: t('tabs.home'),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" color={color} size={24} />
            ),
          }}
        />

        {/* Tab 2: Categories */}
        <Tabs.Screen
          name="categories"
          options={{
            title: t('tabs.categories'),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="grid" color={color} size={24} />
            ),
          }}
        />

        {/* Tab 3: SAB Placeholder (المساحة المحجوزة للزر العائم) */}
        <Tabs.Screen
          name="sab-placeholder"
          options={{
            title: '',
            tabBarIcon: () => <View style={{ width: 50, height: 24 }} />,
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
        />

        {/* Tab 4: Brands */}
        <Tabs.Screen
          name="brands"
          options={{
            title: t('tabs.brands'),
            headerTitle: t('tabs.brands'),
            tabBarIcon: ({ color, size }) => (
              <Feather name="tag" color={color} size={24} />
            ),
          }}
        />

        {/* Tab 5: Account */}
        <Tabs.Screen
          name="account"
          options={{
            title: t('tabs.account'),
            headerTitle: t('tabs.account'),
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" color={color} size={24} />
            ),
          }}
        />
      </Tabs>

      {/* الزر العائم SAB مع حركة الارتداد */}
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
  fabContainer: {
    position: 'absolute',
    bottom: 18, // رفع الزر أكثر ليتناسب مع شريط التبويبات
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 1000,
  },
  fabGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabImage: {
    width: '100%',
    height: '100%',
  },
});
