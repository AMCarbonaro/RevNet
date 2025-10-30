import { Routes } from '@angular/router';
import { RevNetLayoutComponent } from './components/revnet-layout/revnet-layout.component';

export const REVNET_ROUTES: Routes = [
  {
    path: '',
    component: RevNetLayoutComponent,
    children: [
      { path: '@me', loadComponent: () => import('./components/direct-messages/direct-messages.component').then(m => m.DirectMessagesComponent) },
      { path: 'channels/:serverId/:channelId', loadComponent: () => import('./components/server-channel/server-channel.component').then(m => m.ServerChannelComponent) },
      { path: '', redirectTo: '@me', pathMatch: 'full' }
    ]
  }
];
