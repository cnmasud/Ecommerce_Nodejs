/**
 * Returns a relevant emoji for a category name.
 * Falls back to 🏷️ for unknown categories.
 */
const MAP = {
  // Electronics & tech
  electronics: '💻', technology: '💻', computers: '🖥️', phones: '📱',
  mobile: '📱', cameras: '📷', audio: '🎧', tv: '📺', gaming: '🕹️',
  gadgets: '🔌', appliances: '🏠',

  // Fashion
  clothing: '👗', fashion: '👔', apparel: '🧥', shoes: '👟', footwear: '👠',
  accessories: '👜', bags: '🎒', jewellery: '💍', jewelry: '💍', watches: '⌚',
  sunglasses: '🕶️',

  // Home
  'home & garden': '🏡', home: '🏡', garden: '🌿', furniture: '🛋️',
  kitchen: '🍳', bedroom: '🛏️', bathroom: '🚿', tools: '🔧', decor: '🕯️',
  lighting: '💡',

  // Sports & outdoors
  sports: '⚽', fitness: '🏋️', gym: '🏋️', outdoor: '🏕️', camping: '⛺',
  cycling: '🚴', running: '🏃', swimming: '🏊', yoga: '🧘', tennis: '🎾',
  golf: '⛳', basketball: '🏀', football: '🏈', soccer: '⚽', baseball: '⚾',

  // Books & education
  books: '📚', education: '🎓', stationery: '📝', office: '📋',
  'arts & crafts': '🎨', art: '🎨', craft: '✂️',

  // Toys & games
  'toys & games': '🎮', toys: '🧸', games: '🎲', board: '♟️',
  puzzles: '🧩', kids: '🧒', baby: '👶',

  // Beauty & health
  beauty: '💄', cosmetics: '💋', skincare: '🧴', haircare: '💇',
  health: '💊', wellness: '🌿', pharmacy: '🏥', personal: '🪥',

  // Automotive
  automotive: '🚗', cars: '🚗', motorbike: '🏍️', motorcycle: '🏍️',
  auto: '🚘', tyres: '🛞', tires: '🛞',

  // Food & drink
  'food & drink': '🍕', food: '🍔', drinks: '☕', grocery: '🛒',
  beverages: '🥤', coffee: '☕', tea: '🍵', wine: '🍷', snacks: '🍿',
  organic: '🥦',

  // Music
  music: '🎸', instruments: '🎹', audio_music: '🎵', vinyl: '🎶',
  concerts: '🎤',

  // Travel
  travel: '✈️', luggage: '🧳', hotel: '🏨', holidays: '🌴',

  // Pets
  pets: '🐾', dogs: '🐕', cats: '🐈', fish: '🐠',

  // Other
  'gifts & flowers': '🎁', gifts: '🎁', flowers: '💐', plants: '🌱',
};

export function getCategoryIcon(name = '') {
  const key = name.toLowerCase().trim();
  // exact match
  if (MAP[key]) return MAP[key];
  // partial match
  for (const [k, v] of Object.entries(MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return '🏷️';
}
