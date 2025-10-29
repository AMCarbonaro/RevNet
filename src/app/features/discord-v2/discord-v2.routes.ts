import { Routes } from '@angular/router';
import { DiscordV2LayoutComponent } from './components/discord-layout/discord-layout.component';

export const DISCORD_V2_ROUTES: Routes = [
  {
    path: '',
    component: DiscordV2LayoutComponent,
    children: [
      { path: '@me', loadComponent: () => import('./components/direct-messages/direct-messages.component').then(m => m.DirectMessagesComponent) },
      { path: 'channels/:serverId/:channelId', loadComponent: () => import('./components/server-channel/server-channel.component').then(m => m.ServerChannelComponent) },
      { path: '', redirectTo: '@me', pathMatch: 'full' }
    ]
  }
];
