const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// SAB MARKET Category ID
const SAB_MARKET_CATEGORY_ID = 'cwt28D5gjoLno8SFqoxQ';

// Subcategories to create
const subcategories = [
  {
    name: {
      en: 'Fruits & Vegetables',
      ar: 'فواكه وخضروات'
    },
    categoryId: SAB_MARKET_CATEGORY_ID,
    image: '🥬',
    color: '#10B981',
    order: 1,
    isActive: true,
  },
  {
    name: {
      en: 'Kitchen Pantry',
      ar: 'مخزن المطبخ'
    },
    categoryId: SAB_MARKET_CATEGORY_ID,
    image: '🍝',
    color: '#F59E0B',
    order: 2,
    isActive: true,
  },
  {
    name: {
      en: 'Bakery',
      ar: 'مخبوزات'
    },
    categoryId: SAB_MARKET_CATEGORY_ID,
    image: '🥐',
    color: '#D97706',
    order: 3,
    isActive: true,
  },
  {
    name: {
      en: 'Deli Dairy & Eggs',
      ar: 'ألبان وبيض'
    },
    categoryId: SAB_MARKET_CATEGORY_ID,
    image: '🥛',
    color: '#3B82F6',
    order: 4,
    isActive: true,
  },
  {
    name: {
      en: 'Snacks & Candy',
      ar: 'وجبات خفيفة وحلويات'
    },
    categoryId: SAB_MARKET_CATEGORY_ID,
    image: '🍭',
    color: '#EC4899',
    order: 5,
    isActive: true,
  },
  {
    name: {
      en: 'Beverages',
      ar: 'مشروبات'
    },
    categoryId: SAB_MARKET_CATEGORY_ID,
    image: '🧃',
    color: '#8B5CF6',
    order: 6,
    isActive: true,
  },
  {
    name: {
      en: 'Cleaning & Household',
      ar: 'تنظيف ومنزل'
    },
    categoryId: SAB_MARKET_CATEGORY_ID,
    image: '🧹',
    color: '#10B981',
    order: 7,
    isActive: true,
  },
];

async function createSubcategories() {
  try {
    console.log('🚀 Creating SAB MARKET subcategories...\n');

    // Check if subcategories already exist
    const existingSnapshot = await db
      .collection('subcategories')
      .where('categoryId', '==', SAB_MARKET_CATEGORY_ID)
      .get();

    if (existingSnapshot.size > 0) {
      console.log(`⚠️  Found ${existingSnapshot.size} existing subcategories. Deleting them first...\n`);
      const batch = db.batch();
      existingSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Deleted existing subcategories\n');
    }

    console.log('📝 Creating new subcategories...\n');

    let count = 0;
    for (const subcategory of subcategories) {
      const docRef = await db.collection('subcategories').add({
        ...subcategory,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`${++count}. Created: ${subcategory.name.en} (ID: ${docRef.id})`);
      console.log(`   Arabic: ${subcategory.name.ar}`);
      console.log(`   Products with this name: Will be fetched using subcategoryName`);
      console.log('');
    }

    console.log('================================================================================');
    console.log(`✅ Successfully created ${count} subcategories!`);
    console.log('\n📊 Summary:');
    console.log('   - Fruits & Vegetables: ~249 products');
    console.log('   - Kitchen Pantry: ~808 products');
    console.log('   - Bakery: ~46 products');
    console.log('   - Deli Dairy & Eggs: ~15 products');
    console.log('   - Snacks & Candy: ~314 products');
    console.log('   - Beverages: ~4 products');
    console.log('   - Cleaning & Household: ~758 products');
    console.log('   Total: ~2,194 products');
    console.log('================================================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSubcategories();
