import { Component, OnDestroy } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FightService } from '../../core/services/fight.service';
import { Fighter } from '../../core/models/fighter.model';

export type GameState = 'menu' | 'fighter-selection' | 'countdown' | 'playing' | 'game-over';
export type EnemyAction = 'punch' | 'kick' | 'takedown';

const actionResponses: Record<EnemyAction, string> = {
  punch: 'dodge',
  kick: 'block',
  takedown: 'defend',
};

const actionLabels: Record<EnemyAction, string> = {
  punch: 'Golpe',
  kick: 'Patada',
  takedown: 'Llevada',
};

const responseButtons = [
  { value: 'dodge', label: 'ESQUIVAR' },
  { value: 'block', label: 'BLOQUEAR' },
  { value: 'defend', label: 'DEFENDER' },
];

@Component({
  standalone: true,
  selector: 'app-game',
  imports: [NgIf, NgForOf, RouterLink],
  templateUrl: './game.html',
  styleUrls: ['./game.css'],
})
export class Game implements OnDestroy {
  gameState: GameState = 'menu';
  fighters: Fighter[] = [];
  decorativeFighter?: Fighter;
  selectedFighter?: Fighter;
  enemyFighter?: Fighter;
  enemyAction?: EnemyAction;
  feedback: 'success' | 'failure' | null = null;
  gameOverReason = '';
  countdownStep = 0;
  countdownSteps = ['3', '2', '1', '¡PELEA!'];
  countdownTimer?: ReturnType<typeof setInterval>;
  turnTimer?: ReturnType<typeof setInterval>;
  feedbackTimeout?: ReturnType<typeof setTimeout>;
  turnRemainingTime = 3;
  round = 1;
  roundsSurvived = 0;
  score = 0;
  turnActive = false;

  constructor(private fightService: FightService) {
    this.fighters = this.fightService.getFighters();
    this.decorativeFighter = this.fighters.find((fighter) => fighter.id === 'f2') ?? this.fighters[0];
  }

  ngOnDestroy(): void {
    this.clearCountdownTimer();
    this.clearTurnTimer();
    this.clearFeedbackTimeout();
  }

  start(): void {
    this.resetMatch();
    this.gameState = 'fighter-selection';
  }

  resetMatch(): void {
    this.selectedFighter = undefined;
    this.enemyFighter = undefined;
    this.enemyAction = undefined;
    this.feedback = null;
    this.gameOverReason = '';
    this.countdownStep = 0;
    this.turnRemainingTime = 3;
    this.round = 1;
    this.roundsSurvived = 0;
    this.score = 0;
    this.turnActive = false;
    this.clearCountdownTimer();
    this.clearTurnTimer();
    this.clearFeedbackTimeout();
  }

  selectFighter(fighter: Fighter): void {
    this.selectedFighter = fighter;
    this.enemyFighter = this.pickRandomEnemy(fighter.id);
    this.round = 1;
    this.roundsSurvived = 0;
    this.score = 0;
    this.gameState = 'countdown';
    this.startCountdown();
  }

  private pickRandomEnemy(selectedId: string): Fighter {
    const available = this.fighters.filter((fighter) => fighter.id !== selectedId);
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  private startCountdown(): void {
    this.clearCountdownTimer();
    this.countdownStep = 0;

    this.countdownTimer = setInterval(() => {
      this.countdownStep += 1;
      if (this.countdownStep >= this.countdownSteps.length) {
        this.clearCountdownTimer();
        this.gameState = 'playing';
        this.startTurn();
      }
    }, 1000);
  }

  private clearCountdownTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  private startTurn(): void {
    this.enemyAction = this.getRandomEnemyAction();
    this.turnRemainingTime = 3;
    this.turnActive = true;
    this.feedback = null;
    this.clearTurnTimer();

    this.turnTimer = setInterval(() => {
      this.turnRemainingTime = Math.max(0, +(this.turnRemainingTime - 0.1).toFixed(1));
      if (this.turnRemainingTime <= 0) {
        this.clearTurnTimer();
        this.turnActive = false;
        this.finishGame('Se acabó el tiempo');
      }
    }, 100);
  }

  private clearTurnTimer(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = undefined;
    }
  }

  submitResponse(response: string): void {
    if (!this.turnActive || this.gameState !== 'playing') {
      return;
    }

    this.turnActive = false;
    this.clearTurnTimer();

    const correctResponse = this.enemyAction ? actionResponses[this.enemyAction] : '';

    if (response === correctResponse) {
      this.score += 100;
      this.roundsSurvived += 1;
      this.feedback = 'success';
      this.clearFeedbackTimeout();
      this.feedbackTimeout = setTimeout(() => {
        this.feedback = null;
        this.round += 1;
        this.startTurn();
      }, 500);
      return;
    }

    this.finishGame('Respuesta incorrecta');
  }

  private finishGame(reason: string): void {
    this.gameOverReason = reason;
    this.gameState = 'game-over';
    this.turnActive = false;
    this.enemyAction = undefined;
    this.clearTurnTimer();
    this.clearCountdownTimer();
  }

  playAgain(): void {
    this.resetMatch();
    this.gameState = 'fighter-selection';
  }

  backToMenu(): void {
    this.resetMatch();
    this.gameState = 'menu';
  }

  get countdownLabel(): string {
    return this.countdownSteps[this.countdownStep] ?? this.countdownSteps[this.countdownSteps.length - 1];
  }

  get enemyActionLabel(): string {
    return this.enemyAction ? actionLabels[this.enemyAction] : '';
  }

  get responseOptions() {
    return responseButtons;
  }

  private getRandomEnemyAction(): EnemyAction {
    const actions: EnemyAction[] = ['punch', 'kick', 'takedown'];
    const index = Math.floor(Math.random() * actions.length);
    return actions[index];
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = undefined;
    }
  }
}
