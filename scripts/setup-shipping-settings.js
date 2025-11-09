// 📦 Setup Shipping Settings in Firebase
// Run once: node scripts/setup-shipping-settings.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function setupShippingSettings() {
  try {
    console.log('📦 Setting up shipping configuration...\n');

    const shippingSettings = {
      // Enable/Disable shipping
      enabled: true,
      
      // Free shipping threshold (in USD/SAR)
      freeShippingThreshold: 100,
      
      // Default shipping cost (fallback)
      defaultCost: 5,
      
      // Currency
      currency: 'USD',
      
      // Store location (Tripoli, Lebanon)
      storeLocation: {
        latitude: 34.4333,
        longitude: 35.8333,
        address: 'Tripoli, Lebanon',
        city: 'Tripoli',
        country: 'Lebanon'
      },
      
      // Shipping tiers based on distance
      tiers: [
        {
          name: 'Same City',
          maxDistance: 5,        // km
          cost: 2,               // USD
          deliveryDays: '1-2',
          description: 'Within 5km from store'
        },
        {
          name: 'Nearby Areas',
          maxDistance: 20,       // km
          cost: 5,               // USD
          deliveryDays: '2-3',
          description: 'Within 20km from store'
        },
        {
          name: 'Same Region',
          maxDistance: 50,       // km
          cost: 8,               // USD
          deliveryDays: '3-4',
          description: 'Within 50km from store'
        },
        {
          name: 'Adjacent Regions',
          maxDistance: 100,      // km
          cost: 10,              // USD
          deliveryDays: '4-5',
          description: 'Within 100km from store'
        },
        {
          name: 'Far Regions',
          maxDistance: 999999,   // km (unlimited)
          cost: 15,              // USD
          deliveryDays: '5-7',
          description: 'Over 100km from store'
        }
      ],
      
      // Express shipping (optional - for future)
      expressShipping: {
        enabled: false,
        additionalCost: 10,
        deliveryDays: '1'
      },
      
      // Metadata
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    };

    // Save to Firestore
    await db.collection('settings').doc('shipping').set(shippingSettings);

    console.log('✅ Shipping settings created successfully!\n');
    console.log('📊 Configuration Summary:');
    console.log('  • Free Shipping Threshold: $' + shippingSettings.freeShippingThreshold);
    console.log('  • Default Shipping Cost: $' + shippingSettings.defaultCost);
    console.log('  • Store Location: ' + shippingSettings.storeLocation.address);
    console.log('  • Number of Tiers: ' + shippingSettings.tiers.length);
    console.log('\n📋 Shipping Tiers:');
    shippingSettings.tiers.forEach((tier, index) => {
      console.log(`  ${index + 1}. ${tier.name}: $${tier.cost} (${tier.deliveryDays} days) - ${tier.description}`);
    });
    console.log('\n🎉 Setup complete! You can now use dynamic shipping in your app.');
    console.log('📝 To modify settings, go to Firebase Console → Firestore → settings/shipping\n');

  } catch (error) {
    console.error('❌ Error setting up shipping:', error);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupShippingSettings();
