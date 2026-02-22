const fs = require('fs');
const path = '/Users/zbencsik/.gemini/antigravity/brain/6fcc3a19-ddb6-4b8e-94e6-605e55f118b0/.system_generated/steps/1114/output.txt';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const outPath = './types_db.ts';
fs.writeFileSync(outPath, data.types);
console.log('Fixed types in ' + outPath);
