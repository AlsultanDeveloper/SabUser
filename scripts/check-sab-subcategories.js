const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function checkSubcategories() {
  try {
    console.log('🔍 Checking SAB MARKET subcategories...\n');

    const snapshot = await db
      .collection('subcategories')
      .where('categoryId', '==', 'cwt28D5gjoLno8SFqoxQ')
      .get();

    console.log(`📦 Found ${snapshot.size} subcategories\n`);
    console.log('================================================================================\n');

    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Name (EN): ${typeof data.name === 'object' ? data.name.en : data.name}`);
      console.log(`   Name (AR): ${typeof data.name === 'object' ? data.name.ar : data.name}`);
      console.log('   ---');
    });

    console.log('\n================================================================================');
    console.log('\n✅ Check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSubcategories();
