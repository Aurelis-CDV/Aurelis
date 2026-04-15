import { Component } from '@angular/core';
import { Refresh } from '../../../common/icons/refresh/refresh';
import { Settings } from '../../../common/icons/settings/settings';

@Component({
  selector: 'aurelis-dashboard-top-bar',
  imports: [Refresh, Settings],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {}
