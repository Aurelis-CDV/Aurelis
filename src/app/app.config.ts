import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAuth0 } from '@auth0/auth0-angular';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    // provideRouter(routes),
    provideAuth0({
      domain: 'dev-p6h7ctfzz5fdugp5.eu.auth0.com',
      clientId: 'zz4OxoEbBVka5rCaaLv5RZ1EaFKEt8g0',
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
  ],
};
