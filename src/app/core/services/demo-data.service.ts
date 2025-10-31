import { Injectable } from '@angular/core';
import { Message, Server, Channel, User } from '../../features/revnet/store/models/revnet.models';
import { VoiceChannelParticipant } from '../../features/revnet/services/voice-chat.service';

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  
  getDemoServers(): Partial<Server>[] {
    return [
      {
        id: 'demo-server-1',
        name: 'Climate Action Now',
        icon: null,
        description: 'Mobilizing communities to combat climate change through direct action and policy advocacy.',
        owner: false,
        permissions: 0,
        features: [],
        approximate_member_count: 1200,
        approximate_presence_count: 45,
        channels: this.getDemoChannels('demo-server-1')
      },
      {
        id: 'demo-server-2',
        name: 'Digital Privacy Rights',
        icon: null,
        description: 'Protecting digital freedoms and fighting surveillance capitalism.',
        owner: false,
        permissions: 0,
        features: [],
        approximate_member_count: 856,
        approximate_presence_count: 23,
        channels: this.getDemoChannels('demo-server-2')
      },
      {
        id: 'demo-server-3',
        name: 'Housing Justice Collective',
        icon: null,
        description: 'Organizing tenants against predatory landlords and fighting for affordable housing.',
        owner: false,
        permissions: 0,
        features: [],
        approximate_member_count: 2100,
        approximate_presence_count: 67,
        channels: this.getDemoChannels('demo-server-3')
      }
    ] as Server[];
  }

  getDemoChannels(serverId: string): Channel[] {
    return [
      {
        id: `channel-${serverId}-1`,
        name: 'general',
        type: 0, // TEXT
        serverId: serverId,
        position: 0,
        topic: null,
        nsfw: false,
        parentId: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `channel-${serverId}-2`,
        name: 'announcements',
        type: 0, // TEXT
        serverId: serverId,
        position: 1,
        topic: null,
        nsfw: false,
        parentId: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `channel-${serverId}-3`,
        name: 'organizing',
        type: 0, // TEXT
        serverId: serverId,
        position: 2,
        topic: null,
        nsfw: false,
        parentId: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `channel-${serverId}-4`,
        name: 'Voice Chat',
        type: 2, // VOICE
        serverId: serverId,
        position: 3,
        topic: null,
        nsfw: false,
        parentId: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getDemoMessages(channelId: string): Message[] {
    const demoUsers = this.getDemoUsers();
    const now = Date.now();

    const baseMessages: Partial<Message>[] = [
      {
        content: 'Welcome to Revolution Network! 🌍\n\nThis is where we organize for real change. Join the movement!',
        author: demoUsers[0],
        type: 0,
        edited_timestamp: null,
        channel_id: channelId,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        reactions: [],
        pinned: false,
        nonce: null
      },
      {
        content: 'Love seeing everyone come together for this cause! 💪',
        author: demoUsers[1],
        type: 0,
        edited_timestamp: null,
        channel_id: channelId,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        reactions: [
          { count: 2, me: false, emoji: { name: '👍' } },
          { count: 1, me: false, emoji: { name: '❤️' } }
        ],
        pinned: false,
        nonce: null
      },
      {
        content: 'Our next action is scheduled for next week. Who\'s in?',
        author: demoUsers[0],
        type: 0,
        edited_timestamp: null,
        channel_id: channelId,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        reactions: [],
        pinned: false,
        nonce: null
      },
      {
        content: 'Count me in! I\'ll bring supplies.',
        author: demoUsers[2],
        type: 0,
        edited_timestamp: null,
        channel_id: channelId,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        reactions: [],
        pinned: false,
        nonce: null
      },
      {
        content: 'Same here! Let\'s make change happen! 🚀',
        author: demoUsers[1],
        type: 0,
        edited_timestamp: null,
        channel_id: channelId,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        reactions: [
          { count: 2, me: false, emoji: { name: '🚀' } }
        ],
        pinned: false,
        nonce: null
      }
    ];

    return baseMessages.map((msg, index) => ({
      ...msg,
      id: `demo-msg-${channelId}-${index}`,
      timestamp: new Date(now - (baseMessages.length - index) * 60000).toISOString()
    })) as Message[];
  }

  getDemoUsers(): User[] {
    return [
      {
        id: 'demo-user-1',
        username: 'Organizer',
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
      {
        id: 'demo-user-2',
        username: 'Activist',
        discriminator: '0002',
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
      {
        id: 'demo-user-3',
        username: 'Supporter',
        discriminator: '0003',
        avatar: null,
        status: 'away',
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
      {
        id: 'demo-user-4',
        username: 'Revolutionary',
        discriminator: '0004',
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
    ];
  }

  getDemoVoiceParticipants(): VoiceChannelParticipant[] {
    return [
      {
        userId: 'demo-user-1',
        username: 'Organizer',
        isMuted: false,
        isDeafened: false,
        isSpeaking: true
      },
      {
        userId: 'demo-user-2',
        username: 'Activist',
        isMuted: false,
        isDeafened: false,
        isSpeaking: false
      },
      {
        userId: 'demo-user-3',
        username: 'Supporter',
        isMuted: true,
        isDeafened: false,
        isSpeaking: false
      }
    ];
  }
}

