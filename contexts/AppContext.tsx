// AppContext.tsx - dummy content
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import Toast from 'react-native-toast-message';
import i18n from '@/constants/i18n';
import type { Language, Product, CartItem } from '@/types';

export const [AppProvider, useApp] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('en');
  // Fixed currency: USD only
  const currency = 'USD' as const;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    i18n.locale = language;
    
    const isRTL = language === 'ar';
    // Apply RTL immediately on language change
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    
    console.log(`[AppContext] RTL ${isRTL ? 'enabled' : 'disabled'} for language: ${language}`);
  }, [language]);

  const loadSettings = async () => {
    try {
      const [storedLanguage, storedCart] = await Promise.all([
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('cart'),
      ]);

      if (storedLanguage) {
        setLanguage(storedLanguage as Language);
        i18n.locale = storedLanguage;
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
      
      const isRTL = newLanguage === 'ar';
      const needsReload = I18nManager.isRTL !== isRTL;
      
      // Save language first
      await AsyncStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
      i18n.locale = newLanguage;
      
      // Apply RTL and reload immediately if needed
      if (needsReload && Platform.OS !== 'web') {
        I18nManager.forceRTL(isRTL);
        I18nManager.allowRTL(isRTL);
        
        console.log('[AppContext] RTL changed, reloading app immediately...');
        
        // Show a brief toast before reload
        Toast.show({
          type: 'info',
          text1: isRTL ? 'جاري تطبيق التغييرات...' : 'Applying changes...',
          text2: isRTL ? 'سيتم إعادة تشغيل التطبيق' : 'App will restart',
          position: 'top',
          visibilityTime: 1000,
        });
        
        // Immediate reload
        setTimeout(() => {
          Updates.reloadAsync().catch(error => {
            console.error('[AppContext] Failed to reload app:', error);
            // Fallback: show manual restart instruction
            Toast.show({
              type: 'error',
              text1: isRTL ? 'يرجى إعادة تشغيل التطبيق' : 'Please restart the app',
              text2: isRTL ? 'أغلق وافتح التطبيق مرة أخرى' : 'Close and reopen the app',
              position: 'top',
              visibilityTime: 5000,
            });
          });
        }, 500);
      } else if (needsReload && Platform.OS === 'web') {
        // For web, just force a page reload
        I18nManager.forceRTL(isRTL);
        window.location.reload();
      } else {
        console.log('[AppContext] Language changed successfully to:', newLanguage);
      }
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

  // Format price in USD only - Safe version
  const formatPrice = useCallback((price: number | undefined | null) => {
    // تأكد من أن السعر رقم صالح
    if (price === null || price === undefined || isNaN(price) || typeof price !== 'number') {
      return '$0.00';
    }
    
    // تأكد من أن السعر موجب
    const safePrice = Math.max(0, price);
    
    try {
      const formatted = safePrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$${formatted}`;
    } catch (error) {
      console.warn('Error formatting price:', price, error);
      return '$0.00';
    }
  }, []);

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
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    t,
  }), [language, currency, cart, isLoading, cartTotal, cartItemsCount, isRTL, changeLanguage, addToCart, updateCartItemQuantity, removeFromCart, clearCart, formatPrice, t]);
});
