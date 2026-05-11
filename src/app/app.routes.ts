import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { GuidesPage } from './guides-page/guides-page';
import { HomePage } from './home-page/home-page';
import { UserPage } from './user-page/user-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePage,
  },
  {
    path: 'dashboard',
    component: UserPage,
    canActivate: [authGuardFn],
  },
  {
    path: 'guides',
    component: GuidesPage,
  },
];
