import { createReducer, on } from '@ngrx/store';
import { DiscordActions } from '../actions/discord.actions';
import { DiscordState } from '../models/discord.models';

const initialState: DiscordState = {
  servers: [],
  channels: [],
  messages: {},
  currentUser: null,
  selectedServerId: null,
  selectedChannelId: null,
  loading: false,
  error: null,
  websocketConnected: false
};

export const discordReducer = createReducer(
  initialState,
  on(DiscordActions.loadServers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(DiscordActions.loadServersSuccess, (state, { servers }) => ({
    ...state,
    servers,
    loading: false,
    error: null
  })),
  on(DiscordActions.loadServersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(DiscordActions.loadChannelsSuccess, (state, { channels }) => ({
    ...state,
    channels,
    loading: false,
    error: null
  })),
  on(DiscordActions.loadChannelsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(DiscordActions.selectServer, (state, { serverId }) => ({
    ...state,
    selectedServerId: serverId,
    selectedChannelId: null,
    channels: []
  })),
  on(DiscordActions.selectChannel, (state, { channelId }) => ({
    ...state,
    selectedChannelId: channelId
  })),
  
  on(DiscordActions.loadMessagesSuccess, (state, { channelId, messages }) => ({
    ...state,
    messages: {
      ...state.messages,
      [channelId]: messages
    },
    loading: false,
    error: null
  })),
  on(DiscordActions.loadMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(DiscordActions.sendMessageSuccess, (state, { message }) => ({
    ...state,
    messages: {
      ...state.messages,
      [message.channel_id]: [
        ...(state.messages[message.channel_id] || []),
        message
      ]
    }
  })),
  
  on(DiscordActions.messageReceived, (state, { message }) => ({
    ...state,
    messages: {
      ...state.messages,
      [message.channel_id]: [
        ...(state.messages[message.channel_id] || []),
        message
      ]
    }
  })),
  
  on(DiscordActions.setCurrentUser, (state, { user }) => ({
    ...state,
    currentUser: user
  })),
  
  on(DiscordActions.webSocketConnected, (state) => ({
    ...state,
    websocketConnected: true
  })),
  on(DiscordActions.webSocketDisconnected, (state) => ({
    ...state,
    websocketConnected: false
  }))
);
