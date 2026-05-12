import { Injectable, signal } from '@angular/core';

const STORAGE_PREFIX = 'aurelis.profile_picture_override.';

@Injectable({
  providedIn: 'root',
})
export class ProfilePicturePreferenceService {
  private readonly revision = signal(0);

  /** Bumps when local override changes so avatars refresh without full reload. */
  public readonly avatarRevision = this.revision.asReadonly();

  public getOverrideUrl(sub: string): string | null {
    if (!sub.trim()) {
      return null;
    }
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + sub);
      if (!raw || !raw.startsWith('data:image/')) {
        return null;
      }
      return raw;
    } catch {
      return null;
    }
  }

  public setOverride(sub: string, dataUrl: string): void {
    if (typeof window === 'undefined' || !window.localStorage || !sub.trim()) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_PREFIX + sub.trim(), dataUrl);
      this.revision.update((n) => n + 1);
    } catch {}
  }

  public clearOverride(sub: string): void {
    if (typeof window === 'undefined' || !window.localStorage || !sub.trim()) {
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + sub.trim());
      this.revision.update((n) => n + 1);
    } catch {}
  }
}
