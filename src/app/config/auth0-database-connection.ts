/** Auth0 database connection name (Dashboard → Authentication → Database). Used for password reset emails. */
export function auth0DatabaseConnectionName(): string {
  const raw = typeof process !== 'undefined' ? process.env?.['AUTH0_DATABASE_CONNECTION'] : undefined;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  return 'Username-Password-Authentication';
}
