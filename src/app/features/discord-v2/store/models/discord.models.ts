export enum ChannelType {
  TEXT = 0,
  DM = 1,
  VOICE = 2,
  GROUP_DM = 3,
  CATEGORY = 4,
  NEWS = 5,
  STORE = 6,
  NEWS_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  STAGE_VOICE = 13,
  DIRECTORY = 14,
  FORUM = 15
}

export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
  system: boolean;
  mfa_enabled: boolean;
  banner: string | null;
  accent_color: number | null;
  locale: string;
  verified: boolean;
  email: string | null;
  flags: number;
  premium_type: number;
  public_flags: number;
}

export interface Server {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: number;
  features: string[];
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export interface Channel {
  id: string;
  type: ChannelType;
  guild_id: string | null;
  position: number;
  name: string;
  topic: string | null;
  nsfw: boolean;
  parent_id: string | null;
  permission_overwrites: any[];
}

export interface Message {
  id: string;
  channel_id: string;
  author: User;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: User[];
  mention_roles: string[];
  mention_channels?: any[];
  attachments: Attachment[];
  embeds: Embed[];
  reactions?: Reaction[];
  nonce?: string | number;
  pinned: boolean;
  webhook_id?: string;
  type: number;
  activity?: any;
  application?: any;
  application_id?: string;
  message_reference?: any;
  flags?: number;
  referenced_message?: Message | null;
  interaction?: any;
  thread?: Channel;
  components?: any[];
  sticker_items?: any[];
  stickers?: any[];
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  content_type?: string;
}

export interface Embed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: any;
  image?: any;
  thumbnail?: any;
  video?: any;
  provider?: any;
  author?: any;
  fields?: any[];
}

export interface Reaction {
  count: number;
  me: boolean;
  emoji: any;
}

export interface DiscordState {
  servers: Server[];
  channels: Channel[];
  messages: { [channelId: string]: Message[] };
  currentUser: User | null;
  selectedServerId: string | null;
  selectedChannelId: string | null;
  loading: boolean;
  error: string | null;
  websocketConnected: boolean;
}
