// update-products-with-subcategory-id.js
// هذا الملف يساعدك في تحديث المنتجات القديمة لإضافة subcategoryId

const admin = require('firebase-admin');

// تهيئة Firebase Admin SDK
// تأكد من تحميل service account key من Firebase Console
// const serviceAccount = require('./path/to/serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

const db = admin.firestore();

/**
 * تحديث المنتجات لإضافة subcategoryId بناءً على categoryId و subcategoryName
 */
async function updateProductsWithSubcategoryId() {
  try {
    console.log('🔄 جاري تحديث المنتجات...');
    
    // 1. جلب جميع الفئات مع الفئات الفرعية
    const categoriesSnapshot = await db.collection('categories').get();
    const subcategoryMap = new Map(); // Map<subcategoryName, subcategoryId>
    
    console.log(`📦 تم العثور على ${categoriesSnapshot.size} فئة رئيسية`);
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const categoryData = categoryDoc.data();
      
      console.log(`\n📂 معالجة الفئة: ${categoryData.name?.ar || categoryData.name?.en || categoryId}`);
      
      // جلب الفئات الفرعية
      const subcategoriesSnapshot = await db
        .collection('categories')
        .doc(categoryId)
        .collection('subcategory')
        .get();
      
      console.log(`   └─ عدد الفئات الفرعية: ${subcategoriesSnapshot.size}`);
      
      for (const subDoc of subcategoriesSnapshot.docs) {
        const subData = subDoc.data();
        const subId = subDoc.id;
        
        // حفظ الفئة الفرعية في الخريطة بكل الأسماء الممكنة
        const names = [];
        
        if (typeof subData.name === 'object') {
          if (subData.name.ar) names.push(subData.name.ar);
          if (subData.name.en) names.push(subData.name.en);
        } else if (typeof subData.name === 'string') {
          names.push(subData.name);
        }
        
        if (subData.nameAr) names.push(subData.nameAr);
        if (subData.nameEn) names.push(subData.nameEn);
        
        // حفظ كل الأسماء المحتملة
        names.forEach(name => {
          const key = `${categoryId}:${name}`;
          subcategoryMap.set(key, subId);
          console.log(`   └─ تم حفظ: ${name} => ${subId}`);
        });
      }
    }
    
    console.log(`\n✅ تم بناء خريطة الفئات الفرعية: ${subcategoryMap.size} إدخال`);
    
    // 2. جلب جميع المنتجات
    const productsSnapshot = await db.collection('products').get();
    console.log(`\n📦 تم العثور على ${productsSnapshot.size} منتج`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // 3. تحديث كل منتج
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit
    
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      const productId = productDoc.id;
      
      // تخطي المنتجات التي لديها subcategoryId بالفعل
      if (productData.subcategoryId) {
        skippedCount++;
        continue;
      }
      
      // محاولة إيجاد subcategoryId
      const categoryId = productData.categoryId;
      const subcategoryName = productData.subcategoryName;
      
      if (!categoryId || !subcategoryName) {
        console.warn(`⚠️  المنتج ${productId} ليس لديه categoryId أو subcategoryName`);
        errorCount++;
        continue;
      }
      
      const key = `${categoryId}:${subcategoryName}`;
      const subcategoryId = subcategoryMap.get(key);
      
      if (subcategoryId) {
        batch.update(productDoc.ref, {
          subcategoryId: subcategoryId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        updatedCount++;
        batchCount++;
        
        console.log(`✅ ${updatedCount}. تم تحديث المنتج ${productId}: ${subcategoryName} => ${subcategoryId}`);
        
        // تنفيذ batch عند الوصول للحد الأقصى
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`\n💾 تم حفظ ${batchCount} منتج`);
          batchCount = 0;
        }
      } else {
        console.warn(`⚠️  لم يتم العثور على subcategoryId للمنتج ${productId}: ${subcategoryName}`);
        errorCount++;
      }
    }
    
    // تنفيذ آخر batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\n💾 تم حفظ آخر ${batchCount} منتج`);
    }
    
    // النتيجة النهائية
    console.log('\n' + '='.repeat(50));
    console.log('📊 ملخص التحديث:');
    console.log('='.repeat(50));
    console.log(`✅ تم تحديث: ${updatedCount} منتج`);
    console.log(`⏭️  تم تخطي: ${skippedCount} منتج (لديهم subcategoryId بالفعل)`);
    console.log(`❌ أخطاء: ${errorCount} منتج`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ خطأ في التحديث:', error);
    throw error;
  }
}

/**
 * عرض إحصائيات المنتجات قبل التحديث
 */
async function showProductsStats() {
  try {
    const productsSnapshot = await db.collection('products').get();
    
    let withSubcategoryId = 0;
    let withoutSubcategoryId = 0;
    let withCategoryId = 0;
    let withSubcategoryName = 0;
    
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.subcategoryId) withSubcategoryId++;
      if (!data.subcategoryId) withoutSubcategoryId++;
      if (data.categoryId) withCategoryId++;
      if (data.subcategoryName) withSubcategoryName++;
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 إحصائيات المنتجات:');
    console.log('='.repeat(50));
    console.log(`إجمالي المنتجات: ${productsSnapshot.size}`);
    console.log(`لديهم subcategoryId: ${withSubcategoryId}`);
    console.log(`بدون subcategoryId: ${withoutSubcategoryId}`);
    console.log(`لديهم categoryId: ${withCategoryId}`);
    console.log(`لديهم subcategoryName: ${withSubcategoryName}`);
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ خطأ في عرض الإحصائيات:', error);
  }
}

// تشغيل البرنامج
async function main() {
  console.log('🚀 بدء برنامج تحديث المنتجات\n');
  
  // عرض الإحصائيات قبل التحديث
  await showProductsStats();
  
  // سؤال المستخدم للتأكيد
  console.log('⚠️  هذا البرنامج سيقوم بتحديث جميع المنتجات التي ليس لديها subcategoryId');
  console.log('⚠️  تأكد من أخذ نسخة احتياطية من قاعدة البيانات قبل المتابعة\n');
  
  // في بيئة الإنتاج، استخدم readline للحصول على تأكيد المستخدم
  // const readline = require('readline');
  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // });
  
  // rl.question('هل تريد المتابعة؟ (yes/no): ', async (answer) => {
  //   if (answer.toLowerCase() === 'yes') {
  //     await updateProductsWithSubcategoryId();
  //     await showProductsStats();
  //   } else {
  //     console.log('تم الإلغاء');
  //   }
  //   rl.close();
  //   process.exit(0);
  // });
  
  // للتشغيل المباشر (بدون تأكيد):
  await updateProductsWithSubcategoryId();
  await showProductsStats();
  
  process.exit(0);
}

// تشغيل البرنامج عند استدعاء الملف مباشرة
if (require.main === module) {
  main().catch(error => {
    console.error('❌ خطأ فادح:', error);
    process.exit(1);
  });
}

module.exports = {
  updateProductsWithSubcategoryId,
  showProductsStats
};
