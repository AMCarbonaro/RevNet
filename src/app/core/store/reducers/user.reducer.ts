import { createReducer, on } from '@ngrx/store';
import { UserState } from '../app.state';
import { User } from '../../models/user.model';
import { LetterProgress } from '../../models/letter.model';
import * as UserActions from '../actions/user.actions';

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  letterProgress: {
    completedLetters: [],
    currentLetter: 1,
    totalLetters: 30,
    canAccessDiscord: false,
    assignments: []
  },
  isLoading: false,
  error: null
};

export const userReducer = createReducer(
  initialState,
  
  // Login Actions
  on(UserActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserActions.loginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    isAuthenticated: true,
    letterProgress: user.letterProgress,
    isLoading: false,
    error: null
  })),
  on(UserActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Register Actions
  on(UserActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserActions.registerSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    isAuthenticated: true,
    letterProgress: user.letterProgress,
    isLoading: false,
    error: null
  })),
  on(UserActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // OAuth Actions
  on(UserActions.loginWithOAuth, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserActions.loginWithOAuthSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    isAuthenticated: true,
    letterProgress: user.letterProgress,
    isLoading: false,
    error: null
  })),
  on(UserActions.loginWithOAuthFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Demo Actions
  on(UserActions.demoLogin, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserActions.demoLoginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    isAuthenticated: true,
    letterProgress: user.letterProgress,
    isLoading: false,
    error: null
  })),

  // Logout Actions
  on(UserActions.logout, (state) => ({
    ...state,
    isLoading: true
  })),
  on(UserActions.logoutSuccess, (state) => ({
    ...state,
    currentUser: null,
    isAuthenticated: false,
    letterProgress: initialState.letterProgress,
    isLoading: false,
    error: null
  })),

  // Letter Progress Actions
  on(UserActions.updateLetterProgress, (state, { progress }) => ({
    ...state,
    letterProgress: progress,
    currentUser: state.currentUser ? {
      ...state.currentUser,
      letterProgress: progress
    } : null
  })),
  on(UserActions.completeLetter, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserActions.completeLetterSuccess, (state, { progress }) => ({
    ...state,
    letterProgress: progress,
    currentUser: state.currentUser ? {
      ...state.currentUser,
      letterProgress: progress
    } : null,
    isLoading: false,
    error: null
  })),
  on(UserActions.completeLetterFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // User Profile Actions
  on(UserActions.loadUserProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserActions.loadUserProfileSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    letterProgress: user.letterProgress,
    isLoading: false,
    error: null
  })),
  on(UserActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(UserActions.updateUserProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserActions.updateUserProfileSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    letterProgress: user.letterProgress,
    isLoading: false,
    error: null
  })),
  on(UserActions.updateUserProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  }))
);
