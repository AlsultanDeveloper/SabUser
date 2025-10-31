
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, isConfigured } from '@/constants/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import type { SignUpData, User as AppUser } from '@/types';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  loading: boolean;
  phoneVerificationId: string | null;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    phoneVerificationId: null,
  });

  // ---- OAuth Client IDs from ENV (with fallback to Constants) ----
  const GOOGLE_ANDROID_CLIENT_ID = useMemo(
    () => 
      Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
      '',
    []
  );
  const GOOGLE_IOS_CLIENT_ID = useMemo(
    () => 
      Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
      '',
    []
  );
  const GOOGLE_WEB_CLIENT_ID = useMemo(
    () => 
      Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
      '',
    []
  );

  // ---- Debug: Log Client IDs on mount ----
  useEffect(() => {
    console.log('🔐 Google Auth Configuration:');
    console.log('  Platform:', Platform.OS);
    console.log('  Android Client ID:', GOOGLE_ANDROID_CLIENT_ID ? '✓ Loaded' : '✗ Missing');
    console.log('  iOS Client ID:', GOOGLE_IOS_CLIENT_ID ? '✓ Loaded' : '✗ Missing');
    console.log('  Web Client ID:', GOOGLE_WEB_CLIENT_ID ? '✓ Loaded' : '✗ Missing');
    console.log('  Redirect URI:', AuthSession.makeRedirectUri({ scheme: 'sabstore' }));
  }, [GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID]);

  // ---- Google OAuth Config ----
  const googleConfig = useMemo(
    () => ({
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      responseType: 'id_token',
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'sabstore' }),
    }),
    [GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID]
  );

  const [googleRequest, , googlePromptAsync] = Google.useAuthRequest(googleConfig);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, user => {
      setState(prev => ({ ...prev, user, loading: false }));
      console.log('Auth state changed:', user?.uid);
    });
    return () => unsubscribe();
  }, []);

  // ---- Email/Password Sign-In ----
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      if (!isConfigured || !auth) {
        return { success: false, error: 'Firebase is not configured.' };
      }
      const result = await signInWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      const userDocRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          email: result.user.email,
          fullName: result.user.displayName || '',
          signInMethod: 'email',
          createdAt: new Date().toISOString(),
        });
      }
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Email sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const signUpWithEmail = useCallback(async (
    email: string, 
    password: string,
    additionalData?: SignUpData
  ) => {
    try {
      if (!isConfigured || !auth) {
        return { success: false, error: 'Firebase is not configured.' };
      }
      
      console.log('📝 Creating new user account...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // بناء الاسم الكامل
      const fullName = additionalData 
        ? `${additionalData.firstName} ${additionalData.lastName}`
        : '';
      
      // تحديث الـ displayName في Firebase Auth
      if (fullName) {
        console.log('✏️ Updating profile display name...');
        await updateProfile(result.user, {
          displayName: fullName,
        });
      }
      
      console.log('💾 Saving user data to Firestore...');
      const db = getFirestore();
      const userDocRef = doc(db, 'users', result.user.uid);
      
      // بناء بيانات المستخدم الكاملة
      const userData: AppUser = {
        // معلومات أساسية
        uid: result.user.uid,
        email: result.user.email!,
        emailVerified: result.user.emailVerified,
        
        // الاسم
        fullName: fullName,
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        displayName: fullName || undefined,
        
        // الصورة
        photoURL: result.user.photoURL || undefined,
        
        // المصادقة
        signInMethod: 'email',
        
        // الاتصال
        phoneNumber: additionalData?.phoneNumber,
        phoneVerified: false,
        
        // التفضيلات
        preferences: {
          language: additionalData?.language || 'en',
          currency: 'USD',
          notifications: {
            push: true,
            email: true,
            sms: false,
            orders: true,
            promotions: true,
          },
          theme: 'auto',
        },
        
        // الإحصائيات
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          wishlistCount: 0,
          loyaltyPoints: 0,
          membershipLevel: 'bronze',
        },
        
        // الحالة
        status: {
          isActive: true,
          isVerified: false,
          isBlocked: false,
          twoFactorEnabled: false,
        },
        
        // التواريخ
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        
        // Metadata
        metadata: {
          registrationSource: Platform.OS as any,
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version.toString(),
          },
        },
      };
      
      await setDoc(userDocRef, userData);
      
      console.log('✅ User document created successfully with complete data');
      console.log('👤 User:', {
        name: fullName,
        email: result.user.email,
        phone: additionalData?.phoneNumber || 'Not provided',
      });
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Email sign up error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ---- Google Sign-In ----
  const signInWithGoogle = useCallback(async () => {
    try {
      if (!isConfigured || !auth) {
        console.error('❌ Firebase not configured');
        return { success: false, error: 'Firebase is not configured.' };
      }

      // Validate Client IDs
      console.log('🔍 Validating Google Client IDs...');
      if (!GOOGLE_WEB_CLIENT_ID) {
        console.error('❌ Missing GOOGLE_WEB_CLIENT_ID');
        return { 
          success: false, 
          error: 'Google configuration is incomplete. Missing Web Client ID. Please contact support.' 
        };
      }
      
      if (Platform.OS === 'android' && !GOOGLE_ANDROID_CLIENT_ID) {
        console.error('❌ Missing GOOGLE_ANDROID_CLIENT_ID');
        return { 
          success: false, 
          error: 'Google configuration is incomplete for Android. Please contact support.' 
        };
      }
      
      if (Platform.OS === 'ios' && !GOOGLE_IOS_CLIENT_ID) {
        console.error('❌ Missing GOOGLE_IOS_CLIENT_ID');
        return { 
          success: false, 
          error: 'Google configuration is incomplete for iOS. Please contact support.' 
        };
      }

      console.log('✅ All required Client IDs present');
      console.log('🔄 Starting Google sign-in flow...');
      console.log('📱 Platform:', Platform.OS);
      console.log('🔗 Redirect URI:', AuthSession.makeRedirectUri({ scheme: 'sabstore' }));
      
      const res = await googlePromptAsync();
      console.log('📨 Response type:', res.type);

      if (res.type === 'cancel' || res.type === 'dismiss') {
        console.log('ℹ️ User cancelled sign-in');
        return { success: false, cancelled: true };
      }
      
      if (res.type === 'error') {
        console.error('❌ Google auth error:', (res as any).error);
        return { 
          success: false, 
          error: (res as any).error?.message || 'Google authentication failed' 
        };
      }
      
      if (res.type !== 'success') {
        console.error('❌ Unexpected response type:', res.type);
        return { 
          success: false, 
          error: `Google sign-in returned unexpected result: ${res.type}` 
        };
      }

      // Extract idToken
      const idToken = (res.params as any)?.id_token || (res as any).authentication?.idToken;
      console.log('🔑 idToken received:', idToken ? '✓' : '✗');
      
      if (!idToken) {
        console.error('❌ No idToken in response');
        console.error('Response params:', JSON.stringify(res.params, null, 2));
        return { 
          success: false, 
          error: 'No authentication token received from Google. Please try again.' 
        };
      }

      console.log('✅ Received idToken, signing in to Firebase...');
      const credential = GoogleAuthProvider.credential(idToken, null);
      const result = await signInWithCredential(auth, credential);
      console.log('✅ Firebase sign-in successful:', result.user.uid);

      // Save user to Firestore
      const db = getFirestore();
      const userDocRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) {
        console.log('📝 Creating new user document...');
        await setDoc(userDocRef, {
          email: result.user.email,
          fullName: result.user.displayName || '',
          signInMethod: 'google',
          createdAt: new Date().toISOString(),
        });
        console.log('✅ User document created');
      } else {
        console.log('ℹ️ User document already exists');
      }

      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Google sign in exception:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let userFriendlyError = error.message;
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        userFriendlyError = 'An account already exists with the same email. Try signing in with a different method.';
      } else if (error.message?.includes('network')) {
        userFriendlyError = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        userFriendlyError = 'Unauthorized domain. Please add your domain to Firebase Console -> Authentication -> Settings -> Authorized domains.';
      } else if (error.code === 'auth/invalid-credential') {
        userFriendlyError = 'Invalid Google credentials. Please try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('ℹ️ User closed popup');
        return { success: false, cancelled: true };
      }
      
      return { success: false, error: userFriendlyError };
    }
  }, [GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID, googlePromptAsync]);

  // ---- Apple Sign-In ----
  const signInWithApple = useCallback(async () => {
    try {
      if (!isConfigured || !auth) {
        return { success: false, error: 'Firebase is not configured.' };
      }
      if (Platform.OS === 'ios') {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        const { identityToken } = credential;
        if (identityToken) {
          const provider = new OAuthProvider('apple.com');
          const firebaseCredential = provider.credential({ idToken: identityToken });
          const result = await signInWithCredential(auth, firebaseCredential);
          return { success: true, user: result.user };
        }
        return { success: false, error: 'No identity token' };
      } else if (Platform.OS === 'web') {
        const provider = new OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        const result = await signInWithPopup(auth, provider);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: 'Apple sign-in not available on Android' };
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ---- Sign Out ----
  const signOut = useCallback(async () => {
    try {
      if (!isConfigured || !auth) {
        return { success: false, error: 'Firebase is not configured.' };
      }
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      isAuthenticated: !!state.user,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      signOut,
      googleRequestReady: !!googleRequest,
    }),
    [state.user, state.loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signOut, googleRequest]
  );
});
