import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { AppState } from './app.state';
import { userReducer } from './reducers/user.reducer';

export const reducers: ActionReducerMap<AppState> = {
  user: userReducer,
  revolts: (state = { joinedRevolts: [], availableRevolts: [], currentRevolt: null, isLoading: false, error: null }, action) => state,
  channels: (state = { channels: [], currentChannel: null, messages: [], isLoading: false, error: null }, action) => state,
  messages: (state = { messages: [], isLoading: false, error: null }, action) => state,
  voice: (state = { isConnected: false, currentVoiceChannel: null, participants: [], isMuted: false, isDeafened: false, isScreenSharing: false }, action) => state,
  ui: (state = { sidebarOpen: false, currentView: '', theme: 'dark', loading: false }, action) => state,
  notifications: (state = { notifications: [], unreadCount: 0 }, action) => state,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
