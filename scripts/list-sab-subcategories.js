const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function listSubcategories() {
  try {
    console.log('🔍 Listing all subcategories for SAB MARKET...\n');

    // The subcategories are stored as a subcollection under categories/{categoryId}/subcategory
    const snapshot = await db
      .collection('categories')
      .doc('cwt28D5gjoLno8SFqoxQ')
      .collection('subcategory')
      .get();

    console.log(`📦 Found ${snapshot.size} subcategories\n`);

    if (snapshot.size > 0) {
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));
        console.log('   ---\n');
      });
    }

    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listSubcategories();
