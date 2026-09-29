import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public create(): void {
    // Add dark background
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x101524).setOrigin(0);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'SUPER PIXEL DASH', {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '28px',
      color: '#FFD166',
      stroke: '#0F172A',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Loading indicator text
    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'READY!', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '18px',
      fontStyle: '600',
      color: '#4ADE80',
    }).setOrigin(0.5);

    // Cute animated preview sprite in center
    const previewPlayer = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'player');
    previewPlayer.setScale(2.5);
    previewPlayer.play('player-run');

    // Quick transition to MainMenuScene
    this.tweens.add({
      targets: [title, loadingText, previewPlayer],
      alpha: 0,
      delay: 500,
      duration: 350,
      onComplete: () => {
        this.scene.start('MainMenuScene');
      },
    });
  }
}
