import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Route params arrive as component `input()`s rather than through an injected
    // `ActivatedRoute` subscription — so `/roster/:defId` is a signal the component reads like
    // any other input, with no subscription to remember to tear down.
    provideRouter(routes, withComponentInputBinding()),
  ],
};
