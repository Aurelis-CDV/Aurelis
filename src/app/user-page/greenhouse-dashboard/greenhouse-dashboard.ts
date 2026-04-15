import { Component } from '@angular/core';
import { Settings } from '../../common/icons/settings/settings';
import { Refresh } from '../../common/icons/refresh/refresh';

@Component({
  selector: 'aurelis-greenhouse-dashboard',
  imports: [Settings, Refresh],
  templateUrl: './greenhouse-dashboard.html',
  styleUrl: './greenhouse-dashboard.scss',
})
export class GreenhouseDashboard {}
