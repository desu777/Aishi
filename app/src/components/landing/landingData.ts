import { 
  Lock, Brain, Diamond, Sparkles, 
  Cpu, HardDrive, Database, Blocks
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Step {
  title: string;
  desc: string;
}

export interface StackComponent {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const valueProps: ValueProp[] = [
  {
    icon: Lock,
    title: 'Private by design',
    description: 'Your keys, your data. Memories live on 0G Storage with 0G DA guarantees.'
  },
  {
    icon: Brain,
    title: 'Self-learning memory',
    description: 'Automatic monthly/yearly consolidation keeps what matters, not everything.'
  },
  {
    icon: Diamond,
    title: 'Ownable iNFT',
    description: 'One agent per wallet; name it, keep it, upgrade it, trade it.'
  },
  {
    icon: Sparkles,
    title: 'Live2D persona',
    description: 'Talk to an anime companion that adapts to your vibe.'
  }
];

export const steps: Step[] = [
  { title: 'Connect & mint', desc: 'Name your Aishi iNFT on 0G Chain.' },
  { title: 'Share a dream or chat', desc: 'Type dream or talk; analysis runs on 0G Compute.' },
  { title: 'You choose what to remember', desc: 'Only approved items are saved to 0G Storage.' },
  { title: 'Auto-consolidation', desc: 'Backend automatically runs month-learn and year-learn when due.' },
  { title: 'Evolve', desc: "Aishi's traits and response style adapt with you." }
];

export const traits: string[] = [
  'Intelligence', 
  'Creativity', 
  'Empathy', 
  'Intuition', 
  'Resilience', 
  'Curiosity'
];

export const stackComponents: StackComponent[] = [
  {
    icon: Cpu,
    title: '0G Compute',
    description: 'Decentralized AI inference for dream/chat analysis'
  },
  {
    icon: HardDrive,
    title: '0G Storage',
    description: 'Encrypted, append-only archive under your control'
  },
  {
    icon: Database,
    title: '0G DA',
    description: "Verifiable availability for your agent's memory"
  },
  {
    icon: Blocks,
    title: '0G Chain',
    description: 'On-chain iNFT identity and memory pointers'
  }
];

export const badges: string[] = [
  'iNFT',
  '0G Compute', 
  '0G Storage', 
  '0G DA', 
  '0G Chain'
];

export const techDetails = {
  command: '$ aishi --info',
  sections: [
    {
      title: '# Agent Architecture',
      items: [
        '• Single agent per wallet',
        '• Unique name registration',
        '• Mint fee: 0.1 0G'
      ]
    },
    {
      title: '# Memory Hierarchy',
      items: [
        '• Daily hashes → Monthly files → Yearly core',
        '• Auto consolidation by backend service',
        '• On-chain events for audit trail'
      ]
    },
    {
      title: '# Growth Mechanics',
      items: [
        '• Streaks: Consecutive interaction days',
        '• Rewards: Intelligence points',
        '• Milestones: Unlock features at levels'
      ]
    }
  ]
};