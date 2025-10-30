import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LettersService } from '../../services/letters.service';
import * as UserActions from '../actions/user.actions';
import { AppState } from '../app.state';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<AppState>);
  private authService = inject(AuthService);
  private lettersService = inject(LettersService);

  // Login Effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.login),
      switchMap(({ user }) =>
        of(UserActions.loginSuccess({ user }))
      )
    )
  );

  // Register Effect - simplified for now
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.register),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        if (!user) {
          return of(UserActions.registerFailure({ error: 'User not found' }));
        }
        return of(UserActions.registerSuccess({ user }));
      })
    )
  );

  // OAuth Login Effect - simplified for now
  loginWithOAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginWithOAuth),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        if (!user) {
          return of(UserActions.loginWithOAuthFailure({ error: 'User not found' }));
        }
        return of(UserActions.loginWithOAuthSuccess({ user }));
      })
    )
  );

  // Demo Login Effect - simplified for now
  demoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.demoLogin),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        if (!user) {
          return of(UserActions.demoLoginFailure({ error: 'User not found' }));
        }
        return of(UserActions.demoLoginSuccess({ user }));
      })
    )
  );

  // Complete Letter Effect - simplified for now
  completeLetter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.completeLetter),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        if (!user) {
          return of(UserActions.completeLetterFailure({ error: 'User not found' }));
        }
        return of(UserActions.completeLetterSuccess({ progress: user.letterProgress }));
      })
    )
  );

  // Logout Effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logout),
      tap(() => {
        this.authService.logout();
      }),
      map(() => UserActions.logoutSuccess())
    )
  );
}
