const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

async function createKidsBabyCategory() {
  try {
    console.log('\n📝 Creating Kids category structure (Max Fashion style)...\n');
    
    // Step 1: Create main category
    console.log('1️⃣ Creating main "Kids" category...');
    const categoryRef = await addDoc(collection(db, 'categories'), {
      nameEn: 'Kids',
      nameAr: 'الأطفال',
      name: 'Kids',
      image: '/images/categories/kids.jpg',
      order: 11,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`   ✅ Created category: ${categoryRef.id}\n`);
    
    const categoryId = categoryRef.id;
    
    // Step 2: Create subcategories (no nested items for these)
    console.log('2️⃣ Creating clothing subcategories...');
    
    const subcategories = [
      { nameEn: 'Infants', nameAr: 'الرُضّع', image: '/images/subcategories/infants.jpg', order: 1 },
      { nameEn: 'Tops', nameAr: 'بلوزات', image: '/images/subcategories/kids-tops.jpg', order: 2 },
      { nameEn: 'Dresses', nameAr: 'فساتين', image: '/images/subcategories/kids-dresses.jpg', order: 3 },
      { nameEn: 'Bottoms', nameAr: 'سراويل', image: '/images/subcategories/kids-bottoms.jpg', order: 4 },
      { nameEn: 'Sets', nameAr: 'أطقم ملابس', image: '/images/subcategories/kids-sets.jpg', order: 5 },
      { nameEn: 'Sleepwear', nameAr: 'ملابس نوم', image: '/images/subcategories/kids-sleepwear.jpg', order: 6 },
    ];
    
    for (const subcat of subcategories) {
      const subcatRef = await addDoc(collection(db, 'categories', categoryId, 'subcategory'), {
        ...subcat,
        name: subcat.nameEn,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`   ✅ ${subcat.nameEn} (${subcat.nameAr}) - ${subcatRef.id}`);
    }
    
    // Step 3: Create Kids Shoes subcategory with nested items
    console.log('\n3️⃣ Creating "Kids Shoes" subcategory with nested categories...');
    const kidsShoesRef = await addDoc(collection(db, 'categories', categoryId, 'subcategory'), {
      nameEn: 'Kids Shoes',
      nameAr: 'أحذية الأطفال',
      name: 'Kids Shoes',
      image: '/images/subcategories/kids-shoes.jpg',
      order: 7,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`   ✅ Created: ${kidsShoesRef.id}`);
    
    const kidsShoesNested = [
      { nameEn: 'Girls', nameAr: 'البنات', image: '/images/subcategories/girls-shoes.jpg', order: 1 },
      { nameEn: 'Boys', nameAr: 'الأولاد', image: '/images/subcategories/boys-shoes.jpg', order: 2 },
    ];
    
    for (const item of kidsShoesNested) {
      const nestedRef = await addDoc(collection(db, 'categories', categoryId, 'subcategory', kidsShoesRef.id, 'subcategory'), {
        ...item,
        name: item.nameEn,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`      └─ ${item.nameEn} (${item.nameAr}) - ${nestedRef.id}`);
    }
    
    console.log('\n✅ Kids category structure created successfully!');
    console.log(`\nCategory ID: ${categoryId}`);
    console.log('\nStructure:');
    console.log('الأطفال (Kids)');
    console.log('├─ الرُضّع (Infants)');
    console.log('├─ بلوزات (Tops)');
    console.log('├─ فساتين (Dresses)');
    console.log('├─ سراويل (Bottoms)');
    console.log('├─ أطقم ملابس (Sets)');
    console.log('├─ ملابس نوم (Sleepwear)');
    console.log('└─ أحذية الأطفال (Kids Shoes)');
    console.log('   ├─ البنات (Girls)');
    console.log('   └─ الأولاد (Boys)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

createKidsBabyCategory();
