import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const LEVEL_WIDTH = 8800;
export const LEVEL_HEIGHT = 700;

export const GAME_CONFIG = {
  PLAYER: {
    MAX_SPEED: 240,
    ACCELERATION: 1500,
    DRAG: 1300,
    JUMP_VELOCITY: -500,
    MAX_FALL_SPEED: 700,
    GRAVITY: 1100,
    COYOTE_TIME_MS: 120,
    JUMP_BUFFER_MS: 100,
    MAX_HEALTH: 3,
    INVULNERABLE_TIME_MS: 1500,
    BOUNCE_ON_ENEMY: -380,
  },
  ENEMY: {
    CRAWLER_SPEED: 85,
    FLYER_SPEED: 75,
    FLYER_AMPLITUDE: 45,
    FLYER_FREQUENCY: 0.003,
  },
  SCORING: {
    COIN_VALUE: 100,
    STAR_VALUE: 500,
    ENEMY_STOMP_VALUE: 300,
    TIME_BONUS_MULTIPLIER: 10,
  },
  STORAGE_KEYS: {
    HIGH_SCORE: 'pixel_dash_high_score',
    BEST_STARS: 'pixel_dash_best_stars',
    AUDIO_MUTED: 'pixel_dash_audio_muted',
  },
};

export const createPhaserConfig = (scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#101524',
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: GAME_CONFIG.PLAYER.GRAVITY },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    input: {
      activePointers: 3,
    },
    scene: scenes,
  };
};
