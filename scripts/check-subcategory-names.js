// Check Subcategory Names in Products
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

async function checkSubcategoryNames() {
  try {
    console.log('🔍 Checking unique subcategoryName values in SAB MARKET products...\n');
    
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ'));
    
    const snapshot = await getDocs(q);
    console.log(`📦 Total SAB MARKET products: ${snapshot.size}\n`);
    
    const subcategoryNames = new Map();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const subName = data.subcategoryName || 'NO_SUBCATEGORY_NAME';
      
      if (!subcategoryNames.has(subName)) {
        subcategoryNames.set(subName, {
          count: 0,
          examples: []
        });
      }
      
      const info = subcategoryNames.get(subName);
      info.count++;
      
      if (info.examples.length < 3) {
        info.examples.push(data.name?.en || data.name || 'Unknown');
      }
    });
    
    console.log('📊 Unique subcategoryName values:\n');
    console.log('='.repeat(80));
    
    const sorted = Array.from(subcategoryNames.entries()).sort((a, b) => b[1].count - a[1].count);
    
    sorted.forEach(([name, info], index) => {
      console.log(`\n${index + 1}. subcategoryName: "${name}"`);
      console.log(`   Products: ${info.count}`);
      console.log(`   Examples:`);
      info.examples.forEach((ex, i) => {
        console.log(`     ${i + 1}. ${ex}`);
      });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Check completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSubcategoryNames();
