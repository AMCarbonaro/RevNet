import { Injectable } from '@angular/core';
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
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private authService: AuthService,
    private lettersService: LettersService
  ) {}

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
      switchMap(() => of(UserActions.registerSuccess({ user: this.authService.getCurrentUser()! })))
    )
  );

  // OAuth Login Effect - simplified for now
  loginWithOAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginWithOAuth),
      switchMap(() => of(UserActions.loginWithOAuthSuccess({ user: this.authService.getCurrentUser()! })))
    )
  );

  // Demo Login Effect - simplified for now
  demoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.demoLogin),
      switchMap(() => of(UserActions.demoLoginSuccess({ user: this.authService.getCurrentUser()! })))
    )
  );

  // Complete Letter Effect - simplified for now
  completeLetter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.completeLetter),
      switchMap(() => of(UserActions.completeLetterSuccess({ progress: this.authService.getCurrentUser()!.letterProgress })))
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
