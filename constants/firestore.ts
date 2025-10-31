import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  onSnapshot,
} from 'firebase/firestore';
import { db, isConfigValid } from './firebase';

export const collections = {
  users: 'users',
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  addresses: 'addresses',
  reviews: 'reviews',
  cart: 'carts',
  wishlists: 'wishlists',
  brands: 'brands',
  notifications: 'notifications',
  userNotifications: 'userNotifications',
  supportMessages: 'supportMessages',
} as const;

export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    if (!db || !isConfigValid) {
      console.warn('Firebase is not configured. Please check your .env file.');
      return null;
    }
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    if (!db || !isConfigValid) {
      console.warn('Firebase is not configured. Please check your .env file.');
      return [];
    }
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

export async function createDocument<T extends WithFieldValue<DocumentData>>(
  collectionName: string,
  data: T,
  docId?: string
): Promise<string> {
  try {
    if (!db || !isConfigValid) {
      throw new Error('Firebase is not configured. Please check your .env file.');
    }
    if (docId) {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docId;
    } else {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function updateDocument<T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    if (!db || !isConfigValid) {
      throw new Error('Firebase is not configured. Please check your .env file.');
    }
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    if (!db || !isConfigValid) {
      throw new Error('Firebase is not configured. Please check your .env file.');
    }
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  return getDocument(collections.users, userId);
}

export async function createUserProfile(userId: string, data: any) {
  return createDocument(collections.users, data, userId);
}

export async function updateUserProfile(userId: string, data: any) {
  return updateDocument(collections.users, userId, data);
}

export async function getUserOrders(userId: string) {
  return getDocuments(collections.orders, [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function getOrder(orderId: string) {
  return getDocument(collections.orders, orderId);
}

export async function getUserAddresses(userId: string) {
  return getDocuments(collections.addresses, [
    where('userId', '==', userId),
  ]);
}

export { Timestamp, where, orderBy, limit, onSnapshot };
