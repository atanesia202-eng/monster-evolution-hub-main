import { useEffect, useRef, useState, useCallback } from 'react';
import { allocateStat, createInitialState, equipItem, unequipItem, update, useSkill, getEquipmentAttackBonus, deleteItem } from '@/game/engine';
import { render, loadSkillImages, loadCharacterImages, loadGateImage, loadMap0BackgroundImage } from '@/game/renderer';
import { InventoryItem, GameState } from '@/game/types';
import { WORLD_WIDTH, WORLD_HEIGHT } from '@/game/constants';
import { initMonsterSprites } from '@/game/sprites';
import GameHUD from './GameHUD';
import InventoryPanel from './Inventory';
import skill1Img from '@/assets/skill/1.png';
import skill3Img from '@/assets/skill/3.png';
import playerIdleImg from '@/assets/character/SW/sowd.png';
import playerAttackImg from '@/assets/character/SW/AT.png';
import gateHomeImg from '@/assets/gate/home.png';
import map0BackgroundImg from '@/assets/map/MAP0.png';

const normalizeKey = (e: KeyboardEvent) => {
  switch (e.code) {
    case 'KeyA': return 'move-left';
    case 'KeyD': return 'move-right';
    case 'KeyW': return 'move-up';
    case 'KeyS': return 'move-down';
    case 'Space': return 'jump';
    case 'KeyJ': case 'KeyZ': return 'attack';
    case 'Digit1': return 'skill-1';
    case 'Digit2': return 'skill-2';
    case 'Digit3': return 'skill-3';
    case 'Digit4': return 'skill-4';
    case 'KeyB': return 'inventory';
    case 'KeyC': return 'stats';
    default: return e.key.toLowerCase();
  }
};

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const animRef = useRef<number>(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [hudData, setHudData] = useState({
    hp: 100, maxHp: 100, chakra: 100, maxChakra: 100,
    exp: 0, maxExp: 100, level: 1, gold: 0, diamonds: 0, combo: 0,
    skills: stateRef.current.skills,
    inventory: stateRef.current.inventory,
    player: stateRef.current.player,
    attackPower: stateRef.current.player.attackPower,
    baseAttackPower: stateRef.current.player.baseAttackPower,
    equipmentBonus: getEquipmentAttackBonus(stateRef.current),
  });
  const [showInventory, setShowInventory] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const toggleInventory = useCallback(() => {
    setShowInventory(prev => !prev);
    stateRef.current.showInventory = !stateRef.current.showInventory;
  }, []);

  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  const handleSkill = useCallback((index: number) => { useSkill(stateRef.current, index); }, []);
  const handleInventory = useCallback(() => { toggleInventory(); }, [toggleInventory]);
  const handleStats = useCallback(() => { toggleStats(); }, [toggleStats]);
  const restart = useCallback(() => { stateRef.current = createInitialState(); }, []);
  const handleAllocateStat = useCallback((stat: 'str' | 'defPoints' | 'vit' | 'int' | 'agi') => { allocateStat(stateRef.current, stat, 1); }, []);
  const handleShowItemDetails = useCallback((item: InventoryItem) => {}, []);
  const handleEquipItem = useCallback((itemId: string) => { 
    equipItem(stateRef.current, itemId); 
    // Force immediate HUD update
    const state = stateRef.current;
    setHudData({
      hp: state.player.hp, maxHp: state.player.maxHp,
      chakra: state.player.chakra, maxChakra: state.player.maxChakra,
      exp: state.player.exp, maxExp: state.player.maxExp,
      level: state.player.level, gold: state.gold, diamonds: state.diamonds,
      combo: state.combo, skills: state.skills.map(s => ({ ...s })),
      inventory: state.inventory, player: state.player,
      attackPower: state.player.attackPower,
      baseAttackPower: state.player.baseAttackPower,
      equipmentBonus: getEquipmentAttackBonus(state),
    });
  }, []);
  const handleUnequipItem = useCallback((slotType: string) => { 
    unequipItem(stateRef.current, slotType); 
    // Force immediate HUD update
    const state = stateRef.current;
    setHudData({
      hp: state.player.hp, maxHp: state.player.maxHp,
      chakra: state.player.chakra, maxChakra: state.player.maxChakra,
      exp: state.player.exp, maxExp: state.player.maxExp,
      level: state.player.level, gold: state.gold, diamonds: state.diamonds,
      combo: state.combo, skills: state.skills.map(s => ({ ...s })),
      inventory: state.inventory, player: state.player,
      attackPower: state.player.attackPower,
      baseAttackPower: state.player.baseAttackPower,
      equipmentBonus: getEquipmentAttackBonus(state),
    });
  }, []);
  const handleDeleteItem = useCallback((itemId: string) => { 
    deleteItem(stateRef.current, itemId); 
    // Force immediate HUD update to show changes right away
    const state = stateRef.current;
    setHudData({
      hp: state.player.hp, maxHp: state.player.maxHp,
      chakra: state.player.chakra, maxChakra: state.player.maxChakra,
      exp: state.player.exp, maxExp: state.player.maxExp,
      level: state.player.level, gold: state.gold, diamonds: state.diamonds,
      combo: state.combo, skills: state.skills.map(s => ({ ...s })),
      inventory: state.inventory, player: state.player,
      attackPower: state.player.attackPower,
      baseAttackPower: state.player.baseAttackPower,
      equipmentBonus: getEquipmentAttackBonus(state),
    });
  }, []);

  useEffect(() => {
    // Initialize monster sprite animations (all 3 ORC types)
    initMonsterSprites();
    
    const img1 = new Image(); img1.src = skill1Img;
    const img3 = new Image(); img3.src = skill3Img;
    const charIdle = new Image(); charIdle.src = playerIdleImg;
    const charAttack = new Image(); charAttack.src = playerAttackImg;
    const gateImg = new Image(); gateImg.src = gateHomeImg;
    const map0BgImg = new Image(); map0BgImg.src = map0BackgroundImg;
    
    img1.onload = () => loadSkillImages({ skill1: img1, skill3: img3 });
    img3.onload = () => loadSkillImages({ skill1: img1, skill3: img3 });
    charIdle.onload = () => loadCharacterImages({ idle: charIdle, attack: charAttack });
    charAttack.onload = () => loadCharacterImages({ idle: charIdle, attack: charAttack });
    gateImg.onload = () => loadGateImage(gateImg);
    map0BgImg.onload = () => loadMap0BackgroundImage(map0BgImg);
    
    const handleResize = () => { setCanvasSize({ width: window.innerWidth, height: window.innerHeight }); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current;
      const key = normalizeKey(e);
      state.keys.add(key);
      if (key === 'skill-1') handleSkill(0);
      if (key === 'skill-2') handleSkill(1);
      if (key === 'skill-3') handleSkill(2);
      if (key === 'skill-4') handleSkill(3);
      if (key === 'inventory') handleInventory();
      if (key === 'stats') handleStats();
      if (key === 'jump' && state.gameOver) restart();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => { stateRef.current.keys.delete(normalizeKey(e)); };
    const onBlur = () => { stateRef.current.keys.clear(); };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    let frameCount = 0;
    const gameLoop = () => {
      const state = stateRef.current;
      update(state);
      render(ctx, state, canvasSize.width, canvasSize.height);
      frameCount++;
      if (frameCount % 3 === 0) {
        setHudData({
          hp: state.player.hp, maxHp: state.player.maxHp,
          chakra: state.player.chakra, maxChakra: state.player.maxChakra,
          exp: state.player.exp, maxExp: state.player.maxExp,
          level: state.player.level, gold: state.gold, diamonds: state.diamonds,
          combo: state.combo, skills: state.skills.map(s => ({ ...s })),
          inventory: state.inventory, player: state.player,
          attackPower: state.player.attackPower,
          baseAttackPower: state.player.baseAttackPower,
          equipmentBonus: getEquipmentAttackBonus(state),
        });
      }
      animRef.current = requestAnimationFrame(gameLoop);
    };
    animRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [handleSkill, handleInventory, handleStats, restart, canvasSize]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="absolute inset-0" />
      <GameHUD {...hudData} onSkill={handleSkill} onInventory={handleInventory} showStats={showStats} toggleStats={toggleStats} />
      <button onClick={toggleInventory} className="absolute bottom-4 left-4 game-btn-primary px-4 py-2 rounded-lg font-pixel text-[10px] z-30">🎒กระเป๋า (B)</button>
      <button onClick={toggleStats} className="absolute bottom-4 right-4 game-btn-primary px-4 py-2 rounded-lg font-pixel text-[10px] z-30">📊สเตตัส (C)</button>
      {showInventory && (
        <InventoryPanel inventory={hudData.inventory} player={hudData.player} onAllocateStat={handleAllocateStat} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} onDeleteItem={handleDeleteItem} onShowItemDetails={handleShowItemDetails} onClose={toggleInventory} />
      )}
    </div>
  );
};

export default GameCanvas;
