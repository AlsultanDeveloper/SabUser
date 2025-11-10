const admin = require('firebase-admin');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkCartProducts() {
  console.log('🔍 فحص المنتجات الموجودة في السلة...\n');

  // المنتجات من الصورة
  const productNames = [
    'Women Olive V-Neck',
    'MALTESERS'
  ];

  for (const name of productNames) {
    console.log(`\n📦 البحث عن: ${name}...`);
    
    const snapshot = await db.collection('products')
      .where('name.en', '>=', name)
      .where('name.en', '<=', name + '\uf8ff')
      .limit(5)
      .get();
    
    if (snapshot.empty) {
      console.log('   ❌ لم يتم العثور على منتج');
      continue;
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   ✅ وجدت: ${data.name.en}`);
      console.log(`      ID: ${doc.id}`);
      console.log(`      Source: ${data.source || 'undefined'}`);
      console.log(`      Vendor: ${data.vendorName || 'undefined'}`);
      console.log(`      Price: $${data.price}`);
    });
  }

  // عرض إحصائيات
  console.log('\n\n📊 إحصائيات عامة:');
  
  const allProducts = await db.collection('products').get();
  const sabMarket = await db.collection('products').where('source', '==', 'sab-market').get();
  const other = await db.collection('products').where('source', '==', 'other').get();
  
  console.log(`   📦 إجمالي المنتجات: ${allProducts.size}`);
  console.log(`   🏪 Sab Market: ${sabMarket.size}`);
  console.log(`   🛍️  Other: ${other.size}`);
  
  // عرض 5 منتجات من "other"
  console.log('\n\n🛍️  أمثلة من منتجات Other:');
  const otherSample = await db.collection('products')
    .where('source', '==', 'other')
    .limit(10)
    .get();
  
  otherSample.forEach((doc, index) => {
    const data = doc.data();
    console.log(`   ${index + 1}. ${data.name.en} - $${data.price}`);
    console.log(`      ID: ${doc.id}`);
  });

  process.exit(0);
}

checkCartProducts().catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
