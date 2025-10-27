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
export type PaymentMethod = 'cash' | 'omt' | 'whish';

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
