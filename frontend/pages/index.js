import React from 'react';
import { 
  ParticleBackground, 
  Header, 
  HeroSection, 
  FeaturesSection, 
  HowItWorksSection, 
  CTASection, 
  Footer 
} from '../components';

// Główna strona Dreamscape
export default function Home() {
  return (
    <div style={{ 
      fontFamily: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflow: 'hidden auto'
    }}>
      <ParticleBackground />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
} 