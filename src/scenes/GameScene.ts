import Phaser from 'phaser';
import { LEVEL_WIDTH, LEVEL_HEIGHT } from '../config/gameConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { InputManager } from '../systems/InputManager';
import { LevelManager, LevelObjects } from '../systems/LevelManager';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';
import { HUD } from '../ui/HUD';
import { MobileControls } from '../ui/MobileControls';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private levelManager!: LevelManager;
  private scoreManager!: ScoreManager;
  private soundManager!: SoundManager;

  private levelObjects!: LevelObjects;
  private hud!: HUD;
  private mobileControls!: MobileControls;

  private isLevelActive: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    this.isLevelActive = true;

    // Reset Managers
    this.scoreManager = ScoreManager.getInstance();
    this.soundManager = SoundManager.getInstance();
    this.inputManager = new InputManager(this);
    this.levelManager = new LevelManager(this);

    // Build Level
    this.levelObjects = this.levelManager.buildLevel();
    this.scoreManager.reset(this.levelObjects.totalStars);

    // Create Player
    this.player = new Player(this, 90, 410, this.inputManager);

    // Set World and Camera Bounds
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT + 100);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    // Smooth horizontal camera follow with slight lead in direction of motion
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(60, 40);

    // Create HUD & Controls
    this.hud = new HUD(this, LEVEL_WIDTH);
    this.mobileControls = new MobileControls(this, this.inputManager);

    // Register Colliders & Overlaps
    this.setupCollisions();

    // Register Event Listeners
    this.setupEvents();

    // Fade In Camera
    this.cameras.main.fadeIn(300, 15, 23, 42);
  }

  private setupCollisions(): void {
    // Player on Platforms
    this.physics.add.collider(this.player, this.levelObjects.platforms);

    // Enemies on Platforms
    this.physics.add.collider(this.levelObjects.enemies, this.levelObjects.platforms);

    // Player with Collectibles
    this.physics.add.overlap(
      this.player,
      this.levelObjects.collectibles,
      (_player, collectible) => {
        (collectible as any).collect();
      }
    );

    // Player with Spikes
    this.physics.add.overlap(
      this.player,
      this.levelObjects.spikes,
      () => {
        this.player.takeDamage();
      }
    );

    // Player with Moving Hazards (Saws)
    this.physics.add.overlap(
      this.player,
      this.levelObjects.movingHazards,
      (_player, hazard) => {
        this.player.takeDamage((hazard as any).x);
      }
    );

    // Player with Enemies (Stomp vs Take Damage)
    this.physics.add.overlap(
      this.player,
      this.levelObjects.enemies,
      (_player, enemyObj) => {
        const enemy = enemyObj as Enemy;
        if (enemy.getIsDefeated()) return;

        // Check if player is falling onto top of enemy
        const isStomping =
          this.player.body.velocity.y > 0 &&
          this.player.y < enemy.y - 8;

        if (isStomping) {
          enemy.defeat();
          this.player.bounce();
        } else {
          this.player.takeDamage(enemy.x);
        }
      }
    );

    // Player with Finish Flag
    this.physics.add.overlap(
      this.player,
      this.levelObjects.finishFlag,
      () => {
        if (!this.player.getIsVictorious() && !this.player.getIsDead()) {
          this.player.victory();
        }
      }
    );
  }

  private setupEvents(): void {
    // Player Won
    this.events.once('player-won', () => {
      this.isLevelActive = false;
      this.soundManager.stopBgm();
      const scoreResult = this.scoreManager.calculateFinalScore();

      this.time.delayedCall(800, () => {
        this.cameras.main.fadeOut(500, 15, 23, 42);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('CompleteScene', scoreResult);
        });
      });
    });

    // Player Died
    this.events.once('player-died', () => {
      this.isLevelActive = false;
      this.soundManager.stopBgm();
      this.scoreManager.saveHighScore();

      this.time.delayedCall(600, () => {
        this.cameras.main.fadeOut(500, 15, 23, 42);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameOverScene', this.scoreManager.getData());
        });
      });
    });

    // Request Pause
    this.events.on('request-pause', () => {
      this.pauseGame();
    });
  }

  public update(time: number, delta: number): void {
    if (!this.isLevelActive) return;

    // Check pause input
    this.inputManager.update();
    if (this.inputManager.isPauseJustPressed) {
      this.pauseGame();
      return;
    }

    // Update Player
    this.player.update(time, delta);

    // Update Enemies & Hazards
    this.levelObjects.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update();
      }
    });

    this.levelObjects.movingHazards.forEach((hazard) => {
      if (hazard.active) {
        hazard.update();
      }
    });

    // Camera lead ahead in direction of movement
    if (this.player.body.velocity.x > 30) {
      this.cameras.main.setFollowOffset(-60, 0);
    } else if (this.player.body.velocity.x < -30) {
      this.cameras.main.setFollowOffset(60, 0);
    }

    // Update Score Timer & HUD
    this.scoreManager.updateTime();
    this.hud.update(this.player.x);
  }

  private pauseGame(): void {
    this.scoreManager.pauseTimer();
    this.scene.pause();
    this.scene.launch('PauseScene');
  }
}
