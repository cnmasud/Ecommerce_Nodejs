/**
 * Demo Seed Script
 * Creates: roles, 1 admin user, 1 seller user, 5 shops,
 *          10 categories, and 50 products spread across them.
 *
 * Usage:  node backend/scripts/seedDemo.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { User, Role } = require("../models/user");
const { Shop } = require("../models/shop");
const { Product, ProductCategory } = require("../models/product");
const { Site } = require("../models/site");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

// ─────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ─────────────────────────────────────────────────────────

const CATEGORY_DEFS = [
  { name: "Electronics",    emoji: "💻" },
  { name: "Clothing",       emoji: "👗" },
  { name: "Home & Garden",  emoji: "🏡" },
  { name: "Sports",         emoji: "⚽" },
  { name: "Books",          emoji: "📚" },
  { name: "Toys & Games",   emoji: "🎮" },
  { name: "Beauty",         emoji: "💄" },
  { name: "Automotive",     emoji: "🚗" },
  { name: "Food & Drink",   emoji: "🍕" },
  { name: "Music",          emoji: "🎸" },
];

const SHOP_DEFS = [
  { name: "TechZone",       description: "The best electronics and gadgets at unbeatable prices." },
  { name: "FashionHub",     description: "Trendy clothing and accessories for every style." },
  { name: "HomeBliss",      description: "Everything you need to make your home beautiful." },
  { name: "SportsWorld",    description: "Professional sports equipment and activewear." },
  { name: "BookNook",       description: "Thousands of books, games, and toys for all ages." },
];

// 50 product definitions (5 per category)
const PRODUCT_DEFS = [
  // 0 Electronics
  { name: "MacBook Pro 14\"",       price: 1999.99, category: 0, description: "Apple M3 chip, 16GB RAM, 512GB SSD – the ultimate laptop for professionals.", stock: 15 },
  { name: "Sony WH-1000XM5",        price: 349.99,  category: 0, description: "Industry-leading noise cancelling wireless headphones with 30-hour battery.", stock: 42 },
  { name: "Samsung 4K Monitor 32\"", price: 449.00,  category: 0, description: "Crystal clear 4K UHD display with USB-C connectivity and HDR support.", stock: 8  },
  { name: "Logitech MX Master 3S",  price: 99.99,   category: 0, description: "Advanced wireless mouse with ultra-fast scrolling and multi-device support.", stock: 60 },
  { name: "iPad Air 5th Gen",       price: 749.00,  category: 0, description: "10.9-inch Liquid Retina display, M1 chip, perfect for creativity and productivity.", stock: 25 },

  // 1 Clothing
  { name: "Nike Air Max 270",        price: 149.99, category: 1, description: "Iconic Air Max cushioning with a modern design. Available in multiple colourways.", stock: 80 },
  { name: "Levi's 501 Jeans",        price: 69.99,  category: 1, description: "The original straight-leg jean. Timeless style, durable denim.", stock: 120 },
  { name: "North Face Puffer Jacket", price: 199.00, category: 1, description: "Lightweight 700-fill down insulation keeps you warm in the coldest conditions.", stock: 30 },
  { name: "Adidas Running T-Shirt",  price: 34.99,  category: 1, description: "Breathable Climalite fabric for maximum comfort during workouts.", stock: 200 },
  { name: "Ray-Ban Wayfarer",        price: 154.00, category: 1, description: "Classic acetate sunglasses with G-15 lenses. UV400 protection.", stock: 45 },

  // 2 Home & Garden
  { name: "Dyson V15 Detect",       price: 749.99, category: 2, description: "Laser reveals invisible dust. Automatically adapts suction to the task.", stock: 12 },
  { name: "Instant Pot Duo 7-in-1", price: 89.95,  category: 2, description: "Pressure cooker, slow cooker, rice cooker, steamer, sauté pan and more.", stock: 55 },
  { name: "IKEA KALLAX Shelf",      price: 119.00, category: 2, description: "Versatile shelving unit, perfect for living rooms, home offices and hallways.", stock: 22 },
  { name: "Philips Hue Starter Kit", price: 199.95, category: 2, description: "Smart LED bulbs you control with your voice or app. 16 million colours.", stock: 38 },
  { name: "Weber Spirit Gas Grill",  price: 529.00, category: 2, description: "3-burner gas grill with GS4 grilling system. Porcelain-enamelled grates.", stock: 7  },

  // 3 Sports
  { name: "Peloton Bike+",          price: 2495.00, category: 3, description: "Auto-follow resistance, rotating HD touchscreen, immersive fitness classes.", stock: 5  },
  { name: "Wilson Pro Staff Tennis", price: 229.00, category: 3, description: "Iconic tennis racket used by Roger Federer. Braided graphite construction.", stock: 18 },
  { name: "Garmin Forerunner 955",  price: 499.99,  category: 3, description: "GPS running & triathlon smartwatch with training insights and mapping.", stock: 27 },
  { name: "Hydro Flask 32oz",       price: 44.95,   category: 3, description: "Double-wall vacuum insulation keeps drinks cold 24h or hot 12h.", stock: 150 },
  { name: "Yoga Mat Premium",       price: 79.00,   category: 3, description: "6mm non-slip surface, eco-friendly TPE material with alignment lines.", stock: 90 },

  // 4 Books
  { name: "Atomic Habits",          price: 18.99, category: 4, description: "James Clear's #1 NYT bestseller on building good habits and breaking bad ones.", stock: 200 },
  { name: "The Pragmatic Programmer", price: 49.95, category: 4, description: "20th anniversary edition – your journey to mastery in software development.", stock: 75 },
  { name: "Dune",                   price: 15.99, category: 4, description: "Frank Herbert's classic sci-fi masterpiece – the bestselling science fiction novel of all time.", stock: 160 },
  { name: "Sapiens",                price: 19.99, category: 4, description: "Yuval Noah Harari's sweeping history of humankind from the Stone Age to the 21st century.", stock: 140 },
  { name: "Clean Code",             price: 39.99, category: 4, description: "Robert C. Martin's handbook of agile software craftsmanship. Essential reading for developers.", stock: 88 },

  // 5 Toys & Games
  { name: "PlayStation 5",          price: 499.00, category: 5, description: "Next-gen gaming with ultra-high speed SSD, 3D Audio, and haptic feedback.", stock: 4  },
  { name: "LEGO Technic Bugatti",   price: 449.99, category: 5, description: "3,599-piece 1:8 scale model with working W16 engine pistons and gearbox.", stock: 11 },
  { name: "Nintendo Switch OLED",   price: 349.00, category: 5, description: "Vivid 7-inch OLED screen. Play at home or on the go.", stock: 20 },
  { name: "Monopoly Classic",       price: 24.99,  category: 5, description: "The world's favourite family board game. Buy, sell, trade properties.", stock: 100 },
  { name: "Rubik's Speed Cube",     price: 17.99,  category: 5, description: "Official 3x3 speed cube with corner cutting and smooth turning.", stock: 250 },

  // 6 Beauty
  { name: "Dyson Airwrap",          price: 599.99, category: 6, description: "Multi-styler that curls, waves, smooths and dries with no extreme heat.", stock: 9  },
  { name: "La Mer Moisturising Cream", price: 195.00, category: 6, description: "Iconic moisturiser with Miracle Broth™. Visibly transforms the look of skin.", stock: 33 },
  { name: "Charlotte Tilbury Palette", price: 75.00, category: 6, description: "Hollywood-inspired eye shadow palette with 8 wearable neutral shades.", stock: 55 },
  { name: "Olaplex No.3",           price: 28.00,  category: 6, description: "Award-winning at-home hair strengthening treatment. Reduces breakage.", stock: 120 },
  { name: "Tatcha Rice Wash",       price: 38.00,  category: 6, description: "Silky Japanese cleanser that dissolves makeup and cleanses without stripping.", stock: 77 },

  // 7 Automotive
  { name: "Garmin DashCam 67W",     price: 199.99, category: 7, description: "1440p, 180° wide-angle lens, voice control, automatic incident detection.", stock: 41 },
  { name: "NOCO Boost Plus GB40",   price: 99.95,  category: 7, description: "1000A 12V portable lithium jump starter for up to 6L gas or 3L diesel engines.", stock: 63 },
  { name: "WeatherTech Floor Mats", price: 149.00, category: 7, description: "Custom-fit laser-measured mats for total interior protection.", stock: 29 },
  { name: "Anker Car Charger 65W",  price: 35.99,  category: 7, description: "Dual USB-C PD ports and one USB-A port. Charge 3 devices simultaneously.", stock: 180 },
  { name: "Chemical Guys Detailing Kit", price: 79.95, category: 7, description: "Professional-grade car detailing bundle: wash, wax, interior cleaner.", stock: 47 },

  // 8 Food & Drink
  { name: "Nespresso Vertuo Next",  price: 179.00, category: 8, description: "Brew 5 cup sizes from espresso to Alto. Bluetooth connectivity.", stock: 36 },
  { name: "KitchenAid Stand Mixer", price: 449.00, category: 8, description: "5Qt bowl-lift stand mixer with 10 speeds. Iconic design, professional results.", stock: 14 },
  { name: "Vitamix E310 Blender",   price: 349.95, category: 8, description: "Variable speed blender with aircraft-grade stainless steel blades.", stock: 19 },
  { name: "Whole Bean Coffee Bag",  price: 22.99,  category: 8, description: "Single-origin Ethiopian Yirgacheffe, medium roast. Notes of blueberry and jasmine.", stock: 300 },
  { name: "Organic Protein Powder", price: 54.99,  category: 8, description: "25g whey protein per serving, no artificial sweeteners, 3lb bag.", stock: 85 },

  // 9 Music
  { name: "Fender Player Stratocaster", price: 849.99, category: 9, description: "The quintessential electric guitar. Three Player Series Alnico 5 strat single-coil pickups.", stock: 8  },
  { name: "Roland FP-30X Piano",    price: 699.00, category: 9, description: "Portable digital piano with 88 weighted keys, SuperNATURAL piano sound.", stock: 6  },
  { name: "Audio-Technica AT2020", price: 99.00,  category: 9, description: "Side-address cardioid condenser mic. Studio favourite for vocals and instruments.", stock: 52 },
  { name: "Shure SM58 Microphone", price: 99.00,  category: 9, description: "Industry-standard dynamic vocal microphone. Legendary reliability on stage.", stock: 68 },
  { name: "Teenage Engineering OP-1 Field", price: 1999.00, category: 9, description: "Ultra-portable synthesiser, sampler, and recorder in one iconic device.", stock: 3  },
];

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function randomImage(name) {
  const seed = encodeURIComponent(name.replace(/\s+/g, '+'));
  return `https://picsum.photos/seed/${seed}/400/300`;
}

// ─────────────────────────────────────────────────────────
// MAIN SEED — exported as run(uri) so bin/www can call it
// Can also be run standalone:  node scripts/seedDemo.js
// ─────────────────────────────────────────────────────────
async function seed(overrideUri) {
  const uri = overrideUri || MONGODB_URI;

  // If mongoose is already connected (called from bin/www), skip connecting
  if (mongoose.connection.readyState !== 1) {
    console.log("🔗 Connecting to", uri.replace(/:\/\/.*@/, "://***@"));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB\n");
  } else {
    console.log("✅ Using existing MongoDB connection\n");
  }

  // ── Wipe existing demo data ──────────────────────────
  console.log("🗑  Clearing existing data...");
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    Shop.deleteMany({}),
    ProductCategory.deleteMany({}),
    Product.deleteMany({}),
    Site.deleteMany({}),
  ]);

  // ── Roles ────────────────────────────────────────────
  console.log("👥 Creating roles...");
  const roles = {};
  for (const name of ["admin", "seller", "user"]) {
    roles[name] = await new Role({ name, users: [] }).save();
  }

  // ── Users ────────────────────────────────────────────
  console.log("👤 Creating users...");
  const hashedPass = await bcrypt.hash("demo1234", 10);

  const adminUser = await new User({
    username: "admin",
    email: "admin@demo.com",
    password: hashedPass,
    role: roles.admin._id,
    name: "Admin User",
  }).save();
  roles.admin.users.push(adminUser._id);

  const sellerUser = await new User({
    username: "seller",
    email: "seller@demo.com",
    password: hashedPass,
    role: roles.seller._id,
    name: "Demo Seller",
  }).save();
  roles.seller.users.push(sellerUser._id);

  const customerUser = await new User({
    username: "customer",
    email: "customer@demo.com",
    password: hashedPass,
    role: roles.user._id,
    name: "Demo Customer",
  }).save();
  roles.user.users.push(customerUser._id);

  await Promise.all(Object.values(roles).map((r) => r.save()));
  console.log("   admin@demo.com / seller@demo.com / customer@demo.com  (password: demo1234)");

  // ── Site ─────────────────────────────────────────────
  await new Site({
    name: "Marketplace",
    description: "A modern e-commerce marketplace",
    email: "hello@marketplace.com",
    phone: "+1 555 123 4567",
  }).save();

  // ── Shops ────────────────────────────────────────────
  console.log("\n🏪 Creating shops...");
  const shopDocs = [];
  for (const s of SHOP_DEFS) {
    const shop = await new Shop({
      name: s.name,
      description: s.description,
      user: sellerUser._id,
      email: `${s.name.toLowerCase().replace(/\s+/g, '')}@demo.com`,
      phone: `+1 555 ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      logo: `https://picsum.photos/seed/${s.name}/200/200`,
      address: { country: "USA", province: "California", city: "San Francisco", postCode: "94105", street: "Market St" },
    }).save();
    shopDocs.push(shop);
    console.log(`   ✔ ${s.name}`);
  }
  await User.findByIdAndUpdate(sellerUser._id, { shop: shopDocs[0]._id });

  // ── Categories ───────────────────────────────────────
  console.log("\n📦 Creating categories...");
  const categoryDocs = [];
  for (const c of CATEGORY_DEFS) {
    const cat = await new ProductCategory({ name: c.name, products: [] }).save();
    categoryDocs.push(cat);
    console.log(`   ✔ ${c.emoji} ${c.name}`);
  }

  // ── Products ─────────────────────────────────────────
  console.log("\n🛍️  Creating 50 products...");
  let count = 0;
  for (const p of PRODUCT_DEFS) {
    const shop = shopDocs[count % shopDocs.length];
    const category = categoryDocs[p.category];

    const product = await new Product({
      name: p.name,
      price: p.price,
      description: p.description,
      stock: p.stock,
      images: [randomImage(p.name), randomImage(p.name + "-2")],
      shop: shop._id,
      categories: [category._id],
      reviews: [],
    }).save();

    // Update refs
    await Shop.findByIdAndUpdate(shop._id, { $push: { products: product._id } });
    await ProductCategory.findByIdAndUpdate(category._id, { $push: { products: product._id } });

    count++;
    if (count % 10 === 0) console.log(`   ... ${count}/50 created`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────────────");
  console.log(`  Roles:      ${Object.keys(roles).length}`);
  console.log(`  Users:      3  (admin / seller / customer)`);
  console.log(`  Shops:      ${shopDocs.length}`);
  console.log(`  Categories: ${categoryDocs.length}`);
  console.log(`  Products:   ${count}`);
  console.log("─────────────────────────────────────────────────");
  console.log("\n  Login credentials (all use password: demo1234)");
  console.log("  admin@demo.com    – Admin role");
  console.log("  seller@demo.com   – Seller role");
  console.log("  customer@demo.com – Customer role");

  // Only disconnect if we connected ourselves (not called from bin/www)
  if (overrideUri === undefined) {
    await mongoose.disconnect();
  }
}

// Export for use by bin/www (auto-seed)
module.exports = { run: seed };

// Standalone execution:  node scripts/seedDemo.js
if (require.main === module) {
  seed().catch((err) => {
    console.error("\n❌ Seed failed:", err.message);
    process.exit(1);
  });
}
