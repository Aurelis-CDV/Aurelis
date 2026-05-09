import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { Book } from '../icons/book/book';

@Component({
  selector: 'aurelis-top-bar',
  imports: [Book, RouterLink, AsyncPipe],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  protected readonly auth = inject(AuthService);
  protected readonly window = window;

  protected signUp(): void {
    this.auth.loginWithRedirect({
      authorizationParams: { screen_hint: 'signup' },
      appState: { target: '/dashboard' },
    });
  }

  protected signIn(): void {
    this.auth.loginWithRedirect({ appState: { target: '/dashboard' } });
  }

  protected logout(): void {
    this.auth.logout({ logoutParams: { returnTo: this.window.location.origin } });
  }
}
