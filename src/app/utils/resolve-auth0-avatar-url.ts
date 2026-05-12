/** Minimal Auth0 user fields used for avatar resolution. */
export type Auth0AvatarUser = {
  picture?: string;
  name?: string;
  nickname?: string;
  email?: string;
  sub?: string;
};

const AVATAR_PALETTE = ['#4d6e5d', '#6cabd7', '#a98467', '#adc178', '#6c584c', '#4da44d', '#c5d397'];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function isUsablePictureUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:' || u.protocol === 'data:';
  } catch {
    return false;
  }
}

function initialsFor(user: Auth0AvatarUser): string {
  const name = user.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0];
      const b = parts[parts.length - 1]?.[0];
      if (a && b) {
        return (a + b).toUpperCase();
      }
    }
    return name.slice(0, 2).toUpperCase();
  }
  const nick = user.nickname?.trim();
  if (nick) {
    return nick.slice(0, 2).toUpperCase();
  }
  const local = user.email?.split('@')[0]?.trim();
  if (local) {
    return local.slice(0, 2).toUpperCase();
  }
  return 'U';
}

function defaultAvatarDataUrl(user: Auth0AvatarUser): string {
  const seed = user.sub?.trim() || user.email?.trim() || 'user';
  const bg = AVATAR_PALETTE[hashSeed(seed) % AVATAR_PALETTE.length];
  const text = initialsFor(user);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="${bg}"/>
  <text x="64" y="64" dominant-baseline="central" text-anchor="middle"
    fill="#fffff7" font-family="system-ui,Segoe UI,sans-serif" font-size="48" font-weight="600">${escapeXml(
      text,
    )}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Uses Auth0 `picture` when present; otherwise a deterministic SVG avatar from name/email/sub.
 */
export function resolveAuth0AvatarUrl(user: Auth0AvatarUser | null | undefined): string {
  const raw = user?.picture?.trim();
  if (raw && isUsablePictureUrl(raw)) {
    return raw;
  }
  return defaultAvatarDataUrl(user ?? {});
}
