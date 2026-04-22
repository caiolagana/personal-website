import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.Home) },
  { path: 'music', loadComponent: () => import('./teoria-musical/teoria-musical').then(m => m.TeoriaMusical) },
];
