
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
import { auth, isConfigured, db } from '@/constants/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
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

  // ---- Load persisted session on mount ----
  useEffect(() => {
    const loadPersistedSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          console.log('📱 Loaded persisted session from AsyncStorage');
          // Don't set user here - let onAuthStateChanged handle it
          // This just ensures Firebase Auth is initialized
        }
      } catch (error) {
        console.error('❌ Failed to load persisted session:', error);
      }
    };
    loadPersistedSession();
  }, []);

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
    
    // Configure GoogleSignin for Android
    if (Platform.OS === 'android') {
      if (!GOOGLE_WEB_CLIENT_ID) {
        console.error('❌ GOOGLE_WEB_CLIENT_ID is missing!');
        return;
      }
      
      console.log('🔧 Configuring GoogleSignin with Web Client ID:', GOOGLE_WEB_CLIENT_ID);
      
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
        forceCodeForRefreshToken: false,
      });
      
      console.log('✅ GoogleSignin configured successfully');
    }
  }, [GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID]);

  // ---- Google OAuth Config ----
  const googleConfig = useMemo(() => {
    // Use the same configuration as iOS - platform-specific client IDs
    const config: any = {
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
    };
    
    // Don't set redirectUri - let expo-auth-session generate it automatically
    // This will use the deep link scheme from AndroidManifest.xml / Info.plist
    console.log('🔧 Using automatic redirect URI with native client IDs');
    
    return config;
  }, [GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID]);

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest(googleConfig);

  // ---- Debug: Log the actual redirect URI being used ----
  useEffect(() => {
    if (googleRequest) {
      console.log('📍 Google Request Details:');
      console.log('  Redirect URI:', googleRequest.redirectUri);
      console.log('  Client ID being used:', googleRequest.clientId);
      console.log('  Response Type:', googleRequest.responseType);
    }
  }, [googleRequest]);

  // ---- Google Sign-In ----
  const signInWithGoogle = useCallback(async () => {
    try {
      if (!isConfigured || !auth) {
        console.error('❌ Firebase not configured');
        return { success: false, error: 'Firebase is not configured.' };
      }

      console.log('🔐 Starting Google Sign-In...');
      console.log('📱 Platform:', Platform.OS);
      
      // Use native Google Sign-In for Android
      if (Platform.OS === 'android') {
        console.log('🤖 Using Native Google Sign-In for Android');
        
        // Check if Google Play services are available
        await GoogleSignin.hasPlayServices();
        
        // Sign in
        const userInfo = await GoogleSignin.signIn();
        console.log('✅ Google Sign-In successful:', userInfo.data?.user.email);
        
        // Get ID token
        const idToken = userInfo.data?.idToken;
        
        if (!idToken) {
          throw new Error('No ID token received');
        }
        
        // Create Firebase credential
        const credential = GoogleAuthProvider.credential(idToken);
        
        // Sign in to Firebase
        const result = await signInWithCredential(auth, credential);
        console.log('✅ Firebase sign-in successful:', result.user.uid);
        
        // Create/update user document
        const userDocRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || '',
            photoURL: result.user.photoURL || '',
            phoneNumber: result.user.phoneNumber || null,
            authProvider: 'google',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log('✅ User document created');
        } else {
          await setDoc(userDocRef, {
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          }, { merge: true });
          console.log('✅ User document updated');
        }
        
        return { success: true, user: result.user };
      }
      
      // For iOS - use expo-auth-session (existing code)
      if (!googleRequest) {
        console.error('❌ Google request not initialized');
        return { success: false, error: 'Google authentication not ready. Please try again.' };
      }

      // Trigger the Google sign-in flow
      const result = await googlePromptAsync();
      
      console.log('📋 Google prompt result type:', result?.type);

      if (result?.type === 'cancel') {
        console.log('ℹ️ User cancelled sign-in');
        return { success: false, cancelled: true };
      } else if (result?.type === 'dismiss') {
        console.log('ℹ️ Sign-in popup dismissed');
        return { success: false, cancelled: true };
      } else if (result?.type === 'success') {
        // The useEffect below will handle the actual sign-in
        console.log('✅ OAuth successful, processing...');
        // Return success immediately - useEffect will complete the sign-in
        return { success: true };
      } else {
        console.error('❌ Unexpected result type:', result?.type);
        return { 
          success: false, 
          error: 'Google sign-in was not successful. Please try again.' 
        };
      }
    } catch (error: any) {
      console.error('❌ Google sign in exception:', error);
      return { success: false, error: error.message || 'Google sign-in failed' };
    }
  }, [googleRequest, googlePromptAsync]);

  // ---- Handle Google OAuth response ----
  useEffect(() => {
    console.log('📡 Google Response Update:', {
      type: googleResponse?.type,
      timestamp: new Date().toISOString()
    });
    
    if (googleResponse?.type === 'success') {
      console.log('🎯 Google OAuth response received - SUCCESS!');
      console.log('📦 Response params:', JSON.stringify(googleResponse.params, null, 2));
      
      const { id_token, access_token } = googleResponse.params;
      
      // التحقق من وجود id_token
      if (!id_token) {
        console.error('❌ No id_token in response!');
        console.log('💡 Using access_token instead...');
        
        // استخدام access_token إذا لم يكن id_token موجوداً
        if (access_token) {
          const credential = GoogleAuthProvider.credential(null, access_token);
          signInWithCredential(auth!, credential)
            .then(async (result) => {
              console.log('✅ Google sign in successful (with access_token):', result.user.uid);
              const userDocRef = doc(db, 'users', result.user.uid);
              const docSnap = await getDoc(userDocRef);
              if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                  uid: result.user.uid,
                  email: result.user.email,
                  displayName: result.user.displayName || '',
                  photoURL: result.user.photoURL || '',
                  phoneNumber: result.user.phoneNumber || null,
                  authProvider: 'google',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            })
            .catch((error) => {
              console.error('❌ Google sign in error (access_token):', error);
            });
        }
        return;
      }
      
      // استخدام id_token العادي
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth!, credential)
        .then(async (result) => {
          console.log('✅ Google sign in successful:', result.user.uid);
          const userDocRef = doc(db, 'users', result.user.uid);
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName || '',
              photoURL: result.user.photoURL || '',
              phoneNumber: result.user.phoneNumber || null,
              authProvider: 'google',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Update last login
            await setDoc(userDocRef, {
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            }, { merge: true });
          }
        })
        .catch((error) => {
          console.error('❌ Google sign in error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        });
    } else if (googleResponse?.type === 'error') {
      console.error('❌ Google OAuth error response:', googleResponse);
    } else if (googleResponse?.type === 'cancel') {
      console.log('ℹ️ User cancelled Google sign-in');
    } else if (googleResponse?.type === 'dismiss') {
      console.log('ℹ️ Google sign-in dismissed');
    }
  }, [googleResponse]);

  // ---- Firebase Auth State Listener ----
  useEffect(() => {
    if (!isConfigured || !auth) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setState(prev => ({ ...prev, user, loading: false }));
      console.log('Auth state changed:', user?.uid);
      
      // Persist user session to AsyncStorage
      if (user) {
        try {
          await AsyncStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }));
          console.log('✅ User session saved to AsyncStorage');
        } catch (error) {
          console.error('❌ Failed to save user session:', error);
        }
      } else {
        await AsyncStorage.removeItem('user');
        console.log('✅ User session cleared from AsyncStorage');
      }
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
        ...(fullName && { displayName: fullName }),
        
        // الصورة (فقط إذا كانت موجودة)
        ...(result.user.photoURL && { photoURL: result.user.photoURL }),
        
        // المصادقة
        signInMethod: 'email',
        
        // الاتصال (فقط إذا كان موجود)
        ...(additionalData?.phoneNumber && { phoneNumber: additionalData.phoneNumber }),
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
        const { identityToken, fullName } = credential;
        if (identityToken) {
          const provider = new OAuthProvider('apple.com');
          const firebaseCredential = provider.credential({ idToken: identityToken });
          const result = await signInWithCredential(auth, firebaseCredential);
          console.log('✅ Apple sign-in successful');
          
          // Check if user document exists, create if not
          const userDocRef = doc(db, 'users', result.user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            console.log('📝 Creating user document for Apple sign-in user');
            const displayName = fullName 
              ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
              : result.user.displayName || 'Apple User';
            
            // Create complete user document structure for OAuth
            const userData: Partial<AppUser> = {
              uid: result.user.uid,
              email: result.user.email || '',
              emailVerified: result.user.emailVerified || false,
              displayName: displayName,
              fullName: displayName,
              phoneNumber: result.user.phoneNumber || '',
              photoURL: result.user.photoURL || '',
              signInMethod: 'apple',
              phoneVerified: false,
              
              preferences: {
                language: 'en',
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
              
              stats: {
                totalOrders: 0,
                totalSpent: 0,
                wishlistCount: 0,
                loyaltyPoints: 0,
                membershipLevel: 'bronze',
              },
              
              status: {
                isActive: true,
                isVerified: false,
                isBlocked: false,
                twoFactorEnabled: false,
              },
              
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              
              metadata: {
                registrationSource: 'ios' as any,
                deviceInfo: {
                  platform: 'ios',
                  version: Platform.Version.toString(),
                },
              },
            };
            
            // Use setDoc with complete data structure
            await setDoc(userDocRef, userData);
            console.log('✅ User document created successfully');
          }
          
          return { success: true, user: result.user };
        }
        return { success: false, error: 'No identity token' };
      } else if (Platform.OS === 'web') {
        const provider = new OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        const result = await signInWithPopup(auth, provider);
        
        // Check if user document exists, create if not
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          console.log('📝 Creating user document for Apple sign-in user');
          
          const userData: Partial<AppUser> = {
            uid: result.user.uid,
            email: result.user.email || '',
            emailVerified: result.user.emailVerified || false,
            displayName: result.user.displayName || 'Apple User',
            fullName: result.user.displayName || 'Apple User',
            phoneNumber: result.user.phoneNumber || '',
            photoURL: result.user.photoURL || '',
            signInMethod: 'apple',
            phoneVerified: false,
            
            preferences: {
              language: 'en',
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
            
            stats: {
              totalOrders: 0,
              totalSpent: 0,
              wishlistCount: 0,
              loyaltyPoints: 0,
              membershipLevel: 'bronze',
            },
            
            status: {
              isActive: true,
              isVerified: false,
              isBlocked: false,
              twoFactorEnabled: false,
            },
            
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            
            metadata: {
              registrationSource: 'web' as any,
              deviceInfo: {
                platform: 'web',
                version: '1.0',
              },
            },
          };
          
          await setDoc(userDocRef, userData);
          console.log('✅ User document created successfully');
        }
        
        return { success: true, user: result.user };
      } else {
        return { success: false, error: 'Apple sign-in not available on Android' };
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      // Check if user cancelled
      if (error.code === 'ERR_REQUEST_CANCELED' || error.message?.includes('canceled')) {
        return { success: false, cancelled: true };
      }
      return { success: false, error: error.message };
    }
  }, []);

  // ---- Sign Out ----
  const signOut = useCallback(async () => {
    console.log('🚪 Starting sign out...');
    console.log('📱 Platform:', Platform.OS);
    
    try {
      if (!isConfigured || !auth) {
        console.error('❌ Firebase not configured');
        return { success: false, error: 'Firebase is not configured.' };
      }

      console.log('🔐 Current user before sign out:', auth.currentUser?.uid);
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      console.log('✅ Firebase sign out successful');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('user');
      console.log('✅ AsyncStorage cleared');
      
      // Clear state
      setState({ user: null, loading: false, phoneVerificationId: null });
      console.log('✅ Auth state cleared');
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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
    }),
    [state.user, state.loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signOut]
  );
});

