import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;
  protected isDefeated: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public abstract defeat(): void;

  public getIsDefeated(): boolean {
    return this.isDefeated;
  }
}

export class CrawlerEnemy extends Enemy {
  private patrolMinX: number;
  private patrolMaxX: number;
  private moveSpeed: number = GAME_CONFIG.ENEMY.CRAWLER_SPEED;
  private direction: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance: number = 140) {
    super(scene, x, y, 'enemy-crawler', 0);

    this.patrolMinX = x - patrolDistance / 2;
    this.patrolMaxX = x + patrolDistance / 2;

    this.body.setSize(22, 16);
    this.body.setOffset(5, 8);
    this.body.setCollideWorldBounds(false);

    this.play('crawler-walk');
    this.body.setVelocityX(this.moveSpeed * this.direction);
  }

  public update(): void {
    if (this.isDefeated) return;

    // Check bounds & flip direction
    if (this.x >= this.patrolMaxX && this.direction > 0) {
      this.direction = -1;
      this.body.setVelocityX(this.moveSpeed * this.direction);
      this.setFlipX(true);
    } else if (this.x <= this.patrolMinX && this.direction < 0) {
      this.direction = 1;
      this.body.setVelocityX(this.moveSpeed * this.direction);
      this.setFlipX(false);
    } else if (this.body.blocked.left && this.direction < 0) {
      this.direction = 1;
      this.body.setVelocityX(this.moveSpeed * this.direction);
      this.setFlipX(false);
    } else if (this.body.blocked.right && this.direction > 0) {
      this.direction = -1;
      this.body.setVelocityX(this.moveSpeed * this.direction);
      this.setFlipX(true);
    }
  }

  public defeat(): void {
    if (this.isDefeated) return;
    this.isDefeated = true;

    ScoreManager.getInstance().addEnemyStomp();

    // Disable physics
    this.body.setVelocity(0, 0);
    this.body.checkCollision.none = true;

    // Squish animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 0.25,
      y: this.y + 8,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        this.spawnDefeatParticles();
        this.destroy();
      },
    });
  }

  private spawnDefeatParticles(): void {
    for (let i = 0; i < 5; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle-sparkle');
      p.setTint(0xff4081);
      const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
      const dist = Phaser.Math.Between(20, 45);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * dist,
        y: p.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 300,
        onComplete: () => p.destroy(),
      });
    }
  }
}

export class FlyerEnemy extends Enemy {
  private startY: number;
  private patrolMinX: number;
  private patrolMaxX: number;
  private moveSpeed: number = GAME_CONFIG.ENEMY.FLYER_SPEED;
  private direction: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance: number = 160) {
    super(scene, x, y, 'enemy-flyer', 0);

    this.startY = y;
    this.patrolMinX = x - patrolDistance / 2;
    this.patrolMaxX = x + patrolDistance / 2;

    this.body.setSize(20, 20);
    this.body.setOffset(6, 6);
    this.body.setAllowGravity(false);

    this.play('flyer-fly');
    this.body.setVelocityX(this.moveSpeed * this.direction);
  }

  public update(): void {
    if (this.isDefeated) return;

    // Horizontal patrol
    if (this.x >= this.patrolMaxX && this.direction > 0) {
      this.direction = -1;
      this.body.setVelocityX(this.moveSpeed * this.direction);
      this.setFlipX(true);
    } else if (this.x <= this.patrolMinX && this.direction < 0) {
      this.direction = 1;
      this.body.setVelocityX(this.moveSpeed * this.direction);
      this.setFlipX(false);
    }

    // Vertical sine wave hovering
    const time = this.scene.time.now;
    this.y = this.startY + Math.sin(time * GAME_CONFIG.ENEMY.FLYER_FREQUENCY) * GAME_CONFIG.ENEMY.FLYER_AMPLITUDE;
  }

  public defeat(): void {
    if (this.isDefeated) return;
    this.isDefeated = true;

    ScoreManager.getInstance().addEnemyStomp();

    this.body.setVelocity(0, 0);
    this.body.checkCollision.none = true;

    // Drop and fade out
    this.scene.tweens.add({
      targets: this,
      y: this.y + 60,
      angle: 180,
      alpha: 0,
      duration: 350,
      onComplete: () => this.destroy(),
    });
  }
}

export class MovingHazard extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;
  private moveMin: number;
  private moveMax: number;
  private isVertical: boolean;
  private speed: number;
  private direction: number = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    distance: number = 120,
    isVertical: boolean = false,
    speed: number = 90
  ) {
    super(scene, x, y, 'saw');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.isVertical = isVertical;
    this.speed = speed;
    this.body.setAllowGravity(false);
    this.body.setCircle(14, 4, 4);

    if (isVertical) {
      this.moveMin = y - distance / 2;
      this.moveMax = y + distance / 2;
      this.body.setVelocityY(this.speed * this.direction);
    } else {
      this.moveMin = x - distance / 2;
      this.moveMax = x + distance / 2;
      this.body.setVelocityX(this.speed * this.direction);
    }
  }

  public update(): void {
    this.angle += 8; // Constant rotation

    if (this.isVertical) {
      if (this.y >= this.moveMax && this.direction > 0) {
        this.direction = -1;
        this.body.setVelocityY(this.speed * this.direction);
      } else if (this.y <= this.moveMin && this.direction < 0) {
        this.direction = 1;
        this.body.setVelocityY(this.speed * this.direction);
      }
    } else {
      if (this.x >= this.moveMax && this.direction > 0) {
        this.direction = -1;
        this.body.setVelocityX(this.speed * this.direction);
      } else if (this.x <= this.moveMin && this.direction < 0) {
        this.direction = 1;
        this.body.setVelocityX(this.speed * this.direction);
      }
    }
  }
}
