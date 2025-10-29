import { Routes } from '@angular/router';
import { RevoltsPageComponent } from './features/revolts/revolts-page.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LettersCompletedGuard } from './core/guards/letters-completed.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/components/landing-page/landing-page.component').then(m => m.LandingPageComponent) },
  { path: 'home', loadComponent: () => import('./features/landing/components/landing-page/landing-page.component').then(m => m.LandingPageComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent) },
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
        // Discord routes will be added later
        // {
        //   path: 'discord',
        //   canActivate: [AuthGuard, LettersCompletedGuard],
        //   loadChildren: () => import('./features/discord/discord.routes').then(m => m.discordRoutes)
        // },
  { path: 'revolts', component: RevoltsPageComponent },
  { path: '**', redirectTo: '' }
];
