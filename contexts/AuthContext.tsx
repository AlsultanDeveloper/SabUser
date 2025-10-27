// AuthContext.tsx - dummy content
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, isConfigured } from '@/constants/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

// ✅ Google via AuthSession (Native)
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

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

  // ---- OAuth Client IDs from ENV (Expo public vars) ----
  const GOOGLE_ANDROID_CLIENT_ID = useMemo(() => process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '263235150197-iji8u3ssn8q3fpu3p12e3haeqot3dc0g.apps.googleusercontent.com', []);
  const GOOGLE_IOS_CLIENT_ID = useMemo(() => process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '263235150197-uearggvrhr7u97uh9likv6hsbs73muqu.apps.googleusercontent.com', []);
  const GOOGLE_WEB_CLIENT_ID = useMemo(() => process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj.apps.googleusercontent.com', []);

  const googleConfig = useMemo(() => ({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  }), [GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID]);

  const [googleRequest, , googlePromptAsync] = Google.useAuthRequest(googleConfig);

  console.log('🔗 Platform:', Platform.OS);
  console.log('🔗 Google Request Ready:', !!googleRequest);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(prev => ({ ...prev, user, loading: false }));
      console.log('Auth state changed:', user?.uid);
    });
    return () => unsubscribe();
  }, []);

  // ---------- Email/Password ----------
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      if (!isConfigured || !auth) {
        return {
          success: false,
          error: 'Firebase is not configured. Please add your Firebase credentials to .env file.'
        };
      }
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Email sign in error:', error);
      let userFriendlyError = error.message;
      if (error.code === 'auth/user-not-found') userFriendlyError = 'No user found with this email address.';
      else if (error.code === 'auth/wrong-password') userFriendlyError = 'Incorrect password. Please try again.';
      else if (error.code === 'auth/invalid-email') userFriendlyError = 'Invalid email address format.';
      else if (error.code === 'auth/user-disabled') userFriendlyError = 'This account has been disabled.';
      else if (error.code === 'auth/too-many-requests') userFriendlyError = 'Too many failed attempts. Please try again later.';
      else if (error.code === 'auth/invalid-credential') userFriendlyError = 'Invalid email or password. Please check your credentials.';
      return { success: false, error: userFriendlyError };
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      if (!isConfigured || !auth) {
        return {
          success: false,
          error: 'Firebase is not configured. Please add your Firebase credentials to .env file.'
        };
      }
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Email sign up error:', error);
      let userFriendlyError = error.message;
      if (error.code === 'auth/email-already-in-use') userFriendlyError = 'An account with this email already exists. Please sign in instead.';
      else if (error.code === 'auth/invalid-email') userFriendlyError = 'Invalid email address format.';
      else if (error.code === 'auth/weak-password') userFriendlyError = 'Password is too weak. Please use at least 6 characters.';
      else if (error.code === 'auth/operation-not-allowed') userFriendlyError = 'Email/Password sign-in is not enabled. Please contact support.';
      return { success: false, error: userFriendlyError };
    }
  }, []);

  // ---------- Google Sign-In ----------
  const signInWithGoogle = useCallback(async () => {
    try {
      if (!isConfigured || !auth) {
        return {
          success: false,
          error: 'Firebase is not configured. Please add your Firebase credentials to .env file.'
        };
      }

      // استخدام expo-auth-session لجميع المنصات (iOS, Android, Web)
      if (!GOOGLE_WEB_CLIENT_ID) {
        return { success: false, error: 'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID' };
      }
      
      if (!GOOGLE_ANDROID_CLIENT_ID && Platform.OS === 'android') {
        return { success: false, error: 'Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID' };
      }
      
      if (!GOOGLE_IOS_CLIENT_ID && Platform.OS === 'ios') {
        return { success: false, error: 'Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID' };
      }

      console.log('🔄 Starting Google sign-in flow...');
      const res = await googlePromptAsync();
      
      console.log('📱 Google auth response:', JSON.stringify(res, null, 2));
      console.log('📱 Google auth response type:', res?.type);
      
      if (res.type === 'cancel' || res.type === 'dismiss') {
        console.log('ℹ️ User cancelled Google sign-in');
        return { success: false, cancelled: true };
      }
      
      if (res.type === 'error') {
        console.error('❌ Google sign-in error:', JSON.stringify(res, null, 2));
        const errorMsg = (res as any).error?.message || (res as any).errorCode || 'Google authentication failed';
        return { success: false, error: errorMsg };
      }
      
      if (res.type !== 'success') {
        console.error('❌ Google sign-in failed:', JSON.stringify(res, null, 2));
        return { success: false, error: `Google sign-in returned: ${res.type}` };
      }

      // استخراج idToken من النتيجة
      const idToken =
        (res.params as any)?.id_token ||
        (res as any).authentication?.idToken;

      if (!idToken) {
        console.error('❌ No idToken received from Google');
        return { success: false, error: 'No idToken received from Google' };
      }

      console.log('✅ Received idToken, signing in to Firebase...');
      const credential = GoogleAuthProvider.credential(idToken, null);
      const result = await signInWithCredential(auth, credential);
      console.log('✅ Successfully signed in to Firebase:', result.user.uid);
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let userFriendlyError = error.message;
      if (error.code === 'auth/account-exists-with-different-credential') {
        userFriendlyError = 'An account already exists with the same email. Try signing in with a different method.';
      } else if (error.message?.includes('network')) {
        userFriendlyError = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        userFriendlyError = 'Unauthorized domain. Please add your domain to Firebase Console -> Authentication -> Settings -> Authorized domains.';
      } else if (error.code === 'auth/invalid-credential') {
        userFriendlyError = 'Invalid Google credentials. Please try again.';
      }
      return { success: false, error: userFriendlyError };
    }
  }, [GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID, googlePromptAsync]);

  // ---------- Apple Sign-In ----------
  const signInWithApple = useCallback(async () => {
    try {
      if (!isConfigured || !auth) {
        return {
          success: false,
          error: 'Firebase is not configured. Please add your Firebase credentials to .env file.'
        };
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
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { success: false, error: 'Apple sign-in cancelled' };
      }
      return { success: false, error: error.message };
    }
  }, []);

  // ---------- Phone (Placeholder) ----------
  const sendPhoneVerification = useCallback(async (phoneNumber: string) => {
    try {
      console.log('Sending phone verification to:', phoneNumber);
      return {
        success: false,
        error:
          'Phone authentication requires Firebase Auth with React Native package. Please use email/Google/Apple authentication instead.',
      };
    } catch (error: any) {
      console.error('Phone verification error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const verifyPhoneCode = useCallback(async (code: string) => {
    try {
      if (!isConfigured || !auth) {
        return {
          success: false,
          error: 'Firebase is not configured. Please add your Firebase credentials to .env file.'
        };
      }
      if (!state.phoneVerificationId) {
        return { success: false, error: 'No verification ID found' };
      }
      const credential = PhoneAuthProvider.credential(state.phoneVerificationId, code);
      const result = await signInWithCredential(auth, credential);
      setState(prev => ({ ...prev, phoneVerificationId: null }));
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Phone verification error:', error);
      return { success: false, error: error.message };
    }
  }, [state.phoneVerificationId]);

  // ---------- Delete / SignOut ----------
  const deleteAccount = useCallback(async () => {
    try {
      if (!state.user) {
        return { success: false, error: 'No user logged in' };
      }
      await state.user.delete();
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message };
    }
  }, [state.user]);

  const signOut = useCallback(async () => {
    try {
      if (!isConfigured || !auth) {
        return {
          success: false,
          error: 'Firebase is not configured. Please add your Firebase credentials to .env file.'
        };
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
      sendPhoneVerification,
      verifyPhoneCode,
      deleteAccount,
      signOut,
      // Expose request state for UI if needed
      googleRequestReady: !!googleRequest,
    }),
    [
      state.user,
      state.loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      sendPhoneVerification,
      verifyPhoneCode,
      deleteAccount,
      signOut,
      googleRequest,
    ]
  );
});