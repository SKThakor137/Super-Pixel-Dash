import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export class InputManager {
  private scene: Phaser.Scene;

  // Keyboard keys
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private keyP!: Phaser.Input.Keyboard.Key;

  // Mobile virtual inputs
  private mobileLeft: boolean = false;
  private mobileRight: boolean = false;
  private mobileJump: boolean = false;
  private mobileJumpJustPressed: boolean = false;

  // Jump buffering
  private lastJumpPressTime: number = -9999;
  private wasJumpDown: boolean = false;
  private wasPauseDown: boolean = false;
  private pauseTriggered: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initKeyboard();
  }

  private initKeyboard(): void {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEsc = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyP = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }

  public update(): void {
    const isJumpKeyDown =
      (this.cursors?.up?.isDown ?? false) ||
      (this.keyW?.isDown ?? false) ||
      (this.keySpace?.isDown ?? false) ||
      this.mobileJump;

    // Detect jump key down edge
    if (isJumpKeyDown && !this.wasJumpDown) {
      this.lastJumpPressTime = this.scene.time.now;
      this.mobileJumpJustPressed = true;
    } else {
      this.mobileJumpJustPressed = false;
    }
    this.wasJumpDown = isJumpKeyDown;

    // Detect pause key down edge
    const isPauseKeyDown = (this.keyEsc?.isDown ?? false) || (this.keyP?.isDown ?? false);
    if (isPauseKeyDown && !this.wasPauseDown) {
      this.pauseTriggered = true;
    } else {
      this.pauseTriggered = false;
    }
    this.wasPauseDown = isPauseKeyDown;
  }

  public get isLeft(): boolean {
    const keyLeft = (this.cursors?.left?.isDown ?? false) || (this.keyA?.isDown ?? false);
    return keyLeft || this.mobileLeft;
  }

  public get isRight(): boolean {
    const keyRight = (this.cursors?.right?.isDown ?? false) || (this.keyD?.isDown ?? false);
    return keyRight || this.mobileRight;
  }

  public get isJumpHeld(): boolean {
    return this.wasJumpDown;
  }

  public get isJumpBuffered(): boolean {
    return this.scene.time.now - this.lastJumpPressTime <= GAME_CONFIG.PLAYER.JUMP_BUFFER_MS;
  }

  public consumeJumpBuffer(): void {
    this.lastJumpPressTime = -9999;
  }

  public get isPauseJustPressed(): boolean {
    return this.pauseTriggered;
  }

  // Mobile control hooks
  public setMobileLeft(down: boolean): void {
    this.mobileLeft = down;
  }

  public setMobileRight(down: boolean): void {
    this.mobileRight = down;
  }

  public setMobileJump(down: boolean): void {
    this.mobileJump = down;
  }
}
