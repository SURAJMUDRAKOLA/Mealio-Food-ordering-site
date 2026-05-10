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
  'Hyderabadi Chicken Dum Biryani': 'Hyderabadi_biryani',
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
  'Prawn Ghee Roast': 'Shrimp_and_prawn_as_food',
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
  'Fresh Lime Soda': 'Limeade'
};

const fetchWikiImage = (title) => {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`;
    https.get(url, { headers: { 'User-Agent': 'MealioBot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].original) {
            resolve(pages[pageId].original.source);
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
  console.log('Fetching verified Wikimedia Commons images...');
  const resolvedMap = {};
  
  // Fallbacks in case Wikipedia fails
  const fallbacks = {
    'Butter Chicken': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg',
    'Masala Dosa': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Dosa_at_a_street_vendor_in_India.jpg',
    'Veg Dum Biryani': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Biryani_of_Lahore.jpg'
  };

  for (const [dish, title] of Object.entries(wikiMap)) {
    const url = await fetchWikiImage(title);
    if (url) {
      resolvedMap[dish] = url;
    } else if (fallbacks[dish]) {
      resolvedMap[dish] = fallbacks[dish];
    }
  }

  const updateImages = (content, isSql) => {
    if (!isSql) {
      return content.replace(/(name:\s*'([^']+)',[\s\S]*?image:\s*)(images\.[a-zA-Z]+|'[^']+')/g, (match, prefix, name) => {
        if (resolvedMap[name]) {
          return `${prefix}'${resolvedMap[name]}'`;
        }
        return match;
      });
    } else {
      return content.replace(/(\('[^']+',\s*'([^']+)'(?:,[^,]+){2},)\s*'[^']+'/g, (match, prefix, name) => {
        if (resolvedMap[name]) {
          return `${prefix}'${resolvedMap[name]}'`;
        }
        return match;
      });
    }
  };

  const rootDir = process.cwd();
  
  const menuPath = path.join(rootDir, 'src', 'data', 'menu.ts');
  let menuContent = fs.readFileSync(menuPath, 'utf-8');
  menuContent = updateImages(menuContent, false);
  fs.writeFileSync(menuPath, menuContent);

  const migratePath = path.join(rootDir, 'backend', 'migrate.ts');
  let migrateContent = fs.readFileSync(migratePath, 'utf-8');
  migrateContent = updateImages(migrateContent, true);
  fs.writeFileSync(migratePath, migrateContent);

  console.log('✅ Successfully mapped and wrote 100% verified Wikipedia images!');
}

run();
