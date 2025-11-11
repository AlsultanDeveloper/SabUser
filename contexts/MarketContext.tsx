// MarketContext.tsx - Separate cart and state management for SAB Market
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface MarketProduct {
  id: string;
  name: any;
  price: number;
  image: string;
  weight?: string;
  quantity: number;
  discount?: number;
}

interface MarketContextType {
  // Cart
  marketCart: MarketProduct[];
  addToMarketCart: (product: any, quantity?: number) => void;
  removeFromMarketCart: (productId: string) => void;
  updateMarketCartQuantity: (productId: string, quantity: number) => void;
  clearMarketCart: () => void;
  marketCartTotal: number;
  marketCartCount: number;
  
  // Language (shared with main app)
  language: string;
  setLanguage: (lang: string) => void;
  isRTL: boolean;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const MARKET_CART_KEY = '@sab_market_cart';
const MARKET_LANGUAGE_KEY = '@sab_market_language';

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketCart, setMarketCart] = useState<MarketProduct[]>([]);
  const [language, setLanguageState] = useState('en');

  // Load cart from storage
  useEffect(() => {
    loadMarketCart();
    loadLanguage();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveMarketCart();
  }, [marketCart]);

  const loadMarketCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(MARKET_CART_KEY);
      if (cartData) {
        setMarketCart(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading market cart:', error);
    }
  };

  const saveMarketCart = async () => {
    try {
      await AsyncStorage.setItem(MARKET_CART_KEY, JSON.stringify(marketCart));
    } catch (error) {
      console.error('Error saving market cart:', error);
    }
  };

  const loadLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem(MARKET_LANGUAGE_KEY);
      if (lang) {
        setLanguageState(lang);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(MARKET_LANGUAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const addToMarketCart = (product: any, quantity: number = 1) => {
    const existingItemIndex = marketCart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const updatedCart = [...marketCart];
      updatedCart[existingItemIndex].quantity += quantity;
      setMarketCart(updatedCart);
      
      Toast.show({
        type: 'success',
        text1: language === 'ar' ? 'تم التحديث' : 'Updated',
        text2: language === 'ar' ? 'تم تحديث الكمية' : 'Quantity updated',
        position: 'top',
      });
    } else {
      // Add new item
      const finalPrice = product.discount && product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;

      const newItem: MarketProduct = {
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: product.image || product.images?.[0],
        weight: product.weight,
        quantity: quantity,
        discount: product.discount,
      };
      
      setMarketCart([...marketCart, newItem]);
      
      Toast.show({
        type: 'success',
        text1: language === 'ar' ? 'تمت الإضافة' : 'Added to cart',
        text2: language === 'ar' ? 'تمت إضافة المنتج' : 'Product added successfully',
        position: 'top',
      });
    }
  };

  const removeFromMarketCart = (productId: string) => {
    setMarketCart(marketCart.filter(item => item.id !== productId));
    
    Toast.show({
      type: 'info',
      text1: language === 'ar' ? 'تم الحذف' : 'Removed',
      text2: language === 'ar' ? 'تم حذف المنتج' : 'Product removed',
      position: 'top',
    });
  };

  const updateMarketCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromMarketCart(productId);
      return;
    }
    
    const updatedCart = marketCart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setMarketCart(updatedCart);
  };

  const clearMarketCart = () => {
    setMarketCart([]);
  };

  // Calculate total
  const marketCartTotal = marketCart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate item count
  const marketCartCount = marketCart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const isRTL = language === 'ar';

  return (
    <MarketContext.Provider
      value={{
        marketCart,
        addToMarketCart,
        removeFromMarketCart,
        updateMarketCartQuantity,
        clearMarketCart,
        marketCartTotal,
        marketCartCount,
        language,
        setLanguage,
        isRTL,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
