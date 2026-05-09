import { Routes } from '@angular/router';
import { DiseaseGuideDetailsWindow } from './guides-page/disease-guide-details-window/disease-guide-details-window';
import { GuidesPage } from './guides-page/guides-page';
import { PlantGuideDetailsWindow } from './guides-page/plant-guide-details-window/plant-guide-details-window';
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
  },
  {
    path: 'guides',
    component: GuidesPage,
  },
  {
    path: 'guides/diseases/:id',
    component: DiseaseGuideDetailsWindow,
  },
  {
    path: 'guides/:id',
    component: PlantGuideDetailsWindow,
  },
];
