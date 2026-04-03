import { Skill, Inventory, Character, InventoryItem } from '@/game/types';
import { useState, useEffect } from 'react';
import { Heart, Battery, Zap, Swords, Shield } from 'lucide-react';

interface GameHUDProps {
  hp: number;
  maxHp: number;
  chakra: number;
  maxChakra: number;
  exp: number;
  maxExp: number;
  level: number;
  gold: number;
  diamonds: number;
  combo: number;
  skills: Skill[];
  inventory: Inventory;
  player: Character;
  attackPower: number;
  baseAttackPower: number;
  equipmentBonus: number;
  onSkill: (index: number) => void;
  onInventory: () => void;
  showStats?: boolean;
  toggleStats?: () => void;
}

const GameHUD = ({ hp, maxHp, chakra, maxChakra, exp, maxExp, level, gold, diamonds, skills, inventory, player, attackPower, baseAttackPower, equipmentBonus, onSkill, onInventory, showStats: showStatsProp, toggleStats }: GameHUDProps) => {
  const [showStatsModal, setShowStatsModal] = useState(showStatsProp || false);

  // Sync with parent state
  useEffect(() => {
    if (showStatsProp !== undefined && showStatsProp !== showStatsModal) {
      setShowStatsModal(showStatsProp);
    }
  }, [showStatsProp]);

  // Notify parent when local state changes
  const closeModal = () => {
    setShowStatsModal(false);
    toggleStats?.();
  };

  const openModal = () => {
    setShowStatsModal(true);
    toggleStats?.();
  };

  return (
    <>
      {/* MMORPG Style Status Bars - Top Left */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          {/* HP Bar - Red gradient */}
          <div className="relative h-5 bg-slate-900/80 rounded-sm overflow-hidden border border-slate-700">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-700 via-red-500 to-red-400 transition-all duration-300"
              style={{ width: `${(hp / maxHp) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-300" fill="currentColor" />
                <span className="text-[10px] font-bold text-white/90 drop-shadow-md">HP</span>
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md">{Math.ceil(hp)}/{maxHp}</span>
            </div>
          </div>

          {/* MP Bar - Blue gradient */}
          <div className="relative h-5 bg-slate-900/80 rounded-sm overflow-hidden border border-slate-700">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${(chakra / maxChakra) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <div className="flex items-center gap-1">
                <Battery className="w-3 h-3 text-blue-300" fill="currentColor" />
                <span className="text-[10px] font-bold text-white/90 drop-shadow-md">MP</span>
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md">{Math.ceil(chakra)}/{maxChakra}</span>
            </div>
          </div>

          {/* EXP Bar - Green/Yellow gradient */}
          <div className="relative h-4 bg-slate-900/80 rounded-sm overflow-hidden border border-slate-700">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-700 via-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(exp / maxExp) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-green-300" fill="currentColor" />
                <span className="text-[9px] font-bold text-white/90 drop-shadow-md">EXP</span>
              </div>
              <span className="text-[9px] font-bold text-white drop-shadow-md">{Math.floor((exp / maxExp) * 100)}%</span>
            </div>
          </div>

          {/* Level and Currency Row */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 bg-slate-900/60 px-2 py-1 rounded-sm border border-slate-700">
              <span className="text-yellow-400 font-bold text-xs">Lv.{level}</span>
              <button 
                onClick={() => toggleStats?.()}
                className="pointer-events-auto flex items-center gap-1 text-[9px] text-slate-300 hover:text-white transition-colors"
              >
                <Swords className="w-3 h-3" />
                <span>สเตตัส</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-yellow-400">🪙 {gold}</span>
              <span className="text-cyan-400">💎 {diamonds}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {skills.map((skill, i) => {
          const cdPercent = skill.currentCooldown / skill.cooldown;
          const isReady = skill.currentCooldown <= 0;
          return (
            <div key={skill.id} className="flex flex-col items-center gap-1">
              <button
                className={`skill-btn ${!isReady ? 'on-cooldown' : ''}`}
                onClick={() => onSkill(i)}
                title={`${skill.nameTh} (${skill.key})`}
              >
                <span className="text-lg">{skill.icon}</span>
                {!isReady && (
                  <div className="cooldown-overlay" style={{ clipPath: `inset(${(1 - cdPercent) * 100}% 0 0 0)` }} />
                )}
              </button>
              <span className="font-pixel text-[7px] text-muted-foreground">
                <span className="text-foreground">{skill.key}</span> {skill.nameTh}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-1 left-1 z-20 font-pixel text-[6px] text-muted-foreground opacity-50">
        <div>A/D เดิน · W กระโดด · S ลง</div>
        <div>Z/J โจมตี · 1234 สกิล · B กระเป๋า</div>
      </div>

      {showStatsModal && (() => {
        let equipmentDefense = 0;
        let equipmentHP = 0;
        let equipmentMP = 0;
        Object.values(inventory.equipped).forEach(item => {
          if (item) {
            equipmentDefense += item.stats?.defense || 0;
            equipmentHP += item.stats?.hp || 0;
            equipmentMP += item.stats?.mp || 0;
          }
        });
        return (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-yellow-500/50 rounded-2xl p-6 min-w-[420px] max-w-[480px] shadow-2xl shadow-yellow-500/20">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    🦸
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-yellow-400">สเตตัสตัวละคร</h3>
                    <span className="text-xs text-slate-400">เลเวล {level} | นักรบ</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleStats?.()} 
                  className="w-8 h-8 bg-slate-700 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* STR */}
                <div className="bg-slate-700/50 rounded-lg p-3 border border-red-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-bold flex items-center gap-2">
                      💪 STR
                    </span>
                    <span className="text-white font-bold text-lg">{player.str}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">พลังโจมตี +{player.str * 10}</span>
                </div>
                {/* INT */}
                <div className="bg-slate-700/50 rounded-lg p-3 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-bold flex items-center gap-2">
                      🧠 INT
                    </span>
                    <span className="text-white font-bold text-lg">{player.int}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">MP +{player.int * 10} | MATK +{player.int * 10}</span>
                </div>
                {/* AGI */}
                <div className="bg-slate-700/50 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-bold flex items-center gap-2">
                      ⚡ AGI
                    </span>
                    <span className="text-white font-bold text-lg">{player.agi}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">ความเร็วโจมตี +{player.agi * 10}</span>
                </div>
                {/* VIT */}
                <div className="bg-slate-700/50 rounded-lg p-3 border border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 font-bold flex items-center gap-2">
                      ❤️ VIT
                    </span>
                    <span className="text-white font-bold text-lg">{player.vit}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">HP +{player.vit * 20}</span>
                </div>
              </div>

              {/* Combat Stats */}
              <div className="bg-slate-700/30 rounded-lg p-3 mb-4 border border-slate-600">
                <h4 className="text-xs text-slate-400 mb-2 uppercase tracking-wider">ค่าสถานะการต่อสู้</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">⚔️ พลังโจมตี</span>
                    <span className="text-white font-bold">{attackPower} <span className="text-green-400 text-xs">(+{equipmentBonus})</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">🛡️ พลังป้องกัน</span>
                    <span className="text-white font-bold">{player.defense} <span className="text-green-400 text-xs">(+{equipmentDefense})</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">❤️ HP สูงสุด</span>
                    <span className="text-white font-bold">{player.maxHp} <span className="text-green-400 text-xs">(+{equipmentHP})</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">💧 MP สูงสุด</span>
                    <span className="text-white font-bold">{player.maxChakra} <span className="text-green-400 text-xs">(+{equipmentMP})</span></span>
                  </div>
                </div>
              </div>

              {/* Equipment Section */}
              <div>
                <h4 className="text-xs text-slate-400 mb-2 uppercase tracking-wider">อุปกรณ์ที่สวมใส่ ({Object.values(inventory.equipped).filter(Boolean).length}/10)</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(inventory.equipped).map(([slot, item]) => (
                    item ? (
                      <div key={slot} className="flex items-center gap-2 p-2 bg-slate-700/40 rounded border border-slate-600/50">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-300 truncate capitalize">{slot}</div>
                          <div className="text-xs text-yellow-400 truncate">{item.name}</div>
                        </div>
                      </div>
                    ) : (
                      <div key={slot} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50 opacity-50">
                        <span className="text-lg grayscale">⚪</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 capitalize">{slot}</div>
                          <div className="text-xs text-slate-600">ว่าง</div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Footer hint */}
              <div className="mt-4 pt-3 border-t border-slate-600 text-center">
                <span className="text-[10px] text-slate-500">กด C เพื่อปิดหน้าต่างนี้</span>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default GameHUD;
