import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { InputManager } from '../systems/InputManager';

export class MobileControls {
  private scene: Phaser.Scene;
  private inputManager: InputManager;
  private container: Phaser.GameObjects.Container;
  private isTouchDevice: boolean = false;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(99);

    // Detect if the user is truly on a touch-capable mobile/tablet device
    this.isTouchDevice = this.detectTouchDevice();

    if (this.isTouchDevice) {
      this.createControls();
      this.container.setVisible(true);
    } else {
      // On desktop, keep on-screen buttons completely hidden
      this.container.setVisible(false);

      // If user touches screen at runtime (e.g. tablet mode or mobile emulation), activate controls
      this.scene.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.wasTouch) {
          this.isTouchDevice = true;
          this.createControls();
          this.container.setVisible(true);
          this.container.setAlpha(0);
          this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 250,
          });
        }
      });
    }
  }

  private detectTouchDevice(): boolean {
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    const isDesktopOS =
      this.scene.sys.game.device.os.desktop &&
      !window.matchMedia('(pointer: coarse)').matches;

    return Boolean(hasTouch && !isDesktopOS);
  }

  private createControls(): void {
    this.container.removeAll(true);

    // --- SLEEK D-PAD (BOTTOM-LEFT) ---
    // A modern dual-button pill controller for left / right navigation
    const dpadX = 30;
    const dpadY = GAME_HEIGHT - 80;
    const dpadW = 144;
    const dpadH = 64;
    const radius = 22;

    const dpadContainer = this.scene.add.container(dpadX, dpadY);

    // Frosted glass capsule background
    const dpadBg = this.scene.add.graphics();
    dpadBg.fillStyle(0x0f172a, 0.65);
    dpadBg.fillRoundedRect(0, 0, dpadW, dpadH, radius);
    dpadBg.lineStyle(2, 0x38bdf8, 0.5);
    dpadBg.strokeRoundedRect(0, 0, dpadW, dpadH, radius);
    dpadContainer.add(dpadBg);

    // Middle separator line
    const divider = this.scene.add.graphics();
    divider.lineStyle(1.5, 0x334155, 0.7);
    divider.lineBetween(dpadW / 2, 8, dpadW / 2, dpadH - 8);
    dpadContainer.add(divider);

    // Left Button Zone & Graphics
    const leftBtnGfx = this.scene.add.graphics();
    dpadContainer.add(leftBtnGfx);

    const leftArrow = this.scene.add.text(dpadW * 0.25, dpadH * 0.5, '◀', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '22px',
      color: '#38BDF8',
    }).setOrigin(0.5);
    dpadContainer.add(leftArrow);

    const leftZone = this.scene.add.zone(0, 0, dpadW / 2, dpadH).setOrigin(0, 0).setInteractive();
    dpadContainer.add(leftZone);

    leftZone.on('pointerdown', () => {
      this.inputManager.setMobileLeft(true);
      leftBtnGfx.clear();
      leftBtnGfx.fillStyle(0x0284c7, 0.45);
      leftBtnGfx.fillRoundedRect(3, 3, dpadW / 2 - 4, dpadH - 6, { tl: radius - 2, bl: radius - 2, tr: 4, br: 4 });
      leftArrow.setScale(0.88).setColor('#FFFFFF');
    });

    const resetLeft = () => {
      this.inputManager.setMobileLeft(false);
      leftBtnGfx.clear();
      leftArrow.setScale(1).setColor('#38BDF8');
    };
    leftZone.on('pointerup', resetLeft);
    leftZone.on('pointerout', resetLeft);
    leftZone.on('pointercancel', resetLeft);

    // Right Button Zone & Graphics
    const rightBtnGfx = this.scene.add.graphics();
    dpadContainer.add(rightBtnGfx);

    const rightArrow = this.scene.add.text(dpadW * 0.75, dpadH * 0.5, '▶', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '22px',
      color: '#38BDF8',
    }).setOrigin(0.5);
    dpadContainer.add(rightArrow);

    const rightZone = this.scene.add.zone(dpadW / 2, 0, dpadW / 2, dpadH).setOrigin(0, 0).setInteractive();
    dpadContainer.add(rightZone);

    rightZone.on('pointerdown', () => {
      this.inputManager.setMobileRight(true);
      rightBtnGfx.clear();
      rightBtnGfx.fillStyle(0x0284c7, 0.45);
      rightBtnGfx.fillRoundedRect(dpadW / 2 + 1, 3, dpadW / 2 - 4, dpadH - 6, { tr: radius - 2, br: radius - 2, tl: 4, bl: 4 });
      rightArrow.setScale(0.88).setColor('#FFFFFF');
    });

    const resetRight = () => {
      this.inputManager.setMobileRight(false);
      rightBtnGfx.clear();
      rightArrow.setScale(1).setColor('#38BDF8');
    };
    rightZone.on('pointerup', resetRight);
    rightZone.on('pointerout', resetRight);
    rightZone.on('pointercancel', resetRight);

    // --- SLEEK JUMP BUTTON (BOTTOM-RIGHT) ---
    // A modern round action button with emerald neon glow
    const jumpX = GAME_WIDTH - 65;
    const jumpY = GAME_HEIGHT - 48;
    const jumpRadius = 34;

    const jumpContainer = this.scene.add.container(jumpX, jumpY);

    const jumpBg = this.scene.add.graphics();
    const drawJumpBg = (pressed: boolean) => {
      jumpBg.clear();
      // Outer glow / body
      jumpBg.fillStyle(pressed ? 0x059669 : 0x064e3b, pressed ? 0.85 : 0.65);
      jumpBg.fillCircle(0, 0, jumpRadius);
      // Border ring
      jumpBg.lineStyle(2.5, pressed ? 0x6ee7b7 : 0x10b981, pressed ? 0.95 : 0.7);
      jumpBg.strokeCircle(0, 0, jumpRadius);
      // Subtle inner ring
      jumpBg.lineStyle(1, 0xffffff, pressed ? 0.4 : 0.2);
      jumpBg.strokeCircle(0, 0, jumpRadius - 5);
    };
    drawJumpBg(false);
    jumpContainer.add(jumpBg);

    // Jump Icon: Crisp upward arrow + subtle label
    const jumpIcon = this.scene.add.text(0, -6, '▲', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#34D399',
    }).setOrigin(0.5);

    const jumpLabel = this.addPixelLabel(0, 12, 'JUMP', '#A7F3D0');
    jumpContainer.add([jumpIcon, jumpLabel]);

    const jumpZone = this.scene.add.zone(0, 0, jumpRadius * 2.2, jumpRadius * 2.2).setInteractive();
    jumpContainer.add(jumpZone);

    jumpZone.on('pointerdown', () => {
      this.inputManager.setMobileJump(true);
      jumpContainer.setScale(0.92);
      drawJumpBg(true);
      jumpIcon.setColor('#FFFFFF');
    });

    const resetJump = () => {
      this.inputManager.setMobileJump(false);
      jumpContainer.setScale(1);
      drawJumpBg(false);
      jumpIcon.setColor('#34D399');
    };
    jumpZone.on('pointerup', resetJump);
    jumpZone.on('pointerout', resetJump);
    jumpZone.on('pointercancel', resetJump);

    this.container.add([dpadContainer, jumpContainer]);
  }

  private addPixelLabel(x: number, y: number, text: string, color: string): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace, sans-serif',
      fontSize: '7px',
      color: color,
    }).setOrigin(0.5);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
