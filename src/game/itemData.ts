import { InventoryItem, ItemRarity } from './types';

// Rarity multipliers for stats
const RARITY_STAT_MULTIPLIER: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 5,
  legendary: 8,
  artifact: 12,
  mythical: 18,
};

const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '',
  uncommon: 'ดี',
  rare: 'หายาก',
  epic: 'มหากาฬ',
  legendary: 'ตำนาน',
  artifact: 'โบราณ',
  mythical: 'เทพ',
};

interface ItemTemplate {
  type: InventoryItem['type'];
  baseName: string;
  icon: string;
  baseStats: { attack?: number; defense?: number; hp?: number; mp?: number };
}

const ITEM_TEMPLATES: ItemTemplate[] = [
  { type: 'helmet', baseName: 'หมวก', icon: '👑', baseStats: { defense: 2 } },
  { type: 'weapon', baseName: 'ดาบ', icon: '⚔️', baseStats: { attack: 5 } },
  { type: 'armor', baseName: 'เสื้อเกราะ', icon: '🛡️', baseStats: { defense: 3 } },
  { type: 'pants', baseName: 'กางเกง', icon: '👖', baseStats: { defense: 2 } },
  { type: 'cloak', baseName: 'ผ้าคลุม', icon: '🧥', baseStats: { defense: 2 } },
  { type: 'shield', baseName: 'โล่', icon: '🛡️', baseStats: { defense: 4 } },
  { type: 'necklace', baseName: 'สร้อยคอ', icon: '📿', baseStats: { defense: 1, hp: 5 } },
  { type: 'ring', baseName: 'แหวน', icon: '💍', baseStats: { attack: 2, defense: 1 } },
  { type: 'bracelet', baseName: 'กำไล', icon: '⌚', baseStats: { defense: 1, attack: 1 } },
  { type: 'earring', baseName: 'ต่างหู', icon: '💎', baseStats: { attack: 1, defense: 1 } },
];

const RARITIES: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact', 'mythical'];

export function generateAllItems(): InventoryItem[] {
  const items: InventoryItem[] = [];

  for (const template of ITEM_TEMPLATES) {
    for (const rarity of RARITIES) {
      const mult = RARITY_STAT_MULTIPLIER[rarity];
      const rarityLabel = RARITY_NAMES[rarity];
      const name = rarityLabel ? `${template.baseName}${rarityLabel}` : template.baseName;

      const stats: InventoryItem['stats'] = {};
      if (template.baseStats.attack) stats.attack = template.baseStats.attack * mult;
      if (template.baseStats.defense) stats.defense = template.baseStats.defense * mult;
      if (template.baseStats.hp) stats.hp = template.baseStats.hp * mult;
      if (template.baseStats.mp) stats.mp = template.baseStats.mp * mult;

      items.push({
        id: `${template.type}-${rarity}`,
        name,
        type: template.type,
        icon: template.icon,
        rarity,
        stats,
        equipped: false,
      });
    }
  }

  return items;
}

// Generate a random item drop with given rarity
let dropIdCounter = 10000;
export function generateRandomItem(rarity: ItemRarity): InventoryItem {
  const template = ITEM_TEMPLATES[Math.floor(Math.random() * ITEM_TEMPLATES.length)];
  const mult = RARITY_STAT_MULTIPLIER[rarity];
  const rarityLabel = RARITY_NAMES[rarity];
  const name = rarityLabel ? `${template.baseName}${rarityLabel}` : template.baseName;

  const stats: InventoryItem['stats'] = {};
  if (template.baseStats.attack) stats.attack = template.baseStats.attack * mult;
  if (template.baseStats.defense) stats.defense = template.baseStats.defense * mult;
  if (template.baseStats.hp) stats.hp = template.baseStats.hp * mult;
  if (template.baseStats.mp) stats.mp = template.baseStats.mp * mult;

  return {
    id: `drop-${template.type}-${rarity}-${dropIdCounter++}`,
    name,
    type: template.type,
    icon: template.icon,
    rarity,
    stats,
    equipped: false,
  };
}

// Drop rates for normal monsters (white→red = common→mythical)
// Lower rarity = higher chance
export function rollItemDrop(isBoss: boolean): InventoryItem | null {
  const roll = Math.random() * 100;

  if (isBoss) {
    // Boss drops: guaranteed legendary or mythical
    if (roll < 30) {
      return generateRandomItem('mythical');   // 30% mythical (red)
    } else {
      return generateRandomItem('legendary');  // 70% legendary (gold)
    }
  }

  // Normal monster drop rates
  // Total drop chance ~25%
  if (roll < 0.5) {
    return generateRandomItem('mythical');    // 0.5% (สีแดง)
  } else if (roll < 1.5) {
    return generateRandomItem('artifact');    // 1% (สีส้ม)
  } else if (roll < 3.5) {
    return generateRandomItem('legendary');   // 2% (สีทอง)
  } else if (roll < 6.5) {
    return generateRandomItem('epic');        // 3% (สีม่วง)
  } else if (roll < 11.5) {
    return generateRandomItem('rare');        // 5% (สีน้ำเงิน)
  } else if (roll < 18.5) {
    return generateRandomItem('uncommon');    // 7% (สีเขียว)
  } else if (roll < 28.5) {
    return generateRandomItem('common');      // 10% (สีขาว)
  }

  return null; // 71.5% no drop
}
