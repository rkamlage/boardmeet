const fs = require('fs');
const files = fs.readdirSync('dist/assets').filter(f => f.endsWith('.css'));
const css = fs.readFileSync('dist/assets/' + files[0], 'utf8');
console.log('mx-auto:', css.includes('mx-auto'));
console.log('p-6:', css.includes('p-6'));
console.log('max-w-2xl:', css.includes('max-w-2xl'));
