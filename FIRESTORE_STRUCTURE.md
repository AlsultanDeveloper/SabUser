# Firestore Database Structure

This document describes the Firestore database structure for the Sab Store app.

## Collections

### Categories Collection: `categories`

Stores all product categories with multilingual support.

**Document Structure:**
```json
{
  "name": {
    "en": "Fashion",
    "ar": "أزياء"
  },
  "icon": "Shirt",
  "image": "https://images.unsplash.com/...",
  "order": 1
}
```

**Subcategories Subcollection: `categories/{categoryId}/subcategory`**

Each category has a `subcategory` subcollection storing its subcategories.

**Subcategory Document Structure:**
```json
{
  "name": {
    "en": "Men's Clothing",
    "ar": "ملابس رجالي"
  },
  "order": 1
}
```

**Required Categories:**
1. Fashion (أزياء)
2. Sab Market (متجر صاب)
3. Kitchen (مطبخ)
4. Saudi Groceries (بقالة سعودية)
5. Beauty (تجميل)
6. Bed & Bath (السرير والحمام)
7. Stationery (قرطاسية)
8. Electronics (إلكترونيات)
9. Auto Parts (قطع غيار السيارات)

**Category Fields:**
- `name` (object): Category name in English and Arabic
  - `en` (string): English name
  - `ar` (string): Arabic name
- `icon` (string): Lucide icon name (e.g., "Shirt", "ShoppingBag")
- `image` (string): Category image URL
- `order` (number): Display order (for sorting)

**Subcategory Fields:**
- `name` (object): Subcategory name in English and Arabic
  - `en` (string): English name
  - `ar` (string): Arabic name
- `order` (number, optional): Display order within the category

**Example Document ID:** Use auto-generated IDs or custom IDs like "fashion", "sab-market", etc.

**Firebase Rules:**
- Categories: Read access for all users, write for admins only
- Subcategories: Read access for all users, write for admins only

---

### Banners Collection: `banners`

Stores promotional banners displayed on the home screen.

**Document Structure:**
```json
{
  "title": {
    "en": "Summer Sale",
    "ar": "تخفيضات الصيف"
  },
  "subtitle": {
    "en": "Up to 50% off on selected items",
    "ar": "خصم حتى 50% على منتجات مختارة"
  },
  "image": "https://images.unsplash.com/...",
  "order": 1
}
```

**Fields:**
- `title` (object): Banner title in English and Arabic
  - `en` (string): English title
  - `ar` (string): Arabic title
- `subtitle` (object, optional): Banner subtitle in English and Arabic
  - `en` (string): English subtitle
  - `ar` (string): Arabic subtitle
- `image` (string): Banner image URL (recommended size: 1200x600px)
- `order` (number): Display order (lower numbers appear first)

**Example Document ID:** Use auto-generated IDs or custom IDs like "summer-sale", "new-arrivals", etc.

**Firebase Rules:**
- Banners: Read access for all users, write for admins only

**Usage:**
- Banners are displayed in a carousel on the home screen
- Auto-scroll every 4 seconds
- Supports multilingual content (English/Arabic)

**Image Guidelines:**
- Use high-quality images (min 1200px width)
- Recommended aspect ratio: 2:1 (landscape)
- Use Unsplash or Firebase Storage for hosting
- Ensure images are optimized for mobile devices

**See Also:** `BANNERS_GUIDE.md` for detailed setup instructions

---

### Brands Collection: `brands`

Stores all brand information.

**Document Structure:**
```json
{
  "name": {
    "en": "Nike",
    "ar": "نايك"
  },
  "description": {
    "en": "Just Do It - Leading sports brand",
    "ar": "فقط افعلها - علامة رياضية رائدة"
  },
  "logo": "https://images.unsplash.com/...",
  "image": "https://images.unsplash.com/...",
  "createdAt": "2025-10-26T12:00:00Z"
}
```

**Fields:**
- `name` (object): Brand name in English and Arabic
  - `en` (string): English name
  - `ar` (string): Arabic name
- `description` (object, optional): Brand description in English and Arabic
  - `en` (string): English description
  - `ar` (string): Arabic description
- `logo` (string): Brand logo URL (square/circular)
- `image` (string): Brand banner/hero image URL
- `createdAt` (string): ISO 8601 timestamp

**Example Document ID:** Use auto-generated IDs or custom IDs like "nike", "samsung", etc.

---

### Products Collection: `products`

Stores all products with detailed information.

**Document Structure:**
```json
{
  "name": {
    "en": "Wireless Headphones Pro",
    "ar": "سماعات لاسلكية برو"
  },
  "description": {
    "en": "Premium wireless headphones with active noise cancellation",
    "ar": "سماعات لاسلكية فاخرة مع إلغاء الضوضاء النشط"
  },
  "price": 199.99,
  "image": "https://images.unsplash.com/...",
  "images": [
    "https://images.unsplash.com/...",
    "https://images.unsplash.com/...",
    "https://images.unsplash.com/..."
  ],
  "categoryId": "electronics",
  "brandId": "brand-3",
  "brand": "AudioTech",
  "rating": 4.8,
  "reviews": 342,
  "inStock": true,
  "discount": 15,
  "featured": true,
  "createdAt": "2025-10-26T12:00:00Z"
}
```

**Fields:**
- `name` (object): Product name in English and Arabic
  - `en` (string): English name
  - `ar` (string): Arabic name
- `description` (object): Product description in English and Arabic
  - `en` (string): English description
  - `ar` (string): Arabic description
- `price` (number): Product price in USD
- `image` (string): Main product image URL
- `images` (array): Array of product image URLs
- `categoryId` (string): Reference to category document ID
- `brandId` (string, optional): Reference to brand document ID
- `brand` (string, optional): Product brand name (for display)
- `rating` (number): Product rating (0-5)
- `reviews` (number): Number of reviews
- `inStock` (boolean): Availability status
- `discount` (number, optional): Discount percentage (0-100)
- `featured` (boolean, optional): Featured product flag
- `createdAt` (string): ISO 8601 timestamp

**Indexes Required:**
- `categoryId` ASC, `createdAt` DESC
- `brandId` ASC, `createdAt` DESC
- `featured` ASC, `createdAt` DESC

---

### Addresses Collection: `addresses`

Stores user delivery addresses with location coordinates.

**Document Structure:**
```json
{
  "userId": "user-123",
  "fullName": "Ahmed Mohammed",
  "phoneNumber": "+966 50 123 4567",
  "address": "Building 12, Street 45, Al Olaya",
  "city": "Riyadh",
  "postalCode": "12345",
  "country": "Saudi Arabia",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "isDefault": true,
  "createdAt": "2025-10-26T12:00:00Z",
  "updatedAt": "2025-10-26T12:00:00Z"
}
```

**Fields:**
- `userId` (string): Reference to user ID
- `fullName` (string): Recipient full name
- `phoneNumber` (string): Contact phone number
- `address` (string): Street address
- `city` (string): City name
- `postalCode` (string, optional): Postal/ZIP code
- `country` (string): Country name
- `latitude` (number, optional): Location latitude coordinate
- `longitude` (number, optional): Location longitude coordinate
- `isDefault` (boolean): Whether this is the default address
- `createdAt` (string): ISO 8601 timestamp
- `updatedAt` (string): ISO 8601 timestamp

**Indexes Required:**
- `userId` ASC, `createdAt` DESC
- `userId` ASC, `isDefault` DESC

**Firebase Rules:**
- Users can only read/write their own addresses
- `userId` must match authenticated user

---

### Orders Collection: `orders`

Stores customer orders with delivery address (including coordinates).

**Document Structure:**
```json
{
  "orderNumber": "ORD-20251026-1234",
  "userId": "user-123",
  "items": [
    {
      "product": { /* Full product object */ },
      "quantity": 2,
      "price": 199.99
    }
  ],
  "total": 399.98,
  "address": {
    "fullName": "Ahmed Mohammed",
    "phoneNumber": "+966 50 123 4567",
    "address": "Building 12, Street 45, Al Olaya",
    "city": "Riyadh",
    "postalCode": "12345",
    "country": "Saudi Arabia",
    "latitude": 24.7136,
    "longitude": 46.6753
  },
  "paymentMethod": "cash",
  "paymentStatus": "pending",
  "status": "pending",
  "trackingNumber": "TRK123456",
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": "2025-10-26T12:00:00Z",
      "description": {
        "en": "Order placed",
        "ar": "تم تقديم الطلب"
      }
    }
  ],
  "createdAt": "2025-10-26T12:00:00Z",
  "updatedAt": "2025-10-26T12:00:00Z"
}
```

**Address Fields (nested in order):**
- `fullName` (string): Recipient name
- `phoneNumber` (string): Contact number
- `address` (string): Street address
- `city` (string): City name
- `postalCode` (string, optional): Postal code
- `country` (string, optional): Country name
- `latitude` (number, optional): Delivery location latitude
- `longitude` (number, optional): Delivery location longitude

**Note:** When creating an order from a saved address, the coordinates are included in the order for delivery tracking and route optimization.

---

## Usage Examples

### Fetching Categories

```typescript
import { useCategories } from '@/hooks/useFirestore';

function MyComponent() {
  const { categories, loading, error, refetch } = useCategories();
  
  // categories will automatically load from Firestore
  // Falls back to mock data if Firestore is not configured
}
```

### Fetching Banners

```typescript
import { useBanners } from '@/hooks/useFirestore';

function MyComponent() {
  const { banners, loading, error, refetch } = useBanners();
  
  // banners will automatically load from Firestore
  // Displays in carousel on home screen
}
```

### Fetching Brands

```typescript
import { useBrands } from '@/hooks/useFirestore';

function MyComponent() {
  const { brands, loading, error } = useBrands();
  
  // brands will automatically load from Firestore
  // Falls back to mock data if Firestore is not configured
}
```

### Fetching Products

```typescript
import { useProducts } from '@/hooks/useFirestore';

function MyComponent() {
  // Get all products
  const { products, loading, error } = useProducts();
  
  // Get products by category
  const { products: categoryProducts } = useProducts({ 
    categoryId: 'fashion' 
  });
  
  // Get products by brand
  const { products: brandProducts } = useProducts({ 
    brandId: 'nike' 
  });
  
  // Get featured products with limit
  const { products: featuredProducts } = useProducts({ 
    featured: true,
    limit: 10 
  });
}
```

### Fetching Single Product

```typescript
import { useProduct } from '@/hooks/useFirestore';

function ProductDetail({ productId }: { productId: string }) {
  const { product, loading, error } = useProduct(productId);
  
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  
  return <Text>{product?.name.en}</Text>;
}
```

### Searching Products

```typescript
import { searchProducts } from '@/hooks/useFirestore';

async function handleSearch(query: string) {
  const results = await searchProducts(query);
  console.log('Found products:', results);
}
```

---

## Setup Instructions

### 1. Firebase Configuration

The Firebase configuration is already set up in `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCqeIKe6itUxPXTLHCYxIaxnl-wsCmcIYY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=sab-store-9b947.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=sab-store-9b947
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=sab-store-9b947.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=263235150197
EXPO_PUBLIC_FIREBASE_APP_ID=1:263235150197:web:3519534187b75d9006b33c
```

### 2. Creating Firestore Collections

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `sab-store-9b947`
3. Navigate to Firestore Database
4. Create the `categories` collection with the 9 required categories
5. Create the `brands` collection and add brands
6. Create the `products` collection and add products (link products to brands using `brandId`)

### 3. Adding Sample Data

Use the Firebase Console or the Firebase Admin SDK to populate the collections with the required categories and products.

---

## Notes

- All hooks automatically fall back to mock data if Firebase is not configured or if collections are empty
- The app will work with mock data during development
- Images should be hosted on a CDN (like Unsplash or Firebase Storage)
- All prices are in USD; the app handles LBP conversion automatically
- The `order` field in categories determines the display order in the UI
- Products can be filtered by category, featured status, and limited by count

---

## Error Handling

All Firestore hooks include:
- **Loading state**: While fetching data
- **Error state**: If fetching fails
- **Automatic fallback**: Uses mock data when Firestore is unavailable
- **Refetch function**: Manually reload data when needed

Example:
```typescript
const { categories, loading, error, refetch } = useCategories();

if (error) {
  console.error('Failed to load categories:', error);
  // App continues to work with mock data
}
```
