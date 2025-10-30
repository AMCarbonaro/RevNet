import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RevNetState } from '../models/revnet.models';

export const selectRevNetState = createFeatureSelector<RevNetState>('revnet');

export const selectServers = createSelector(
  selectRevNetState,
  state => state.servers
);

export const selectSelectedServerId = createSelector(
  selectRevNetState,
  state => state.selectedServerId
);

export const selectSelectedServer = createSelector(
  selectRevNetState,
  selectServers,
  (state, servers) => servers.find(s => s.id === state.selectedServerId) || null
);

export const selectChannels = createSelector(
  selectRevNetState,
  state => state.channels
);

export const selectChannelsByServer = createSelector(
  selectRevNetState,
  selectSelectedServerId,
  (state, serverId) => serverId 
    ? state.channels.filter(c => c.serverId === serverId)
    : []
);

export const selectSelectedChannelId = createSelector(
  selectRevNetState,
  state => state.selectedChannelId
);

export const selectSelectedChannel = createSelector(
  selectRevNetState,
  selectChannels,
  (state, channels) => channels.find(c => c.id === state.selectedChannelId) || null
);

export const selectCurrentChannelMessages = createSelector(
  selectRevNetState,
  state => state.selectedChannelId 
    ? state.messages[state.selectedChannelId] || []
    : []
);

export const selectCurrentUser = createSelector(
  selectRevNetState,
  state => state.currentUser
);

export const selectLoading = createSelector(
  selectRevNetState,
  state => state.loading
);

export const selectError = createSelector(
  selectRevNetState,
  state => state.error
);

export const selectWebsocketConnected = createSelector(
  selectRevNetState,
  state => state.websocketConnected
);

// Friend selectors
export const selectFriends = createSelector(
  selectRevNetState,
  state => state.friends
);

export const selectFriendRequests = createSelector(
  selectRevNetState,
  state => state.friendRequests
);

export const selectOnlineFriends = createSelector(
  selectFriends,
  friends => friends.filter(friend => friend.friend?.status === 'online')
);

export const selectPendingFriendRequests = createSelector(
  selectFriendRequests,
  requests => requests.filter(req => req.status === 'pending')
);

// DM selectors
export const selectDMChannels = createSelector(
  selectRevNetState,
  state => state.dmChannels
);

export const selectSelectedDMChannelId = createSelector(
  selectRevNetState,
  state => state.selectedDMChannelId
);

export const selectSelectedDMChannel = createSelector(
  selectDMChannels,
  selectSelectedDMChannelId,
  (dmChannels, selectedId) => dmChannels.find(dm => dm.channelId === selectedId) || null
);

export const selectDMChannelsSorted = createSelector(
  selectDMChannels,
  dmChannels => [...dmChannels].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
);

export const selectGroupDMChannels = createSelector(
  selectDMChannels,
  dmChannels => dmChannels.filter(dm => dm.isGroup)
);

export const selectDirectDMChannels = createSelector(
  selectDMChannels,
  dmChannels => dmChannels.filter(dm => !dm.isGroup)
);

// Search selectors
export const selectSearchState = createSelector(
  selectRevNetState,
  state => state.search
);

export const selectSearchResults = createSelector(
  selectSearchState,
  search => search.results
);

export const selectSearchTotal = createSelector(
  selectSearchState,
  search => search.total
);

export const selectSearchLoading = createSelector(
  selectSearchState,
  search => search.isLoading
);

export const selectSearchError = createSelector(
  selectSearchState,
  search => search.error
);

export const selectHighlightedMessageId = createSelector(
  selectSearchState,
  search => search.highlightedMessageId
);
