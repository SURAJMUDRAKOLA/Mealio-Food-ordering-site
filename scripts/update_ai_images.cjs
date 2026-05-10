const fs = require('fs');
const path = require('path');

const map = {
  'Paneer Butter Masala': '/images/menu/paneer_butter_masala.png',
  'Dal Makhani': '/images/menu/dal_makhani.png',
  'Chicken Tikka Masala': '/images/menu/chicken_tikka_masala.png'
};

const rootDir = process.cwd();
const menuPath = path.join(rootDir, 'src', 'data', 'menu.ts');
let menuContent = fs.readFileSync(menuPath, 'utf-8');

for (const [name, url] of Object.entries(map)) {
  const re = new RegExp(`(name:\\s*'${name}',[\\s\\S]*?image:\\s*)'[^']+'`, 'g');
  menuContent = menuContent.replace(re, (match, p1) => p1 + `'${url}'`);
}
fs.writeFileSync(menuPath, menuContent);

const migratePath = path.join(rootDir, 'backend', 'migrate.ts');
let migrateContent = fs.readFileSync(migratePath, 'utf-8');

for (const [name, url] of Object.entries(map)) {
  const re = new RegExp(`(\\('${name}'|'[^']+',\\s*'${name}',\\s*'[^']*',\\s*\\d+,\\s*)'[^']+'`, 'g');
  migrateContent = migrateContent.replace(re, (match, p1) => p1 + `'${url}'`);
}
fs.writeFileSync(migratePath, migrateContent);

console.log('Images mapped successfully!');
