/**
 * Script to add 'source' field to all existing products in Firebase
 * Run: node scripts/add-source-to-products.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Try to find serviceAccountKey
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n❌ Service Account Key not found!');
  console.error('📝 To run this script, you need Firebase Admin credentials.');
  console.error('\n⚠️  Alternative: Use Firebase Console to manually add source field');
  console.error('   Or update products through the app/admin panel\n');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function addSourceToProducts() {
  try {
    console.log('🔄 Starting to update products...');
    
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No products found in database');
      return;
    }
    
    console.log(`📦 Found ${snapshot.size} products`);
    
    const batch = db.batch();
    let updatedCount = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only update if 'source' field doesn't exist
      if (!data.source) {
        batch.update(doc.ref, {
          source: 'sab-market', // Default to sab-market for all existing products
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updatedCount} products with source: 'sab-market'`);
    } else {
      console.log('ℹ️ All products already have source field');
    }
    
    console.log('✨ Done!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
}

// Run the script
addSourceToProducts();
