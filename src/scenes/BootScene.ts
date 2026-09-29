import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    // Generate all procedural game assets in preload
    this.createPlayerTextures();
    this.createEnemyTextures();
    this.createHazardTextures();
    this.createCollectibleTextures();
    this.createEnvironmentTextures();
    this.createParticleTextures();
    this.createFlagTexture();
  }

  public create(): void {
    // Register animations
    this.createPlayerAnimations();
    this.createEnemyAnimations();
    this.createCollectibleAnimations();

    // Proceed to PreloadScene / MainMenuScene
    this.scene.start('PreloadScene');
  }

  // --- PLAYER TEXTURES & ANIMATIONS ---
  private createPlayerTextures(): void {
    const frameW = 32;
    const frameH = 32;
    const totalFrames = 10;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * totalFrames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * frameW;
      ctx.save();
      ctx.translate(ox, 0);

      // Base body colors: vibrant teal/cyan hero
      const bodyColor = '#1BC4B0';
      const bodyShadow = '#0F8B7D';
      const capColor = '#3B5998';
      const featherColor = '#FFD166';
      const bootColor = '#EF476F';

      let bodyY = 8;
      let bodyScaleY = 1;
      let legOffsetL = 0;
      let legOffsetR = 0;
      let eyeType = 'normal'; // 'normal', 'blink', 'jump', 'hurt', 'happy'

      if (f === 0) {
        // Idle 1
        bodyY = 9;
      } else if (f === 1) {
        // Idle 2 (subtle breathe & blink)
        bodyY = 10;
        bodyScaleY = 0.95;
        eyeType = 'blink';
      } else if (f === 2) {
        // Run 1
        bodyY = 8;
        legOffsetL = -4;
        legOffsetR = 4;
      } else if (f === 3) {
        // Run 2
        bodyY = 7;
        legOffsetL = -1;
        legOffsetR = 1;
      } else if (f === 4) {
        // Run 3
        bodyY = 8;
        legOffsetL = 4;
        legOffsetR = -4;
      } else if (f === 5) {
        // Run 4
        bodyY = 7;
        legOffsetL = 1;
        legOffsetR = -1;
      } else if (f === 6) {
        // Jump rising
        bodyY = 6;
        bodyScaleY = 1.1;
        legOffsetL = 2;
        legOffsetR = 2;
        eyeType = 'jump';
      } else if (f === 7) {
        // Fall
        bodyY = 9;
        bodyScaleY = 0.9;
        legOffsetL = 4;
        legOffsetR = 4;
        eyeType = 'jump';
      } else if (f === 8) {
        // Hurt
        bodyY = 9;
        eyeType = 'hurt';
      } else if (f === 9) {
        // Victory
        bodyY = 6;
        eyeType = 'happy';
      }

      // Draw Boots / Legs
      ctx.fillStyle = bootColor;
      // Left leg
      ctx.fillRect(9, 23 + legOffsetL, 5, 6);
      // Right leg
      ctx.fillRect(18, 23 + legOffsetR, 5, 6);

      // Body (round capsule)
      ctx.fillStyle = bodyShadow;
      this.drawRoundedRect(ctx, 6, bodyY + 1, 20, 16 * bodyScaleY, 6);
      ctx.fill();

      ctx.fillStyle = bodyColor;
      this.drawRoundedRect(ctx, 6, bodyY, 20, 15 * bodyScaleY, 6);
      ctx.fill();

      // Cheeks
      ctx.fillStyle = '#FF8DA1';
      ctx.fillRect(7, bodyY + 9, 3, 2);
      ctx.fillRect(22, bodyY + 9, 3, 2);

      // Adventurer Cap / Band
      ctx.fillStyle = capColor;
      ctx.fillRect(6, bodyY, 20, 5);
      // Feather
      ctx.fillStyle = featherColor;
      ctx.beginPath();
      ctx.moveTo(10, bodyY - 1);
      ctx.lineTo(8, bodyY - 6);
      ctx.lineTo(13, bodyY - 2);
      ctx.fill();

      // Eyes
      if (eyeType === 'normal') {
        // White sclera
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(11, bodyY + 5, 4, 5);
        ctx.fillRect(18, bodyY + 5, 4, 5);
        // Pupils
        ctx.fillStyle = '#1D2A44';
        ctx.fillRect(13, bodyY + 6, 2, 3);
        ctx.fillRect(20, bodyY + 6, 2, 3);
        // Highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(12, bodyY + 5, 1, 1);
        ctx.fillRect(19, bodyY + 5, 1, 1);
      } else if (eyeType === 'blink') {
        ctx.fillStyle = '#1D2A44';
        ctx.fillRect(11, bodyY + 7, 4, 2);
        ctx.fillRect(18, bodyY + 7, 4, 2);
      } else if (eyeType === 'jump') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(11, bodyY + 4, 4, 6);
        ctx.fillRect(18, bodyY + 4, 4, 6);
        ctx.fillStyle = '#1D2A44';
        ctx.fillRect(12, bodyY + 5, 3, 4);
        ctx.fillRect(19, bodyY + 5, 3, 4);
      } else if (eyeType === 'hurt') {
        // X eyes
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        // left X
        ctx.beginPath();
        ctx.moveTo(11, bodyY + 5);
        ctx.lineTo(14, bodyY + 8);
        ctx.moveTo(14, bodyY + 5);
        ctx.lineTo(11, bodyY + 8);
        // right X
        ctx.moveTo(18, bodyY + 5);
        ctx.lineTo(21, bodyY + 8);
        ctx.moveTo(21, bodyY + 5);
        ctx.lineTo(18, bodyY + 8);
        ctx.stroke();
      } else if (eyeType === 'happy') {
        // ^ ^ happy curves
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(13, bodyY + 8, 3, Math.PI, 0, false);
        ctx.arc(20, bodyY + 8, 3, Math.PI, 0, false);
        ctx.stroke();
      }

      // Belt with gold buckle
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(7, bodyY + 13, 18, 3);
      ctx.fillStyle = '#FFD166';
      ctx.fillRect(14, bodyY + 12, 4, 4);

      // Backpack strap
      ctx.fillStyle = '#C75D2C';
      ctx.fillRect(6, bodyY + 6, 3, 7);

      ctx.restore();
    }

    this.textures.addSpriteSheet('player', canvas as any, {
      frameWidth: frameW,
      frameHeight: frameH,
    });
  }

  private createEnemyTextures(): void {
    // 1. Crawler Enemy (Purple spiky slug)
    const crawlW = 32;
    const crawlH = 24;
    const crawlFrames = 4;
    const crawlCanvas = document.createElement('canvas');
    crawlCanvas.width = crawlW * crawlFrames;
    crawlCanvas.height = crawlH;
    const cCtx = crawlCanvas.getContext('2d')!;

    for (let f = 0; f < crawlFrames; f++) {
      const ox = f * crawlW;
      cCtx.save();
      cCtx.translate(ox, 0);

      const squish = f === 1 || f === 3 ? 1.5 : 0;

      // Spikes on back
      cCtx.fillStyle = '#FF4081';
      cCtx.beginPath();
      cCtx.moveTo(8, 8);
      cCtx.lineTo(11, 2);
      cCtx.lineTo(14, 8);
      cCtx.moveTo(15, 8);
      cCtx.lineTo(18, 1);
      cCtx.lineTo(21, 8);
      cCtx.moveTo(22, 8);
      cCtx.lineTo(25, 3);
      cCtx.lineTo(27, 8);
      cCtx.fill();

      // Slime Body
      cCtx.fillStyle = '#7C4DFF';
      this.drawRoundedRect(cCtx, 4, 7 + squish, 24, 15 - squish, 6);
      cCtx.fill();

      // Underside belly
      cCtx.fillStyle = '#B388FF';
      cCtx.fillRect(6, 17, 20, 4);

      // Cute menacing eyes
      cCtx.fillStyle = '#FFFFFF';
      cCtx.fillRect(7, 10 + squish, 5, 5);
      cCtx.fillRect(15, 10 + squish, 5, 5);
      cCtx.fillStyle = '#212121';
      cCtx.fillRect(8, 11 + squish, 3, 3);
      cCtx.fillRect(16, 11 + squish, 3, 3);

      cCtx.restore();
    }

    this.textures.addSpriteSheet('enemy-crawler', crawlCanvas as any, {
      frameWidth: crawlW,
      frameHeight: crawlH,
    });

    // 2. Flyer Enemy (Winged bug / bat)
    const flyW = 32;
    const flyH = 32;
    const flyFrames = 4;
    const flyCanvas = document.createElement('canvas');
    flyCanvas.width = flyW * flyFrames;
    flyCanvas.height = flyH;
    const fCtx = flyCanvas.getContext('2d')!;

    for (let f = 0; f < flyFrames; f++) {
      const ox = f * flyW;
      fCtx.save();
      fCtx.translate(ox, 0);

      // Wings positions
      const wingYOffset = [ -3, 0, 4, 0 ][f];

      // Wings
      fCtx.fillStyle = '#80DEEA';
      // Left wing
      fCtx.beginPath();
      fCtx.ellipse(8, 12 + wingYOffset, 7, 4, -0.3, 0, Math.PI * 2);
      fCtx.fill();
      // Right wing
      fCtx.beginPath();
      fCtx.ellipse(24, 12 + wingYOffset, 7, 4, 0.3, 0, Math.PI * 2);
      fCtx.fill();

      // Flyer body
      fCtx.fillStyle = '#E91E63';
      this.drawRoundedRect(fCtx, 10, 12, 12, 14, 5);
      fCtx.fill();

      // Big yellow eyes
      fCtx.fillStyle = '#FFEB3B';
      fCtx.fillRect(11, 14, 4, 4);
      fCtx.fillRect(17, 14, 4, 4);
      fCtx.fillStyle = '#D50000';
      fCtx.fillRect(12, 15, 2, 2);
      fCtx.fillRect(18, 15, 2, 2);

      // Stinger
      fCtx.fillStyle = '#880E4F';
      fCtx.beginPath();
      fCtx.moveTo(14, 26);
      fCtx.lineTo(18, 26);
      fCtx.lineTo(16, 30);
      fCtx.fill();

      fCtx.restore();
    }

    this.textures.addSpriteSheet('enemy-flyer', flyCanvas as any, {
      frameWidth: flyW,
      frameHeight: flyH,
    });
  }

  private createHazardTextures(): void {
    // 1. Spikes (sharp static hazard)
    const spikeCanvas = document.createElement('canvas');
    spikeCanvas.width = 32;
    spikeCanvas.height = 24;
    const sCtx = spikeCanvas.getContext('2d')!;

    // 4 sharp metal spikes
    for (let i = 0; i < 4; i++) {
      const sx = i * 8;
      // Dark base
      sCtx.fillStyle = '#455A64';
      sCtx.beginPath();
      sCtx.moveTo(sx, 24);
      sCtx.lineTo(sx + 4, 4);
      sCtx.lineTo(sx + 8, 24);
      sCtx.fill();

      // Highlight side
      sCtx.fillStyle = '#CFD8DC';
      sCtx.beginPath();
      sCtx.moveTo(sx + 1, 24);
      sCtx.lineTo(sx + 4, 4);
      sCtx.lineTo(sx + 4, 24);
      sCtx.fill();

      // Red danger tip
      sCtx.fillStyle = '#FF5252';
      sCtx.beginPath();
      sCtx.moveTo(sx + 3, 9);
      sCtx.lineTo(sx + 4, 4);
      sCtx.lineTo(sx + 5, 9);
      sCtx.fill();
    }
    this.textures.addCanvas('spikes', spikeCanvas);

    // 2. Rotating Saw Hazard
    const sawCanvas = document.createElement('canvas');
    sawCanvas.width = 36;
    sawCanvas.height = 36;
    const wCtx = sawCanvas.getContext('2d')!;
    const cx = 18;
    const cy = 18;
    const teeth = 8;
    wCtx.fillStyle = '#B0BEC5';
    wCtx.beginPath();
    for (let t = 0; t < teeth; t++) {
      const a1 = (t / teeth) * Math.PI * 2;
      const a2 = ((t + 0.5) / teeth) * Math.PI * 2;
      wCtx.lineTo(cx + Math.cos(a1) * 16, cy + Math.sin(a1) * 16);
      wCtx.lineTo(cx + Math.cos(a2) * 11, cy + Math.sin(a2) * 11);
    }
    wCtx.closePath();
    wCtx.fill();

    // Saw Center
    wCtx.fillStyle = '#D32F2F';
    wCtx.beginPath();
    wCtx.arc(cx, cy, 7, 0, Math.PI * 2);
    wCtx.fill();
    wCtx.fillStyle = '#ECEFF1';
    wCtx.beginPath();
    wCtx.arc(cx, cy, 3, 0, Math.PI * 2);
    wCtx.fill();
    this.textures.addCanvas('saw', sawCanvas);
  }

  private createCollectibleTextures(): void {
    // 1. Spinning Gold Coin (6 frames)
    const coinW = 20;
    const coinH = 20;
    const coinFrames = 6;
    const coinCanvas = document.createElement('canvas');
    coinCanvas.width = coinW * coinFrames;
    coinCanvas.height = coinH;
    const cCtx = coinCanvas.getContext('2d')!;

    for (let f = 0; f < coinFrames; f++) {
      const ox = f * coinW;
      cCtx.save();
      cCtx.translate(ox, 0);

      // Width scales according to rotation angle
      const angle = (f / coinFrames) * Math.PI;
      const radiusX = Math.max(2, Math.abs(Math.cos(angle)) * 8);

      // Outer rim
      cCtx.fillStyle = '#FF9100';
      cCtx.beginPath();
      cCtx.ellipse(10, 10, radiusX, 8, 0, 0, Math.PI * 2);
      cCtx.fill();

      // Inner gold
      cCtx.fillStyle = '#FFD54F';
      cCtx.beginPath();
      cCtx.ellipse(10, 10, radiusX * 0.78, 6.2, 0, 0, Math.PI * 2);
      cCtx.fill();

      // Star emblem / specular glint
      if (radiusX > 4) {
        cCtx.fillStyle = '#FFF8E1';
        cCtx.fillRect(9, 7, 2, 6);
        cCtx.fillRect(7, 9, 6, 2);
      }

      cCtx.restore();
    }
    this.textures.addSpriteSheet('coin', coinCanvas as any, {
      frameWidth: coinW,
      frameHeight: coinH,
    });

    // 2. Shiny Star
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 28;
    starCanvas.height = 28;
    const stCtx = starCanvas.getContext('2d')!;
    this.drawStar(stCtx, 14, 14, 5, 12, 6, '#FFA000');
    this.drawStar(stCtx, 14, 14, 5, 10, 5, '#FFD54F');
    this.drawStar(stCtx, 14, 14, 5, 5, 2.5, '#FFFDE7');
    this.textures.addCanvas('star', starCanvas);

    // 3. Heart
    const heartCanvas = document.createElement('canvas');
    heartCanvas.width = 20;
    heartCanvas.height = 20;
    const hCtx = heartCanvas.getContext('2d')!;
    hCtx.fillStyle = '#E91E63';
    hCtx.beginPath();
    hCtx.moveTo(10, 16);
    hCtx.bezierCurveTo(4, 11, 2, 6, 6, 3);
    hCtx.bezierCurveTo(9, 1, 10, 4, 10, 5);
    hCtx.bezierCurveTo(10, 4, 11, 1, 14, 3);
    hCtx.bezierCurveTo(18, 6, 16, 11, 10, 16);
    hCtx.fill();
    // Highlight
    hCtx.fillStyle = '#F8BBD0';
    hCtx.beginPath();
    hCtx.arc(6, 5, 1.8, 0, Math.PI * 2);
    hCtx.fill();
    this.textures.addCanvas('heart', heartCanvas);
  }

  private createEnvironmentTextures(): void {
    // 1. Grass Platform Top Tile (32 x 32)
    const grassTopCanvas = document.createElement('canvas');
    grassTopCanvas.width = 32;
    grassTopCanvas.height = 32;
    const gtCtx = grassTopCanvas.getContext('2d')!;

    // Earth/dirt base
    gtCtx.fillStyle = '#6D4C41';
    gtCtx.fillRect(0, 0, 32, 32);
    gtCtx.fillStyle = '#5D4037';
    gtCtx.fillRect(4, 14, 6, 6);
    gtCtx.fillRect(18, 20, 8, 5);
    gtCtx.fillRect(12, 26, 4, 4);

    // Grass overhang & fringe
    gtCtx.fillStyle = '#2E7D32';
    gtCtx.fillRect(0, 0, 32, 10);
    gtCtx.beginPath();
    gtCtx.moveTo(0, 10);
    gtCtx.lineTo(4, 14);
    gtCtx.lineTo(8, 10);
    gtCtx.lineTo(14, 15);
    gtCtx.lineTo(19, 10);
    gtCtx.lineTo(24, 14);
    gtCtx.lineTo(28, 10);
    gtCtx.lineTo(32, 13);
    gtCtx.lineTo(32, 0);
    gtCtx.lineTo(0, 0);
    gtCtx.fill();

    // Lush top grass highlight
    gtCtx.fillStyle = '#4CAF50';
    gtCtx.fillRect(0, 0, 32, 5);
    gtCtx.fillStyle = '#81C784';
    gtCtx.fillRect(2, 0, 5, 2);
    gtCtx.fillRect(12, 0, 6, 2);
    gtCtx.fillRect(23, 0, 4, 2);

    // Little wild flowers
    gtCtx.fillStyle = '#FFEB3B';
    gtCtx.fillRect(7, 3, 2, 2);
    gtCtx.fillStyle = '#FF4081';
    gtCtx.fillRect(20, 2, 2, 2);

    this.textures.addCanvas('tile-grass-top', grassTopCanvas);

    // 2. Dirt Center Tile
    const dirtCanvas = document.createElement('canvas');
    dirtCanvas.width = 32;
    dirtCanvas.height = 32;
    const dCtx = dirtCanvas.getContext('2d')!;
    dCtx.fillStyle = '#5D4037';
    dCtx.fillRect(0, 0, 32, 32);
    dCtx.fillStyle = '#4E342E';
    dCtx.fillRect(2, 4, 8, 7);
    dCtx.fillRect(16, 14, 9, 8);
    dCtx.fillRect(8, 24, 6, 5);
    dCtx.fillStyle = '#795548';
    dCtx.fillRect(20, 2, 5, 4);
    dCtx.fillRect(4, 16, 4, 4);
    this.textures.addCanvas('tile-dirt', dirtCanvas);

    // 3. Floating Wooden Bridge Tile (32 x 18)
    const bridgeCanvas = document.createElement('canvas');
    bridgeCanvas.width = 32;
    bridgeCanvas.height = 18;
    const bCtx = bridgeCanvas.getContext('2d')!;
    bCtx.fillStyle = '#8D6E63';
    this.drawRoundedRect(bCtx, 1, 2, 30, 14, 3);
    bCtx.fill();
    bCtx.fillStyle = '#A1887F';
    this.drawRoundedRect(bCtx, 2, 3, 28, 4, 2);
    bCtx.fill();
    // Metal bolts
    bCtx.fillStyle = '#CFD8DC';
    bCtx.fillRect(4, 7, 3, 3);
    bCtx.fillRect(25, 7, 3, 3);
    this.textures.addCanvas('tile-bridge', bridgeCanvas);

    // 4. Parallax Background: Clouds (96 x 48)
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 96;
    cloudCanvas.height = 48;
    const clCtx = cloudCanvas.getContext('2d')!;
    clCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    clCtx.beginPath();
    clCtx.arc(30, 28, 18, 0, Math.PI * 2);
    clCtx.arc(52, 22, 22, 0, Math.PI * 2);
    clCtx.arc(72, 28, 16, 0, Math.PI * 2);
    clCtx.fill();
    this.textures.addCanvas('bg-cloud', cloudCanvas);

    // 5. Parallax Background: Distant Mountain Layer (960 x 280)
    const mtnCanvas = document.createElement('canvas');
    mtnCanvas.width = 960;
    mtnCanvas.height = 280;
    const mCtx = mtnCanvas.getContext('2d')!;
    mCtx.fillStyle = '#1D2A44';
    mCtx.beginPath();
    mCtx.moveTo(0, 280);
    // Draw mountain silhouettes
    const peaks = [
      { x: 0, y: 190 },
      { x: 120, y: 80 },
      { x: 260, y: 180 },
      { x: 420, y: 50 },
      { x: 590, y: 170 },
      { x: 740, y: 70 },
      { x: 880, y: 160 },
      { x: 960, y: 110 },
    ];
    peaks.forEach((p) => mCtx.lineTo(p.x, p.y));
    mCtx.lineTo(960, 280);
    mCtx.closePath();
    mCtx.fill();

    // Mountain snowcaps
    mCtx.fillStyle = '#394B6D';
    [120, 420, 740].forEach((peakX) => {
      const peakY = peakX === 420 ? 50 : peakX === 120 ? 80 : 70;
      mCtx.beginPath();
      mCtx.moveTo(peakX, peakY);
      mCtx.lineTo(peakX - 35, peakY + 45);
      mCtx.lineTo(peakX, peakY + 35);
      mCtx.lineTo(peakX + 35, peakY + 45);
      mCtx.closePath();
      mCtx.fill();
    });
    this.textures.addCanvas('bg-mountains', mtnCanvas);

    // 6. Parallax Background: Midground Rolling Hills (960 x 220)
    const hillsCanvas = document.createElement('canvas');
    hillsCanvas.width = 960;
    hillsCanvas.height = 220;
    const hCtx = hillsCanvas.getContext('2d')!;
    hCtx.fillStyle = '#1A3F3B';
    hCtx.beginPath();
    hCtx.moveTo(0, 220);
    hCtx.quadraticCurveTo(240, 60, 480, 130);
    hCtx.quadraticCurveTo(720, 200, 960, 90);
    hCtx.lineTo(960, 220);
    hCtx.closePath();
    hCtx.fill();

    // Add cute background mini trees along hilltops
    hCtx.fillStyle = '#0F2C29';
    for (let tx = 30; tx < 960; tx += 65) {
      const ty = tx < 480 ? 120 - Math.sin((tx / 480) * Math.PI) * 50 : 150 - Math.cos(((tx - 480) / 480) * Math.PI) * 40;
      hCtx.beginPath();
      hCtx.moveTo(tx, ty);
      hCtx.lineTo(tx - 9, ty + 24);
      hCtx.lineTo(tx + 9, ty + 24);
      hCtx.fill();
    }
    this.textures.addCanvas('bg-hills', hillsCanvas);

    // 7. Tree Decoration (64 x 96)
    const treeCanvas = document.createElement('canvas');
    treeCanvas.width = 64;
    treeCanvas.height = 96;
    const trCtx = treeCanvas.getContext('2d')!;
    // Trunk
    trCtx.fillStyle = '#5D4037';
    trCtx.fillRect(27, 50, 10, 46);
    // Tree foliage layers
    const folLayers = [
      { y: 55, r: 24, c: '#2E7D32' },
      { y: 38, r: 20, c: '#388E3C' },
      { y: 22, r: 16, c: '#4CAF50' },
    ];
    folLayers.forEach((l) => {
      trCtx.fillStyle = l.c;
      trCtx.beginPath();
      trCtx.arc(32, l.y, l.r, 0, Math.PI * 2);
      trCtx.fill();
    });
    this.textures.addCanvas('tree', treeCanvas);

    // 8. Bush Decoration (48 x 28)
    const bushCanvas = document.createElement('canvas');
    bushCanvas.width = 48;
    bushCanvas.height = 28;
    const buCtx = bushCanvas.getContext('2d')!;
    buCtx.fillStyle = '#2E7D32';
    buCtx.beginPath();
    buCtx.arc(14, 18, 12, 0, Math.PI * 2);
    buCtx.arc(34, 18, 12, 0, Math.PI * 2);
    buCtx.arc(24, 14, 14, 0, Math.PI * 2);
    buCtx.fill();
    // Berries
    buCtx.fillStyle = '#E91E63';
    buCtx.fillRect(16, 12, 3, 3);
    buCtx.fillRect(28, 14, 3, 3);
    buCtx.fillRect(22, 20, 3, 3);
    this.textures.addCanvas('bush', bushCanvas);

    // 9. Signpost
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 32;
    signCanvas.height = 36;
    const sCtx = signCanvas.getContext('2d')!;
    // Post
    sCtx.fillStyle = '#5D4037';
    sCtx.fillRect(14, 14, 4, 22);
    // Board
    sCtx.fillStyle = '#8D6E63';
    this.drawRoundedRect(sCtx, 2, 2, 28, 16, 3);
    sCtx.fill();
    // Arrow
    sCtx.fillStyle = '#FFD54F';
    sCtx.beginPath();
    sCtx.moveTo(8, 10);
    sCtx.lineTo(18, 10);
    sCtx.lineTo(18, 6);
    sCtx.lineTo(24, 10);
    sCtx.lineTo(18, 14);
    sCtx.lineTo(18, 10);
    sCtx.fill();
    this.textures.addCanvas('signpost', signCanvas);
  }

  private createParticleTextures(): void {
    // 1. Sparkle Particle (8 x 8)
    const spCanvas = document.createElement('canvas');
    spCanvas.width = 8;
    spCanvas.height = 8;
    const spCtx = spCanvas.getContext('2d')!;
    spCtx.fillStyle = '#FFF59D';
    spCtx.fillRect(3, 0, 2, 8);
    spCtx.fillRect(0, 3, 8, 2);
    this.textures.addCanvas('particle-sparkle', spCanvas);

    // 2. Dust Puff (8 x 8)
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 8;
    dCanvas.height = 8;
    const dCtx = dCanvas.getContext('2d')!;
    dCtx.fillStyle = 'rgba(230, 230, 230, 0.7)';
    dCtx.beginPath();
    dCtx.arc(4, 4, 3.5, 0, Math.PI * 2);
    dCtx.fill();
    this.textures.addCanvas('particle-dust', dCanvas);

    // 3. Confetti
    const cCanvas = document.createElement('canvas');
    cCanvas.width = 6;
    cCanvas.height = 6;
    const cCtx = cCanvas.getContext('2d')!;
    cCtx.fillStyle = '#FF4081';
    cCtx.fillRect(0, 0, 6, 6);
    this.textures.addCanvas('particle-confetti', cCanvas);
  }

  private createFlagTexture(): void {
    // Finish Flag Pole with Banner (36 x 64)
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 36;
    flagCanvas.height = 64;
    const fCtx = flagCanvas.getContext('2d')!;

    // Stone pedestal
    fCtx.fillStyle = '#78909C';
    this.drawRoundedRect(fCtx, 8, 56, 20, 8, 2);
    fCtx.fill();

    // Metallic pole
    fCtx.fillStyle = '#ECEFF1';
    fCtx.fillRect(16, 6, 4, 52);

    // Golden finial ball
    fCtx.fillStyle = '#FFD54F';
    fCtx.beginPath();
    fCtx.arc(18, 5, 4, 0, Math.PI * 2);
    fCtx.fill();

    // Checkered victory flag
    const flagW = 16;
    const flagH = 14;
    fCtx.fillStyle = '#FF1744';
    fCtx.fillRect(20, 8, flagW, flagH);
    fCtx.fillStyle = '#FFFFFF';
    fCtx.fillRect(20, 8, 8, 7);
    fCtx.fillRect(28, 15, 8, 7);

    this.textures.addCanvas('finish-flag', flagCanvas);
  }

  // --- ANIMATIONS ---
  private createPlayerAnimations(): void {
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-run',
      frames: this.anims.generateFrameNumbers('player', { start: 2, end: 5 }),
      frameRate: 11,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-jump',
      frames: [{ key: 'player', frame: 6 }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-fall',
      frames: [{ key: 'player', frame: 7 }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-hurt',
      frames: [{ key: 'player', frame: 8 }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-won',
      frames: [{ key: 'player', frame: 9 }],
      frameRate: 1,
    });
  }

  private createEnemyAnimations(): void {
    this.anims.create({
      key: 'crawler-walk',
      frames: this.anims.generateFrameNumbers('enemy-crawler', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'flyer-fly',
      frames: this.anims.generateFrameNumbers('enemy-flyer', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  private createCollectibleAnimations(): void {
    this.anims.create({
      key: 'coin-spin',
      frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  // --- UTILITY DRAWING HELPERS ---
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerR: number,
    innerR: number,
    color: string
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerR;
      let y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }
}
