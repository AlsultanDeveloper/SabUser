/**
 * حذف الفئات الفرعية المحددة وجميع المنتجات المرتبطة بها
 * Delete specific subcategories and all related products
 */

const admin = require('firebase-admin');
const path = require('path');

// قائمة معرفات الفئات الفرعية المراد حذفها
// List of subcategory IDs to delete
const SUBCATEGORIES_TO_DELETE = [
  'NEW_saudi_care001',
  'NEW_saudi_dairy001',
  'NEW_saudi_dates001'
];

// معرف الفئة الرئيسية (Sab Market)
const MAIN_CATEGORY_ID = 'cwt28D5gjoLno8SFqoxQ';

// تهيئة Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.error('\n⚠️  تأكد من وجود ملف serviceAccountKey.json في المجلد الرئيسي');
  console.error('⚠️  Make sure serviceAccountKey.json exists in the root folder');
  process.exit(1);
}

const db = admin.firestore();

/**
 * حذف فئة فرعية وجميع المنتجات المرتبطة بها
 * Delete a subcategory and all its related products
 */
async function deleteSubcategoryAndProducts(subcategoryId) {
  console.log(`\n🗑️  بدء حذف الفئة الفرعية: ${subcategoryId}`);
  console.log(`🗑️  Starting deletion of subcategory: ${subcategoryId}`);

  try {
    // 1. حذف جميع المنتجات المرتبطة بهذه الفئة الفرعية
    console.log(`   📦 البحث عن المنتجات المرتبطة...`);
    const productsSnapshot = await db.collection('products')
      .where('subcategoryId', '==', subcategoryId)
      .get();

    if (productsSnapshot.empty) {
      console.log(`   ℹ️  لا توجد منتجات مرتبطة بهذه الفئة الفرعية`);
    } else {
      console.log(`   📦 وجدت ${productsSnapshot.size} منتج(ات) للحذف`);
      
      // حذف المنتجات على دفعات (batch delete)
      const batch = db.batch();
      let deletedCount = 0;

      productsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
        console.log(`      - حذف المنتج: ${doc.data().name?.ar || doc.data().name || doc.id}`);
      });

      await batch.commit();
      console.log(`   ✅ تم حذف ${deletedCount} منتج بنجاح`);
    }

    // 2. حذف الفئة الفرعية نفسها
    console.log(`   🗂️  حذف الفئة الفرعية من Firestore...`);
    const subcategoryRef = db.collection('categories')
      .doc(MAIN_CATEGORY_ID)
      .collection('subcategory')
      .doc(subcategoryId);

    const subcategoryDoc = await subcategoryRef.get();
    
    if (!subcategoryDoc.exists) {
      console.log(`   ⚠️  الفئة الفرعية غير موجودة في قاعدة البيانات`);
      return { success: true, productsDeleted: productsSnapshot.size, subcategoryDeleted: false };
    }

    const subcategoryName = subcategoryDoc.data()?.name?.ar || subcategoryDoc.data()?.subcategoryNameAr || subcategoryId;
    await subcategoryRef.delete();
    console.log(`   ✅ تم حذف الفئة الفرعية: ${subcategoryName}`);

    return {
      success: true,
      productsDeleted: productsSnapshot.size,
      subcategoryDeleted: true,
      subcategoryName
    };

  } catch (error) {
    console.error(`   ❌ خطأ أثناء الحذف:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * الدالة الرئيسية
 * Main function
 */
async function main() {
  console.log('🗑️  ====================================');
  console.log('🗑️  حذف الفئات الفرعية والمنتجات المرتبطة');
  console.log('🗑️  Delete Subcategories and Related Products');
  console.log('🗑️  ====================================\n');

  console.log(`📋 الفئات الفرعية المراد حذفها:`);
  SUBCATEGORIES_TO_DELETE.forEach(id => console.log(`   - ${id}`));

  // تأكيد من المستخدم (يمكن إزالة هذا في بيئة الإنتاج)
  console.log('\n⚠️  تحذير: هذه العملية لا يمكن التراجع عنها!');
  console.log('⚠️  Warning: This operation cannot be undone!\n');

  const results = {
    totalSubcategoriesDeleted: 0,
    totalProductsDeleted: 0,
    errors: []
  };

  // حذف كل فئة فرعية
  for (const subcategoryId of SUBCATEGORIES_TO_DELETE) {
    const result = await deleteSubcategoryAndProducts(subcategoryId);
    
    if (result.success) {
      if (result.subcategoryDeleted) {
        results.totalSubcategoriesDeleted++;
      }
      results.totalProductsDeleted += result.productsDeleted;
    } else {
      results.errors.push({ subcategoryId, error: result.error });
    }

    // انتظر قليلاً بين كل عملية حذف
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // عرض النتائج النهائية
  console.log('\n✅ ====================================');
  console.log('✅ اكتمل الحذف!');
  console.log('✅ Deletion Complete!');
  console.log('✅ ====================================');
  console.log(`📊 الإحصائيات النهائية:`);
  console.log(`   - الفئات الفرعية المحذوفة: ${results.totalSubcategoriesDeleted}`);
  console.log(`   - المنتجات المحذوفة: ${results.totalProductsDeleted}`);
  
  if (results.errors.length > 0) {
    console.log(`\n⚠️  الأخطاء: ${results.errors.length}`);
    results.errors.forEach(err => {
      console.log(`   - ${err.subcategoryId}: ${err.error}`);
    });
  }

  console.log('\n✨ تم بنجاح!');
}

// تشغيل السكريبت
main()
  .then(() => {
    console.log('\n👋 إنهاء...');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ خطأ فادح:', error);
    process.exit(1);
  });
