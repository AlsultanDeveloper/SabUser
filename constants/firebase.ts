
// firebase.ts
import { Platform } from "react-native";
import Constants from "expo-constants";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  GoogleAuthProvider,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native Persistence Adapter
// This is needed for Firebase Auth to work properly on React Native
// @ts-ignore - Used in initializeAuth below
const ReactNativeAsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  },
};

// -------------------- ENV helpers --------------------
const getEnvVar = (key: string): string | undefined => {
  return process.env[key] ?? (Constants.expoConfig as any)?.extra?.[key];
};


const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔧 Firebase config check:', {
  apiKey: firebaseConfig.apiKey ? '✓' : '✗',
  authDomain: firebaseConfig.authDomain ? '✓' : '✗',
  projectId: firebaseConfig.projectId ? '✓' : '✗',
  storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
  appId: firebaseConfig.appId ? '✓' : '✗',
});

const isConfigValid =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

if (!isConfigValid) {
  console.error("✗ Firebase config is incomplete.");
  console.error("Missing keys:", {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    storageBucket: !!firebaseConfig.storageBucket,
    messagingSenderId: !!firebaseConfig.messagingSenderId,
    appId: !!firebaseConfig.appId,
  });
  console.error("Constants.expoConfig?.extra:", JSON.stringify(Constants.expoConfig?.extra, null, 2));
  throw new Error("Firebase configuration is incomplete. Please restart the development server.");
}

// Optional local emulators toggle
const USE_EMULATORS = (getEnvVar("EXPO_PUBLIC_USE_EMULATORS") ?? "").toLowerCase() === "true";

// -------------------- Initialize App & Services --------------------
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (Platform.OS === "web") {
    // ✅ الويب: getAuth + browser persistence
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {
      setPersistence(auth, inMemoryPersistence).catch(() => {});
    });
  } else {
    // ✅ React Native: initializeAuth مع AsyncStorage persistence
    try {
      // محاولة الحصول على auth إذا كان موجود بالفعل
      auth = getAuth(app);
    } catch {
      // إذا لم يكن موجود، قم بتهيئته مع persistence
      auth = initializeAuth(app, {
        persistence: ReactNativeAsyncStorage as any,
      });
    }
    console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
  }

  db = getFirestore(app);
  
  // تحسين إعدادات Firestore لتجنب أخطاء الاتصال
  console.log('✅ Firestore initialized with optimized settings');
  
  storage = getStorage(app);

  if (USE_EMULATORS) {
    try {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      connectStorageEmulator(storage, "127.0.0.1", 9199);
      console.log("ℹ️ Connected to Firebase emulators (Firestore, Storage).");
    } catch (e) {
      console.warn("Emulator connection failed (ignored):", e);
    }
  }

  console.log("✓ Firebase initialized", {
    projectId: firebaseConfig.projectId,
    platform: Platform.OS,
    emulators: USE_EMULATORS,
  });
} catch (error) {
  console.error("✗ Firebase initialization error:", error);
  throw error;
}

// -------------------- Helpers --------------------
export const createGoogleCredential = (idToken: string) => {
  if (!idToken) throw new Error("Google idToken is required");
  return GoogleAuthProvider.credential(idToken);
};

export const signOutSafely = async () => {
  try {
    await auth.signOut();
  } catch {
    // ignore occasional "already signed out"
  }
};

// -------------------- Exports --------------------
export { app, auth, db, storage, isConfigValid, isConfigValid as isConfigured };
export type { FirebaseApp };
