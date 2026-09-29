import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { ScoreData, ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';

export class GameOverScene extends Phaser.Scene {
  private soundManager!: SoundManager;
  private scoreManager!: ScoreManager;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  public create(data: ScoreData): void {
    this.soundManager = SoundManager.getInstance();
    this.scoreManager = ScoreManager.getInstance();

    // Dark backdrop with subtle red vignette
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0f1d, 0x1a0f1d, 0x2d121e, 0x2d121e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Dialog card
    const card = this.add.graphics();
    card.fillStyle(0x1e293b, 0.95);
    card.fillRoundedRect(GAME_WIDTH / 2 - 210, GAME_HEIGHT / 2 - 180, 420, 360, 16);
    card.lineStyle(2, 0xef4444, 0.8);
    card.strokeRoundedRect(GAME_WIDTH / 2 - 210, GAME_HEIGHT / 2 - 180, 420, 360, 16);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 130, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '28px',
      color: '#EF4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Animated hurt hero
    const hurtHero = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, 'player', 8);
    hurtHero.setScale(2.5);

    // Stats display
    const finalScore = data?.score ?? 0;
    const highScore = this.scoreManager.getHighScore();
    const coins = data?.coins ?? 0;
    const stars = data?.stars ?? 0;

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 10,
      `SCORE: ${finalScore}\nHIGH SCORE: ${highScore}\nCOINS: ${coins}   STARS: ${stars}`,
      {
        fontFamily: '"Press Start 2P", monospace, sans-serif',
        fontSize: '11px',
        color: '#E2E8F0',
        align: 'center',
        lineSpacing: 12,
      }
    ).setOrigin(0.5);

    // Restart Button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 75, 'TRY AGAIN', 0x10b981, () => {
      this.soundManager.playClick();
      this.soundManager.startBgm();
      this.scene.start('GameScene');
    });

    // Main Menu Button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 135, 'MAIN MENU', 0x475569, () => {
      this.soundManager.playClick();
      this.scene.start('MainMenuScene');
    });

    this.cameras.main.fadeIn(400, 15, 23, 42);
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
    bg.fillRoundedRect(-120, -22, 240, 44, 10);
    bg.lineStyle(1.5, 0xffffff, 0.5);
    bg.strokeRoundedRect(-120, -22, 240, 44, 10);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '11px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    btn.add(label);

    const zone = this.add.zone(0, 0, 240, 44).setInteractive({ useHandCursor: true });
    btn.add(zone);

    zone.on('pointerover', () => btn.setScale(1.04));
    zone.on('pointerout', () => btn.setScale(1.0));
    zone.on('pointerdown', onClick);

    return btn;
  }
}
