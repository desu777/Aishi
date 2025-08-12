'use client';

import { useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  NeuralNetworkCanvas,
  HeroSection,
  ValuePropsSection,
  HowItWorksSection,
  WhatEvolvesSection,
  TrustStackSection,
  PowerUsersSection,
  PrivacySection,
  FinalCTASection
} from '../components/landing';

export default function Home() {
  const [expandTech, setExpandTech] = useState(false);

  return (
    <Layout>
      {/* Neural Network Background */}
      <NeuralNetworkCanvas />

      {/* Hero Section */}
      <HeroSection />

      {/* Value Props Section */}
      <ValuePropsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* What Evolves Section */}
      <WhatEvolvesSection />

      {/* Trust the Stack Section */}
      <TrustStackSection />

      {/* Power Users Section */}
      <PowerUsersSection 
        expandTech={expandTech} 
        setExpandTech={setExpandTech} 
      />

      {/* Privacy Section */}
      <PrivacySection />

      {/* Final CTA Section */}
      <FinalCTASection />
    </Layout>
  );
}