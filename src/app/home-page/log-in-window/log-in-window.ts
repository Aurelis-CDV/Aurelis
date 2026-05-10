import { Component, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'aurelis-log-in-window',
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './log-in-window.html',
  styleUrl: './log-in-window.scss',
})
export class LogInWindow {
  protected auth = inject(AuthService);
  protected readonly window = window;
}
