/**
 * Script to fetch Lebanese areas from various sources
 * Run: node scripts/fetch-lebanon-areas.js
 */

const https = require('https');
const fs = require('fs');

// Method 1: Scrape from OpenStreetMap Overpass API
async function fetchFromOverpass() {
  console.log('🔍 Fetching areas from OpenStreetMap...');
  
  const query = `
    [out:json];
    area["ISO3166-1"="LB"]->.lb;
    (
      node["place"~"city|town|village"]["name:ar"](area.lb);
      way["place"~"city|town|village"]["name:ar"](area.lb);
      relation["place"~"city|town|village"]["name:ar"](area.lb);
    );
    out body;
  `;

  const url = 'https://overpass-api.de/api/interpreter';
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const areas = parsed.elements
            .filter(el => el.tags && el.tags.name && el.tags['name:ar'])
            .map(el => ({
              name: el.tags.name,
              nameAr: el.tags['name:ar'],
              type: el.tags.place,
              lat: el.lat || el.center?.lat,
              lon: el.lon || el.center?.lon,
            }))
            .filter(area => area.lat && area.lon);
          
          resolve(areas);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(`data=${encodeURIComponent(query)}`);
    req.end();
  });
}

// Method 2: Use predefined Lebanese governorates structure
function getLebaneseCities() {
  console.log('📋 Using predefined Lebanese cities database...');
  
  return {
    governorates: [
      {
        id: 'beirut',
        name: 'Beirut',
        nameAr: 'بيروت',
        areas: [
          { name: 'Achrafieh', nameAr: 'الأشرفية' },
          { name: 'Hamra', nameAr: 'الحمرا' },
          { name: 'Verdun', nameAr: 'الفردان' },
          { name: 'Ras Beirut', nameAr: 'رأس بيروت' },
          { name: 'Ain El Mraiseh', nameAr: 'عين المريسة' },
          { name: 'Manara', nameAr: 'المنارة' },
          { name: 'Raouche', nameAr: 'الروشة' },
          { name: 'Ramlet El Bayda', nameAr: 'الرملة البيضا' },
          { name: 'Ain El Tineh', nameAr: 'عين التينة' },
          { name: 'Mazraa', nameAr: 'المزرعة' },
          { name: 'Bachoura', nameAr: 'الباشورة' },
          { name: 'Mar Elias', nameAr: 'مار الياس' },
          { name: 'Tarik Jdideh', nameAr: 'الطريق الجديدة' },
          { name: 'Badaro', nameAr: 'بدارو' },
          { name: 'Geitawi', nameAr: 'الجيتاوي' },
          { name: 'Saifi', nameAr: 'الصيفي' },
          { name: 'Zokak El Blat', nameAr: 'زقاق البلاط' },
          { name: 'Ras El Nabeh', nameAr: 'رأس النبع' },
        ]
      },
      {
        id: 'mount_lebanon',
        name: 'Mount Lebanon',
        nameAr: 'جبل لبنان',
        districts: [
          {
            name: 'Baabda',
            nameAr: 'بعبدا',
            areas: [
              { name: 'Baabda', nameAr: 'بعبدا' },
              { name: 'Hazmieh', nameAr: 'الحازمية' },
              { name: 'Furn El Chebbak', nameAr: 'فرن الشباك' },
              { name: 'Sin El Fil', nameAr: 'سن الفيل' },
              { name: 'Hadath', nameAr: 'حدث' },
              { name: 'Chiyah', nameAr: 'الشياح' },
              { name: 'Ghobeiry', nameAr: 'الغبيري' },
              { name: 'Bir Hassan', nameAr: 'بئر حسن' },
              { name: 'Ouzai', nameAr: 'الأوزاعي' },
              { name: 'Airport Road', nameAr: 'طريق المطار' },
            ]
          },
          {
            name: 'Metn',
            nameAr: 'المتن',
            areas: [
              { name: 'Dekwaneh', nameAr: 'الدكوانة' },
              { name: 'Bourj Hammoud', nameAr: 'برج حمود' },
              { name: 'Jdeideh', nameAr: 'الجديدة' },
              { name: 'Zalka', nameAr: 'الزلقا' },
              { name: 'Antelias', nameAr: 'أنطلياس' },
              { name: 'Jal El Dib', nameAr: 'جل الديب' },
              { name: 'Dbayeh', nameAr: 'الضبية' },
              { name: 'Mansourieh', nameAr: 'المنصورية' },
              { name: 'Beit Mery', nameAr: 'بيت مري' },
              { name: 'Broummana', nameAr: 'برمانا' },
              { name: 'Bikfaya', nameAr: 'بكفيا' },
              { name: 'Bhamdoun', nameAr: 'بحمدون' },
              { name: 'Aintoura', nameAr: 'عينطورة' },
            ]
          },
          {
            name: 'Keserwan',
            nameAr: 'كسروان',
            areas: [
              { name: 'Jounieh', nameAr: 'جونيه' },
              { name: 'Kaslik', nameAr: 'كسليك' },
              { name: 'Adma', nameAr: 'عدما' },
              { name: 'Zouk Mosbeh', nameAr: 'زوق مصبح' },
              { name: 'Sarba', nameAr: 'الصربا' },
              { name: 'Tabarja', nameAr: 'تبرجا' },
              { name: 'Safra', nameAr: 'صفرا' },
              { name: 'Harissa', nameAr: 'حريصا' },
              { name: 'Ghazir', nameAr: 'غزير' },
            ]
          },
          {
            name: 'Chouf',
            nameAr: 'الشوف',
            areas: [
              { name: 'Beiteddine', nameAr: 'بيت الدين' },
              { name: 'Deir El Qamar', nameAr: 'دير القمر' },
              { name: 'Aley', nameAr: 'عاليه' },
              { name: 'Bhamdoun', nameAr: 'بحمدون' },
              { name: 'Souk El Gharb', nameAr: 'سوق الغرب' },
              { name: 'Baakline', nameAr: 'بعقلين' },
              { name: 'Choueifat', nameAr: 'الشويفات' },
              { name: 'Khalde', nameAr: 'خلدة' },
            ]
          }
        ]
      },
      {
        id: 'north',
        name: 'North Lebanon',
        nameAr: 'الشمال',
        areas: [
          { name: 'Tripoli', nameAr: 'طرابلس' },
          { name: 'El Mina', nameAr: 'الميناء' },
          { name: 'Zgharta', nameAr: 'زغرتا' },
          { name: 'Ehden', nameAr: 'إهدن' },
          { name: 'Batroun', nameAr: 'البترون' },
          { name: 'Koura', nameAr: 'الكورة' },
          { name: 'Bcharre', nameAr: 'بشري' },
          { name: 'Byblos', nameAr: 'جبيل' },
          { name: 'Amyoun', nameAr: 'عميون' },
          { name: 'Anfeh', nameAr: 'انفه' },
        ]
      },
      {
        id: 'south',
        name: 'South Lebanon',
        nameAr: 'الجنوب',
        areas: [
          { name: 'Saida', nameAr: 'صيدا' },
          { name: 'Tyre', nameAr: 'صور' },
          { name: 'Nabatieh', nameAr: 'النبطية' },
          { name: 'Jezzine', nameAr: 'جزين' },
          { name: 'Bent Jbeil', nameAr: 'بنت جبيل' },
          { name: 'Marjeyoun', nameAr: 'مرجعيون' },
          { name: 'Hasbaya', nameAr: 'حاصبيا' },
        ]
      },
      {
        id: 'bekaa',
        name: 'Bekaa',
        nameAr: 'البقاع',
        areas: [
          { name: 'Zahle', nameAr: 'زحلة' },
          { name: 'Baalbek', nameAr: 'بعلبك' },
          { name: 'Hermel', nameAr: 'الهرمل' },
          { name: 'Chtaura', nameAr: 'شتورا' },
          { name: 'Rayak', nameAr: 'رياق' },
          { name: 'Aanjar', nameAr: 'عنجر' },
          { name: 'Jeb Jennine', nameAr: 'جب جنين' },
          { name: 'West Bekaa', nameAr: 'البقاع الغربي' },
        ]
      },
      {
        id: 'akkar',
        name: 'Akkar',
        nameAr: 'عكار',
        areas: [
          { name: 'Halba', nameAr: 'حلبا' },
          { name: 'Akkar El Atika', nameAr: 'عكار العتيقة' },
          { name: 'Bire', nameAr: 'البيرة' },
          { name: 'Qobayat', nameAr: 'القبيات' },
          { name: 'Menjez', nameAr: 'منجز' },
        ]
      }
    ]
  };
}

// Method 3: Fetch from Wikipedia (scraping)
async function fetchFromWikipedia() {
  console.log('📚 Note: Wikipedia scraping requires HTML parsing.');
  console.log('   URL: https://ar.wikipedia.org/wiki/قائمة_المدن_والبلدات_اللبنانية');
  return null;
}

// Main execution
async function main() {
  console.log('🇱🇧 Lebanese Areas Fetcher\n');
  
  try {
    // Method 1: Try OpenStreetMap (may be slow)
    console.log('Option 1: Fetch from OpenStreetMap (may take 30-60 seconds)');
    console.log('Option 2: Use predefined database (instant)\n');
    
    // For now, use predefined database
    const data = getLebaneseCities();
    
    // Save to JSON file
    const outputPath = './lebanon-areas.json';
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`\n✅ Success! Data saved to: ${outputPath}`);
    console.log(`\n📊 Statistics:`);
    console.log(`   - Governorates: ${data.governorates.length}`);
    
    let totalAreas = 0;
    data.governorates.forEach(gov => {
      if (gov.areas) {
        totalAreas += gov.areas.length;
      }
      if (gov.districts) {
        gov.districts.forEach(d => totalAreas += d.areas.length);
      }
    });
    
    console.log(`   - Total Areas: ${totalAreas}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Review lebanon-areas.json');
    console.log('   2. Add pricing for each area');
    console.log('   3. Import into your checkout-details.tsx');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
