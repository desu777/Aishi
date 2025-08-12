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
    icon: Brain,
    title: 'Self-learning memory',
    description: 'Aishi keeps what matters and forgets the noise via monthly/yearly consolidation.'
  },
  {
    icon: Sparkles,
    title: 'Three ways to teach',
    description: 'Share a dream, chat when you need to talk, or use the exclusive Live2D "talk" mode.'
  },
  {
    icon: Cpu,
    title: 'Gets smarter with you',
    description: 'The more Aishi learns, the better it surfaces hidden patterns, destructive loops, and helpful suggestions.'
  },
  {
    icon: Lock,
    title: 'Private by design',
    description: 'You choose what to store; data lives on 0G Storage with 0G DA guarantees.'
  },
  {
    icon: Diamond,
    title: 'Ownable iNFT',
    description: 'One agent per wallet, with a unique name you choose.'
  }
];

export const steps: Step[] = [
  { title: 'Connect & mint', desc: 'Name your Aishi iNFT on 0G Chain.' },
  { title: 'Share a dream or chat', desc: 'Type dream to analyze your night dream, chat to talk freely, or use the Live2D "talk" mode for real-time voice.' },
  { title: 'You choose what to remember', desc: 'After each dream/chat/talk you can teach Aishi about yourself — you decide what is saved.' },
  { title: 'Auto-consolidation', desc: 'The backend automatically runs month-learn and year-learn when due; long-term memory is kept without linear bloat. Unlike typical agents that lose month-scale context, Aishi\'s optimized method preserves an entire month (and years) coherently.' },
  { title: 'Evolve', desc: 'Watch intelligence, traits, and response style improve as Aishi learns.' }
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
        '• Streaks: consecutive consolidations',
        '• Rewards: intelligence points (+ early-bird bonus)',
        '• Milestones: unlocks at levels & streaks'
      ]
    }
  ]
};