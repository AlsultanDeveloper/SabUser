// AppContext.tsx - dummy content
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import Toast from 'react-native-toast-message';
import i18n from '@/constants/i18n';
import type { Language, Currency, Product, CartItem } from '@/types';

const EXCHANGE_RATE = 89500;

export const [AppProvider, useApp] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    i18n.locale = language;
    
    const isRTL = language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      if (Platform.OS !== 'web') {
        console.log('RTL changed, app needs restart on native');
      }
    }
  }, [language]);

  const loadSettings = async () => {
    try {
      const [storedLanguage, storedCurrency, storedCart] = await Promise.all([
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('currency'),
        AsyncStorage.getItem('cart'),
      ]);

      if (storedLanguage) {
        setLanguage(storedLanguage as Language);
      }
      if (storedCurrency) {
        setCurrency(storedCurrency as Currency);
      }
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (newLanguage: Language) => {
    try {
      console.log('[AppContext] Changing language to:', newLanguage);
      
      await AsyncStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
      
      i18n.locale = newLanguage;
      const isRTL = newLanguage === 'ar';
      
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        
        if (Platform.OS !== 'web') {
          console.log('[AppContext] RTL changed, reloading app...');
          setTimeout(async () => {
            try {
              await Updates.reloadAsync();
            } catch (error) {
              console.error('[AppContext] Failed to reload app:', error);
            }
          }, 300);
        }
      }
      
      console.log('[AppContext] Language changed successfully to:', newLanguage);
    } catch (error) {
      console.error('[AppContext] Error saving language:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to change language',
        position: 'top',
      });
    }
  }, []);

  const changeCurrency = useCallback(async (newCurrency: Currency) => {
    try {
      console.log('[AppContext] Changing currency to:', newCurrency);
      console.log('[AppContext] Current language (should not change):', language);
      
      await AsyncStorage.setItem('currency', newCurrency);
      setCurrency(newCurrency);
      
      
      Toast.show({
        type: 'success',
        text1: language === 'en' ? 'Currency Changed' : 'تم تغيير العملة',
        text2: language === 'en' ? `Currency set to ${newCurrency}` : `تم تعيين العملة إلى ${newCurrency}`,
        position: 'top',
        visibilityTime: 2000,
      });
      
      console.log('[AppContext] Currency changed successfully to:', newCurrency);
    } catch (error) {
      console.error('[AppContext] Error saving currency:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to change currency',
        position: 'top',
      });
    }
  }, [language]);

  const addToCart = useCallback(async (
    product: Product, 
    quantity: number = 1,
    options?: {
      size?: string | null;
      color?: {ar: string; en: string; hex: string} | null;
      age?: string | null;
    }
  ) => {
    // Find existing item with same product AND same options
    const existingItem = cart.find((item) => {
      if (item.product.id !== product.id) return false;
      
      // Check if options match
      const sameSize = (item as any).selectedSize === options?.size;
      const sameColor = JSON.stringify((item as any).selectedColor) === JSON.stringify(options?.color);
      const sameAge = (item as any).selectedAge === options?.age;
      
      return sameSize && sameColor && sameAge;
    });
    
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((item) => {
        const sameProduct = item.product.id === product.id;
        const sameSize = (item as any).selectedSize === options?.size;
        const sameColor = JSON.stringify((item as any).selectedColor) === JSON.stringify(options?.color);
        const sameAge = (item as any).selectedAge === options?.age;
        
        return (sameProduct && sameSize && sameColor && sameAge)
          ? { ...item, quantity: item.quantity + quantity }
          : item;
      });
    } else {
      newCart = [...cart, { 
        product, 
        quantity,
        ...(options?.size && { selectedSize: options.size }),
        ...(options?.color && { selectedColor: options.color }),
        ...(options?.age && { selectedAge: options.age }),
      } as any];
    }

    setCart(newCart);
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart]);

  const updateCartItemQuantity = useCallback(async (productId: string, quantity: number) => {
    let newCart: CartItem[];
    
    if (quantity <= 0) {
      newCart = cart.filter((item) => item.product.id !== productId);
    } else {
      newCart = cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    }

    setCart(newCart);
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }, [cart]);

  const removeFromCart = useCallback(async (productId: string) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    setCart(newCart);
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    try {
      await AsyncStorage.removeItem('cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    const finalPrice = currency === 'LBP' ? price * EXCHANGE_RATE : price;
    const symbol = currency === 'USD' ? '$' : 'ل.ل';
    const formatted = finalPrice.toLocaleString('en-US', {
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    });
    
    return currency === 'USD' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
  }, [currency]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const itemPrice = item.product.discount 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const t = useCallback((key: string, params?: Record<string, any>) => {
    return i18n.t(key, params);
  }, []);

  const isRTL = language === 'ar';

  return useMemo(() => ({
    language,
    currency,
    cart,
    isLoading,
    cartTotal,
    cartItemsCount,
    isRTL,
    changeLanguage,
    changeCurrency,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    t,
  }), [language, currency, cart, isLoading, cartTotal, cartItemsCount, isRTL, changeLanguage, changeCurrency, addToCart, updateCartItemQuantity, removeFromCart, clearCart, formatPrice, t]);
});
