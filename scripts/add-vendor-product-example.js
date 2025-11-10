/**
 * سكريبت لإضافة حقول source و vendorName لمنتجات محددة
 * 
 * الاستخدام:
 * node scripts/add-vendor-product-example.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * إضافة source و vendorName لمنتج واحد
 */
async function updateSingleProduct(productId, vendorName) {
  try {
    const productRef = db.collection('products').doc(productId);
    
    await productRef.update({
      source: 'other',
      vendorName: vendorName
    });
    
    console.log(`✅ تم تحديث المنتج: ${productId} → ${vendorName}`);
  } catch (error) {
    console.error(`❌ خطأ في تحديث المنتج ${productId}:`, error.message);
  }
}

/**
 * إضافة source و vendorName لعدة منتجات
 */
async function updateMultipleProducts(productsData) {
  console.log(`🔄 جاري تحديث ${productsData.length} منتج...\n`);
  
  for (const product of productsData) {
    await updateSingleProduct(product.id, product.vendorName);
  }
  
  console.log('\n✅ تم الانتهاء من جميع التحديثات!');
}

/**
 * البحث عن منتجات بالاسم وتحديثها
 */
async function updateProductsByName(searchName, vendorName) {
  try {
    const snapshot = await db.collection('products')
      .where('name.en', '>=', searchName)
      .where('name.en', '<=', searchName + '\uf8ff')
      .get();
    
    if (snapshot.empty) {
      console.log(`⚠️ لم يتم العثور على منتجات تحتوي على: ${searchName}`);
      return;
    }
    
    console.log(`🔍 تم العثور على ${snapshot.size} منتج(ات)\n`);
    
    for (const doc of snapshot.docs) {
      await updateSingleProduct(doc.id, vendorName);
    }
    
    console.log('\n✅ تم تحديث جميع المنتجات!');
  } catch (error) {
    console.error('❌ خطأ في البحث:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// اختر واحدة من الطرق التالية:
// ═══════════════════════════════════════════════════════════

async function main() {
  // ─────────────────────────────────────────────────────────
  // طريقة 1: تحديث منتج واحد بمعرفه (Product ID)
  // ─────────────────────────────────────────────────────────
  
  // await updateSingleProduct('PRODUCT_ID_HERE', 'Nike Store');
  
  
  // ─────────────────────────────────────────────────────────
  // طريقة 2: تحديث عدة منتجات مرة واحدة
  // ─────────────────────────────────────────────────────────
  
  const productsToUpdate = [
    { id: 'PRODUCT_ID_1', vendorName: 'Nike Store' },
    { id: 'PRODUCT_ID_2', vendorName: 'Adidas Shop' },
    { id: 'PRODUCT_ID_3', vendorName: 'Puma Store' },
    // أضف المزيد هنا...
  ];
  
  // await updateMultipleProducts(productsToUpdate);
  
  
  // ─────────────────────────────────────────────────────────
  // طريقة 3: البحث بالاسم وتحديث النتائج
  // ─────────────────────────────────────────────────────────
  
  // await updateProductsByName('Nike', 'Nike Store');
  
  
  // ─────────────────────────────────────────────────────────
  // مثال: تحديث جميع منتجات Nike
  // ─────────────────────────────────────────────────────────
  
  await updateProductsByName('Nike', 'Nike Store');
  
  // إغلاق الاتصال
  process.exit(0);
}

// تشغيل السكريبت
main().catch(error => {
  console.error('❌ خطأ عام:', error);
  process.exit(1);
});
