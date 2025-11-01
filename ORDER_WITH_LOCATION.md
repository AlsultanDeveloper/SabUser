# 📍 Order with Location Integration

## Overview
This document explains how delivery location (coordinates) are integrated with orders in the SabUser app.

---

## 🎯 Features

### 1. **Location Picker (MapPicker Component)**
- Interactive map using WebView + Leaflet.js
- No native build required (works on Expo Go)
- OpenStreetMap (free, no API key needed)
- User can:
  - Move map to select location
  - Use "Current Location" button (GPS)
  - See live coordinates while selecting
  - Confirm selected location

### 2. **Order with Coordinates**
When a customer places an order, the delivery location is saved with:
- **Address fields**: Full name, phone, street address, city, postal code
- **Coordinates**: `latitude` and `longitude` (optional but recommended)
- **Reverse geocoding**: Converts coordinates to address automatically

---

## 📦 Order Structure in Firebase

### Firestore Collection: `orders`

```json
{
  "orderNumber": "ORD-1730486400-1234",
  "userId": "user-123",
  "items": [...],
  "total": 399.98,
  "address": {
    "fullName": "Ahmed Mohammed",
    "phoneNumber": "+966 50 123 4567",
    "address": "Building 12, Street 45, Al Olaya",
    "city": "Riyadh",
    "postalCode": "12345",
    "country": "Saudi Arabia",
    "latitude": 24.7136,    // 📍 Delivery coordinates
    "longitude": 46.6753    // 📍 Delivery coordinates
  },
  "paymentMethod": "cash",
  "status": "pending",
  "createdAt": "2025-11-01T12:00:00Z"
}
```

---

## 🔄 Flow

### User Journey:
1. **Add items to cart** 🛒
2. **Go to checkout** 💳
3. **Fill delivery info**:
   - Full Name
   - Phone Number
   - Address (street)
   - City
   - Postal Code (optional)
4. **Pick location on map** 🗺️:
   - Click "Pick on Map" button
   - MapPicker modal opens
   - Move map or use "Current Location"
   - Click "Confirm Location"
   - Coordinates saved automatically
5. **Choose payment method** 💰:
   - Cash on Delivery
   - Credit/Debit Card (OMT)
6. **Place Order** ✅
   - Order saved to Firebase with coordinates
   - Cart cleared
   - Confirmation notification sent

---

## 💻 Code Implementation

### 1. MapPicker Component
Location: `components/MapPicker.tsx`

```typescript
<MapPicker
  visible={showMapPicker}
  onClose={() => setShowMapPicker(false)}
  onLocationSelected={handleLocationSelected}
  initialLocation={latitude && longitude ? { latitude, longitude } : undefined}
/>
```

**Features:**
- WebView-based (no native dependencies)
- Leaflet.js for interactive map
- Reverse geocoding with expo-location
- Returns: `{ latitude, longitude, address? }`

### 2. Checkout Details
Location: `app/checkout-details.tsx`

```typescript
const handleLocationSelected = async (location: {
  latitude: number;
  longitude: number;
  address?: string;
}) => {
  setLatitude(location.latitude);
  setLongitude(location.longitude);
  
  if (location.address) {
    setAddress(location.address);
  }
  
  // Reverse geocode for more details
  const addresses = await Location.reverseGeocodeAsync({
    latitude: location.latitude,
    longitude: location.longitude,
  });
  
  if (addresses.length > 0) {
    const addr = addresses[0];
    setCity(addr.city || addr.region || '');
    setPostalCode(addr.postalCode || '');
  }
};
```

### 3. Create Order with Location
```typescript
const handlePlaceOrder = async () => {
  // Validate fields...
  
  // Prepare address with coordinates
  const orderAddress = {
    fullName,
    phoneNumber: phone,
    address,
    city,
    postalCode: postalCode || '',
    country: 'Saudi Arabia',
    ...(latitude && longitude && {
      latitude,  // 📍 Included if selected
      longitude, // 📍 Included if selected
    }),
  };
  
  // Create order in Firebase
  await createOrder(
    user.uid,
    orderItems,
    finalTotal,
    orderAddress,
    paymentMethod
  );
  
  // Success!
};
```

---

## 🚀 Benefits of Including Coordinates

### For Delivery Drivers:
- ✅ **Accurate location** - GPS coordinates for exact delivery spot
- ✅ **Navigation** - Open in Google Maps/Waze directly
- ✅ **Route optimization** - Calculate best delivery routes
- ✅ **Proof of delivery** - Verify driver arrived at correct location

### For Customers:
- ✅ **Precise delivery** - No confusion with similar addresses
- ✅ **Flexible locations** - Deliver to park, mall, office, etc.
- ✅ **Real-time tracking** - Track driver on map (future feature)

### For Admin:
- ✅ **Delivery analytics** - Heatmap of popular delivery areas
- ✅ **Zone management** - Define delivery zones based on coordinates
- ✅ **Shipping costs** - Calculate dynamic shipping based on distance

---

## 🗺️ Location Modes

### 1. Manual Entry (Traditional)
User types address manually:
- ✅ Quick for known addresses
- ❌ May be imprecise
- ❌ No coordinates saved

### 2. Current Location (GPS)
User clicks "Use Current Location":
- ✅ Very accurate
- ✅ Coordinates automatically included
- ✅ Address auto-filled via reverse geocoding
- ❌ Requires location permission

### 3. Pick on Map (Recommended!)
User selects location on interactive map:
- ✅ Most flexible
- ✅ Can choose any location (home, office, friend's house)
- ✅ Visual confirmation
- ✅ Coordinates always included
- ✅ Address auto-filled

---

## 📊 Firebase Queries with Location

### Find orders near a location:
```typescript
// Future feature: GeoFirestore
const nearbyOrders = await db.collection('orders')
  .where('address.latitude', '>', minLat)
  .where('address.latitude', '<', maxLat)
  .get();
```

### Calculate delivery distance:
```typescript
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const distance = getDistance(
  storeLatitude, storeLongitude,
  order.address.latitude, order.address.longitude
);
console.log(`Delivery distance: ${distance.toFixed(2)} km`);
```

---

## 🔐 Security & Privacy

### Firebase Rules:
```javascript
// Only user can see their own order coordinates
match /orders/{orderId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if request.auth.uid == request.resource.data.userId;
}
```

### Privacy Considerations:
- ⚠️ Coordinates are sensitive data
- ✅ Only accessible by user and admin
- ✅ Not shared with other customers
- ✅ Used only for delivery purposes
- ✅ Can be optional (user choice)

---

## 🛠️ Testing

### Test Locations (Saudi Arabia):
```typescript
// Riyadh City Center
{ latitude: 24.7136, longitude: 46.6753 }

// Jeddah Corniche
{ latitude: 21.5432, longitude: 39.1728 }

// Dammam
{ latitude: 26.4207, longitude: 50.0888 }
```

### Test Scenarios:
1. ✅ Order with manual address (no coordinates)
2. ✅ Order with current location (GPS coordinates)
3. ✅ Order with map-selected location
4. ✅ Order without location permission
5. ✅ Multiple orders to same location
6. ✅ Orders to different cities

---

## 📱 Screenshots

### Checkout Screen:
- [x] Full name field
- [x] Phone number field
- [x] Address field (text input)
- [x] City field
- [x] Postal code field
- [x] "Use Current Location" button (GPS icon)
- [x] "Pick on Map" button (Map icon)
- [x] Coordinates display (when selected)

### MapPicker Modal:
- [x] Interactive map (OpenStreetMap)
- [x] Fixed center pin (package icon)
- [x] Current location button
- [x] Coordinates display at bottom
- [x] "Confirm Location" button

---

## 🎉 Summary

### What's Implemented:
✅ MapPicker component with WebView  
✅ Location selection on interactive map  
✅ Current location (GPS) support  
✅ Reverse geocoding (coordinates → address)  
✅ Order creation with coordinates  
✅ Firebase integration  
✅ No native build required  
✅ Works on Expo Go  

### Future Enhancements:
🔮 Real-time delivery tracking  
🔮 Driver location on map  
🔮 Delivery zone boundaries  
🔮 Dynamic shipping costs by distance  
🔮 Heatmap of popular areas  
🔮 Route optimization for drivers  

---

## 📞 Support

**Developer:** AlsultanDeveloper  
**Project:** SabUser E-Commerce App  
**Date:** November 1, 2025  
**Version:** 1.0.15

---

**Made with ❤️ in Lebanon 🇱🇧**
