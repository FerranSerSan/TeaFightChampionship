import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FightService, RankingEntry } from '../../core/services/fight.service';

@Component({
  standalone: true,
  selector: 'app-ranking',
  imports: [NgForOf, NgIf],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css'],
})
export class Ranking {
  selectedEntry?: RankingEntry;

  constructor(private fightService: FightService) {}

  get ranking(): RankingEntry[] {
    return this.fightService.getRanking();
  }

  openBreakdown(entry: RankingEntry): void {
    this.selectedEntry = entry;
  }

  closeBreakdown(): void {
    this.selectedEntry = undefined;
  }
}
