require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function checkTwoProducts() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔍 فحص المنتجين في السلة');
    console.log('═══════════════════════════════════════════════════\n');
    
    // ID المنتج الأول (Men Black Plain Lounge)
    const productId1 = '09YwrQdaxaKKe9dwuQ9I';
    
    // جلب المنتج الأول
    const docRef1 = doc(db, 'products', productId1);
    const docSnap1 = await getDoc(docRef1);
    
    if (docSnap1.exists()) {
      const data1 = docSnap1.data();
      console.log('📦 المنتج الأول:');
      console.log('═══════════════════════════════════════════════════');
      console.log(`الاسم: ${typeof data1.name === 'string' ? data1.name : data1.name?.en}`);
      console.log(`ID: ${productId1}`);
      console.log(`السعر: $${data1.price}`);
      console.log(`source: "${data1.source || 'غير موجود (سيصبح sab-market تلقائياً)'}"`);
      console.log(`vendorName: "${data1.vendorName || 'غير موجود'}"`);
      console.log(`brand: "${data1.brand || data1.brandName || 'غير موجود'}"`);
      console.log('');
    } else {
      console.log('❌ المنتج الأول غير موجود!\n');
    }
    
    // الآن دعني أبحث عن المنتج الثاني ($0.16)
    // بما أن السعر $0.16، دعني أبحث عنه
    const { collection, getDocs, query, where } = require('firebase/firestore');
    
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('price', '==', 0.16));
    const snapshot = await getDocs(q);
    
    console.log('═══════════════════════════════════════════════════');
    console.log('📦 المنتج الثاني (السعر $0.16):');
    console.log('═══════════════════════════════════════════════════');
    
    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const data2 = doc.data();
        console.log(`الاسم: ${typeof data2.name === 'string' ? data2.name : data2.name?.en || data2.name?.ar || 'غير محدد'}`);
        console.log(`ID: ${doc.id}`);
        console.log(`السعر: $${data2.price}`);
        console.log(`source: "${data2.source || 'غير موجود (سيصبح sab-market تلقائياً)'}"`);
        console.log(`vendorName: "${data2.vendorName || 'غير موجود'}"`);
        console.log(`brand: "${data2.brand || data2.brandName || 'غير موجود'}"`);
        console.log('');
      });
    } else {
      console.log('❌ لم يتم العثور على منتج بسعر $0.16\n');
    }
    
    // الخلاصة
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 التحليل:');
    console.log('═══════════════════════════════════════════════════\n');
    
    if (docSnap1.exists() && !snapshot.empty) {
      const source1 = docSnap1.data().source;
      const source2 = snapshot.docs[0].data().source;
      
      console.log(`المنتج 1 source: "${source1 || 'غير موجود'}"`);
      console.log(`المنتج 2 source: "${source2 || 'غير موجود'}"`);
      
      if (source1 === source2) {
        console.log('\n❌ المنتجان لهما نفس الـ source!');
        console.log('   لذلك يظهران في نفس السلة ✅ (هذا صحيح)\n');
      } else if (!source1 && !source2) {
        console.log('\n⚠️  كلا المنتجين بدون source!');
        console.log('   سيصبحان "sab-market" تلقائياً');
        console.log('   لذلك يظهران في نفس السلة ✅ (هذا صحيح)\n');
      } else {
        console.log('\n✅ المنتجان لهما source مختلف!');
        console.log('   يجب أن يظهرا في سلتين منفصلتين 🎯\n');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

checkTwoProducts();
