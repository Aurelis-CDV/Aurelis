import { Component } from '@angular/core';
import { TopBar } from './top-bar/top-bar';
import { PlantsPreviewList } from './plants-preview-list/plants-preview-list';
import { ChartCarousel } from './chart-carousel/chart-carousel';
import { CurrentParameters } from './current-parameters/current-parameters';

@Component({
  selector: 'aurelis-greenhouse-dashboard',
  imports: [TopBar, PlantsPreviewList, ChartCarousel, CurrentParameters],
  templateUrl: './greenhouse-dashboard.html',
  styleUrl: './greenhouse-dashboard.scss',
})
export class GreenhouseDashboard {}
