# 📦 Smart Shipping System - Like Noon

## ✅ What Was Implemented

### **1. Dynamic Shipping Calculator**
- File: `utils/shippingCalculator.ts`
- Calculates shipping cost based on GPS distance from store
- Similar to Noon's dynamic pricing model

### **2. Distance-Based Pricing**

| Distance | Cost | Delivery Time |
|----------|------|---------------|
| 0-5 km | $2 | 1-2 days |
| 5-20 km | $5 | 2-3 days |
| 20-50 km | $8 | 3-4 days |
| 50-100 km | $10 | 4-5 days |
| 100+ km | $15 | 5-7 days |

### **3. Free Shipping**
- Orders over $100 get FREE shipping (regardless of distance)
- Progress bar shows how much more to add for free shipping

### **4. Location Features**
- ✅ Automatic GPS detection
- ✅ Real-time distance calculation using Haversine formula
- ✅ Fallback to default shipping ($5) if no location permission

## 📱 How It Works

### **User Experience**
1. User adds items to cart
2. Opens checkout page
3. App requests location permission
4. System calculates distance from store
5. Shows exact shipping cost and delivery time
6. Updates automatically if cart total changes

### **Example Scenarios**

**Scenario 1: Nearby Customer (3 km)**
- Location: 3 km from store
- Cart Total: $50
- Shipping: **$2** (1-2 days)
- Total: $52

**Scenario 2: Far Customer (80 km)**
- Location: 80 km from store
- Cart Total: $50
- Shipping: **$10** (4-5 days)
- Total: $60

**Scenario 3: Big Order (Any Distance)**
- Location: Any distance
- Cart Total: $120 (over $100)
- Shipping: **FREE** ✅
- Total: $120

## 🔧 Configuration

### **Change Store Location**
Edit `utils/shippingCalculator.ts`:
```typescript
const STORE_LOCATION = {
  latitude: 34.4333,  // Your store latitude
  longitude: 35.8333, // Your store longitude
};
```

### **Adjust Pricing Tiers**
Edit the `calculateShipping()` function in `utils/shippingCalculator.ts`

### **Change Free Shipping Threshold**
Edit `app/checkout.tsx`:
```typescript
const FREE_SHIPPING_THRESHOLD = 100; // Change to your desired amount
```

## 📊 Technical Details

### **Distance Calculation**
Uses Haversine formula to calculate great-circle distance between two points on Earth:
- Accurate to within 0.5%
- Works globally
- Accounts for Earth's curvature

### **Location Permissions**
- Requests `expo-location` foreground permissions
- Works on both iOS and Android
- Handles permission denial gracefully

### **Performance**
- Location calculated once on checkout page load
- Recalculates if cart total changes (for free shipping eligibility)
- Cached until page reload

## 🎯 Benefits

### **For Customers**
- ✅ Fair pricing based on actual distance
- ✅ Know exact shipping cost before ordering
- ✅ See delivery time estimates
- ✅ Incentive for larger orders (free shipping)

### **For Business**
- ✅ Profitable shipping model
- ✅ Covers actual delivery costs
- ✅ Encourages higher order values
- ✅ Transparent pricing builds trust

## 🚀 Future Enhancements

1. **Multiple Store Locations**
   - Calculate from nearest store
   - Optimize delivery routes

2. **Express Shipping**
   - 1-day delivery at premium price
   - Same-day delivery for nearby customers

3. **Time-Based Pricing**
   - Higher rates during peak hours
   - Discounts for off-peak delivery

4. **Zone-Based Pricing**
   - Different rates for different cities
   - Special rates for remote areas

5. **Carrier Integration**
   - Real-time rates from DHL, Aramex, etc.
   - Track shipments

## 📝 Notes

- Default shipping ($5) used when location unavailable
- Free shipping always applies over $100
- Distance shown to 1 decimal place (e.g., 12.3 km)
- Works in both Arabic and English

## 🔗 Related Files

- `app/checkout.tsx` - Main checkout screen
- `utils/shippingCalculator.ts` - Shipping calculation logic
- `app/checkout-details.tsx` - Address selection page

---

**Built with ❤️ - Smart Shipping for Modern E-commerce**
