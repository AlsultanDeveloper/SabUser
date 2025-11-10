require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkSpecificProducts() {
  try {
    console.log('🔍 البحث عن المنتجات...\n');
    
    // البحث عن منتج "Men Black Plain Lounge"
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let found = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const name = typeof data.name === 'string' ? data.name : (data.name?.en || data.name?.ar || '');
      
      // البحث عن المنتج بالاسم
      if (name.toLowerCase().includes('lounge') || name.toLowerCase().includes('black plain')) {
        found++;
        console.log('═══════════════════════════════════════════════════');
        console.log(`📦 منتج ${found}:`);
        console.log('═══════════════════════════════════════════════════');
        console.log(`الاسم: ${name}`);
        console.log(`ID: ${doc.id}`);
        console.log(`source: ${data.source || 'غير موجود'}`);
        console.log(`vendorName: ${data.vendorName || 'غير موجود'}`);
        console.log(`brand: ${data.brand || data.brandName || 'غير موجود'}`);
        console.log(`السعر: $${data.price}`);
        console.log('');
      }
    });
    
    console.log(`\n✅ تم العثور على ${found} منتج\n`);
    
    // عرض إحصائيات source
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 إحصائيات source في جميع المنتجات:');
    console.log('═══════════════════════════════════════════════════\n');
    
    const sourceStats = new Map();
    snapshot.forEach((doc) => {
      const source = doc.data().source || 'NO_SOURCE';
      sourceStats.set(source, (sourceStats.get(source) || 0) + 1);
    });
    
    const sorted = Array.from(sourceStats.entries()).sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 15).forEach(([source, count]) => {
      const percentage = ((count / snapshot.size) * 100).toFixed(1);
      console.log(`  "${source}": ${count} (${percentage}%)`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  process.exit(0);
}

checkSpecificProducts();
