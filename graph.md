graph TB
    subgraph "iNFT Agent Architecture"
        A[User] --> B[DreamscapeAgent Smart Contract]
        B --> C[ERC-7857 iNFT Standard]
        B --> D[Memory System]
        B --> E[Personality Evolution]
        B --> F[Dream Processing]
        
        subgraph "Memory Hierarchy"
            D --> D1[Daily Memory<br/>Current Month]
            D --> D2[Monthly Memory<br/>Consolidated]
            D --> D3[Yearly Memory<br/>Memory Core]
            D1 --> D4[0G Storage<br/>Off-chain]
            D2 --> D4
            D3 --> D4
        end
        
        subgraph "Personality Traits"
            E --> E1[Creativity 0-100]
            E --> E2[Analytical 0-100]
            E --> E3[Empathy 0-100]
            E --> E4[Intuition 0-100]
            E --> E5[Resilience 0-100]
            E --> E6[Curiosity 0-100]
            E --> E7[Unique Features<br/>AI-Generated]
        end
        
        subgraph "Dream Processing"
            F --> F1[Daily Dream Input]
            F --> F2[AI Analysis]
            F --> F3[Personality Impact]
            F --> F4[Evolution Every 5 Dreams]
            F --> F5[Intelligence Boost]
        end
        
        subgraph "Gamification"
            G[Milestones] --> G1[Memory Master]
            G --> G2[Empathy Master]
            G --> G3[Creative Genius]
            G --> G4[Consolidation Streaks]
            G --> G5[Intelligence Rewards]
        end
        
        B --> G
        
        subgraph "External Systems"
            H[SimpleDreamVerifier] --> B
            I[0G Storage Network] --> D4
            J[AI Models] --> F2
        end
        
        K[Frontend App] --> A
        K --> B
        K --> I
        K --> J
    end