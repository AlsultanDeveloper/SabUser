/**
 * 🚀 Cache Manager - لتخزين البيانات محلياً
 * 
 * يحفظ الفئات والمنتجات المميزة في AsyncStorage
 * للتحميل الفوري عند فتح التطبيق
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  CATEGORIES: '@cache:categories',
  FEATURED_PRODUCTS: '@cache:featured_products',
  CATEGORIES_TIMESTAMP: '@cache:categories_timestamp',
  PRODUCTS_TIMESTAMP: '@cache:products_timestamp',
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 دقيقة

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * حفظ البيانات في الكاش
 */
export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    console.log(`✅ Cache saved: ${key}`);
  } catch (error) {
    console.error(`❌ Error saving cache for ${key}:`, error);
  }
}

/**
 * قراءة البيانات من الكاش
 */
export async function getCache<T>(key: string, maxAge: number = CACHE_DURATION): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) {
      console.log(`📭 No cache found for ${key}`);
      return null;
    }

    const cacheItem: CacheItem<T> = JSON.parse(cached);
    const age = Date.now() - cacheItem.timestamp;

    if (age > maxAge) {
      console.log(`⏰ Cache expired for ${key} (age: ${Math.round(age / 1000)}s)`);
      await AsyncStorage.removeItem(key);
      return null;
    }

    console.log(`✅ Cache hit for ${key} (age: ${Math.round(age / 1000)}s)`);
    return cacheItem.data;
  } catch (error) {
    console.error(`❌ Error reading cache for ${key}:`, error);
    return null;
  }
}

/**
 * حذف الكاش
 */
export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`🗑️ Cache cleared: ${key}`);
  } catch (error) {
    console.error(`❌ Error clearing cache for ${key}:`, error);
  }
}

/**
 * حذف جميع الكاش
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log('🗑️ All cache cleared');
  } catch (error) {
    console.error('❌ Error clearing all cache:', error);
  }
}

/**
 * Helpers للفئات والمنتجات
 */
export const CacheManager = {
  // Categories
  async setCategories(categories: any[]) {
    await setCache(CACHE_KEYS.CATEGORIES, categories);
  },
  
  async getCategories(): Promise<any[] | null> {
    return getCache<any[]>(CACHE_KEYS.CATEGORIES, 60 * 60 * 1000); // ساعة واحدة
  },
  
  // Featured Products
  async setFeaturedProducts(products: any[]) {
    await setCache(CACHE_KEYS.FEATURED_PRODUCTS, products);
  },
  
  async getFeaturedProducts(): Promise<any[] | null> {
    return getCache<any[]>(CACHE_KEYS.FEATURED_PRODUCTS, 30 * 60 * 1000); // 30 دقيقة
  },
  
  // Clear all
  async clearAll() {
    await clearAllCache();
  },
};
