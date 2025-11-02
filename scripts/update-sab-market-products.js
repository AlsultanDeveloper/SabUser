// update-sab-market-products.js
// سكريبت لتعديل جميع منتجات Sab Market

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// تهيئة Firebase Admin SDK
let db;

try {
  // محاولة تحميل service account key
  const serviceAccountPath = path.join(process.cwd(), 'scripts', 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ تم تهيئة Firebase Admin SDK بنجاح\n');
  } else {
    console.error('❌ ملف serviceAccountKey.json غير موجود');
    console.error('📋 يرجى تحميل Service Account Key من Firebase Console:');
    console.error('   1. اذهب إلى Firebase Console');
    console.error('   2. Project Settings > Service accounts');
    console.error('   3. Generate new private key');
    console.error('   4. احفظ الملف في: scripts/serviceAccountKey.json\n');
    process.exit(1);
  }
  
  db = admin.firestore();
} catch (error) {
  console.error('❌ خطأ في تهيئة Firebase:', error.message);
  process.exit(1);
}

// معرف فئة Sab Market
const SAB_MARKET_CATEGORY_ID = 'cwt28D5gjoLno8SFqoxQ';

/**
 * تعديل جميع منتجات Sab Market
 */
async function updateSabMarketProducts() {
  try {
    console.log('🚀 بدء تعديل منتجات Sab Market...\n');
    
    // 1. جلب جميع الفئات الفرعية لـ Sab Market
    console.log('📦 جاري جلب الفئات الفرعية...');
    const subcategoriesSnapshot = await db
      .collection('categories')
      .doc(SAB_MARKET_CATEGORY_ID)
      .collection('subcategory')
      .get();
    
    console.log(`✅ تم العثور على ${subcategoriesSnapshot.size} فئة فرعية\n`);
    
    // بناء خريطة الفئات الفرعية
    const subcategoryMap = new Map();
    const subcategoryList = [];
    
    subcategoriesSnapshot.forEach(doc => {
      const data = doc.data();
      const subId = doc.id;
      
      // حفظ معلومات الفئة الفرعية
      const subInfo = {
        id: subId,
        nameEn: data.subcategoryEn || data.subcategoryName || data.name?.en || '',
        nameAr: data.subcategoryAr || data.subcategoryNameAr || data.name?.ar || '',
        name: data.name || {}
      };
      
      subcategoryList.push(subInfo);
      
      // حفظ في الخريطة بكل الأسماء المحتملة
      const names = [
        data.subcategoryEn,
        data.subcategoryAr,
        data.subcategoryName,
        data.subcategoryNameAr,
        data.subcategory,
        data.name?.en,
        data.name?.ar
      ].filter(Boolean);
      
      names.forEach(name => {
        subcategoryMap.set(name, subId);
      });
      
      console.log(`   └─ ${subInfo.nameAr} (${subInfo.nameEn})`);
      console.log(`      ID: ${subId}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    // 2. جلب جميع منتجات Sab Market
    console.log('\n📦 جاري جلب منتجات Sab Market...');
    const productsSnapshot = await db
      .collection('products')
      .where('categoryId', '==', SAB_MARKET_CATEGORY_ID)
      .get();
    
    console.log(`✅ تم العثور على ${productsSnapshot.size} منتج\n`);
    console.log('='.repeat(60));
    
    if (productsSnapshot.size === 0) {
      console.log('\n⚠️  لا توجد منتجات في هذه الفئة');
      return;
    }
    
    // 3. تحليل المنتجات
    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    let fixedCount = 0;
    let errorCount = 0;
    
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    const issues = [];
    
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      const productId = doc.id;
      
      // التحقق من البيانات الحالية
      const currentSubcategoryId = data.subcategoryId;
      const currentSubcategoryName = data.subcategoryName || data.subcategoryEn || data.subcategory;
      
      let needsUpdate = false;
      const updates = {};
      
      // حالة 1: لديه subcategoryId ولكن ليس subcategoryName
      if (currentSubcategoryId && !data.subcategoryName) {
        // البحث عن اسم الفئة الفرعية
        const subInfo = subcategoryList.find(s => s.id === currentSubcategoryId);
        if (subInfo) {
          updates.subcategoryName = subInfo.nameEn;
          updates.subcategoryNameAr = subInfo.nameAr;
          needsUpdate = true;
        }
      }
      
      // حالة 2: لديه subcategoryName ولكن ليس subcategoryId
      if (currentSubcategoryName && !currentSubcategoryId) {
        const foundId = subcategoryMap.get(currentSubcategoryName);
        if (foundId) {
          updates.subcategoryId = foundId;
          needsUpdate = true;
          fixedCount++;
        } else {
          issues.push({
            productId,
            issue: 'لم يتم العثور على subcategoryId',
            subcategoryName: currentSubcategoryName
          });
          errorCount++;
        }
      }
      
      // حالة 3: لديه كلاهما - التحقق من الصحة
      if (currentSubcategoryId && currentSubcategoryName) {
        const expectedId = subcategoryMap.get(currentSubcategoryName);
        if (expectedId && expectedId !== currentSubcategoryId) {
          updates.subcategoryId = expectedId;
          needsUpdate = true;
          console.log(`⚠️  تصحيح subcategoryId للمنتج ${productId}`);
        } else {
          alreadyCorrectCount++;
        }
      }
      
      // حالة 4: ليس لديه أي منهما
      if (!currentSubcategoryId && !currentSubcategoryName) {
        issues.push({
          productId,
          issue: 'المنتج بدون فئة فرعية',
          data: {
            categoryId: data.categoryId,
            name: data.name
          }
        });
        errorCount++;
      }
      
      // تطبيق التحديثات
      if (needsUpdate && Object.keys(updates).length > 0) {
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        batch.update(doc.ref, updates);
        updatedCount++;
        batchCount++;
        
        console.log(`✅ ${updatedCount}. تحديث المنتج ${productId}`);
        Object.keys(updates).forEach(key => {
          if (key !== 'updatedAt') {
            console.log(`   └─ ${key}: ${updates[key]}`);
          }
        });
        
        // تنفيذ batch عند الوصول للحد الأقصى
        if (batchCount >= BATCH_SIZE) {
          console.log(`\n💾 حفظ ${batchCount} منتج...\n`);
          batch.commit();
          batchCount = 0;
        }
      }
    });
    
    // تنفيذ آخر batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\n💾 تم حفظ آخر ${batchCount} منتج\n`);
    }
    
    // النتيجة النهائية
    console.log('\n' + '='.repeat(60));
    console.log('📊 ملخص التحديث لمنتجات Sab Market:');
    console.log('='.repeat(60));
    console.log(`📦 إجمالي المنتجات: ${productsSnapshot.size}`);
    console.log(`✅ تم تحديثها: ${updatedCount}`);
    console.log(`🔧 تم إصلاحها (إضافة subcategoryId): ${fixedCount}`);
    console.log(`✔️  صحيحة بالفعل: ${alreadyCorrectCount}`);
    console.log(`❌ أخطاء/تحذيرات: ${errorCount}`);
    console.log('='.repeat(60));
    
    // عرض المشاكل إن وجدت
    if (issues.length > 0) {
      console.log('\n⚠️  المشاكل التي تحتاج إلى انتباه:');
      console.log('='.repeat(60));
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. المنتج: ${issue.productId}`);
        console.log(`   المشكلة: ${issue.issue}`);
        if (issue.subcategoryName) {
          console.log(`   الفئة الفرعية: ${issue.subcategoryName}`);
        }
        if (issue.data) {
          console.log(`   البيانات: ${JSON.stringify(issue.data, null, 2)}`);
        }
      });
    }
    
    console.log('\n✅ تم الانتهاء من تحديث منتجات Sab Market!\n');
    
  } catch (error) {
    console.error('❌ خطأ في التحديث:', error);
    throw error;
  }
}

/**
 * عرض إحصائيات منتجات Sab Market قبل التحديث
 */
async function showSabMarketStats() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📊 إحصائيات منتجات Sab Market:');
    console.log('='.repeat(60));
    
    const productsSnapshot = await db
      .collection('products')
      .where('categoryId', '==', SAB_MARKET_CATEGORY_ID)
      .get();
    
    let withSubcategoryId = 0;
    let withoutSubcategoryId = 0;
    let withSubcategoryName = 0;
    let withBoth = 0;
    let withNeither = 0;
    
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      const hasId = !!data.subcategoryId;
      const hasName = !!(data.subcategoryName || data.subcategoryEn || data.subcategory);
      
      if (hasId) withSubcategoryId++;
      if (!hasId) withoutSubcategoryId++;
      if (hasName) withSubcategoryName++;
      if (hasId && hasName) withBoth++;
      if (!hasId && !hasName) withNeither++;
    });
    
    console.log(`إجمالي منتجات Sab Market: ${productsSnapshot.size}`);
    console.log(`لديهم subcategoryId: ${withSubcategoryId} (${Math.round(withSubcategoryId/productsSnapshot.size*100)}%)`);
    console.log(`بدون subcategoryId: ${withoutSubcategoryId} (${Math.round(withoutSubcategoryId/productsSnapshot.size*100)}%)`);
    console.log(`لديهم subcategoryName: ${withSubcategoryName} (${Math.round(withSubcategoryName/productsSnapshot.size*100)}%)`);
    console.log(`لديهم كلاهما: ${withBoth} (${Math.round(withBoth/productsSnapshot.size*100)}%)`);
    console.log(`بدون أي منهما: ${withNeither} (${Math.round(withNeither/productsSnapshot.size*100)}%)`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ خطأ في عرض الإحصائيات:', error);
  }
}

/**
 * عرض الفئات الفرعية لـ Sab Market
 */
async function listSabMarketSubcategories() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📂 الفئات الفرعية في Sab Market:');
    console.log('='.repeat(60));
    
    const subcategoriesSnapshot = await db
      .collection('categories')
      .doc(SAB_MARKET_CATEGORY_ID)
      .collection('subcategory')
      .get();
    
    console.log(`إجمالي الفئات الفرعية: ${subcategoriesSnapshot.size}\n`);
    
    subcategoriesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const nameAr = data.subcategoryAr || data.subcategoryNameAr || data.name?.ar || '';
      const nameEn = data.subcategoryEn || data.subcategoryName || data.name?.en || '';
      
      console.log(`${index + 1}. ${nameAr} (${nameEn})`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   الحقول: ${Object.keys(data).join(', ')}\n`);
    });
    
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ خطأ في عرض الفئات الفرعية:', error);
  }
}

// البرنامج الرئيسي
async function main() {
  console.log('🚀 سكريبت تحديث منتجات Sab Market');
  console.log('الفئة: cwt28D5gjoLno8SFqoxQ\n');
  
  // عرض الفئات الفرعية
  await listSabMarketSubcategories();
  
  // عرض الإحصائيات قبل التحديث
  await showSabMarketStats();
  
  // سؤال المستخدم للتأكيد
  console.log('⚠️  هذا البرنامج سيقوم بتحديث جميع منتجات Sab Market');
  console.log('⚠️  تأكد من أخذ نسخة احتياطية من قاعدة البيانات قبل المتابعة\n');
  
  // للتشغيل المباشر (بدون تأكيد):
  await updateSabMarketProducts();
  
  // عرض الإحصائيات بعد التحديث
  await showSabMarketStats();
  
  console.log('✅ تم الانتهاء بنجاح!\n');
  process.exit(0);
}

// تشغيل البرنامج
if (require.main === module) {
  main().catch(error => {
    console.error('❌ خطأ فادح:', error);
    process.exit(1);
  });
}

module.exports = {
  updateSabMarketProducts,
  showSabMarketStats,
  listSabMarketSubcategories,
  SAB_MARKET_CATEGORY_ID
};
