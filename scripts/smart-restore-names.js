/**
 * 🔧 استخراج أسماء من description أو ID للمنتجات بدون أسماء
 */

const admin = require('firebase-admin');
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// دالة لاستخراج اسم من description
function extractNameFromDescription(desc) {
  if (!desc) return null;
  
  // أخذ أول جملة (حتى نقطة أو 50 حرف)
  const firstSentence = desc.split(/[.\n]/)[0].trim();
  if (firstSentence.length > 3 && firstSentence.length < 100) {
    return firstSentence;
  }
  
  return null;
}

// دالة لتنظيف ID وتحويله لاسم
function extractNameFromId(id) {
  if (!id) return null;
  
  // إزالة البادئة (redtag-, max-fashion-, إلخ)
  let name = id.replace(/^(redtag|max-fashion|spinneys|waitrose|carrefour|other)-/i, '');
  
  // استبدال الشرطات بمسافات
  name = name.replace(/-/g, ' ');
  
  // تكبير أول حرف من كل كلمة
  name = name.split(' ').map(word => {
    if (word.match(/^\d+$/)) return word; // أرقام فقط
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
  
  // إزالة الأرقام من النهاية
  name = name.replace(/\s+\d+$/, '');
  
  if (name.length > 3 && name.length < 150) {
    return name;
  }
  
  return null;
}

async function smartRestore() {
  console.log('🔧 استخراج أسماء ذكي...\n');

  try {
    const snapshot = await db.collection('products')
      .where('name.en', '==', 'Product')
      .get();
    
    console.log(`📦 وجدت ${snapshot.size} منتج متبقي\n`);
    
    let fromDesc = 0;
    let fromId = 0;
    let failed = 0;
    const batchSize = 500;
    let batch = db.batch();
    let operationCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const docRef = db.collection('products').doc(doc.id);

      let extractedName = null;
      let source = '';

      // 1. محاولة من description
      if (data.description) {
        extractedName = extractNameFromDescription(data.description);
        if (extractedName) source = 'description';
      }

      // 2. إذا فشل، من ID
      if (!extractedName) {
        extractedName = extractNameFromId(doc.id);
        if (extractedName) source = 'id';
      }

      if (extractedName) {
        const newName = {
          ar: extractedName,
          en: extractedName
        };
        
        batch.update(docRef, { name: newName });
        operationCount++;
        
        if (source === 'description') fromDesc++;
        else fromId++;
        
        if ((fromDesc + fromId) <= 10) {
          console.log(`✅ [${source}] ${doc.id}`);
          console.log(`   → ${extractedName}\n`);
        }
      } else {
        failed++;
        if (failed <= 3) {
          console.log(`⚠️  فشل: ${doc.id}`);
        }
      }

      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`   💾 تم حفظ ${operationCount} منتج...`);
        batch = db.batch();
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
      console.log(`   💾 تم حفظ ${operationCount} منتج...`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 الملخص:');
    console.log(`   ✅ من description: ${fromDesc}`);
    console.log(`   ✅ من ID: ${fromId}`);
    console.log(`   ❌ فشل: ${failed}`);
    console.log(`   📝 إجمالي: ${fromDesc + fromId}`);
    console.log('═══════════════════════════════════════════════════\n');

    // التحقق النهائي
    const stillBroken = await db.collection('products')
      .where('name.en', '==', 'Product')
      .get();

    console.log(`📊 المنتجات المتبقية بـ "Product": ${stillBroken.size}\n`);

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

smartRestore();
