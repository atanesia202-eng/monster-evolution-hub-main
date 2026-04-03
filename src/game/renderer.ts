import { GameState, Character, Enemy, Projectile, Particle, Position, Platform, Collectible } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { RARITY_COLORS } from './types';
import { getMonsterSpriteFrame, MonsterType } from './sprites';

let skillImages: { skill1?: HTMLImageElement; skill3?: HTMLImageElement } = {};
let characterImages: { idle?: HTMLImageElement; attack?: HTMLImageElement } = {};
let gateImage: HTMLImageElement | null = null;
let map0BackgroundImage: HTMLImageElement | null = null;
let enemyImages: { [key: string]: HTMLImageElement } = {};

export function loadSkillImages(images: { skill1?: HTMLImageElement; skill3?: HTMLImageElement }) {
  skillImages = { ...skillImages, ...images };
}

export function loadCharacterImages(images: { idle?: HTMLImageElement; attack?: HTMLImageElement }) {
  characterImages = { ...characterImages, ...images };
}

export function loadGateImage(image: HTMLImageElement) {
  gateImage = image;
}

export function loadMap0BackgroundImage(image: HTMLImageElement) {
  map0BackgroundImage = image;
}

export function loadEnemyImages(images: { [key: string]: HTMLImageElement }) {
  enemyImages = { ...enemyImages, ...images };
}

function drawNinja(ctx: CanvasRenderingContext2D, char: Character, cam: Position, isPlayer: boolean) {
  const x = char.pos.x - cam.x;
  const y = char.pos.y - cam.y;
  const flip = char.facing === 'left' ? 1 : -1;

  ctx.save();
  ctx.translate(x + char.width / 2, y + char.height / 2);
  ctx.scale(flip, 1);

  const bounce = 0;
  const attackSwing = char.state === 'attack' ? Math.sin(char.stateTimer * 0.5) * 15 : 0;
  const hurtShake = char.state === 'hurt' ? (Math.random() - 0.5) * 4 : 0;
  ctx.translate(hurtShake, bounce);

  const w = char.width;
  const h = char.height;

  if (isPlayer) {
    const img = (char.state === 'attack' || char.state === 'skill') ? characterImages.attack : characterImages.idle;
    if (img && img.complete) {
      ctx.drawImage(img, -char.width / 2, -char.height / 2, char.width, char.height);
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-w / 4, -h / 6, w / 2, h / 2.5);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-w / 4, h / 6, w / 5, h / 3);
      ctx.fillRect(w / 20, h / 6, w / 5, h / 3);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-w / 3, -h / 2, w / 1.5, h / 2.8);

      ctx.fillStyle = '#22c55e';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 6 - 3, -h / 2);
        ctx.lineTo(i * 6, -h / 2 - 8 - Math.abs(i) * 2);
        ctx.lineTo(i * 6 + 3, -h / 2);
        ctx.fill();
      }

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-w / 3, -h / 3.5, w / 1.5, 5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -h / 3.5, 8, 5);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -h / 4.5, 4, 4);
      ctx.fillRect(4, -h / 4.5, 4, 4);

      ctx.fillStyle = '#22c55e';
      const armAngle = attackSwing * Math.PI / 180;
      ctx.save();
      ctx.translate(w / 4, -h / 8);
      ctx.rotate(armAngle);
      ctx.fillRect(0, -3, 12, 6);
      if (char.state === 'attack') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(12, -2, 10, 4);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(22, -2);
        ctx.lineTo(28, 0);
        ctx.lineTo(22, 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w / 4, h / 2 - 5, w / 5 + 2, 5);
      ctx.fillRect(w / 20 - 2, h / 2 - 5, w / 5 + 2, 5);
    }
  }

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, cam: Position) {
  const x = enemy.pos.x - cam.x;
  const y = enemy.pos.y - cam.y;
  const flip = enemy.facing === 'left' ? -1 : 1;
  const alpha = enemy.state === 'dead' ? Math.max(0, 1 - enemy.stateTimer / 30) : 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + enemy.width / 2, y + enemy.height / 2);
  ctx.scale(flip, 1);

  const bounce = 0;
  const hurtShake = enemy.state === 'hurt' ? (Math.random() - 0.5) * 6 : 0;
  ctx.translate(hurtShake, bounce);

  const w = enemy.width;
  const h = enemy.height;

  // Check if this is an ORC type monster with animated sprites
  const isOrcType = enemy.type === 'orc_normal' || enemy.type === 'orc_miniboss' || enemy.type === 'orc_boss';
  
  if (isOrcType) {
    const spriteFrame = getMonsterSpriteFrame(
      enemy.type as MonsterType,
      enemy.state,
      enemy.stateTimer
    );
    
    if (spriteFrame) {
      // Adjust sprite offset to align with hitbox bottom
      const offsetY = enemy.type === 'orc_normal' ? 12 : enemy.type === 'orc_miniboss' ? 22 : 32;
      ctx.drawImage(spriteFrame, -w / 2, -h / 2 + offsetY, w, h);
    } else {
      // Fallback: colored rectangle with label
      const colors: Record<string, string> = {
        orc_normal: '#4a7c3f',
        orc_miniboss: '#8b5e3c',
        orc_boss: '#8b0000',
      };
      ctx.fillStyle = colors[enemy.type] || '#666';
      ctx.fillRect(-w / 3, -h / 3, w / 1.5, h / 1.5);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      const labels: Record<string, string> = {
        orc_normal: 'ORC',
        orc_miniboss: 'MINI',
        orc_boss: 'BOSS',
      };
      ctx.fillText(labels[enemy.type] || '?', 0, 5);
    }
  } else {
    // Original non-ORC enemy drawing
    const enemyImgKey = `${enemy.type}_${enemy.isBoss ? 'boss' : 'normal'}`;
    const enemyImage = enemyImages[enemyImgKey];
    
    if (enemyImage && enemyImage.complete) {
      ctx.drawImage(enemyImage, -w / 2, -h / 2, w, h);
    } else {
      if (enemy.type === 'boss') {
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(-w / 3, -h / 4, w / 1.5, h / 1.8);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(-w / 4, -h / 2, w / 2, h / 3);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-w / 4, -h / 3, w / 2, 4);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-6, -h / 3.5, 3, 3);
        ctx.fillRect(3, -h / 3.5, 3, 3);
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(-w / 4, h / 5, w / 5, h / 3.5);
        ctx.fillRect(w / 20, h / 5, w / 5, h / 3.5);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-w / 5, -h / 2 - 8, w / 2.5, 8);
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(-w / 5 + i * (w / 7.5), -h / 2 - 14, 4, 6);
        }
      } else {
        const colors = {
          bandit: { body: '#8b4513', head: '#deb887', accent: '#e53e3e' },
          rogue_ninja: { body: '#2d3748', head: '#718096', accent: '#805ad5' },
          shadow_clone: { body: '#1a202c', head: '#4a5568', accent: '#e53e3e' },
        };
        const c = colors[enemy.type as keyof typeof colors];
        if (c) {
          ctx.fillStyle = c.body;
          ctx.fillRect(-w / 3, -h / 4, w / 1.5, h / 1.8);
          ctx.fillStyle = c.head;
          ctx.fillRect(-w / 4, -h / 2, w / 2, h / 3);
          ctx.fillStyle = c.accent;
          ctx.fillRect(-w / 4, -h / 3, w / 2, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-6, -h / 3.5, 3, 3);
          ctx.fillRect(3, -h / 3.5, 3, 3);
          ctx.fillStyle = c.body;
          ctx.fillRect(-w / 4, h / 5, w / 5, h / 3.5);
          ctx.fillRect(w / 20, h / 5, w / 5, h / 3.5);
        }
      }
    }
  }

  ctx.restore();

  // HP bar
  if (enemy.state !== 'dead') {
    const isOrcBoss = enemy.type === 'orc_boss';
    const isOrcMini = enemy.type === 'orc_miniboss';
    const isBossLike = enemy.isBoss || isOrcBoss;
    
    const barW = isOrcBoss ? 80 : isOrcMini ? 60 : isBossLike ? 60 : 40;
    const barH = isBossLike || isOrcMini ? 6 : 4;
    const barX = x + enemy.width / 2 - barW / 2;
    // HP bar position - normal monster at y+50, others at y+72
    const barY = enemy.type === 'orc_normal' ? y + 50 : y + 72;
    
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = isOrcBoss ? '#ff0000' : isOrcMini ? '#ff8800' : isBossLike ? '#ff4444' : '#ef4444';
    ctx.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH);
    
    // Labels - above HP bar
    if (isOrcBoss) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 10px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('👑 BOSS', x + enemy.width / 2, barY - 8);
    } else if (isOrcMini) {
      ctx.fillStyle = '#ff8800';
      ctx.font = 'bold 8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('⚔ MINI BOSS', x + enemy.width / 2, barY - 6);
    } else if (isBossLike) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS', x + enemy.width / 2, barY - 6);
    }
  }
}

function drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile, cam: Position) {
  const x = proj.pos.x - cam.x;
  const y = proj.pos.y - cam.y;

  ctx.save();
  if (proj.type === 'melee_slash') {
    if (skillImages.skill1 && skillImages.skill1.complete) {
      const dir = proj.dir || 1;
      ctx.translate(x + proj.width / 2, y + proj.height / 2);
      ctx.scale(dir, 1);
      ctx.shadowColor = '#00bfff';
      ctx.shadowBlur = 25;
      ctx.drawImage(skillImages.skill1, -proj.width / 2, -proj.height / 2, proj.width, proj.height);
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowColor = '#00bfff';
      ctx.shadowBlur = 20;
      const grad = ctx.createRadialGradient(x + proj.width / 2, y + proj.height / 2, 2, x + proj.width / 2, y + proj.height / 2, proj.width / 2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#00e5ff');
      grad.addColorStop(1, '#0066ff');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + proj.width / 2, y + proj.height / 2, proj.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  } else if (proj.type === 'shuriken') {
    ctx.translate(x + proj.width / 2, y + proj.height / 2);
    ctx.rotate(proj.lifetime * 0.4);
    ctx.shadowColor = '#333';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 / 6) * i);
      const bladeGrad = ctx.createLinearGradient(0, 0, 0, -18);
      bladeGrad.addColorStop(0, '#1a1a1a');
      bladeGrad.addColorStop(0.5, '#4a4a4a');
      bladeGrad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, -18);
      ctx.lineTo(0, -14);
      ctx.lineTo(5, -18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.shadowBlur = 0;
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
    centerGrad.addColorStop(0, '#555');
    centerGrad.addColorStop(1, '#111');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, cam: Position) {
  const alpha = p.life / p.maxLife;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.fillRect(p.pos.x - cam.x, p.pos.y - cam.y, p.size, p.size);
  ctx.restore();
}

function drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform, cam: Position) {
  const x = plat.pos.x - cam.x;
  const y = plat.pos.y - cam.y;

  if (plat.type === 'portal') {
    // Draw gate image if loaded, otherwise fallback
    if (gateImage) {
      ctx.drawImage(gateImage, x, y, plat.width, plat.height);
    } else {
      // Fallback: draw purple platform
      const portalGrad = ctx.createLinearGradient(x, y, x, y + plat.height);
      portalGrad.addColorStop(0, '#4B0082');
      portalGrad.addColorStop(0.5, '#8A2BE2');
      portalGrad.addColorStop(1, '#9400D3');
      ctx.fillStyle = portalGrad;
      ctx.fillRect(x, y, plat.width, plat.height);
    }
    
    // Add subtle glow effect
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, plat.width, plat.height);
    
    // Add sparkles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 3; i++) {
      const sparkleX = x + 10 + Math.random() * (plat.width - 20);
      const sparkleY = y + 5 + Math.random() * (plat.height - 10);
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Original platform drawing
    const grad = ctx.createLinearGradient(x, y, x, y + plat.height + 12);
    grad.addColorStop(0, '#8B6914');
    grad.addColorStop(0.15, '#a0522d');
    grad.addColorStop(0.5, '#8b3a1a');
    grad.addColorStop(1, '#6b2a10');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, plat.width, plat.height + 8, 4);
    ctx.fill();

    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(x, y - 2, plat.width, 4);

    ctx.fillStyle = 'rgba(200, 180, 160, 0.3)';
    for (let i = 0; i < plat.width; i += 30) {
      ctx.beginPath();
      ctx.ellipse(x + i + 15, y + 10, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#556B2F';
    ctx.beginPath();
    ctx.moveTo(x - 2, y);
    ctx.quadraticCurveTo(x - 6, y + 15, x - 3, y + plat.height + 10);
    ctx.lineTo(x, y + plat.height + 8);
    ctx.lineTo(x, y);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + plat.width + 2, y);
    ctx.quadraticCurveTo(x + plat.width + 6, y + 15, x + plat.width + 3, y + plat.height + 10);
    ctx.lineTo(x + plat.width, y + plat.height + 8);
    ctx.lineTo(x + plat.width, y);
    ctx.fill();
  }
}

function drawCollectible(ctx: CanvasRenderingContext2D, col: Collectible, cam: Position, gameTime: number) {
  if (col.collected) return;
  const x = col.pos.x - cam.x;
  const y = col.pos.y - cam.y + Math.sin(gameTime * 0.08) * 4;

  ctx.save();
  if (col.type === 'gold') {
    const grad = ctx.createRadialGradient(x + 12, y + 12, 3, x + 12, y + 12, 12);
    grad.addColorStop(0, '#ffd700');
    grad.addColorStop(1, '#daa520');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#8B6914';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', x + 12, y + 16);
  } else if (col.type === 'diamond') {
    const grad = ctx.createRadialGradient(x + 12, y + 12, 3, x + 12, y + 12, 12);
    grad.addColorStop(0, '#00e5ff');
    grad.addColorStop(0.5, '#00bcd4');
    grad.addColorStop(1, '#0097a7');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 2);
    ctx.lineTo(x + 22, y + 12);
    ctx.lineTo(x + 12, y + 22);
    ctx.lineTo(x + 2, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#006064';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 6);
    ctx.lineTo(x + 16, y + 10);
    ctx.lineTo(x + 12, y + 14);
    ctx.lineTo(x + 8, y + 10);
    ctx.closePath();
    ctx.fill();
  } else if (col.type === 'star') {
    ctx.fillStyle = '#ffa500';
    ctx.strokeStyle = '#ff8c00';
    ctx.lineWidth = 1.5;
    const cx = x + 12;
    const cy = y + 12;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 12 : 5;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (col.type === 'item_drop' && col.droppedItem) {
    // Draw item drop - glowing box with rarity color
    const rarityColor = RARITY_COLORS[col.droppedItem.rarity] || '#b0b0b0';
    
    // Glow effect
    ctx.shadowColor = rarityColor;
    ctx.shadowBlur = 12 + Math.sin(gameTime * 0.1) * 4;
    
    // Box background
    const grad = ctx.createRadialGradient(x + 14, y + 14, 2, x + 14, y + 14, 14);
    grad.addColorStop(0, rarityColor);
    grad.addColorStop(1, rarityColor + '88');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, 28, 28, 4);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
    // Icon
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(col.droppedItem.icon, x + 14, y + 20);
  }
  ctx.restore();
}

function drawLightningEffect(ctx: CanvasRenderingContext2D, state: GameState) {
  const skill = state.skills[2];
  if (!skill || skill.currentCooldown <= skill.cooldown - 25 || skill.currentCooldown <= 0) return;

  const alpha = Math.min(1, (skill.currentCooldown - (skill.cooldown - 25)) / 15);
  const px = state.player.pos.x + state.player.width / 2 - state.camera.x;
  const py = state.player.pos.y + state.player.height / 2 - state.camera.y;

  if (skillImages.skill3 && skillImages.skill3.complete) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    const size = 260;
    ctx.drawImage(skillImages.skill3, px - size / 2, py - size / 2, size, size);
    ctx.restore();
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, cam: Position, gameTime: number, cw: number, ch: number, location: 0 | 1 | 2 | 3 | 4 | 5) {
  if (location === 0) {
    // Town background - use custom image
    if (map0BackgroundImage && map0BackgroundImage.complete) {
      // Draw background image with parallax effect and transparency - full size
      ctx.save();
      ctx.globalAlpha = 0.6; // Make image semi-transparent for black background
      ctx.drawImage(
        map0BackgroundImage,
        -cam.x * 0.1,
        -cam.y * 0.1,
        WORLD_WIDTH,
        WORLD_HEIGHT
      );
      ctx.restore();
    } else {
      // Fallback to gradient if image not loaded
      const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
      skyGrad.addColorStop(0, '#FFE4B5');
      skyGrad.addColorStop(0.6, '#FFDEAD');
      skyGrad.addColorStop(1, '#F0E68C');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, ch);
    }
  } else if (location === 2) {
    // Desert background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#FFE4B5');
    skyGrad.addColorStop(0.6, '#FFDEAD');
    skyGrad.addColorStop(1, '#F0E68C');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Draw dunes
    ctx.fillStyle = '#F4A460';
    for (let i = 0; i < 5; i++) {
      const x = (i * 300) - cam.x * 0.05;
      const y = 450 + Math.sin(i) * 50 - cam.y * 0.05;
      ctx.beginPath();
      ctx.ellipse(x, y, 150, 40, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (location === 3) {
    // Snow background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#B0C4DE');
    skyGrad.addColorStop(0.6, '#E6F3FF');
    skyGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Draw snow
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 80 + gameTime * 0.1) % cw - cam.x * 0.02;
      const y = (i * 60) % (ch * 0.5) - cam.y * 0.02;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (location === 4) {
    // Forest background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(0.6, '#98FB98');
    skyGrad.addColorStop(1, '#228B22');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Draw trees
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 20; i++) {
      const x = (i * 200 + gameTime * 0.05) % cw - cam.x * 0.03;
      const y = 400 + Math.sin(i) * 100 - cam.y * 0.03;
      ctx.fillRect(x - 10, y - 80, 20, 80);
      ctx.fillRect(x + 5, y - 60, 10, 60);
    }
  } else if (location === 5) {
    // Volcano background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#8B0000');
    skyGrad.addColorStop(0.6, '#FF4500');
    skyGrad.addColorStop(1, '#FF6347');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Draw lava
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(0, ch - 100, cw, 100);
    
    // Draw smoke
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let i = 0; i < 10; i++) {
      const x = 400 + Math.sin(i) * 100 - cam.x * 0.05;
      const y = ch - 150 + Math.cos(i) * 50 - cam.y * 0.05;
      ctx.beginPath();
      ctx.arc(x, y, 20 + Math.random() * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Original field background (map 1)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(0.6, '#B0E0E6');
    skyGrad.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 400 + gameTime * 0.15) % 1400) - cam.x * 0.05;
      const cy = 30 + (i % 3) * 40 - cam.y * 0.02;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.arc(cx + 30, cy - 8, 22, 0, Math.PI * 2);
      ctx.arc(cx + 55, cy, 26, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const groundScreenY = GROUND_Y - cam.y;
  if (groundScreenY < ch) {
    const groundGrad = ctx.createLinearGradient(0, groundScreenY, 0, groundScreenY + 80);
    groundGrad.addColorStop(0, '#8B6914');
    groundGrad.addColorStop(0.1, '#654321');
    groundGrad.addColorStop(0.5, '#4a3218');
    groundGrad.addColorStop(1, '#2d1f10');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundScreenY, cw, ch - groundScreenY + 100);
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(0, groundScreenY - 3, cw, 5);
  }
}

function drawMinimap(ctx: CanvasRenderingContext2D, state: GameState) {
  const minimapWidth = 120;
  const minimapHeight = 80;
  const minimapX = CANVAS_WIDTH - minimapWidth - 10;
  const minimapY = 60;
  
  // Draw minimap background
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);
  
  // Draw player position
  const playerX = minimapX + (state.player.pos.x / WORLD_WIDTH) * minimapWidth;
  const playerY = minimapY + (state.player.pos.y / WORLD_HEIGHT) * minimapHeight;
  
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw enemies on minimap
  ctx.fillStyle = '#ef4444';
  for (const enemy of state.enemies) {
    if (enemy.state !== 'dead') {
      const enemyX = minimapX + (enemy.pos.x / WORLD_WIDTH) * minimapWidth;
      const enemyY = minimapY + (enemy.pos.y / WORLD_HEIGHT) * minimapHeight;
      ctx.beginPath();
      ctx.arc(enemyX, enemyY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw portals on minimap
  ctx.fillStyle = '#a855f7';
  for (const platform of state.platforms) {
    if (platform.type === 'portal') {
      const portalX = minimapX + (platform.pos.x / WORLD_WIDTH) * minimapWidth;
      const portalY = minimapY + (platform.pos.y / WORLD_HEIGHT) * minimapHeight;
      ctx.fillRect(portalX - 2, portalY - 2, 4, 4);
    }
  }
  
  // Draw map name
  ctx.font = 'bold 12px "Press Start 2P"';
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.textAlign = 'center';
  const mapNames = ['เมือง', 'ทุ่งรบ', 'ทะเลทราย', 'หิมะ', 'ป่า', 'ภูเขาไฟ'];
  ctx.strokeText(mapNames[state.location], minimapX + minimapWidth / 2, minimapY - 8);
  ctx.fillText(mapNames[state.location], minimapX + minimapWidth / 2, minimapY - 8);
  
  // Draw player coordinates below minimap
  ctx.font = '8px "Press Start 2P"';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  const coordX = Math.floor(state.player.pos.x);
  const coordY = Math.floor(state.player.pos.y);
  ctx.fillText(`X:${coordX} Y:${coordY}`, minimapX + minimapWidth / 2, minimapY + minimapHeight + 12);
  
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, state: GameState, viewW?: number, viewH?: number) {
  const cw = viewW || CANVAS_WIDTH;
  const ch = viewH || CANVAS_HEIGHT;

  const scaleX = cw / CANVAS_WIDTH;
  const scaleY = ch / CANVAS_HEIGHT;
  const scale = Math.max(scaleX, scaleY);

  ctx.clearRect(0, 0, cw, ch);
  ctx.save();

  const scaledW = CANVAS_WIDTH * scale;
  const scaledH = CANVAS_HEIGHT * scale;
  const offsetX = (cw - scaledW) / 2;
  const offsetY = (ch - scaledH) / 2;
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  drawBackground(ctx, state.camera, state.gameTime, CANVAS_WIDTH, CANVAS_HEIGHT, state.location);

  for (const plat of state.platforms) {
    drawPlatform(ctx, plat, state.camera);
  }

  for (const col of state.collectibles) {
    drawCollectible(ctx, col, state.camera, state.gameTime);
  }

  for (const enemy of state.enemies) {
    drawEnemy(ctx, enemy, state.camera);
  }

  drawNinja(ctx, state.player, state.camera, true);

  // Draw player level below character
  const px = state.player.pos.x - state.camera.x + state.player.width / 2;
  const py = state.player.pos.y - state.camera.y + state.player.height + 6;
  ctx.save();
  ctx.font = 'bold 5px "Press Start 2P"';
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.textAlign = 'center';
  ctx.strokeText(`Lv.${state.player.level}`, px, py);
  ctx.fillText(`Lv.${state.player.level}`, px, py);
  ctx.restore();

  for (const proj of state.projectiles) {
    drawProjectile(ctx, proj, state.camera);
  }

  for (const p of state.particles) {
    drawParticle(ctx, p, state.camera);
  }

  drawLightningEffect(ctx, state);

  ctx.save();
  ctx.font = 'bold 14px "Press Start 2P"';
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.textAlign = 'right';
  ctx.strokeText(`🪙 ${state.coins} ⭐ ${state.stars}`, CANVAS_WIDTH - 10, 30);
  ctx.fillText(`🪙 ${state.coins} ⭐ ${state.stars}`, CANVAS_WIDTH - 10, 30);
  ctx.restore();

  // Draw minimap
  drawMinimap(ctx, state);

  if (state.combo > 1 && state.comboTimer > 0) {
    ctx.save();
    ctx.font = 'bold 24px "Press Start 2P"';
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    const text = `${state.combo} COMBO!`;
    const cy = 80 + Math.sin(state.gameTime * 0.1) * 5;
    ctx.strokeText(text, CANVAS_WIDTH / 2, cy);
    ctx.fillText(text, CANVAS_WIDTH / 2, cy);
    ctx.restore();
  }

  if (state.gameOver) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.font = '28px "Press Start 2P"';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    ctx.font = '12px "Press Start 2P"';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Score: ${state.score} Level: ${state.player.level}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('กด SPACE เพื่อเริ่มใหม่', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.restore();
  }

  ctx.restore();
}
