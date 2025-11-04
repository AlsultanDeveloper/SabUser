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

async function checkAllCategories() {
  try {
    console.log('\n🔍 Checking all categories and subcategories...\n');
    
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryData = categoryDoc.data();
      console.log(`\n📁 ${categoryData.nameEn || categoryData.name} (${categoryDoc.id})`);
      console.log(`   Arabic: ${categoryData.nameAr || categoryData.name}`);
      
      // Get subcategories
      const subcategoriesRef = collection(db, 'categories', categoryDoc.id, 'subcategory');
      const subcategoriesSnapshot = await getDocs(subcategoriesRef);
      
      if (subcategoriesSnapshot.size > 0) {
        console.log(`   Subcategories (${subcategoriesSnapshot.size}):`);
        
        for (const subDoc of subcategoriesSnapshot.docs) {
          const subData = subDoc.data();
          console.log(`   ├─ ${subData.nameEn || subData.name} (${subDoc.id})`);
          console.log(`   │  Arabic: ${subData.nameAr || subData.name}`);
          
          // Check for nested subcategories
          const nestedRef = collection(db, 'categories', categoryDoc.id, 'subcategory', subDoc.id, 'subcategory');
          const nestedSnapshot = await getDocs(nestedRef);
          
          if (nestedSnapshot.size > 0) {
            console.log(`   │  Nested (${nestedSnapshot.size}):`);
            nestedSnapshot.forEach(nestedDoc => {
              const nestedData = nestedDoc.data();
              console.log(`   │  └─ ${nestedData.nameEn || nestedData.name} (${nestedDoc.id})`);
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkAllCategories();
