# 🌙 Dreamscape Frontend

Nowoczesny frontend w Next.js + React (JavaScript) dla aplikacji Dreamscape - AI-powered dream analysis platform.

## 🚀 Funkcjonalności

- **Next.js 15.3.4** - Najnowsza wersja framework'a
- **React 19.1.0** - Najnowsza wersja biblioteki
- **Work Sans Font** - Nowoczesna typografia z Google Fonts
- **Lucide React Icons** - Piękne ikony SVG
- **Ciemny/Jasny Theme** - Przełącznik trybu z Context API
- **Animowane Tło** - Cząsteczki z animacjami CSS
- **Responsywny Design** - Pełne wsparcie mobile i desktop
- **Proxy API** - Automatyczne przekierowanie do backendu
- **SEO Optimized** - Meta tagi, Open Graph, Twitter Cards

## 🎨 Wzornictwo

Aplikacja odwzorowuje 1:1 wzorzec z `dreamscape-app.tsx`:
- **Kolorystyka**: Purple (#8B5CF6), Pink (#EC4899), Cyan (#06B6D4)
- **Typografia**: Work Sans (wszystkie wagi 100-900)
- **Animacje**: Fade-in, Float, Hover effects
- **Layout**: Header, Hero, Features, How It Works, CTA, Footer

## 🔧 Technologie

```json
{
  "next": "15.3.4",
  "react": "19.1.0", 
  "react-dom": "19.1.0",
  "lucide-react": "0.525.0"
}
```

## 🛠️ Instalacja i Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie development
npm run dev

# Aplikacja dostępna na http://localhost:3000
```

## 📁 Struktura Projektu

```
frontend/
├── components/           # Komponenty React
│   ├── ThemeProvider.js     # Context dla tematów
│   ├── ParticleBackground.js # Animowane tło
│   ├── Header.js           # Nawigacja
│   ├── HeroSection.js      # Sekcja główna
│   ├── FeaturesSection.js  # Funkcjonalności
│   ├── HowItWorksSection.js # Jak to działa
│   ├── CTASection.js       # Call to action
│   ├── Footer.js           # Stopka
│   └── index.js            # Barrel exports
├── pages/               # Strony Next.js
│   ├── _app.js             # Główny layout
│   └── index.js            # Strona główna
├── styles/              # Style CSS
│   └── globals.css         # Globalne style + Work Sans
├── public/              # Statyczne pliki
│   └── favicon.ico         # Ikona strony
└── next.config.js       # Konfiguracja Next.js
```

## 🔗 Integracja z Backendem

Frontend automatycznie przekierowuje zapytania API do backendu:
- `http://localhost:3000/api/*` → `http://localhost:3001/api/*`
- Konfiguracja w `next.config.js` przez `rewrites()`

## 🎯 Główne Komponenty

### ThemeProvider
- Zarządza trybem ciemnym/jasnym
- Context API z useTheme hook
- Dynamiczne kolory i style

### ParticleBackground
- 50 animowanych cząsteczek
- Gradient background z kolorami accent
- Animacje CSS3 (float, rotate)

### Header
- Nawigacja responsive
- Przełącznik trybu
- CTA button
- Mobile menu

### HeroSection
- Główny nagłówek z gradientem
- Przyciski akcji
- Statystyki (10K+ dreams, 95% accuracy)

## 🌟 Przewagi

- **Bez TypeScript** - Czysty JavaScript jak wymagane
- **Work Sans Font** - Profesjonalna typografia
- **1:1 Wzorzec** - Dokładne odwzorowanie design'u
- **Clean Architecture** - Separacja komponentów
- **Performance** - Optymalizacja Next.js
- **SEO Ready** - Meta tagi i strukturyzacja

## 🚀 Deployment

```bash
# Build production
npm run build

# Start production server
npm start
```

## 📞 Wsparcie

Aplikacja gotowa do integracji z backendem na porcie 3001.
Wszystkie komponenty odwzorowują funkcjonalność z oryginalnego wzorca. 