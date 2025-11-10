require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSourceValues() {
  try {
    console.log('🔍 جاري فحص قيم source في المنتجات...\n');
    
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(50));
    const snapshot = await getDocs(q);
    
    const sourceValues = new Map();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const sourceValue = data.source || 'NO_SOURCE';
      const count = sourceValues.get(sourceValue) || 0;
      sourceValues.set(sourceValue, count + 1);
      
      // طباعة أول 5 منتجات
      if (snapshot.docs.indexOf(doc) < 5) {
        console.log(`منتج ${snapshot.docs.indexOf(doc) + 1}:`);
        console.log(`  الاسم: ${typeof data.name === 'string' ? data.name : data.name?.en}`);
        console.log(`  source: ${data.source || 'غير موجود'}`);
        console.log(`  vendorName: ${data.vendorName || 'غير موجود'}`);
        console.log(`  brand: ${data.brand || data.brandName || 'غير موجود'}`);
        console.log('  ---\n');
      }
    });
    
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 قيم source الموجودة (من أول 50 منتج):');
    console.log('═══════════════════════════════════════════════════\n');
    
    Array.from(sourceValues.entries()).forEach(([value, count]) => {
      console.log(`  "${value}": ${count} منتج`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  process.exit(0);
}

checkSourceValues();
