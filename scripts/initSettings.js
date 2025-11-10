/**
 * Initialize Settings Collection
 * Creates the settings/app document with default shipping configuration
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'sab-store-9b947' // Replace with your project ID
  });
}

const db = admin.firestore();

async function initSettings() {
  try {
    console.log('🔧 Initializing settings collection...\n');

    const settingsRef = db.collection('settings').doc('app');

    // Check if settings already exist
    const existingSettings = await settingsRef.get();
    
    if (existingSettings.exists) {
      console.log('⚠️  Settings document already exists!');
      console.log('Current settings:', JSON.stringify(existingSettings.data(), null, 2));
      console.log('\n❓ Do you want to overwrite? (Run with --force flag)');
      
      if (!process.argv.includes('--force')) {
        console.log('\n✋ Aborted. Use --force to overwrite existing settings.');
        process.exit(0);
      }
    }

    // Default settings configuration
    const defaultSettings = {
      shipping: {
        cost: 15, // Default shipping cost in SAR
        freeShippingThreshold: 100, // Free shipping above this amount
        currency: 'SAR',
        enabled: true
      },
      app: {
        version: '1.0.0',
        maintenanceMode: false,
        features: {
          cart: true,
          notifications: true,
          gps: true
        }
      },
      payments: {
        cashOnDelivery: true,
        card: false, // Coming soon
        wallet: false // Coming soon
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Write settings to Firestore
    await settingsRef.set(defaultSettings, { merge: true });

    console.log('\n✅ Settings document created successfully!');
    console.log('\n📋 Settings configuration:');
    console.log(JSON.stringify(defaultSettings, null, 2));
    console.log('\n🔗 View in Firebase Console:');
    console.log('https://console.firebase.google.com/project/sab-store-9b947/firestore/data/settings/app');
    
    console.log('\n✨ Done! The app can now read dynamic settings from Firebase.');
    
  } catch (error) {
    console.error('\n❌ Error initializing settings:', error);
    process.exit(1);
  }
}

// Run the script
console.log('========================================');
console.log('  🚀 Settings Initialization Script');
console.log('========================================\n');

initSettings()
  .then(() => {
    console.log('\n========================================');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
