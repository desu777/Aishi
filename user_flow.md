
1. Pierwsze Wejście (Onboarding)

// Użytkownik wchodzi na dreamscape.app
// Widzi:
- 8K video tło (ethereal panda w chmurach)
- "Record Your Dreams, Unlock Your Mind" 
- Przycisk "Connect Wallet" (RainbowKit)

2. Połączenie z Web3
// Użytkownik klika "Connect Wallet"
// Opcje:
- MetaMask
- WalletConnect  
- Coinbase Wallet
- Email (Web3Auth dla non-crypto users)

// Automatyczne przełączenie na 0G Galileo Testnet
// Jeśli brak 0G tokenów → redirect do faucet

3. Nagrywanie Snu
// GŁÓWNY FLOW - użytkownik klika "Record Dream"

1. Microphone permission request
2. Piękna animacja rozpoczęcia nagrywania
3. Audio waveform visualization w real-time
4. Timer pokazuje długość (max 5 min dla MVP)
5. "Stop & Save" kończy nagrywanie

// Co widzi user:
- Pulsujący okrąg podczas nagrywania
- Spokojne animacje redukujące stres
- Subtelne dźwięki ambient w tle


4. Processing & Analysis
// Po zapisaniu - ekran ładowania (15-30 sekund)
// Użytkownik widzi:

"✨ Transcribing your dream..."        // 5 sek
"🧠 Analyzing with AI psychologist..." // 10 sek  
"💫 Generating insights..."            // 5 sek
"🔐 Securing on blockchain..."         // 5 sek

// W tle dzieje się MAGIA (zobacz Technical Flow)

5. Wyniki Analizy
// Użytkownik otrzymuje:

📊 Dream Analysis Dashboard:
- Główne emocje (happiness: 70%, anxiety: 20%, curiosity: 10%)
- Symbole i ich znaczenia (latanie = wolność, woda = emocje)
- Archetypy Junga (The Hero's Journey detected)
- Personalizowane insights
- Akcje do podjęcia ("This dream suggests...")

🎨 Opcje:
- Generate Dream Art (AI image z DALL-E)
- Share Anonymously to Community
- Mint as NFT (special dreams)
- Download Analysis PDF

6. Dream Journal & Patterns

// Dashboard użytkownika pokazuje:
- Kalendarz snów (colored by mood)
- Streak tracker (7 days streak! 🔥)
- Recurring patterns graph
- Emotional journey over time
- Symbol frequency cloud


User Records Dream (Frontend)
        ↓
Upload Audio + Signature (API)
        ↓
Queue Processing Job (BullMQ)
        ↓
┌─────────────────────────────┐
│   PARALLEL PROCESSING:      │
├─────────────────────────────┤
│ 1. Store Audio → 0G Storage │
│ 2. Transcribe → Whisper API │
│ 3. Analyze → 0G Compute     │
│ 4. Save Data → 0G KV Store  │
│ 5. Update → Smart Contract  │
└─────────────────────────────┘
        ↓
Return Results to User
        ↓
Display Beautiful Dashboard



 User Experience Magic

 // Co czyni UX wyjątkowym:

1. "One-Click Dream Recording"
   - No complex setup
   - Works on any device
   - Beautiful, calming interface

2. "Instant Insights"
   - 15-30 second processing
   - Rich, actionable analysis
   - Beautiful visualizations

3. "Community Without Exposure"
   - Share dreams anonymously
   - Get support without judgment
   - Learn from collective patterns

4. "Gamification That Matters"
   - Streak tracking motivates consistency
   - Badges for self-discovery milestones
   - NFT rewards for breakthrough insights

5. "Professional Quality"
   - AI trained on psychology frameworks
   - Better than generic chatbots
   - Approaching human therapist quality