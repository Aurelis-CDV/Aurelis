import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnDestroy, output, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthConfig, AuthConfigService, AuthService } from '@auth0/auth0-angular';
import type { User } from '@auth0/auth0-angular';
import { finalize } from 'rxjs';
import { auth0DatabaseConnectionName } from '../../config/auth0-database-connection';
import { GreenhousesDataService } from '../../services/data.service';
import { ProfilePicturePreferenceService } from '../../services/profile-picture-preference.service';
import { UserDataService } from '../../services/user-data.service';
import { isAuth0DatabaseUser } from '../../utils/auth0-user-kind';
import { resolveAuth0AvatarUrl } from '../../utils/resolve-auth0-avatar-url';
import { PopupWindow } from '../popup-window/popup-window';

const MAX_PROFILE_IMAGE_BYTES = 400 * 1024;

const SUPPORT_EMAIL = 'aureliscdv@gmail.com';

@Component({
  selector: 'aurelis-settings-window',
  imports: [PopupWindow, AsyncPipe, FormsModule],
  templateUrl: './settings-window.html',
  styleUrl: './settings-window.scss',
})
export class SettingsWindow implements OnDestroy {
  readonly closed = output<void>();

  private copyToastTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly http = inject(HttpClient);
  protected readonly auth = inject(AuthService);
  private readonly auth0Config = inject(AuthConfigService) as AuthConfig;
  private readonly profilePicture = inject(ProfilePicturePreferenceService);
  private readonly userData = inject(UserDataService);
  private readonly greenhousesData = inject(GreenhousesDataService);

  protected readonly window = window;

  protected readonly supportEmail = SUPPORT_EMAIL;
  protected readonly supportMailto = `mailto:${SUPPORT_EMAIL}`;

  protected readonly copyToast = signal<string | null>(null);

  protected readonly passwordResetBusy = signal(false);
  protected readonly passwordResetMessage = signal<string | null>(null);
  protected readonly passwordResetError = signal<string | null>(null);

  protected readonly pictureError = signal<string | null>(null);
  protected readonly pictureBusy = signal(false);

  protected readonly deletePanelOpen = signal(false);
  protected readonly deleteBusy = signal(false);
  protected deleteAcknowledged = false;

  protected isDatabaseUser(user: User | null | undefined): boolean {
    return isAuth0DatabaseUser(user?.sub);
  }

  ngOnDestroy(): void {
    if (this.copyToastTimer !== undefined) {
      clearTimeout(this.copyToastTimer);
    }
  }

  protected copySupportEmail(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const email = SUPPORT_EMAIL;
    const done = (ok: boolean): void => {
      this.flashCopyToast(ok ? 'Email copied' : 'Copy failed');
    };
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(email).then(
        () => done(true),
        () => done(this.legacyCopyToClipboard(email)),
      );
    } else {
      done(this.legacyCopyToClipboard(email));
    }
  }

  private flashCopyToast(message: string): void {
    if (this.copyToastTimer !== undefined) {
      clearTimeout(this.copyToastTimer);
    }
    this.copyToast.set(message);
    this.copyToastTimer = setTimeout(() => {
      this.copyToast.set(null);
      this.copyToastTimer = undefined;
    }, 2000);
  }

  private legacyCopyToClipboard(text: string): boolean {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(ta);
    }
  }

  protected previewAvatar(user: User | null | undefined): string {
    if (!user) {
      return '';
    }
    return resolveAuth0AvatarUrl(user, this.profilePicture.getOverrideUrl(user.sub ?? ''));
  }

  protected sendPasswordResetEmail(user: User | null | undefined): void {
    this.passwordResetMessage.set(null);
    this.passwordResetError.set(null);
    const email = user?.email?.trim();
    const cfg = this.auth0Config;
    const domain = cfg.domain?.trim();
    const clientId = cfg.clientId?.trim();
    if (!email || !domain || !clientId) {
      this.passwordResetError.set('Could not send reset email.');
      return;
    }
    this.passwordResetBusy.set(true);
    const url = `https://${domain}/dbconnections/change_password`;
    const body = {
      client_id: clientId,
      email,
      connection: auth0DatabaseConnectionName(),
    };
    this.http
      .post(url, body, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'text',
      })
      .pipe(finalize(() => this.passwordResetBusy.set(false)))
      .subscribe({
        next: (text) => {
          this.passwordResetMessage.set(text?.trim() || 'Check your email.');
        },
        error: (err: HttpErrorResponse) => {
          this.passwordResetError.set(this.describeHttpError(err));
        },
      });
  }

  protected onProfilePictureSelected(event: Event, user: User | null | undefined): void {
    this.pictureError.set(null);
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const sub = user?.sub?.trim();
    if (!file || !sub) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.pictureError.set('Please choose an image file (PNG, JPEG, or WebP).');
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      this.pictureError.set(`Image must be at most ${Math.round(MAX_PROFILE_IMAGE_BYTES / 1024)} KB.`);
      return;
    }
    this.pictureBusy.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      this.pictureBusy.set(false);
      const result = reader.result;
      if (typeof result !== 'string' || !result.startsWith('data:image/')) {
        this.pictureError.set('Could not read that image.');
        return;
      }
      this.profilePicture.setOverride(sub, result);
    };
    reader.onerror = () => {
      this.pictureBusy.set(false);
      this.pictureError.set('Could not read that image.');
    };
    reader.readAsDataURL(file);
  }

  protected clearProfilePictureOverride(user: User | null | undefined): void {
    this.pictureError.set(null);
    const sub = user?.sub?.trim();
    if (!sub) {
      return;
    }
    this.profilePicture.clearOverride(sub);
  }

  protected hasProfileOverride(user: User | null | undefined): boolean {
    const sub = user?.sub?.trim();
    if (!sub) {
      return false;
    }
    return this.profilePicture.getOverrideUrl(sub) !== null;
  }

  protected openDeletePanel(): void {
    this.deletePanelOpen.set(true);
    this.deleteAcknowledged = false;
  }

  protected cancelDeletePanel(): void {
    this.deletePanelOpen.set(false);
    this.deleteAcknowledged = false;
  }

  protected confirmDeviceRemovalAndSignOut(user: User | null | undefined): void {
    const sub = user?.sub?.trim();
    if (!sub || !this.deleteAcknowledged || this.deleteBusy()) {
      return;
    }
    this.deleteBusy.set(true);
    try {
      this.profilePicture.clearOverride(sub);
      this.userData.clearPersistedFavorites();
      this.greenhousesData.clearPersistedWateringHistory();
    } finally {
      this.deleteBusy.set(false);
    }
    this.deletePanelOpen.set(false);
    this.deleteAcknowledged = false;
    this.onClose();
    this.auth.logout({ logoutParams: { returnTo: this.window.location.origin } }).subscribe();
  }

  protected onClose(): void {
    this.closed.emit();
  }

  private describeHttpError(err: HttpErrorResponse): string {
    const raw = err.error;
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw) as { description?: string; error?: string };
        return parsed.description || parsed.error || raw;
      } catch {
        return raw;
      }
    }
    if (raw && typeof raw === 'object' && 'description' in raw) {
      return String((raw as { description?: string }).description ?? 'Request failed.');
    }
    return err.message || 'Request failed.';
  }
}
