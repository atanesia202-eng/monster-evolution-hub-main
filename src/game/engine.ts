import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CHAKRA_REGEN,
  GROUND_Y,
  GRAVITY,
  INITIAL_SKILLS,
  JUMP_FORCE,
  MAP_COLLECTIBLES,
  MAP_PLATFORMS,
  MAP2_PLATFORMS,
  MAP3_PLATFORMS,
  MAP4_PLATFORMS,
  MAP5_PLATFORMS,
  MOVE_SPEED,
  SPAWN_INTERVAL,
  TOWN_PLATFORMS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './constants';
import { Character, Enemy, GameState, Particle, Platform, Position, Projectile } from './types';
import { generateAllItems, rollItemDrop } from './itemData';

const ENEMY_ATTACK_INTERVAL_FRAMES = 300;

let nextId = 1;

function recalcPlayerStats(player: Character) {
  const atkFromStr = player.str * 10;
  const defFromDef = player.defPoints * 10;
  const hpFromVit = player.vit * 20;
  const matkFromInt = player.int * 10;
  const mpFromInt = player.int * 10;
  const atkSpeedFromAgi = player.agi * 10;

  player.attackPower = player.baseAttackPower + atkFromStr;
  player.defense = player.baseDefense + defFromDef;
  player.matk = matkFromInt;
  player.atkSpeed = atkSpeedFromAgi;

  player.maxHp = player.baseMaxHp + hpFromVit;
  player.maxChakra = player.baseMaxChakra + mpFromInt;

  player.hp = Math.min(player.hp, player.maxHp);
  player.chakra = Math.min(player.chakra, player.maxChakra);
}

export function getEquipmentAttackBonus(state: GameState): number {
  let bonus = 0;
  Object.values(state.inventory.equipped).forEach(item => {
    if (item && item.stats && item.stats.attack) {
      bonus += item.stats.attack;
    }
  });
  return bonus;
}

export function equipItem(state: GameState, itemId: string) {
  const item = state.inventory.items.find(i => i.id === itemId);
  if (!item) return;
  const slotType = item.type;
  const currentEquipped = state.inventory.equipped[slotType as keyof typeof state.inventory.equipped];
  
  // Create new equipped object to trigger React re-render
  const newEquipped = { ...state.inventory.equipped };
  
  if (currentEquipped) {
    const updatedCurrent = { ...currentEquipped, equipped: false };
    newEquipped[slotType as keyof typeof state.inventory.equipped] = updatedCurrent;
    if (updatedCurrent.stats) {
      if (updatedCurrent.stats.attack) state.player.baseAttackPower -= updatedCurrent.stats.attack;
      if (updatedCurrent.stats.defense) state.player.baseDefense -= updatedCurrent.stats.defense;
      if (updatedCurrent.stats.hp) state.player.baseMaxHp -= updatedCurrent.stats.hp;
      if (updatedCurrent.stats.mp) state.player.baseMaxChakra -= updatedCurrent.stats.mp;
    }
  }
  
  // Update item and create new items array
  const updatedItem = { ...item, equipped: true };
  newEquipped[slotType as keyof typeof state.inventory.equipped] = updatedItem;
  
  state.inventory.equipped = newEquipped;
  
  // Update items array with new reference
  const itemIndex = state.inventory.items.findIndex(i => i.id === itemId);
  if (itemIndex !== -1) {
    state.inventory.items = [
      ...state.inventory.items.slice(0, itemIndex),
      updatedItem,
      ...state.inventory.items.slice(itemIndex + 1)
    ];
  }
  
  if (updatedItem.stats) {
    if (updatedItem.stats.attack) state.player.baseAttackPower += updatedItem.stats.attack;
    if (updatedItem.stats.defense) state.player.baseDefense += updatedItem.stats.defense;
    if (updatedItem.stats.hp) state.player.baseMaxHp += updatedItem.stats.hp;
    if (updatedItem.stats.mp) state.player.baseMaxChakra += updatedItem.stats.mp;
  }
  recalcPlayerStats(state.player);
}

export function unequipItem(state: GameState, slotType: string) {
  const currentEquipped = state.inventory.equipped[slotType as keyof typeof state.inventory.equipped];
  if (!currentEquipped) return;
  
  // Create new equipped object without the unequipped item
  const newEquipped = { ...state.inventory.equipped };
  delete newEquipped[slotType as keyof typeof state.inventory.equipped];
  state.inventory.equipped = newEquipped;
  
  // Update item in items array
  const itemIndex = state.inventory.items.findIndex(i => i.id === currentEquipped.id);
  if (itemIndex !== -1) {
    const updatedItem = { ...currentEquipped, equipped: false };
    state.inventory.items = [
      ...state.inventory.items.slice(0, itemIndex),
      updatedItem,
      ...state.inventory.items.slice(itemIndex + 1)
    ];
    
    if (updatedItem.stats) {
      if (updatedItem.stats.attack) state.player.baseAttackPower -= updatedItem.stats.attack;
      if (updatedItem.stats.defense) state.player.baseDefense -= updatedItem.stats.defense;
      if (updatedItem.stats.hp) state.player.baseMaxHp -= updatedItem.stats.hp;
      if (updatedItem.stats.mp) state.player.baseMaxChakra -= updatedItem.stats.mp;
    }
  }
  
  recalcPlayerStats(state.player);
}

export function allocateStat(state: GameState, stat: 'str' | 'defPoints' | 'vit' | 'int' | 'agi', amount: number = 1) {
  const player = state.player;
  if (amount > 0 && player.statPoints <= 0) return;
  if (amount < 0 && player[stat] <= 0) return;
  if (amount > 0) {
    player.statPoints--;
  } else {
    player.statPoints++;
  }
  if (stat === 'str') player.str += amount;
  if (stat === 'defPoints') player.defPoints += amount;
  if (stat === 'vit') player.vit += amount;
  if (stat === 'int') player.int += amount;
  if (stat === 'agi') player.agi += amount;
  recalcPlayerStats(player);
}

export function deleteItem(state: GameState, itemId: string): number {
  const itemIndex = state.inventory.items.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    const item = state.inventory.items[itemIndex];
    if (item.equipped) {
      const slotType = Object.keys(state.inventory.equipped).find(
        key => state.inventory.equipped[key as keyof typeof state.inventory.equipped]?.id === itemId
      );
      if (slotType) {
        unequipItem(state, slotType);
      }
    }
    // Create new array to trigger React re-render
    state.inventory.items = [...state.inventory.items.slice(0, itemIndex), ...state.inventory.items.slice(itemIndex + 1)];
    state.gold += 10;
    state.inventory.gold += 10;
    return 10;
  }
  return 0;
}

export function createInitialState(): GameState {
  const state: GameState = {
    player: {
      pos: { x: 250, y: GROUND_Y - 60 },
      vel: { vx: 0, vy: 0 },
      width: 60,
      height: 90,
      hp: 100,
      maxHp: 100,
      baseMaxHp: 100,
      chakra: 100,
      maxChakra: 100,
      baseMaxChakra: 100,
      exp: 0,
      maxExp: 100,
      level: 1,
      facing: 'right',
      state: 'idle',
      stateTimer: 0,
      attackPower: 20,
      baseAttackPower: 20,
      defense: 5,
      baseDefense: 5,
      matk: 0,
      atkSpeed: 0,
      str: 0,
      defPoints: 0,
      vit: 0,
      int: 0,
      agi: 0,
      statPoints: 10,
      speed: MOVE_SPEED,
      isOnGround: true,
      jumps: 2,
      jumpsLeft: 2,
      jumpPressed: false,
      upPressed: false,
    },
    enemies: [],
    projectiles: [],
    particles: [],
    platforms: TOWN_PLATFORMS.map((p) => ({ ...p, pos: { ...p.pos } })), // Start in town
    collectibles: [], // No collectibles in town initially
    skills: INITIAL_SKILLS.map((s) => ({ ...s })),
    camera: { x: 0, y: 0 },
    gold: 0,
    diamonds: 0,
    score: 0,
    gameTime: 0,
    spawnTimer: 300,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    groundY: GROUND_Y,
    keys: new Set(),
    gameOver: false,
    combo: 0,
    comboTimer: 0,
    coins: 0,
    inventory: {
      items: generateAllItems(),
      gold: 0,
      diamonds: 0,
      equipped: {}
    },
    showInventory: false,
    stars: 0,
    location: 0, // Start in town (map 0)
  };

  recalcPlayerStats(state.player);

  // No initial enemies since we start in town (location 0)
  state.enemies = [];

  return state;
}

export function switchLocation(state: GameState, location: 0 | 1 | 2 | 3 | 4 | 5) {
  state.location = location;
  
  if (location === 0) {
    // Switch to town (map 0)
    state.platforms = TOWN_PLATFORMS.map((p) => ({ ...p, pos: { ...p.pos } }));
    state.collectibles = []; // No collectibles in town
    state.enemies = []; // No enemies in town
    state.player.pos = { x: 3600, y: 550 }; // Start position in town (near rightmost portal)
    state.worldWidth = WORLD_WIDTH;
    state.worldHeight = WORLD_HEIGHT;
  } else if (location === 1) {
    // Switch to field (map 1 - with ORC monsters)
    state.platforms = MAP_PLATFORMS.map((p) => ({ ...p, pos: { ...p.pos } }));
    state.collectibles = MAP_COLLECTIBLES.map((c) => ({ ...c, pos: { ...c.pos } }));
    state.player.pos = { x: 180, y: 550 };
    state.worldWidth = WORLD_WIDTH;
    state.worldHeight = WORLD_HEIGHT;
    
    // Spawn ORC enemies: normal, miniboss, boss
    state.enemies = [];
    // 10 normal orcs
    for (let i = 0; i < 10; i++) {
      state.enemies.push(spawnOrcEnemy(state, 'orc_normal'));
    }
    // 3 minibosses
    for (let i = 0; i < 3; i++) {
      state.enemies.push(spawnOrcEnemy(state, 'orc_miniboss'));
    }
    // 1 boss
    state.enemies.push(spawnOrcEnemy(state, 'orc_boss'));
  } else if (location === 2) {
    // Switch to desert (map 2)
    state.platforms = MAP2_PLATFORMS.map((p) => ({ ...p, pos: { ...p.pos } }));
    state.collectibles = MAP_COLLECTIBLES.map((c) => ({ ...c, pos: { ...c.pos } }));
    state.player.pos = { x: 400, y: 500 }; // Start position in desert
    state.worldWidth = WORLD_WIDTH;
    state.worldHeight = WORLD_HEIGHT;
    
    // Spawn enemies for desert
    state.enemies = [];
    for (let i = 0; i < 20; i++) {
      state.enemies.push(spawnEnemy(state));
    }
  } else if (location === 3) {
    // Switch to snow (map 3)
    state.platforms = MAP3_PLATFORMS.map((p) => ({ ...p, pos: { ...p.pos } }));
    state.collectibles = MAP_COLLECTIBLES.map((c) => ({ ...c, pos: { ...c.pos } }));
    state.player.pos = { x: 500, y: 500 }; // Start position in snow
    state.worldWidth = WORLD_WIDTH;
    state.worldHeight = WORLD_HEIGHT;
    
    // Spawn enemies for snow (stronger)
    state.enemies = [];
    for (let i = 0; i < 25; i++) {
      state.enemies.push(spawnEnemy(state));
    }
  } else if (location === 4) {
    // Switch to forest (map 4)
    state.platforms = MAP4_PLATFORMS.map((p) => ({ ...p, pos: { ...p.pos } }));
    state.collectibles = MAP_COLLECTIBLES.map((c) => ({ ...c, pos: { ...c.pos } }));
    state.player.pos = { x: 300, y: 500 }; // Start position in forest
    state.worldWidth = WORLD_WIDTH;
    state.worldHeight = WORLD_HEIGHT;
    
    // Spawn enemies for forest (many)
    state.enemies = [];
    for (let i = 0; i < 30; i++) {
      state.enemies.push(spawnEnemy(state));
    }
  } else if (location === 5) {
    // Switch to volcano (map 5 - final area)
    state.platforms = MAP5_PLATFORMS.map((p) => ({ ...p, pos: { ...p.pos } }));
    state.collectibles = MAP_COLLECTIBLES.map((c) => ({ ...c, pos: { ...c.pos } }));
    state.player.pos = { x: 400, y: 500 }; // Start position in volcano
    state.worldWidth = WORLD_WIDTH;
    state.worldHeight = WORLD_HEIGHT;
    
    // Spawn boss enemies for volcano
    state.enemies = [];
    for (let i = 0; i < 5; i++) {
      const bossEnemy = spawnEnemy(state);
      bossEnemy.type = 'boss';
      bossEnemy.hp = 1000;
      bossEnemy.maxHp = 1000;
      state.enemies.push(bossEnemy);
    }
  }
  
  state.camera = { x: 0, y: 0 };
}

function spawnOrcEnemy(state: GameState, orcType: 'orc_normal' | 'orc_miniboss' | 'orc_boss'): Enemy {
  const x = Math.random() * (WORLD_WIDTH - 80) + 20;
  const hpMult = 1 + state.player.level * 0.15;

  const orcStats: Record<string, { hp: number; atk: number; exp: number; w: number; h: number }> = {
    orc_normal:   { hp: 60,   atk: 3,  exp: 25,  w: 100, h: 120 },
    orc_miniboss: { hp: 200,  atk: 8,  exp: 80,  w: 140, h: 160 },
    orc_boss:     { hp: 600,  atk: 15, exp: 250, w: 180, h: 200 },
  };
  const s = orcStats[orcType];

  let spawnY = GROUND_Y - s.h;
  for (const plat of state.platforms) {
    if (x >= plat.pos.x && x <= plat.pos.x + plat.width) {
      spawnY = plat.pos.y - s.h;
      break;
    }
  }

  return {
    id: nextId++,
    pos: { x: Math.max(0, Math.min(WORLD_WIDTH - s.w, x)), y: spawnY },
    vel: { vx: 0, vy: 0 },
    width: s.w,
    height: s.h,
    hp: Math.floor(s.hp * hpMult),
    maxHp: Math.floor(s.hp * hpMult),
    facing: Math.random() > 0.5 ? 'left' : 'right',
    state: 'walk',
    stateTimer: 0,
    attackPower: s.atk,
    type: orcType,
    expReward: s.exp,
    isBoss: orcType === 'orc_boss',
  };
}

function spawnEnemy(state: GameState): Enemy {
  const types: Enemy['type'][] = ['bandit', 'rogue_ninja', 'shadow_clone'];
  const canSpawnBoss = state.player.level >= 5 && Math.random() < 0.05;
  const type = canSpawnBoss ? 'boss' as Enemy['type'] : types[Math.floor(Math.random() * Math.min(types.length, 1 + Math.floor(state.player.level / 3)))];
  const x = Math.random() * (WORLD_WIDTH - 80) + 20;
  const hpMult = 1 + state.player.level * 0.15;
  const stats: Record<string, { hp: number; atk: number; exp: number }> = {
    bandit: { hp: 40, atk: 1, exp: 20 },
    rogue_ninja: { hp: 70, atk: 4, exp: 40 },
    shadow_clone: { hp: 100, atk: 5, exp: 60 },
    boss: { hp: 500, atk: 10, exp: 200 },
  };
  const s = stats[type];

  let spawnY = GROUND_Y - 80;
  for (const plat of state.platforms) {
    if (x >= plat.pos.x && x <= plat.pos.x + plat.width) {
      spawnY = plat.pos.y - 80;
      break;
    }
  }

  return {
    id: nextId++,
    pos: { x: Math.max(0, Math.min(WORLD_WIDTH - 40, x)), y: spawnY },
    vel: { vx: 0, vy: 0 },
    width: type === 'boss' ? 80 : 60,
    height: type === 'boss' ? 100 : 80,
    hp: Math.floor(s.hp * hpMult),
    maxHp: Math.floor(s.hp * hpMult),
    facing: Math.random() > 0.5 ? 'left' : 'right',
    state: 'walk',
    stateTimer: 0,
    attackPower: s.atk,
    type,
    expReward: s.exp,
    isBoss: type === 'boss',
  };
}

function spawnParticles(state: GameState, x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      pos: { x, y },
      vel: { vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.8) * 5 },
      life: 20 + Math.random() * 20,
      maxLife: 40,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function spawnGold(state: GameState, x: number, y: number, amount: number) {
  for (let i = 0; i < amount; i++) {
    state.collectibles.push({
      id: nextId++,
      pos: { x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 20 },
      width: 24,
      height: 24,
      type: 'gold',
      value: 1,
      collected: false,
    });
  }
}

function spawnItemDrop(state: GameState, x: number, y: number, item: import('./types').InventoryItem) {
  state.collectibles.push({
    id: nextId++,
    pos: { x: x + (Math.random() - 0.5) * 30, y: y - 10 },
    width: 28,
    height: 28,
    type: 'item_drop',
    value: 0,
    collected: false,
    droppedItem: item,
  });
}

function collides(a: { pos: { x: number; y: number }; width: number; height: number }, b: { pos: { x: number; y: number }; width: number; height: number }) {
  return a.pos.x < b.pos.x + b.width &&
    a.pos.x + a.width > b.pos.x &&
    a.pos.y < b.pos.y + b.height &&
    a.pos.y + a.height > b.pos.y;
}

export function useSkill(state: GameState, skillIndex: number) {
  if (state.gameOver) return;
  const skill = state.skills[skillIndex];
  if (!skill || skill.currentCooldown > 0 || state.player.chakra < skill.chakraCost) return;

  state.player.chakra -= skill.chakraCost;
  skill.currentCooldown = skill.cooldown;
  state.player.state = 'skill';
  state.player.stateTimer = 0;

  const dir = state.player.facing === 'right' ? 1 : -1;
  const px = state.player.pos.x + (dir > 0 ? state.player.width : -10);
  const py = state.player.pos.y + state.player.height / 3;

  if (skill.id === 'melee_slash') {
    const atkBox = {
      pos: { x: state.player.pos.x + (dir > 0 ? state.player.width : -70), y: state.player.pos.y - 10 },
      width: 70,
      height: state.player.height + 20,
    };
    for (const enemy of state.enemies) {
      if (enemy.state === 'dead') continue;
      if (collides(atkBox, enemy)) {
        const totalDamage = skill.damage + state.player.attackPower + getEquipmentAttackBonus(state);
        enemy.hp -= totalDamage;
        enemy.state = 'hurt';
        enemy.stateTimer = 0;
        spawnParticles(state, enemy.pos.x + enemy.width / 2, enemy.pos.y, '#00bfff', 5);
        state.combo++;
        state.comboTimer = 120;
      }
    }
    state.projectiles.push({
      id: nextId++,
      pos: { x: px, y: py - 20 },
      vel: { vx: dir * 8, vy: 0 },
      width: 50,
      height: 50,
      damage: 0,
      color: skill.color,
      lifetime: 15,
      fromPlayer: true,
      dir: dir as 1 | -1,
      type: 'melee_slash',
    });
  } else if (skill.id === 'shuriken') {
    state.projectiles.push({
      id: nextId++,
      pos: { x: px, y: py },
      vel: { vx: dir * 7, vy: 0 },
      width: 20,
      height: 20,
      damage: skill.damage + state.player.attackPower + getEquipmentAttackBonus(state),
      color: skill.color,
      lifetime: 80,
      fromPlayer: true,
      type: 'shuriken',
    });
  } else if (skill.id === 'aoe_ring') {
    const totalDamage = skill.damage + state.player.attackPower + getEquipmentAttackBonus(state);
    for (const enemy of state.enemies) {
      if (enemy.state === 'dead') continue;
      const dx = enemy.pos.x - state.player.pos.x;
      const dy = enemy.pos.y - state.player.pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 120) {
        enemy.hp -= totalDamage;
        enemy.state = 'hurt';
        enemy.stateTimer = 0;
        spawnParticles(state, enemy.pos.x + enemy.width / 2, enemy.pos.y, '#b0b0ff', 8);
        state.combo++;
        state.comboTimer = 120;
      }
    }
  } else if (skill.id === 'map_blast') {
    const totalDamage = skill.damage + state.player.attackPower + getEquipmentAttackBonus(state);
    for (const enemy of state.enemies) {
      if (enemy.state === 'dead') continue;
      enemy.hp -= totalDamage;
      enemy.state = 'hurt';
      enemy.stateTimer = 0;
      spawnParticles(state, enemy.pos.x + enemy.width / 2, enemy.pos.y, '#f97316', 10);
      state.combo++;
      state.comboTimer = 120;
    }
    spawnParticles(state, state.player.pos.x, state.player.pos.y, '#f97316', 30);
  }
}

export function update(state: GameState) {
  if (state.gameOver) return;

  const player = state.player;
  state.gameTime++;

  // Movement
  if (state.keys.has('move-left')) {
    player.vel.vx = -player.speed;
    player.facing = 'left';
    if (player.state !== 'attack' && player.state !== 'skill' && player.state !== 'hurt') player.state = 'walk';
  } else if (state.keys.has('move-right')) {
    player.vel.vx = player.speed;
    player.facing = 'right';
    if (player.state !== 'attack' && player.state !== 'skill' && player.state !== 'hurt') player.state = 'walk';
  } else {
    player.vel.vx *= 0.8;
    if (Math.abs(player.vel.vx) < 0.1) player.vel.vx = 0;
    if (player.state === 'walk') player.state = 'idle';
  }

  // Jump
  if (state.keys.has('jump') && !player.jumpPressed && player.jumpsLeft > 0) {
    player.vel.vy = JUMP_FORCE;
    player.jumpsLeft--;
    player.isOnGround = false;
    player.jumpPressed = true;
    if (player.state !== 'attack' && player.state !== 'skill') player.state = 'jump';
  }
  if (!state.keys.has('jump')) player.jumpPressed = false;

  // Drop through platform
  if (state.keys.has('move-down') && player.isOnGround) {
    player.pos.y += 5;
    player.isOnGround = false;
  }

  // Attack
  if (state.keys.has('attack') && player.state !== 'attack' && player.state !== 'skill') {
    player.state = 'attack';
    player.stateTimer = 0;
    const dir = player.facing === 'right' ? 1 : -1;
    const atkBox = {
      pos: { x: player.pos.x + (dir > 0 ? player.width : -40), y: player.pos.y },
      width: 40,
      height: player.height,
    };
    for (const enemy of state.enemies) {
      if (enemy.state === 'dead') continue;
      if (collides(atkBox, enemy)) {
        const totalDamage = player.attackPower + getEquipmentAttackBonus(state);
        enemy.hp -= totalDamage;
        enemy.state = 'hurt';
        enemy.stateTimer = 0;
        spawnParticles(state, enemy.pos.x + enemy.width / 2, enemy.pos.y, '#fbbf24', 4);
        state.combo++;
        state.comboTimer = 120;
      }
    }
  }

  // Gravity
  player.vel.vy += GRAVITY;
  player.pos.x += player.vel.vx;
  player.pos.y += player.vel.vy;

  // Ground collision
  if (player.pos.y + player.height >= GROUND_Y) {
    player.pos.y = GROUND_Y - player.height;
    player.vel.vy = 0;
    player.isOnGround = true;
    player.jumpsLeft = player.jumps;
  }

  // Platform collision
  player.isOnGround = player.pos.y + player.height >= GROUND_Y;
  for (const plat of state.platforms) {
    // Check if player is near portal platform (more forgiving collision)
    if (plat.type === 'portal' &&
        player.pos.x + player.width > plat.pos.x &&
        player.pos.x < plat.pos.x + plat.width &&
        player.pos.y + player.height >= plat.pos.y &&
        player.pos.y <= plat.pos.y + plat.height) {
      
      // Check if player is pressing up key to activate portal
      if (state.keys.has('move-up')) {
        // Switch location based on current location
        if (state.location === 1) {
          switchLocation(state, 0); // Field (1) -> Town (0)
        } else if (state.location === 2) {
          switchLocation(state, 3); // Desert (2) -> Snow (3)
        } else if (state.location === 3) {
          switchLocation(state, 4); // Snow (3) -> Forest (4)
        } else if (state.location === 4) {
          switchLocation(state, 5); // Forest (4) -> Volcano (5)
        } else {
          switchLocation(state, 1); // Town (0) or others -> Field (1)
        }
        return; // Exit early to avoid collision handling
      }
    }
    
    // Regular platform collision
    if (player.vel.vy >= 0 &&
      player.pos.x + player.width > plat.pos.x &&
      player.pos.x < plat.pos.x + plat.width &&
      player.pos.y + player.height >= plat.pos.y &&
      player.pos.y + player.height <= plat.pos.y + plat.height + 10) {
      if (!state.keys.has('move-down')) {
        player.pos.y = plat.pos.y - player.height;
        player.vel.vy = 0;
        player.isOnGround = true;
        player.jumpsLeft = player.jumps;
      }
    }
  }

  // World bounds
  player.pos.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.pos.x));
  player.pos.y = Math.max(-100, player.pos.y);

  // Camera
  const targetCamX = player.pos.x - CANVAS_WIDTH / 2 + player.width / 2;
  const targetCamY = player.pos.y - CANVAS_HEIGHT / 2 + player.height / 2;
  state.camera.x += (targetCamX - state.camera.x) * 0.08;
  state.camera.y += (targetCamY - state.camera.y) * 0.08;
  state.camera.x = Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH, state.camera.x));
  state.camera.y = Math.max(-200, Math.min(WORLD_HEIGHT - CANVAS_HEIGHT, state.camera.y));

  // State timer
  player.stateTimer++;
  if ((player.state === 'attack' && player.stateTimer > 15) ||
    (player.state === 'skill' && player.stateTimer > 20) ||
    (player.state === 'hurt' && player.stateTimer > 10)) {
    player.state = player.isOnGround ? 'idle' : 'jump';
  }

  // Chakra regen
  if (state.gameTime % 60 === 0) {
    player.chakra = Math.min(player.maxChakra, player.chakra + CHAKRA_REGEN);
  }

  // HP regen
  if (state.gameTime % 120 === 0) {
    player.hp = Math.min(player.maxHp, player.hp + 1);
  }

  // Combo timer
  if (state.comboTimer > 0) {
    state.comboTimer--;
    if (state.comboTimer <= 0) {
      state.score += state.combo * 10;
      state.combo = 0;
    }
  }

  // Skill cooldowns
  for (const skill of state.skills) {
    if (skill.currentCooldown > 0) skill.currentCooldown--;
  }

  // Enemy AI
  for (const enemy of state.enemies) {
    if (enemy.state === 'dead') {
      enemy.stateTimer++;
      continue;
    }

    enemy.stateTimer++;

    // Movement towards player
    const dx = player.pos.x - enemy.pos.x;
    const dy = player.pos.y - enemy.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (enemy.state === 'hurt') {
      if (enemy.stateTimer > 10) {
        enemy.state = 'walk';
        enemy.stateTimer = 0;
      }
    } else if (dist < 10 + enemy.width / 2 + (enemy.type === 'orc_boss' ? 15 : 0) && enemy.state !== 'attack') {
      // Stop and start attack animation when in range (account for enemy width)
      enemy.state = 'attack';
      enemy.stateTimer = 0;
      enemy.vel.vx = 0;
    } else if (enemy.state === 'attack') {
      // During attack animation, stay still and deal damage at middle of animation
      enemy.vel.vx = 0;
      // Deal damage when animation reaches middle (frame 12), account for enemy width
      if (enemy.stateTimer === 12 && dist < 10 + enemy.width / 2 + (enemy.type === 'orc_boss' ? 15 : 0) && player.state !== 'hurt') {
        const dmg = Math.max(1, enemy.attackPower - player.defense * 0.3);
        player.hp -= dmg;
        player.state = 'hurt';
        player.stateTimer = 0;
        spawnParticles(state, player.pos.x + player.width / 2, player.pos.y, '#ef4444', 4);
      }
      // End attack animation after 120 frames (~2 seconds, faster attacks)
      if (enemy.stateTimer > 120) {
        enemy.state = 'idle';
        enemy.stateTimer = 0;
      }
    } else {
      // Only chase if player is within aggro range (350 pixels)
      const AGGRO_RANGE = 350;
      if (dist < AGGRO_RANGE && dist > 30) {
        enemy.state = 'walk';
        const speed = 0.5; // Same speed for all enemy types
        enemy.vel.vx = (dx > 0 ? speed : -speed);
        // Only change facing if player is significantly to the other side (15px threshold)
        if (dx > 15) enemy.facing = 'right';
        else if (dx < -15) enemy.facing = 'left';
        // Otherwise keep current facing (prevents flickering)
      } else {
        // Stay idle if player is too far
        enemy.state = 'idle';
        enemy.vel.vx = 0;
      }
    }

    // Gravity for enemies
    enemy.vel.vy += GRAVITY;
    enemy.pos.x += enemy.vel.vx;
    enemy.pos.y += enemy.vel.vy;

    // Ground
    if (enemy.pos.y + enemy.height >= GROUND_Y) {
      enemy.pos.y = GROUND_Y - enemy.height;
      enemy.vel.vy = 0;
    }

    // Platform collision - check if enemy center is still on a platform
    let onPlatform = false;
    const enemyCenterX = enemy.pos.x + enemy.width / 2;
    for (const plat of state.platforms) {
      const platLeft = plat.pos.x;
      const platRight = plat.pos.x + plat.width;
      // Check if enemy center is within platform bounds horizontally
      if (enemy.vel.vy >= 0 &&
        enemyCenterX >= platLeft &&
        enemyCenterX <= platRight &&
        enemy.pos.y + enemy.height >= plat.pos.y &&
        enemy.pos.y + enemy.height <= plat.pos.y + plat.height + 10) {
        enemy.pos.y = plat.pos.y - enemy.height;
        enemy.vel.vy = 0;
        onPlatform = true;
      }
    }
    
    // If not on ground and not on any platform, apply gravity to fall
    if (enemy.pos.y + enemy.height < GROUND_Y && !onPlatform && enemy.vel.vy === 0) {
      enemy.vel.vy = GRAVITY; // Start falling
    }

    enemy.pos.x = Math.max(0, Math.min(WORLD_WIDTH - enemy.width, enemy.pos.x));

    // Death check
    if (enemy.hp <= 0 && (enemy.state as string) !== 'dead') {
      enemy.state = 'dead';
      enemy.stateTimer = 0;
      state.score += enemy.expReward;
      player.exp += enemy.expReward;

      // Level up
      while (player.exp >= player.maxExp) {
        player.exp -= player.maxExp;
        player.level++;
        player.maxExp = Math.floor(player.maxExp * 1.3);
        player.statPoints += 3;
        player.hp = player.maxHp;
        player.chakra = player.maxChakra;
        spawnParticles(state, player.pos.x + player.width / 2, player.pos.y, '#fbbf24', 20);
      }

      spawnGold(state, enemy.pos.x, enemy.pos.y, enemy.isBoss ? 10 : 3);

      // Item drops
      const droppedItem = rollItemDrop(!!enemy.isBoss);
      if (droppedItem) {
        spawnItemDrop(state, enemy.pos.x, enemy.pos.y, droppedItem);
      }
    }
  }

  // Remove dead enemies after animation (longer for death animation to play)
  state.enemies = state.enemies.filter(e => !(e.state === 'dead' && e.stateTimer > 90));

  // Spawn new enemies
  state.spawnTimer--;
  if (state.spawnTimer <= 0 && state.location === 1) {
    state.spawnTimer = SPAWN_INTERVAL;
    const targetCount = Math.min(20, 5 + state.player.level);
    while (state.enemies.length < targetCount) {
      // Weighted spawn: 70% normal, 20% miniboss, 10% boss
      const roll = Math.random();
      if (roll < 0.7) {
        state.enemies.push(spawnOrcEnemy(state, 'orc_normal'));
      } else if (roll < 0.9) {
        state.enemies.push(spawnOrcEnemy(state, 'orc_miniboss'));
      } else {
        state.enemies.push(spawnOrcEnemy(state, 'orc_boss'));
      }
    }
  } else if (state.spawnTimer <= 0 && state.location > 1) {
    state.spawnTimer = SPAWN_INTERVAL;
    const targetCount = Math.min(20, 5 + state.player.level);
    while (state.enemies.length < targetCount) {
      state.enemies.push(spawnEnemy(state));
    }
  }

  // Projectiles
  for (const proj of state.projectiles) {
    proj.pos.x += proj.vel.vx;
    proj.pos.y += proj.vel.vy;
    proj.lifetime--;

    if (proj.fromPlayer && proj.damage > 0) {
      for (const enemy of state.enemies) {
        if (enemy.state === 'dead') continue;
        if (collides(proj, enemy)) {
          enemy.hp -= proj.damage;
          enemy.state = 'hurt';
          enemy.stateTimer = 0;
          spawnParticles(state, enemy.pos.x + enemy.width / 2, enemy.pos.y, proj.color, 5);
          state.combo++;
          state.comboTimer = 120;
          proj.lifetime = 0;
          break;
        }
      }
    }
  }
  state.projectiles = state.projectiles.filter(p => p.lifetime > 0);

  // Particles
  for (const p of state.particles) {
    p.pos.x += p.vel.vx;
    p.pos.y += p.vel.vy;
    p.vel.vy += 0.1;
    p.life--;
  }
  state.particles = state.particles.filter(p => p.life > 0);

  // Collectibles
  for (const col of state.collectibles) {
    if (col.collected) continue;
    if (collides(col, player)) {
      col.collected = true;
      if (col.type === 'gold') {
        state.gold++;
        state.coins++;
        state.inventory.gold++;
      } else if (col.type === 'diamond') {
        state.diamonds++;
        state.inventory.diamonds++;
      } else if (col.type === 'star') {
        state.stars++;
      } else if (col.type === 'item_drop' && col.droppedItem) {
        state.inventory.items.push(col.droppedItem);
        spawnParticles(state, col.pos.x, col.pos.y, RARITY_COLORS_MAP[col.droppedItem.rarity] || '#fff', 8);
      }
      spawnParticles(state, col.pos.x, col.pos.y, col.type === 'gold' ? '#ffd700' : col.type === 'diamond' ? '#00e5ff' : '#ffa500', 5);
    }
  }
  state.collectibles = state.collectibles.filter(c => !c.collected);

  // Game over
  if (player.hp <= 0) {
    state.gameOver = true;
  }
}

const RARITY_COLORS_MAP: Record<string, string> = {
  common: '#b0b0b0',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#fbbf24',
  artifact: '#fb923c',
  mythical: '#f87171',
};
