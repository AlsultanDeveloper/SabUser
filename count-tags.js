const fs = require('fs');

const fileContent = fs.readFileSync('app/product/[id].tsx', 'utf8');

const openTags = (fileContent.match(/<Text[^>]*>/g) || []).length;
const closeTags = (fileContent.match(/<\/Text>/g) || []).length;

console.log(`Opening <Text> tags: ${openTags}`);
console.log(`Closing </Text> tags: ${closeTags}`);
console.log(`Difference: ${openTags - closeTags}`);

if (openTags !== closeTags) {
  console.log('\n⚠️  UNBALANCED TEXT TAGS!');
  if (openTags > closeTags) {
    console.log(`Missing ${openTags - closeTags} closing </Text> tag(s)`);
  } else {
    console.log(`Extra ${closeTags - openTags} closing </Text> tag(s)`);
  }
}
