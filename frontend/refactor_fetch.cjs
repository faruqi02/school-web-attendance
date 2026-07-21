const fs = require('fs');
const path = require('path');
const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (content.includes("fetch('/api/")) {
    content = content.replace(/fetch\('\/api\//g, "fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/");
    modified = true;
  }
  
  if (content.includes("fetch(`/api/")) {
    content = content.replace(/fetch\(`\/api\//g, "fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file);
  }
}
