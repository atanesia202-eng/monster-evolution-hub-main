              import { Character, InventoryItem, RARITY_ORDER, RARITY_COLORS, RARITY_LABELS, ItemRarity } from '@/game/types';
import type { Inventory } from '@/game/types';
import { useMemo, useState, useCallback } from 'react';
import playerIdleImg from '@/assets/character/SW/sowd.png';

interface InventoryProps {
  inventory: Inventory;
  player: Character;
  onAllocateStat: (stat: 'str' | 'defPoints' | 'vit' | 'int' | 'agi') => void;
  onEquipItem: (itemId: string) => void;
  onUnequipItem: (slotType: string) => void;
  onDeleteItem: (itemId: string) => void;
  onClose: () => void;
  onShowItemDetails: (item: InventoryItem) => void;
}

const ITEMS_PER_PAGE = 72;
const TOTAL_SLOTS = 72;

function getRarityIndex(rarity: string): number {
  return RARITY_ORDER.indexOf(rarity as any);
}

const InventoryPanel = ({ inventory, player, onAllocateStat, onEquipItem, onUnequipItem, onDeleteItem, onShowItemDetails, onClose }: InventoryProps) => {
  const [showStats, setShowStats] = useState(false);
  const [activePage, setActivePage] = useState<1 | 2 | 3>(1);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [dragOverTrash, setDragOverTrash] = useState(false);
  const [goldReward, setGoldReward] = useState<{ show: boolean; x: number; y: number; amount: number }>({ show: false, x: 0, y: 0, amount: 0 });
  const [pendingStats, setPendingStats] = useState<{ [key: string]: number }>({});
  const [pendingPointsUsed, setPendingPointsUsed] = useState(0);
  const [sorted, setSorted] = useState(() => {
    // Load sorted state from localStorage on mount
    const saved = localStorage.getItem('inventory-sorted');
    return saved === 'true';
  });
  // Bulk sell state
  const [showBulkSell, setShowBulkSell] = useState(false);
  const [bulkSellRarities, setBulkSellRarities] = useState<Set<ItemRarity>>(new Set());

  const sortedItems = useMemo(() => {
    const items = [...inventory.items];
    if (sorted) {
      items.sort((a, b) => {
        const rarityDiff = getRarityIndex(b.rarity) - getRarityIndex(a.rarity);
        if (rarityDiff !== 0) return rarityDiff;
        return a.type.localeCompare(b.type);
      });
    }
    return items;
  }, [inventory.items, sorted]);

  const pagedItems = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return sortedItems.filter(i => !i.equipped).slice(start, start + ITEMS_PER_PAGE);
  }, [sortedItems, activePage]);

  // Count items by rarity for bulk sell preview
  const itemCountByRarity = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of RARITY_ORDER) {
      counts[r] = inventory.items.filter(i => !i.equipped && i.rarity === r).length;
    }
    return counts;
  }, [inventory.items]);

  const bulkSellCount = useMemo(() => {
    let count = 0;
    for (const r of bulkSellRarities) {
      count += itemCountByRarity[r] || 0;
    }
    return count;
  }, [bulkSellRarities, itemCountByRarity]);

  const handleSort = useCallback(() => {
    setSorted(true);
    localStorage.setItem('inventory-sorted', 'true');
  }, []);

  const handleBulkSell = useCallback(() => {
    if (bulkSellRarities.size === 0) return;
    const itemsToSell = inventory.items.filter(i => !i.equipped && bulkSellRarities.has(i.rarity));
    for (const item of itemsToSell) {
      onDeleteItem(item.id);
    }
    const totalGold = itemsToSell.length * 10;
    setGoldReward({ show: true, x: window.innerWidth / 2, y: window.innerHeight / 2, amount: totalGold });
    setTimeout(() => setGoldReward({ show: false, x: 0, y: 0, amount: 0 }), 1500);
    setBulkSellRarities(new Set());
    setShowBulkSell(false);
  }, [bulkSellRarities, inventory.items, onDeleteItem]);

  const toggleBulkRarity = (rarity: ItemRarity) => {
    setBulkSellRarities(prev => {
      const next = new Set(prev);
      if (next.has(rarity)) next.delete(rarity);
      else next.add(rarity);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, item: InventoryItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
    setDragOverTrash(false);
  };

  const handleDragOver = (e: React.DragEvent, slotType: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.type === slotType) {
      setDragOverSlot(slotType);
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
    setDragOverTrash(false);
  };

  const handleDrop = (e: React.DragEvent, slotType: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.type === slotType) {
      onEquipItem(draggedItem.id);
    }
    setDragOverSlot(null);
    setDragOverTrash(false);
  };

  const handleTrashDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setGoldReward({ show: true, x: rect.left + rect.width / 2, y: rect.top, amount: 10 });
      setTimeout(() => setGoldReward({ show: false, x: 0, y: 0, amount: 0 }), 1500);
      onDeleteItem(draggedItem.id);
    }
    setDraggedItem(null);
    setDragOverTrash(false);
  }, [draggedItem, onDeleteItem]);

  const handleStatIncrease = (stat: string) => {
    if (pendingPointsUsed < player.statPoints) {
      setPendingStats(prev => ({ ...prev, [stat]: (prev[stat] || 0) + 1 }));
      setPendingPointsUsed(prev => prev + 1);
    }
  };

  const handleStatDecrease = (stat: string) => {
    if (pendingStats[stat] && pendingStats[stat] > 0) {
      setPendingStats(prev => {
        const newValue = prev[stat] - 1;
        if (newValue <= 0) { const s = { ...prev }; delete s[stat]; return s; }
        return { ...prev, [stat]: newValue };
      });
      setPendingPointsUsed(prev => prev - 1);
    }
  };

  const handleConfirmStats = () => {
    Object.entries(pendingStats).forEach(([stat, amount]) => {
      for (let i = 0; i < amount; i++) onAllocateStat(stat as any);
    });
    setPendingStats({});
    setPendingPointsUsed(0);
  };

  const handleResetStats = () => { setPendingStats({}); setPendingPointsUsed(0); };

  const handleAutoEquip = () => {
    const equipmentSlots = ['helmet', 'necklace', 'weapon', 'armor', 'cloak', 'shield', 'pants', 'ring', 'bracelet', 'earring'];
    
    equipmentSlots.forEach(slotType => {
      // Find best item for this slot type from inventory (not equipped)
      const availableItems = inventory.items.filter(item => 
        !item.equipped && item.type === slotType
      );
      
      if (availableItems.length === 0) return;
      
      // Sort items by rarity and stats to find the best one
      availableItems.sort((a, b) => {
        // First compare by rarity
        const rarityDiff = getRarityIndex(b.rarity) - getRarityIndex(a.rarity);
        if (rarityDiff !== 0) return rarityDiff;
        
        // If same rarity, compare by total stats
        const aStats = a.stats || {};
        const bStats = b.stats || {};
        const aTotal = (aStats.attack || 0) + (aStats.defense || 0) + (aStats.hp || 0) + (aStats.mp || 0);
        const bTotal = (bStats.attack || 0) + (bStats.defense || 0) + (bStats.hp || 0) + (bStats.mp || 0);
        return bTotal - aTotal;
      });
      
      const bestItem = availableItems[0];
      const currentlyEquipped = inventory.equipped[slotType as keyof typeof inventory.equipped];
      
      // If nothing equipped, equip the best item
      if (!currentlyEquipped) {
        onEquipItem(bestItem.id);
        return;
      }
      
      // If something equipped, compare with best available item
      const equippedStats = currentlyEquipped.stats || {};
      const bestStats = bestItem.stats || {};
      const equippedTotal = (equippedStats.attack || 0) + (equippedStats.defense || 0) + (equippedStats.hp || 0) + (equippedStats.mp || 0);
      const bestTotal = (bestStats.attack || 0) + (bestStats.defense || 0) + (bestStats.hp || 0) + (bestStats.mp || 0);
      
      // Compare by rarity first, then by total stats
      const equippedRarityIndex = getRarityIndex(currentlyEquipped.rarity);
      const bestRarityIndex = getRarityIndex(bestItem.rarity);
      
      if (bestRarityIndex > equippedRarityIndex || 
          (bestRarityIndex === equippedRarityIndex && bestTotal > equippedTotal)) {
        // Best item is better, replace current equipment
        onEquipItem(bestItem.id);
      }
    });
  };

  const equipmentSlots = [
    { type: 'helmet', label: 'หมวก', icon: '👑', angle: -90 },
    { type: 'necklace', label: 'สร้อยคอ', icon: '📿', angle: -54 },
    { type: 'weapon', label: 'อาวุธ', icon: '⚔️', angle: -126 },
    { type: 'armor', label: 'เสื้อ', icon: '🛡️', angle: -18 },
    { type: 'cloak', label: 'ผ้าคุม', icon: '🧥', angle: -162 },
    { type: 'shield', label: 'โล่', icon: '🛡️', angle: 162 },
    { type: 'pants', label: 'กางเกง', icon: '👖', angle: 90 },
    { type: 'ring', label: 'แหวน', icon: '💍', angle: 18 },
    { type: 'bracelet', label: 'กำไล', icon: '⌚', angle: 126 },
    { type: 'earring', label: 'ต่างหู', icon: '💎', angle: 54 },
  ];

  const getRarityBorderStyle = (rarity: string) => {
    const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#555';
    return {
      borderColor: color,
      boxShadow: `0 0 8px ${color}40, inset 0 0 4px ${color}20`,
    };
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/90">
      <div className="game-panel rounded-2xl p-3 flex flex-col max-h-[95vh] w-[95vw] max-w-[900px]">
        {/* Header */}
        <div className="game-panel-header rounded-t-xl px-4 py-2 flex justify-between items-center mb-2">
          <h2 className="font-pixel text-sm gold-text">🎒 กระเป๋า</h2>
          <button onClick={onClose} className="text-game-stat-red text-lg font-bold hover:brightness-125">✕</button>
        </div>
        <div className="flex gap-3 flex-1 min-h-0">
          {/* Left: Character with circular equipment */}
          <div className="flex flex-col items-center w-[320px] shrink-0 relative">
            {/* ✅ MOD 2: Status button moved to top-right outside circle */}
            <button onClick={() => setShowStats(true)} className="absolute top-0 right-0 game-btn-info px-3 py-1.5 rounded-md font-pixel text-[9px] z-10">
              📊 สเตตัส
            </button>

            {/* Character + Circular Equipment */}
            <div className="relative w-[320px] h-[360px]">
              {/* Connecting lines from center to slots */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 360">
                {equipmentSlots.map((slot) => {
                  const radius = 135;
                  const rad = (slot.angle * Math.PI) / 180;
                  const x = 160 + Math.cos(rad) * radius;
                  const y = 180 + Math.sin(rad) * radius;
                  return (
                    <line key={slot.type} x1="160" y1="180" x2={x} y2={y} stroke="hsl(var(--game-panel-border) / 0.3)" strokeWidth="1" />
                  );
                })}
              </svg>

              {/* ✅ MOD 1: Center character - ENLARGED from w-20 h-28 to w-28 h-40 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-40">
                <img src={playerIdleImg} alt="player" className="w-full h-full object-contain" />
                {/* Level badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                  <span className="font-pixel text-[8px] gold-text bg-background/80 px-2 py-0.5 rounded-full">Lv.{player.level}</span>
                </div>
              </div>

              {/* Equipment slots in circle */}
              {equipmentSlots.map((slot) => {
                const equipped = inventory.equipped[slot.type as keyof typeof inventory.equipped];
                const radius = 135;
                const rad = (slot.angle * Math.PI) / 180;
                const x = 160 + Math.cos(rad) * radius - 22;
                const y = 180 + Math.sin(rad) * radius - 22;
                const canDrop = draggedItem && draggedItem.type === slot.type;

                return (
                  <div key={slot.type} className="absolute" style={{ left: x, top: y }}>
                    <div
                      className={`game-equip-slot ${canDrop ? 'ring-2 ring-game-gold' : ''} ${dragOverSlot === slot.type ? 'scale-110' : ''}`}
                      style={equipped ? getRarityBorderStyle(equipped.rarity) : {}}
                      onClick={() => { if (equipped) { setSelectedItem(equipped); setShowItemDetails(true); } }}
                      onDragOver={(e) => handleDragOver(e, slot.type)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, slot.type)}
                    >
                      {equipped ? (
                        <span className="text-lg">{equipped.icon}</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-xs opacity-30">{slot.icon}</span>
                          <span className="text-[5px] font-pixel text-muted-foreground">{slot.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Currency Display */}
            <div className="flex gap-3 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-sm">🪙</span>
                <div className="text-[8px] font-pixel">
                  <div className="text-muted-foreground">Gold</div>
                  <div className="gold-text">{inventory.gold}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">💎</span>
                <div className="text-[8px] font-pixel">
                  <div className="text-muted-foreground">Diamond</div>
                  <div className="text-accent">{inventory.diamonds}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Item Grid */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Page Tabs + Sort */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-1">
                {([1, 2, 3] as const).map(page => (
                  <button key={page} onClick={() => setActivePage(page)}
                    className={`px-4 py-1.5 rounded-lg font-pixel text-[9px] transition-all ${
                      activePage === page
                        ? 'game-btn-primary'
                        : 'game-panel hover:brightness-125 text-muted-foreground'
                    }`}>
                    หน้า {page}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSort}
                className="px-3 py-1.5 rounded-lg font-pixel text-[8px] transition-all game-btn-info">
                📦 จัดกระเป๋า
              </button>
            </div>

            {/* Rarity Legend */}
            <div className="flex gap-1 mb-2 flex-wrap">
              {RARITY_ORDER.map(r => (
                <span key={r} className="flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: RARITY_COLORS[r] }} />
                  <span className="text-[6px] font-pixel text-muted-foreground">{RARITY_LABELS[r]}</span>
                </span>
              ))}
            </div>

            {/* Items Header */}
            <div className="flex justify-between items-center mb-1">
              <span className="font-pixel text-[8px] text-muted-foreground">ไอเทม</span>
            </div>

            {/* Item Grid */}
            <div className="grid grid-cols-12 gap-0.5 flex-1 overflow-y-auto">
              {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
                const item = pagedItems[i];
                if (item) {
                  return (
                    <div key={item.id} className="aspect-square">
                      <div
                        className="game-item-slot rounded w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                        style={getRarityBorderStyle(item.rarity)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        onClick={() => { setSelectedItem(item); setShowItemDetails(true); }}
                        title={`${item.name} [${RARITY_LABELS[item.rarity]}]`}
                      >
                        <span className="text-sm">{item.icon}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={`empty-${i}`} className="aspect-square">
                    <div className="game-item-slot rounded w-full h-full opacity-30" />
                  </div>
                );
              })}
            </div>

            {/* ✅ MOD 3: Trash zone + Bulk Sell button */}
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={handleAutoEquip}
                className="game-btn-success px-3 py-2 rounded-lg font-pixel text-[8px] flex items-center gap-1"
              >
                ⚡ สวมใส่อัตโนมัติ
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkSell(true)}
                  className="game-btn-danger px-3 py-2 rounded-lg font-pixel text-[8px] flex items-center gap-1"
                >
                  🗑️ ขายหลายชิ้น
                </button>
                <div
                  className={`game-trash-zone ${dragOverTrash ? 'active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverTrash(true); }}
                  onDragLeave={() => setDragOverTrash(false)}
                  onDrop={handleTrashDrop}
                >
                  <span className="text-sm font-pixel">🗑️<span className="text-[7px] text-game-stat-green">+10</span></span>
                </div>
              </div>
              {goldReward.show && (
                <div className="fixed z-50 pointer-events-none" style={{ left: goldReward.x, top: goldReward.y }}>
                  <span className="gold-float text-sm font-pixel">+{goldReward.amount} 🪙</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Item Details Modal */}
        {showItemDetails && selectedItem && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/60" onClick={() => setShowItemDetails(false)} />
            <div className="relative game-panel rounded-xl p-4 min-w-[260px] z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl" style={{ filter: `drop-shadow(0 0 6px ${RARITY_COLORS[selectedItem.rarity]})` }}>{selectedItem.icon}</span>
                <div>
                  <h3 className="font-pixel text-[10px] text-foreground">{selectedItem.name}</h3>
                  <span className="font-pixel text-[8px]" style={{ color: RARITY_COLORS[selectedItem.rarity] }}>[{RARITY_LABELS[selectedItem.rarity]}]</span>
                </div>
                <button onClick={() => setShowItemDetails(false)} className="ml-auto text-game-stat-red text-xl font-bold">✕</button>
              </div>
              {selectedItem.stats && (
                <div className="space-y-1 mb-3">
                  <div className="text-[8px] font-pixel text-muted-foreground">สเตตัส</div>
                  {selectedItem.stats.attack && (
                    <div className="game-stat-row text-[9px] font-pixel">
                      <span className="text-game-stat-red">⚔️ ATK</span><span className="text-game-stat-green">+{selectedItem.stats.attack}</span>
                    </div>
                  )}
                  {selectedItem.stats.defense && (
                    <div className="game-stat-row text-[9px] font-pixel">
                      <span className="text-game-stat-yellow">🛡️ DEF</span><span className="text-game-stat-green">+{selectedItem.stats.defense}</span>
                    </div>
                  )}
                  {selectedItem.stats.hp && (
                    <div className="game-stat-row text-[9px] font-pixel">
                      <span className="text-game-stat-green">❤️ HP</span><span className="text-game-stat-green">+{selectedItem.stats.hp}</span>
                    </div>
                  )}
                  {selectedItem.stats.mp && (
                    <div className="game-stat-row text-[9px] font-pixel">
                      <span className="text-game-stat-blue">💧 MP</span><span className="text-game-stat-green">+{selectedItem.stats.mp}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                {selectedItem.equipped ? (
                  <button onClick={() => { onUnequipItem(selectedItem.type); setShowItemDetails(false); }}
                    className="flex-1 game-btn-danger px-3 py-2 rounded-lg font-pixel text-[8px]">ถอด</button>
                ) : (
                  <button onClick={() => { onEquipItem(selectedItem.id); setShowItemDetails(false); }}
                    className="flex-1 game-btn-success px-3 py-2 rounded-lg font-pixel text-[8px]">สวมใส่</button>
                )}
                <button onClick={() => setShowItemDetails(false)}
                  className="flex-1 game-btn-info px-3 py-2 rounded-lg font-pixel text-[8px]">ปิด</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Modal */}
        {showStats && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/60" onClick={() => setShowStats(false)} />
            <div className="relative game-panel rounded-xl p-4 min-w-[280px] z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-pixel text-sm gold-text">📊 สเตตัส</h3>
                <button onClick={() => setShowStats(false)} className="text-game-stat-red text-xl font-bold">✕</button>
              </div>
              <div className="text-[8px] font-pixel text-game-stat-green mb-2">คะแนน: {player.statPoints - pendingPointsUsed}</div>
              {[
                { key: 'str', label: 'STR', icon: '⚔️', color: 'text-game-stat-red' },
                { key: 'defPoints', label: 'DEF', icon: '🛡️', color: 'text-game-stat-yellow' },
                { key: 'vit', label: 'VIT', icon: '❤️', color: 'text-game-stat-green' },
                { key: 'int', label: 'INT', icon: '💧', color: 'text-game-stat-blue' },
                { key: 'agi', label: 'AGI', icon: '💨', color: 'text-game-stat-purple' },
              ].map(stat => (
                <div key={stat.key} className="game-stat-row mb-1 text-[9px] font-pixel">
                  <span className={stat.color}>
                    {stat.icon} {stat.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleStatDecrease(stat.key)} className="w-5 h-5 rounded game-btn-danger text-[8px] font-bold">-</button>
                    <span className="w-6 text-center text-foreground">
                      {(player as any)[stat.key] + (pendingStats[stat.key] || 0)}
                      {pendingStats[stat.key] ? <span className="text-game-stat-green"> +{pendingStats[stat.key]}</span> : ''}
                    </span>
                    <button onClick={() => handleStatIncrease(stat.key)} className="w-5 h-5 rounded game-btn-success text-[8px] font-bold">+</button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <button onClick={handleConfirmStats} className="flex-1 game-btn-success px-3 py-2 rounded-lg font-pixel text-[8px]" disabled={pendingPointsUsed === 0}>ยืนยัน</button>
                <button onClick={handleResetStats} className="flex-1 game-btn-danger px-3 py-2 rounded-lg font-pixel text-[8px]" disabled={pendingPointsUsed === 0}>รีเซ็ต</button>
                <button onClick={() => setShowStats(false)} className="flex-1 game-btn-info px-3 py-2 rounded-lg font-pixel text-[8px]">ปิด</button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MOD 3: Bulk Sell Modal */}
        {showBulkSell && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/60" onClick={() => setShowBulkSell(false)} />
            <div className="relative game-panel rounded-xl p-4 min-w-[300px] max-w-[360px] z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-pixel text-sm gold-text">🗑️ ขายหลายชิ้น</h3>
                <button onClick={() => setShowBulkSell(false)} className="text-game-stat-red text-xl font-bold">✕</button>
              </div>
              <p className="font-pixel text-[8px] text-muted-foreground mb-3">เลือกระดับความแรร์ที่ต้องการขาย (ไอเทมที่สวมใส่จะไม่ถูกขาย)</p>
              <div className="space-y-1.5 mb-4">
                {RARITY_ORDER.map(r => {
                  const count = itemCountByRarity[r] || 0;
                  const isSelected = bulkSellRarities.has(r);
                  return (
                    <button
                      key={r}
                      onClick={() => toggleBulkRarity(r)}
                      disabled={count === 0}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-pixel text-[9px] transition-all ${
                        isSelected
                          ? 'ring-2 ring-game-gold bg-game-item-hover'
                          : count === 0
                          ? 'opacity-30 cursor-not-allowed game-item-slot'
                          : 'game-item-slot hover:brightness-125'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: RARITY_COLORS[r] }} />
                        <span style={{ color: RARITY_COLORS[r] }}>{RARITY_LABELS[r]}</span>
                        {isSelected && <span className="text-game-stat-green">✓</span>}
                      </div>
                      <span className="text-muted-foreground">{count} ชิ้น</span>
                    </button>
                  );
                })}
              </div>
              <div className="game-stat-row mb-3 text-[9px] font-pixel">
                <span className="text-foreground">จะขายทั้งหมด</span>
                <span className="gold-text">{bulkSellCount} ชิ้น = {bulkSellCount * 10} 🪙</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkSell}
                  disabled={bulkSellCount === 0}
                  className={`flex-1 px-3 py-2 rounded-lg font-pixel text-[8px] ${
                    bulkSellCount > 0 ? 'game-btn-danger' : 'opacity-50 game-btn-danger cursor-not-allowed'
                  }`}
                >
                  🗑️ ขาย {bulkSellCount} ชิ้น
                </button>
                <button onClick={() => setShowBulkSell(false)}
                  className="flex-1 game-btn-info px-3 py-2 rounded-lg font-pixel text-[8px]">ยกเลิก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
