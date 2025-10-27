// firebase.ts
import { Platform } from "react-native";
import Constants from "expo-constants";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth as getWebAuth,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  GoogleAuthProvider,
  Auth,
} from "firebase/auth";
import {
  initializeAuth,
  getAuth, // من react-native
  getReactNativePersistence,
} from "firebase/auth/react-native";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---- ENV ----
const getEnvVar = (key: string): string | undefined =>
  process.env[key] ?? (Constants.expoConfig as any)?.extra?.[key];

const firebaseConfig = {
  apiKey: getEnvVar("EXPO_PUBLIC_FIREBASE_API_KEY") ?? "AIzaSyCqeIKe6itUxPXTLHCYxIaxnl-wsCmcIYY",
  authDomain: getEnvVar("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN") ?? "sab-store-9b947.firebaseapp.com",
  projectId: getEnvVar("EXPO_PUBLIC_FIREBASE_PROJECT_ID") ?? "sab-store-9b947",
  storageBucket: getEnvVar("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET") ?? "sab-store-9b947.appspot.com",
  messagingSenderId: getEnvVar("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ?? "263235150197",
  appId: getEnvVar("EXPO_PUBLIC_FIREBASE_APP_ID") ?? "1:263235150197:web:3519534187b75d9006b33c",
  measurementId: getEnvVar("EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID") ?? "G-1ZPF2J52WZ",
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error("Firebase configuration is incomplete");
}

const USE_EMULATORS = (getEnvVar("EXPO_PUBLIC_USE_EMULATORS") ?? "").toLowerCase() === "true";

// ---- App ----
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ---- Auth ----
let auth: Auth;

if (Platform.OS === "web") {
  const webAuth = getWebAuth(app);
  setPersistence(webAuth, browserLocalPersistence).catch(() => {
    setPersistence(webAuth, inMemoryPersistence).catch(() => {});
  });
  auth = webAuth as unknown as Auth;
} else {
  // iOS/Android: persistence عبر AsyncStorage
  // جرّب الحصول على auth إن كان مهيأً، وإلا قم بتهيئته
  try {
    auth = getAuth(app);
  } catch {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
}

// ---- Firestore & Storage ----
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// ---- Emulators (اختياري) ----
if (USE_EMULATORS) {
  try {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  } catch {}
}

// ---- Helpers ----
export const createGoogleCredential = (idToken: string) => {
  if (!idToken) throw new Error("Google idToken is required");
  return GoogleAuthProvider.credential(idToken);
};

export const signOutSafely = async () => {
  try {
    await auth.signOut();
  } catch {}
};

// ---- Exports ----
export { app, auth, db, storage };
export type { FirebaseApp };