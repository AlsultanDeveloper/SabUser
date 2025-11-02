const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAAl3WvONnGdkcN8VxqLrPBKQV6poxQQeQ',
  authDomain: 'sabuser-25569.firebaseapp.com',
  projectId: 'sabuser-25569',
  storageBucket: 'sabuser-25569.appspot.com',
  messagingSenderId: '956976901167',
  appId: '1:956976901167:web:ecd1e1c1a4e1234a123456'
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