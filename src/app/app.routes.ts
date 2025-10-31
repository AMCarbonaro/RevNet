import { Routes } from '@angular/router';
import { RevoltsPageComponent } from './features/revolts/revolts-page.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LettersCompletedGuard } from './core/guards/letters-completed.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/components/landing-page/landing-page.component').then(m => m.LandingPageComponent) },
  { path: 'home', loadComponent: () => import('./features/landing/components/landing-page/landing-page.component').then(m => m.LandingPageComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent) },
  { path: 'welcome', loadComponent: () => import('./features/auth/components/terminal-welcome/terminal-welcome.component').then(m => m.TerminalWelcomeComponent) },
  { path: 'auth/callback/:provider', loadComponent: () => import('./features/auth/components/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent) },
  { 
    path: 'letters', 
    // canActivate: [AuthGuard], // Temporarily disabled for testing
    children: [
      { path: '', loadComponent: () => import('./features/letters/components/letters-dashboard/letters-dashboard.component').then(m => m.LettersDashboardComponent) },
      { path: ':id', loadComponent: () => import('./features/letters/components/letter-reader/letter-reader.component').then(m => m.LetterReaderComponent) }
    ]
  },
  // Temporary demo route for testing
  { 
    path: 'demo-letters', 
    children: [
      { path: '', loadComponent: () => import('./features/letters/components/letters-dashboard/letters-dashboard.component').then(m => m.LettersDashboardComponent) },
      { path: ':id', loadComponent: () => import('./features/letters/components/letter-reader/letter-reader.component').then(m => m.LetterReaderComponent) }
    ]
  },
            // RevNet routes (new implementation)
            {
              path: 'revnet',
              // canActivate: [AuthGuard, LettersCompletedGuard], // Temporarily disabled for testing
              loadChildren: () => import('./features/revnet/revnet.routes').then(m => m.REVNET_ROUTES)
            },
  { path: 'revolts', component: RevoltsPageComponent },
  { path: 'revolts/:id', loadComponent: () => import('./features/revolts/revolt-landing/revolt-landing.component').then(m => m.RevoltLandingComponent) },
  { path: 'invite/:code', loadComponent: () => import('./features/revolts/revolt-landing/revolt-landing.component').then(m => m.RevoltLandingComponent) },
  { path: '**', redirectTo: '' }
];
