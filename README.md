# Super Pixel Dash - 2D Platformer

A complete, polished 2D side-scrolling platformer built with **Phaser 3**, **TypeScript**, and **Vite**.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation
Install the project dependencies:
```bash
npm install
```

### 3. Run Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL (typically `http://localhost:5173/`).

### 4. Build for Production
To compile TypeScript and produce an optimized production bundle in `dist/`:
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🎮 Controls

### Desktop Controls
| Action | Primary Key | Alternate Key |
|---|---|---|
| **Move Left** | `A` | `Left Arrow` |
| **Move Right** | `D` | `Right Arrow` |
| **Jump** | `Space` | `W` / `Up Arrow` |
| **Pause / Resume** | `ESC` | `P` |

*Gameplay Feel Tips:*
- **Variable Jump Height:** Tap jump lightly for a short hop, or hold jump down to reach maximum height.
- **Coyote Time:** Jump is still responsive for a fraction of a second after stepping off a platform edge.
- **Jump Buffering:** Pressing jump slightly before touching the ground will automatically execute the jump upon landing.
- **Enemy Stomp:** Jump on top of crawling or flying enemies to defeat them and bounce upward!

### Mobile / Touch Controls
- **Virtual D-Pad (`◀` / `▶`)**: Positioned at bottom-left for comfortable thumb steering.
- **Virtual Jump Button (`JUMP`)**: Large button at bottom-right.
- **Interactive Top HUD**: Tap the Pause button or Sound Toggle icon at any time.

---

## 🗺️ Level Design Overview

The level is a carefully crafted ~8,800px side-scrolling gauntlet with ~3–5 minutes of continuous platforming gameplay:

1. **Start Sanctuary (0–700px):** Introduces basic movement, gentle jumps, first coins, and signposts.
2. **Easy Platforms & First Star (700–1,500px):** Elevated grass hills and first hidden Star atop a scenic rise.
3. **Low Obstacles & Spikes (1,500–2,400px):** Introduction of spike hazards, wooden bridges, Star #2, and a recovery Heart.
4. **Enemy Section (2,400–3,500px):** Patrolling spiky crawler slugs with stompable weak points, Star #3, and Star #4.
5. **Vertical Challenge (3,500–4,700px):** High mountain plateau ascent, flying bat enemies, and mountain peak Star #5.
6. **Hazard Gauntlet (4,700–6,100px):** Moving saw obstacles (vertical and horizontal sweeps), Star #6, and Star #7.
7. **Flying Canyon (6,100–7,400px):** Stepping-stone pillars over deep chasms, flying enemies, Star #8, and Star #9.
8. **Final Summit (7,400–8,200px):** High castle bridges leading to Star #10.
9. **Finish Dais & Victory Flag (8,200–8,800px):** Grand approach to the checkered victory flagpole with celebratory confetti shower!

---

## 📂 Project Architecture

```
Game/
├── index.html                  # HTML5 entry with responsive canvas container & retro styling
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler configuration
└── src/
    ├── main.ts                 # Game entrypoint bootstrapping all Phaser scenes
    ├── config/
    │   └── gameConfig.ts       # Dimensions, physics tuning, and Phaser configuration
    ├── scenes/
    │   ├── BootScene.ts        # Procedural canvas sprite generation & animation setup
    │   ├── PreloadScene.ts     # Loading transition & asset caching
    │   ├── MainMenuScene.ts    # Title screen, high scores, animated hero preview, controls
    │   ├── GameScene.ts        # Core gameplay loop, camera tracking, and physics collisions
    │   ├── PauseScene.ts       # Pause overlay dialog with resume, restart, and menu
    │   ├── GameOverScene.ts    # Game over recap, score summary, and retry
    │   └── CompleteScene.ts    # Level complete victory screen with star rating & confetti
    ├── entities/
    │   ├── Player.ts           # Player physics sprite with coyote time, jump buffering & stomp
    │   ├── Enemy.ts            # CrawlerEnemy, FlyerEnemy, and MovingHazard classes
    │   └── Collectible.ts      # Coin, Star, and HeartPickup classes
    ├── systems/
    │   ├── LevelManager.ts     # Multi-section fixed level builder & parallax generator
    │   ├── InputManager.ts     # Unified keyboard and touch input processor
    │   ├── ScoreManager.ts     # Score, star counters, timer, and localStorage persistence
    │   └── SoundManager.ts     # Web Audio procedural sound synthesizer & chiptune BGM
    └── ui/
        ├── HUD.ts              # Score, stars, hearts, progress bar, and pause/mute buttons
        └── MobileControls.ts   # On-screen touch D-pad and jump button
```

---

## 🎨 Replacing Placeholder Assets with Real Sprites

All initial textures are generated procedurally at runtime using HTML5 Canvas in [`src/scenes/BootScene.ts`](file:///home/aavatto/Game/src/scenes/BootScene.ts), ensuring zero missing assets and immediate offline playability.

When you are ready to replace them with external PNG sprites or texture atlases:

### 1. Place Image Files in `public/assets/`
Create a `public/assets/` directory (e.g. `public/assets/sprites/` and `public/assets/tiles/`):
```bash
mkdir -p public/assets/sprites public/assets/tiles
```
Place your sprite images there, such as:
- `player.png` (e.g., 32x32 spritesheet with idle, run, jump frames)
- `crawler.png`, `flyer.png`
- `tileset.png`
- `coin.png`, `star.png`

### 2. Load Assets in `BootScene.ts` (or `PreloadScene.ts`)
In `BootScene.ts`, use Phaser's standard loaders instead of `textures.addSpriteSheet(key, canvas)`:
```typescript
public preload(): void {
  // Replace procedural generation with external sprite loading:
  this.load.spritesheet('player', 'assets/sprites/player.png', {
    frameWidth: 32,
    frameHeight: 32,
  });

  this.load.spritesheet('enemy-crawler', 'assets/sprites/crawler.png', {
    frameWidth: 32,
    frameHeight: 24,
  });

  this.load.spritesheet('coin', 'assets/sprites/coin.png', {
    frameWidth: 20,
    frameHeight: 20,
  });

  this.load.image('star', 'assets/sprites/star.png');
  this.load.image('spikes', 'assets/tiles/spikes.png');
  this.load.image('saw', 'assets/sprites/saw.png');
  this.load.image('tile-grass-top', 'assets/tiles/grass-top.png');
  this.load.image('tile-dirt', 'assets/tiles/dirt.png');
  this.load.image('tile-bridge', 'assets/tiles/bridge.png');
  this.load.image('finish-flag', 'assets/sprites/flag.png');
}
```

### 3. Update Animation Frame Indices
In `createPlayerAnimations()` inside `BootScene.ts`, simply adjust the frame ranges (`start`, `end`) to match your new sprite sheet layout:
```typescript
this.anims.create({
  key: 'player-run',
  frames: this.anims.generateFrameNumbers('player', { start: 4, end: 9 }),
  frameRate: 12,
  repeat: -1,
});
```

Because all entity code in [`src/entities/Player.ts`](file:///home/aavatto/Game/src/entities/Player.ts), [`src/entities/Enemy.ts`](file:///home/aavatto/Game/src/entities/Enemy.ts), and [`src/entities/Collectible.ts`](file:///home/aavatto/Game/src/entities/Collectible.ts) references texture keys (`'player'`, `'enemy-crawler'`, `'coin'`, etc.), no game logic needs to be rewritten when switching assets.
