export interface AchievementsMatrixProps {
  dashboardData: any;
}

export interface MilestoneData {
  icon: string;
  name: string;
  desc: string;
  req: string;
}

export interface ProgressData {
  bar: string;
  percent: string;
}

export interface AchievementStats {
  totalEvolutions: number;
  lastEvolution: string;
  evolutionRate: number;
  intelligenceLevel: number;
  dreamCount: number;
  conversationCount: number;
  totalActivity: number;
  pendingRewards: number;
  consolidationStreak: number;
  achievedMilestones: string[];
  achievedCount: number;
}