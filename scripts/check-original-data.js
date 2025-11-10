/**
 * 🔍 فحص البيانات الأصلية للمنتجات
 * للتحقق إذا كانت هناك بيانات أخرى نستطيع استرجاع الأسماء منها
 */

const admin = require('firebase-admin');
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkData() {
  console.log('🔍 فحص البيانات الأصلية...\n');
  
  // فحص منتج واحد متضرر بالتفصيل
  const snapshot = await db.collection('products')
    .where('name.en', '==', 'Product')
    .limit(5)
    .get();
  
  console.log('📦 عينة من المنتجات المتضررة:\n');
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('═══════════════════════════════════════');
    console.log('ID:', doc.id);
    console.log('Name:', JSON.stringify(data.name));
    console.log('Description:', data.description ? JSON.stringify(data.description) : 'لا يوجد');
    console.log('VendorName:', data.vendorName || 'لا يوجد');
    console.log('Brand:', data.brand || 'لا يوجد');
    console.log('SKU:', data.sku || 'لا يوجد');
    console.log('Title:', data.title || 'لا يوجد');
    console.log('CategoryId:', data.categoryId || 'لا يوجد');
    console.log('SubcategoryId:', data.subcategoryId || 'لا يوجد');
    
    // فحص جميع الحقول
    console.log('\n🔑 جميع المفاتيح:');
    console.log(Object.keys(data).join(', '));
    console.log('═══════════════════════════════════════\n');
  });
  
  process.exit(0);
}

checkData().catch(error => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
