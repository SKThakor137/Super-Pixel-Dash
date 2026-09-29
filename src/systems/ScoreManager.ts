import { GAME_CONFIG } from '../config/gameConfig';

export interface ScoreData {
  score: number;
  coins: number;
  stars: number;
  totalStars: number;
  health: number;
  maxHealth: number;
  timeElapsed: number;
  highScore: number;
  bestStars: number;
}

export class ScoreManager {
  private static instance: ScoreManager;

  private score: number = 0;
  private coins: number = 0;
  private stars: number = 0;
  private totalStars: number = 0;
  private health: number = GAME_CONFIG.PLAYER.MAX_HEALTH;
  private startTime: number = 0;
  private timeElapsed: number = 0;
  private isTimerRunning: boolean = false;

  private constructor() {}

  public static getInstance(): ScoreManager {
    if (!ScoreManager.instance) {
      ScoreManager.instance = new ScoreManager();
    }
    return ScoreManager.instance;
  }

  public reset(totalStarsInLevel: number = 10): void {
    this.score = 0;
    this.coins = 0;
    this.stars = 0;
    this.totalStars = totalStarsInLevel;
    this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.startTime = Date.now();
    this.timeElapsed = 0;
    this.isTimerRunning = true;
  }

  public updateTime(): void {
    if (this.isTimerRunning) {
      this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    }
  }

  public pauseTimer(): void {
    this.isTimerRunning = false;
  }

  public resumeTimer(): void {
    if (!this.isTimerRunning) {
      this.startTime = Date.now() - this.timeElapsed * 1000;
      this.isTimerRunning = true;
    }
  }

  public addCoin(): number {
    this.coins++;
    this.score += GAME_CONFIG.SCORING.COIN_VALUE;
    return this.score;
  }

  public addStar(): number {
    this.stars++;
    this.score += GAME_CONFIG.SCORING.STAR_VALUE;
    return this.score;
  }

  public addEnemyStomp(): number {
    this.score += GAME_CONFIG.SCORING.ENEMY_STOMP_VALUE;
    return this.score;
  }

  public takeDamage(): number {
    this.health = Math.max(0, this.health - 1);
    return this.health;
  }

  public heal(amount: number = 1): number {
    this.health = Math.min(GAME_CONFIG.PLAYER.MAX_HEALTH, this.health + amount);
    return this.health;
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  public calculateFinalScore(): { finalScore: number; timeBonus: number } {
    this.pauseTimer();
    // Faster completion yields higher bonus (base 180s target)
    const targetTime = 240;
    const timeBonus = Math.max(0, (targetTime - this.timeElapsed) * GAME_CONFIG.SCORING.TIME_BONUS_MULTIPLIER);
    const finalScore = this.score + timeBonus;

    this.saveHighScore(finalScore);
    this.saveBestStars(this.stars);

    return { finalScore, timeBonus };
  }

  public getHighScore(): number {
    const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE);
    return saved ? parseInt(saved, 10) : 0;
  }

  public saveHighScore(scoreToSave?: number): number {
    const target = scoreToSave !== undefined ? scoreToSave : this.score;
    const currentHigh = this.getHighScore();
    if (target > currentHigh) {
      localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE, String(target));
      return target;
    }
    return currentHigh;
  }

  public getBestStars(): number {
    const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEYS.BEST_STARS);
    return saved ? parseInt(saved, 10) : 0;
  }

  public saveBestStars(starsToSave?: number): number {
    const target = starsToSave !== undefined ? starsToSave : this.stars;
    const currentBest = this.getBestStars();
    if (target > currentBest) {
      localStorage.setItem(GAME_CONFIG.STORAGE_KEYS.BEST_STARS, String(target));
      return target;
    }
    return currentBest;
  }

  public getData(): ScoreData {
    return {
      score: this.score,
      coins: this.coins,
      stars: this.stars,
      totalStars: this.totalStars,
      health: this.health,
      maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
      timeElapsed: this.timeElapsed,
      highScore: this.getHighScore(),
      bestStars: this.getBestStars(),
    };
  }
}
