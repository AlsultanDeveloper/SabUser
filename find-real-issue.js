const fs = require('fs');

const fileContent = fs.readFileSync('app/product/[id].tsx', 'utf8');
const lines = fileContent.split('\n');

const problems = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  // Check for: {product.something || product.something}
  if (line.match(/\{[^}]*product\.[a-zA-Z]+\s*\|\|\s*product\.[a-zA-Z]+[^}]*\}/)) {
    // Make sure it's not inside a <Text>
    if (!line.includes('<Text')) {
      problems.push({
        line: lineNum,
        content: line.trim(),
        issue: 'Direct render of product.x || product.y (might be undefined)'
      });
    }
  }
  
  // Check for: {product.brandName || product.brand}
  if (line.match(/\{[^<]*\(product\.brandName\s*\|\|\s*product\.brand\)/)) {
    if (!line.includes('<Text')) {
      problems.push({
        line: lineNum,
        content: line.trim(),
        issue: 'brandName || brand outside Text'
      });
    }
  }
  
  // Check for conditional rendering that might produce text
  // Pattern: {condition && <View>...{variable}
  if (line.match(/\{[^}]*&&\s*<View/) || line.match(/\{[^}]*\?\s*<View/)) {
    const nextLines = lines.slice(index, Math.min(index + 10, lines.length));
    const block = nextLines.join('\n');
    
    // Check if there's a variable render without <Text> in the next few lines
    if (block.match(/>\s*\{[^}]+\}\s*</) && !block.match(/<Text/)) {
      problems.push({
        line: lineNum,
        content: line.trim() + ' (check next 10 lines)',
        issue: 'Conditional View with possible naked variable'
      });
    }
  }
});

console.log('===== REAL ISSUES =====');
if (problems.length === 0) {
  console.log('No obvious issues found. The problem might be:');
  console.log('1. A number being rendered directly: {someNumber}');
  console.log('2. A boolean coerced to string');
  console.log('3. An empty string or null being rendered');
  console.log('4. A conditional that returns undefined');
} else {
  problems.forEach(p => {
    console.log(`\nLine ${p.line}: ${p.issue}`);
    console.log(`Content: ${p.content}`);
  });
}

console.log(`\n\nTotal real issues found: ${problems.length}`);

// Also search for specific dangerous patterns
console.log('\n\n===== DANGEROUS PATTERNS =====');
const dangerous = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  // Direct number render
  if (line.match(/>\s*\{\d+\}\s*</) && !line.includes('<Text')) {
    dangerous.push({ line: lineNum, pattern: 'Direct number', content: line.trim() });
  }
  
  // Empty conditional
  if (line.match(/\{[^}]*&&\s*$/)) {
    dangerous.push({ line: lineNum, pattern: 'Incomplete conditional', content: line.trim() });
  }
});

if (dangerous.length > 0) {
  dangerous.forEach(d => {
    console.log(`\nLine ${d.line}: ${d.pattern}`);
    console.log(`Content: ${d.content}`);
  });
} else {
  console.log('None found.');
}
