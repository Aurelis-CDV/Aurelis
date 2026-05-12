import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthClientConfig } from '@auth0/auth0-angular';
import { Observable, throwError } from 'rxjs';
import { auth0DatabaseConnectionName } from '../config/auth0-database-connection';

@Injectable({ providedIn: 'root' })
export class Auth0PasswordResetService {
  private readonly http = inject(HttpClient);
  private readonly authClientConfig = inject(AuthClientConfig);

  sendPasswordChangeResetEmailThroughAuth0(email: string): Observable<string> {
    const cfg = this.authClientConfig.get();
    const domain = cfg.domain?.trim();
    const clientId = cfg.clientId?.trim();
    if (!domain || !clientId) {
      return throwError(() => new Error('Auth0 domain or clientId is not configured.'));
    }
    const url = `https://${domain}/dbconnections/change_password`;
    return this.http.post(
      url,
      {
        client_id: clientId,
        email: email.trim(),
        connection: auth0DatabaseConnectionName(),
      },
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'text',
      },
    );
  }
}
