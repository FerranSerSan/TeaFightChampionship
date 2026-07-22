import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Fight } from '../../core/models/fight.model';
import { Fighter } from '../../core/models/fighter.model';
import { FightService } from '../../core/services/fight.service';

interface FightView {
  fight: Fight;
  fighter1: Fighter | undefined;
  fighter2: Fighter | undefined;
  winner: Fighter | undefined;
}

@Component({
  standalone: true,
  selector: 'app-fights',
  imports: [NgFor, NgIf],
  templateUrl: './fights.html',
  styleUrls: ['./fights.css']
})
export class Fights implements OnInit {

  fights: FightView[] = [];
  currentFightIndex = 0;

  constructor(private fightService: FightService) {}

  ngOnInit(): void {
    this.fights = this.fightService.getFights().map((fight) => ({
      fight,
      fighter1: this.fightService.getFighter(fight.fighter1Id),
      fighter2: this.fightService.getFighter(fight.fighter2Id),
      winner: this.fightService.getFighter(fight.winnerId)
    }));

    if (this.currentFightIndex >= this.fights.length) {
      this.currentFightIndex = Math.max(0, this.fights.length - 1);
    }
  }

  get currentFight(): FightView | undefined {
    return this.fights[this.currentFightIndex];
  }

  get currentFightNumber(): number {
    return this.currentFightIndex + 1;
  }

  get fightCount(): number {
    return this.fights.length;
  }

  get hasPrevious(): boolean {
    return this.currentFightIndex > 0;
  }

  get hasNext(): boolean {
    return this.currentFightIndex < this.fights.length - 1;
  }

  previousFight(): void {
    if (this.hasPrevious) {
      this.currentFightIndex -= 1;
    }
  }

  nextFight(): void {
    if (this.hasNext) {
      this.currentFightIndex += 1;
    }
  }

  goToFight(index: number): void {
    if (index < 0 || index >= this.fights.length) {
      return;
    }
    this.currentFightIndex = index;
  }

  isWinner(fightView: FightView, fighter: Fighter | undefined): boolean {
    return !!fighter && !!fightView.winner && fighter.id === fightView.winner.id;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    if (this.fights.length <= 1) {
      return;
    }

    if (event.key === 'ArrowRight') {
      this.nextFight();
    }

    if (event.key === 'ArrowLeft') {
      this.previousFight();
    }
  }
}