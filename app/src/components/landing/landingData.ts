import { 
  Lock, Brain, Diamond, Sparkles, 
  Cpu, HardDrive, Database, Blocks,
  Heart, Eye, Lightbulb, Music, FlaskConical, Grid3X3
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
    icon: Heart,
    title: 'Best virtual companion',
    description: 'Always-on, caring Live2D persona + terminal; talks when you need it most.'
  },
  {
    icon: Eye,
    title: 'Sees what we miss',
    description: 'Finds hidden patterns across dreams and chats (mood loops, triggers, recurring symbols).'
  },
  {
    icon: Brain,
    title: 'Third-person mirror',
    description: 'Monthly/Yearly summaries reflect your story from the outside and suggest next steps.'
  },
  {
    icon: Sparkles,
    title: 'Support in tough moments',
    description: '"talk" mode for real-time voice; gentle, personalized coping tips learned from your data.'
  },
  {
    icon: Lock,
    title: 'Private by design',
    description: '0G Compute/Storage/DA/Chain – you choose what to remember; we can\'t see your data.'
  },
  {
    icon: Diamond,
    title: 'Ownable iNFT',
    description: 'One agent per wallet; name it, keep it, upgrade it.'
  }
];

export const steps: Step[] = [
  { title: 'Connect & mint', desc: 'Name your Aishi iNFT on 0G Chain.' },
  { title: 'Share a dream or chat', desc: 'Type dream to analyze your night dream, chat to talk freely, or use the Live2D "talk" mode for real-time voice.' },
  { title: 'You choose what to remember', desc: 'After each dream/chat/talk you can teach Aishi about yourself – you decide what is saved.' },
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

export interface DreamInspiration {
  icon: LucideIcon;
  person: string;
  discovery: string;
  description: string;
}

export const dreamInspirations: DreamInspiration[] = [
  {
    icon: FlaskConical,
    person: 'August Kekulé',
    discovery: 'Benzene Ring',
    description: 'Saw the structure after dreaming of a snake biting its tail.'
  },
  {
    icon: Grid3X3,
    person: 'Dmitri Mendeleev',
    discovery: 'Periodic Table',
    description: 'Arranged the elements after seeing them ordered in a dream.'
  },
  {
    icon: Music,
    person: 'Paul McCartney',
    discovery: '"Yesterday"',
    description: 'Woke with the complete melody, thought he was remembering someone else\'s song.'
  }
];

export interface RealityStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const howAishiMakesItReal: RealityStep[] = [
  {
    icon: Brain,
    title: 'Dream/chat/talk',
    description: '0G Compute analysis'
  },
  {
    icon: Eye,
    title: 'You approve',
    description: 'Choose what to save'
  },
  {
    icon: Database,
    title: '0G Storage',
    description: 'Secure memory archive'
  },
  {
    icon: Sparkles,
    title: 'Pattern mining',
    description: 'Insights & suggestions over time'
  }
];

export const disclaimer = 'Aishi gives personal insights and suggestions; it\'s not medical advice. You control memory and privacy.';

export interface AgentProblem {
  title: string;
  description: string;
}

export const agentProblems: AgentProblem[] = [
  {
    title: 'Limited context',
    description: 'Chats reset, memories fragment; old info is lost.'
  },
  {
    title: 'Memory overload',
    description: 'No space/cost to keep month-scale data coherently.'
  },
  {
    title: 'Vendor lock-in',
    description: 'Opaque infra; you can\'t audit where data lives.'
  },
  {
    title: 'No personal control',
    description: 'Agent saves everything or nothing.'
  },
  {
    title: 'Short-term advice',
    description: 'No longitudinal patterns, so suggestions stay shallow.'
  },
  {
    title: 'No real evolution',
    description: 'Agent stays static, doesn\'t grow with your needs.'
  },
  {
    title: 'Generic responses',
    description: 'One-size-fits-all answers without personalization.'
  },
  {
    title: 'Lost relationships',
    description: 'Can\'t maintain context across months and years.'
  }
];

export interface AishiSolution {
  title: string;
  description: string;
}

export const aishiSolutions: AishiSolution[] = [
  {
    title: 'Hierarchical memory built for years',
    description: 'Daily → monthly → yearly core (compressed, append-only).'
  },
  {
    title: 'Auto-consolidation',
    description: 'Backend runs month-learn/year-learn when due; keeps long-term context compact instead of bloated.'
  },
  {
    title: '0G-native privacy',
    description: 'Compute, Storage, DA, Chain. You approve what\'s saved; we can\'t see your data.'
  },
  {
    title: 'Durable identity',
    description: 'iNFT with on-chain pointers; after 5 years Aishi still "remembers" you coherently.'
  },
  {
    title: 'Insight engine',
    description: 'Mines recurring symbols/moods/events to surface destructive loops and actionable suggestions.'
  },
  {
    title: 'Growth with purpose',
    description: 'Intelligence levels unlock deeper memory access; traits and response style adapt.'
  }
];

export interface HowItWorksStep {
  step: number;
  description: string;
}

export const howAishiWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    description: 'Share a dream, chat, or use Live2D talk → analysis on 0G Compute.'
  },
  {
    step: 2,
    description: 'You decide what to remember → encrypted write to 0G Storage.'
  },
  {
    step: 3,
    description: 'Backend auto-consolidates months/years → compact long-term memory that most agents can\'t afford to keep.'
  },
  {
    step: 4,
    description: 'Over time Aishi spots hidden patterns and recommends next steps; milestones and INT rewards track progress.'
  }
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