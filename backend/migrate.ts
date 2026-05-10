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
('(north-indian','North Indian','/images/menu/north_indian_veg_thali.jpg',1),
('(south-indian','South Indian','/images/menu/south_indian_meals.jpg',2),
('biryani','Biryani','/images/menu/hyderabadi_chicken_dum_biryani.png',3),
('meals-thali','Meals & Thali','/images/menu/deluxe_non_veg_thali.png',4),
('street-food','Street Food','/images/menu/samosa_chat.jpg',5),
('tandoor-kebabs','Tandoor & Kebabs','/images/menu/chicken_tikka.jpg',6),
('coastal','Coastal','/images/menu/prawn_ghee_roast.jpg',7),
('chinese','Chinese','/images/menu/veg_hakka_noodles.webp',8),
('italian','Italian','/images/menu/margherita_pizza.webp',9),
('rolls-wraps','Rolls & Wraps','/images/menu/chicken_kathi_roll.jpg',10),
('desserts','Desserts','/images/menu/gulab_jamun.jpg',11),
('beverages','Beverages','/images/menu/masala_chai.jpg',12)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, image_url=EXCLUDED.image_url;

INSERT INTO public.menu_items (id,name,description,price,image_url,category_id,is_veg,is_popular,rating,prep_time,tag) VALUES
('north-001','Butter Chicken','Tandoor-roasted chicken in tomato, butter, kasuri methi, and cream.',389,'/images/menu/butter_chicken.png','north-indian',false,true,4.8,'28 min','Delhi classic'),
('north-002','Paneer Butter Masala','Soft paneer in rich makhani gravy with smoked finish.',319,'/images/menu/paneer_butter_masala.png','north-indian',true,true,4.7,'24 min','Creamy'),
('north-003','Dal Makhani','Black lentils slow-cooked with butter, cream, and Punjabi spices.',249,'/images/menu/dal_makhani.png','north-indian',true,false,4.7,'22 min','Slow cooked'),
('north-004','Chicken Tikka Masala','Charred tikka in spiced onion-tomato gravy.',379,'/images/menu/chicken_tikka.jpg','north-indian',false,false,4.6,'27 min','Tikka gravy'),
('north-005','Chole Bhature','Amritsari chole with two fluffy bhature, pickle, and onion.',189,'/images/menu/chole_bhature.png','north-indian',true,true,4.6,'18 min','Punjabi'),
('north-006','Rajma Chawal','Home-style kidney bean curry over steamed basmati with salad.',179,'/images/menu/rajma_chawal.jpg','north-indian',true,false,4.4,'16 min','Comfort bowl'),
('north-007','Kadhai Paneer','Paneer tossed with capsicum, onion, tomato, and crushed kadhai masala.',329,'/images/menu/kadhai_paneer.avif','north-indian',true,false,4.5,'23 min','Spiced'),
('south-001','Masala Dosa','Crisp rice-lentil crepe with potato masala, chutneys, and sambar.',149,'/images/menu/masala_dosa.png','south-indian',true,true,4.7,'16 min','Crispy'),
('south-002','Idli Vada Combo','Two steamed idlis, medu vada, coconut chutney, and sambar.',129,'/images/menu/idli_vada_combo.png','south-indian',true,true,4.5,'12 min','Breakfast'),
('south-003','Ghee Podi Dosa','Roasted dosa with ghee and spicy podi, served with sambar.',179,'/images/menu/dhee_podi_dosa.jpg','south-indian',true,false,4.6,'16 min','Ghee roast'),
('south-004','Mysore Masala Dosa','Dosa layered with red chutney and potato masala.',169,'/images/menu/masala_dosa.png','south-indian',true,false,4.6,'17 min','Mysore style'),
('bir-001','Hyderabadi Chicken Dum Biryani','Dum-cooked basmati layered with chicken, saffron, raita, and salan.',329,'/images/menu/hyderabadi_chicken_dum_biryani.png','biryani',false,true,4.8,'32 min','Bestseller'),
('bir-002','Mutton Dum Biryani','Tender mutton and long-grain rice sealed with spices and dum heat.',449,'/images/menu/mutton_dum_biryani.jpg','biryani',false,true,4.7,'38 min','Premium'),
('bir-003','Veg Dum Biryani','Layered basmati with vegetables, mint, fried onion, raita, and salan.',249,'/images/menu/veg_dum_biryani.jpg','biryani',true,false,4.4,'28 min','Dum style'),
('bir-004','Kolkata Chicken Biryani','Lightly spiced biryani with chicken, potato, egg, and fragrant rice.',349,'/images/menu/kolkata_chicken_biryani.jpg','biryani',false,false,4.6,'34 min','Kolkata'),
('bir-005','Prawn Biryani','Juicy prawns with coastal masala, basmati, mint, and ghee.',489,'/images/menu/prawn_biryani.jpg','biryani',false,false,4.5,'35 min','Seafood'),
('meal-001','North Indian Veg Thali','Paneer curry, dal, sabzi, rice, roti, salad, pickle, papad, and sweet.',299,'/images/menu/north_indian_veg_thali.jpg','meals-thali',true,true,4.6,'22 min','Complete meal'),
('meal-002','South Indian Meals','Rice, sambar, rasam, poriyal, kootu, curd, pickle, papad, and payasam.',249,'/images/menu/south_indian_meals.jpg','meals-thali',true,true,4.6,'20 min','Banana leaf'),
('meal-003','Deluxe Non-Veg Thali','Chicken curry, egg curry, dal, rice, roti, salad, pickle, and dessert.',399,'/images/menu/deluxe_non_veg_thali.png','meals-thali',false,false,4.5,'25 min','Hearty'),
('street-001','Pav Bhaji','Mumbai-style buttery vegetable bhaji with toasted pav and onion.',169,'/images/menu/pav_bhaji.jpg','street-food',true,true,4.6,'16 min','Mumbai'),
('street-002','Pani Puri','Crisp puris with potato filling, spicy pani, sweet chutney, and sev.',99,'/images/menu/pani_puri.jpg','street-food',true,true,4.5,'12 min','Chaat'),
('street-003','Vada Pav','Spiced potato vada in pav with garlic chutney and fried chilli.',79,'/images/menu/vada_pav.avif','street-food',true,false,4.4,'10 min','Quick bite'),
('street-004','Samosa Chaat','Crushed samosa with chole, curd, chutneys, sev, and onion.',129,'/images/menu/samosa_chat.jpg','street-food',true,false,4.4,'13 min','Tangy'),
('kebab-001','Tandoori Chicken Half','Half chicken marinated overnight and roasted in tandoor.',349,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80','tandoor-kebabs',false,true,4.7,'30 min','Smoky'),
('kebab-002','Paneer Tikka','Paneer, onion, and capsicum grilled with smoky tandoori marinade.',289,'/images/menu/paneer_tikka.jpg','tandoor-kebabs',true,false,4.5,'24 min','Tandoor veg'),
('kebab-003','Seekh Kebab','Minced meat skewers spiced with herbs, chilli, and garam masala.',339,'/images/menu/seekh_kabab.avif','tandoor-kebabs',false,false,4.5,'26 min','Skewers'),
('kebab-004','Afghani Chicken','Creamy tandoor chicken with cashew, pepper, and mild spices.',369,'/images/menu/afghani_chicken.jpg','tandoor-kebabs',false,false,4.6,'30 min','Mild'),
('coast-001','Goan Fish Curry Rice','Tangy coconut fish curry with steamed rice, pickle, and salad.',399,'/images/menu/goan_fish_curry_rice.webp','coastal',false,true,4.6,'28 min','Goan'),
('coast-002','Prawn Ghee Roast','Mangalorean prawns tossed in ghee, chilli, tamarind, and spices.',489,'/images/menu/prawn_ghee_roast.jpg','coastal',false,false,4.7,'32 min','Mangalorean'),
('coast-003','Malabar Parotta With Chicken','Layered parottas with Kerala chicken curry and onion salad.',349,'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/800px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg','coastal',false,false,4.6,'26 min','Kerala'),
('chi-001','Veg Hakka Noodles','Wok-tossed noodles with vegetables, soy, chilli, and spring onion.',189,'/images/menu/veg_hakka_noodles.webp','chinese',true,true,4.5,'18 min','Indo-Chinese'),
('chi-002','Chicken Schezwan Noodles','Spicy noodles with chicken, vegetables, and Schezwan sauce.',249,'/images/menu/chicken_schezwan_noodles.jpg','chinese',false,true,4.5,'20 min','Spicy'),
('chi-003','Chilli Chicken','Crispy chicken with chilli, garlic, onion, capsicum, and soy.',289,'/images/menu/chilli_chicken.webp','chinese',false,false,4.6,'22 min','Dry/gravy'),
('chi-004','Veg Manchurian Gravy','Vegetable dumplings in a garlicky soy-chilli gravy.',219,'/images/menu/veg_manchurian_gravy.jpg','chinese',true,false,4.4,'21 min','Gravy'),
('ita-001','Margherita Pizza','Tomato sauce, mozzarella, basil, and olive oil on a stretched base.',329,'/images/menu/margherita_pizza.webp','italian',true,true,4.6,'22 min','Classic'),
('ita-002','Farmhouse Pizza','Capsicum, onion, mushroom, corn, olives, mozzarella, tomato sauce.',399,'/images/menu/farmhouse_pizza.jpg','italian',true,false,4.5,'25 min','Loaded veg'),
('ita-003','Penne Alfredo','Penne in creamy parmesan sauce with herbs and cracked pepper.',349,'/images/menu/penne_alfredo.jpg','italian',true,false,4.4,'21 min','Cream sauce'),
('ita-004','Chicken Lasagna','Layered pasta with chicken ragu, bechamel, mozzarella, and baked cheese.',429,'/images/menu/chicken_lasagna.jpg','italian',false,false,4.5,'30 min','Baked'),
('roll-001','Paneer Tikka Roll','Roomali wrap with paneer tikka, onion, mint chutney, and salad.',199,'/images/menu/paneer_tikka.jpg','rolls-wraps',true,true,4.5,'16 min','Kathi style'),
('roll-002','Chicken Kathi Roll','Egg-layered paratha with chicken tikka, onion, chilli, and house sauce.',229,'/images/menu/chicken_kathi_roll.jpg','rolls-wraps',false,true,4.6,'18 min','Kolkata'),
('roll-003','Chicken Shawarma Roll','Grilled chicken, garlic mayo, pickles, and salad in pita.',219,'/images/menu/chicken_shawarma_roll.jpg','rolls-wraps',false,false,4.5,'17 min','Loaded'),
('dessert-001','Gulab Jamun','Two warm khoya dumplings soaked in cardamom-saffron syrup.',99,'/images/menu/gulab_jamun.jpg','desserts',true,true,4.5,'8 min','Indian sweet'),
('dessert-002','Rasmalai','Soft chenna discs in saffron milk with pistachio and cardamom.',149,'/images/menu/rasmalai.jpg','desserts',true,false,4.6,'8 min','Chilled'),
('dessert-003','Chocolate Lava Cake','Warm chocolate cake with a molten centre and vanilla cream.',219,'/images/menu/chocolate_lava_cake.jpg','desserts',true,false,4.6,'12 min','Molten'),
('dessert-004','Kulfi Falooda','Malai kulfi with falooda, rose syrup, basil seeds, and nuts.',179,'/images/menu/kulfi_falooda.jpg','desserts',true,false,4.5,'9 min','Cold dessert'),
('bev-001','Mango Lassi','Thick yoghurt drink with alphonso mango pulp and cardamom.',129,'/images/menu/mango_lassi.jpg','beverages',true,true,4.6,'7 min','Cooling'),
('bev-002','Masala Chai','Milk tea brewed with ginger, cardamom, clove, and tea masala.',69,'/images/menu/masala_chai.jpg','beverages',true,false,4.5,'6 min','Hot'),
('bev-003','Cold Coffee','Chilled coffee blended with milk, ice cream, and chocolate drizzle.',149,'/images/menu/cold_coffee.jpg','beverages',true,false,4.4,'8 min','Cafe'),
('bev-004','Fresh Lime Soda','Sweet-salt lime soda with mint, ice, and a citrus finish.',89,'/images/menu/fresh_lime_soda.jpg','beverages',true,false,4.3,'5 min','Refreshing')
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
