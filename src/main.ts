import Phaser from 'phaser';
import { createPhaserConfig } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';
import { CompleteScene } from './scenes/CompleteScene';

const config = createPhaserConfig([
  BootScene,
  PreloadScene,
  MainMenuScene,
  GameScene,
  PauseScene,
  GameOverScene,
  CompleteScene,
]);

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(config);
});
