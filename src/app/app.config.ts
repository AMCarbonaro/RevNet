import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { reducers, metaReducers } from './core/store';
import { UserEffects } from './core/store/effects/user.effects';
// Discord V2 effects temporarily disabled due to injection issues
// import { DiscordEffects as DiscordV2Effects } from './features/discord-v2/store/effects/discord.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideStore(reducers, { metaReducers }),
    // provideEffects([DiscordV2Effects]), // Temporarily disabled due to injection issues
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    })
  ]
};
