/** Username-password users get `auth0|…` subjects; social / enterprise use other prefixes. */
export function isAuth0DatabaseUser(sub: string | undefined): boolean {
  return typeof sub === 'string' && sub.startsWith('auth0|');
}
