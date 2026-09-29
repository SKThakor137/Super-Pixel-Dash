import Phaser from 'phaser';
import { LEVEL_WIDTH, LEVEL_HEIGHT } from '../config/gameConfig';
import { CrawlerEnemy, FlyerEnemy, MovingHazard, Enemy } from '../entities/Enemy';
import { Coin, Star, HeartPickup, Collectible } from '../entities/Collectible';

export interface LevelObjects {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  spikes: Phaser.Physics.Arcade.StaticGroup;
  movingHazards: MovingHazard[];
  enemies: Enemy[];
  collectibles: Collectible[];
  finishFlag: Phaser.Physics.Arcade.Sprite;
  totalStars: number;
}

export class LevelManager {
  private scene: Phaser.Scene;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private movingHazards: MovingHazard[] = [];
  private enemies: Enemy[] = [];
  private collectibles: Collectible[] = [];
  private finishFlag!: Phaser.Physics.Arcade.Sprite;
  private starCount: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public buildLevel(): LevelObjects {
    this.platforms = this.scene.physics.add.staticGroup();
    this.spikes = this.scene.physics.add.staticGroup();
    this.movingHazards = [];
    this.enemies = [];
    this.collectibles = [];
    this.starCount = 0;

    // Create Parallax background elements
    this.createParallaxBackgrounds();

    // Build Level Layout
    this.buildTerrainAndObjects();

    return {
      platforms: this.platforms,
      spikes: this.spikes,
      movingHazards: this.movingHazards,
      enemies: this.enemies,
      collectibles: this.collectibles,
      finishFlag: this.finishFlag,
      totalStars: this.starCount,
    };
  }

  private createParallaxBackgrounds(): void {
    // Gradient sky
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(0x192a56, 0x192a56, 0x0c2461, 0x0c2461, 1);
    sky.fillRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    sky.setScrollFactor(0);

    // Distant mountain peaks (scroll factor 0.1)
    const mtnCount = Math.ceil(LEVEL_WIDTH / 960) + 1;
    for (let i = 0; i < mtnCount; i++) {
      const mtn = this.scene.add.image(i * 960, 260, 'bg-mountains');
      mtn.setOrigin(0, 0).setScrollFactor(0.12).setDepth(-10);
    }

    // Midground rolling hills with mini-trees (scroll factor 0.3)
    const hillCount = Math.ceil(LEVEL_WIDTH / 960) + 1;
    for (let i = 0; i < hillCount; i++) {
      const hill = this.scene.add.image(i * 960, 320, 'bg-hills');
      hill.setOrigin(0, 0).setScrollFactor(0.32).setDepth(-8);
    }

    // Floating Clouds at varying speeds
    for (let c = 0; c < 28; c++) {
      const cx = c * 330 + Phaser.Math.Between(-60, 60);
      const cy = Phaser.Math.Between(40, 180);
      const cloud = this.scene.add.image(cx, cy, 'bg-cloud');
      const scale = Phaser.Math.FloatBetween(0.7, 1.4);
      cloud.setScale(scale).setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));
      cloud.setScrollFactor(0.2).setDepth(-9);
    }
  }

  private buildTerrainAndObjects(): void {
    // -------------------------------------------------------------
    // SECTION 1: START AREA (0 - 700)
    // -------------------------------------------------------------
    this.createGround(0, 480, 24, 7); // Main ground: 0 to 768
    this.addDeco(60, 480, 'tree', 1);
    this.addDeco(160, 480, 'signpost', 1);
    this.addDeco(220, 480, 'bush', 1);
    this.addDeco(340, 480, 'bush', 0.85);

    // Initial gentle platform & coins
    this.createPlatform(420, 400, 4);
    this.createCoinLine(430, 360, 3, 28);
    this.createCoinLine(180, 440, 4, 30);

    // -------------------------------------------------------------
    // SECTION 2: EASY PLATFORMS & FIRST STAR (700 - 1500)
    // -------------------------------------------------------------
    // Small gap at 768 to 860
    this.createGround(860, 480, 12, 7);
    this.createBridge(768, 440, 3);
    this.createCoinLine(775, 405, 3, 26);

    // Elevated stepped hills
    this.createPlatform(980, 390, 4);
    this.createPlatform(1130, 310, 4);
    this.createStar(1190, 260); // STAR 1!
    this.addDeco(900, 480, 'tree', 1.1);
    this.addDeco(1040, 390, 'bush', 0.9);

    // Landing plateau
    this.createGround(1280, 480, 10, 7);
    this.createCoinArc(1320, 410, 5, 45);

    // -------------------------------------------------------------
    // SECTION 3: OBSTACLES & INTRODUCING SPIKES (1500 - 2400)
    // -------------------------------------------------------------
    // Gap with spike pit
    this.createSpikes(1600, 520, 5); // Warning spikes in pit
    this.createBridge(1580, 430, 3);
    this.createPlatform(1720, 360, 4);
    this.createCoinLine(1730, 320, 3, 28);
    this.createHeart(1780, 260); // Bonus health heart!

    this.createGround(1880, 480, 16, 7);
    this.addDeco(1910, 480, 'signpost', 1);
    this.addDeco(2020, 480, 'bush', 1);

    // Spikes on ground with jump over
    this.createSpikes(2100, 480, 3);
    this.createCoinArc(2070, 420, 4, 35);
    this.createPlatform(2240, 380, 3);
    this.createStar(2290, 330); // STAR 2!

    // -------------------------------------------------------------
    // SECTION 4: FIRST ENEMY PATROLS (2400 - 3500)
    // -------------------------------------------------------------
    this.createGround(2420, 480, 20, 7);
    this.addDeco(2460, 480, 'tree', 1);
    this.createCrawler(2650, 460, 180); // Crawler 1
    this.createCoinLine(2560, 440, 4, 30);

    // High platform above crawler
    this.createPlatform(2600, 360, 4);
    this.createStar(2660, 310); // STAR 3!

    // Second crawler on lower section
    this.createCrawler(2880, 460, 160); // Crawler 2
    this.createCoinArc(2830, 410, 4, 35);

    // Bridge crossing over gap
    this.createBridge(3100, 440, 4);
    this.createFlyer(3160, 350, 120); // Flyer 1 hovering over bridge!
    this.createCoinLine(3110, 395, 4, 28);

    this.createGround(3260, 480, 10, 7);
    this.createPlatform(3340, 370, 4);
    this.createStar(3400, 315); // STAR 4!
    this.addDeco(3280, 480, 'bush', 1);

    // -------------------------------------------------------------
    // SECTION 5: VERTICAL PLATFORMING CHALLENGE (3500 - 4700)
    // -------------------------------------------------------------
    this.createGround(3600, 500, 8, 7);
    this.createCrawler(3720, 480, 140);

    // Stepped tower ascent
    this.createPlatform(3880, 430, 3);
    this.createPlatform(4020, 350, 3);
    this.createFlyer(4070, 270, 130); // Flyer 2
    this.createPlatform(4180, 270, 4);
    this.createStar(4240, 210); // STAR 5 (Grand mountain peak)!
    this.createCoinLine(4200, 230, 3, 28);

    // Stepping down to wide plateau
    this.createPlatform(4360, 350, 3);
    this.createPlatform(4500, 430, 3);
    this.createHeart(4545, 380); // Recovery Heart

    this.createGround(4640, 480, 14, 7);
    this.addDeco(4680, 480, 'tree', 1.2);
    this.createCrawler(4850, 460, 160);

    // -------------------------------------------------------------
    // SECTION 6: MOVING HAZARDS & GAP GAUNTLET (4700 - 6100)
    // -------------------------------------------------------------
    // Rotating Saw Gauntlet!
    this.createPlatform(5120, 420, 4);
    this.createSaw(5180, 360, 100, true, 80); // Vertical moving saw!
    this.createCoinLine(5135, 380, 3, 30);

    this.createBridge(5280, 420, 3);
    this.createSaw(5330, 350, 90, false, 75); // Horizontal saw!

    this.createPlatform(5420, 360, 4);
    this.createStar(5480, 300); // STAR 6!

    this.createGround(5580, 480, 18, 7);
    this.addDeco(5610, 480, 'signpost', 1);
    this.createSpikes(5750, 480, 3); // Spikes on ground
    this.createPlatform(5730, 380, 4); // Safe overpass platform
    this.createStar(5790, 320); // STAR 7!
    this.createCrawler(5950, 460, 160); // Crawler waiting after spikes
    this.createCoinArc(5920, 410, 5, 40);

    // -------------------------------------------------------------
    // SECTION 7: ADVANCED FLYING ENEMY CANYON (6100 - 7400)
    // -------------------------------------------------------------
    // Canyon with floating pillars
    this.createPlatform(6220, 430, 3);
    this.createFlyer(6320, 360, 130); // Flyer 3
    this.createPlatform(6380, 370, 3);
    this.createSaw(6430, 300, 90, true, 85); // Vertical saw above pillar

    this.createPlatform(6540, 320, 4);
    this.createStar(6600, 260); // STAR 8!
    this.createCoinLine(6560, 280, 3, 28);
    this.createHeart(6640, 270);

    this.createBridge(6720, 380, 4);
    this.createFlyer(6780, 310, 140); // Flyer 4

    this.createPlatform(6900, 420, 4);
    this.createCrawler(6960, 400, 100);

    this.createPlatform(7080, 360, 3);
    this.createPlatform(7220, 300, 4);
    this.createStar(7280, 240); // STAR 9!
    this.createCoinLine(7230, 260, 3, 30);

    // -------------------------------------------------------------
    // SECTION 8: FINAL PEAK & STAR 10 (7400 - 8200)
    // -------------------------------------------------------------
    this.createGround(7400, 480, 18, 7);
    this.addDeco(7430, 480, 'tree', 1.2);
    this.addDeco(7520, 480, 'bush', 1);
    this.createCrawler(7600, 460, 170); // Final crawler
    this.createCoinArc(7560, 400, 5, 45);

    // Triumphant high tower before finish
    this.createPlatform(7750, 400, 3);
    this.createPlatform(7880, 320, 4);
    this.createStar(7940, 250); // STAR 10 (Final Star)!
    this.createCoinLine(7900, 280, 3, 30);

    this.createPlatform(8060, 400, 3);

    // -------------------------------------------------------------
    // SECTION 9: FINISH DAIS & VICTORY FLAG (8200 - 8800)
    // -------------------------------------------------------------
    this.createGround(8200, 480, 20, 7);
    this.addDeco(8260, 480, 'tree', 1.3);
    this.addDeco(8340, 480, 'bush', 1);
    this.addDeco(8420, 480, 'signpost', 1);

    // Finish Flag at x = 8560
    this.finishFlag = this.scene.physics.add.sprite(8560, 448, 'finish-flag');
    const flagBody = this.finishFlag.body as Phaser.Physics.Arcade.Body;
    flagBody.setAllowGravity(false);
    flagBody.setImmovable(true);
    flagBody.setSize(30, 60);

    // Festive coin arch leading to flag
    this.createCoinArc(8480, 410, 6, 50);
    this.addDeco(8640, 480, 'tree', 1.2);
    this.addDeco(8700, 480, 'bush', 1);
  }

  // --- CREATION HELPERS ---
  private createGround(startX: number, startY: number, tilesW: number, tilesH: number): void {
    const tileW = 32;
    const tileH = 32;

    for (let col = 0; col < tilesW; col++) {
      const x = startX + col * tileW + tileW / 2;
      // Top Grass
      const topTile = this.platforms.create(x, startY + tileH / 2, 'tile-grass-top');
      topTile.refreshBody();

      // Dirt Fill
      for (let row = 1; row < tilesH; row++) {
        const dirtTile = this.scene.add.image(x, startY + row * tileH + tileH / 2, 'tile-dirt');
        dirtTile.setDepth(-2);
      }
    }
  }

  private createPlatform(startX: number, startY: number, tilesW: number): void {
    const tileW = 32;
    for (let col = 0; col < tilesW; col++) {
      const x = startX + col * tileW + tileW / 2;
      const tile = this.platforms.create(x, startY, 'tile-grass-top');
      tile.refreshBody();
    }
  }

  private createBridge(startX: number, startY: number, tilesW: number): void {
    const tileW = 32;
    for (let col = 0; col < tilesW; col++) {
      const x = startX + col * tileW + tileW / 2;
      const tile = this.platforms.create(x, startY, 'tile-bridge');
      tile.refreshBody();
    }
  }

  private createSpikes(startX: number, groundY: number, count: number): void {
    const spikeW = 32;
    for (let i = 0; i < count; i++) {
      const x = startX + i * spikeW + spikeW / 2;
      const spike = this.spikes.create(x, groundY - 12, 'spikes');
      spike.body.setSize(26, 16);
      spike.body.setOffset(3, 8);
      spike.refreshBody();
    }
  }

  private createCoinLine(startX: number, y: number, count: number, spacing: number): void {
    for (let i = 0; i < count; i++) {
      const coin = new Coin(this.scene, startX + i * spacing, y);
      this.collectibles.push(coin);
    }
  }

  private createCoinArc(centerX: number, startY: number, count: number, radius: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.PI - (i / (count - 1)) * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = startY - Math.sin(angle) * (radius * 0.75);
      const coin = new Coin(this.scene, x, y);
      this.collectibles.push(coin);
    }
  }

  private createStar(x: number, y: number): void {
    const star = new Star(this.scene, x, y);
    this.collectibles.push(star);
    this.starCount++;
  }

  private createHeart(x: number, y: number): void {
    const heart = new HeartPickup(this.scene, x, y);
    this.collectibles.push(heart);
  }

  private createCrawler(x: number, y: number, patrolDist: number): void {
    const crawler = new CrawlerEnemy(this.scene, x, y, patrolDist);
    this.enemies.push(crawler);
  }

  private createFlyer(x: number, y: number, patrolDist: number): void {
    const flyer = new FlyerEnemy(this.scene, x, y, patrolDist);
    this.enemies.push(flyer);
  }

  private createSaw(x: number, y: number, dist: number, vertical: boolean, speed: number): void {
    const saw = new MovingHazard(this.scene, x, y, dist, vertical, speed);
    this.movingHazards.push(saw);
  }

  private addDeco(x: number, groundY: number, key: string, scale: number = 1): void {
    const deco = this.scene.add.image(x, groundY, key);
    deco.setOrigin(0.5, 1).setScale(scale).setDepth(-1);
  }
}
