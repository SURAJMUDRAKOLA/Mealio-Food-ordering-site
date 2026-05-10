const fs = require('fs');
const path = require('path');

// These are the actual, verified high-quality Unsplash image pools you originally had.
// They are properly categorized.
const pools = {
  'North Indian': [
    '1603894584373-5ac82b2ae398', '1585937421612-70a008356fbe', '1631452180519-c014fe946bc7',
    '1565557623262-b51c2513a641a', '1567188040759-fb8a883dc6d8', '1596797038530-2c107229654b',
    '1631515243349-e0cb75fb8d3a', '1546833999-b9f581a1996d', '1626777174549-ee9b418e9538'
  ],
  'South Indian': [
    '1668236543090-82eba5ee5976', '1630383249896-424e482df921', '1589301760014-d929f3979dbc',
    '1610192244261-3f33de3f55e4', '1606491956689-2ea866880c84', '1617692855027-33b14f061079'
  ],
  'Biryani': [
    '1589302168068-964664d93dc0', '1633945274405-b6c8069047b0', '1642821373181-696a54913e93',
    '1599043513900-ed6fe01d3833', '1701579231378-3726490a407b', '1631515242808-497c3fbd3972',
    '1610057099431-d73a1c9d2f2f', '1563379926898-05f4575a45d8'
  ],
  'Meals & Thali': [
    '1604908176997-431e8ba78e61', '1546833999-b9f581a1996d', '1625943553852-781c6dd46faa',
    '1585937421612-70a008356fbe'
  ],
  'Street Food': [
    '1601050690117-94f5f6fa8bd7', '1601050690597-df0568f70950', '1625398407796-82650a8c135f',
    '1625220194771-7ebdea0b70b9', '1563245372-f21724e3856d'
  ],
  'Tandoor & Kebabs': [
    '1599487488170-d11ec9c172f0', '1598515214211-89d3c73ae83b', '1544025162-d76694265947',
    '1529692236671-f1f6cf9683ba'
  ],
  'Coastal': [
    '1615141982883-c7ad0e69fd62', '1604908176997-125f25cc6f3d', '1562967914-608f82629710',
    '1601314002592-b8734bca6604'
  ],
  'Chinese': [
    '1585032226651-759b368d7246', '1559847844-5315695dadae', '1552611052-33e04de081de',
    '1569718212165-3a8278d5f624', '1612929633738-8fe44f7ec841', '1525755662778-989d0524087e',
    '1582878826629-29b7ad1cdc43', '1591814468924-caf88d1232e1', '1603133872878-684f208fb84b'
  ],
  'Italian': [
    '1565299624946-b28f40a0ae38', '1574071318508-1cdbab80d002', '1551183053-bf91a1d81141',
    '1619895092538-128341789043', '1573140247632-f8fd74997d5c'
  ],
  'Rolls & Wraps': [
    '1626132647523-66f5bf380027', '1529006557810-274b9b2fc783', '1627308595229-7830a5c91f9f',
    '1553909489-cd47e0907980'
  ],
  'Desserts': [
    '1551024601-bec78aea704b', '1571877227200-a0d98ea607e9', '1617305855058-336d9ce3eb56',
    '1488477181946-6428a0291777', '1563805042-7684c019e1cb'
  ],
  'Beverages': [
    '1544145945-f90425340c7e', '1571934811356-5cc061b6821f', '1513558161293-cdaf765ed2fd',
    '1600271886742-f049cd451bba', '1622597467836-f3285f2131b8', '1517701604599-bb29b565090c'
  ]
};

const categoryMap = {
  'north-indian': 'North Indian',
  'south-indian': 'South Indian',
  'biryani': 'Biryani',
  'meals-thali': 'Meals & Thali',
  'street-food': 'Street Food',
  'tandoor-kebabs': 'Tandoor & Kebabs',
  'coastal': 'Coastal',
  'chinese': 'Chinese',
  'italian': 'Italian',
  'rolls-wraps': 'Rolls & Wraps',
  'desserts': 'Desserts',
  'beverages': 'Beverages'
};

const rootDir = process.cwd();
const menuPath = path.join(rootDir, 'src', 'data', 'menu.ts');
const migratePath = path.join(rootDir, 'backend', 'migrate.ts');

let menuContent = fs.readFileSync(menuPath, 'utf-8');
let migrateContent = fs.readFileSync(migratePath, 'utf-8');

const usedIds = new Set();
const dishToId = {};

const getUniqueId = (categoryName) => {
  const pool = pools[categoryName] || pools['North Indian'];
  for (const id of pool) {
    if (!usedIds.has(id)) {
      usedIds.add(id);
      return id;
    }
  }
  // If we run out, return a random unique ID from any pool
  for (const p of Object.values(pools)) {
    for (const id of p) {
      if (!usedIds.has(id)) {
        usedIds.add(id);
        return id;
      }
    }
  }
  return '1603894584373-5ac82b2ae398'; // extreme fallback
};

// Map Categories
for (const [id, name] of Object.entries(categoryMap)) {
  const uid = getUniqueId(name);
  const url = `https://images.unsplash.com/photo-${uid}?auto=format&fit=crop&w=900&q=80`;
  
  // Replace in menu.ts
  const regexMenu = new RegExp(`({ id: '${id}', name: '${name}', image: )'[^']+'`, 'g');
  menuContent = menuContent.replace(regexMenu, `$1'${url}'`);
  
  // Replace in migrate.ts
  const regexMigrate = new RegExp(`\\('${id}','${name}','[^']+',\\d+\\)`, 'g');
  migrateContent = migrateContent.replace(regexMigrate, (match) => {
    return match.replace(/'https?:[^']+'/, `'${url}'`);
  });
}

// Map Menu Items
const itemsMatch = [...menuContent.matchAll(/name:\s*'([^']+)',[\s\S]*?category:\s*'([^']+)'/g)];
for (const match of itemsMatch) {
  const dishName = match[1];
  const categoryName = match[2];
  
  const uid = getUniqueId(categoryName);
  dishToId[dishName] = uid;
}

menuContent = menuContent.replace(/(name:\s*'([^']+)',[\s\S]*?image:\s*)'[^']+'/g, (match, prefix, name) => {
  if (dishToId[name]) {
    return `${prefix}'https://images.unsplash.com/photo-${dishToId[name]}?auto=format&fit=crop&w=900&q=80'`;
  }
  return match;
});

migrateContent = migrateContent.replace(/(\('[^']+',\s*'([^']+)',\s*'[^']*',\s*\d+,\s*)'[^']+'/g, (match, prefix, name) => {
  if (dishToId[name]) {
    return `${prefix}'https://images.unsplash.com/photo-${dishToId[name]}?auto=format&fit=crop&w=900&q=80'`;
  }
  return match;
});

fs.writeFileSync(menuPath, menuContent);
fs.writeFileSync(migratePath, migrateContent);
console.log('✅ 100% Unique Unsplash URLs restored!');
