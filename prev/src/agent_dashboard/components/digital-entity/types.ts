export interface GlitchDigitalEntityProps {
  agentData: any;
  dashboardData: any;
}

export interface AgentDisplayData {
  name: string;
  tokenId: number;
  owner: string;
  createdAt: number;
  lastUpdated: number;
  intelligenceLevel: number;
  dreamCount: number;
  conversationCount: number;
  totalEvolutions: number;
  personalityInitialized: boolean;
}