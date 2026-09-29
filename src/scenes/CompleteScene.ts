import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';

export interface WinData {
  finalScore: number;
  timeBonus: number;
}

export class CompleteScene extends Phaser.Scene {
  private soundManager!: SoundManager;
  private scoreManager!: ScoreManager;

  constructor() {
    super({ key: 'CompleteScene' });
  }

  public create(data: WinData): void {
    this.soundManager = SoundManager.getInstance();
    this.scoreManager = ScoreManager.getInstance();

    const scoreData = this.scoreManager.getData();
    const finalScore = data?.finalScore ?? scoreData.score;
    const timeBonus = data?.timeBonus ?? 0;

    // Victory celebration background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x064e3b, 0x064e3b, 0x0f172a, 0x0f172a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Confetti shower
    this.spawnConfetti();

    // Celebration modal card
    const card = this.add.graphics();
    card.fillStyle(0x1e293b, 0.95);
    card.fillRoundedRect(GAME_WIDTH / 2 - 230, GAME_HEIGHT / 2 - 200, 460, 400, 16);
    card.lineStyle(2, 0x10b981, 0.9);
    card.strokeRoundedRect(GAME_WIDTH / 2 - 230, GAME_HEIGHT / 2 - 200, 460, 400, 16);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, 'LEVEL COMPLETE!', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '22px',
      color: '#34D399',
      stroke: '#064E3B',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Floating Hero with victory bounce
    const hero = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 95, 'player', 9);
    hero.setScale(2.6);
    this.tweens.add({
      targets: hero,
      y: hero.y - 12,
      duration: 350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Star Rating (1 to 3 stars based on collected)
    const starRatio = scoreData.stars / Math.max(1, scoreData.totalStars);
    const starRating = starRatio >= 0.8 ? 3 : starRatio >= 0.5 ? 2 : 1;

    for (let i = 0; i < 3; i++) {
      const sx = GAME_WIDTH / 2 - 40 + i * 40;
      const sy = GAME_HEIGHT / 2 - 35;
      const s = this.add.image(sx, sy, 'star');
      if (i < starRating) {
        s.setScale(1.3).setTint(0xffd54f);
        this.tweens.add({
          targets: s,
          scale: 1.5,
          duration: 300,
          delay: i * 200,
          yoyo: true,
        });
      } else {
        s.setScale(1.0).setTint(0x475569);
      }
    }

    // Stats breakdown
    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 35,
      `STARS COLLECTED: ${scoreData.stars} / ${scoreData.totalStars}\nTIME BONUS: +${timeBonus}\nFINAL SCORE: ${finalScore}\nHIGH SCORE: ${this.scoreManager.getHighScore()}`,
      {
        fontFamily: '"Press Start 2P", monospace, sans-serif',
        fontSize: '11px',
        color: '#F8FAFC',
        align: 'center',
        lineSpacing: 10,
      }
    ).setOrigin(0.5);

    // Play Again button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 115, 'PLAY AGAIN', 0x10b981, () => {
      this.soundManager.playClick();
      this.soundManager.startBgm();
      this.scene.start('GameScene');
    });

    // Main Menu button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 165, 'MAIN MENU', 0x475569, () => {
      this.soundManager.playClick();
      this.scene.start('MainMenuScene');
    });

    this.cameras.main.fadeIn(400, 15, 23, 42);
  }

  private spawnConfetti(): void {
    const colors = [0xff4081, 0x00e676, 0xffea00, 0x00e5ff, 0x7c4dff];
    for (let i = 0; i < 40; i++) {
      const rx = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const ry = Phaser.Math.Between(-100, -10);
      const conf = this.add.image(rx, ry, 'particle-confetti');
      conf.setTint(colors[i % colors.length]);
      conf.setScale(Phaser.Math.FloatBetween(1.2, 2.4));

      this.tweens.add({
        targets: conf,
        y: GAME_HEIGHT + 20,
        x: conf.x + Phaser.Math.Between(-60, 60),
        angle: Phaser.Math.Between(180, 720),
        duration: Phaser.Math.Between(2000, 3600),
        delay: Phaser.Math.Between(0, 1500),
        repeat: -1,
        ease: 'Linear',
      });
    }
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    bgColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-120, -18, 240, 38, 10);
    bg.lineStyle(1.5, 0xffffff, 0.5);
    bg.strokeRoundedRect(-120, -18, 240, 38, 10);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '11px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    btn.add(label);

    const zone = this.add.zone(0, 0, 240, 38).setInteractive({ useHandCursor: true });
    btn.add(zone);

    zone.on('pointerover', () => btn.setScale(1.04));
    zone.on('pointerout', () => btn.setScale(1.0));
    zone.on('pointerdown', onClick);

    return btn;
  }
}
