require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * تحويل source الحالي إلى نظام dual cart
 * 
 * المنطق:
 * - إذا source موجود بالفعل → source = "other", vendorName = القيمة القديمة
 * - إذا source غير موجود → source = "sab-market"
 */

async function convertSourceField() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔄 تحويل حقل source للنظام الجديد');
    console.log('═══════════════════════════════════════════════════\n');
    
    // جلب جميع المنتجات
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 إجمالي المنتجات: ${snapshot.size}\n`);
    
    let stats = {
      total: snapshot.size,
      alreadyOther: 0,      // كانت بها source → ستصبح other
      noSource: 0,           // بدون source → ستصبح sab-market
      skipped: 0             // تم تخطيها
    };
    
    const updates = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.source) {
        // لديها source بالفعل
        if (data.source === 'sab-market' || data.source === 'other') {
          // جاهزة بالفعل
          stats.skipped++;
        } else {
          // تحويل إلى other
          updates.push({
            ref: doc.ref,
            data: {
              source: 'other',
              vendorName: data.source  // استخدام القيمة القديمة كاسم البائع
            }
          });
          stats.alreadyOther++;
        }
      } else {
        // بدون source → sab-market
        updates.push({
          ref: doc.ref,
          data: {
            source: 'sab-market'
          }
        });
        stats.noSource++;
      }
    });
    
    console.log('📊 الإحصائيات:');
    console.log(`  ✅ سيتم تحويلها إلى other: ${stats.alreadyOther}`);
    console.log(`  ✅ سيتم تحويلها إلى sab-market: ${stats.noSource}`);
    console.log(`  ⏭️  جاهزة بالفعل: ${stats.skipped}\n`);
    
    if (updates.length === 0) {
      console.log('✅ جميع المنتجات جاهزة بالفعل!');
      process.exit(0);
    }
    
    console.log(`🔄 سيتم تحديث ${updates.length} منتج...\n`);
    console.log('⚠️  هذه عملية لا يمكن التراجع عنها!');
    console.log('💡 تأكد من عمل backup للـ database قبل المتابعة.\n');
    
    // ────────────────────────────────────────────────────────
    // ⚠️  للتشغيل الفعلي: احذف التعليق من الكود التالي
    // ────────────────────────────────────────────────────────
    
    console.log('🔒 الوضع: DRY RUN (تجريبي فقط)');
    console.log('💡 لتنفيذ التحديث الفعلي، احذف التعليق من السطر المطلوب في الكود\n');
    
    // عرض أمثلة على التحديثات
    console.log('═══════════════════════════════════════════════════');
    console.log('📝 أمثلة على التحديثات (أول 10):');
    console.log('═══════════════════════════════════════════════════\n');
    
    updates.slice(0, 10).forEach((update, i) => {
      console.log(`${i + 1}. ${update.data.source === 'other' ? '🛍️' : '🏪'} ${update.data.source}`);
      if (update.data.vendorName) {
        console.log(`   vendorName: ${update.data.vendorName}`);
      }
      console.log('');
    });
    
    /*
    // ────────────────────────────────────────────────────────
    // ✅ للتنفيذ الفعلي: احذف علامات التعليق من هنا...
    // ────────────────────────────────────────────────────────
    
    console.log('🚀 بدء التحديث الفعلي...\n');
    
    // Firebase batch محدود بـ 500 عملية
    const batchSize = 500;
    let updatedCount = 0;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchUpdates = updates.slice(i, i + batchSize);
      
      batchUpdates.forEach(update => {
        batch.update(update.ref, update.data);
      });
      
      await batch.commit();
      updatedCount += batchUpdates.length;
      
      console.log(`✅ تم تحديث ${updatedCount}/${updates.length} منتج...`);
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 تم الانتهاء بنجاح!');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('النتيجة النهائية:');
    console.log(`  🛍️  منتجات Other: ${stats.alreadyOther}`);
    console.log(`  🏪 منتجات Sab Market: ${stats.noSource}`);
    console.log(`  ⏭️  كانت جاهزة: ${stats.skipped}\n`);
    
    // ...إلى هنا
    // ────────────────────────────────────────────────────────
    */
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

convertSourceField();
