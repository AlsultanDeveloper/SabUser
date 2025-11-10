const admin = require('firebase-admin');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkProductsWithoutNames() {
  console.log('🔍 جاري فحص المنتجات بدون أسماء...\n');

  try {
    const snapshot = await db.collection('products').get();
    
    let withoutName = [];
    let withoutNameEn = [];
    let withoutNameAr = [];
    let valid = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (!data.name) {
        withoutName.push({ id: doc.id, price: data.price, source: data.source });
      } else if (!data.name.en) {
        withoutNameEn.push({ id: doc.id, ar: data.name.ar, source: data.source });
      } else if (!data.name.ar) {
        withoutNameAr.push({ id: doc.id, en: data.name.en, source: data.source });
      } else {
        valid++;
      }
    });

    console.log('📊 النتائج:\n');
    console.log(`✅ منتجات صحيحة: ${valid}`);
    console.log(`❌ بدون name object: ${withoutName.length}`);
    console.log(`⚠️  بدون name.en: ${withoutNameEn.length}`);
    console.log(`⚠️  بدون name.ar: ${withoutNameAr.length}`);

    if (withoutName.length > 0) {
      console.log('\n❌ منتجات بدون name object (أول 10):');
      withoutName.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ID: ${item.id}`);
        console.log(`      Price: $${item.price}`);
        console.log(`      Source: ${item.source || 'undefined'}`);
      });
    }

    if (withoutNameEn.length > 0) {
      console.log('\n⚠️  منتجات بدون name.en (أول 10):');
      withoutNameEn.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ID: ${item.id}`);
        console.log(`      AR: ${item.ar}`);
        console.log(`      Source: ${item.source || 'undefined'}`);
      });
    }

    if (withoutNameAr.length > 0) {
      console.log('\n⚠️  منتجات بدون name.ar (أول 10):');
      withoutNameAr.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ID: ${item.id}`);
        console.log(`      EN: ${item.en}`);
        console.log(`      Source: ${item.source || 'undefined'}`);
      });
    }

    // خيار: حذف المنتجات المعطوبة
    if (withoutName.length > 0) {
      console.log('\n\n⚠️  تحذير: وجدت منتجات معطوبة (بدون name)');
      console.log('   لحذفها، قم بتشغيل: node scripts/delete-broken-products.js');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

checkProductsWithoutNames();
