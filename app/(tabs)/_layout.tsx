import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { t, cartItemsCount } = useApp();

  return (
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
          headerTitle: 'Shop by category',
          tabBarIcon: ({ color, size }) => <Feather name="grid" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          headerTitle: t('tabs.cart'),
          tabBarIcon: ({ color, size }) => (
            <View>
              <Feather name="shopping-cart" color={color} size={size} />
              {cartItemsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="brands"
        options={{
          title: t('tabs.brands'),
          headerTitle: t('tabs.brands'),
          tabBarIcon: ({ color, size }) => <Feather name="tag" color={color} size={size} />,
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
          href: null, // مخفية من شريط التابز
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
    </Tabs>
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
});
