const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkFashionProducts() {
  console.log('\n🔍 Checking Fashion Products Structure...\n');
  
  try {
    const productsRef = collection(db, 'products');
    const fashionQuery = query(productsRef, where('categoryId', '==', 'GXakfwzrVqoStlGav7gR'));
    const snapshot = await getDocs(fashionQuery);
    
    console.log(`📊 Total Fashion products: ${snapshot.size}\n`);
    
    if (snapshot.size > 0) {
      // Check first 5 products to see their structure
      let count = 0;
      const subcategoryMap = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Count by subcategoryId
        const subId = data.subcategoryId || 'NO_SUBCATEGORY_ID';
        if (!subcategoryMap[subId]) {
          subcategoryMap[subId] = {
            count: 0,
            subcategoryName: data.subcategoryName || data.subcategory || 'Unknown',
            examples: []
          };
        }
        subcategoryMap[subId].count++;
        
        if (subcategoryMap[subId].examples.length < 2) {
          subcategoryMap[subId].examples.push({
            id: doc.id,
            name: data.name?.en || data.nameEn || data.name || 'No name'
          });
        }
        
        // Show first 3 products in detail
        if (count < 3) {
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`Product ${count + 1}: ${doc.id}`);
          console.log(`  Name: ${data.name?.en || data.nameEn || data.name || 'No name'}`);
          console.log(`  CategoryId: ${data.categoryId || 'N/A'}`);
          console.log(`  SubcategoryId: ${data.subcategoryId || 'N/A'}`);
          console.log(`  SubcategoryName: ${data.subcategoryName || data.subcategory || 'N/A'}`);
          console.log(`  Gender: ${data.gender || 'N/A'}`);
          console.log(`  AgeRange: ${data.ageRange || 'N/A'}`);
        }
        count++;
      });
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      console.log(`📊 Products by SubcategoryId:\n`);
      
      for (const [subId, info] of Object.entries(subcategoryMap)) {
        console.log(`${subId}:`);
        console.log(`  Name: ${info.subcategoryName}`);
        console.log(`  Count: ${info.count} products`);
        console.log(`  Examples:`);
        info.examples.forEach(ex => {
          console.log(`    - ${ex.name} (${ex.id})`);
        });
        console.log();
      }
    }
    
    console.log('\n✅ Check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkFashionProducts();
