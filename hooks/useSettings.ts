/**
 * useSettings Hook
 * 
 * Fetches app settings from Firebase Firestore (settings/app document)
 * Provides real-time updates when settings change
 * Falls back to default values if settings are not available
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isConfigured } from '@/constants/firebase';

export interface ShippingSettings {
  cost: number;
  freeShippingThreshold: number;
  currency: string;
  enabled: boolean;
}

export interface CurrencySettings {
  default: string;
  supported: string[];
  usdToLbp?: number; // سعر صرف الدولار مقابل الليرة اللبنانية
}

export interface TaxSettings {
  enabled: boolean;
  rate: number;
  includeInPrice: boolean;
}

export interface OrderSettings {
  minOrderAmount: number;
  maxOrderAmount: number;
}

export interface AppMetadata {
  maintenanceMode: boolean;
  version: string;
  forceUpdate: boolean;
}

export interface AppSettings {
  shipping: ShippingSettings;
  currency?: CurrencySettings;
  tax?: TaxSettings;
  orderSettings?: OrderSettings;
  app?: AppMetadata;
}

// Default settings if Firebase is not configured or settings don't exist
const DEFAULT_SETTINGS: AppSettings = {
  shipping: {
    cost: 15,
    freeShippingThreshold: 100,
    currency: 'SAR',
    enabled: true,
  },
  currency: {
    default: 'SAR',
    supported: ['SAR', 'USD', 'AED'],
    usdToLbp: 89700, // السعر الافتراضي: 1 USD = 89,700 LBP
  },
  tax: {
    enabled: false,
    rate: 0,
    includeInPrice: false,
  },
  orderSettings: {
    minOrderAmount: 0,
    maxOrderAmount: 10000,
  },
  app: {
    maintenanceMode: false,
    version: '1.0.0',
    forceUpdate: false,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase is not configured, use default settings
    if (!isConfigured || !db) {
      console.log('⚙️ Firebase not configured, using default settings');
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    // Set up real-time listener for settings
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'app'),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as AppSettings;
          console.log('✅ Settings loaded from Firebase:', data);
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            shipping: {
              ...DEFAULT_SETTINGS.shipping,
              ...data.shipping,
            },
          });
        } else {
          console.log('⚠️ Settings document not found, using default settings');
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Silently fall back to default settings on permission errors
        console.warn('⚠️ Could not load settings from Firebase, using defaults:', err.message);
        setError(null); // Don't show error to user
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { 
    settings, 
    loading, 
    error,
    // Helper getters for common settings
    shippingCost: settings.shipping.cost,
    freeShippingThreshold: settings.shipping.freeShippingThreshold,
    isShippingEnabled: settings.shipping.enabled,
    currency: settings.shipping.currency,
    usdToLbp: settings.currency?.usdToLbp || 89700, // سعر الصرف
  };
}
