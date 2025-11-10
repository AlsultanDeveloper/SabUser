/**
 * 🎯 سكريبت لإضافة source و vendorName لمنتجات محددة فقط
 * 
 * ⚠️ تحذير: لا تضف source: "other" لجميع المنتجات!
 * معظم المنتجات يجب أن تكون من Sab Market (بدون source)
 * 
 * الاستخدام:
 * node scripts/update-vendor-products.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * ═══════════════════════════════════════════════════════════
 * اختر السيناريو المناسب:
 * ═══════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────
// السيناريو 1: إضافة منتجات Nike فقط
// ─────────────────────────────────────────────────────────
async function addNikeProducts() {
  console.log('🔍 جاري البحث عن منتجات Nike...\n');
  
  const snapshot = await db.collection('products')
    .where('name.en', '>=', 'Nike')
    .where('name.en', '<=', 'Nike\uf8ff')
    .get();
  
  console.log(`📦 تم العثور على ${snapshot.size} منتج Nike\n`);
  
  let updated = 0;
  for (const doc of snapshot.docs) {
    await doc.ref.update({
      source: 'other',
      vendorName: 'Nike Store'
    });
    updated++;
    console.log(`✅ ${updated}/${snapshot.size} - ${doc.data().name.en}`);
  }
  
  console.log(`\n✅ تم تحديث ${updated} منتج Nike`);
}

// ─────────────────────────────────────────────────────────
// السيناريو 2: إضافة عدة brands
// ─────────────────────────────────────────────────────────
async function addMultipleBrands() {
  const brands = [
    { search: 'Nike', vendorName: 'Nike Store' },
    { search: 'Adidas', vendorName: 'Adidas Official' },
    { search: 'Puma', vendorName: 'Puma Shop' },
    { search: 'Samsung', vendorName: 'Samsung Electronics' },
    // أضف المزيد هنا...
  ];
  
  console.log(`🔄 جاري معالجة ${brands.length} علامة تجارية...\n`);
  
  for (const brand of brands) {
    console.log(`\n📦 معالجة: ${brand.search}...`);
    
    const snapshot = await db.collection('products')
      .where('name.en', '>=', brand.search)
      .where('name.en', '<=', brand.search + '\uf8ff')
      .get();
    
    console.log(`   وجدت ${snapshot.size} منتج`);
    
    for (const doc of snapshot.docs) {
      await doc.ref.update({
        source: 'other',
        vendorName: brand.vendorName
      });
    }
    
    console.log(`   ✅ تم تحديث ${snapshot.size} منتج`);
  }
  
  console.log('\n🎉 تم الانتهاء من جميع العلامات التجارية!');
}

// ─────────────────────────────────────────────────────────
// السيناريو 3: تحديث منتجات بـ IDs محددة
// ─────────────────────────────────────────────────────────
async function updateSpecificProducts() {
  const products = [
    { id: 'product_id_1', vendorName: 'Nike Store' },
    { id: 'product_id_2', vendorName: 'Adidas Shop' },
    // أضف IDs المنتجات هنا...
  ];
  
  console.log(`🔄 جاري تحديث ${products.length} منتج...\n`);
  
  for (const product of products) {
    try {
      await db.collection('products').doc(product.id).update({
        source: 'other',
        vendorName: product.vendorName
      });
      console.log(`✅ ${product.id} → ${product.vendorName}`);
    } catch (error) {
      console.error(`❌ خطأ في ${product.id}:`, error.message);
    }
  }
  
  console.log('\n✅ تم الانتهاء!');
}

// ─────────────────────────────────────────────────────────
// السيناريو 4: تحديث حسب category
// ─────────────────────────────────────────────────────────
async function updateByCategory() {
  // مثال: جميع منتجات الإلكترونيات من بائعين آخرين
  const categories = [
    { categoryId: 'electronics', vendorName: 'Tech Store' },
    { categoryId: 'shoes', vendorName: 'Shoes Mall' },
    // أضف المزيد...
  ];
  
  console.log(`🔄 جاري معالجة ${categories.length} فئة...\n`);
  
  for (const cat of categories) {
    console.log(`\n📦 معالجة فئة: ${cat.categoryId}...`);
    
    const snapshot = await db.collection('products')
      .where('categoryId', '==', cat.categoryId)
      .get();
    
    console.log(`   وجدت ${snapshot.size} منتج`);
    
    for (const doc of snapshot.docs) {
      await doc.ref.update({
        source: 'other',
        vendorName: cat.vendorName
      });
    }
    
    console.log(`   ✅ تم تحديث ${snapshot.size} منتج`);
  }
  
  console.log('\n🎉 تم الانتهاء!');
}

// ─────────────────────────────────────────────────────────
// دالة مساعدة: عرض إحصائيات قبل التنفيذ
// ─────────────────────────────────────────────────────────
async function showStats() {
  console.log('📊 إحصائيات المنتجات الحالية:\n');
  
  const allProducts = await db.collection('products').get();
  console.log(`📦 إجمالي المنتجات: ${allProducts.size}`);
  
  const sabMarket = await db.collection('products')
    .where('source', '==', 'sab-market')
    .get();
  console.log(`🏪 Sab Market: ${sabMarket.size}`);
  
  const other = await db.collection('products')
    .where('source', '==', 'other')
    .get();
  console.log(`🛍️  Other Vendors: ${other.size}`);
  
  const noSource = allProducts.size - sabMarket.size - other.size;
  console.log(`❓ بدون source (ستكون Sab Market تلقائياً): ${noSource}\n`);
}

// ═══════════════════════════════════════════════════════════
// 🎯 اختر السيناريو المناسب لك:
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════\n');
  console.log('🚀 بدء معالجة المنتجات...\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  // 1. عرض الإحصائيات أولاً
  await showStats();
  
  // 2. اختر واحداً من السيناريوهات التالية:
  
  // ── Nike فقط ──
  // await addNikeProducts();
  
  // ── عدة brands ──
  // await addMultipleBrands();
  
  // ── منتجات محددة بـ IDs ──
  // await updateSpecificProducts();
  
  // ── حسب الفئة ──
  // await updateByCategory();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ تم الانتهاء بنجاح!');
  console.log('═══════════════════════════════════════════════════\n');
  
  // عرض الإحصائيات بعد التحديث
  console.log('📊 الإحصائيات بعد التحديث:\n');
  await showStats();
  
  process.exit(0);
}

// تشغيل
main().catch(error => {
  console.error('\n❌ خطأ:', error);
  process.exit(1);
});
