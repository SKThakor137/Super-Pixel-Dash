import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';

export class PauseScene extends Phaser.Scene {
  private soundManager!: SoundManager;

  constructor() {
    super({ key: 'PauseScene' });
  }

  public create(): void {
    this.soundManager = SoundManager.getInstance();

    // Dark overlay backdrop
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0f1d, 0.85);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Modal dialog box
    const modal = this.add.graphics();
    modal.fillStyle(0x1e293b, 0.95);
    modal.fillRoundedRect(GAME_WIDTH / 2 - 190, GAME_HEIGHT / 2 - 160, 380, 320, 16);
    modal.lineStyle(2, 0x475569, 1);
    modal.strokeRoundedRect(GAME_WIDTH / 2 - 190, GAME_HEIGHT / 2 - 160, 380, 320, 16);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 115, 'PAUSED', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '24px',
      color: '#FFD166',
    }).setOrigin(0.5);

    // Resume Button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'RESUME', 0x10b981, () => {
      this.resumeGame();
    });

    // Restart Button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 25, 'RESTART LEVEL', 0x3b82f6, () => {
      this.soundManager.playClick();
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
      this.soundManager.startBgm();
    });

    // Main Menu Button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'MAIN MENU', 0x64748b, () => {
      this.soundManager.playClick();
      this.soundManager.stopBgm();
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    });

    // Keyboard ESC or P to resume
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ESC', () => this.resumeGame());
      this.input.keyboard.once('keydown-P', () => this.resumeGame());
    }
  }

  private resumeGame(): void {
    this.soundManager.playClick();
    ScoreManager.getInstance().resumeTimer();
    this.scene.stop();
    this.scene.resume('GameScene');
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
