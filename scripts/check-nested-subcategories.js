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

async function checkNestedSubcategories() {
  try {
    console.log('\n🔍 Checking nested subcategories structure...\n');
    
    // Fashion category ID
    const fashionCategoryId = 'GXakfwzrVqoStlGav7gR';
    // Women's Clothing subcategory ID
    const womenClothingSubcategoryId = 'n9rHBLpKCuUmKdk3JVZs';
    
    const nestedSubcategoriesRef = collection(
      db, 
      'categories', 
      fashionCategoryId, 
      'subcategory', 
      womenClothingSubcategoryId, 
      'subcategory'
    );
    
    const snapshot = await getDocs(nestedSubcategoriesRef);
    
    console.log(`Found ${snapshot.size} nested subcategories\n`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n📁 ${data.name || data.title || 'Unnamed'} (${doc.id})`);
      console.log('   Fields:', Object.keys(data).join(', '));
      console.log('   Full data:', JSON.stringify(data, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkNestedSubcategories();
