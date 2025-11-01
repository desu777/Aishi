# Aishi — Plan Ulepszeń Home (UI/UX + Treść + Wdrożenie)

## ETAP 1: Deklaracja Planu Działania

Rozpoczynam pracę nad zadaniem: analiza strony Home, dokumentacji, workflowów terminal‑xstate i kontraktu AishiAgent, a następnie przygotowanie szczegółowego planu ulepszeń UI/UX strony głównej w duchu elegancji, schludności i nowoczesności.

1. Analiza Kontekstu: Przejrzę w całości kluczowe pliki: `app/src/app/page.tsx`, `app/src/components/landing/*`, `app/src/components/layout/Layout.tsx`, dokumentację w `aishi-docs/*`, workflowy w `app/src/terminal-xstate/*`, kontrakt w `contracts/contracts/*`.
2. Implementacja Zmian (plan):
   - W `app/src/app/page.tsx` dołożę istniejące sekcje landing (ValueProps, Problems/Solutions, HowItWorks, TrustStack, Privacy, FinalCTA) oraz ujednolicę tło.
   - W `app/src/components/landing/HeroSection.tsx` zoptymalizuję obrazy (Next/Image), CTA fallback do docs, a11y i mikro‑interakcje.
   - W `app/src/components/landing/NeuralNetworkCanvas.tsx` dodam prefers‑reduced‑motion i mobilne limity.
   - W `app/src/components/layout/Layout.tsx` doprecyzuję overlay/tryb tła dla Home.
3. Weryfikacja i Spójność: Zgodność z konwencjami repo (TS, 2‑spacje, React FC), brak regresji, spójność brandu i wydajność.

---

## Zrozumienie Platformy (Synthesis)

- Aishi: samouczący się iNFT‑companion z hierarchiczną pamięcią (daily → monthly → yearly), w 100% na 0G (Compute, Storage, DA, Chain). Analizuje sny/rozmowy, wydobywa wzorce i ewoluuje osobowość; użytkownik decyduje, co zapamiętać.
- UI (Next.js): Home (Hero + landing), AishiOS terminal (XState), Live2D companion.
- Backend (0g-compute): Express proxy, kolejki, rate‑limiting, wirtualne brokery, model discovery.
- Chain (AishiAgent.sol): iNFT z ewolucją (traits, unique features), wskaźniki pamięci (hash), single‑per‑wallet, tiered mint fee.
- XState: `terminalMachine.ts` obsługuje `dream`, `chat`, `month-learn`, `memory-core`, voice; AI Orb komunikuje stany.

---

## Audyt Home (Stan wyjściowy)

Plusy:
- Minimalistyczny, elegancki Hero, spójna paleta (#8B5CF6), klarowne CTA.
- Sekcje landing są gotowe i wizualnie spójne (ValueProps, HowItWorks, Trust, Privacy, FinalCTA).

Luki:
- Dublujące tła (video + canvas) → szum i koszt wydajności.
- Powtórzenia treści (Problems & Solutions vs Value Props vs „How … real”).
- Sporo inline‑styles (utrudnia spójność); obrazki bez Next/Image; brak pełnego fallbacku „Learn more”.

---

## Propozycja Ulepszeń (elegancja, schludność, nowoczesność)

1) Dołożyć gotowe sekcje landing (w page.tsx po Hero): ValueProps, HowItWorks, TrustStack, Privacy, FinalCTA. Uniknąć powtórzeń.
2) Ujednolicić tło: albo samo video (z overlay), albo sam canvas z overlay i `prefers-reduced-motion` (rekomendacja: canvas + overlay).
3) Canvas: ograniczyć animację na mobile i przy reduced motion; throttling resize; prawidłowy cleanup.
4) CTA: „Learn more” fallback do `/introduction` gdy brak `NEXT_PUBLIC_DOCS_AISHI_URL`.
5) Obrazy: Next/Image + poprawne alt/aria.
6) Style: ograniczyć inline, trzymać się konwencji (layout → color → state).
7) Micro‑interactions: delikatne hover/focus, bez agresywnych animacji.
8) A11y/semantyka: pojedynczy h1 (Hero), hierarchia h2/h3, aria‑landmarks.
9) (Opcja) „As seen in / Integrations” jako subtelny wiersz w Trust.
10) SEO/share: doprecyzować og:image, spójny copy w nagłówkach.

---

## Aktualizacja: Audyt Home i plan treści (copy, sekcje, gradienty, ikony)

Cel: skrócić i wyostrzyć przekaz na Home, usunąć powtórzenia, dodać eleganckie akcenty (gradient na słowach kluczowych), oraz opcjonalnie brand‑ikony przez `react-icons/si` w sekcji zaufania.

### Co zostawiamy (rdzeń)
- Hero (odświeżone hasła i badge, subtelny gradient tylko na słowach kluczowych)
- How It Works (4 kroki, zwięźle)
- Value Props (4 kluczowe korzyści, outcome‑first)
- Trust the Stack (100% 0G) + mały wiersz „Integrations” (opcjonalnie)
- Privacy & Control (krótko i mocno)
- Final CTA (prosty nagłówek i 2 CTA)

### Co przenosimy/usuwamy
- Problems & Solutions → scalamy treść do Value Props (unikamy duplikacji)
- „Known inspirations from dreams” → przenosimy do docs lub na sam dół (opcjonalnie)

### Nowe, mocniejsze copy

1) Hero — `app/src/components/landing/HeroSection.tsx`
- Headline: „AI with a soul. Verifiably yours.”
- Subheadline: „A sovereign iNFT companion that learns from your dreams and chats — and remembers what you choose to remember.”
- Rotating (max 5):
  - „Built 100% on 0G — Compute • Storage • DA • Chain.”
  - „Your memories, truly private. You decide what’s saved.”
  - „Month‑learn + memory‑core: long‑term context that sticks.”
  - „Real‑time Live2D chat with a personality that evolves.”
  - „Spot hidden patterns and break self‑defeating loops.”
- Badges: „0G‑native”, „Ownable iNFT”, „Private by design”, „Live2D Companion”, „Memory that lasts”.
- Fallback „Learn More” → `/introduction`, gdy brak `NEXT_PUBLIC_DOCS_AISHI_URL`.
- GradientText tylko na „soul” i „Verifiably”.

2) How It Works — `app/src/components/landing/HowItWorksSection.tsx`
- Kroki:
  1. Connect & mint — Name your Aishi iNFT.
  2. Share a dream or chat — Instant analysis.
  3. You approve memory — You choose what’s saved.
  4. Auto‑consolidation — Month‑learn + memory‑core keep long‑term context.

3) Value Props — `app/src/components/landing/ValuePropsSection.tsx`
- 4 pozycje (zastąpić obecne):
  - Private by design — „Your data lives under your control. We can’t see your dreams or chats.”
  - Memory that actually lasts — „Auto month‑learn + memory‑core preserve long‑term context without bloat.”
  - A companion that evolves — „Traits, intelligence, and response style grow with you — an iNFT that’s truly yours.”
  - Patterns you can act on — „Uncovers triggers, loops, and themes across weeks and years — with clear next steps.”
- „Known inspirations from dreams” → do docs lub na sam dół.
- „How Aishi makes it real (today)” → rozważyć scalenie z How It Works.

4) Trust the Stack — `app/src/components/landing/TrustStackSection.tsx`
- Tytuł: „Trust the Stack” (gradient OK)
- Sub: „Built 100% on 0G infrastructure”
- „Integrations” (opcjonalnie): 0G (og.png) + SiGoogle (jeśli komunikujemy Gemini)
  - Wymaga: `npm install react-icons --save`
  - Import: `import { SiGoogle } from 'react-icons/si'`

5) Privacy & Control — `app/src/components/landing/PrivacySection.tsx`
- „You own the agent. You own the memory. Export or omit anytime. We can’t see your data.”

6) Final CTA — `app/src/components/landing/FinalCTASection.tsx`
- Headline: „Meet your Aishi.”
- Primary: „Open aishiOS terminal”
- Secondary: „Mint your agent”

### Gradient Text — zasady
- Tylko na słowach kluczowych (Hero: „soul”, „Verifiably”)
- Nagłówki: „Trust the Stack”, „Privacy & Control”
- Unikać na długich opisach — liczy się czytelność

### Ikony — zasady
- Lucide dla ikon funkcjonalnych (lekko, spójnie)
- `react-icons/si` wyłącznie dla brandów w „Integrations” (np. SiGoogle)
- Minimalizm: małe rozmiary, bez agresywnych animacji

### Implementacja — Checklist (pliki)
- Hero — `app/src/components/landing/HeroSection.tsx`
  - [ ] Headline/Subheadline, rotatingTexts (5), badges, GradientText (słowa kluczowe)
  - [ ] Fallback Docs → `/introduction`
  - [ ] Next/Image + alt/aria

- How It Works — `app/src/components/landing/HowItWorksSection.tsx`
  - [ ] Podmiana steps (4 kroki)

- Value Props — `app/src/components/landing/ValuePropsSection.tsx`
  - [ ] 4 pozycje value
  - [ ] Usunąć/przenieść „Known inspirations from dreams”
  - [ ] (Opcja) Scalić „How … real” z How It Works

- Trust — `app/src/components/landing/TrustStackSection.tsx`
  - [ ] Dodać „Integrations” (0G + opcjonalnie SiGoogle)

- Privacy — `app/src/components/landing/PrivacySection.tsx`
  - [ ] Krótszy tekst (jw.)

- Final CTA — `app/src/components/landing/FinalCTASection.tsx`
  - [ ] „Meet your Aishi.” + 2 CTA

### Decyzje do potwierdzenia
- Czy scalamy i usuwamy `ProblemsAndSolutionsSection` z Home? (treść → Value Props)
- Czy przenosimy „Known inspirations from dreams” do docs / na sam dół Home?
- Czy dodać „Integrations” z `react-icons/si` (SiGoogle), czy trzymamy wyłącznie 0G?
