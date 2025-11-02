const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkImages() {
  try {
    console.log('🔍 Checking product images...\n');
    
    const snapshot = await db.collection('products').limit(20).get();
    
    let withImages = 0;
    let withoutImages = 0;
    let emptyImages = 0;
    
    console.log('=== First 20 Products ===\n');
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const image = data.image;
      
      console.log(`ID: ${doc.id}`);
      console.log(`Name: ${data.name?.en || data.name?.ar || 'No name'}`);
      console.log(`Category: ${data.categoryName || 'No category'}`);
      console.log(`Image: ${image || 'NO IMAGE'}`);
      
      if (image && image.trim() !== '') {
        withImages++;
        console.log('✅ Has valid image');
      } else if (image === '') {
        emptyImages++;
        console.log('⚠️ Empty string image');
      } else {
        withoutImages++;
        console.log('❌ No image field');
      }
      
      console.log('---\n');
    });
    
    console.log('\n=== Summary ===');
    console.log(`✅ Products with images: ${withImages}`);
    console.log(`⚠️ Products with empty images: ${emptyImages}`);
    console.log(`❌ Products without image field: ${withoutImages}`);
    console.log(`📦 Total checked: ${snapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkImages();
