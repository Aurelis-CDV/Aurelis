import { Component } from '@angular/core';
import { TopBar } from './top-bar/top-bar';
import { PlantsPreviewList } from './plants-preview-list/plants-preview-list';
import { ChartCarousel } from './chart-carousel/chart-carousel';

@Component({
  selector: 'aurelis-greenhouse-dashboard',
  imports: [TopBar, PlantsPreviewList, ChartCarousel],
  templateUrl: './greenhouse-dashboard.html',
  styleUrl: './greenhouse-dashboard.scss',
})
export class GreenhouseDashboard {}
