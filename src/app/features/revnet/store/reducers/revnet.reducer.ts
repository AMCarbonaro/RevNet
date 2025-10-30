import { createReducer, on } from '@ngrx/store';
import { RevNetActions } from '../actions/revnet.actions';
import { RevNetState } from '../models/revnet.models';

const initialState: RevNetState = {
  servers: [],
  channels: [],
  messages: {},
  currentUser: {
    id: 'user1',
    username: 'CurrentUser',
    discriminator: '0001',
    avatar: null,
    status: 'online',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    bot: false,
    system: false,
    mfa_enabled: false,
    banner: null,
    accent_color: null,
    locale: 'en-US',
    verified: false,
    email: null,
    flags: 0,
    premium_type: 0,
    public_flags: 0
  },
  selectedServerId: null,
  selectedChannelId: null,
  friends: [],
  friendRequests: [],
  dmChannels: [],
  selectedDMChannelId: null,
  search: {
    results: [],
    total: 0,
    isLoading: false,
    error: null,
    highlightedMessageId: null
  },
  loading: false,
  error: null,
  websocketConnected: false
};

export const revnetReducer = createReducer(
  initialState,
  on(RevNetActions.loadServers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RevNetActions.loadServersSuccess, (state, { servers }) => ({
    ...state,
    servers,
    loading: false,
    error: null
  })),
  on(RevNetActions.loadServersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(RevNetActions.loadChannelsSuccess, (state, { channels }) => ({
    ...state,
    channels,
    loading: false,
    error: null
  })),
  on(RevNetActions.loadChannelsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(RevNetActions.selectServer, (state, { serverId }) => {
    // Find the selected server and use its channels
    const selectedServer = state.servers.find(server => server.id === serverId);
    const serverChannels = selectedServer?.channels || [];

    return {
      ...state,
      selectedServerId: serverId,
      selectedChannelId: null,
      channels: serverChannels
    };
  }),
  on(RevNetActions.selectChannel, (state, { channelId }) => ({
    ...state,
    selectedChannelId: channelId
  })),
  
  on(RevNetActions.loadMessagesSuccess, (state, { channelId, messages }) => {
    // Add mock author object to messages that only have authorId
    const messagesWithAuthor = messages.map(message => ({
      ...message,
      author: message.author || {
        id: message.authorId || 'user1',
        username: 'CurrentUser',
        discriminator: '0001',
        avatar: null,
        status: 'online',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        bot: false,
        system: false,
        mfa_enabled: false,
        banner: null,
        accent_color: null,
        locale: 'en-US',
        verified: false,
        email: null,
        flags: 0,
        premium_type: 0,
        public_flags: 0
      }
    }));

    return {
      ...state,
      messages: {
        ...state.messages,
        [channelId]: messagesWithAuthor
      },
      loading: false,
      error: null
    };
  }),
  on(RevNetActions.loadMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(RevNetActions.sendMessage, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RevNetActions.sendMessageSuccess, (state, { message }) => ({
    ...state,
    messages: {
      ...state.messages,
      [message.channel_id]: [
        ...(state.messages[message.channel_id] || []),
        message
      ]
    },
    loading: false,
    error: null
  })),
  on(RevNetActions.sendMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(RevNetActions.messageReceived, (state, { message }) => {
    // Add mock author object to WebSocket messages that only have authorId
    const messageWithAuthor = {
      ...message,
      author: message.author || {
        id: message.authorId || 'user1',
        username: 'CurrentUser',
        discriminator: '0001',
        avatar: null,
        status: 'online',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        bot: false,
        system: false,
        mfa_enabled: false,
        banner: null,
        accent_color: null,
        locale: 'en-US',
        verified: false,
        email: null,
        flags: 0,
        premium_type: 0,
        public_flags: 0
      }
    };

    return {
      ...state,
      messages: {
        ...state.messages,
        [message.channel_id]: [
          ...(state.messages[message.channel_id] || []),
          messageWithAuthor
        ]
      }
    };
  }),
  
  on(RevNetActions.setCurrentUser, (state, { user }) => ({
    ...state,
    currentUser: user
  })),
  
  on(RevNetActions.webSocketConnected, (state) => ({
    ...state,
    websocketConnected: true
  })),
  on(RevNetActions.webSocketDisconnected, (state) => ({
    ...state,
    websocketConnected: false
  })),

  // Create Revolt Actions
  on(RevNetActions.createRevolt, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RevNetActions.createRevoltSuccess, (state, { revolt }) => ({
    ...state,
    servers: [...state.servers, revolt],
    loading: false,
    error: null
  })),
  on(RevNetActions.createRevoltFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Revolt Actions
  on(RevNetActions.updateRevolt, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RevNetActions.updateRevoltSuccess, (state, { revolt }) => ({
    ...state,
    servers: state.servers.map(s => s.id === revolt.id ? revolt : s),
    loading: false,
    error: null
  })),
  on(RevNetActions.updateRevoltFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Revolt Actions
  on(RevNetActions.deleteRevolt, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RevNetActions.deleteRevoltSuccess, (state, { revoltId }) => ({
    ...state,
    servers: state.servers.filter(s => s.id !== revoltId),
    selectedServerId: state.selectedServerId === revoltId ? null : state.selectedServerId,
    selectedChannelId: state.selectedServerId === revoltId ? null : state.selectedChannelId,
    loading: false,
    error: null
  })),
  on(RevNetActions.deleteRevoltFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Friend actions
  on(RevNetActions.loadFriendsSuccess, (state, { friends }) => ({
    ...state,
    friends,
    loading: false,
    error: null
  })),
  on(RevNetActions.loadFriendsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.loadFriendRequestsSuccess, (state, { friendRequests }) => ({
    ...state,
    friendRequests,
    loading: false,
    error: null
  })),
  on(RevNetActions.loadFriendRequestsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.sendFriendRequestSuccess, (state, { friendRequest }) => ({
    ...state,
    friendRequests: [...state.friendRequests, friendRequest],
    loading: false,
    error: null
  })),
  on(RevNetActions.sendFriendRequestFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.acceptFriendRequestSuccess, (state, { friend }) => ({
    ...state,
    friends: [...state.friends, friend],
    friendRequests: state.friendRequests.filter(req => req.id !== friend.id),
    loading: false,
    error: null
  })),
  on(RevNetActions.acceptFriendRequestFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.declineFriendRequestSuccess, (state, { requestId }) => ({
    ...state,
    friendRequests: state.friendRequests.filter(req => req.id !== requestId),
    loading: false,
    error: null
  })),
  on(RevNetActions.declineFriendRequestFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.removeFriendSuccess, (state, { friendId }) => ({
    ...state,
    friends: state.friends.filter(f => f.id !== friendId),
    loading: false,
    error: null
  })),
  on(RevNetActions.removeFriendFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.blockUserSuccess, (state, { blockedUser }) => ({
    ...state,
    friends: [...state.friends, blockedUser],
    loading: false,
    error: null
  })),
  on(RevNetActions.blockUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.unblockUserSuccess, (state, { userId }) => ({
    ...state,
    friends: state.friends.filter(f => f.friend?.id !== userId),
    loading: false,
    error: null
  })),
  on(RevNetActions.unblockUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.friendRequestReceived, (state, { friendRequest }) => ({
    ...state,
    friendRequests: [...state.friendRequests, friendRequest]
  })),

  on(RevNetActions.friendAccepted, (state, { friend }) => ({
    ...state,
    friends: [...state.friends, friend]
  })),

  // DM actions
  on(RevNetActions.loadDMChannelsSuccess, (state, { dmChannels }) => ({
    ...state,
    dmChannels,
    loading: false,
    error: null
  })),
  on(RevNetActions.loadDMChannelsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.createDMChannelSuccess, (state, { dmChannel }) => ({
    ...state,
    dmChannels: [...state.dmChannels, dmChannel],
    loading: false,
    error: null
  })),
  on(RevNetActions.createDMChannelFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.createGroupDMSuccess, (state, { dmChannel }) => ({
    ...state,
    dmChannels: [...state.dmChannels, dmChannel],
    loading: false,
    error: null
  })),
  on(RevNetActions.createGroupDMFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.selectDMChannel, (state, { channelId }) => ({
    ...state,
    selectedDMChannelId: channelId,
    selectedServerId: null,
    selectedChannelId: channelId
  })),

  on(RevNetActions.closeDMChannelSuccess, (state, { channelId }) => ({
    ...state,
    dmChannels: state.dmChannels.filter(dm => dm.channelId !== channelId),
    selectedDMChannelId: state.selectedDMChannelId === channelId ? null : state.selectedDMChannelId,
    selectedChannelId: state.selectedChannelId === channelId ? null : state.selectedChannelId,
    loading: false,
    error: null
  })),
  on(RevNetActions.closeDMChannelFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.addRecipientToGroupDMSuccess, (state, { dmChannel }) => ({
    ...state,
    dmChannels: state.dmChannels.map(dm => 
      dm.id === dmChannel.id ? dmChannel : dm
    ),
    loading: false,
    error: null
  })),
  on(RevNetActions.addRecipientToGroupDMFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.removeRecipientFromGroupDMSuccess, (state, { dmChannel }) => ({
    ...state,
    dmChannels: state.dmChannels.map(dm => 
      dm.id === dmChannel.id ? dmChannel : dm
    ),
    loading: false,
    error: null
  })),
  on(RevNetActions.removeRecipientFromGroupDMFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(RevNetActions.dMOpened, (state, { dmChannel }) => ({
    ...state,
    dmChannels: [...state.dmChannels, dmChannel]
  })),

  on(RevNetActions.groupDMOpened, (state, { dmChannel }) => ({
    ...state,
    dmChannels: [...state.dmChannels, dmChannel]
  })),

  // Search actions
  on(RevNetActions.searchMessages, (state) => ({
    ...state,
    search: {
      ...state.search,
      isLoading: true,
      error: null
    }
  })),
  on(RevNetActions.searchMessagesSuccess, (state, { results, total }) => ({
    ...state,
    search: {
      ...state.search,
      results,
      total,
      isLoading: false,
      error: null
    }
  })),
  on(RevNetActions.searchMessagesFailure, (state, { error }) => ({
    ...state,
    search: {
      ...state.search,
      isLoading: false,
      error
    }
  })),
  on(RevNetActions.clearSearchResults, (state) => ({
    ...state,
    search: {
      ...state.search,
      results: [],
      total: 0,
      error: null
    }
  })),
  on(RevNetActions.navigateToMessage, (state, { serverId, channelId }) => ({
    ...state,
    selectedServerId: serverId,
    selectedChannelId: channelId
  })),
  on(RevNetActions.setSearchHighlight, (state, { messageId }) => ({
    ...state,
    search: {
      ...state.search,
      highlightedMessageId: messageId
    }
  }))
);
