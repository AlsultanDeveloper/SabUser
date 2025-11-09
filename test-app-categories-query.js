const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

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

async function testCategoriesQuery() {
  try {
    console.log('\n🔍 Testing categories query (same as app uses)...\n');
    
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`✅ Found ${querySnapshot.size} categories\n`);
    
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`${data.order}. ${data.nameEn || data.name} (${data.nameAr})`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Has image: ${data.image ? '✅' : '❌'}`);
      console.log(`   Active: ${data.isActive !== false ? '✅' : '❌'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nThis is the same error the app would see!');
  }
  
  process.exit(0);
}

testCategoriesQuery();
