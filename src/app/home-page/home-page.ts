import { Component } from '@angular/core';
import { LogInWindow } from './log-in-window/log-in-window';
import { TopBar } from '../common/top-bar/top-bar';

@Component({
  selector: 'aurelis-home-page',
  imports: [LogInWindow, TopBar],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {}
