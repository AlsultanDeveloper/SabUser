const fs = require('fs');

const fileContent = fs.readFileSync('app/product/[id].tsx', 'utf8');
const lines = fileContent.split('\n');

const problems = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  // Pattern 1: {something} {something} - space between two {}
  if (line.match(/\{[^}]+\}\s+\{[^}]+\}/)) {
    problems.push({
      line: lineNum,
      content: line.trim(),
      issue: 'Space between two {} expressions'
    });
  }
  
  // Pattern 2: } / { or } / or / {
  if (line.match(/\}\s*\/\s*\{/) || line.match(/\{\s*[^}]*\s*\}\s*\/\s*\{/)) {
    problems.push({
      line: lineNum,
      content: line.trim(),
      issue: 'Slash (/) between {} expressions'
    });
  }
  
  // Pattern 3: Plain text after >
  if (line.match(/>\s+[a-zA-Z]/)) {
    // Check if it's not inside a <Text> tag
    if (!line.includes('<Text') && !line.includes('</Text>')) {
      problems.push({
        line: lineNum,
        content: line.trim(),
        issue: 'Possible text without <Text> wrapper'
      });
    }
  }
});

console.log('===== FOUND ISSUES =====');
problems.forEach(p => {
  console.log(`\nLine ${p.line}: ${p.issue}`);
  console.log(`Content: ${p.content}`);
});

console.log(`\n\nTotal issues found: ${problems.length}`);
