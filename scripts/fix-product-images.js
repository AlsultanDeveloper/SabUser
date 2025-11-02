/**
 * تحديث صور المنتجات من Unsplash إلى صور افتراضية أفضل
 * Update product images from Unsplash to better default images
 * 
 * ملاحظة: هذا السكريبت يحدث الصور إلى روابط افتراضية مؤقتة
 * يُنصح برفع صور حقيقية للمنتجات لاحقاً
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
  process.exit(1);
}

const db = admin.firestore();

// صور افتراضية بجودة أفضل وأكثر استقراراً
const DEFAULT_IMAGES = {
  vegetables: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fvegetables.jpg?alt=media',
  fruits: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Ffruits.jpg?alt=media',
  dairy: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fdairy.jpg?alt=media',
  meat: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fmeat.jpg?alt=media',
  bakery: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fbakery.jpg?alt=media',
  beverages: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fbeverages.jpg?alt=media',
  snacks: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fsnacks.jpg?alt=media',
  household: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fhousehold.jpg?alt=media',
  personal_care: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fpersonal-care.jpg?alt=media',
  default: 'https://firebasestorage.googleapis.com/v0/b/sab-store-9b947.firebasestorage.app/o/defaults%2Fproduct.jpg?alt=media',
};

// دالة لتحديد نوع المنتج بناءً على الاسم أو الفئة
function getProductImageType(product) {
  const name = (product.name?.ar || product.name?.en || product.name || '').toLowerCase();
  const subcategoryName = (product.subcategoryName || '').toLowerCase();
  
  if (name.includes('خضار') || name.includes('vegetable') || subcategoryName.includes('vegetable')) {
    return 'vegetables';
  }
  if (name.includes('فواكه') || name.includes('fruit') || subcategoryName.includes('fruit')) {
    return 'fruits';
  }
  if (name.includes('حليب') || name.includes('ألبان') || name.includes('dairy') || name.includes('milk')) {
    return 'dairy';
  }
  if (name.includes('لحم') || name.includes('دجاج') || name.includes('meat') || name.includes('chicken')) {
    return 'meat';
  }
  if (name.includes('خبز') || name.includes('مخبوزات') || name.includes('bakery') || name.includes('bread')) {
    return 'bakery';
  }
  if (name.includes('مشروب') || name.includes('عصير') || name.includes('beverage') || name.includes('juice')) {
    return 'beverages';
  }
  if (name.includes('وجبات خفيفة') || name.includes('snack') || name.includes('chips')) {
    return 'snacks';
  }
  if (name.includes('منظف') || name.includes('household') || name.includes('cleaning')) {
    return 'household';
  }
  if (name.includes('عناية') || name.includes('personal') || name.includes('care')) {
    return 'personal_care';
  }
  
  return 'default';
}

async function updateProductImages() {
  console.log('\n🔄 ====================================');
  console.log('🔄 تحديث صور المنتجات');
  console.log('🔄 Updating Product Images');
  console.log('🔄 ====================================\n');

  try {
    // جلب جميع المنتجات التي تحتوي على صور Unsplash
    const productsSnapshot = await db.collection('products')
      .where('hasPlaceholderImage', '==', true)
      .get();

    console.log(`📦 وجدت ${productsSnapshot.size} منتج(ات) بصور مؤقتة\n`);

    if (productsSnapshot.empty) {
      console.log('✅ لا توجد منتجات بحاجة للتحديث!');
      return;
    }

    let updatedCount = 0;
    const batch = db.batch();

    productsSnapshot.forEach(doc => {
      const data = doc.data();
      const productName = data.name?.ar || data.name?.en || data.name || doc.id;
      const imageType = getProductImageType(data);
      const newImage = DEFAULT_IMAGES[imageType];

      console.log(`🔄 تحديث: ${productName}`);
      console.log(`   النوع: ${imageType}`);
      console.log(`   الصورة الجديدة: ${newImage.substring(0, 60)}...`);

      batch.update(doc.ref, {
        image: newImage,
        imageUrl: newImage,
        images: [newImage],
        hasPlaceholderImage: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      updatedCount++;
    });

    console.log(`\n💾 حفظ التغييرات...`);
    await batch.commit();

    console.log('\n✅ ====================================');
    console.log(`✅ تم تحديث ${updatedCount} منتج بنجاح!`);
    console.log('✅ ====================================');
    
    console.log('\n💡 ملاحظة هامة:');
    console.log('   الصور الحالية افتراضية ومؤقتة');
    console.log('   يُنصح برفع صور حقيقية للمنتجات من:');
    console.log('   Firebase Console → Storage');

  } catch (error) {
    console.error('❌ خطأ أثناء التحديث:', error);
    throw error;
  }
}

// تشغيل السكريبت
updateProductImages()
  .then(() => {
    console.log('\n✨ تم بنجاح!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ خطأ فادح:', error);
    process.exit(1);
  });
