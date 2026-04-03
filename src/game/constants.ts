import { Skill, Platform, Collectible } from './types';

export const GRAVITY = 0.4;
export const JUMP_FORCE = -10;
export const MOVE_SPEED = 2.5;
export const WORLD_WIDTH = 3840;  // doubled from 1920
export const WORLD_HEIGHT = 720;
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 640;
export const SPAWN_INTERVAL = 180;
export const CHAKRA_REGEN = 5;

export const INITIAL_SKILLS: Skill[] = [
  {
    id: 'melee_slash',
    name: 'Slash',
    nameTh: 'ฟันดาบ',
    key: '1',
    chakraCost: 2,
    cooldown: 20,
    currentCooldown: 0,
    damage: 25,
    color: '#00bfff',
    icon: '🔵',
  },
  {
    id: 'shuriken',
    name: 'Shuriken',
    nameTh: 'ชูริเก็น',
    key: '2',
    chakraCost: 3,
    cooldown: 40,
    currentCooldown: 0,
    damage: 20,
    color: '#1a1a1a',
    icon: '⚫',
  },
  {
    id: 'aoe_ring',
    name: 'Whirlwind',
    nameTh: 'ลมหมุน',
    key: '3',
    chakraCost: 4,
    cooldown: 20,
    currentCooldown: 0,
    damage: 40,
    color: '#b0b0ff',
    icon: '⚡',
  },
  {
    id: 'map_blast',
    name: 'Ultimate',
    nameTh: 'ท่าไม้ตาย',
    key: '4',
    chakraCost: 10,
    cooldown: 300,
    currentCooldown: 0,
    damage: 80,
    color: '#f97316',
    icon: '💥',
  },
];

// Original platforms + new ones for wider map
export const MAP_PLATFORMS: Platform[] = [
  // Portal platform in bottom-left (from town to field)
  { pos: { x: 50, y: 620 }, width: 80, height: 40, type: 'portal' },
  // Original left half
  { pos: { x: 60, y: 540 }, width: 420, height: 24, type: 'rock' },
  { pos: { x: 720, y: 540 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 200, y: 450 }, width: 180, height: 24, type: 'grass' },
  { pos: { x: 500, y: 430 }, width: 500, height: 24, type: 'rock' },
  { pos: { x: 1100, y: 460 }, width: 120, height: 24, type: 'grass' },
  { pos: { x: 1320, y: 480 }, width: 100, height: 24, type: 'grass' },
  { pos: { x: 300, y: 360 }, width: 100, height: 24, type: 'grass' },
  { pos: { x: 450, y: 340 }, width: 120, height: 24, type: 'grass' },
  { pos: { x: 620, y: 320 }, width: 450, height: 24, type: 'rock' },
  { pos: { x: 1200, y: 350 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 1500, y: 370 }, width: 180, height: 24, type: 'grass' },
  { pos: { x: 0, y: 250 }, width: 380, height: 24, type: 'rock' },
  { pos: { x: 480, y: 240 }, width: 140, height: 24, type: 'grass' },
  { pos: { x: 700, y: 220 }, width: 520, height: 24, type: 'rock' },
  { pos: { x: 1380, y: 260 }, width: 160, height: 24, type: 'grass' },
  { pos: { x: 1620, y: 280 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 0, y: 140 }, width: 350, height: 24, type: 'rock' },
  { pos: { x: 500, y: 120 }, width: 600, height: 24, type: 'rock' },
  { pos: { x: 1250, y: 150 }, width: 250, height: 24, type: 'grass' },
  { pos: { x: 1600, y: 130 }, width: 280, height: 24, type: 'rock' },
  // New right half (extended area)
  { pos: { x: 1980, y: 540 }, width: 400, height: 24, type: 'rock' },
  { pos: { x: 2500, y: 520 }, width: 300, height: 24, type: 'grass' },
  { pos: { x: 2900, y: 550 }, width: 250, height: 24, type: 'rock' },
  { pos: { x: 3300, y: 530 }, width: 350, height: 24, type: 'grass' },
  { pos: { x: 2100, y: 430 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 2400, y: 400 }, width: 350, height: 24, type: 'rock' },
  { pos: { x: 2850, y: 420 }, width: 180, height: 24, type: 'grass' },
  { pos: { x: 3150, y: 410 }, width: 280, height: 24, type: 'rock' },
  { pos: { x: 3500, y: 440 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 2000, y: 320 }, width: 300, height: 24, type: 'rock' },
  { pos: { x: 2450, y: 300 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 2750, y: 280 }, width: 400, height: 24, type: 'rock' },
  { pos: { x: 3250, y: 310 }, width: 250, height: 24, type: 'grass' },
  { pos: { x: 3600, y: 330 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 2100, y: 200 }, width: 250, height: 24, type: 'grass' },
  { pos: { x: 2500, y: 180 }, width: 400, height: 24, type: 'rock' },
  { pos: { x: 3000, y: 200 }, width: 300, height: 24, type: 'grass' },
  { pos: { x: 3400, y: 220 }, width: 280, height: 24, type: 'rock' },
  { pos: { x: 2000, y: 120 }, width: 300, height: 24, type: 'rock' },
  { pos: { x: 2500, y: 100 }, width: 500, height: 24, type: 'rock' },
  { pos: { x: 3200, y: 130 }, width: 250, height: 24, type: 'grass' },
  { pos: { x: 3550, y: 110 }, width: 250, height: 24, type: 'rock' },
];

// Town platforms - similar to field but without monsters
export const TOWN_PLATFORMS: Platform[] = [
  // Ground level platforms
  { pos: { x: 60, y: 540 }, width: 420, height: 24, type: 'rock' },
  { pos: { x: 720, y: 540 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 200, y: 450 }, width: 180, height: 24, type: 'grass' },
  { pos: { x: 500, y: 430 }, width: 500, height: 24, type: 'rock' },
  { pos: { x: 1100, y: 460 }, width: 120, height: 24, type: 'grass' },
  { pos: { x: 1320, y: 480 }, width: 100, height: 24, type: 'grass' },
  { pos: { x: 300, y: 360 }, width: 100, height: 24, type: 'grass' },
  { pos: { x: 450, y: 340 }, width: 120, height: 24, type: 'grass' },
  { pos: { x: 700, y: 300 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 950, y: 280 }, width: 150, height: 24, type: 'grass' },
  { pos: { x: 1200, y: 260 }, width: 100, height: 24, type: 'grass' },
  { pos: { x: 1400, y: 240 }, width: 180, height: 24, type: 'rock' },
  { pos: { x: 1650, y: 220 }, width: 100, height: 24, type: 'grass' },
  // Extended platforms to reach right edge
  { pos: { x: 1800, y: 250 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 2100, y: 280 }, width: 150, height: 24, type: 'grass' },
  { pos: { x: 2400, y: 320 }, width: 180, height: 24, type: 'rock' },
  { pos: { x: 2700, y: 350 }, width: 120, height: 24, type: 'grass' },
  { pos: { x: 3000, y: 300 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 3300, y: 280 }, width: 150, height: 24, type: 'grass' },
  { pos: { x: 3500, y: 320 }, width: 180, height: 24, type: 'rock' },
  // Higher level platforms (2nd level)
  { pos: { x: 2000, y: 180 }, width: 150, height: 24, type: 'grass' },
  { pos: { x: 2500, y: 150 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 3000, y: 120 }, width: 180, height: 24, type: 'grass' },
  { pos: { x: 3400, y: 160 }, width: 150, height: 24, type: 'rock' },
  // Highest level platforms (3rd level)
  { pos: { x: 2200, y: 80 }, width: 120, height: 24, type: 'grass' },
  { pos: { x: 2800, y: 60 }, width: 180, height: 24, type: 'rock' },
  { pos: { x: 3200, y: 90 }, width: 150, height: 24, type: 'grass' },
  // Portal to field (rightmost edge)
  { pos: { x: 3760, y: 620 }, width: 80, height: 40, type: 'portal' },
];

// Map 2 platforms - Desert map
export const MAP2_PLATFORMS: Platform[] = [
  // Portal to map 3
  { pos: { x: 1750, y: 620 }, width: 80, height: 40, type: 'portal' },
  // Desert platforms
  { pos: { x: 100, y: 540 }, width: 300, height: 24, type: 'rock' },
  { pos: { x: 500, y: 520 }, width: 400, height: 24, type: 'rock' },
  { pos: { x: 1000, y: 480 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 1400, y: 420 }, width: 150, height: 24, type: 'grass' },
  { pos: { x: 300, y: 360 }, width: 120, height: 24, type: 'rock' },
  { pos: { x: 600, y: 340 }, width: 180, height: 24, type: 'rock' },
  { pos: { x: 900, y: 300 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 200, y: 240 }, width: 100, height: 24, type: 'rock' },
  { pos: { x: 800, y: 180 }, width: 250, height: 24, type: 'rock' },
  { pos: { x: 1200, y: 150 }, width: 150, height: 24, type: 'grass' },
];

// Map 3 platforms - Snow map
export const MAP3_PLATFORMS: Platform[] = [
  // Portal to map 4
  { pos: { x: 1750, y: 620 }, width: 80, height: 40, type: 'portal' },
  // Snow platforms
  { pos: { x: 150, y: 540 }, width: 350, height: 24, type: 'rock' },
  { pos: { x: 600, y: 500 }, width: 300, height: 24, type: 'rock' },
  { pos: { x: 1100, y: 460 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 200, y: 380 }, width: 180, height: 24, type: 'rock' },
  { pos: { x: 500, y: 320 }, width: 250, height: 24, type: 'rock' },
  { pos: { x: 900, y: 280 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 300, y: 200 }, width: 150, height: 24, type: 'rock' },
  { pos: { x: 700, y: 150 }, width: 300, height: 24, type: 'grass' },
  { pos: { x: 1300, y: 120 }, width: 200, height: 24, type: 'rock' },
];

// Map 4 platforms - Forest map
export const MAP4_PLATFORMS: Platform[] = [
  // Portal to map 5
  { pos: { x: 1750, y: 620 }, width: 80, height: 40, type: 'portal' },
  // Forest platforms
  { pos: { x: 200, y: 540 }, width: 400, height: 24, type: 'grass' },
  { pos: { x: 700, y: 520 }, width: 300, height: 24, type: 'grass' },
  { pos: { x: 1200, y: 480 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 300, y: 420 }, width: 150, height: 24, type: 'grass' },
  { pos: { x: 600, y: 360 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 1000, y: 300 }, width: 250, height: 24, type: 'grass' },
  { pos: { x: 200, y: 240 }, width: 120, height: 24, type: 'rock' },
  { pos: { x: 500, y: 180 }, width: 180, height: 24, type: 'grass' },
  { pos: { x: 900, y: 120 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 1400, y: 150 }, width: 150, height: 24, type: 'grass' },
];

// Map 5 platforms - Volcano map (end game area)
export const MAP5_PLATFORMS: Platform[] = [
  // Final boss area - no return portal
  { pos: { x: 400, y: 540 }, width: 600, height: 24, type: 'rock' },
  { pos: { x: 200, y: 450 }, width: 200, height: 24, type: 'rock' },
  { pos: { x: 800, y: 380 }, width: 150, height: 24, type: 'rock' },
  { pos: { x: 1200, y: 320 }, width: 200, height: 24, type: 'grass' },
  { pos: { x: 600, y: 250 }, width: 250, height: 24, type: 'rock' },
  { pos: { x: 300, y: 180 }, width: 180, height: 24, type: 'grass' },
  { pos: { x: 1000, y: 150 }, width: 200, height: 24, type: 'rock' },
];

let collectibleId = 1;
export const MAP_COLLECTIBLES: Collectible[] = [
  { id: collectibleId++, pos: { x: 680, y: 400 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 710, y: 400 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 740, y: 400 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 770, y: 400 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 850, y: 190 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 880, y: 190 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 910, y: 190 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 200, y: 510 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 230, y: 510 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  // New collectibles in extended area
  { id: collectibleId++, pos: { x: 2200, y: 400 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 2230, y: 400 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 2260, y: 400 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 2600, y: 270 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 2630, y: 270 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 3300, y: 500 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 3330, y: 500 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
  { id: collectibleId++, pos: { x: 3360, y: 500 }, width: 20, height: 20, type: 'gold', value: 1, collected: false },
];
