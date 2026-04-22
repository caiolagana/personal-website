import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.Home) },
  { path: 'teoria-musical', loadComponent: () => import('./teoria-musical/teoria-musical').then(m => m.TeoriaMusical) },
];
