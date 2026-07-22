import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FightService } from '../../core/services/fight.service';
import { Fighter } from '../../core/models/fighter.model';

@Component({
  standalone: true,
  selector: 'app-fighter-card',
  imports: [NgIf, RouterLink],
  templateUrl: './fighter-card.html',
  styleUrls: ['./fighter-card.css'],
})
export class FighterCard implements OnInit {
  fighter?: Fighter;
  totalFights = 0;
  wins = 0;
  losses = 0;
  winRate = 0;

  constructor(
    private route: ActivatedRoute,
    private fightService: FightService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fighter = this.fightService.getFighter(id);
      if (this.fighter) {
        this.totalFights = this.fightService.getTotalFightsByFighter(this.fighter.id);
        this.wins = this.fightService.getWinsByFighter(this.fighter.id);
        this.losses = this.fightService.getLossesByFighter(this.fighter.id);
        this.winRate = this.fightService.getWinRateByFighter(this.fighter.id);
      }
    }
  }
}
