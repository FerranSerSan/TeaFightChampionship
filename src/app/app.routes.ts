import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Ranking } from './pages/ranking/ranking';
import { Fighters } from './pages/fighters/fighters';
import { Fights } from './pages/fights/fights';
import { FighterCard } from './shared/fighter-card/fighter-card';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'ranking',
    component: Ranking
  },
  {
    path: 'fighters',
    component: Fighters
  },
  {
    path: 'fighters/:id',
    component: FighterCard
  },
  {
    path: 'fights',
    component: Fights
  }
];