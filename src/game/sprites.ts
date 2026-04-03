// Sprite animation manager for ORC monsters
// Uses import.meta.glob for dynamic loading

export interface SpriteAnimation {
  frames: HTMLImageElement[];
  loaded: boolean;
}

export interface MonsterSprites {
  idle: SpriteAnimation;
  walk: SpriteAnimation;
  attack: SpriteAnimation;
  hurt: SpriteAnimation;
  die: SpriteAnimation;
}

export type MonsterType = 'orc_normal' | 'orc_miniboss' | 'orc_boss';

const monsterSprites: Record<MonsterType, MonsterSprites> = {
  orc_normal: { idle: { frames: [], loaded: false }, walk: { frames: [], loaded: false }, attack: { frames: [], loaded: false }, hurt: { frames: [], loaded: false }, die: { frames: [], loaded: false } },
  orc_miniboss: { idle: { frames: [], loaded: false }, walk: { frames: [], loaded: false }, attack: { frames: [], loaded: false }, hurt: { frames: [], loaded: false }, die: { frames: [], loaded: false } },
  orc_boss: { idle: { frames: [], loaded: false }, walk: { frames: [], loaded: false }, attack: { frames: [], loaded: false }, hurt: { frames: [], loaded: false }, die: { frames: [], loaded: false } },
};

// Animation frame counter for each enemy (by id)
const enemyAnimCounters: Map<number, number> = new Map();

export function getEnemyAnimFrame(enemyId: number): number {
  const counter = enemyAnimCounters.get(enemyId) || 0;
  return counter;
}

export function updateEnemyAnimFrame(enemyId: number) {
  const counter = (enemyAnimCounters.get(enemyId) || 0) + 1;
  enemyAnimCounters.set(enemyId, counter);
}

export function clearEnemyAnimFrame(enemyId: number) {
  enemyAnimCounters.delete(enemyId);
}

function loadFrames(globResult: Record<string, () => Promise<{ default: string }>>, count: number): SpriteAnimation {
  const anim: SpriteAnimation = { frames: [], loaded: false };
  
  // Sort entries by filename to ensure correct order
  const sortedEntries = Object.entries(globResult).sort(([a], [b]) => a.localeCompare(b));
  
  let loadedCount = 0;
  const totalFrames = Math.min(sortedEntries.length, count);
  
  for (let i = 0; i < totalFrames; i++) {
    const img = new Image();
    anim.frames.push(img);
    
    sortedEntries[i][1]().then((module) => {
      img.src = module.default;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          anim.loaded = true;
        }
      };
    });
  }
  
  return anim;
}

// Eagerly import all ORC sprite PNGs using Vite's import.meta.glob
const orc1Idle = import.meta.glob('@/assets/monter/ORC/_PNG/1_ORK/ORK_01_IDLE_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc1Walk = import.meta.glob('@/assets/monter/ORC/_PNG/1_ORK/ORK_01_WALK_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc1Attack = import.meta.glob('@/assets/monter/ORC/_PNG/1_ORK/ORK_01_ATTAK_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc1Hurt = import.meta.glob('@/assets/monter/ORC/_PNG/1_ORK/ORK_01_HURT_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc1Die = import.meta.glob('@/assets/monter/ORC/_PNG/1_ORK/ORK_01_DIE_*.png') as Record<string, () => Promise<{ default: string }>>;

const orc2Idle = import.meta.glob('@/assets/monter/ORC/_PNG/2_ORK/ORK_02_IDLE_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc2Walk = import.meta.glob('@/assets/monter/ORC/_PNG/2_ORK/ORK_02_WALK_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc2Attack = import.meta.glob('@/assets/monter/ORC/_PNG/2_ORK/ORK_02_ATTAK_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc2Hurt = import.meta.glob('@/assets/monter/ORC/_PNG/2_ORK/ORK_02_HURT_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc2Die = import.meta.glob('@/assets/monter/ORC/_PNG/2_ORK/ORK_02_DIE_*.png') as Record<string, () => Promise<{ default: string }>>;

const orc3Idle = import.meta.glob('@/assets/monter/ORC/_PNG/3_ORK/ORK_03_IDLE_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc3Walk = import.meta.glob('@/assets/monter/ORC/_PNG/3_ORK/ORK_03_WALK_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc3Attack = import.meta.glob('@/assets/monter/ORC/_PNG/3_ORK/ORK_03_ATTAK_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc3Hurt = import.meta.glob('@/assets/monter/ORC/_PNG/3_ORK/ORK_03_HURT_*.png') as Record<string, () => Promise<{ default: string }>>;
const orc3Die = import.meta.glob('@/assets/monter/ORC/_PNG/3_ORK/ORK_03_DIE_*.png') as Record<string, () => Promise<{ default: string }>>;

let spritesInitialized = false;

export function initMonsterSprites() {
  if (spritesInitialized) return;
  spritesInitialized = true;

  monsterSprites.orc_normal.idle = loadFrames(orc1Idle, 10);
  monsterSprites.orc_normal.walk = loadFrames(orc1Walk, 10);
  monsterSprites.orc_normal.attack = loadFrames(orc1Attack, 10);
  monsterSprites.orc_normal.hurt = loadFrames(orc1Hurt, 10);
  monsterSprites.orc_normal.die = loadFrames(orc1Die, 10);

  monsterSprites.orc_miniboss.idle = loadFrames(orc2Idle, 10);
  monsterSprites.orc_miniboss.walk = loadFrames(orc2Walk, 10);
  monsterSprites.orc_miniboss.attack = loadFrames(orc2Attack, 10);
  monsterSprites.orc_miniboss.hurt = loadFrames(orc2Hurt, 10);
  monsterSprites.orc_miniboss.die = loadFrames(orc2Die, 10);

  monsterSprites.orc_boss.idle = loadFrames(orc3Idle, 10);
  monsterSprites.orc_boss.walk = loadFrames(orc3Walk, 10);
  monsterSprites.orc_boss.attack = loadFrames(orc3Attack, 10);
  monsterSprites.orc_boss.hurt = loadFrames(orc3Hurt, 10);
  monsterSprites.orc_boss.die = loadFrames(orc3Die, 10);
}

export function getMonsterSprites(): Record<MonsterType, MonsterSprites> {
  return monsterSprites;
}

export function getMonsterSpriteFrame(
  monsterType: MonsterType,
  state: 'idle' | 'walk' | 'attack' | 'hurt' | 'dead',
  stateTimer: number
): HTMLImageElement | null {
  const sprites = monsterSprites[monsterType];
  if (!sprites) return null;

  const animState = state === 'dead' ? 'die' : state;
  const anim = sprites[animState];
  if (!anim || !anim.loaded || anim.frames.length === 0) return null;

  // Animation speed: 15 frames per image (0.25 sec per frame at 60 FPS)
  const frameDivisor = 15;
  const frameIndex = Math.floor(stateTimer / frameDivisor) % anim.frames.length;
  const frame = anim.frames[frameIndex];
  
  return (frame && frame.complete) ? frame : null;
}
