import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config({ path: '.env' });

const client = new Client({ connectionString: process.env.DATABASE_URL });

const sqlFiles = [
  'backend/schema/01_tables.sql',
  'backend/schema/02_rls.sql',
  'backend/schema/03_functions.sql',
  'backend/schema/04_admin.sql',
];

const seedSQL = `
INSERT INTO public.categories (id, name, image_url, sort_order) VALUES
('north-indian','North Indian','https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',1),
('south-indian','South Indian','https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80',2),
('biryani','Biryani','https://images.unsplash.com/photo-1563379091339-03246963d4d9?auto=format&fit=crop&w=900&q=80',3),
('meals-thali','Meals & Thali','https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',4),
('street-food','Street Food','https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',5),
('tandoor-kebabs','Tandoor & Kebabs','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80',6),
('coastal','Coastal','https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',7),
('chinese','Chinese','https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80',8),
('italian','Italian','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',9),
('rolls-wraps','Rolls & Wraps','https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80',10),
('desserts','Desserts','https://images.unsplash.com/photo-1605190557072-7abf6e76dfaa?auto=format&fit=crop&w=900&q=80',11),
('beverages','Beverages','https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',12)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, image_url=EXCLUDED.image_url;

INSERT INTO public.menu_items (id,name,description,price,image_url,category_id,is_veg,is_popular,rating,prep_time,tag) VALUES
('north-001','Butter Chicken','Tandoor-roasted chicken in tomato, butter, kasuri methi, and cream.',389,'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80','north-indian',false,true,4.8,'28 min','Delhi classic'),
('north-002','Paneer Butter Masala','Soft paneer in rich makhani gravy with smoked finish.',319,'https://upload.wikimedia.org/wikipedia/commons/5/5c/Paneer_Makhani_Veggie.jpeg','north-indian',true,true,4.7,'24 min','Creamy'),
('north-003','Dal Makhani','Black lentils slow-cooked with butter, cream, and Punjabi spices.',249,'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80','north-indian',true,false,4.7,'22 min','Slow cooked'),
('north-004','Chicken Tikka Masala','Charred tikka in spiced onion-tomato gravy.',379,'https://upload.wikimedia.org/wikipedia/commons/0/00/Chicken_tikka_masala_%28cropped%29.jpg','north-indian',false,false,4.6,'27 min','Tikka gravy'),
('north-005','Chole Bhature','Amritsari chole with two fluffy bhature, pickle, and onion.',189,'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80','north-indian',true,true,4.6,'18 min','Punjabi'),
('north-006','Rajma Chawal','Home-style kidney bean curry over steamed basmati with salad.',179,'https://upload.wikimedia.org/wikipedia/commons/3/37/Rajma_Masala_%2832081557778%29.jpg','north-indian',true,false,4.4,'16 min','Comfort bowl'),
('north-007','Kadhai Paneer','Paneer tossed with capsicum, onion, tomato, and crushed kadhai masala.',329,'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80','north-indian',true,false,4.5,'23 min','Spiced'),
('south-001','Masala Dosa','Crisp rice-lentil crepe with potato masala, chutneys, and sambar.',149,'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80','south-indian',true,true,4.7,'16 min','Crispy'),
('south-002','Idli Vada Combo','Two steamed idlis, medu vada, coconut chutney, and sambar.',129,'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80','south-indian',true,true,4.5,'12 min','Breakfast'),
('south-003','Ghee Podi Dosa','Roasted dosa with ghee and spicy podi, served with sambar.',179,'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80','south-indian',true,false,4.6,'16 min','Ghee roast'),
('south-004','Mysore Masala Dosa','Dosa layered with red chutney and potato masala.',169,'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=900&q=80','south-indian',true,false,4.6,'17 min','Mysore style'),
('bir-001','Hyderabadi Chicken Dum Biryani','Dum-cooked basmati layered with chicken, saffron, raita, and salan.',329,'https://images.unsplash.com/photo-1563379091339-03246963d4d9?auto=format&fit=crop&w=900&q=80','biryani',false,true,4.8,'32 min','Bestseller'),
('bir-002','Mutton Dum Biryani','Tender mutton and long-grain rice sealed with spices and dum heat.',449,'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=900&q=80','biryani',false,true,4.7,'38 min','Premium'),
('bir-003','Veg Dum Biryani','Layered basmati with vegetables, mint, fried onion, raita, and salan.',249,'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=900&q=80','biryani',true,false,4.4,'28 min','Dum style'),
('bir-004','Kolkata Chicken Biryani','Lightly spiced biryani with chicken, potato, egg, and fragrant rice.',349,'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=900&q=80','biryani',false,false,4.6,'34 min','Kolkata'),
('bir-005','Prawn Biryani','Juicy prawns with coastal masala, basmati, mint, and ghee.',489,'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=900&q=80','biryani',false,false,4.5,'35 min','Seafood'),
('meal-001','North Indian Veg Thali','Paneer curry, dal, sabzi, rice, roti, salad, pickle, papad, and sweet.',299,'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80','meals-thali',true,true,4.6,'22 min','Complete meal'),
('meal-002','South Indian Meals','Rice, sambar, rasam, poriyal, kootu, curd, pickle, papad, and payasam.',249,'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80','meals-thali',true,true,4.6,'20 min','Banana leaf'),
('meal-003','Deluxe Non-Veg Thali','Chicken curry, egg curry, dal, rice, roti, salad, pickle, and dessert.',399,'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80','meals-thali',false,false,4.5,'25 min','Hearty'),
('street-001','Pav Bhaji','Mumbai-style buttery vegetable bhaji with toasted pav and onion.',169,'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80','street-food',true,true,4.6,'16 min','Mumbai'),
('street-002','Pani Puri','Crisp puris with potato filling, spicy pani, sweet chutney, and sev.',99,'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80','street-food',true,true,4.5,'12 min','Chaat'),
('street-003','Vada Pav','Spiced potato vada in pav with garlic chutney and fried chilli.',79,'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80','street-food',true,false,4.4,'10 min','Quick bite'),
('street-004','Samosa Chaat','Crushed samosa with chole, curd, chutneys, sev, and onion.',129,'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=900&q=80','street-food',true,false,4.4,'13 min','Tangy'),
('kebab-001','Tandoori Chicken Half','Half chicken marinated overnight and roasted in tandoor.',349,'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80','tandoor-kebabs',false,true,4.7,'30 min','Smoky'),
('kebab-002','Paneer Tikka','Paneer, onion, and capsicum grilled with smoky tandoori marinade.',289,'https://images.unsplash.com/photo-1604908176997-431e8ba78e61?auto=format&fit=crop&w=900&q=80','tandoor-kebabs',true,false,4.5,'24 min','Tandoor veg'),
('kebab-003','Seekh Kebab','Minced meat skewers spiced with herbs, chilli, and garam masala.',339,'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=80','tandoor-kebabs',false,false,4.5,'26 min','Skewers'),
('kebab-004','Afghani Chicken','Creamy tandoor chicken with cashew, pepper, and mild spices.',369,'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80','tandoor-kebabs',false,false,4.6,'30 min','Mild'),
('coast-001','Goan Fish Curry Rice','Tangy coconut fish curry with steamed rice, pickle, and salad.',399,'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80','coastal',false,true,4.6,'28 min','Goan'),
('coast-002','Prawn Ghee Roast','Mangalorean prawns tossed in ghee, chilli, tamarind, and spices.',489,'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80','coastal',false,false,4.7,'32 min','Mangalorean'),
('coast-003','Malabar Parotta With Chicken','Layered parottas with Kerala chicken curry and onion salad.',349,'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80','coastal',false,false,4.6,'26 min','Kerala'),
('chi-001','Veg Hakka Noodles','Wok-tossed noodles with vegetables, soy, chilli, and spring onion.',189,'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80','chinese',true,true,4.5,'18 min','Indo-Chinese'),
('chi-002','Chicken Schezwan Noodles','Spicy noodles with chicken, vegetables, and Schezwan sauce.',249,'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80','chinese',false,true,4.5,'20 min','Spicy'),
('chi-003','Chilli Chicken','Crispy chicken with chilli, garlic, onion, capsicum, and soy.',289,'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80','chinese',false,false,4.6,'22 min','Dry/gravy'),
('chi-004','Veg Manchurian Gravy','Vegetable dumplings in a garlicky soy-chilli gravy.',219,'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80','chinese',true,false,4.4,'21 min','Gravy'),
('ita-001','Margherita Pizza','Tomato sauce, mozzarella, basil, and olive oil on a stretched base.',329,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80','italian',true,true,4.6,'22 min','Classic'),
('ita-002','Farmhouse Pizza','Capsicum, onion, mushroom, corn, olives, mozzarella, tomato sauce.',399,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80','italian',true,false,4.5,'25 min','Loaded veg'),
('ita-003','Penne Alfredo','Penne in creamy parmesan sauce with herbs and cracked pepper.',349,'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80','italian',true,false,4.4,'21 min','Cream sauce'),
('ita-004','Chicken Lasagna','Layered pasta with chicken ragu, bechamel, mozzarella, and baked cheese.',429,'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80','italian',false,false,4.5,'30 min','Baked'),
('roll-001','Paneer Tikka Roll','Roomali wrap with paneer tikka, onion, mint chutney, and salad.',199,'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80','rolls-wraps',true,true,4.5,'16 min','Kathi style'),
('roll-002','Chicken Kathi Roll','Egg-layered paratha with chicken tikka, onion, chilli, and house sauce.',229,'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80','rolls-wraps',false,true,4.6,'18 min','Kolkata'),
('roll-003','Chicken Shawarma Roll','Grilled chicken, garlic mayo, pickles, and salad in pita.',219,'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=80','rolls-wraps',false,false,4.5,'17 min','Loaded'),
('dessert-001','Gulab Jamun','Two warm khoya dumplings soaked in cardamom-saffron syrup.',99,'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80','desserts',true,true,4.5,'8 min','Indian sweet'),
('dessert-002','Rasmalai','Soft chenna discs in saffron milk with pistachio and cardamom.',149,'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80','desserts',true,false,4.6,'8 min','Chilled'),
('dessert-003','Chocolate Lava Cake','Warm chocolate cake with a molten centre and vanilla cream.',219,'https://images.unsplash.com/photo-1617305855058-336d9ce3eb56?auto=format&fit=crop&w=900&q=80','desserts',true,false,4.6,'12 min','Molten'),
('dessert-004','Kulfi Falooda','Malai kulfi with falooda, rose syrup, basil seeds, and nuts.',179,'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80','desserts',true,false,4.5,'9 min','Cold dessert'),
('bev-001','Mango Lassi','Thick yoghurt drink with alphonso mango pulp and cardamom.',129,'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80','beverages',true,true,4.6,'7 min','Cooling'),
('bev-002','Masala Chai','Milk tea brewed with ginger, cardamom, clove, and tea masala.',69,'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80','beverages',true,false,4.5,'6 min','Hot'),
('bev-003','Cold Coffee','Chilled coffee blended with milk, ice cream, and chocolate drizzle.',149,'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80','beverages',true,false,4.4,'8 min','Cafe'),
('bev-004','Fresh Lime Soda','Sweet-salt lime soda with mint, ice, and a citrus finish.',89,'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80','beverages',true,false,4.3,'5 min','Refreshing')
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, price=EXCLUDED.price, description=EXCLUDED.description,
  is_popular=EXCLUDED.is_popular, rating=EXCLUDED.rating, is_available=true;

-- Promo codes table (used by the apply-promo Edge Function)
CREATE TABLE IF NOT EXISTS public.promo_codes (
  code         TEXT PRIMARY KEY,
  discount_pct INT  NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  max_uses     INT  NOT NULL DEFAULT 100,
  used_count   INT  NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sample promo codes for testing
INSERT INTO public.promo_codes (code, discount_pct, max_uses, expires_at) VALUES
  ('WELCOME10', 10, 500, now() + interval '90 days'),
  ('MEALIO20',  20, 100, now() + interval '30 days'),
  ('FIRST50',   50, 50,  now() + interval '7 days')
ON CONFLICT (code) DO NOTHING;
`;

async function run() {
  console.log('🔌 Connecting to Supabase PostgreSQL…');
  await client.connect();
  console.log('✅ Connected!\n');

  // Run schema SQL files
  for (const file of sqlFiles) {
    const sql = readFileSync(join(process.cwd(), file), 'utf-8');
    console.log(`📄 Running ${file}…`);
    try {
      await client.query(sql);
      console.log(`   ✅ Done\n`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Ignore "already exists" errors — safe to re-run
      if (msg.includes('already exists')) {
        console.log(`   ⚠️  Already exists (skipped)\n`);
      } else {
        console.error(`   ❌ Error: ${msg}\n`);
      }
    }
  }

  // Seed data
  console.log('🌱 Seeding categories and menu items…');
  await client.query(seedSQL);
  console.log('   ✅ 12 categories + 48 menu items seeded\n');

  await client.end();
  console.log('✨ Migration complete! Your Supabase DB is ready.');
}

run().catch((err) => { console.error('Fatal:', err.message); process.exit(1); });
