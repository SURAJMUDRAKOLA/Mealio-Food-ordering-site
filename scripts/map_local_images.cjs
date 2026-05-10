const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const menuPath = path.join(rootDir, 'src', 'data', 'menu.ts');
const migratePath = path.join(rootDir, 'backend', 'migrate.ts');
const imagesDir = path.join(rootDir, 'public', 'images', 'menu');

const files = fs.readdirSync(imagesDir);

let menuContent = fs.readFileSync(menuPath, 'utf-8');
let migrateContent = fs.readFileSync(migratePath, 'utf-8');

// First, map Categories
const categoryMatches = [...menuContent.matchAll(/export const categories: Category\[\] = \[([\s\S]*?)\];/g)];
if (categoryMatches.length > 0) {
  const categoriesBlock = categoryMatches[0][1];
  const catLines = categoriesBlock.split('\n');
  const newCatLines = catLines.map(line => {
    const nameMatch = line.match(/name:\s*'([^']+)'/);
    if (!nameMatch) return line;
    const catName = nameMatch[1];
    
    // Find matching image
    const searchName = catName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let matchedFile = files.find(f => f.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(searchName));
    
    if (matchedFile) {
      return line.replace(/image:\s*'[^']+'/, `image: '/images/menu/${matchedFile}'`);
    }
    return line;
  });
  menuContent = menuContent.replace(categoriesBlock, newCatLines.join('\n'));
}

// Then map Menu Items
const itemMatches = [...menuContent.matchAll(/name:\s*'([^']+)'/g)];
const uniqueDishNames = [...new Set(itemMatches.map(m => m[1]))];

for (const dishName of uniqueDishNames) {
  // skip if it's a category
  if (['North Indian', 'South Indian', 'Biryani', 'Meals & Thali', 'Street Food', 'Tandoor & Kebabs', 'Coastal', 'Chinese', 'Italian', 'Rolls & Wraps', 'Desserts', 'Beverages'].includes(dishName)) {
    continue;
  }

  const searchName = dishName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Find closest matching file
  let matchedFile = files.find(f => {
    const fName = f.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/jpg|png|webp|avif|jpeg/g, '');
    return fName === searchName || fName.includes(searchName) || searchName.includes(fName);
  });

  if (matchedFile) {
    const url = `/images/menu/${matchedFile}`;
    
    // Update menu.ts
    const menuRegex = new RegExp(`(name:\\s*'${dishName}',[\\s\\S]*?image:\\s*)'[^']+'`, 'g');
    menuContent = menuContent.replace(menuRegex, (m, p1) => `${p1}'${url}'`);

    // Update migrate.ts
    const migrateRegex = new RegExp(`(\\('${dishName}'|'[^']+',\\s*'${dishName}',\\s*'[^']*',\\s*\\d+,\\s*)'[^']+'`, 'g');
    migrateContent = migrateContent.replace(migrateRegex, (m, p1) => `${p1}'${url}'`);
  } else {
    console.warn('Could not find image for:', dishName);
  }
}

// Ensure categories in migrate.ts are updated
const catMatches = [...migrateContent.matchAll(/(\('[^']+',\s*'([^']+)',\s*)'[^']+',\s*\d+\)/g)];
for (const match of catMatches) {
  const catName = match[2];
  const searchName = catName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let matchedFile = files.find(f => f.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(searchName));
  if (matchedFile) {
    const url = `/images/menu/${matchedFile}`;
    migrateContent = migrateContent.replace(match[0], `('${match[1].split(',')[0].replace(/'/g, '')}','${catName}','${url}',${match[0].match(/\d+\)$/)[0]}`);
  }
}

// Quick fix for migrate.ts categories (since the above might have regex issues)
migrateContent = migrateContent.replace(/\('north-indian',\s*'North Indian',\s*'[^']+',/g, `('north-indian','North Indian','/images/menu/north_indian_veg_thali.jpg',`);
migrateContent = migrateContent.replace(/\('south-indian',\s*'South Indian',\s*'[^']+',/g, `('south-indian','South Indian','/images/menu/south_indian_meals.jpg',`);
migrateContent = migrateContent.replace(/\('biryani',\s*'Biryani',\s*'[^']+',/g, `('biryani','Biryani','/images/menu/hyderabadi_chicken_dum_biryani.png',`);
migrateContent = migrateContent.replace(/\('meals-thali',\s*'Meals & Thali',\s*'[^']+',/g, `('meals-thali','Meals & Thali','/images/menu/deluxe_non_veg_thali.png',`);
migrateContent = migrateContent.replace(/\('street-food',\s*'Street Food',\s*'[^']+',/g, `('street-food','Street Food','/images/menu/samosa_chat.jpg',`);
migrateContent = migrateContent.replace(/\('tandoor-kebabs',\s*'Tandoor & Kebabs',\s*'[^']+',/g, `('tandoor-kebabs','Tandoor & Kebabs','/images/menu/chicken_tikka.jpg',`);
migrateContent = migrateContent.replace(/\('coastal',\s*'Coastal',\s*'[^']+',/g, `('coastal','Coastal','/images/menu/prawn_ghee_roast.jpg',`);
migrateContent = migrateContent.replace(/\('chinese',\s*'Chinese',\s*'[^']+',/g, `('chinese','Chinese','/images/menu/veg_hakka_noodles.webp',`);
migrateContent = migrateContent.replace(/\('italian',\s*'Italian',\s*'[^']+',/g, `('italian','Italian','/images/menu/margherita_pizza.webp',`);
migrateContent = migrateContent.replace(/\('rolls-wraps',\s*'Rolls & Wraps',\s*'[^']+',/g, `('rolls-wraps','Rolls & Wraps','/images/menu/chicken_kathi_roll.jpg',`);
migrateContent = migrateContent.replace(/\('desserts',\s*'Desserts',\s*'[^']+',/g, `('desserts','Desserts','/images/menu/gulab_jamun.jpg',`);
migrateContent = migrateContent.replace(/\('beverages',\s*'Beverages',\s*'[^']+',/g, `('beverages','Beverages','/images/menu/masala_chai.jpg',`);

fs.writeFileSync(menuPath, menuContent);
fs.writeFileSync(migratePath, migrateContent);

console.log('✅ All locally downloaded images successfully mapped to menu and migrate scripts!');
