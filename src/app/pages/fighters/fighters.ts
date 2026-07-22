import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FIGHTERS } from '../../data/fighters.data';

@Component({
  standalone: true,
  selector: 'app-fighters',
  imports: [NgForOf, RouterLink],
  templateUrl: './fighters.html',
  styleUrls: ['./fighters.css'],
})
export class Fighters {
  fighters = FIGHTERS;
}
