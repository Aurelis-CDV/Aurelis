import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserPage } from './user-page/user-page';

@Component({
  selector: 'aurelis-root',
  imports: [RouterOutlet, UserPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('aurelis');
}
