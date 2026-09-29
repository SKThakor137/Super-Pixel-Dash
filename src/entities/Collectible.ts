import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';

export abstract class Collectible extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;
  protected isCollected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
  }

  public abstract collect(): void;

  public getIsCollected(): boolean {
    return this.isCollected;
  }

  protected spawnFloatText(text: string, color: string): void {
    const floatText = this.scene.add.text(this.x, this.y - 10, text, {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '12px',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 30,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy(),
    });
  }
}

export class Coin extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin', 0);
    this.body.setCircle(9, 1, 1);
    this.play('coin-spin');

    // Subtle floating bob
    scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: 900 + Math.random() * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;

    ScoreManager.getInstance().addCoin();
    SoundManager.getInstance().playCoin();

    this.spawnFloatText('+100', '#FFD54F');
    this.spawnSparkles(0xffd54f, 4);

    this.destroy();
  }

  private spawnSparkles(tint: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle-sparkle');
      p.setTint(tint);
      const angle = (i / count) * Math.PI * 2;
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * 22,
        y: p.y + Math.sin(angle) * 22,
        alpha: 0,
        scale: 0.1,
        duration: 250,
        onComplete: () => p.destroy(),
      });
    }
  }
}

export class Star extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'star');
    this.body.setCircle(12, 2, 2);

    // Star pulsing & bobbing
    scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;

    ScoreManager.getInstance().addStar();
    SoundManager.getInstance().playStar();

    this.spawnFloatText('+500 ★', '#FFEB3B');
    this.spawnStarBurst();

    this.destroy();
  }

  private spawnStarBurst(): void {
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle-sparkle');
      p.setTint(0xffeb3b);
      const angle = (i / 8) * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 50);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * dist,
        y: p.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 400,
        onComplete: () => p.destroy(),
      });
    }
  }
}

export class HeartPickup extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'heart');
    this.body.setCircle(8, 2, 2);

    scene.tweens.add({
      targets: this,
      y: y - 6,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;

    ScoreManager.getInstance().heal(1);
    SoundManager.getInstance().playCoin();

    this.spawnFloatText('+1 HP ❤️', '#FF4081');
    this.destroy();
  }
}
