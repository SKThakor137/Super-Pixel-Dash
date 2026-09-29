import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundManager } from '../systems/SoundManager';

export class MainMenuScene extends Phaser.Scene {
  private soundManager!: SoundManager;
  private scoreManager!: ScoreManager;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public create(): void {
    this.soundManager = SoundManager.getInstance();
    this.scoreManager = ScoreManager.getInstance();

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x0f172a, 0x1e1b4b, 0x1e1b4b, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Subtle background mountains
    const mtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'bg-mountains').setOrigin(0.5, 1).setAlpha(0.35);
    const hills = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT, 'bg-hills').setOrigin(0.5, 1).setAlpha(0.5);

    // Floating title
    const titleContainer = this.add.container(GAME_WIDTH / 2, 110);
    const title = this.add.text(0, 0, 'SUPER PIXEL DASH', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '32px',
      color: '#FFD166',
      stroke: '#0F172A',
      strokeThickness: 8,
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 42, 'A 2D RETRO PLATFORM ADVENTURE', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#38BDF8',
    }).setOrigin(0.5);

    titleContainer.add([title, subtitle]);

    this.tweens.add({
      targets: titleContainer,
      y: 118,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Animated character preview
    const charPreview = this.add.sprite(GAME_WIDTH / 2, 230, 'player');
    charPreview.setScale(3);
    charPreview.play('player-run');

    // Ground strip under player
    const groundStrip = this.add.graphics();
    groundStrip.fillStyle(0x22c55e, 1);
    groundStrip.fillRoundedRect(GAME_WIDTH / 2 - 140, 275, 280, 8, 4);

    // Best Score & Stars Panel
    const highScore = this.scoreManager.getHighScore();
    const bestStars = this.scoreManager.getBestStars();

    const scoreCard = this.add.text(
      GAME_WIDTH / 2,
      310,
      `🏆 BEST SCORE: ${highScore}  |  ★ BEST STARS: ${bestStars}/10`,
      {
        fontFamily: '"Press Start 2P", monospace, sans-serif',
        fontSize: '11px',
        color: '#FDE047',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);

    // Play Button
    const playBtn = this.createButton(GAME_WIDTH / 2, 380, 'PLAY ADVENTURE', 0x10b981, () => {
      this.soundManager.playClick();
      this.soundManager.startBgm();
      this.cameras.main.fadeOut(300, 15, 23, 42);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // Controls Guide box
    const controlsBox = this.add.graphics();
    controlsBox.fillStyle(0x1e293b, 0.7);
    controlsBox.fillRoundedRect(GAME_WIDTH / 2 - 280, 440, 560, 68, 10);
    controlsBox.lineStyle(1.5, 0x475569, 0.8);
    controlsBox.strokeRoundedRect(GAME_WIDTH / 2 - 280, 440, 560, 68, 10);

    const controlsTitle = this.add.text(GAME_WIDTH / 2, 455, '🎮 CONTROLS', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#94A3B8',
    }).setOrigin(0.5);

    const controlsDesktop = this.add.text(
      GAME_WIDTH / 2,
      480,
      'Desktop: A / D / Arrows = Move  •  Space / W / Up = Jump  •  ESC = Pause\nMobile: Use Virtual Touch Buttons on screen',
      {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '13px',
        fontStyle: '600',
        color: '#E2E8F0',
        align: 'center',
      }
    ).setOrigin(0.5);

    // Sound button top-right
    const soundToggle = this.add.text(GAME_WIDTH - 40, 30, this.soundManager.getIsMuted() ? '🔇' : '🔊', {
      fontSize: '24px',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    soundToggle.on('pointerdown', () => {
      const muted = this.soundManager.toggleMute();
      soundToggle.setText(muted ? '🔇' : '🔊');
    });
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
    bg.fillRoundedRect(-140, -25, 280, 50, 12);
    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeRoundedRect(-140, -25, 280, 50, 12);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    btn.add(label);

    const zone = this.add.zone(0, 0, 280, 50).setInteractive({ useHandCursor: true });
    btn.add(zone);

    zone.on('pointerover', () => {
      btn.setScale(1.05);
      bg.clear();
      bg.fillStyle(0x059669, 1);
      bg.fillRoundedRect(-140, -25, 280, 50, 12);
      bg.lineStyle(3, 0xffffff, 0.9);
      bg.strokeRoundedRect(-140, -25, 280, 50, 12);
    });

    zone.on('pointerout', () => {
      btn.setScale(1);
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-140, -25, 280, 50, 12);
      bg.lineStyle(2, 0xffffff, 0.5);
      bg.strokeRoundedRect(-140, -25, 280, 50, 12);
    });

    zone.on('pointerdown', onClick);

    return btn;
  }
}
