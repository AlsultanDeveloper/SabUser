require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function getProducts() {
  try {
    console.log('🔍 جاري البحث عن المنتجات في Firebase...');
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log('\n📦 عدد المنتجات الموجودة:', snapshot.size);
    
    if (snapshot.size === 0) {
      console.log('❌ لا توجد منتجات في المجموعة products');
      console.log('💡 تأكد من:');
      console.log('   - اسم المجموعة صحيح: "products"');
      console.log('   - أذونات Firestore تسمح بالقراءة');
      console.log('   - تم إضافة البيانات بنجاح');
    } else {
      console.log('\n✅ المنتجات الموجودة:');
      console.log('================================\n');
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`📄 منتج ${index + 1}:`);
        console.log(`   🆔 ID: ${doc.id}`);
        console.log(`   🏷️ الاسم: ${JSON.stringify(data.name)}`);
        console.log(`   💰 السعر: ${data.price}`);
        console.log(`   🏢 العلامة: ${data.brand || data.brandName || 'غير محدد'}`);
        console.log(`   📂 الفئة: ${data.categoryName || data.categoryId || 'غير محدد'}`);
        console.log(`   ⭐ التقييم: ${data.rating || 'غير محدد'}`);
        console.log(`   📅 تاريخ الإنشاء: ${data.createdAt || 'غير محدد'}`);
        console.log('   --------------------------------\n');
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب البيانات:', error.message);
    console.error('🔧 تفاصيل الخطأ:', error);
  }
  
  process.exit(0);
}

getProducts();