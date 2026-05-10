const fs = require('fs');
const path = require('path');
const https = require('https');

const wikiMap = {
  'Butter Chicken': 'Butter_chicken',
  'Paneer Butter Masala': 'Paneer_makhani',
  'Dal Makhani': 'Dal_makhani',
  'Chicken Tikka Masala': 'Chicken_tikka_masala',
  'Chole Bhature': 'Chole_bhature',
  'Rajma Chawal': 'Rajma',
  'Kadhai Paneer': 'Kadai_paneer',
  'Masala Dosa': 'Dosa_(food)',
  'Idli Vada Combo': 'Idli',
  'Ghee Podi Dosa': 'Dosa_(food)',
  'Mysore Masala Dosa': 'Dosa_(food)',
  'Hyderabadi Chicken Dum Biryani': 'Biryani',
  'Mutton Dum Biryani': 'Biryani',
  'Veg Dum Biryani': 'Biryani',
  'Kolkata Chicken Biryani': 'Biryani',
  'Prawn Biryani': 'Biryani',
  'North Indian Veg Thali': 'Thali',
  'South Indian Meals': 'Thali',
  'Deluxe Non-Veg Thali': 'Thali',
  'Pav Bhaji': 'Pav_bhaji',
  'Pani Puri': 'Panipuri',
  'Vada Pav': 'Vada_pav',
  'Samosa Chaat': 'Samosa',
  'Tandoori Chicken Half': 'Tandoori_chicken',
  'Paneer Tikka': 'Paneer_tikka',
  'Seekh Kebab': 'Seekh_kebab',
  'Afghani Chicken': 'Tandoori_chicken',
  'Goan Fish Curry Rice': 'Fish_curry',
  'Prawn Ghee Roast': 'Prawn_roast',
  'Malabar Parotta With Chicken': 'Parotta',
  'Veg Hakka Noodles': 'Hakka_noodles',
  'Chicken Schezwan Noodles': 'Szechuan_cuisine',
  'Chilli Chicken': 'Chilli_chicken',
  'Veg Manchurian Gravy': 'Manchurian_(dish)',
  'Margherita Pizza': 'Pizza_Margherita',
  'Farmhouse Pizza': 'Pizza',
  'Penne Alfredo': 'Fettuccine_Alfredo',
  'Chicken Lasagna': 'Lasagne',
  'Paneer Tikka Roll': 'Kati_roll',
  'Chicken Kathi Roll': 'Kati_roll',
  'Chicken Shawarma Roll': 'Shawarma',
  'Gulab Jamun': 'Gulab_jamun',
  'Rasmalai': 'Ras_malai',
  'Chocolate Lava Cake': 'Molten_chocolate_cake',
  'Kulfi Falooda': 'Kulfi',
  'Mango Lassi': 'Lassi',
  'Masala Chai': 'Masala_chai',
  'Cold Coffee': 'Iced_coffee',
  'Fresh Lime Soda': 'Limeade',
  // Categories
  'North Indian': 'North_Indian_cuisine',
  'South Indian': 'South_Indian_cuisine',
  'Biryani': 'Biryani',
  'Meals & Thali': 'Thali',
  'Street Food': 'Street_food_of_Chennai',
  'Tandoor & Kebabs': 'Tandoor',
  'Coastal': 'Mangalorean_cuisine',
  'Chinese': 'Indian_Chinese_cuisine',
  'Italian': 'Italian_cuisine',
  'Rolls & Wraps': 'Kati_roll',
  'Desserts': 'List_of_Indian_sweets_and_desserts',
  'Beverages': 'Masala_chai',
  // specific overrides for biryanis so they don't look exactly identical
  'Hyderabadi Chicken Dum Biryani_OVERRIDE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/800px-%22Hyderabadi_Dum_Biryani%22.jpg',
  'Veg Dum Biryani_OVERRIDE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Biryani_of_Lahore.jpg/800px-Biryani_of_Lahore.jpg'
};

const fetchWikiImage = (title) => {
  return new Promise((resolve) => {
    if (title.startsWith('http')) return resolve(title);
    
    const url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=800&titles=' + encodeURIComponent(title);
    https.get(url, { headers: { 'User-Agent': 'MealioBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

async function run() {
  console.log('Fetching verified Wikimedia Commons thumbnails (800px) ...');
  const resolvedMap = {};
  
  for (const [name, title] of Object.entries(wikiMap)) {
    if (name.includes('_OVERRIDE')) continue;
    
    const overrideKey = name + '_OVERRIDE';
    if (wikiMap[overrideKey]) {
      resolvedMap[name] = wikiMap[overrideKey];
      continue;
    }

    const url = await fetchWikiImage(title);
    resolvedMap[name] = url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/800px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg';
  }

  const rootDir = process.cwd();
  
  // Clean up menu.ts
  const menuPath = path.join(rootDir, 'src', 'data', 'menu.ts');
  let menuContent = fs.readFileSync(menuPath, 'utf-8');
  
  // Erase the old Unsplash pools and categories consts
  menuContent = menuContent.replace(/const images = \{[\s\S]*?\};\n\n/g, '');
  menuContent = menuContent.replace(/const dishImagePools: Record<string, string\[\]> = \{[\s\S]*?\};\n\n/g, '');
  
  // Replace categories array
  menuContent = menuContent.replace(/export const categories: Category\[\] = \[[\s\S]*?\];\n\n/g, () => {
    return 'export const categories: Category[] = [\n' +
      \"  { id: 'north-indian', name: 'North Indian', image: '\" + resolvedMap['North Indian'] + \"' },\n\" +
      \"  { id: 'south-indian', name: 'South Indian', image: '\" + resolvedMap['South Indian'] + \"' },\n\" +
      \"  { id: 'biryani', name: 'Biryani', image: '\" + resolvedMap['Biryani'] + \"' },\n\" +
      \"  { id: 'meals-thali', name: 'Meals & Thali', image: '\" + resolvedMap['Meals & Thali'] + \"' },\n\" +
      \"  { id: 'street-food', name: 'Street Food', image: '\" + resolvedMap['Street Food'] + \"' },\n\" +
      \"  { id: 'tandoor-kebabs', name: 'Tandoor & Kebabs', image: '\" + resolvedMap['Tandoor & Kebabs'] + \"' },\n\" +
      \"  { id: 'coastal', name: 'Coastal', image: '\" + resolvedMap['Coastal'] + \"' },\n\" +
      \"  { id: 'chinese', name: 'Chinese', image: '\" + resolvedMap['Chinese'] + \"' },\n\" +
      \"  { id: 'italian', name: 'Italian', image: '\" + resolvedMap['Italian'] + \"' },\n\" +
      \"  { id: 'rolls-wraps', name: 'Rolls & Wraps', image: '\" + resolvedMap['Rolls & Wraps'] + \"' },\n\" +
      \"  { id: 'desserts', name: 'Desserts', image: '\" + resolvedMap['Desserts'] + \"' },\n\" +
      \"  { id: 'beverages', name: 'Beverages', image: '\" + resolvedMap['Beverages'] + \"' },\n\" +
      '];\n\n';
  });

  // Replace menu items images
  menuContent = menuContent.replace(/(name:\s*'([^']+)',[\s\S]*?image:\s*)(images\.[a-zA-Z]+|'[^']+')/g, (match, prefix, name) => {
    if (resolvedMap[name]) {
      return prefix + \"'\" + resolvedMap[name] + \"'\";
    }
    return prefix + \"'\" + resolvedMap['Butter Chicken'] + \"'\"; // generic fallback
  });
  
  fs.writeFileSync(menuPath, menuContent);

  // Update migrate.ts
  const migratePath = path.join(rootDir, 'backend', 'migrate.ts');
  let migrateContent = fs.readFileSync(migratePath, 'utf-8');
  
  // Replace categories in SQL
  migrateContent = migrateContent.replace(/\('north-indian','North Indian','[^']+',1\)/, \"('north-indian','North Indian','\" + resolvedMap['North Indian'] + \"',1)\");
  migrateContent = migrateContent.replace(/\('south-indian','South Indian','[^']+',2\)/, \"('south-indian','South Indian','\" + resolvedMap['South Indian'] + \"',2)\");
  migrateContent = migrateContent.replace(/\('biryani','Biryani','[^']+',3\)/, \"('biryani','Biryani','\" + resolvedMap['Biryani'] + \"',3)\");
  migrateContent = migrateContent.replace(/\('meals-thali','Meals & Thali','[^']+',4\)/, \"('meals-thali','Meals & Thali','\" + resolvedMap['Meals & Thali'] + \"',4)\");
  migrateContent = migrateContent.replace(/\('street-food','Street Food','[^']+',5\)/, \"('street-food','Street Food','\" + resolvedMap['Street Food'] + \"',5)\");
  migrateContent = migrateContent.replace(/\('tandoor-kebabs','Tandoor & Kebabs','[^']+',6\)/, \"('tandoor-kebabs','Tandoor & Kebabs','\" + resolvedMap['Tandoor & Kebabs'] + \"',6)\");
  migrateContent = migrateContent.replace(/\('coastal','Coastal','[^']+',7\)/, \"('coastal','Coastal','\" + resolvedMap['Coastal'] + \"',7)\");
  migrateContent = migrateContent.replace(/\('chinese','Chinese','[^']+',8\)/, \"('chinese','Chinese','\" + resolvedMap['Chinese'] + \"',8)\");
  migrateContent = migrateContent.replace(/\('italian','Italian','[^']+',9\)/, \"('italian','Italian','\" + resolvedMap['Italian'] + \"',9)\");
  migrateContent = migrateContent.replace(/\('rolls-wraps','Rolls & Wraps','[^']+',10\)/, \"('rolls-wraps','Rolls & Wraps','\" + resolvedMap['Rolls & Wraps'] + \"',10)\");
  migrateContent = migrateContent.replace(/\('desserts','Desserts','[^']+',11\)/, \"('desserts','Desserts','\" + resolvedMap['Desserts'] + \"',11)\");
  migrateContent = migrateContent.replace(/\('beverages','Beverages','[^']+',12\)/, \"('beverages','Beverages','\" + resolvedMap['Beverages'] + \"',12)\");
  
  // Replace menu items in SQL
  migrateContent = migrateContent.replace(/(\('[^']+',\s*'([^']+)',\s*'[^']*',\s*\d+,\s*)'[^']+'/g, (match, prefix, name) => {
    if (resolvedMap[name]) {
      return prefix + \"'\" + resolvedMap[name] + \"'\";
    }
    return prefix + \"'\" + resolvedMap['Butter Chicken'] + \"'\";
  });

  fs.writeFileSync(migratePath, migrateContent);

  console.log('✅ Nuked Unsplash and hardcoded all Wiki images!');
}

run();
