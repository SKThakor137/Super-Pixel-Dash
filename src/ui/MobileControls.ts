import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { InputManager } from '../systems/InputManager';

export class MobileControls {
  private scene: Phaser.Scene;
  private inputManager: InputManager;
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(99);

    this.createControls();
  }

  private createControls(): void {
    // Only show or style touch controls; create large comfortable touch targets
    const btnRadius = 36;
    const padding = 20;

    // --- LEFT BUTTON ---
    const leftX = padding + btnRadius;
    const leftY = GAME_HEIGHT - padding - btnRadius;
    const leftBtn = this.createButton(leftX, leftY, btnRadius, '◀', () => {
      this.inputManager.setMobileLeft(true);
    }, () => {
      this.inputManager.setMobileLeft(false);
    });

    // --- RIGHT BUTTON ---
    const rightX = leftX + btnRadius * 2 + 16;
    const rightY = leftY;
    const rightBtn = this.createButton(rightX, rightY, btnRadius, '▶', () => {
      this.inputManager.setMobileRight(true);
    }, () => {
      this.inputManager.setMobileRight(false);
    });

    // --- JUMP BUTTON ---
    const jumpRadius = 42;
    const jumpX = GAME_WIDTH - padding - jumpRadius;
    const jumpY = GAME_HEIGHT - padding - jumpRadius;
    const jumpBtn = this.createButton(jumpX, jumpY, jumpRadius, 'JUMP', () => {
      this.inputManager.setMobileJump(true);
    }, () => {
      this.inputManager.setMobileJump(false);
    }, 0x10b981);

    this.container.add([leftBtn, rightBtn, jumpBtn]);

    // On non-touch desktop devices, keep controls slightly semi-transparent so they don't obstruct view
    const isTouch = this.scene.sys.game.device.input.touch;
    this.container.setAlpha(isTouch ? 0.85 : 0.45);
  }

  private createButton(
    x: number,
    y: number,
    radius: number,
    label: string,
    onDown: () => void,
    onUp: () => void,
    bgColor: number = 0x334155
  ): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColor, 0.7);
    bg.fillCircle(0, 0, radius);
    bg.lineStyle(3, 0xffffff, 0.4);
    bg.strokeCircle(0, 0, radius);
    btnContainer.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      fontFamily: '"Outfit", sans-serif',
      fontSize: label.length > 2 ? '14px' : '22px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    btnContainer.add(text);

    // Hit area circle
    const hitArea = this.scene.add.zone(0, 0, radius * 2, radius * 2);
    hitArea.setCircleDropZone(radius);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      btnContainer.setScale(0.92);
      bg.clear();
      bg.fillStyle(0x3b82f6, 0.9);
      bg.fillCircle(0, 0, radius);
      bg.lineStyle(3, 0xffffff, 0.9);
      bg.strokeCircle(0, 0, radius);
      onDown();
    });

    const resetBtn = () => {
      btnContainer.setScale(1.0);
      bg.clear();
      bg.fillStyle(bgColor, 0.7);
      bg.fillCircle(0, 0, radius);
      bg.lineStyle(3, 0xffffff, 0.4);
      bg.strokeCircle(0, 0, radius);
      onUp();
    };

    hitArea.on('pointerup', resetBtn);
    hitArea.on('pointerout', resetBtn);
    hitArea.on('pointercancel', resetBtn);

    btnContainer.add(hitArea);
    return btnContainer;
  }

  public destroy(): void {
    this.container.destroy();
  }
}
