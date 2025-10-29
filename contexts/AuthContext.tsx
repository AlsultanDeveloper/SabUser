
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
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, isConfigured } from '@/constants/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

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

  // ---- OAuth Client IDs from ENV ----
  const GOOGLE_ANDROID_CLIENT_ID = useMemo(
    () => process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    []
  );
  const GOOGLE_IOS_CLIENT_ID = useMemo(
    () => process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    []
  );
  const GOOGLE_WEB_CLIENT_ID = useMemo(
    () => process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    []
  );

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

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      if (!isConfigured || !auth) {
        return { success: false, error: 'Firebase is not configured.' };
      }
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        email: result.user.email,
        fullName: result.user.displayName || '',
        signInMethod: 'email',
        createdAt: new Date().toISOString(),
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
        return { success: false, error: 'Firebase is not configured.' };
      }

      if (!GOOGLE_WEB_CLIENT_ID) return { success: false, error: 'Missing Google Web Client ID' };
      if (!GOOGLE_ANDROID_CLIENT_ID && Platform.OS === 'android')
        return { success: false, error: 'Missing Google Android Client ID' };
      if (!GOOGLE_IOS_CLIENT_ID && Platform.OS === 'ios')
        return { success: false, error: 'Missing Google iOS Client ID' };

      console.log('🔄 Starting Google sign-in flow...');
      const res = await googlePromptAsync();

      if (res.type === 'cancel' || res.type === 'dismiss') return { success: false, cancelled: true };
      if (res.type === 'error') return { success: false, error: (res as any).error?.message || 'Google authentication failed' };
      if (res.type !== 'success') return { success: false, error: `Google sign-in returned: ${res.type}` };

      const idToken = (res.params as any)?.id_token || (res as any).authentication?.idToken;
      if (!idToken) return { success: false, error: 'No idToken received from Google' };

      console.log('✅ Received idToken, signing in to Firebase...');
      const credential = GoogleAuthProvider.credential(idToken, null);
      const result = await signInWithCredential(auth, credential);

      const db = getFirestore();
      const userDocRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          email: result.user.email,
          fullName: result.user.displayName || '',
          signInMethod: 'google',
          createdAt: new Date().toISOString(),
        });
      }

      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
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
