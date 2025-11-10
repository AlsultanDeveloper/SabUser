/**
 * 🔧 إصلاح نهائي: نسخ nameAr إلى name.en للمنتجات المتبقية
 */

const admin = require('firebase-admin');
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function finalFix() {
  console.log('🔧 الإصلاح النهائي...\n');

  try {
    const snapshot = await db.collection('products')
      .where('name.en', '==', 'Product')
      .get();
    
    console.log(`📦 وجدت ${snapshot.size} منتج متبقي\n`);
    
    let fixed = 0;
    const batchSize = 500;
    let batch = db.batch();
    let operationCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docRef = db.collection('products').doc(doc.id);

      // نسخ nameAr إلى name.en
      if (data.nameAr && data.nameAr !== 'منتج') {
        const fixedName = {
          ar: data.nameAr,
          en: data.nameAr // نسخ الاسم العربي للإنجليزي
        };
        
        batch.update(docRef, { name: fixedName });
        fixed++;
        operationCount++;
        
        if (fixed <= 5) {
          console.log(`✅ إصلاح: ${doc.id}`);
          console.log(`   الاسم: ${data.nameAr}\n`);
        }
      }

      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`   💾 تم حفظ ${operationCount} منتج... (إجمالي: ${fixed})`);
        batch = db.batch();
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
      console.log(`   💾 تم حفظ ${operationCount} منتج... (إجمالي: ${fixed})`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✅ تم إصلاح ${fixed} منتج`);
    console.log('═══════════════════════════════════════════════════\n');

    // التحقق النهائي
    const stillBroken = await db.collection('products')
      .where('name.en', '==', 'Product')
      .get();

    console.log(`📊 المنتجات المتبقية بـ "Product": ${stillBroken.size}`);
    
    if (stillBroken.size === 0) {
      console.log('🎉🎉🎉 تم إصلاح جميع المنتجات بنجاح! 🎉🎉🎉');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

finalFix();
