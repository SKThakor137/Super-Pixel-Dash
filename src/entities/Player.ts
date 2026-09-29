import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { InputManager } from '../systems/InputManager';
import { SoundManager } from '../systems/SoundManager';
import { ScoreManager } from '../systems/ScoreManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;

  private inputManager: InputManager;
  private soundManager: SoundManager;
  private scoreManager: ScoreManager;

  // Jump feel helpers
  private coyoteTimer: number = 0;
  private isGrounded: boolean = false;
  private wasGrounded: boolean = false;
  private isInvulnerable: boolean = false;
  private isDead: boolean = false;
  private isVictorious: boolean = false;

  // Squash & Stretch
  private squashTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, inputManager: InputManager) {
    super(scene, x, y, 'player', 0);

    this.inputManager = inputManager;
    this.soundManager = SoundManager.getInstance();
    this.scoreManager = ScoreManager.getInstance();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup Physics
    this.setCollideWorldBounds(false); // World bounds handled by level width / death pit
    this.body.setSize(18, 24);
    this.body.setOffset(7, 8);
    this.body.setMaxVelocity(GAME_CONFIG.PLAYER.MAX_SPEED, GAME_CONFIG.PLAYER.MAX_FALL_SPEED);
    this.body.setDragX(GAME_CONFIG.PLAYER.DRAG);

    this.play('player-idle');
  }

  public update(time: number, delta: number): void {
    if (this.isDead || this.isVictorious) {
      return;
    }

    this.wasGrounded = this.isGrounded;
    this.isGrounded = this.body.blocked.down || this.body.touching.down;

    // Coyote time tracking
    if (this.isGrounded) {
      this.coyoteTimer = GAME_CONFIG.PLAYER.COYOTE_TIME_MS;
      if (!this.wasGrounded) {
        // Just landed!
        this.onLand();
      }
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    // Horizontal Movement
    this.handleHorizontalMovement();

    // Vertical Movement & Jump
    this.handleJump();

    // Variable jump height (cut jump short if player releases button early)
    if (!this.inputManager.isJumpHeld && this.body.velocity.y < -150) {
      this.body.setVelocityY(this.body.velocity.y * 0.55);
    }

    // Update animations based on state
    this.updateAnimations();

    // Check pit fall
    if (this.y > 680 && !this.isDead) {
      this.die();
    }
  }

  private handleHorizontalMovement(): void {
    const isLeft = this.inputManager.isLeft;
    const isRight = this.inputManager.isRight;

    if (isLeft && !isRight) {
      this.body.setAccelerationX(-GAME_CONFIG.PLAYER.ACCELERATION);
      this.setFlipX(true);
      // Offset physics body when flipped if needed
      this.body.setOffset(7, 8);
    } else if (isRight && !isLeft) {
      this.body.setAccelerationX(GAME_CONFIG.PLAYER.ACCELERATION);
      this.setFlipX(false);
      this.body.setOffset(7, 8);
    } else {
      this.body.setAccelerationX(0);
    }
  }

  private handleJump(): void {
    const canJump = this.coyoteTimer > 0;
    const wantsJump = this.inputManager.isJumpBuffered;

    if (canJump && wantsJump) {
      // Execute jump!
      this.body.setVelocityY(GAME_CONFIG.PLAYER.JUMP_VELOCITY);
      this.coyoteTimer = 0;
      this.inputManager.consumeJumpBuffer();
      this.soundManager.playJump();

      // Jump squash & stretch (stretch vertically)
      this.triggerSquashStretch(0.75, 1.25, 120);

      // Create dust puff particles
      this.emitDust();
    }
  }

  private onLand(): void {
    // Land squash & stretch (squash horizontally)
    this.triggerSquashStretch(1.25, 0.75, 120);
    this.emitDust();
  }

  private triggerSquashStretch(sx: number, sy: number, duration: number): void {
    if (this.squashTween) {
      this.squashTween.stop();
    }
    this.setScale(sx, sy);
    this.squashTween = this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: duration,
      ease: 'Back.easeOut',
    });
  }

  private emitDust(): void {
    const dust = this.scene.add.image(this.x, this.y + 12, 'particle-dust');
    dust.setAlpha(0.8).setScale(0.8);
    this.scene.tweens.add({
      targets: dust,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      y: dust.y - 6,
      duration: 250,
      onComplete: () => dust.destroy(),
    });
  }

  private updateAnimations(): void {
    if (this.isInvulnerable) {
      // Blinking effect
      this.setAlpha(Math.floor(this.scene.time.now / 100) % 2 === 0 ? 0.4 : 1);
    } else {
      this.setAlpha(1);
    }

    if (!this.isGrounded) {
      if (this.body.velocity.y < -30) {
        if (this.anims.currentAnim?.key !== 'player-jump') {
          this.play('player-jump');
        }
      } else if (this.body.velocity.y > 30) {
        if (this.anims.currentAnim?.key !== 'player-fall') {
          this.play('player-fall');
        }
      }
    } else {
      if (Math.abs(this.body.velocity.x) > 20) {
        if (this.anims.currentAnim?.key !== 'player-run') {
          this.play('player-run');
        }
      } else {
        if (this.anims.currentAnim?.key !== 'player-idle') {
          this.play('player-idle');
        }
      }
    }
  }

  public bounce(velocity: number = GAME_CONFIG.PLAYER.BOUNCE_ON_ENEMY): void {
    this.body.setVelocityY(velocity);
    this.soundManager.playStomp();
    this.triggerSquashStretch(0.8, 1.25, 120);
  }

  public takeDamage(hazardSourceX?: number): boolean {
    if (this.isInvulnerable || this.isDead || this.isVictorious) {
      return false;
    }

    const remainingHealth = this.scoreManager.takeDamage();
    this.soundManager.playHurt();

    // Flash red
    this.setTint(0xff5252);
    this.scene.time.delayedCall(160, () => this.clearTint());

    // Camera shake
    this.scene.cameras.main.shake(180, 0.015);

    if (remainingHealth <= 0) {
      this.die();
      return true;
    }

    // Knockback
    this.isInvulnerable = true;
    const knockDir = hazardSourceX !== undefined ? (this.x < hazardSourceX ? -1 : 1) : -1;
    this.body.setVelocity(knockDir * 180, -260);

    // End invulnerability after timer
    this.scene.time.delayedCall(GAME_CONFIG.PLAYER.INVULNERABLE_TIME_MS, () => {
      this.isInvulnerable = false;
      this.setAlpha(1);
    });

    return false;
  }

  public die(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.soundManager.playGameOver();
    this.play('player-hurt');
    this.body.setVelocity(0, -320);
    this.body.setAcceleration(0, 0);
    this.body.checkCollision.none = true;

    // Spin and drop
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 1000,
    });

    this.scene.time.delayedCall(1200, () => {
      this.scene.events.emit('player-died');
    });
  }

  public victory(): void {
    if (this.isVictorious) return;
    this.isVictorious = true;
    this.body.setVelocity(0, 0);
    this.body.setAcceleration(0, 0);
    this.play('player-won');
    this.soundManager.playVictory();

    // Little jump for joy
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      duration: 250,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.scene.events.emit('player-won');
      },
    });
  }

  public getIsDead(): boolean {
    return this.isDead;
  }

  public getIsVictorious(): boolean {
    return this.isVictorious;
  }
}
