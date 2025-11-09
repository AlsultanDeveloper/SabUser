// Quick check of product images in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA8j0tpYB5Y8cKh7xINKkNh27x6s7cEDmw",
  authDomain: "sab-store-9b947.firebaseapp.com",
  projectId: "sab-store-9b947",
  storageBucket: "sab-store-9b947.firebasestorage.app",
  messagingSenderId: "622346734640",
  appId: "1:622346734640:web:d2dd47e8b9c5b04c3d5b5d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkImages() {
  console.log('\n🔍 Checking product images in Firebase...\n');
  
  const productsRef = collection(db, 'products');
  const q = query(productsRef, limit(10));
  const snapshot = await getDocs(q);
  
  let count = 0;
  let withImages = 0;
  let withoutImages = 0;
  
  snapshot.forEach((doc) => {
    count++;
    const data = doc.data();
    
    console.log(`\n📦 Product #${count}:`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   Name: ${typeof data.name === 'object' ? (data.name.en || data.name.ar) : data.name}`);
    console.log(`   image: "${data.image}"`);
    console.log(`   images: ${JSON.stringify(data.images)}`);
    console.log(`   imageUrl: "${data.imageUrl}"`);
    console.log(`   mainImage: "${data.mainImage}"`);
    
    const hasValidImage = (data.image && data.image.trim()) || 
                          (data.images && data.images.length > 0 && data.images[0] && data.images[0].trim()) ||
                          (data.imageUrl && data.imageUrl.trim()) ||
                          (data.mainImage && data.mainImage.trim());
    
    if (hasValidImage) {
      console.log(`   ✅ HAS VALID IMAGE`);
      withImages++;
    } else {
      console.log(`   ❌ NO VALID IMAGE`);
      withoutImages++;
    }
  });
  
  console.log(`\n\n📊 Summary:`);
  console.log(`   Total checked: ${count}`);
  console.log(`   ✅ With valid images: ${withImages}`);
  console.log(`   ❌ Without valid images: ${withoutImages}`);
  
  process.exit(0);
}

checkImages().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
