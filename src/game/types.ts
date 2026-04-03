export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Character {
  pos: Position;
  vel: Velocity;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  chakra: number;
  maxChakra: number;
  baseMaxHp: number;
  baseMaxChakra: number;
  exp: number;
  maxExp: number;
  level: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walk' | 'jump' | 'attack' | 'skill' | 'hurt';
  stateTimer: number;
  attackPower: number;
  defense: number;
  baseAttackPower: number;
  baseDefense: number;
  matk: number;
  atkSpeed: number;
  str: number;
  defPoints: number;
  vit: number;
  int: number;
  agi: number;
  statPoints: number;
  speed: number;
  isOnGround: boolean;
  jumps: number;
  jumpsLeft: number;
  jumpPressed: boolean;
  upPressed: boolean;
}

export interface Enemy {
  id: number;
  pos: Position;
  vel: Velocity;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walk' | 'attack' | 'hurt' | 'dead';
  stateTimer: number;
  attackPower: number;
  type: 'bandit' | 'rogue_ninja' | 'shadow_clone' | 'boss' | 'orc_normal' | 'orc_miniboss' | 'orc_boss';
  expReward: number;
  isBoss?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  nameTh: string;
  key: string;
  chakraCost: number;
  cooldown: number;
  currentCooldown: number;
  damage: number;
  color: string;
  icon: string;
}

export interface Projectile {
  id: number;
  pos: Position;
  vel: Velocity;
  width: number;
  height: number;
  damage: number;
  color: string;
  lifetime: number;
  fromPlayer: boolean;
  dir?: -1 | 1;
  type: 'melee_slash' | 'shuriken' | 'aoe_ring' | 'map_blast';
}

export interface Particle {
  pos: Position;
  vel: Velocity;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact' | 'mythical';

export const RARITY_ORDER: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact', 'mythical'];

export const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  artifact: 'Artifact',
  mythical: 'Mythical',
};

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#b0b0b0',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#fbbf24',
  artifact: '#fb923c',
  mythical: '#f87171',
};

export interface InventoryItem {
  id: string;
  name: string;
  type: 'helmet' | 'armor' | 'pants' | 'cloak' | 'weapon' | 'shield' | 'necklace' | 'ring' | 'bracelet' | 'earring';
  icon: string;
  rarity: ItemRarity;
  stats?: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
  };
  equipped?: boolean;
  quantity?: number;
}

export interface Inventory {
  items: InventoryItem[];
  gold: number;
  diamonds: number;
  equipped: {
    helmet?: InventoryItem;
    armor?: InventoryItem;
    pants?: InventoryItem;
    cloak?: InventoryItem;
    weapon?: InventoryItem;
    shield?: InventoryItem;
    necklace?: InventoryItem;
    ring?: InventoryItem;
    bracelet?: InventoryItem;
    earring?: InventoryItem;
  };
}

export interface Collectible {
  id: number;
  pos: Position;
  width: number;
  height: number;
  type: 'gold' | 'star' | 'diamond' | 'item_drop';
  value: number;
  collected: boolean;
  droppedItem?: InventoryItem;
}

export interface Platform {
  pos: Position;
  width: number;
  height: number;
  type: 'rock' | 'wood' | 'grass' | 'portal';
}

export interface GameState {
  player: Character;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  platforms: Platform[];
  collectibles: Collectible[];
  skills: Skill[];
  camera: Position;
  gold: number;
  diamonds: number;
  score: number;
  gameTime: number;
  spawnTimer: number;
  worldWidth: number;
  worldHeight: number;
  groundY: number;
  keys: Set<string>;
  gameOver: boolean;
  combo: number;
  comboTimer: number;
  coins: number;
  inventory: Inventory;
  showInventory: boolean;
  stars: number;
  location: 0 | 1 | 2 | 3 | 4 | 5; // Multiple map support
}
