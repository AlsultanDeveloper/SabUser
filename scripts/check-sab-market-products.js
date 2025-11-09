// Check Sab Market Products - فحص منتجات ساب ماركت
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

async function checkSabMarketProducts() {
  try {
    console.log('🔍 Checking Sab Market products...\n');
    
    // Get all products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    console.log(`📦 Total products in database: ${productsSnapshot.size}`);
    
    // Filter Sab Market products
    const sabMarketProducts = [];
    const productsByCategory = {};
    const productsBySubcategory = {};
    const categoryExamples = new Set();
    
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      const categoryName = data.categoryName || '';
      const categoryId = data.categoryId || '';
      const subcategoryName = data.subcategoryName || '';
      
      // Collect category examples for debugging
      if (categoryExamples.size < 20) {
        categoryExamples.add(`${categoryName} (ID: ${categoryId})`);
      }
      
      // Check if it's a Sab Market product - use categoryId
      const isSabMarket = categoryId === 'cwt28D5gjoLno8SFqoxQ';
      
      if (isSabMarket) {
        
        const productInfo = {
          id: doc.id,
          name: typeof data.name === 'object' ? (data.name.en || data.name.ar) : data.name,
          category: categoryName,
          subcategory: subcategoryName,
          brand: data.brand || 'N/A',
          price: data.price || 0,
          inStock: data.inStock !== false,
          available: data.available !== false,
        };
        
        sabMarketProducts.push(productInfo);
        
        // Group by category
        if (!productsByCategory[categoryName]) {
          productsByCategory[categoryName] = [];
        }
        productsByCategory[categoryName].push(productInfo);
        
        // Group by subcategory
        if (subcategoryName) {
          if (!productsBySubcategory[subcategoryName]) {
            productsBySubcategory[subcategoryName] = [];
          }
          productsBySubcategory[subcategoryName].push(productInfo);
        }
      }
    });
    
    console.log(`\n🎯 Sab Market products: ${sabMarketProducts.length}`);
    console.log(`✅ Available (inStock): ${sabMarketProducts.filter(p => p.inStock).length}`);
    console.log(`❌ Out of stock: ${sabMarketProducts.filter(p => !p.inStock).length}`);
    
    // Show category examples for debugging
    console.log('\n📝 Sample category names (first 20):');
    Array.from(categoryExamples).forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat}`);
    });
    
    // Show breakdown by category
    console.log('\n📊 Breakdown by Category:');
    console.log('─'.repeat(60));
    Object.keys(productsByCategory).forEach(category => {
      const products = productsByCategory[category];
      const available = products.filter(p => p.inStock).length;
      console.log(`\n📁 ${category}`);
      console.log(`   Total: ${products.length} | Available: ${available} | Out of stock: ${products.length - available}`);
    });
    
    // Show breakdown by subcategory
    if (Object.keys(productsBySubcategory).length > 0) {
      console.log('\n\n📊 Breakdown by Subcategory:');
      console.log('─'.repeat(60));
      Object.keys(productsBySubcategory).sort().forEach(subcategory => {
        const products = productsBySubcategory[subcategory];
        const available = products.filter(p => p.inStock).length;
        console.log(`\n  📌 ${subcategory}`);
        console.log(`     Total: ${products.length} | Available: ${available}`);
        
        // Show first 5 products
        products.slice(0, 5).forEach((p, i) => {
          const status = p.inStock ? '✅' : '❌';
          console.log(`     ${i + 1}. ${status} ${p.name} - $${p.price}`);
        });
        
        if (products.length > 5) {
          console.log(`     ... and ${products.length - 5} more`);
        }
      });
    }
    
    // Show sample products
    console.log('\n\n📦 Sample Products (First 10):');
    console.log('─'.repeat(60));
    sabMarketProducts.slice(0, 10).forEach((p, i) => {
      const status = p.inStock ? '✅' : '❌';
      console.log(`${i + 1}. ${status} ${p.name}`);
      console.log(`   Category: ${p.category} | Subcategory: ${p.subcategory}`);
      console.log(`   Brand: ${p.brand} | Price: $${p.price}`);
      console.log('');
    });
    
    // Find products with specific keywords
    console.log('\n🔍 Products containing "Coconut":');
    const coconutProducts = sabMarketProducts.filter(p => {
      const name = p.name || '';
      return name.toLowerCase().includes('coconut') || 
             name.includes('كوكونت');
    });
    coconutProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - $${p.price} (${p.inStock ? 'Available' : 'Out of stock'})`);
    });
    
    console.log('\n✅ Check completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSabMarketProducts();
