// 🔧 FIX SOURCE VALUES IN FIREBASE
// تصحيح قيم source في جميع المنتجات
// "Sab Market" → "sab-market"
// "Red Tag Fashion" → "other"

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixSourceValues() {
  console.log('🚀 بدء عملية تصحيح قيم source...\n');

  try {
    // Get all products
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    console.log(`📦 عدد المنتجات الإجمالي: ${snapshot.size}\n`);

    let sabMarketCount = 0;
    let redTagCount = 0;
    let otherSourcesCount = 0;
    let alreadyCorrectCount = 0;
    let noSourceCount = 0;
    
    const updates = [];
    const BATCH_SIZE = 500;

    // Analyze all products first
    snapshot.forEach((doc) => {
      const data = doc.data();
      const currentSource = data.source;

      if (!currentSource) {
        noSourceCount++;
        // Add default source
        updates.push({
          id: doc.id,
          oldSource: 'undefined',
          newSource: 'sab-market'
        });
      } else if (currentSource === 'Sab Market') {
        sabMarketCount++;
        updates.push({
          id: doc.id,
          oldSource: currentSource,
          newSource: 'sab-market'
        });
      } else if (currentSource === 'Red Tag Fashion') {
        redTagCount++;
        updates.push({
          id: doc.id,
          oldSource: currentSource,
          newSource: 'other'
        });
      } else if (currentSource === 'sab-market' || currentSource === 'other') {
        alreadyCorrectCount++;
      } else {
        otherSourcesCount++;
        console.log(`⚠️  قيمة source غير معروفة: "${currentSource}" في المنتج: ${doc.id}`);
      }
    });

    console.log('📊 تحليل القيم الحالية:');
    console.log(`   ✅ صحيحة بالفعل (sab-market أو other): ${alreadyCorrectCount}`);
    console.log(`   🔄 تحتاج تحديث "Sab Market": ${sabMarketCount}`);
    console.log(`   🔄 تحتاج تحديث "Red Tag Fashion": ${redTagCount}`);
    console.log(`   ⚠️  بدون source (سيتم إضافة sab-market): ${noSourceCount}`);
    console.log(`   ⚠️  قيم أخرى غير معروفة: ${otherSourcesCount}`);
    console.log(`   📝 إجمالي التحديثات المطلوبة: ${updates.length}\n`);

    if (updates.length === 0) {
      console.log('✅ جميع المنتجات لديها القيم الصحيحة! لا حاجة لأي تحديثات.');
      return;
    }

    // Perform updates in batches
    console.log('🔧 بدء التحديثات...\n');
    let processedCount = 0;

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchUpdates = updates.slice(i, i + BATCH_SIZE);
      
      batchUpdates.forEach(update => {
        const docRef = productsRef.doc(update.id);
        batch.update(docRef, { source: update.newSource });
      });

      await batch.commit();
      processedCount += batchUpdates.length;
      
      console.log(`   ✅ تم تحديث ${processedCount} من ${updates.length} منتج...`);
    }

    console.log('\n✨ اكتمل التحديث بنجاح!');
    console.log('\n📋 ملخص التحديثات:');
    console.log(`   • ${sabMarketCount + noSourceCount} منتج → "sab-market"`);
    console.log(`   • ${redTagCount} منتج → "other"`);
    console.log(`   • ${alreadyCorrectCount} منتج (بدون تغيير)\n`);

    // Show sample of updated products
    console.log('📝 عينة من المنتجات المحدثة:');
    updates.slice(0, 5).forEach((update, index) => {
      console.log(`   ${index + 1}. ${update.id}: "${update.oldSource}" → "${update.newSource}"`);
    });
    if (updates.length > 5) {
      console.log(`   ... و ${updates.length - 5} منتج آخر\n`);
    }

    // Verify updates
    console.log('🔍 التحقق من التحديثات...');
    const verifySnapshot = await productsRef.get();
    let sabMarketFinal = 0;
    let otherFinal = 0;
    let invalidFinal = 0;

    verifySnapshot.forEach((doc) => {
      const source = doc.data().source;
      if (source === 'sab-market') sabMarketFinal++;
      else if (source === 'other') otherFinal++;
      else invalidFinal++;
    });

    console.log('\n✅ النتيجة النهائية:');
    console.log(`   📊 sab-market: ${sabMarketFinal} منتج`);
    console.log(`   📊 other: ${otherFinal} منتج`);
    if (invalidFinal > 0) {
      console.log(`   ⚠️  قيم غير صحيحة: ${invalidFinal} منتج`);
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    throw error;
  }
}

// Run the script
fixSourceValues()
  .then(() => {
    console.log('\n🎉 تمت العملية بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 فشلت العملية:', error);
    process.exit(1);
  });
