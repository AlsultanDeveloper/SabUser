// update-sab-market-simple.js
// سكريبت بسيط لتحديث منتجات Sab Market باستخدام Firebase Web SDK

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc,
  serverTimestamp 
} = require('firebase/firestore');

// تحميل Firebase config من .env
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 تهيئة Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('✅ تم تهيئة Firebase بنجاح\n');

// معرف فئة Sab Market
const SAB_MARKET_CATEGORY_ID = 'cwt28D5gjoLno8SFqoxQ';

/**
 * عرض الفئات الفرعية
 */
async function listSubcategories() {
  console.log('📂 جاري جلب الفئات الفرعية...\n');
  
  const subcategoryRef = collection(db, 'categories', SAB_MARKET_CATEGORY_ID, 'subcategory');
  const snapshot = await getDocs(subcategoryRef);
  
  const subcategories = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    subcategories.push({
      id: doc.id,
      nameEn: data.subcategoryEn || data.subcategoryName || data.name?.en || '',
      nameAr: data.subcategoryAr || data.subcategoryNameAr || data.name?.ar || '',
      data: data
    });
  });
  
  console.log(`✅ تم العثور على ${subcategories.length} فئة فرعية:\n`);
  
  subcategories.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.nameAr} (${sub.nameEn})`);
    console.log(`   ID: ${sub.id}\n`);
  });
  
  return subcategories;
}

/**
 * عرض إحصائيات المنتجات
 */
async function showStats() {
  console.log('📊 جاري جلب إحصائيات المنتجات...\n');
  
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('categoryId', '==', SAB_MARKET_CATEGORY_ID));
  const snapshot = await getDocs(q);
  
  let withId = 0;
  let withoutId = 0;
  let withName = 0;
  let withBoth = 0;
  let withNeither = 0;
  
  const products = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const hasId = !!data.subcategoryId;
    const hasName = !!(data.subcategoryName || data.subcategoryEn || data.subcategory);
    
    products.push({
      id: doc.id,
      data: data,
      hasId,
      hasName
    });
    
    if (hasId) withId++;
    if (!hasId) withoutId++;
    if (hasName) withName++;
    if (hasId && hasName) withBoth++;
    if (!hasId && !hasName) withNeither++;
  });
  
  console.log('='.repeat(60));
  console.log(`إجمالي المنتجات: ${snapshot.size}`);
  console.log(`لديهم subcategoryId: ${withId} (${Math.round(withId/snapshot.size*100)}%)`);
  console.log(`بدون subcategoryId: ${withoutId} (${Math.round(withoutId/snapshot.size*100)}%)`);
  console.log(`لديهم subcategoryName: ${withName} (${Math.round(withName/snapshot.size*100)}%)`);
  console.log(`لديهم كلاهما: ${withBoth} (${Math.round(withBoth/snapshot.size*100)}%)`);
  console.log(`بدون أي منهما: ${withNeither}`);
  console.log('='.repeat(60) + '\n');
  
  return products;
}

/**
 * تحديث المنتجات
 */
async function updateProducts() {
  try {
    console.log('🚀 بدء تحديث منتجات Sab Market\n');
    console.log('الفئة: ' + SAB_MARKET_CATEGORY_ID + '\n');
    console.log('='.repeat(60) + '\n');
    
    // جلب الفئات الفرعية
    const subcategories = await listSubcategories();
    
    // بناء خريطة للفئات الفرعية
    const subcategoryMap = new Map();
    subcategories.forEach(sub => {
      const names = [
        sub.nameEn,
        sub.nameAr,
        sub.data.subcategoryName,
        sub.data.subcategoryNameAr,
        sub.data.subcategory,
        sub.data.name?.en,
        sub.data.name?.ar
      ].filter(Boolean);
      
      names.forEach(name => {
        subcategoryMap.set(name, sub.id);
      });
    });
    
    // جلب المنتجات
    const products = await showStats();
    
    if (products.length === 0) {
      console.log('⚠️  لا توجد منتجات للتحديث');
      return;
    }
    
    console.log('🔄 جاري تحديث المنتجات...\n');
    
    let updated = 0;
    let alreadyCorrect = 0;
    let errors = 0;
    
    for (const product of products) {
      try {
        const data = product.data;
        const needsUpdate = {};
        
        // إذا لم يكن لديه subcategoryId
        if (!data.subcategoryId) {
          const subcategoryName = data.subcategoryName || data.subcategoryEn || data.subcategory;
          
          if (subcategoryName) {
            const foundId = subcategoryMap.get(subcategoryName);
            if (foundId) {
              needsUpdate.subcategoryId = foundId;
              console.log(`✅ ${updated + 1}. تحديث ${product.id}`);
              console.log(`   إضافة subcategoryId: ${foundId}`);
              console.log(`   من subcategoryName: ${subcategoryName}\n`);
            } else {
              console.log(`⚠️  لم يتم العثور على ID للفئة الفرعية: ${subcategoryName}`);
              errors++;
            }
          } else {
            console.log(`⚠️  المنتج ${product.id} ليس لديه اسم فئة فرعية`);
            errors++;
          }
        } else {
          alreadyCorrect++;
        }
        
        // تطبيق التحديث
        if (Object.keys(needsUpdate).length > 0) {
          needsUpdate.updatedAt = serverTimestamp();
          const productRef = doc(db, 'products', product.id);
          await updateDoc(productRef, needsUpdate);
          updated++;
        }
        
      } catch (error) {
        console.error(`❌ خطأ في تحديث المنتج ${product.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ملخص التحديث:');
    console.log('='.repeat(60));
    console.log(`✅ تم تحديثها: ${updated}`);
    console.log(`✔️  صحيحة بالفعل: ${alreadyCorrect}`);
    console.log(`❌ أخطاء: ${errors}`);
    console.log('='.repeat(60) + '\n');
    
    // عرض الإحصائيات بعد التحديث
    console.log('📊 الإحصائيات بعد التحديث:\n');
    await showStats();
    
    console.log('✅ تم الانتهاء بنجاح!\n');
    
  } catch (error) {
    console.error('❌ خطأ فادح:', error);
    throw error;
  }
}

// تشغيل البرنامج
updateProducts()
  .then(() => {
    console.log('✅ اكتمل البرنامج');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ فشل البرنامج:', error);
    process.exit(1);
  });
