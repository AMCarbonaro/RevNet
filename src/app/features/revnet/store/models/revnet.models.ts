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
  status?: string;
  createdAt?: string;
  lastActive?: string;
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
  description?: string;
  owner: boolean;
  permissions: number;
  features: string[];
  approximate_member_count?: number;
  approximate_presence_count?: number;
  channels?: Channel[];
}

export interface Channel {
  id: string;
  type: ChannelType;
  serverId: string;
  position: number;
  name: string;
  topic: string | null;
  nsfw: boolean;
  parentId: string | null;
  isActive: boolean;
  bitrate?: number | null;
  userLimit?: number | null;
  rateLimitPerUser?: number;
  lastMessageId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  author?: User;
  authorId?: string;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: User[];
  mention_roles: string[];
  mention_channels?: any[] | null;
  attachments: Attachment[];
  embeds: Embed[];
  reactions?: Reaction[];
  nonce?: string | number | null;
  pinned: boolean;
  webhook_id?: string | null;
  type: number;
  activity?: any;
  application?: any;
  application_id?: string | null;
  message_reference?: any;
  flags?: number;
  referenced_message?: Message | null;
  interaction?: any;
  thread?: Channel | null;
  components?: any[];
  sticker_items?: any[];
  stickers?: any[];
  position?: number | null;
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

export interface Friend {
  id: string;
  user?: User;
  friend?: User;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  user?: User;
  friend?: User;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: string;
}

export interface DMChannel {
  id: string;
  channelId: string;
  recipientIds: string[];
  name?: string;
  isGroup: boolean;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
  channel: Channel;
}

export interface SearchResult {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  serverId: string;
  channelName: string;
  serverName: string;
  createdAt: string;
  editedTimestamp?: string;
  attachments?: any[];
  embeds?: any[];
  pinned: boolean;
  type: number;
  tts: boolean;
  mentionEveryone: boolean;
  flags: number;
}

export interface SearchState {
  results: SearchResult[];
  total: number;
  isLoading: boolean;
  error: string | null;
  highlightedMessageId: string | null;
}

export interface RevNetState {
  servers: Server[];
  channels: Channel[];
  messages: { [channelId: string]: Message[] };
  currentUser: User | null;
  selectedServerId: string | null;
  selectedChannelId: string | null;
  friends: Friend[];
  friendRequests: FriendRequest[];
  dmChannels: DMChannel[];
  selectedDMChannelId: string | null;
  search: SearchState;
  loading: boolean;
  error: string | null;
  websocketConnected: boolean;
}
