const admin = require('firebase-admin');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function fixOtherVendors() {
  console.log('🔍 جاري مسح المنتجات من البائعين الآخرين...\n');

  try {
    // جلب جميع المنتجات
    const snapshot = await db.collection('products').get();
    
    let needsUpdate = [];
    let vendorCounts = {};
    
    // تحليل البيانات الحالية
    snapshot.forEach(doc => {
      const data = doc.data();
      const source = data.source;
      
      // فقط البائعين غير المعروفين
      if (source && source !== 'sab-market' && source !== 'other') {
        if (!vendorCounts[source]) {
          vendorCounts[source] = 0;
        }
        vendorCounts[source]++;
        needsUpdate.push({ id: doc.id, currentSource: source });
      }
    });

    // عرض الإحصائيات
    console.log('📊 البائعون الذين يحتاجون تحديث:');
    for (const [vendor, count] of Object.entries(vendorCounts)) {
      console.log(`   • ${vendor}: ${count} منتج`);
    }
    console.log(`\n📝 إجمالي المنتجات التي تحتاج تحديث: ${needsUpdate.length}\n`);

    if (needsUpdate.length === 0) {
      console.log('✅ جميع المنتجات محدثة بالفعل!');
      return;
    }

    console.log('🔧 بدء تحديث البائعين إلى "other"...\n');

    // تحديث على دفعات
    const batchSize = 500;
    let updated = 0;
    
    for (let i = 0; i < needsUpdate.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = needsUpdate.slice(i, i + batchSize);
      
      currentBatch.forEach(item => {
        const docRef = db.collection('products').doc(item.id);
        batch.update(docRef, { 
          source: 'other'
        });
      });
      
      await batch.commit();
      updated += currentBatch.length;
      console.log(`   ✅ تم تحديث ${updated} من ${needsUpdate.length} منتج...`);
    }

    console.log('\n✨ اكتمل التحديث بنجاح!\n');

    // عينة من المنتجات المحدثة
    console.log('📝 عينة من المنتجات المحدثة:');
    needsUpdate.slice(0, 10).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.id}: "${item.currentSource}" → "other"`);
    });
    if (needsUpdate.length > 10) {
      console.log(`   ... و ${needsUpdate.length - 10} منتج آخر`);
    }

    // التحقق النهائي
    console.log('\n🔍 التحقق من النتائج النهائية...\n');
    const finalSnapshot = await db.collection('products').get();
    
    let finalCounts = {
      'sab-market': 0,
      'other': 0,
      'undefined': 0,
      'incorrect': 0
    };
    
    let incorrectExamples = [];
    
    finalSnapshot.forEach(doc => {
      const source = doc.data().source;
      if (source === 'sab-market') {
        finalCounts['sab-market']++;
      } else if (source === 'other') {
        finalCounts['other']++;
      } else if (!source || source === undefined) {
        finalCounts['undefined']++;
      } else {
        finalCounts['incorrect']++;
        if (incorrectExamples.length < 5) {
          incorrectExamples.push({ id: doc.id, source });
        }
      }
    });

    console.log('✅ النتيجة النهائية:');
    console.log(`   📊 sab-market: ${finalCounts['sab-market']} منتج`);
    console.log(`   📊 other: ${finalCounts['other']} منتج`);
    console.log(`   ⚠️  بدون source: ${finalCounts['undefined']} منتج`);
    console.log(`   ❌ قيم غير صحيحة: ${finalCounts['incorrect']} منتج`);

    if (incorrectExamples.length > 0) {
      console.log('\n⚠️  أمثلة على القيم غير الصحيحة المتبقية:');
      incorrectExamples.forEach(item => {
        console.log(`   • ${item.id}: "${item.source}"`);
      });
    }

    console.log('\n🎉 تمت العملية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ:', error);
    throw error;
  }
}

// تشغيل السكريبت
fixOtherVendors()
  .then(() => {
    console.log('\n✅ انتهى السكريبت بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ فشل السكريبت:', error);
    process.exit(1);
  });
