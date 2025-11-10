/**
 * استبدال قيم source باستخدام Firebase Admin SDK
 * 
 * المتطلبات:
 * 1. npm install firebase-admin
 * 2. serviceAccountKey.json في المجلد الرئيسي
 */

const admin = require('firebase-admin');
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ────────────────────────────────────────────────────────
// ⚙️ الإعدادات
// ────────────────────────────────────────────────────────

const REPLACEMENTS = [
  'Spinneys Lebanon',
  'spinneys-lebanon',
  'spinneys',
  'spinneys-beauty-fair',
  'spinneys-advanced',
  // أضف المزيد هنا...
];

const NEW_VALUE = 'Sab Market';

// ────────────────────────────────────────────────────────

async function replaceSourceValues() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔄 استبدال قيم source');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📝 سيتم استبدال القيم التالية:');
    REPLACEMENTS.forEach(val => console.log(`   - "${val}"`));
    console.log(`\n✅ القيمة الجديدة: "${NEW_VALUE}"\n`);
    
    // جلب جميع المنتجات
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    console.log(`📦 إجمالي المنتجات: ${snapshot.size}\n`);
    
    // البحث عن المنتجات التي تحتاج تحديث
    const toUpdate = [];
    const stats = new Map();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.source && REPLACEMENTS.includes(data.source)) {
        toUpdate.push({
          id: doc.id,
          ref: doc.ref,
          oldValue: data.source,
          name: typeof data.name === 'string' ? data.name : (data.name?.en || data.name?.ar || 'Unknown')
        });
        
        stats.set(data.source, (stats.get(data.source) || 0) + 1);
      }
    });
    
    console.log('📊 الإحصائيات:');
    Array.from(stats.entries()).forEach(([value, count]) => {
      console.log(`  "${value}": ${count} منتج`);
    });
    console.log(`\n✅ المجموع: ${toUpdate.length} منتج سيتم تحديثه\n`);
    
    if (toUpdate.length === 0) {
      console.log('✅ لا توجد منتجات تحتاج تحديث!');
      process.exit(0);
    }
    
    // عرض أمثلة
    console.log('═══════════════════════════════════════════════════');
    console.log('📝 أمثلة على المنتجات (أول 5):');
    console.log('═══════════════════════════════════════════════════\n');
    
    toUpdate.slice(0, 5).forEach((item, i) => {
      console.log(`${i + 1}. ${item.name.substring(0, 60)}`);
      console.log(`   القديم: "${item.oldValue}"`);
      console.log(`   الجديد: "${NEW_VALUE}"\n`);
    });
    
    console.log('🚀 بدء التحديث الفعلي...\n');
    
    // Firebase Admin batch محدود بـ 500 عملية
    const batchSize = 500;
    let updatedCount = 0;
    
    for (let i = 0; i < toUpdate.length; i += batchSize) {
      const batch = db.batch();
      const batchItems = toUpdate.slice(i, i + batchSize);
      
      batchItems.forEach(item => {
        batch.update(item.ref, {
          source: NEW_VALUE
        });
      });
      
      await batch.commit();
      updatedCount += batchItems.length;
      
      const progress = ((updatedCount / toUpdate.length) * 100).toFixed(1);
      console.log(`✅ تم تحديث ${updatedCount}/${toUpdate.length} (${progress}%)`);
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 تم الانتهاء بنجاح!');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log(`✅ تم تحديث ${updatedCount} منتج إلى: "${NEW_VALUE}"\n`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

replaceSourceValues();
