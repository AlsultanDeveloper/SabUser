const fs = require('fs');

const lines = fs.readFileSync('areas-clean.csv', 'utf8').split('\n').filter(l => l.trim());

const processArea = (line, basePrice) => {
  const parts = line.split(',');
  const name = parts[2];
  if (!name) return null;
  return `        { name: '${name}', nameAr: '${name}', price: ${basePrice} }`;
};

const akkar = lines
  .filter(l => l.startsWith('akkar,') && l.split(',')[1])
  .map(l => processArea(l, 20))
  .filter(Boolean);

const tripoli = lines
  .filter(l => l.startsWith('tripoli,') && l.split(',')[1])
  .map(l => processArea(l, 15))
  .filter(Boolean);

const koura = lines
  .filter(l => l.startsWith('koura,') && l.split(',')[1])
  .map(l => processArea(l, 18))
  .filter(Boolean);

const zgharta = lines
  .filter(l => l.startsWith('zgharta,') && l.split(',')[1])
  .map(l => processArea(l, 18))
  .filter(Boolean);

const code = `    {
      id: 'akkar',
      name: 'Akkar',
      nameAr: 'عكار',
      active: true,
      areas: [
${akkar.join(',\n')}
      ]
    },
    {
      id: 'tripoli',
      name: 'Tripoli',
      nameAr: 'طرابلس',
      active: true,
      areas: [
${tripoli.join(',\n')}
      ]
    },
    {
      id: 'koura',
      name: 'Koura',
      nameAr: 'الكورة',
      active: true,
      areas: [
${koura.join(',\n')}
      ]
    },
    {
      id: 'zgharta',
      name: 'Zgharta',
      nameAr: 'زغرتا',
      active: true,
      areas: [
${zgharta.join(',\n')}
      ]
    }`;

console.log('📊 الإحصائيات:');
console.log(`عكار: ${akkar.length} منطقة`);
console.log(`طرابلس: ${tripoli.length} منطقة`);
console.log(`الكورة: ${koura.length} منطقة`);
console.log(`زغرتا: ${zgharta.length} منطقة`);
console.log(`الإجمالي: ${akkar.length + tripoli.length + koura.length + zgharta.length} منطقة`);
console.log('\n✅ تم توليد الكود في ملف governorates-code.txt');

fs.writeFileSync('governorates-code.txt', code);
