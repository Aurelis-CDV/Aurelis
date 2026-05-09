import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAuth0 } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAuth0({
      domain: 'dev-p6h7ctfzz5fdugp5.eu.auth0.com',
      clientId: 'zz4OxoEbBVka5rCaaLv5RZ1EaFKEt8g0',
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
  ],
};
