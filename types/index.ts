// index.ts - dummy content
export type Language = 'en' | 'ar';
export type Currency = 'USD' | 'LBP';

export interface Brand {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description?: {
    en: string;
    ar: string;
  };
  logo: string;
  image: string;
}

export interface Product {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  price: number;
  image: string;
  images: string[];
  category: string;
  brandId?: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  discount?: number;
  
  // Additional product details
  brandName?: string;
  categoryName?: string;
  subcategoryId?: string; // معرف الفئة الفرعية
  subcategoryName?: string;
  colors?: {
    ar: string;
    en: string;
    hex: string;
  }[];
  sizes?: string[];
  shoeSizes?: string[];
  ageRange?: string[];
  gender?: 'Boy' | 'Girl' | 'Unisex-Kids' | 'Men' | 'Women' | 'Unisex';
  season?: 'Summer' | 'Winter' | 'All-Season';
  deliveryTime?: string;
  shippingCost?: number; // سعر التوصيل للمنتج (يتم تحديده من لوحة التحكم)
  stock?: number;
  available?: boolean;
  
  // Product specifications
  material?: string;
  careInstructions?: string;
  features?: string[];
  reviewsCount?: number;
  
  // Unit (وحدة القياس)
  unit?: string; // e.g. "kg", "gram", "piece", "liter", "bottle", "box", "pack"
}

export interface Subcategory {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  image?: string;
}

export interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  icon: string;
  image: string;
  subcategories?: Subcategory[];
  order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Banner {
  id: string;
  image: string;
  title: {
    en: string;
    ar: string;
  };
  subtitle?: {
    en: string;
    ar: string;
  };
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cash' | 'card' | 'omt' | 'whish';

export interface OrderAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface SavedAddress {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  total: number;
  address: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  statusHistory: OrderStatusUpdate[];
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: string;
  description: {
    en: string;
    ar: string;
  };
}

// ===== User Types =====

export type SignInMethod = 'email' | 'google' | 'apple' | 'phone';
export type Theme = 'light' | 'dark' | 'auto';
export type MembershipLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UserNotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  orders: boolean;
  promotions: boolean;
}

export interface UserPreferences {
  language: Language;
  currency: Currency;
  notifications: UserNotificationSettings;
  theme: Theme;
}

export interface UserAddress {
  id: string;
  label: string;
  fullAddress: string;
  city: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  membershipLevel: MembershipLevel;
}

export interface UserStatus {
  isActive: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  blockReason?: string;
  twoFactorEnabled: boolean;
}

export interface UserMetadata {
  registrationSource: 'web' | 'ios' | 'android';
  referralCode?: string;
  referredBy?: string;
  deviceInfo?: {
    platform: string;
    version: string;
  };
}

export interface User {
  // معلومات أساسية
  uid: string;
  email: string;
  emailVerified: boolean;
  
  // الاسم
  fullName: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  
  // الصورة
  photoURL?: string;
  
  // المصادقة
  signInMethod: SignInMethod;
  
  // الاتصال
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // العنوان الافتراضي
  defaultAddressId?: string;
  
  // التفضيلات
  preferences: UserPreferences;
  
  // الإحصائيات
  stats: UserStats;
  
  // الحالة
  status: UserStatus;
  
  // التواريخ
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  lastPasswordChange?: string;
  
  // بيانات إضافية
  metadata?: UserMetadata;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  language?: Language;
}
