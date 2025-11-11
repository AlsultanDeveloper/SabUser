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
  orders: 'orders', // SAB Store orders
  marketOrders: 'marketOrders', // SAB Market orders
  addresses: 'addresses',
  reviews: 'reviews',
  cart: 'carts',
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
  } catch (error: any) {
    // Silently handle permission errors
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn(`⚠️ Permission denied accessing document ${docId} in ${collectionName}`);
      return null;
    }
    console.error('Error getting document:', error);
    return null;
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
    
    // ✅ Enhanced auth check for protected collections
    const authRequiredCollections = ['orders', 'marketOrders', 'addresses', 'reviews', 'userNotifications'];
    if (authRequiredCollections.includes(collectionName)) {
      const { auth } = await import('./firebase');
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        console.log(`ℹ️ Skipping ${collectionName} fetch - user not authenticated`);
        return [];
      }
    }
    
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error: any) {
    // Silently handle permission errors - return empty array instead of throwing
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn(`⚠️ Permission denied accessing ${collectionName} - user may need to log in`);
      return [];
    }
    console.error('Error getting documents:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
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
    
    // Check if user is authenticated (for collections that require auth)
    const authRequiredCollections = ['orders', 'marketOrders', 'addresses', 'reviews', 'userNotifications'];
    if (authRequiredCollections.includes(collectionName)) {
      const { auth } = await import('./firebase');
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        console.warn(`⚠️ Attempted to create ${collectionName} document without authentication`);
        console.warn(`⚠️ auth.currentUser is null - user may need to re-authenticate`);
        throw new Error('You must be logged in to perform this action');
      }
      
      // Verify token is valid by attempting to refresh it
      try {
        const newToken = await currentUser.getIdToken(true);
        console.log('✅ Token refreshed for Firestore operation');
        console.log('✅ Token length:', newToken?.length || 0);
        
        // Small delay to ensure token propagates to Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (tokenError) {
        console.error('❌ Token verification failed:', tokenError);
        throw new Error('You must be logged in to perform this action');
      }
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
  } catch (error: any) {
    // Better error handling for permission errors
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn(`⚠️ Permission denied creating document in ${collectionName}`);
      throw new Error('You must be logged in to perform this action');
    }
    // Re-throw authentication errors
    if (error?.message?.includes('logged in')) {
      throw error;
    }
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
    
    // Check if user is authenticated (for collections that require auth)
    const authRequiredCollections = ['orders', 'marketOrders', 'addresses', 'reviews', 'userNotifications'];
    if (authRequiredCollections.includes(collectionName)) {
      const { auth } = await import('./firebase');
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        console.warn(`⚠️ Attempted to delete ${collectionName} document without authentication`);
        throw new Error('You must be logged in to perform this action');
      }
    }
    
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    // Better error handling for permission errors
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn(`⚠️ Permission denied deleting document ${docId} from ${collectionName}`);
      throw new Error('You must be logged in to perform this action');
    }
    // Re-throw authentication errors
    if (error?.message?.includes('logged in')) {
      throw error;
    }
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
  try {
    // Check if user document exists first
    const userDoc = await getDocument(collections.users, userId);
    
    if (!userDoc) {
      // If user document doesn't exist, create it with the new data
      console.log('📝 User document not found, creating new one for:', userId);
      return createDocument(collections.users, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, userId);
    }
    
    // If document exists, update it
    return updateDocument(collections.users, userId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string) {
  return getDocuments(collections.orders, [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function getUserMarketOrders(userId: string) {
  return getDocuments(collections.marketOrders, [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function getAllUserOrders(userId: string) {
  // Get both SAB Store and SAB Market orders
  const [storeOrders, marketOrders] = await Promise.all([
    getUserOrders(userId),
    getUserMarketOrders(userId),
  ]);
  
  // Combine and sort by date
  const allOrders = [...storeOrders, ...marketOrders].sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  
  return allOrders;
}

export async function getOrder(orderId: string) {
  // Try SAB Store orders first
  let order = await getDocument(collections.orders, orderId);
  if (order) return order;
  
  // Try SAB Market orders
  order = await getDocument(collections.marketOrders, orderId);
  return order;
}

export async function getUserAddresses(userId: string) {
  return getDocuments(collections.addresses, [
    where('userId', '==', userId),
  ]);
}

export { Timestamp, where, orderBy, limit, onSnapshot };
