// js/game.js

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.paused = false;

    this.currentLevel = 1;
    this.maxLevels = 5;
    this.levelComplete = false;

    this.state = {
      flags: {},
      exhaustedNpcs: {},
      coins: 0
    };

    // Mario attributes
    this.player = {
      x: 40,
      y: 380,
      startX: 40,
      startY: 380,
      width: 24,
      height: 32,
      vx: 0,
      vy: 0,
      speed: 3.5,
      sprintSpeed: 5.5,
      jumpStrength: -11.5,
      isGrounded: false,
      facing: 'right',
      invulnerableTimer: 0,
      hp: 3,
      maxHp: 3
    };

    this.gravity = 0.55;
    this.terminalVelocity = 12;

    this.animFrame = 0;
    this.fireballs = [];
    this.drops = [];
    this.nearbyInteractable = null;

    this.loadLevel(this.currentLevel);
  }

  loadLevel(lvl) {
    this.currentLevel = lvl;
    this.levelComplete = false;
    this.fireballs = [];
    this.drops = [];

    this.player.x = 40;
    this.player.y = 350;
    this.player.startX = 40;
    this.player.startY = 350;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.jumpStrength = -11.5; // Reset base jump
    this.player.isGrounded = false;

    if (lvl === 1) {
      // 1. Mushroom Valley (Day Sky & Green Hills)
      this.theme = 'meadow';
      this.skyColor = '#5c94fc';

      this.platforms = [
        { x: 0, y: 432, width: 640, height: 48, type: 'ground' },
        { x: 150, y: 320, width: 96, height: 20, type: 'brick' },
        { x: 280, y: 260, width: 110, height: 20, type: 'brick' },
        { x: 440, y: 330, width: 80, height: 20, type: 'brick' }
      ];

      this.interactables = [
        { id: "toad_guard", name: "Captain Toad", type: "toad", x: 80, y: 400, width: 22, height: 32 },
        { id: "grimm_merchant", name: "Grimm (Merchant)", type: "merchant", x: 310, y: 224, width: 26, height: 36 }
      ];

      this.enemies = [
        { x: 200, y: 408, width: 26, height: 24, vx: 1.2, minX: 180, maxX: 400, alive: true, squishTimer: 0 },
        { x: 480, y: 408, width: 26, height: 24, vx: -1.4, minX: 380, maxX: 580, alive: true, squishTimer: 0 }
      ];

      this.exitFlag = { x: 600, y: 272, width: 16, height: 160 };
    } 
    else if (lvl === 2) {
      // 2. Subterranean Cobalt Cavern (Darkness & Blue Minerals)
      this.theme = 'cavern';
      this.skyColor = '#060812';

      this.platforms = [
        { x: 0, y: 432, width: 640, height: 48, type: 'blue-ground' },
        { x: 130, y: 340, width: 90, height: 20, type: 'blue-brick' },
        { x: 270, y: 260, width: 100, height: 20, type: 'blue-brick' },
        { x: 420, y: 190, width: 110, height: 20, type: 'blue-brick' }
      ];

      this.interactables = [
        { id: "mole_miner", name: "Spike the Miner", type: "miner", x: 150, y: 396, width: 26, height: 36 }
      ];

      this.enemies = [
        { x: 230, y: 408, width: 26, height: 24, vx: 2.0, minX: 180, maxX: 420, alive: true, squishTimer: 0 },
        { x: 300, y: 236, width: 26, height: 24, vx: 1.5, minX: 270, maxX: 360, alive: true, squishTimer: 0 },
        { x: 500, y: 408, width: 26, height: 24, vx: -2.2, minX: 380, maxX: 590, alive: true, squishTimer: 0 }
      ];

      this.exitFlag = { x: 600, y: 272, width: 16, height: 160 };
    }
    else if (lvl === 3) {
      // 3. Sunset Desert Dunes (Golden Horizon & Pyramids)
      this.theme = 'desert';
      this.skyColor = '#e67e22';

      this.platforms = [
        { x: 0, y: 432, width: 640, height: 48, type: 'sand-ground' },
        { x: 120, y: 320, width: 80, height: 20, type: 'sand-brick' },
        { x: 240, y: 250, width: 130, height: 20, type: 'sand-brick' },
        { x: 410, y: 330, width: 100, height: 20, type: 'sand-brick' }
      ];

      this.interactables = [
        { id: "desert_nomad", name: "Desert Nomad", type: "nomad", x: 140, y: 284, width: 24, height: 36 }
      ];

      this.enemies = [
        { x: 260, y: 226, width: 26, height: 24, vx: 2.2, minX: 240, maxX: 360, alive: true, squishTimer: 0 },
        { x: 220, y: 408, width: 26, height: 24, vx: 2.5, minX: 160, maxX: 380, alive: true, squishTimer: 0 },
        { x: 460, y: 408, width: 26, height: 24, vx: -2.5, minX: 390, maxX: 580, alive: true, squishTimer: 0 }
      ];

      this.exitFlag = { x: 600, y: 272, width: 16, height: 160 };
    }
    else if (lvl === 4) {
      // 4. Treetop Cloud Haven (Bouncy Cloud Platforms)
      this.theme = 'clouds';
      this.skyColor = '#81ecec';

      this.platforms = [
        { x: 0, y: 432, width: 200, height: 48, type: 'cloud-ground' },
        { x: 260, y: 432, width: 380, height: 48, type: 'cloud-ground' },
        { x: 110, y: 330, width: 100, height: 24, type: 'cloud-bank' },
        { x: 250, y: 240, width: 120, height: 24, type: 'cloud-bank' },
        { x: 420, y: 160, width: 110, height: 24, type: 'cloud-bank' }
      ];

      this.interactables = [
        { id: "cloud_cherub", name: "Nimbus Sprite", type: "sprite", x: 450, y: 120, width: 24, height: 32 }
      ];

      this.enemies = [
        { x: 120, y: 306, width: 26, height: 24, vx: 1.8, minX: 110, maxX: 200, alive: true, squishTimer: 0 },
        { x: 270, y: 216, width: 26, height: 24, vx: -2.0, minX: 250, maxX: 360, alive: true, squishTimer: 0 },
        { x: 340, y: 408, width: 26, height: 24, vx: 2.8, minX: 270, maxX: 560, alive: true, squishTimer: 0 }
      ];

      this.exitFlag = { x: 600, y: 272, width: 16, height: 160 };
    }
    else if (lvl === 5) {
      // 5. Molten Fortress (Boiling Lava & Castle Ramparts)
      this.theme = 'volcano';
      this.skyColor = '#1e0505';

      this.platforms = [
        { x: 0, y: 432, width: 170, height: 48, type: 'stone' },
        { x: 230, y: 432, width: 160, height: 48, type: 'stone' },
        { x: 450, y: 432, width: 190, height: 48, type: 'stone' },
        { x: 140, y: 310, width: 100, height: 20, type: 'stone' },
        { x: 300, y: 220, width: 120, height: 20, type: 'stone' }
      ];

      this.interactables = [
        { id: "peach_echo", name: "Princess Peach", type: "peach", x: 60, y: 388, width: 26, height: 44 }
      ];

      this.enemies = [
        { x: 260, y: 408, width: 26, height: 24, vx: 3.0, minX: 235, maxX: 380, alive: true, squishTimer: 0 },
        { x: 480, y: 408, width: 26, height: 24, vx: -3.2, minX: 460, maxX: 580, alive: true, squishTimer: 0 },
        { x: 160, y: 286, width: 26, height: 24, vx: 2.2, minX: 140, maxX: 230, alive: true, squishTimer: 0 },
        { x: 330, y: 196, width: 26, height: 24, vx: -2.5, minX: 300, maxX: 410, alive: true, squishTimer: 0 }
      ];

      this.exitFlag = { x: 600, y: 272, width: 16, height: 160 };
    }
  }

  castFireball() {
    if (this.paused) return;

    const velocityX = this.player.facing === 'left' ? -8 : 8;
    this.fireballs.push({
      x: this.player.facing === 'left' ? this.player.x - 6 : this.player.x + this.player.width + 2,
      y: this.player.y + 12,
      vx: velocityX,
      vy: 1.5,
      radius: 6,
      life: 80
    });
  }

  takeDamage() {
    this.player.hp--;
    this.updateHud();

    if (this.player.hp <= 0) {
      this.player.x = this.player.startX;
      this.player.y = this.player.startY;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.hp = this.player.maxHp;
      this.player.invulnerableTimer = 90;
      this.updateHud();
    } else {
      this.player.invulnerableTimer = 50;
    }
  }

  updateHud() {
    const el = document.getElementById('health-display');
    if (el) {
      el.textContent = '❤'.repeat(Math.max(0, this.player.hp)) + '🖤'.repeat(this.player.maxHp - this.player.hp);
    }
  }

  update(keys) {
    if (this.paused) return;

    const p = this.player;

    const currentSpeed = (keys['ShiftLeft'] || keys['ShiftRight']) ? p.sprintSpeed : p.speed;
    p.vx = 0;

    if (keys['ArrowLeft'] || keys['KeyA']) {
      p.vx = -currentSpeed;
      p.facing = 'left';
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
      p.vx = currentSpeed;
      p.facing = 'right';
    }

    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && p.isGrounded) {
      p.vy = p.jumpStrength;
      p.isGrounded = false;
    }

    p.vy += this.gravity;
    if (p.vy > this.terminalVelocity) p.vy = this.terminalVelocity;

    const isMoving = p.vx !== 0;
    if (isMoving && p.isGrounded) {
      this.animFrame = (this.animFrame + 0.25) % 4;
    } else if (!p.isGrounded) {
      this.animFrame = 2;
    } else {
      this.animFrame = 0;
    }

    p.x += p.vx;
    if (p.x < 0) p.x = 0;
    if (p.x + p.width > this.canvas.width) p.x = this.canvas.width - p.width;

    for (const plat of this.platforms) {
      if (this.checkOverlap(p, plat)) {
        if (p.vx > 0) p.x = plat.x - p.width;
        else if (p.vx < 0) p.x = plat.x + plat.width;
      }
    }

    p.y += p.vy;
    p.isGrounded = false;

    for (const plat of this.platforms) {
      if (this.checkOverlap(p, plat)) {
        if (p.vy > 0) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
        } else if (p.vy < 0) {
          p.y = plat.y + plat.height;
          p.vy = 0;
        }
      }
    }

    // Pitfall / Lava fall damage
    if (p.y > this.canvas.height + 40) {
      this.takeDamage();
    }

    if (p.invulnerableTimer > 0) p.invulnerableTimer--;

    // Fireball projectiles
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.x += fb.vx;
      fb.vy += 0.35;
      fb.y += fb.vy;
      fb.life--;

      for (const plat of this.platforms) {
        if (this.checkOverlap({ x: fb.x - fb.radius, y: fb.y - fb.radius, width: fb.radius * 2, height: fb.radius * 2 }, plat)) {
          fb.y = plat.y - fb.radius;
          fb.vy = -3.5;
        }
      }

      let hit = false;
      for (const enemy of this.enemies) {
        if (enemy.alive && this.checkOverlap({ x: fb.x - fb.radius, y: fb.y - fb.radius, width: fb.radius * 2, height: fb.radius * 2 }, enemy)) {
          enemy.alive = false;
          enemy.squishTimer = 30;
          hit = true;
          this.drops.push({ x: enemy.x + 8, y: enemy.y + 4, width: 12, height: 12, animOffset: Math.random() * 10 });
          break;
        }
      }

      if (hit || fb.life <= 0 || fb.x < 0 || fb.x > this.canvas.width) {
        this.fireballs.splice(i, 1);
      }
    }

    // Collect Coins
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const coin = this.drops[i];
      if (this.checkOverlap(p, coin)) {
        this.state.coins++;
        this.drops.splice(i, 1);
      }
    }

    // Enemy Patrol & Jump Stomp
    let activeEnemies = 0;
    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        if (enemy.squishTimer > 0) enemy.squishTimer--;
        continue;
      }

      activeEnemies++;
      enemy.x += enemy.vx;
      if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
        enemy.vx *= -1;
      }

      if (this.checkOverlap(p, enemy)) {
        if (p.vy > 0 && p.y + p.height - p.vy <= enemy.y + 8) {
          enemy.alive = false;
          enemy.squishTimer = 30;
          p.vy = -7.5;
          this.drops.push({ x: enemy.x + 8, y: enemy.y + 4, width: 12, height: 12, animOffset: Math.random() * 10 });
        } else if (p.invulnerableTimer === 0) {
          p.x += enemy.vx > 0 ? 30 : -30;
          p.vy = -4;
          this.takeDamage();
        }
      }
    }

    this.levelComplete = (activeEnemies === 0);

    // Goal Flag Advance
    if (this.levelComplete && this.exitFlag && this.checkOverlap(p, this.exitFlag)) {
      if (this.currentLevel < this.maxLevels) {
        this.loadLevel(this.currentLevel + 1);
      } else {
        alert("🏆 CONGRATULATIONS! You cleared all 5 Worlds and saved the kingdom!");
        this.loadLevel(1);
      }
    }

    // Proximity check for dialogue
    this.nearbyInteractable = null;
    for (const item of this.interactables) {
      if (this.checkProximity(p, item, 45)) {
        this.nearbyInteractable = item;
        break;
      }
    }
  }

  checkOverlap(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  checkProximity(r1, r2, padding) {
    return (
      r1.x < r2.x + r2.width + padding &&
      r1.x + r1.width + padding > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  // --- RENDERING ROUTINES ---

  render() {
    this.drawBackground();

    for (const plat of this.platforms) {
      this.drawPlatform(plat);
    }

    if (this.exitFlag) {
      this.drawGoalFlag(this.exitFlag, this.levelComplete);
    }

    for (const item of this.interactables) {
      this.drawCharacter(item);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.name, item.x + item.width / 2, item.y - 8);
    }

    this.drawDrops();
    for (const enemy of this.enemies) this.drawGoomba(enemy);
    this.drawFireballs();

    if (this.player.invulnerableTimer % 6 < 3) {
      this.drawMario(this.player.x, this.player.y, this.player.width, this.player.height, this.player.facing);
    }

    // HUD
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 13px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`WORLD ${this.currentLevel}-${this.maxLevels}`, 620, 24);

    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillText(`★ x ${this.state.coins}`, 620, 42);

    if (this.levelComplete) {
      this.ctx.fillStyle = '#00ff7f';
      this.ctx.font = 'bold 12px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("COURSE SECURED! GRAB THE FLAG!", 320, 25);
    }
  }

  drawBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = this.skyColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.theme === 'meadow') {
      // Fluffy clouds & green rolling hills
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.drawCloud(80, 80);
      this.drawCloud(340, 50);
      this.drawCloud(520, 90);

      ctx.fillStyle = '#00a800';
      ctx.beginPath();
      ctx.arc(120, 432, 90, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(460, 432, 110, Math.PI, 0);
      ctx.fill();
    } 
    else if (this.theme === 'cavern') {
      // Stalactites & dark blue underground ambient shading
      ctx.fillStyle = '#11182c';
      for (let x = 30; x < 640; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 20, 60);
        ctx.lineTo(x + 40, 0);
        ctx.fill();
      }
    } 
    else if (this.theme === 'desert') {
      // Scorching sun & layered terracotta pyramids
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(520, 80, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.moveTo(80, 432);
      ctx.lineTo(240, 220);
      ctx.lineTo(400, 432);
      ctx.fill();

      ctx.fillStyle = '#ba4a00';
      ctx.beginPath();
      ctx.moveTo(340, 432);
      ctx.lineTo(480, 260);
      ctx.lineTo(620, 432);
      ctx.fill();
    } 
    else if (this.theme === 'clouds') {
      // Sky gradients & dense cumulus layers
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.drawCloud(60, 160);
      this.drawCloud(220, 120);
      this.drawCloud(460, 150);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let x = 0; x < 640; x += 70) {
        ctx.beginPath();
        ctx.arc(x + 35, 432, 45, Math.PI, 0);
        ctx.fill();
      }
    } 
    else if (this.theme === 'volcano') {
      // Castle wall ramparts & boiling lava canal
      ctx.fillStyle = '#3a0808';
      for (let x = 40; x < 640; x += 110) {
        ctx.fillRect(x, 80, 50, 352);
      }
      // Animated lava pits
      const lavaBob = Math.sin(Date.now() / 200) * 4;
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(170, 438 + lavaBob, 60, 42);
      ctx.fillRect(390, 438 - lavaBob, 60, 42);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(175, 442 + lavaBob, 50, 6);
      ctx.fillRect(395, 442 - lavaBob, 50, 6);
    }
  }

  drawCloud(x, y) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.arc(x + 14, y - 8, 18, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 16, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 6, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlatform(p) {
    const ctx = this.ctx;
    if (p.type === 'ground') {
      ctx.fillStyle = '#c84c0c';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.fillStyle = '#fcb488';
      ctx.fillRect(p.x, p.y, p.width, 4);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      for (let x = p.x; x < p.x + p.width; x += 32) ctx.strokeRect(x, p.y, 32, 32);
    } 
    else if (p.type === 'brick') {
      for (let x = p.x; x < p.x + p.width; x += 32) {
        ctx.fillStyle = '#b84418';
        ctx.fillRect(x + 1, p.y + 1, 30, 18);
        ctx.fillStyle = '#fc9838';
        ctx.fillRect(x + 1, p.y + 1, 30, 3);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, p.y, 32, 20);
      }
    } 
    else if (p.type.includes('blue')) {
      ctx.fillStyle = '#005599';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.fillStyle = '#55c0ff';
      ctx.fillRect(p.x, p.y, p.width, 3);
    } 
    else if (p.type.includes('sand')) {
      ctx.fillStyle = '#d4ac0d';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.fillStyle = '#f9e79f';
      ctx.fillRect(p.x, p.y, p.width, 3);
    } 
    else if (p.type.includes('cloud')) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(p.x, p.y, p.width, 4);
    } 
    else {
      ctx.fillStyle = '#444444';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.fillStyle = '#888888';
      ctx.fillRect(p.x, p.y, p.width, 3);
    }
  }

  drawGoalFlag(flag, unlocked) {
    const ctx = this.ctx;
    ctx.fillStyle = '#838383';
    ctx.fillRect(flag.x + 6, flag.y, 4, flag.height);
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(flag.x + 8, flag.y, 6, 0, Math.PI * 2);
    ctx.fill();

    if (unlocked) {
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(flag.x + 10, flag.y + 10);
      ctx.lineTo(flag.x + 36, flag.y + 24);
      ctx.lineTo(flag.x + 10, flag.y + 38);
      ctx.fill();
    }
  }

  drawCharacter(npc) {
    const ctx = this.ctx;
    const x = npc.x;
    const y = npc.y;

    if (npc.type === 'toad') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + 11, y + 10, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e82b2b';
      ctx.fillRect(x + 8, y + 2, 6, 6);
      ctx.fillRect(x + 2, y + 8, 4, 4);
      ctx.fillRect(x + 16, y + 8, 4, 4);
      ctx.fillStyle = '#fedbb4';
      ctx.fillRect(x + 6, y + 15, 10, 7);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 8, y + 17, 2, 3);
      ctx.fillRect(x + 12, y + 17, 2, 3);
      ctx.fillStyle = '#1b6ca8';
      ctx.fillRect(x + 4, y + 22, 14, 6);
    } 
    else if (npc.type === 'merchant') {
      ctx.fillStyle = '#4a235a';
      ctx.fillRect(x + 3, y, 20, 10);
      ctx.fillRect(x + 1, y + 10, 24, 20);
      ctx.fillStyle = '#1c1124';
      ctx.fillRect(x + 6, y + 5, 14, 7);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x + 8, y + 7, 2, 2);
      ctx.fillRect(x + 16, y + 7, 2, 2);
      ctx.fillStyle = '#d5dbdb';
      ctx.fillRect(x + 8, y + 12, 10, 7);
    } 
    else if (npc.type === 'miner') {
      ctx.fillStyle = '#57606f';
      ctx.fillRect(x + 3, y + 8, 20, 18);
      ctx.fillStyle = '#fedbb4';
      ctx.fillRect(x + 6, y + 12, 14, 8);
      ctx.fillStyle = '#ffa502';
      ctx.fillRect(x + 4, y + 2, 18, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 11, y + 3, 4, 4);
    } 
    else if (npc.type === 'nomad') {
      ctx.fillStyle = '#d35400';
      ctx.fillRect(x + 4, y, 16, 12); // Turban
      ctx.fillStyle = '#fedbb4';
      ctx.fillRect(x + 6, y + 8, 12, 6);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(x + 3, y + 14, 18, 20); // Robe
    } 
    else if (npc.type === 'sprite') {
      // Floating Cloud Sprite
      const floatY = Math.sin(Date.now() / 200) * 4;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + 12, y + 12 + floatY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(x + 8, y + 10 + floatY, 2, 3);
      ctx.fillRect(x + 14, y + 10 + floatY, 2, 3);
    } 
    else if (npc.type === 'peach') {
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x + 4, y, 18, 14);
      ctx.fillStyle = '#fedbb4';
      ctx.fillRect(x + 7, y + 8, 12, 8);
      ctx.fillStyle = '#ff9ff3';
      ctx.fillRect(x + 3, y + 16, 20, 24);
      ctx.fillStyle = '#f368e0';
      ctx.fillRect(x + 1, y + 36, 24, 6);
    }
  }

  drawMario(x, y, w, h, facing) {
    const ctx = this.ctx;
    ctx.save();

    if (facing === 'left') {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      x = 0;
      y = 0;
    }

    const stride = !this.player.isGrounded ? 4 : (this.player.vx !== 0 ? Math.sin(this.animFrame * Math.PI) * 4 : 0);

    // Hat
    ctx.fillStyle = '#e82b2b';
    ctx.fillRect(x + 4, y, 16, 7);
    ctx.fillRect(x + 10, y + 4, 12, 4);

    // Face
    ctx.fillStyle = '#fedbb4';
    ctx.fillRect(x + 6, y + 7, 12, 8);

    // Eye & Sideburn
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 14, y + 8, 2, 4);
    ctx.fillRect(x + 4, y + 7, 3, 5);

    // Moustache
    ctx.fillStyle = '#42240c';
    ctx.fillRect(x + 12, y + 11, 8, 4);

    // Shirt
    ctx.fillStyle = '#e82b2b';
    ctx.fillRect(x + 2, y + 15, 20, 6);

    // Overalls
    ctx.fillStyle = '#1b6ca8';
    ctx.fillRect(x + 6, y + 15, 12, 11);

    // Buttons
    ctx.fillStyle = '#fbc531';
    ctx.fillRect(x + 7, y + 17, 2, 2);
    ctx.fillRect(x + 15, y + 17, 2, 2);

    // Shoes & Legs
    ctx.fillStyle = '#1b6ca8';
    ctx.fillRect(x + 6 - stride / 2, y + 23, 5, 5);
    ctx.fillStyle = '#51361a';
    ctx.fillRect(x + 4 - stride, y + 28, 7, 4);

    ctx.fillStyle = '#1b6ca8';
    ctx.fillRect(x + 13 + stride / 2, y + 23, 5, 5);
    ctx.fillStyle = '#51361a';
    ctx.fillRect(x + 13 + stride, y + 28, 7, 4);

    ctx.restore();
  }

  drawGoomba(enemy) {
    if (!enemy.alive && enemy.squishTimer <= 0) return;

    const ctx = this.ctx;
    const x = enemy.x;
    const y = enemy.y;

    if (!enemy.alive) {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x + 2, y + 16, 22, 8);
      ctx.fillStyle = '#f5cba7';
      ctx.fillRect(x + 6, y + 14, 14, 3);
      return;
    }

    ctx.fillStyle = '#b3541e';
    ctx.fillRect(x + 4, y, 18, 6);
    ctx.fillRect(x + 2, y + 6, 22, 10);

    ctx.fillStyle = '#f5cba7';
    ctx.fillRect(x + 5, y + 14, 16, 6);

    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6, y + 14, 4, 2);
    ctx.fillRect(x + 16, y + 14, 4, 2);
    ctx.fillRect(x + 7, y + 16, 2, 3);
    ctx.fillRect(x + 17, y + 16, 2, 3);

    const footOffset = Math.sin(Date.now() / 150) * 3;
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(x + 2, y + 20 + (footOffset > 0 ? 1 : 0), 7, 4);
    ctx.fillRect(x + 17, y + 20 + (footOffset < 0 ? 1 : 0), 7, 4);
  }

  drawDrops() {
    const ctx = this.ctx;
    const time = Date.now() / 200;
    for (const coin of this.drops) {
      const bob = Math.sin(time + coin.animOffset) * 3;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.ellipse(coin.x + 6, coin.y + 6 + bob, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff48f';
      ctx.fillRect(coin.x + 5, coin.y + 3 + bob, 2, 6);
    }
  }

  drawFireballs() {
    const ctx = this.ctx;
    for (const fb of this.fireballs) {
      const grad = ctx.createRadialGradient(fb.x, fb.y, 2, fb.x, fb.y, 10);
      grad.addColorStop(0, '#fff275');
      grad.addColorStop(0.4, '#ff5722');
      grad.addColorStop(1, 'rgba(255, 87, 34, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fb.x, fb.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fb.x, fb.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}