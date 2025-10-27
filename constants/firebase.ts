// firebase.ts - dummy content
// firebase.ts
// Expo / React Native friendly Firebase initialization
// - Singleton app/services
// - Safe env handling
// - React Native Auth persistence (AsyncStorage) if available
// - Helpers for Google credential + safe sign-out
// - Optional local emulators toggle

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

// AsyncStorage for RN persistence (optional soft-import)
let ReactNativePersistence: any | undefined;
try {
  // `@react-native-async-storage/async-storage` should be installed in your project
  // expo install @react-native-async-storage/async-storage
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  if (AsyncStorage) {
    // Firebase v9 exports ReactNativePersistence from 'firebase/auth/react-native'
    // but in many setups we can emulate by passing AsyncStorage directly.
    // Prefer official import if available in your toolchain:
    // import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
    ReactNativePersistence = {
      type: "react-native",
      storage: AsyncStorage,
    };
  }
} catch {
  // ignore, we'll fall back
}

// -------------------- ENV helpers --------------------
const getEnvVar = (key: string): string | undefined => {
  // Expo public envs are available at runtime
  return process.env[key] ?? (Constants.expoConfig as any)?.extra?.[key];
};

const firebaseConfig = {
  apiKey:
    getEnvVar("EXPO_PUBLIC_FIREBASE_API_KEY") ??
    "AIzaSyCqeIKe6itUxPXTLHCYxIaxnl-wsCmcIYY",
  authDomain:
    getEnvVar("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN") ??
    "sab-store-9b947.firebaseapp.com",
  projectId:
    getEnvVar("EXPO_PUBLIC_FIREBASE_PROJECT_ID") ?? "sab-store-9b947",
  storageBucket:
    getEnvVar("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET") ??
    "sab-store-9b947.appspot.com",
  messagingSenderId:
    getEnvVar("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ?? "263235150197",
  appId:
    getEnvVar("EXPO_PUBLIC_FIREBASE_APP_ID") ??
    "1:263235150197:web:3519534187b75d9006b33c",
  measurementId:
    getEnvVar("EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID") ?? "G-1ZPF2J52WZ",
};

const isConfigValid =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

if (!isConfigValid) {
  // Fail early with clear diagnostics
  // (avoid logging sensitive values)
  console.error("✗ Firebase config is incomplete. Check your env (.env/.env.local) and app.json 'extra'.");
  console.error("Missing keys:", {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    appId: !!firebaseConfig.appId,
  });
  throw new Error("Firebase configuration is incomplete");
}

// Optional local emulators toggle (EXPO_PUBLIC_USE_EMULATORS=true)
const USE_EMULATORS =
  (getEnvVar("EXPO_PUBLIC_USE_EMULATORS") ?? "").toLowerCase() === "true";

// -------------------- Initialize App & Services --------------------
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Initialize Auth based on platform
  if (Platform.OS === "web") {
    // For web, use getAuth with browser persistence
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {
      setPersistence(auth, inMemoryPersistence).catch(() => {});
    });
  } else {
    // For native platforms, use initializeAuth with proper persistence
    if (ReactNativePersistence && ReactNativePersistence.storage) {
      try {
        auth = initializeAuth(app, {
          persistence: ReactNativePersistence,
        });
      } catch (e: any) {
        if (e.code === 'auth/already-initialized') {
          auth = getAuth(app);
        } else {
          throw e;
        }
      }
    } else {
      auth = getAuth(app);
      setPersistence(auth, inMemoryPersistence).catch(() => {});
    }
  }

  // Firestore & Storage
  db = getFirestore(app);
  storage = getStorage(app);

  // Connect emulators if enabled (useful for local dev)
  if (USE_EMULATORS) {
    try {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      connectStorageEmulator(storage, "127.0.0.1", 9199);
      console.log("ℹ️ Connected to Firebase emulators (Firestore, Storage).");
    } catch (e) {
      console.warn("Emulator connection failed (ignored):", e);
    }
  }

  // Safe diagnostics
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

// Use this with expo-auth-session result (Google) to sign in with Firebase:
//   const cred = createGoogleCredential(idToken)
//   await signInWithCredential(auth, cred)
export const createGoogleCredential = (idToken: string) => {
  if (!idToken) throw new Error("Google idToken is required");
  return GoogleAuthProvider.credential(idToken);
};

// A safe sign-out wrapper (useful in UI handlers)
export const signOutSafely = async () => {
  try {
    await auth.signOut();
  } catch (e) {
    // ignore occasional "already signed out"
  }
};

// -------------------- Exports --------------------
export { app, auth, db, storage, isConfigValid, isConfigValid as isConfigured };
export type { FirebaseApp };