export interface PersonalityMatrixProps {
  dashboardData: any;
}

export interface PersonalityTraits {
  creativity: number;
  analytical: number;
  empathy: number;
  intuition: number;
  resilience: number;
  curiosity: number;
  dominantMood: string;
  lastDreamDate: number;
  uniqueFeatures: UniqueFeature[];
}

export interface UniqueFeature {
  name: string;
  description: string;
  intensity: number;
  addedAt: number;
}

export interface AgentPersonalityData {
  name: string;
  tokenId: number;
  personality: PersonalityTraits;
  responseStyle: string;
} 