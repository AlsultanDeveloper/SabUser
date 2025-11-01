# 🗺️ Google Maps API Setup Guide

## Step-by-Step Guide to Enable Google Maps

### 1. Go to Google Cloud Console
🔗 https://console.cloud.google.com/

### 2. Select or Create Project
- Select your project: `sab-store-9b947`
- Or create a new one if needed

### 3. Enable Maps JavaScript API
1. Go to **APIs & Services** → **Library**
2. Search for "Maps JavaScript API"
3. Click on it and press **ENABLE**

### 4. Enable Other Required APIs (Optional but Recommended)
- **Geocoding API** (for address lookup)
- **Places API** (for location search)
- **Directions API** (for routing)

### 5. Create/Check API Key
1. Go to **APIs & Services** → **Credentials**
2. Check if API key exists: `AIzaSyBfhc8WX28GqwQoFlU2tqqCSaB3sZeRNuw`
3. If not, create new API key:
   - Click **+ CREATE CREDENTIALS** → **API Key**
   - Copy the key

### 6. Configure API Key Restrictions (Important!)

#### Option A: No Restrictions (Development Only - Not Recommended for Production)
- Select **None** under API restrictions
- ⚠️ Use only for testing!

#### Option B: HTTP Referrers (Recommended for Production)
1. Select **HTTP referrers (web sites)**
2. Add these referrers:
   ```
   localhost:*
   127.0.0.1:*
   *.expo.dev/*
   *.vercel.app/*
   yourdomain.com/*
   ```

#### Option C: IP Addresses (For Server-Side)
- Not needed for client-side web app

### 7. Set API Restrictions
Under "API restrictions":
- Choose **Restrict key**
- Select:
  - Maps JavaScript API ✅
  - Geocoding API ✅
  - Places API (optional)

### 8. Enable Billing
🚨 **IMPORTANT:** Google Maps requires a billing account even for free tier!

1. Go to **Billing** → **Link a billing account**
2. Add credit card (won't charge unless you exceed free quota)
3. Free monthly quota:
   - Maps: 28,000+ loads
   - Geocoding: 40,000 requests
   - Places: 100,000 requests

**Don't worry!** You get $200 free credit per month. Very unlikely to exceed for small apps.

### 9. Set Budget Alerts (Recommended)
1. Go to **Billing** → **Budgets & alerts**
2. Create budget alert at $10, $50, $100
3. Get email notifications before charges

### 10. Update Your .env File
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBfhc8WX28GqwQoFlU2tqqCSaB3sZeRNuw
```

### 11. Restart Expo Server
```bash
npx expo start --clear
```

---

## 🔍 Troubleshooting

### Error: "This page can't load Google Maps correctly"
**Solutions:**
1. ✅ Check if Maps JavaScript API is enabled
2. ✅ Check if billing is enabled
3. ✅ Check API key restrictions
4. ✅ Try removing all restrictions temporarily
5. ✅ Wait 5-10 minutes after enabling APIs

### Error: "Google Maps API error: MissingKeyMapError"
- API key is not loaded correctly
- Check if key exists in .env file
- Restart Expo server

### Error: "ApiNotActivatedMapError"
- Maps JavaScript API is not enabled
- Go enable it in Cloud Console

### Error: "REQUEST_DENIED"
- Check API restrictions
- Make sure referrer matches
- Try disabling restrictions temporarily

### Blank/Gray Map
- Billing is not enabled
- API key has wrong restrictions
- Wait a few minutes after setup

---

## 💰 Pricing (Free Tier)

### Monthly Free Usage:
- **Maps loads:** 28,000 (Dynamic Maps)
- **Geocoding:** 40,000 requests
- **Places:** 100,000 requests (New users get $300 credit)

### After Free Tier:
- Maps: $7 per 1,000 loads
- Geocoding: $5 per 1,000 requests

**For most small apps:** You'll stay within free tier! 🎉

---

## 🧪 Testing

### Test in Browser Console:
```javascript
// Should return true
console.log('Google available:', typeof google !== 'undefined');
console.log('Maps available:', typeof google.maps !== 'undefined');
```

### Test API Key:
Open this URL in browser (replace YOUR_API_KEY):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=console.log
```

If working, you'll see a blank page with no errors.

---

## 📱 Current API Key

```
AIzaSyBfhc8WX28GqwQoFlU2tqqCSaB3sZeRNuw
```

**Status:** ⏳ Needs verification
- ✅ API Key created
- ⏳ Maps JavaScript API enabled?
- ⏳ Billing enabled?
- ⏳ Restrictions configured?

---

## 🔗 Useful Links

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Cloud Console](https://console.cloud.google.com/)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [Free Trial](https://cloud.google.com/free)

---

## ✅ Checklist

Before using Google Maps:
- [ ] Project created in Google Cloud
- [ ] Maps JavaScript API enabled
- [ ] Billing account linked (credit card added)
- [ ] API key created
- [ ] API key restrictions set (or disabled for testing)
- [ ] .env file updated
- [ ] Expo server restarted
- [ ] Tested in app

---

## 🎯 Quick Fix for Testing

If you want to test IMMEDIATELY without billing setup:

### Use OpenStreetMap Instead
Already implemented as fallback! Just comment out Google Maps and use Leaflet.

**Pros:**
- ✅ Free forever
- ✅ No API key needed
- ✅ No billing required
- ✅ Works immediately

**Cons:**
- ❌ Less detailed than Google Maps
- ❌ Fewer features (no Street View, etc.)

---

**Created:** November 1, 2025  
**Project:** SabUser E-Commerce  
**Developer:** AlsultanDeveloper
