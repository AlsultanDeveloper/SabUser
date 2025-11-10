/**
 * 🔧 استعادة أسماء المنتجات من nameAr و nameEn الأصلية
 * 
 * المشكلة: تم استبدال name.en و name.ar بـ "Product" و "منتج"
 * الحل: استعادة من الحقول الأصلية nameAr و nameEn
 */

const admin = require('firebase-admin');
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function restoreProductNames() {
  console.log('🔧 جاري استعادة أسماء المنتجات...\n');

  try {
    // جلب المنتجات المتضررة فقط
    const snapshot = await db.collection('products')
      .where('name.en', '==', 'Product')
      .get();
    
    console.log(`📦 وجدت ${snapshot.size} منتج متضرر\n`);
    
    let restored = 0;
    let failed = 0;
    let noOriginalName = 0;
    const batchSize = 500;
    let batch = db.batch();
    let operationCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docRef = db.collection('products').doc(doc.id);

      // محاولة استعادة من nameAr و nameEn
      const originalAr = data.nameAr || data.name?.ar || '';
      const originalEn = data.nameEn || data.name?.en || '';

      // إذا وجدنا الاسم الأصلي
      if (originalAr || originalEn) {
        const restoredName = {
          ar: originalAr || originalEn || 'منتج',
          en: originalEn || originalAr || 'Product'
        };
        
        batch.update(docRef, { name: restoredName });
        restored++;
        operationCount++;
        
        if (restored <= 5) {
          console.log(`✅ استعادة: ${doc.id}`);
          console.log(`   من: {"en":"Product","ar":"منتج"}`);
          console.log(`   إلى: ${JSON.stringify(restoredName)}\n`);
        }
      } else {
        // لا يوجد اسم أصلي - احتفظ بـ "Product"
        noOriginalName++;
        
        if (noOriginalName <= 3) {
          console.log(`⚠️  لا يوجد اسم أصلي: ${doc.id} (Brand: ${data.brand || 'N/A'})`);
        }
      }

      // تنفيذ الدفعة عند الوصول للحد
      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`   💾 تم حفظ ${operationCount} منتج... (إجمالي: ${restored})`);
        batch = db.batch();
        operationCount = 0;
      }
    }

    // تنفيذ الدفعة الأخيرة
    if (operationCount > 0) {
      await batch.commit();
      console.log(`   💾 تم حفظ ${operationCount} منتج... (إجمالي: ${restored})`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✨ اكتملت الاستعادة!\n');
    console.log('📊 الملخص:');
    console.log(`   ✅ تم استعادة: ${restored} منتج`);
    console.log(`   ⚠️  بدون اسم أصلي: ${noOriginalName} منتج`);
    console.log(`   ❌ فشل: ${failed} منتج`);
    console.log('═══════════════════════════════════════════════════\n');

    // التحقق النهائي
    console.log('🔍 التحقق من النتائج...\n');
    const stillBroken = await db.collection('products')
      .where('name.en', '==', 'Product')
      .get();

    console.log(`📊 المنتجات المتبقية بـ "Product": ${stillBroken.size}`);
    
    if (stillBroken.size === 0) {
      console.log('🎉 تم استعادة جميع الأسماء بنجاح!');
    } else {
      console.log(`   (هذه المنتجات لم يكن لها اسم أصلي في Firebase)`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

restoreProductNames();
