const admin = require('firebase-admin');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function fixBrokenProducts() {
  console.log('🔧 جاري إصلاح المنتجات المعطوبة...\n');

  try {
    const snapshot = await db.collection('products').get();
    
    let fixed = 0;
    let deleted = 0;
    const batchSize = 500;
    let batch = db.batch();
    let operationCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docRef = db.collection('products').doc(doc.id);

      // حالة 1: بدون name object نهائياً - احذف المنتج
      if (!data.name) {
        batch.delete(docRef);
        deleted++;
        operationCount++;
      }
      // حالة 2: name موجود لكن بدون en - أضف placeholder
      else if (!data.name.en) {
        const newName = {
          en: data.name.ar || 'Product',
          ar: data.name.ar || 'منتج'
        };
        batch.update(docRef, { name: newName });
        fixed++;
        operationCount++;
      }
      // حالة 3: name موجود لكن بدون ar - أضف placeholder
      else if (!data.name.ar) {
        const newName = {
          en: data.name.en,
          ar: data.name.en || 'منتج'
        };
        batch.update(docRef, { name: newName });
        fixed++;
        operationCount++;
      }

      // تنفيذ الدفعة عند الوصول للحد
      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`   ✅ تم معالجة ${operationCount} منتج...`);
        batch = db.batch();
        operationCount = 0;
      }
    }

    // تنفيذ الدفعة الأخيرة
    if (operationCount > 0) {
      await batch.commit();
      console.log(`   ✅ تم معالجة ${operationCount} منتج...`);
    }

    console.log('\n✨ اكتمل الإصلاح!\n');
    console.log('📊 الملخص:');
    console.log(`   ✅ تم إصلاح: ${fixed} منتج`);
    console.log(`   🗑️  تم حذف: ${deleted} منتج (بدون name)`);
    console.log(`   📝 إجمالي: ${fixed + deleted} عملية\n`);

    // التحقق النهائي
    console.log('🔍 التحقق من النتائج...\n');
    const finalSnapshot = await db.collection('products').get();
    
    let stillBroken = 0;
    finalSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.name || !data.name.en || !data.name.ar) {
        stillBroken++;
      }
    });

    if (stillBroken === 0) {
      console.log('🎉 جميع المنتجات الآن صحيحة!');
    } else {
      console.log(`⚠️  ما زال هناك ${stillBroken} منتج معطوب`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

fixBrokenProducts();
