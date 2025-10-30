import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Server, Channel, Message, User, Friend, FriendRequest, DMChannel } from '../models/revnet.models';

export const RevNetActions = createActionGroup({
  source: 'RevNet',
  events: {
    'Load Servers': emptyProps(),
    'Load Servers Success': props<{ servers: Server[] }>(),
    'Load Servers Failure': props<{ error: string }>(),
    
    'Load Channels': props<{ serverId: string }>(),
    'Load Channels Success': props<{ channels: Channel[] }>(),
    'Load Channels Failure': props<{ error: string }>(),
    
    'Select Server': props<{ serverId: string | null }>(),
    'Select Channel': props<{ channelId: string | null }>(),
    
    'Load Messages': props<{ channelId: string }>(),
    'Load Messages Success': props<{ channelId: string; messages: Message[] }>(),
    'Load Messages Failure': props<{ error: string }>(),
    
    'Send Message': props<{ channelId: string; content: string }>(),
    'Send Message Success': props<{ message: Message }>(),
    'Send Message Failure': props<{ error: string }>(),
    
    'Message Received': props<{ message: Message }>(),
    
    'Add Reaction': props<{ messageId: string; emoji: string; userId: string }>(),
    'Add Reaction Success': props<{ messageId: string; emoji: string; userId: string }>(),
    'Add Reaction Failure': props<{ error: string }>(),
    
    'Remove Reaction': props<{ messageId: string; emoji: string; userId: string }>(),
    'Remove Reaction Success': props<{ messageId: string; emoji: string; userId: string }>(),
    'Remove Reaction Failure': props<{ error: string }>(),
    
    'Edit Message': props<{ messageId: string; content: string }>(),
    'Edit Message Success': props<{ message: Message }>(),
    'Edit Message Failure': props<{ error: string }>(),
    
    'Delete Message': props<{ messageId: string }>(),
    'Delete Message Success': props<{ messageId: string }>(),
    'Delete Message Failure': props<{ error: string }>(),
    
    'Pin Message': props<{ messageId: string }>(),
    'Pin Message Success': props<{ messageId: string }>(),
    'Pin Message Failure': props<{ error: string }>(),
    
    'Unpin Message': props<{ messageId: string }>(),
    'Unpin Message Success': props<{ messageId: string }>(),
    'Unpin Message Failure': props<{ error: string }>(),
    
    'Set Current User': props<{ user: User }>(),
    
    'Create Revolt': props<{ revoltData: FormData }>(),
    'Create Revolt Success': props<{ revolt: Server }>(),
    'Create Revolt Failure': props<{ error: string }>(),
    
    'Update Revolt': props<{ revoltId: string; updates: Partial<Server> }>(),
    'Update Revolt Success': props<{ revolt: Server }>(),
    'Update Revolt Failure': props<{ error: string }>(),
    
    'Delete Revolt': props<{ revoltId: string }>(),
    'Delete Revolt Success': props<{ revoltId: string }>(),
    'Delete Revolt Failure': props<{ error: string }>(),
    
    'WebSocket Connected': emptyProps(),
    'WebSocket Disconnected': emptyProps(),

    // Friend actions
    'Load Friends': emptyProps(),
    'Load Friends Success': props<{ friends: Friend[] }>(),
    'Load Friends Failure': props<{ error: string }>(),

    'Load Friend Requests': emptyProps(),
    'Load Friend Requests Success': props<{ friendRequests: FriendRequest[] }>(),
    'Load Friend Requests Failure': props<{ error: string }>(),

    'Send Friend Request': props<{ friendUsername: string }>(),
    'Send Friend Request Success': props<{ friendRequest: FriendRequest }>(),
    'Send Friend Request Failure': props<{ error: string }>(),

    'Accept Friend Request': props<{ requestId: string }>(),
    'Accept Friend Request Success': props<{ friend: Friend }>(),
    'Accept Friend Request Failure': props<{ error: string }>(),

    'Decline Friend Request': props<{ requestId: string }>(),
    'Decline Friend Request Success': props<{ requestId: string }>(),
    'Decline Friend Request Failure': props<{ error: string }>(),

    'Remove Friend': props<{ friendId: string }>(),
    'Remove Friend Success': props<{ friendId: string }>(),
    'Remove Friend Failure': props<{ error: string }>(),

    'Block User': props<{ userId: string }>(),
    'Block User Success': props<{ blockedUser: Friend }>(),
    'Block User Failure': props<{ error: string }>(),

    'Unblock User': props<{ userId: string }>(),
    'Unblock User Success': props<{ userId: string }>(),
    'Unblock User Failure': props<{ error: string }>(),

    'Friend Request Received': props<{ friendRequest: FriendRequest }>(),
    'Friend Accepted': props<{ friend: Friend }>(),

    // DM actions
    'Load DM Channels': emptyProps(),
    'Load DM Channels Success': props<{ dmChannels: DMChannel[] }>(),
    'Load DM Channels Failure': props<{ error: string }>(),

    'Create DM Channel': props<{ recipientId: string }>(),
    'Create DM Channel Success': props<{ dmChannel: DMChannel }>(),
    'Create DM Channel Failure': props<{ error: string }>(),

    'Create Group DM': props<{ recipientIds: string[]; name?: string }>(),
    'Create Group DM Success': props<{ dmChannel: DMChannel }>(),
    'Create Group DM Failure': props<{ error: string }>(),

    'Select DM Channel': props<{ channelId: string }>(),
    'Close DM Channel': props<{ channelId: string }>(),
    'Close DM Channel Success': props<{ channelId: string }>(),
    'Close DM Channel Failure': props<{ error: string }>(),

    'Add Recipient To Group DM': props<{ channelId: string; userId: string }>(),
    'Add Recipient To Group DM Success': props<{ dmChannel: DMChannel }>(),
    'Add Recipient To Group DM Failure': props<{ error: string }>(),

    'Remove Recipient From Group DM': props<{ channelId: string; userId: string }>(),
    'Remove Recipient From Group DM Success': props<{ dmChannel: DMChannel }>(),
    'Remove Recipient From Group DM Failure': props<{ error: string }>(),

    'DM Opened': props<{ dmChannel: DMChannel }>(),
    'Group DM Opened': props<{ dmChannel: DMChannel }>(),

    // Search actions
    'Search Messages': props<{ filters: any }>(),
    'Search Messages Success': props<{ results: any[]; total: number }>(),
    'Search Messages Failure': props<{ error: string }>(),
    'Clear Search Results': emptyProps(),
    'Navigate To Message': props<{ serverId: string; channelId: string; messageId: string }>(),
    'Set Search Highlight': props<{ messageId: string | null }>(),
  }
});
