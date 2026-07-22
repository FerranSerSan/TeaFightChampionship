import { Component, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
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
  imports: [NgForOf],
  templateUrl: './fights.html',
  styleUrls: ['./fights.css']
})
export class Fights implements OnInit {

  fights: FightView[] = [];

  constructor(
    private fightService: FightService
  ) {}

  ngOnInit(): void {
    this.fights = this.fightService.getFights().map((fight) => ({
      fight,
      fighter1: this.fightService.getFighter(fight.fighter1Id),
      fighter2: this.fightService.getFighter(fight.fighter2Id),
      winner: this.fightService.getFighter(fight.winnerId)
    }));
  }
}