import { Component } from '@angular/core';
import { Settings } from '../../common/icons/settings/settings';
import { Refresh } from '../../common/icons/refresh/refresh';
import { TopBar } from './top-bar/top-bar';
import { PlantsPreviewList } from './plants-preview-list/plants-preview-list';

@Component({
  selector: 'aurelis-greenhouse-dashboard',
  imports: [TopBar, PlantsPreviewList],
  templateUrl: './greenhouse-dashboard.html',
  styleUrl: './greenhouse-dashboard.scss',
})
export class GreenhouseDashboard {}
