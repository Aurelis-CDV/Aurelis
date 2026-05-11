import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAuth0 } from '@auth0/auth0-angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideAuth0({
      domain: process.env['AUTH0_DOMAIN'] || '',
      clientId: process.env['AUTH0_CLIENT_ID'] || '',
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
  ],
};
