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

async function findSabMarketProducts() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔍 البحث عن منتجات Sab Market');
    console.log('═══════════════════════════════════════════════════\n');
    
    // جلب جميع المنتجات
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 إجمالي المنتجات: ${snapshot.size}\n`);
    
    const categories = {
      sabMarketSource: [],      // source = "sab-market"
      sabMarketText: [],        // source يحتوي على "sab" أو "market"
      noSource: [],             // بدون source
      otherSource: []           // source = قيم أخرى
    };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const name = typeof data.name === 'string' ? data.name : (data.name?.en || data.name?.ar || 'Unknown');
      
      if (!data.source) {
        categories.noSource.push({
          id: doc.id,
          name: name.substring(0, 50),
          brand: data.brand || data.brandName
        });
      } else if (data.source === 'sab-market') {
        categories.sabMarketSource.push({
          id: doc.id,
          name: name.substring(0, 50),
          brand: data.brand || data.brandName
        });
      } else if (
        data.source.toLowerCase().includes('sab') || 
        data.source.toLowerCase().includes('market')
      ) {
        categories.sabMarketText.push({
          id: doc.id,
          name: name.substring(0, 50),
          source: data.source,
          brand: data.brand || data.brandName
        });
      } else {
        if (categories.otherSource.length < 10) {
          categories.otherSource.push({
            id: doc.id,
            name: name.substring(0, 50),
            source: data.source,
            brand: data.brand || data.brandName
          });
        }
      }
    });
    
    console.log('📊 النتائج:\n');
    console.log(`✅ source = "sab-market": ${categories.sabMarketSource.length} منتج`);
    console.log(`🔍 source يحتوي "sab" أو "market": ${categories.sabMarketText.length} منتج`);
    console.log(`❓ بدون source: ${categories.noSource.length} منتج`);
    console.log(`🛍️  منتجات أخرى: ${snapshot.size - categories.sabMarketSource.length - categories.sabMarketText.length - categories.noSource.length} منتج\n`);
    
    // عرض أمثلة
    if (categories.sabMarketSource.length > 0) {
      console.log('═══════════════════════════════════════════════════');
      console.log('✅ أمثلة source = "sab-market" (أول 5):');
      console.log('═══════════════════════════════════════════════════\n');
      categories.sabMarketSource.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Brand: ${p.brand || 'N/A'}\n`);
      });
    }
    
    if (categories.sabMarketText.length > 0) {
      console.log('═══════════════════════════════════════════════════');
      console.log('🔍 أمثلة source تحتوي "sab/market" (أول 5):');
      console.log('═══════════════════════════════════════════════════\n');
      categories.sabMarketText.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Source: "${p.source}"`);
        console.log(`   Brand: ${p.brand || 'N/A'}\n`);
      });
    }
    
    if (categories.noSource.length > 0) {
      console.log('═══════════════════════════════════════════════════');
      console.log('❓ أمثلة بدون source (أول 5):');
      console.log('═══════════════════════════════════════════════════\n');
      categories.noSource.slice(0, 5).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Brand: ${p.brand || 'N/A'}\n`);
      });
    }
    
    console.log('═══════════════════════════════════════════════════');
    console.log('🛍️  أمثلة من منتجات أخرى (أول 10):');
    console.log('═══════════════════════════════════════════════════\n');
    categories.otherSource.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Source: "${p.source}"`);
      console.log(`   Brand: ${p.brand || 'N/A'}\n`);
    });
    
    // البحث عن جميع قيم source الفريدة
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 جميع قيم source الموجودة:');
    console.log('═══════════════════════════════════════════════════\n');
    
    const sourceValues = new Map();
    snapshot.forEach((doc) => {
      const source = doc.data().source || 'NO_SOURCE';
      sourceValues.set(source, (sourceValues.get(source) || 0) + 1);
    });
    
    const sorted = Array.from(sourceValues.entries()).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([source, count]) => {
      const percentage = ((count / snapshot.size) * 100).toFixed(1);
      const icon = source === 'sab-market' || source.toLowerCase().includes('sab') ? '🏪' : 
                   source === 'NO_SOURCE' ? '❓' : '🛍️';
      console.log(`${icon} "${source}": ${count} (${percentage}%)`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  process.exit(0);
}

findSabMarketProducts();
