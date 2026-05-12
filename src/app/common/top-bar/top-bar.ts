import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import type { User } from '@auth0/auth0-angular';
import { resolveAuth0AvatarUrl } from '../../utils/resolve-auth0-avatar-url';
import { ProfilePicturePreferenceService } from '../../services/profile-picture-preference.service';
import { Book } from '../icons/book/book';
import { SettingsWindow } from '../settings-window/settings-window';

@Component({
  selector: 'aurelis-top-bar',
  imports: [Book, RouterLink, AsyncPipe, SettingsWindow],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  protected readonly auth = inject(AuthService);
  protected readonly window = window;
  protected readonly profilePicturePrefs = inject(ProfilePicturePreferenceService);

  protected readonly settingsOpen = signal(false);

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

  protected openSettings(): void {
    this.settingsOpen.set(true);
  }

  protected closeSettings(): void {
    this.settingsOpen.set(false);
  }

  protected avatarUrl(user: User): string {
    this.profilePicturePrefs.avatarRevision();
    return resolveAuth0AvatarUrl(user, this.profilePicturePrefs.getOverrideUrl(user.sub ?? ''));
  }
}
