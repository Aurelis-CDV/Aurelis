import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { TopBar } from '../common/top-bar/top-bar';

@Component({
  selector: 'aurelis-home-page',
  imports: [TopBar, RouterLink, AsyncPipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly auth = inject(AuthService);
}
