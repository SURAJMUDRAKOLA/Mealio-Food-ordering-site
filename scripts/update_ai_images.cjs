const fs = require('fs');
const path = require('path');

const map = {
  'Chole Bhature': '/images/menu/chole_bhature.png',
  'Masala Dosa': '/images/menu/masala_dosa.png',
  'Idli Vada Combo': '/images/menu/idli_vada_combo.png',
  'Hyderabadi Chicken Dum Biryani': '/images/menu/hyderabadi_chicken_dum_biryani.png'
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

console.log('Batch 2 mapped successfully!');
