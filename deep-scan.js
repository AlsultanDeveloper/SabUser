const fs = require('fs');

const fileContent = fs.readFileSync('app/product/[id].tsx', 'utf8');
const lines = fileContent.split('\n');

console.log('Checking each line with JSX expressions...\n');

let inTextTag = false;
let textDepth = 0;

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  // Track <Text> tags
  const textOpens = (line.match(/<Text[^>]*>/g) || []).length;
  const textCloses = (line.match(/<\/Text>/g) || []).length;
  
  textDepth += textOpens - textCloses;
  
  // Find all {} expressions
  const expressions = line.match(/\{[^}]+\}/g);
  
  if (expressions) {
    expressions.forEach(expr => {
      // Skip if it's a style object, function, or prop
      if (expr.includes('style=') || expr.includes('=>') || expr.includes('onPress') || expr.includes('key=')) {
        return;
      }
      
      // Check if this line has <Text> or we're inside a Text block
      const hasText = line.includes('<Text') || textDepth > 0;
      
      // Check if it's rendering a value (not just a function call or comparison)
      const isRenderingValue = !expr.includes('===') && 
                                !expr.includes('!==') && 
                                !expr.includes('typeof') &&
                                !expr.includes('&&') &&
                                !expr.includes('||') &&
                                !expr.includes('?') &&
                                !expr.includes('.map(') &&
                                !expr.includes('.some(') &&
                                !expr.includes('.filter(') &&
                                !expr.includes('Math.') &&
                                expr.length > 3; // Ignore very short expressions
      
      if (isRenderingValue && !hasText && !expr.includes('styles.')) {
        console.log(`⚠️  Line ${lineNum}: ${expr}`);
        console.log(`   Context: ${line.trim()}`);
        console.log(`   Text depth: ${textDepth}\n`);
      }
    });
  }
});

console.log('\nScan complete.');
