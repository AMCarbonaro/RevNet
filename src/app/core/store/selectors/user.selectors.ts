import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState, UserState } from '../app.state';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectCurrentUser = createSelector(
  selectUserState,
  (state: UserState) => state.currentUser
);

export const selectIsAuthenticated = createSelector(
  selectUserState,
  (state: UserState) => state.isAuthenticated
);

export const selectLetterProgress = createSelector(
  selectUserState,
  (state: UserState) => state.letterProgress
);

export const selectIsLoading = createSelector(
  selectUserState,
  (state: UserState) => state.isLoading
);

export const selectError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);

export const selectCanAccessDiscord = createSelector(
  selectLetterProgress,
  (progress) => progress.canAccessDiscord
);

export const selectCompletedLettersCount = createSelector(
  selectLetterProgress,
  (progress) => progress.completedLetters.length
);

export const selectCurrentLetter = createSelector(
  selectLetterProgress,
  (progress) => progress.currentLetter
);

export const selectIsLetterCompleted = (letterId: number) => createSelector(
  selectLetterProgress,
  (progress) => progress.completedLetters.includes(letterId)
);
