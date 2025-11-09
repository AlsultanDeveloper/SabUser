# 🎨 How to Add Payment Logos

## Step 1: Prepare Your Logos

Make sure you have these image files ready:

### 1. OMT Logo (`omt-logo.png`)
- **Size**: 200x200px to 400x400px
- **Format**: PNG with transparent background
- **Colors**: Orange theme (#FF6B00)
- **Where to get**: 
  - Contact OMT at https://omt.com.lb for official logo
  - Or use your existing OMT partnership logo

### 2. Whish Money Logo (`whish-logo.png`)
- **Size**: 200x200px to 400x400px
- **Format**: PNG with transparent background
- **Colors**: Purple/Blue theme (#6366F1)
- **Where to get**:
  - Contact Whish Money at https://www.whish.money for official logo
  - Or use your existing Whish partnership logo

### 3. Card Logo (`card-logo.png`) - Optional
- **Size**: 200x200px to 400x400px
- **Format**: PNG with transparent background
- Generic credit card icon or Visa/Mastercard logo

---

## Step 2: Add Logos to Project

### Option A: Using File Explorer (Easiest)
1. Open File Explorer
2. Navigate to: `C:\Users\adamd\Project\SabUser\assets\images\payment\`
3. Copy your logo files into this folder
4. Make sure filenames match exactly:
   - `omt-logo.png`
   - `whish-logo.png`
   - `card-logo.png` (optional)

### Option B: Using VS Code
1. In VS Code, go to Explorer sidebar
2. Navigate to: `assets/images/payment/`
3. Right-click → "Reveal in File Explorer"
4. Paste your logo files there

---

## Step 3: Verify Setup

After adding logos, they will automatically appear in:

✅ **OMT Payment Page** (`app/payment/omt.tsx`)
   - The OMT logo will replace the "OMT" text badge
   - Located at the top of the payment form

✅ **Whish Money Payment Page** (`app/payment/whish.tsx`)
   - The Whish logo will replace the "W$" text badge
   - Located at the top of the payment form

✅ **Checkout Page** (`app/checkout-details.tsx`)
   - Logos appear next to each payment method option

---

## Step 4: Test

1. Reload your app: Press `r` in Expo terminal
2. Go to: Cart → Checkout
3. Select "OMT Money Transfer" - you should see the logo
4. Select "Whish Money" - you should see the logo
5. Click payment buttons to see logos on payment pages

---

## 🚨 Troubleshooting

### Logo not showing?
- Check filename is exactly `omt-logo.png` or `whish-logo.png` (lowercase)
- Make sure file is in correct folder: `assets/images/payment/`
- Image format must be PNG
- Try reloading app with `r` command
- Check image size (should be < 500KB)

### Logo looks blurry?
- Use higher resolution image (400x400px recommended)
- Make sure it's PNG format, not JPG

### Fallback behavior
- If logo file is missing or fails to load
- App will show styled text badges instead:
  - "OMT" in orange circle for OMT
  - "W$" in purple circle for Whish Money
- This ensures app always looks good even without logo files

---

## 📝 Image Requirements Summary

| Logo | Filename | Size | Format | Notes |
|------|----------|------|--------|-------|
| OMT | `omt-logo.png` | 200-400px | PNG | Transparent background |
| Whish | `whish-logo.png` | 200-400px | PNG | Transparent background |
| Card | `card-logo.png` | 200-400px | PNG | Optional |

---

## 🎯 Quick Checklist

- [ ] Got logo files from OMT
- [ ] Got logo files from Whish Money
- [ ] Renamed files to exact names
- [ ] Placed files in `assets/images/payment/` folder
- [ ] Reloaded app with `r`
- [ ] Tested all payment pages
- [ ] Logos displaying correctly

---

## 💼 Getting Official Logos

### For OMT:
1. Visit: https://omt.com.lb
2. Contact their merchant services
3. Request: "Brand assets for merchant integration"
4. Mention you're integrating their payment service

### For Whish Money:
1. Visit: https://www.whish.money
2. Contact their business team
3. Request: "Brand guidelines and logo for integration"
4. Mention your app integration

Both companies typically provide official logo packages for partners! 🎉

---

Need help? The logos will work automatically once files are in place! 🚀
