require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function analyzeProducts() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 تحليل المنتجات في Firebase');
    console.log('═══════════════════════════════════════════════════\n');
    
    // 1. جلب جميع المنتجات
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 إجمالي المنتجات: ${snapshot.size}\n`);
    
    if (snapshot.size === 0) {
      console.log('❌ لا توجد منتجات في Firebase!');
      process.exit(0);
    }
    
    // 2. تحليل المنتجات
    const stats = {
      total: snapshot.size,
      withSource: 0,
      sabMarket: 0,
      other: 0,
      withoutSource: 0,
      brands: new Map(),
      categories: new Map(),
      samples: {
        sabMarket: [],
        other: [],
        noSource: []
      }
    };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const name = typeof data.name === 'string' ? data.name : (data.name?.en || data.name?.ar || 'Unknown');
      const brand = data.brand || data.brandName || 'غير محدد';
      const category = data.categoryName || data.categoryId || 'غير محدد';
      
      // تحليل source
      if (data.source) {
        stats.withSource++;
        if (data.source === 'sab-market') {
          stats.sabMarket++;
          if (stats.samples.sabMarket.length < 5) {
            stats.samples.sabMarket.push({ id: doc.id, name, brand, category });
          }
        } else if (data.source === 'other') {
          stats.other++;
          if (stats.samples.other.length < 5) {
            stats.samples.other.push({ 
              id: doc.id, 
              name, 
              brand, 
              category,
              vendorName: data.vendorName || 'غير محدد'
            });
          }
        }
      } else {
        stats.withoutSource++;
        if (stats.samples.noSource.length < 5) {
          stats.samples.noSource.push({ id: doc.id, name, brand, category });
        }
      }
      
      // تجميع Brands
      const brandCount = stats.brands.get(brand) || 0;
      stats.brands.set(brand, brandCount + 1);
      
      // تجميع Categories
      const categoryCount = stats.categories.get(category) || 0;
      stats.categories.set(category, categoryCount + 1);
    });
    
    // 3. عرض الإحصائيات
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 إحصائيات Source Field:');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log(`✅ منتجات بها source: ${stats.withSource}`);
    console.log(`   🏪 Sab Market: ${stats.sabMarket}`);
    console.log(`   🛍️  Other Vendors: ${stats.other}`);
    console.log(`\n❓ منتجات بدون source: ${stats.withoutSource}`);
    console.log(`   ℹ️  (ستصبح Sab Market تلقائياً في التطبيق)\n`);
    
    // 4. عرض أمثلة
    if (stats.samples.sabMarket.length > 0) {
      console.log('═══════════════════════════════════════════════════');
      console.log('🏪 أمثلة على منتجات Sab Market:');
      console.log('═══════════════════════════════════════════════════\n');
      stats.samples.sabMarket.forEach((product, i) => {
        console.log(`${i + 1}. ${product.name}`);
        console.log(`   العلامة: ${product.brand} | الفئة: ${product.category}\n`);
      });
    }
    
    if (stats.samples.other.length > 0) {
      console.log('═══════════════════════════════════════════════════');
      console.log('🛍️  أمثلة على منتجات Other Vendors:');
      console.log('═══════════════════════════════════════════════════\n');
      stats.samples.other.forEach((product, i) => {
        console.log(`${i + 1}. ${product.name}`);
        console.log(`   العلامة: ${product.brand} | البائع: ${product.vendorName}\n`);
      });
    }
    
    if (stats.samples.noSource.length > 0) {
      console.log('═══════════════════════════════════════════════════');
      console.log('❓ أمثلة على منتجات بدون source (أول 5):');
      console.log('═══════════════════════════════════════════════════\n');
      stats.samples.noSource.forEach((product, i) => {
        console.log(`${i + 1}. ${product.name}`);
        console.log(`   العلامة: ${product.brand} | الفئة: ${product.category}\n`);
      });
    }
    
    // 5. تحليل Brands
    console.log('═══════════════════════════════════════════════════');
    console.log('🏷️  أشهر العلامات التجارية (Top 15):');
    console.log('═══════════════════════════════════════════════════\n');
    
    const topBrands = Array.from(stats.brands.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    
    topBrands.forEach(([brand, count], i) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`${i + 1}. ${brand}: ${count} منتج (${percentage}%)`);
    });
    
    // 6. تحليل Categories
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📂 أشهر الفئات (Top 10):');
    console.log('═══════════════════════════════════════════════════\n');
    
    const topCategories = Array.from(stats.categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    topCategories.forEach(([category, count], i) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`${i + 1}. ${category}: ${count} منتج (${percentage}%)`);
    });
    
    // 7. توصيات
    console.log('\n═══════════════════════════════════════════════════');
    console.log('💡 التوصيات:');
    console.log('═══════════════════════════════════════════════════\n');
    
    if (stats.withoutSource === stats.total) {
      console.log('✅ لا يوجد source في أي منتج - هذا رائع!');
      console.log('   جميع المنتجات ستصبح Sab Market تلقائياً.\n');
      console.log('📌 إذا أردت إضافة منتجات من بائعين آخرين:');
      console.log('   انظر إلى العلامات التجارية أعلاه واختر أيها تريد');
      console.log('   تحويلها إلى "other" (مثل: Nike, Samsung, إلخ)\n');
    } else if (stats.other > 0) {
      console.log(`✅ لديك ${stats.other} منتج من بائعين آخرين`);
      console.log(`🏪 ${stats.sabMarket + stats.withoutSource} منتج من Sab Market`);
      console.log('   النظام يعمل بشكل صحيح! ✨\n');
    }
    
    if (topBrands.some(([brand]) => 
      ['Nike', 'Adidas', 'Puma', 'Samsung', 'Apple', 'LG', 'Sony'].includes(brand)
    )) {
      console.log('🔍 لاحظت وجود علامات تجارية عالمية:');
      console.log('   (Nike, Adidas, Samsung, إلخ)');
      console.log('\n💡 هل تريد جعلها من بائعين آخرين؟');
      console.log('   استخدم السكريبت: update-vendor-products.js\n');
    }
    
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ تم الانتهاء من التحليل!');
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ خطأ في تحليل المنتجات:', error.message);
    console.error('🔧 تفاصيل الخطأ:', error);
  }
  
  process.exit(0);
}

analyzeProducts();
