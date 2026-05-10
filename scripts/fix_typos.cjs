const fs = require('fs');
const path = require('path');

const typoMap = {
  'Ghee Podi Dosa': '/images/menu/dhee_podi_dosa.jpg',
  'Lucknowi Mutton Biryani': '/images/menu/lucknowi_mutton_niryani.jpg',
  'Samosa Chaat': '/images/menu/samosa_chat.jpg',
  'Seekh Kebab': '/images/menu/seekh_kabab.avif',
  'Hara Bhara Kebab': '/images/menu/hara_bhara_kabab.webp',
  'Malabar Parotta With Chicken Curry': '/images/menu/malabar_paratha_with_chicken_curry.avif',
  'Jalebi Rabri': '/images/menu/jalebi_rabari.jpg'
};

const rootDir = process.cwd();
const menuPath = path.join(rootDir, 'src', 'data', 'menu.ts');
const migratePath = path.join(rootDir, 'backend', 'migrate.ts');

let menuContent = fs.readFileSync(menuPath, 'utf-8');
let migrateContent = fs.readFileSync(migratePath, 'utf-8');

for (const [dishName, url] of Object.entries(typoMap)) {
  const menuRegex = new RegExp(`(name:\\s*'${dishName}',[\\s\\S]*?image:\\s*)'[^']+'`, 'g');
  menuContent = menuContent.replace(menuRegex, (m, p1) => `${p1}'${url}'`);

  const migrateRegex = new RegExp(`(\\('${dishName}'|'[^']+',\\s*'${dishName}',\\s*'[^']*',\\s*\\d+,\\s*)'[^']+'`, 'g');
  migrateContent = migrateContent.replace(migrateRegex, (m, p1) => `${p1}'${url}'`);
}

fs.writeFileSync(menuPath, menuContent);
fs.writeFileSync(migratePath, migrateContent);

console.log('Typo files mapped!');
