const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCqeIKe6itUxPXTLHCYxIaxnl-wsCmcIYY",
  authDomain: "sab-store-9b947.firebaseapp.com",
  projectId: "sab-store-9b947",
  storageBucket: "sab-store-9b947.appspot.com",
  messagingSenderId: "263235150197",
  appId: "1:263235150197:web:3519534187b75d9006b33c",
  measurementId: "G-1ZPF2J52WZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCategories() {
  console.log('\n🔍 Checking Firebase Categories...\n');
  
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    console.log(`📊 Total categories: ${snapshot.size}\n`);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📁 Category ID: ${doc.id}`);
      console.log(`   Name (EN): ${data.name?.en || data.name}`);
      console.log(`   Name (AR): ${data.name?.ar || data.nameAr || ''}`);
      console.log(`   Icon: ${data.icon || 'N/A'}`);
      
      // Check for subcategories
      const subcategoriesRef = collection(db, 'categories', doc.id, 'subcategory');
      const subSnapshot = await getDocs(subcategoriesRef);
      
      if (subSnapshot.size > 0) {
        console.log(`   📂 Subcategories: ${subSnapshot.size}`);
        
        for (const subDoc of subSnapshot.docs) {
          const subData = subDoc.data();
          const subName = subData.name?.en || subData.name?.ar || subData.name || 'Unknown';
          console.log(`      - ${subName} (ID: ${subDoc.id})`);
          
          // Check for nested subcategories within this subcategory
          const nestedSubRef = collection(db, 'categories', doc.id, 'subcategory', subDoc.id, 'subcategory');
          const nestedSnapshot = await getDocs(nestedSubRef);
          
          if (nestedSnapshot.size > 0) {
            console.log(`         └─ Nested subcategories: ${nestedSnapshot.size}`);
            nestedSnapshot.forEach((nestedDoc) => {
              const nestedData = nestedDoc.data();
              const nestedName = nestedData.name?.en || nestedData.name?.ar || nestedData.name || 'Unknown';
              console.log(`            • ${nestedName} (ID: ${nestedDoc.id})`);
            });
          }
        }
      } else {
        console.log(`   📂 Subcategories: 0`);
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Now check products and their categories
    console.log('\n🔍 Checking Products by Category...\n');
    
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    const categoryCounts = {};
    
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      const catId = data.categoryId || 'unknown';
      const catName = data.categoryName || 'Unknown';
      
      if (!categoryCounts[catId]) {
        categoryCounts[catId] = {
          name: catName,
          count: 0
        };
      }
      categoryCounts[catId].count++;
    });
    
    console.log('📊 Products per Category:\n');
    for (const [catId, info] of Object.entries(categoryCounts)) {
      console.log(`   ${info.name}: ${info.count} products (ID: ${catId})`);
    }
    
    console.log('\n✅ Check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkCategories();
