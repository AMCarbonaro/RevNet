import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Server, Channel, Message, User } from '../models/discord.models';

export const DiscordActions = createActionGroup({
  source: 'Discord',
  events: {
    'Load Servers': emptyProps(),
    'Load Servers Success': props<{ servers: Server[] }>(),
    'Load Servers Failure': props<{ error: string }>(),
    
    'Load Channels': props<{ serverId: string }>(),
    'Load Channels Success': props<{ channels: Channel[] }>(),
    'Load Channels Failure': props<{ error: string }>(),
    
    'Select Server': props<{ serverId: string }>(),
    'Select Channel': props<{ channelId: string }>(),
    
    'Load Messages': props<{ channelId: string }>(),
    'Load Messages Success': props<{ channelId: string; messages: Message[] }>(),
    'Load Messages Failure': props<{ error: string }>(),
    
    'Send Message': props<{ channelId: string; content: string }>(),
    'Send Message Success': props<{ message: Message }>(),
    'Send Message Failure': props<{ error: string }>(),
    
    'Message Received': props<{ message: Message }>(),
    
    'Set Current User': props<{ user: User }>(),
    
    'WebSocket Connected': emptyProps(),
    'WebSocket Disconnected': emptyProps(),
  }
});
