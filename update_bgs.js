const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk(path.join(__dirname, 'client/src/pages'));

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content.replace(/className=(['"])([^'"]*)min-h-screen([^'"]*)(['"])/g, (match, p1, p2, p3, p4) => {
    let fullClass = p2 + 'min-h-screen' + p3;
    fullClass = fullClass.replace(/bg-gradient-to-[a-z]+ /g, '');
    fullClass = fullClass.replace(/from-[a-zA-Z0-9-]+ /g, '');
    fullClass = fullClass.replace(/via-[a-zA-Z0-9-]+ /g, '');
    fullClass = fullClass.replace(/to-[a-zA-Z0-9-]+ /g, '');
    fullClass = fullClass.replace(/bg-\[?[a-zA-Z0-9#\/-]+\]? /g, '');
    fullClass = fullClass.replace(/bg-[a-zA-Z0-9-]+ /g, '');
    
    fullClass = fullClass.replace(/bg-gradient-to-[a-z]+$/, '');
    fullClass = fullClass.replace(/from-[a-zA-Z0-9-]+$/, '');
    fullClass = fullClass.replace(/via-[a-zA-Z0-9-]+$/, '');
    fullClass = fullClass.replace(/to-[a-zA-Z0-9-]+$/, '');
    fullClass = fullClass.replace(/bg-\[?[a-zA-Z0-9#\/-]+\]?$/, '');
    fullClass = fullClass.replace(/bg-[a-zA-Z0-9-]+$/, '');
    
    fullClass = fullClass.replace(/\s+/g, ' ').trim();
    return `className=${p1}bg-gradient-to-b from-white via-sky-50 to-blue-50 ${fullClass}${p4}`;
  });

  if (updated !== content) {
    fs.writeFileSync(file, updated);
    console.log(`Updated ${file}`);
    count++;
  }
});
console.log(`Updated ${count} files.`);
