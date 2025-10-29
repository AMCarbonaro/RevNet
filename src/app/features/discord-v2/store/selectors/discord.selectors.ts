import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DiscordState } from '../models/discord.models';

export const selectDiscordState = createFeatureSelector<DiscordState>('discordV2');

export const selectServers = createSelector(
  selectDiscordState,
  state => state.servers
);

export const selectSelectedServerId = createSelector(
  selectDiscordState,
  state => state.selectedServerId
);

export const selectSelectedServer = createSelector(
  selectDiscordState,
  selectServers,
  (state, servers) => servers.find(s => s.id === state.selectedServerId) || null
);

export const selectChannels = createSelector(
  selectDiscordState,
  state => state.channels
);

export const selectSelectedChannelId = createSelector(
  selectDiscordState,
  state => state.selectedChannelId
);

export const selectSelectedChannel = createSelector(
  selectDiscordState,
  selectChannels,
  (state, channels) => channels.find(c => c.id === state.selectedChannelId) || null
);

export const selectCurrentChannelMessages = createSelector(
  selectDiscordState,
  state => state.selectedChannelId 
    ? state.messages[state.selectedChannelId] || []
    : []
);

export const selectCurrentUser = createSelector(
  selectDiscordState,
  state => state.currentUser
);

export const selectLoading = createSelector(
  selectDiscordState,
  state => state.loading
);

export const selectError = createSelector(
  selectDiscordState,
  state => state.error
);

export const selectWebsocketConnected = createSelector(
  selectDiscordState,
  state => state.websocketConnected
);
