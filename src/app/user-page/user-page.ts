import { Component } from '@angular/core';
import { TopBar } from '../common/top-bar/top-bar';
import { GreenhousesList } from './greenhouses-list/greenhouses-list';
import { GreenhouseDashboard } from './greenhouse-dashboard/greenhouse-dashboard';
import { PlantsDetailsWindow } from './plants-details-window/plants-details-window';

@Component({
  selector: 'aurelis-user-page',
  imports: [TopBar, GreenhousesList, GreenhouseDashboard, PlantsDetailsWindow],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {}
