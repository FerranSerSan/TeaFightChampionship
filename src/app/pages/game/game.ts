import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';

import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FightService } from '../../core/services/fight.service';
import { Fighter } from '../../core/models/fighter.model';

export type GameState =
  | 'menu'
  | 'fighter-selection'
  | 'countdown'
  | 'playing'
  | 'game-over';

export type EnemyAction =
  | 'punch'
  | 'kick'
  | 'takedown'
  | 'elbow'
  | 'knee'
  | 'clinch';

const actionResponses: Record<EnemyAction, string> = {
  punch: 'dodge',
  kick: 'block',
  takedown: 'defend',
  elbow: 'duck',
  knee: 'step-back',
  clinch: 'escape',
};

const actionLabels: Record<EnemyAction, string> = {
  punch: 'Golpe',
  kick: 'Patada',
  takedown: 'Llevada',
  elbow: 'Codo',
  knee: 'Rodillazo',
  clinch: 'Clinch',
};

const responseButtons = [
  { value: 'dodge', label: 'ESQUIVAR' },
  { value: 'block', label: 'BLOQUEAR' },
  { value: 'defend', label: 'DEFENDER' },
  { value: 'duck', label: 'AGACHARSE' },
  { value: 'step-back', label: 'RETROCEDER' },
  { value: 'escape', label: 'ESCAPAR' },
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

  constructor(
    private fightService: FightService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.fighters = this.fightService.getFighters();

    this.decorativeFighter =
      this.fighters.find((fighter) => fighter.id === 'f2') ??
      this.fighters[0];
  }

  ngOnDestroy(): void {
    this.clearCountdownTimer();
    this.clearTurnTimer();
    this.clearFeedbackTimeout();
  }

  start(): void {
    this.resetMatch();
    this.gameState = 'fighter-selection';

    this.refreshView();
  }

  resetMatch(): void {
    this.clearCountdownTimer();
    this.clearTurnTimer();
    this.clearFeedbackTimeout();

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
  }

  selectFighter(fighter: Fighter): void {
    this.resetMatch();

    this.selectedFighter = fighter;
    this.enemyFighter = this.pickRandomEnemy(fighter.id);

    this.gameState = 'countdown';

    this.refreshView();

    this.startCountdown();
  }

  private pickRandomEnemy(selectedId: string): Fighter | undefined {
    const availableFighters = this.fighters.filter(
      (fighter) => fighter.id !== selectedId
    );

    if (availableFighters.length === 0) {
      return undefined;
    }

    const randomIndex = Math.floor(
      Math.random() * availableFighters.length
    );

    return availableFighters[randomIndex];
  }

  private startCountdown(): void {
    this.clearCountdownTimer();

    this.countdownStep = 0;

    this.refreshView();

    this.countdownTimer = setInterval(() => {
      this.countdownStep++;

      this.refreshView();

      if (this.countdownStep >= this.countdownSteps.length - 1) {
        this.clearCountdownTimer();

        setTimeout(() => {
          this.gameState = 'playing';

          this.refreshView();

          this.startTurn();
        }, 800);
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
    this.clearTurnTimer();

    this.enemyAction = this.getRandomEnemyAction();

    this.turnRemainingTime = 3;
    this.turnActive = true;
    this.feedback = null;

    this.refreshView();

    this.turnTimer = setInterval(() => {
      this.turnRemainingTime = Math.max(
        0,
        Number((this.turnRemainingTime - 0.1).toFixed(1))
      );

      this.refreshView();

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
    if (
      !this.turnActive ||
      this.gameState !== 'playing' ||
      !this.enemyAction
    ) {
      return;
    }

    this.turnActive = false;

    this.clearTurnTimer();

    const correctResponse =
      actionResponses[this.enemyAction];

    if (response === correctResponse) {
      this.score += 100;
      this.roundsSurvived += 1;

      this.feedback = 'success';

      this.refreshView();

      this.clearFeedbackTimeout();

      this.feedbackTimeout = setTimeout(() => {
        this.feedback = null;
        this.round += 1;

        this.refreshView();

        this.startTurn();
      }, 500);

      return;
    }

    this.finishGame('Respuesta incorrecta');
  }

  private finishGame(reason: string): void {
    this.clearCountdownTimer();
    this.clearTurnTimer();

    this.gameOverReason = reason;
    this.gameState = 'game-over';

    this.turnActive = false;
    this.enemyAction = undefined;

    this.refreshView();
  }

  playAgain(): void {
    this.resetMatch();

    this.gameState = 'fighter-selection';

    this.refreshView();
  }

  backToMenu(): void {
    this.resetMatch();

    this.gameState = 'menu';

    this.refreshView();
  }

  get countdownLabel(): string {
    return (
      this.countdownSteps[this.countdownStep] ??
      this.countdownSteps[0]
    );
  }

  get enemyActionLabel(): string {
    return this.enemyAction
      ? actionLabels[this.enemyAction]
      : '';
  }

  get responseOptions() {
    return responseButtons;
  }

  private getRandomEnemyAction(): EnemyAction {
    const actions: EnemyAction[] = [
      'punch',
      'kick',
      'takedown',
      'elbow',
      'knee',
      'clinch',
    ];

    const randomIndex = Math.floor(
      Math.random() * actions.length
    );

    return actions[randomIndex];
  }

  private clearFeedbackTimeout(): void {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = undefined;
    }
  }

  private refreshView(): void {
    this.changeDetector.detectChanges();
  }
}