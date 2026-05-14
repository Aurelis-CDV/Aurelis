export function isAuth0DatabaseUser(sub: string | undefined): boolean {
  return typeof sub === 'string' && sub.startsWith('auth0|');
}
