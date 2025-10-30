import { createAction, props } from '@ngrx/store';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../../models/user.model';
import { LetterProgress } from '../../models/letter.model';

// Authentication Actions
export const login = createAction('[User] Login', props<{ user: User }>());
export const loginSuccess = createAction('[User] Login Success', props<{ user: User }>());
export const loginFailure = createAction('[User] Login Failure', props<{ error: string }>());

export const register = createAction('[User] Register', props<{ credentials: RegisterRequest }>());
export const registerSuccess = createAction('[User] Register Success', props<{ user: User }>());
export const registerFailure = createAction('[User] Register Failure', props<{ error: string }>());

export const logout = createAction('[User] Logout');
export const logoutSuccess = createAction('[User] Logout Success');

// OAuth Actions
export const loginWithOAuth = createAction('[User] Login With OAuth', props<{ provider: string, code: string }>());
export const loginWithOAuthSuccess = createAction('[User] Login With OAuth Success', props<{ user: User }>());
export const loginWithOAuthFailure = createAction('[User] Login With OAuth Failure', props<{ error: string }>());

// Demo Actions
export const demoLogin = createAction('[User] Demo Login', props<{ demoType: 'quick' | 'full' }>());
export const demoLoginSuccess = createAction('[User] Demo Login Success', props<{ user: User }>());
export const demoLoginFailure = createAction('[User] Demo Login Failure', props<{ error: string }>());

// Letter Progress Actions
export const updateLetterProgress = createAction('[User] Update Letter Progress', props<{ progress: LetterProgress }>());
export const completeLetter = createAction('[User] Complete Letter', props<{ letterId: number }>());
export const completeLetterSuccess = createAction('[User] Complete Letter Success', props<{ progress: LetterProgress }>());
export const completeLetterFailure = createAction('[User] Complete Letter Failure', props<{ error: string }>());

// User Profile Actions
export const loadUserProfile = createAction('[User] Load User Profile');
export const loadUserProfileSuccess = createAction('[User] Load User Profile Success', props<{ user: User }>());
export const loadUserProfileFailure = createAction('[User] Load User Profile Failure', props<{ error: string }>());

export const updateUserProfile = createAction('[User] Update User Profile', props<{ user: Partial<User> }>());
export const updateUserProfileSuccess = createAction('[User] Update User Profile Success', props<{ user: User }>());
export const updateUserProfileFailure = createAction('[User] Update User Profile Failure', props<{ error: string }>());
