export interface PlatformStats {
  totalRevolts: number;
  totalMembers: number;
  totalRaised: number;
  activeRevolts: number;
  totalDonations: number;
  averageDonation: number;
}

export interface CategoryStats {
  category: string;
  count: number;
}

export interface RecentActivity {
  type: string;
  revoltId: string;
  revoltName: string;
  description: string;
  category: string;
  memberCount: number;
  createdAt: Date;
}
