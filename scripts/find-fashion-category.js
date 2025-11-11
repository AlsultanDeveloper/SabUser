const admin = require('firebase-admin');
const serviceAccount = require('../sab-store-9b947-c4c70b420847.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function findFashionCategory() {
  try {
    const categoriesSnapshot = await db.collection('categories').get();
    
    console.log('\n📁 All Categories:');
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      const name = typeof data.name === 'object' ? data.name.en : data.name;
      console.log(`  - ${name} (ID: ${doc.id})`);
      
      if (name && name.toLowerCase().includes('fashion')) {
        console.log(`\n✅ FOUND Fashion Category:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Name: ${JSON.stringify(data.name)}`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findFashionCategory();
