const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCqeIKe6itUxPXTLHCYxIaxnl-wsCmcIYY",
  authDomain: "sab-store-9b947.firebaseapp.com",
  projectId: "sab-store-9b947",
  storageBucket: "sab-store-9b947.appspot.com",
  messagingSenderId: "263235150197",
  appId: "1:263235150197:web:3519534187b75d9006b33c",
  measurementId: "G-1ZPF2J52WZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nested subcategories to add
const nestedSubcategories = {
  // Shoes category (Fashion -> Shoes)
  shoes: {
    categoryId: 'GXakfwzrVqoStlGav7gR', // Fashion
    subcategoryId: 'LVEEST5F26Zwa0iFK9Ex', // Shoes (أحذية)
    nested: [
      { nameEn: 'Women Shoes', nameAr: 'أحذية نسائية', image: '/images/subcategories/women-shoes.jpg', order: 1 },
      { nameEn: 'Men Shoes', nameAr: 'أحذية رجالية', image: '/images/subcategories/men-shoes.jpg', order: 2 },
    ]
  },
  
  // Kids & Baby category
  kidsAndBaby: {
    // We need to find the Kids & Baby category ID first
    subcategories: [
      {
        nameEn: 'Kids Clothing',
        nameAr: 'ملابس أطفال',
        nested: [
          { nameEn: 'Boys Clothing', nameAr: 'ملابس أولاد', image: '/images/subcategories/boys-clothing.jpg', order: 1 },
          { nameEn: 'Girls Clothing', nameAr: 'ملابس بنات', image: '/images/subcategories/girls-clothing.jpg', order: 2 },
        ]
      },
      {
        nameEn: 'Baby Clothing',
        nameAr: 'ملابس أطفال رضع',
        nested: [
          { nameEn: 'Baby Boys', nameAr: 'أطفال رضع أولاد', image: '/images/subcategories/baby-boys.jpg', order: 1 },
          { nameEn: 'Baby Girls', nameAr: 'أطفال رضع بنات', image: '/images/subcategories/baby-girls.jpg', order: 2 },
        ]
      },
      {
        nameEn: 'Kids Shoes',
        nameAr: 'أحذية أطفال',
        nested: [
          { nameEn: 'Boys Shoes', nameAr: 'أحذية أولاد', image: '/images/subcategories/boys-shoes.jpg', order: 1 },
          { nameEn: 'Girls Shoes', nameAr: 'أحذية بنات', image: '/images/subcategories/girls-shoes.jpg', order: 2 },
          { nameEn: 'Baby Shoes', nameAr: 'أحذية أطفال رضع', image: '/images/subcategories/baby-shoes.jpg', order: 3 },
        ]
      }
    ]
  }
};

async function addNestedSubcategories() {
  try {
    console.log('\n📝 Adding nested subcategories...\n');
    
    // Add nested subcategories for Shoes
    console.log('👟 Adding nested subcategories for Shoes...');
    const shoesData = nestedSubcategories.shoes;
    const nestedShoesRef = collection(db, 'categories', shoesData.categoryId, 'subcategory', shoesData.subcategoryId, 'subcategory');
    
    for (const item of shoesData.nested) {
      const docRef = await addDoc(nestedShoesRef, {
        ...item,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`   ✅ Added: ${item.nameEn} (${docRef.id})`);
    }
    
    console.log('\n✅ Nested subcategories added successfully!');
    console.log('\nNote: For Kids & Baby category, you need to:');
    console.log('1. Find or create the "Kids & Baby" category');
    console.log('2. Create main subcategories: "Kids Clothing", "Baby Clothing", "Kids Shoes"');
    console.log('3. Then run this script again to add nested subcategories');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

addNestedSubcategories();
