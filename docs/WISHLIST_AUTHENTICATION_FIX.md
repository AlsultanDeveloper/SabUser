# Wishlist Authentication Fix

**Date:** November 9, 2025  
**Issue:** Permission denied errors when accessing wishlist functionality

## Problem

Users were experiencing Firebase permission errors when trying to add/remove items from their wishlist:

```
ERROR  Error toggling wishlist: [Error: You must be logged in to perform this action]
WARN  ⚠️ Permission denied accessing wishlists, returning empty array
WARN  ⚠️ Permission denied creating document in wishlists
```

## Root Cause

The app's user context (`useAuth`) had user data, but Firebase Auth's `currentUser` was not properly synchronized. This caused Firestore security rules to reject the operations because the user wasn't properly authenticated with Firebase Auth.

## Solution

### 1. Enhanced Authentication Checks in `search.tsx`

Updated `handleWishlist` function to:
- Check if user exists in app context
- Verify Firebase Auth `currentUser` is set
- Show appropriate error messages for authentication issues
- Handle permission errors gracefully with user-friendly alerts

**Key Changes:**
```typescript
// Verify Firebase Auth token is valid
const currentUser = auth?.currentUser;

if (!currentUser) {
  Alert.alert(
    language === 'ar' ? 'خطأ في المصادقة' : 'Authentication Error',
    language === 'ar' ? 'يرجى إعادة تسجيل الدخول' : 'Please log in again'
  );
  return;
}
```

### 2. Improved Error Handling in `constants/firestore.ts`

Enhanced `createDocument` and `deleteDocument` functions to:
- Pre-check authentication before attempting operations on protected collections
- Provide clearer error messages
- Prevent unnecessary Firestore calls for unauthenticated users

**Protected Collections:**
- `wishlists`
- `orders`
- `addresses`
- `reviews`
- `userNotifications`

**Authentication Check:**
```typescript
const authRequiredCollections = ['wishlists', 'orders', 'addresses', 'reviews', 'userNotifications'];
if (authRequiredCollections.includes(collectionName)) {
  const { auth } = await import('./firebase');
  const currentUser = auth?.currentUser;
  
  if (!currentUser) {
    throw new Error('You must be logged in to perform this action');
  }
}
```

### 3. User-Friendly Error Messages

All wishlist operations now show localized alerts:
- **Arabic:** "يرجى تسجيل الدخول لإضافة المنتجات إلى قائمة الأمنيات"
- **English:** "Please log in to add products to your wishlist"

## Files Modified

1. `app/search.tsx` - Enhanced wishlist toggle with auth verification
2. `constants/firestore.ts` - Added pre-flight auth checks for protected collections

## Files Already Properly Handled

These files already had good error handling:
- `app/(tabs)/home.tsx` - Already includes Firebase Auth verification
- `app/(tabs)/wishlist.tsx` - Already handles permission errors gracefully
- `app/wishlist.tsx` - Already handles permission errors gracefully

## Testing

To verify the fix:

1. **Logged Out User:** Try adding items to wishlist → Should see login prompt
2. **Logged In User:** Add/remove items → Should work without errors
3. **Session Expired:** Try wishlist operations → Should prompt for re-login

## Security

Firestore rules remain unchanged and secure:
- Users can only read/write their own wishlist items
- Authentication is required for all wishlist operations
- The security rules are defined in `firestore.rules`:

```javascript
match /wishlists/{wishlistItemId} {
  allow read, delete: if request.auth != null && 
    (resource.data.userId == request.auth.uid || isUserAdmin());
  allow create: if request.auth != null && 
    request.resource.data.userId == request.auth.uid;
  allow update: if request.auth != null && 
    (resource.data.userId == request.auth.uid || isUserAdmin());
}
```

## Benefits

1. ✅ Prevents app crashes from permission errors
2. ✅ Clear user feedback when authentication is required
3. ✅ Better user experience with localized messages
4. ✅ Reduced unnecessary Firestore requests
5. ✅ Consistent error handling across the app

## Related Issues

If users still see authentication errors:
1. Check if Firebase Auth is properly initialized
2. Verify Google/Apple Sign-In is working correctly
3. Check Firebase Auth token expiration
4. Review `contexts/AuthContext.tsx` for auth state sync issues
