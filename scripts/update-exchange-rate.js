/**
 * Update Exchange Rate Script
 * 
 * هذا السكريبت يُستخدم لتحديث سعر صرف الدولار مقابل الليرة اللبنانية في Firebase
 * 
 * كيفية الاستخدام:
 * node update-exchange-rate.js 89700
 */

const admin = require('firebase-admin');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.log('\n⚠️  يرجى التأكد من وجود ملف firebase-service-account.json');
    process.exit(1);
  }
}

const db = admin.firestore();

async function updateExchangeRate(newRate) {
  try {
    // التحقق من صحة المدخل
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      throw new Error('السعر يجب أن يكون رقم موجب');
    }

    console.log(`📊 تحديث سعر الصرف إلى: 1 USD = ${rate.toLocaleString('en-US')} LBP`);

    // تحديث الإعدادات في Firebase
    const settingsRef = db.collection('settings').doc('app');
    
    // التحقق من وجود المستند
    const doc = await settingsRef.get();
    
    if (!doc.exists) {
      // إنشاء مستند جديد
      await settingsRef.set({
        currency: {
          default: 'USD',
          supported: ['USD', 'LBP'],
          usdToLbp: rate
        },
        shipping: {
          cost: 15,
          freeShippingThreshold: 100,
          currency: 'USD',
          enabled: true
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ تم إنشاء مستند الإعدادات بنجاح');
    } else {
      // تحديث المستند الموجود
      await settingsRef.set({
        currency: {
          ...(doc.data()?.currency || {}),
          usdToLbp: rate
        }
      }, { merge: true });
      console.log('✅ تم تحديث سعر الصرف بنجاح');
    }

    // قراءة القيمة المحدثة للتأكيد
    const updatedDoc = await settingsRef.get();
    const currentRate = updatedDoc.data()?.currency?.usdToLbp;
    
    console.log('\n📱 السعر الحالي في التطبيق:');
    console.log(`   1.00 USD = ${currentRate?.toLocaleString('en-US') || 'غير محدد'} LBP`);
    console.log('\n✨ سيظهر السعر الجديد فوراً في التطبيق!');

  } catch (error) {
    console.error('❌ خطأ في تحديث سعر الصرف:', error.message);
    process.exit(1);
  }
}

// الحصول على السعر من المدخلات
const newRate = process.argv[2];

if (!newRate) {
  console.log(`
📊 سكريبت تحديث سعر الصرف USD/LBP

الاستخدام:
  node update-exchange-rate.js <السعر>

مثال:
  node update-exchange-rate.js 89700
  node update-exchange-rate.js 90000

السعر الحالي الافتراضي: 89,700 LBP
  `);
  process.exit(0);
}

updateExchangeRate(newRate)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
