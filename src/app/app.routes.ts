import { Routes } from '@angular/router';
import { RevoltsPageComponent } from './features/revolts/revolts-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/landing/components/landing-page/landing-page.component').then(m => m.LandingPageComponent) },
  { path: 'revolts', component: RevoltsPageComponent },
  { path: '**', redirectTo: '/home' }
];
