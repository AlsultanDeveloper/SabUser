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

async function verifyKidsCategory() {
  try {
    console.log('\n🔍 Checking all categories...\n');
    
    // Try without ordering first
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    console.log(`Found ${snapshot.size} categories total:\n`);
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`📦 ${data.nameEn || data.name} (${data.nameAr})`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Order: ${data.order || 'N/A'}`);
      console.log(`   Image: ${data.image || 'N/A'}`);
      console.log(`   Active: ${data.isActive !== false ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Now try with ordering
    console.log('\n📊 Trying with order query...\n');
    try {
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const orderedSnapshot = await getDocs(q);
      
      console.log('✅ Order query successful!\n');
      orderedSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`${data.order}. ${data.nameEn || data.name} (${data.nameAr})`);
      });
    } catch (orderError) {
      console.error('❌ Order query failed:', orderError.message);
      console.log('\n⚠️  You may need to create a Firestore index.');
      console.log('The app might not be showing categories in the correct order.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

verifyKidsCategory();
