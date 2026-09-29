import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';

export class HUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private scoreManager: ScoreManager;
  private soundManager: SoundManager;

  // UI Elements
  private scoreText!: Phaser.GameObjects.Text;
  private starText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];
  private progressBarBg!: Phaser.GameObjects.Graphics;
  private progressBarFill!: Phaser.GameObjects.Graphics;
  private progressMarker!: Phaser.GameObjects.Graphics;
  private soundBtnText!: Phaser.GameObjects.Text;
  private pauseBtnText!: Phaser.GameObjects.Text;

  private totalLevelWidth: number;

  constructor(scene: Phaser.Scene, totalLevelWidth: number) {
    this.scene = scene;
    this.totalLevelWidth = totalLevelWidth;
    this.scoreManager = ScoreManager.getInstance();
    this.soundManager = SoundManager.getInstance();
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    this.createElements();
  }

  private createElements(): void {
    // 1. Top HUD bar backdrop
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x0f172a, 0.75);
    barBg.fillRoundedRect(12, 10, GAME_WIDTH - 24, 46, 12);
    barBg.lineStyle(2, 0x334155, 0.8);
    barBg.strokeRoundedRect(12, 10, GAME_WIDTH - 24, 46, 12);
    this.container.add(barBg);

    // 2. Score & Coins (Top-Left)
    const coinIcon = this.scene.add.sprite(32, 33, 'coin', 0).setScale(1.2);
    coinIcon.play('coin-spin');
    this.container.add(coinIcon);

    this.scoreText = this.scene.add.text(50, 24, 'SCORE 00000', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '13px',
      color: '#FFD166',
    });
    this.container.add(this.scoreText);

    // 3. Stars (Next to Score)
    const starIcon = this.scene.add.image(215, 33, 'star').setScale(0.85);
    this.container.add(starIcon);

    this.starText = this.scene.add.text(232, 24, '0/10', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '13px',
      color: '#FACC15',
    });
    this.container.add(this.starText);

    // 4. Health Hearts (Center-Left)
    for (let i = 0; i < 3; i++) {
      const heart = this.scene.add.image(310 + i * 26, 33, 'heart').setScale(1.2);
      this.hearts.push(heart);
      this.container.add(heart);
    }

    // 5. Level Progress Bar (Center)
    const progressX = 420;
    const progressY = 26;
    const progressW = 200;
    const progressH = 14;

    this.progressBarBg = this.scene.add.graphics();
    this.progressBarBg.fillStyle(0x1e293b, 0.9);
    this.progressBarBg.fillRoundedRect(progressX, progressY, progressW, progressH, 6);
    this.progressBarBg.lineStyle(1.5, 0x475569, 1);
    this.progressBarBg.strokeRoundedRect(progressX, progressY, progressW, progressH, 6);
    this.container.add(this.progressBarBg);

    this.progressBarFill = this.scene.add.graphics();
    this.container.add(this.progressBarFill);

    // Runner icon on progress bar
    this.progressMarker = this.scene.add.graphics();
    this.progressMarker.fillStyle(0x1bc4b0, 1);
    this.progressMarker.fillCircle(0, 0, 7);
    this.progressMarker.lineStyle(2, 0xffffff, 1);
    this.progressMarker.strokeCircle(0, 0, 7);
    this.progressMarker.setPosition(progressX + 7, progressY + 7);
    this.container.add(this.progressMarker);

    // Flag icon at end of progress bar
    const flagMini = this.scene.add.image(progressX + progressW + 14, progressY + 7, 'finish-flag').setScale(0.35);
    this.container.add(flagMini);

    // 6. Sound Toggle Button (Top-Right)
    const soundX = GAME_WIDTH - 150;
    const soundBg = this.scene.add.graphics();
    soundBg.fillStyle(0x1e293b, 0.8);
    soundBg.fillRoundedRect(soundX - 10, 16, 54, 34, 8);
    this.container.add(soundBg);

    this.soundBtnText = this.scene.add.text(soundX + 17, 33, this.soundManager.getIsMuted() ? '🔇' : '🔊', {
      fontSize: '18px',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundBtnText.on('pointerdown', () => {
      const muted = this.soundManager.toggleMute();
      this.soundBtnText.setText(muted ? '🔇' : '🔊');
      this.soundManager.playClick();
    });
    this.container.add(this.soundBtnText);

    // 7. Pause Button (Top-Right)
    const pauseX = GAME_WIDTH - 75;
    const pauseBg = this.scene.add.graphics();
    pauseBg.fillStyle(0xef4444, 0.85);
    pauseBg.fillRoundedRect(pauseX - 12, 16, 62, 34, 8);
    pauseBg.lineStyle(1.5, 0xfca5a5, 0.7);
    pauseBg.strokeRoundedRect(pauseX - 12, 16, 62, 34, 8);
    this.container.add(pauseBg);

    this.pauseBtnText = this.scene.add.text(pauseX + 19, 33, 'PAUSE', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '9px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.pauseBtnText.on('pointerdown', () => {
      this.soundManager.playClick();
      this.scene.events.emit('request-pause');
    });
    this.container.add(this.pauseBtnText);
  }

  public update(playerX: number): void {
    const data = this.scoreManager.getData();

    // Update score
    const scoreFormatted = data.score.toString().padStart(5, '0');
    this.scoreText.setText(`SCORE ${scoreFormatted}`);

    // Update stars
    this.starText.setText(`${data.stars}/${data.totalStars}`);

    // Update hearts
    for (let i = 0; i < 3; i++) {
      if (i < data.health) {
        this.hearts[i].setAlpha(1).setScale(1.2);
      } else {
        this.hearts[i].setAlpha(0.25).setScale(0.9);
      }
    }

    // Update progress bar
    const progressX = 420;
    const progressY = 26;
    const progressW = 200;
    const progressH = 14;

    const ratio = Phaser.Math.Clamp(playerX / (this.totalLevelWidth - 300), 0, 1);
    const fillWidth = Math.max(0, ratio * (progressW - 4));

    this.progressBarFill.clear();
    this.progressBarFill.fillStyle(0x10b981, 1);
    this.progressBarFill.fillRoundedRect(progressX + 2, progressY + 2, fillWidth, progressH - 4, 4);

    this.progressMarker.setPosition(progressX + 7 + ratio * (progressW - 14), progressY + 7);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
