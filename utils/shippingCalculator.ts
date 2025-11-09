// 📦 Smart Shipping Calculator
// Calculate shipping cost based on distance from store

import { db } from '@/constants/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface ShippingCalculation {
  cost: number;
  distance: number; // in km
  estimatedDays: string;
}

export interface ShippingTier {
  name?: string;
  maxDistance: number;
  cost: number;
  deliveryDays: string;
  description?: string;
}

export interface ShippingSettings {
  enabled: boolean;
  freeShippingThreshold: number;
  defaultCost: number;
  currency: string;
  storeLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  tiers: ShippingTier[];
}

// Cache for shipping settings
let cachedSettings: ShippingSettings | null = null;

/**
 * Load shipping settings from Firebase
 */
export async function loadShippingSettings(): Promise<ShippingSettings> {
  // Return cached settings if available
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const settingsRef = doc(db, 'settings', 'shipping');
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      cachedSettings = settingsSnap.data() as ShippingSettings;
      return cachedSettings;
    }
  } catch (error) {
    console.error('Error loading shipping settings:', error);
  }

  // Fallback to default settings
  return getDefaultSettings();
}

/**
 * Get default shipping settings (fallback)
 */
function getDefaultSettings(): ShippingSettings {
  return {
    enabled: true,
    freeShippingThreshold: 100,
    defaultCost: 5,
    currency: 'USD',
    storeLocation: {
      latitude: 34.4333,
      longitude: 35.8333,
      address: 'Tripoli, Lebanon',
    },
    tiers: [
      { maxDistance: 5, cost: 2, deliveryDays: '1-2' },
      { maxDistance: 20, cost: 5, deliveryDays: '2-3' },
      { maxDistance: 50, cost: 8, deliveryDays: '3-4' },
      { maxDistance: 100, cost: 10, deliveryDays: '4-5' },
      { maxDistance: 999999, cost: 15, deliveryDays: '5-7' },
    ],
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate shipping cost based on distance
 * Similar to Noon's dynamic pricing
 */
export async function calculateShipping(
  customerLat: number,
  customerLon: number,
  cartTotal: number = 0
): Promise<ShippingCalculation> {
  const settings = await loadShippingSettings();
  
  const distance = calculateDistance(
    settings.storeLocation.latitude,
    settings.storeLocation.longitude,
    customerLat,
    customerLon
  );

  // Find appropriate tier based on distance
  let cost = settings.defaultCost;
  let estimatedDays = '2-3';

  for (const tier of settings.tiers) {
    if (distance <= tier.maxDistance) {
      cost = tier.cost;
      estimatedDays = tier.deliveryDays;
      break;
    }
  }

  // Free shipping for orders over threshold
  if (cartTotal >= settings.freeShippingThreshold) {
    cost = 0;
    estimatedDays = '2-3';
  }

  return {
    cost,
    distance,
    estimatedDays,
  };
}

/**
 * Get shipping cost without location (fallback)
 */
export async function getDefaultShipping(cartTotal: number = 0): Promise<ShippingCalculation> {
  const settings = await loadShippingSettings();
  
  return {
    cost: cartTotal >= settings.freeShippingThreshold ? 0 : settings.defaultCost,
    distance: 0,
    estimatedDays: '2-3',
  };
}

/**
 * Format shipping message for UI
 */
export function getShippingMessage(
  shipping: ShippingCalculation,
  language: string = 'en'
): string {
  if (shipping.cost === 0) {
    return language === 'ar' ? '🎉 شحن مجاني!' : '🎉 FREE Shipping!';
  }

  if (language === 'ar') {
    return `📦 التوصيل خلال ${shipping.estimatedDays} أيام`;
  }
  
  return `📦 Delivery in ${shipping.estimatedDays} days`;
}
