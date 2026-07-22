import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FightService } from '../../core/services/fight.service';
import { Fighter } from '../../core/models/fighter.model';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [NgIf, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  champion?: Fighter;

  constructor(private fightService: FightService) {
    this.champion = this.fightService.getChampion();
  }
}
