/**
 * فحص حالة الصور في المنتجات
 * Check images status in products
 */

const admin = require('firebase-admin');
const path = require('path');

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

async function checkImages() {
  console.log('\n🔍 ====================================');
  console.log('🔍 فحص حالة الصور في المنتجات');
  console.log('🔍 Checking Images Status');
  console.log('🔍 ====================================\n');

  try {
    const productsSnapshot = await db.collection('products').limit(10).get();
    
    console.log(`📦 فحص ${productsSnapshot.size} منتج(ات)...\n`);

    let unsplashCount = 0;
    let placeholderCount = 0;
    let firebaseStorageCount = 0;
    let missingImageCount = 0;

    productsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const productName = data.name?.ar || data.name?.en || data.name || doc.id;
      
      console.log(`${index + 1}. ${productName}`);
      console.log(`   ID: ${doc.id}`);
      
      if (!data.image) {
        console.log(`   ❌ لا توجد صورة`);
        missingImageCount++;
      } else if (data.image.includes('unsplash.com')) {
        console.log(`   🖼️  Unsplash: ${data.image.substring(0, 60)}...`);
        unsplashCount++;
      } else if (data.image.includes('placeholder.com')) {
        console.log(`   📷 Placeholder: ${data.image}`);
        placeholderCount++;
      } else if (data.image.includes('firebasestorage.googleapis.com')) {
        console.log(`   ✅ Firebase Storage: ${data.image.substring(0, 60)}...`);
        firebaseStorageCount++;
      } else {
        console.log(`   ❓ أخرى: ${data.image}`);
      }
      
      console.log(`   hasPlaceholderImage: ${data.hasPlaceholderImage || false}`);
      console.log('');
    });

    console.log('📊 ====================================');
    console.log('📊 الإحصائيات');
    console.log('📊 Statistics');
    console.log('📊 ====================================');
    console.log(`🖼️  صور Unsplash: ${unsplashCount}`);
    console.log(`📷 صور Placeholder: ${placeholderCount}`);
    console.log(`✅ صور Firebase Storage: ${firebaseStorageCount}`);
    console.log(`❌ بدون صور: ${missingImageCount}`);
    console.log('');

    if (unsplashCount > 0 || placeholderCount > 0) {
      console.log('⚠️  ====================================');
      console.log('⚠️  تحذير: توجد صور مؤقتة');
      console.log('⚠️  Warning: Placeholder Images Found');
      console.log('⚠️  ====================================');
      console.log('💡 الحل: استخدم صور حقيقية من:');
      console.log('   1. رفع الصور إلى Firebase Storage');
      console.log('   2. استخدام روابط صور خارجية موثوقة');
      console.log('   3. تحميل صور المنتجات من مصادر رسمية');
      console.log('');
      console.log('🔧 لرفع صور إلى Firebase Storage:');
      console.log('   - استخدم Firebase Console: https://console.firebase.google.com');
      console.log('   - اذهب إلى Storage → Upload Files');
      console.log('   - انسخ رابط الصورة وحدّث المنتج');
    } else {
      console.log('✅ جميع الصور من مصادر موثوقة!');
    }

  } catch (error) {
    console.error('❌ خطأ أثناء الفحص:', error);
  }
}

// تشغيل السكريبت
checkImages()
  .then(() => {
    console.log('\n✅ اكتمل الفحص!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ خطأ فادح:', error);
    process.exit(1);
  });
