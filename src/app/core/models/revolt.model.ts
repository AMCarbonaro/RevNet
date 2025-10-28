export interface Revolt {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  icon?: string;
  banner?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isFull: boolean;
  memberCount: number;
  channelCount: number;
  messageCount: number;
  acceptDonations: boolean;
  currentFunding: number;
  fundingGoal?: number;
  isFeatured: boolean;
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    maxMembers?: number;
  };
  channelIds: string[];
  memberIds: string[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevoltFilters {
  category?: string;
  search?: string;
  sortBy?: 'popular' | 'recent' | 'active' | 'funding';
  limit?: number;
  offset?: number;
}

export interface RevoltResponse {
  data: Revolt[];
  total: number;
  limit: number;
  offset: number;
}
