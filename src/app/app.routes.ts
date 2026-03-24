import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Home } from './home/home';
import { Game } from './game/game';
import { Leaderboard } from './leaderboard/leaderboard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'auth', component: Auth },
  { path: 'home', component: Home },
  { path: 'play', component: Game },
  { path: 'leaderboard', component: Leaderboard }
];
